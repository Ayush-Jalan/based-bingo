import { sdk } from '@farcaster/miniapp-sdk';
import { supabase } from './supabase-client.js';

console.log('🚀 main.js loaded!');
console.log('🚀 Supabase client:', supabase);

// Current user state
let currentUser = null;

// Track if a submission is in progress
let submissionInProgress = false;

// Game state (for UI only - database is source of truth)
const gameState = {
  completedLetters: [], // User's completed letters
  submissions: [], // User's submissions
  allSubmissions: [], // All submissions for admin panel
  adminFids: [348330]
};

// The word BASE - letters are struck in order
const BASE_LETTERS = ['B', 'A', 'S', 'E'];

// DOM elements
let tweetUrlInput, submitBtn, progressCount;
let completeModal, closeModalBtn, adminBtn;
let authSection, userInfo, gameContent;
let loginBtn, logoutBtn, userName;

// Initialize the app
async function init() {
  try {
    // Get DOM elements
    tweetUrlInput = document.getElementById('tweetUrl');
    submitBtn = document.getElementById('submitBtn');
    progressCount = document.getElementById('progressCount');
    completeModal = document.getElementById('completeModal');
    closeModalBtn = document.getElementById('closeModal');
    adminBtn = document.getElementById('adminBtn');
    authSection = document.getElementById('authSection');
    userInfo = document.getElementById('userInfo');
    gameContent = document.getElementById('gameContent');
    loginBtn = document.getElementById('loginBtn');
    logoutBtn = document.getElementById('logoutBtn');
    userName = document.getElementById('userName');

    // Set up event listeners
    if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => {
      completeModal.classList.remove('show');
    });
    if (adminBtn) adminBtn.addEventListener('click', () => {
      window.viewSubmissions();
    });
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Check auth state
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      await handleAuthStateChange(session);
    } else {
      showAuthScreen();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await handleAuthStateChange(session);
      } else if (event === 'SIGNED_OUT') {
        showAuthScreen();
      }
    });

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden && currentUser && !submissionInProgress) {
        console.log('🔄 Page became visible - refreshing data...');
        await loadUserGameData();
        updateUI();
        // Re-enable submit button if it got stuck
        if (submitBtn && !submissionInProgress) submitBtn.disabled = false;
      }
    });

    // Listen for page focus
    window.addEventListener('focus', async () => {
      if (currentUser && !submissionInProgress) {
        console.log('🔄 Window focused - refreshing data...');
        await loadUserGameData();
        updateUI();
        // Re-enable submit button if it got stuck
        if (submitBtn && !submissionInProgress) submitBtn.disabled = false;
      }
    });

    // Tell Farcaster the app is ready (if running in Farcaster)
    try {
      if (sdk && sdk.actions && sdk.actions.ready) {
        await sdk.actions.ready();
      }
    } catch (error) {
      console.log('Not running in Farcaster context');
    }

    console.log('Based Bingo initialized successfully!');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

// Handle login
async function handleLogin() {
  try {
    console.log('🔵 Starting login process...');
    console.log('🔵 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🔵 Current window location:', window.location.origin);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error('🔴 OAuth error:', error);
      throw error;
    }

    console.log('🟢 Login data:', data);
    console.log('🟢 Should redirect to:', data?.url);
  } catch (error) {
    console.error('🔴 Login error:', error);
    console.error('🔴 Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText
    });
    alert(`Login failed: ${error.message || 'Please try again.'}`);
  }
}

// Handle logout
async function handleLogout() {
  try {
    await supabase.auth.signOut();
    currentUser = null;
    gameState.completedLetters = [];
    gameState.submissions = [];
    showAuthScreen();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Handle auth state change
async function handleAuthStateChange(session) {
  currentUser = session.user;

  // Get X username from user metadata
  const xUsername = currentUser.user_metadata?.user_name
    || currentUser.user_metadata?.name
    || 'Unknown';

  // Update UI
  if (userName) userName.textContent = `@${xUsername}`;

  // Show game content
  showGameScreen();

  // Load user's game data from database
  await loadUserGameData();

  // Check if user is admin
  await checkAdminAccess();

  // Update UI
  updateUI();
}

// Show auth screen
function showAuthScreen() {
  if (authSection) authSection.style.display = 'flex';
  if (userInfo) userInfo.style.display = 'none';
  if (gameContent) gameContent.style.display = 'none';
}

// Show game screen
function showGameScreen() {
  console.log('🟢 Showing game screen...');
  console.log('🟢 authSection:', authSection);
  console.log('🟢 userInfo:', userInfo);
  console.log('🟢 gameContent:', gameContent);

  if (authSection) authSection.style.display = 'none';
  if (userInfo) userInfo.style.display = 'flex';
  if (gameContent) gameContent.style.display = 'block';

  console.log('🟢 Game screen should now be visible');
}

// Load user's game data from database
async function loadUserGameData() {
  if (!currentUser) return;

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    gameState.submissions = data || [];
    gameState.completedLetters = data.map(s => s.letter);

  } catch (error) {
    console.error('Error loading game data:', error);
  }
}

// Handle tweet submission
async function handleSubmit() {
  console.log('🔵 Submit button clicked!');
  console.log('🔵 Current user:', currentUser);
  console.log('🔵 Tweet input element:', tweetUrlInput);

  if (!currentUser) {
    alert('Please log in first');
    return;
  }

  // Mark submission as in progress
  submissionInProgress = true;

  // Disable button during submission
  if (submitBtn) submitBtn.disabled = true;

  const tweetUrl = tweetUrlInput.value.trim();
  console.log('🔵 Tweet URL:', tweetUrl);

  // Validate tweet URL
  if (!tweetUrl) {
    submissionInProgress = false;
    if (submitBtn) submitBtn.disabled = false;
    alert('Please enter a tweet URL');
    return;
  }

  if (!isValidTwitterUrl(tweetUrl)) {
    submissionInProgress = false;
    if (submitBtn) submitBtn.disabled = false;
    alert('Please enter a valid X (Twitter) URL');
    return;
  }

  // Check if game is already complete
  console.log('🔵 Completed letters:', gameState.completedLetters);
  console.log('🔵 Completed count:', gameState.completedLetters.length);

  if (gameState.completedLetters.length >= 4) {
    submissionInProgress = false;
    if (submitBtn) submitBtn.disabled = false;
    alert('You\'ve already completed the game! 🎉');
    return;
  }

  // Get the next letter to strike
  const nextLetter = BASE_LETTERS[gameState.completedLetters.length];
  console.log('🔵 Next letter to strike:', nextLetter);

  // Extract X username from tweet URL
  let xUsername = 'Unknown';
  try {
    const urlMatch = tweetUrl.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status/);
    if (urlMatch && urlMatch[1]) {
      xUsername = '@' + urlMatch[1];
    }
  } catch (error) {
    console.log('Could not extract username from URL:', error);
  }

  console.log('🔵 About to insert into database...');

  try {
    // Insert submission into database
    console.log('🔵 Inserting data:', {
      user_id: currentUser.id,
      x_username: currentUser.user_metadata?.user_name || xUsername.replace('@', ''),
      x_user_id: currentUser.user_metadata?.provider_id,
      tweet_url: tweetUrl,
      letter: nextLetter
    });

    console.log('🔵 Starting Supabase insert...');

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database insert timed out after 5 seconds')), 5000);
    });

    // Insert without .select() to avoid RLS SELECT permission hang
    // We'll manually construct the data object from what we inserted
    const insertPromise = supabase
      .from('submissions')
      .insert({
        user_id: currentUser.id,
        x_username: currentUser.user_metadata?.user_name || xUsername.replace('@', ''),
        x_user_id: currentUser.user_metadata?.provider_id,
        tweet_url: tweetUrl,
        letter: nextLetter
      });

    console.log('🔵 Waiting for database response (5s timeout)...');
    const { error } = await Promise.race([insertPromise, timeoutPromise]);
    console.log('🔵 Database call completed!');

    // Manually create the data object since we're not using .select()
    const data = error ? null : {
      user_id: currentUser.id,
      x_username: currentUser.user_metadata?.user_name || xUsername.replace('@', ''),
      x_user_id: currentUser.user_metadata?.provider_id,
      tweet_url: tweetUrl,
      letter: nextLetter,
      created_at: new Date().toISOString()
    };

    console.log('🔵 Database response - data:', data);
    console.log('🔵 Database response - error:', error);

    if (error) {
      console.error('🔴 Database error:', error);
      submissionInProgress = false;
      if (submitBtn) submitBtn.disabled = false;
      if (error.code === '23505') { // Unique constraint violation
        alert('This tweet has already been submitted!');
      } else {
        alert(`Error: ${error.message}`);
      }
      return;
    }

    console.log('🟢 Submission successful:', data);

    // Update local state
    gameState.submissions.push(data);
    gameState.completedLetters.push(nextLetter);

    console.log('🟢 Updated game state:', {
      submissions: gameState.submissions.length,
      completedLetters: gameState.completedLetters
    });

    // Update UI
    updateUI();

    // Clear input
    tweetUrlInput.value = '';

    // Show success message
    const remaining = 4 - gameState.completedLetters.length;
    if (remaining > 0) {
      alert(`Great! Letter "${nextLetter}" has been struck! ${remaining} more to go!`);
    }

    // Check if game is complete
    checkGameComplete();

    // Re-enable button and clear flag
    submissionInProgress = false;
    if (submitBtn) submitBtn.disabled = false;
  } catch (error) {
    console.error('🔴 Caught error submitting tweet:', error);
    console.error('🔴 Error name:', error.name);
    console.error('🔴 Error message:', error.message);
    console.error('🔴 Error stack:', error.stack);

    submissionInProgress = false;
    if (submitBtn) submitBtn.disabled = false;

    // If timeout error, offer to refresh the page
    if (error.message && error.message.includes('timed out')) {
      const shouldRefresh = confirm('The submission timed out. This usually happens due to connection issues. Would you like to refresh the page and try again?');
      if (shouldRefresh) {
        window.location.reload();
      }
    } else {
      alert('Failed to submit tweet. Please try again.');
    }
  }
}

// Validate Twitter/X URL
function isValidTwitterUrl(url) {
  const twitterPatterns = [
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/,
  ];
  return twitterPatterns.some(pattern => pattern.test(url));
}

// Update UI based on game state
function updateUI() {
  // Update progress count
  const uniqueLetters = [...new Set(gameState.completedLetters)];
  if (progressCount) progressCount.textContent = uniqueLetters.length;

  // Strike out completed letters
  const letters = ['B', 'A', 'S', 'E'];
  letters.forEach(letter => {
    const letterEl = document.querySelector(`.letter[data-letter="${letter}"]`);
    if (letterEl) {
      if (gameState.completedLetters.includes(letter)) {
        letterEl.classList.add('striked');
      } else {
        letterEl.classList.remove('striked');
      }
    }
  });
}

// Check if game is complete
function checkGameComplete() {
  const uniqueLetters = [...new Set(gameState.completedLetters)];
  if (uniqueLetters.length === 4) {
    setTimeout(() => {
      completeModal.classList.add('show');
      celebrateWin();
    }, 500);
  }
}

// Celebrate win
function celebrateWin() {
  console.log('🎉 GAME COMPLETE! 🎉');
}

// Check if current user is an admin
async function checkAdminAccess() {
  if (!currentUser || !adminBtn) return;

  try {
    // Check if user is in admins table
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.log('Admin check error (this is normal):', error.message);
    } else if (data) {
      adminBtn.style.display = 'block';
      console.log('Admin button shown');
    }
  } catch (error) {
    // Not an admin or error - don't show button
    console.log('Not an admin or error checking admin status');
  }

  // Also show for localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    adminBtn.style.display = 'block';
  }
}

// Admin function to view all submissions
window.viewSubmissions = async function() {
  try {
    // Show admin panel
    showAdminPanel();

    // Load all submissions
    await loadAllSubmissions();
    populateSubmissions();
    await populateAdminList();
  } catch (error) {
    console.error('Error accessing admin panel:', error);
  }
};

// Load all submissions from database
async function loadAllSubmissions() {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    gameState.allSubmissions = data || [];
  } catch (error) {
    console.error('Error loading submissions:', error);
  }
}

// Show admin panel
function showAdminPanel() {
  const panel = document.getElementById('adminPanel');
  if (panel) {
    panel.classList.add('show');
  }
}

// Populate submissions table
function populateSubmissions() {
  const tbody = document.getElementById('submissionsTableBody');
  const totalEl = document.getElementById('totalSubmissions');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (gameState.allSubmissions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No submissions yet</td></tr>';
    return;
  }

  // Group submissions by X username
  const userSubmissions = {};
  gameState.allSubmissions.forEach((submission) => {
    const username = '@' + (submission.x_username || 'Unknown');
    if (!userSubmissions[username]) {
      userSubmissions[username] = [];
    }
    userSubmissions[username].push(submission);
  });

  // Update total count
  if (totalEl) {
    totalEl.textContent = Object.keys(userSubmissions).length;
  }

  // Add row for each user
  Object.entries(userSubmissions).forEach(([username, submissions]) => {
    const row = document.createElement('tr');

    const lettersCompleted = submissions.map(s => s.letter).join('');
    const progress = `${submissions.length}/4 (${lettersCompleted})`;

    const tweetLinks = submissions.map((s, idx) =>
      `<a href="${s.tweet_url}" target="_blank" rel="noopener noreferrer">Tweet ${idx + 1}</a>`
    ).join(' | ');

    const status = submissions.length >= 4
      ? '<span class="status-complete">✓ Complete</span>'
      : '<span class="status-incomplete">In Progress</span>';

    row.innerHTML = `
      <td>${username}</td>
      <td>${progress}</td>
      <td class="tweet-links">${tweetLinks}</td>
      <td>${status}</td>
    `;
    tbody.appendChild(row);
  });
}

// Close admin panel
window.closeAdminPanel = function() {
  const panel = document.getElementById('adminPanel');
  if (panel) {
    panel.classList.remove('show');
  }
};

// Populate admin list
async function populateAdminList() {
  const adminList = document.getElementById('adminList');
  if (!adminList) return;

  adminList.innerHTML = '';

  try {
    const { data: admins } = await supabase
      .from('admins')
      .select('*');

    if (admins.length === 0) {
      adminList.innerHTML = '<p style="color: #999; text-align: center;">No admins yet</p>';
      return;
    }

    admins.forEach((admin) => {
      const adminItem = document.createElement('div');
      adminItem.className = 'admin-item';
      adminItem.innerHTML = `
        <span class="admin-fid">X: @${admin.x_username || 'Unknown'}</span>
        <span class="primary-admin-badge">Admin</span>
      `;
      adminList.appendChild(adminItem);
    });
  } catch (error) {
    console.error('Error loading admins:', error);
  }
}

// Note: Admin management functions removed - manage via Supabase dashboard

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
