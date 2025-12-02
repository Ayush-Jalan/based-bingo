import { sdk } from '@farcaster/miniapp-sdk';

// Game state
const gameState = {
  completedLetters: [], // Stores letters in order: B, A, S, E
  submissions: [], // Stores detailed submission data for admin review
  adminFids: [348330] // Initial admin FIDs - stored in localStorage and can be updated from app
};

// The word BASE - letters are struck in order
const BASE_LETTERS = ['B', 'A', 'S', 'E'];

// Get admin FIDs from game state (loaded from localStorage)
function getAdminFids() {
  return gameState.adminFids || [348330];
}

// DOM elements
let tweetUrlInput;
let submitBtn;
let progressCount;
let completeModal;
let closeModalBtn;
let adminBtn;

// Initialize the app
async function init() {
  try {
    // Load saved game state from localStorage
    loadGameState();

    // Get DOM elements
    tweetUrlInput = document.getElementById('tweetUrl');
    submitBtn = document.getElementById('submitBtn');
    progressCount = document.getElementById('progressCount');
    completeModal = document.getElementById('completeModal');
    closeModalBtn = document.getElementById('closeModal');
    adminBtn = document.getElementById('adminBtn');

    // Set up event listeners
    submitBtn.addEventListener('click', handleSubmit);
    closeModalBtn.addEventListener('click', () => {
      completeModal.classList.remove('show');
    });
    adminBtn.addEventListener('click', () => {
      window.viewSubmissions();
    });

    // Check if user is admin and show admin button
    checkAdminAccess();

    // Update UI with saved state
    updateUI();

    // Tell Farcaster the app is ready to display (if running in Farcaster)
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

// Handle tweet submission
async function handleSubmit() {
  const tweetUrl = tweetUrlInput.value.trim();

  // Validate tweet URL
  if (!tweetUrl) {
    alert('Please enter a tweet URL');
    return;
  }

  if (!isValidTwitterUrl(tweetUrl)) {
    alert('Please enter a valid X (Twitter) URL');
    return;
  }

  // Check if game is already complete
  if (gameState.completedLetters.length >= 4) {
    alert('Game is already complete! Check the admin panel for review.');
    return;
  }

  // Check if tweet was already used
  const tweetAlreadyUsed = gameState.submissions.some(s => s.tweetUrl === tweetUrl);
  if (tweetAlreadyUsed) {
    alert('This tweet has already been submitted!');
    return;
  }

  // Get the next letter to strike (based on current progress)
  const nextLetter = BASE_LETTERS[gameState.completedLetters.length];

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

  // Create submission record
  const submission = {
    tweetUrl: tweetUrl,
    letter: nextLetter,
    timestamp: new Date().toISOString(),
    submissionNumber: gameState.submissions.length + 1,
    xUsername: xUsername
  };

  // Add to submissions and mark letter as completed
  gameState.submissions.push(submission);
  gameState.completedLetters.push(nextLetter);

  // Save state
  saveGameState();

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
  progressCount.textContent = uniqueLetters.length;

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
    // Game complete!
    setTimeout(() => {
      completeModal.classList.add('show');
      celebrateWin();
    }, 500);
  }
}

// Celebrate win with confetti or animation
function celebrateWin() {
  console.log('🎉 GAME COMPLETE! 🎉');
  // You could add confetti library or other celebration effects here
}

// Save game state to localStorage
function saveGameState() {
  localStorage.setItem('basedBingoState', JSON.stringify(gameState));
}

// Load game state from localStorage
function loadGameState() {
  const saved = localStorage.getItem('basedBingoState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      gameState.completedLetters = parsed.completedLetters || [];
      gameState.submissions = parsed.submissions || [];
      gameState.adminFids = parsed.adminFids || [348330];
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }
}

// Check if current user is an admin and show admin button
async function checkAdminAccess() {
  // For soft launch, show admin button on localhost and also check for admin query param
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || isAdmin) {
    if (adminBtn) {
      adminBtn.style.display = 'block';
    }
    console.log('Admin button shown');
    return;
  }

  // In production with Farcaster, check FID
  try {
    const context = await sdk.context;
    const userFid = context?.user?.fid;

    // Show admin button if user's FID is in the admin list
    if (userFid && getAdminFids().includes(userFid)) {
      if (adminBtn) {
        adminBtn.style.display = 'block';
      }
      console.log('Admin button shown for FID:', userFid);
    }
  } catch (error) {
    console.log('Not running in Farcaster context');
  }
}

// Admin function to view all submissions (restricted to admin FIDs)
window.viewSubmissions = async function() {
  try {
    // Get current user's FID from Farcaster SDK
    const context = await sdk.context;
    const userFid = context?.user?.fid;

    // Check if user is admin
    if (getAdminFids().length > 0 && userFid && !getAdminFids().includes(userFid)) {
      alert('Access denied. Admin only.');
      return;
    }

    // Show admin panel
    showAdminPanel();
  } catch (error) {
    console.error('Error accessing admin panel:', error);
    // If SDK fails, show panel anyway (for testing)
    showAdminPanel();
  }
};

// Show admin panel with all submissions
function showAdminPanel() {
  const panel = document.getElementById('adminPanel');
  if (panel) {
    panel.classList.add('show');
    populateSubmissions();
    populateAdminList();
  }
}

// Populate submissions table in admin panel
function populateSubmissions() {
  const tbody = document.getElementById('submissionsTableBody');
  const totalEl = document.getElementById('totalSubmissions');

  if (!tbody) return;

  // Clear existing rows
  tbody.innerHTML = '';

  if (gameState.submissions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No submissions yet</td></tr>';
    return;
  }

  // Group submissions by X username
  const userSubmissions = {};
  gameState.submissions.forEach((submission) => {
    const username = submission.xUsername || submission.walletAddress || 'Unknown';
    if (!userSubmissions[username]) {
      userSubmissions[username] = [];
    }
    userSubmissions[username].push(submission);
  });

  // Update total count (number of unique players)
  if (totalEl) {
    totalEl.textContent = Object.keys(userSubmissions).length;
  }

  // Add row for each user
  Object.entries(userSubmissions).forEach(([username, submissions]) => {
    const row = document.createElement('tr');

    // Progress (how many letters completed)
    const lettersCompleted = submissions.map(s => s.letter).join('');
    const progress = `${submissions.length}/4 (${lettersCompleted})`;

    // All tweets as clickable links
    const tweetLinks = submissions.map((s, idx) =>
      `<a href="${s.tweetUrl}" target="_blank" rel="noopener noreferrer">Tweet ${idx + 1}</a>`
    ).join(' | ');

    // Status
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

// Populate admin list in admin panel
function populateAdminList() {
  const adminList = document.getElementById('adminList');
  if (!adminList) return;

  adminList.innerHTML = '';

  const adminFids = getAdminFids();
  adminFids.forEach((fid) => {
    const adminItem = document.createElement('div');
    adminItem.className = 'admin-item';
    adminItem.innerHTML = `
      <span class="admin-fid">FID: ${fid}</span>
      ${adminFids.length > 1 ? `<button onclick="removeAdmin(${fid})" class="remove-admin-btn">Remove</button>` : '<span class="primary-admin-badge">Primary Admin</span>'}
    `;
    adminList.appendChild(adminItem);
  });
}

// Add new admin
window.addNewAdmin = async function() {
  const input = document.getElementById('newAdminFid');
  if (!input) return;

  const newFid = parseInt(input.value.trim());

  if (!newFid || isNaN(newFid)) {
    alert('Please enter a valid FID number');
    return;
  }

  const adminFids = getAdminFids();

  if (adminFids.includes(newFid)) {
    alert('This FID is already an admin');
    return;
  }

  // Add to admin list
  gameState.adminFids.push(newFid);
  saveGameState();

  // Update UI
  populateAdminList();
  input.value = '';

  alert(`Admin FID ${newFid} added successfully!`);
};

// Remove admin
window.removeAdmin = function(fid) {
  const adminFids = getAdminFids();

  if (adminFids.length <= 1) {
    alert('Cannot remove the last admin');
    return;
  }

  if (confirm(`Are you sure you want to remove admin FID ${fid}?`)) {
    gameState.adminFids = adminFids.filter(id => id !== fid);
    saveGameState();
    populateAdminList();
    alert(`Admin FID ${fid} removed successfully!`);
  }
};

// Reset game data (admin only)
window.resetGameData = function() {
  if (confirm('⚠️ WARNING: This will delete ALL game data including submissions and progress. This cannot be undone. Are you sure?')) {
    if (confirm('Are you ABSOLUTELY sure? This will permanently delete all player submissions!')) {
      // Keep admin FIDs, reset everything else
      const currentAdmins = gameState.adminFids;
      gameState.completedLetters = [];
      gameState.submissions = [];
      gameState.adminFids = currentAdmins;

      saveGameState();
      updateUI();
      populateSubmissions();

      alert('Game data has been reset successfully!');
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
