# Supabase Setup Guide

This guide will help you set up Supabase for Based Bingo with X (Twitter) OAuth authentication.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: based-bingo
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
5. Click "Create new project" (takes ~2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
3. Update your `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Set Up Database Schema

1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  x_username TEXT NOT NULL,
  x_user_id TEXT,
  tweet_url TEXT NOT NULL UNIQUE,
  letter CHAR(1) NOT NULL CHECK (letter IN ('B', 'A', 'S', 'E')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX submissions_user_id_idx ON submissions(user_id);
CREATE INDEX submissions_x_username_idx ON submissions(x_username);

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all submissions (for leaderboard)
CREATE POLICY "Anyone can view submissions"
  ON submissions FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own submissions
CREATE POLICY "Users can insert own submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Create admins table
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  fid INTEGER,
  x_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can check if they're an admin
CREATE POLICY "Anyone can view admins"
  ON admins FOR SELECT
  USING (true);

-- Insert initial admin (update with your user_id after first login)
-- You'll need to update this with your actual user_id from auth.users table
-- For now, we'll add this manually after first login
```

4. Click "Run" to execute the SQL

## Step 4: Configure X (Twitter) OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use existing one
3. In your app settings:
   - **App permissions**: Read
   - **Type of App**: Web App
   - **Callback URLs**: Add:
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```
   - **Website URL**: `https://based-bingo-lyart.vercel.app`
4. Save your **Client ID** and **Client Secret**

5. In Supabase, go to **Authentication** → **Providers**
6. Enable **Twitter**:
   - **Client ID**: Paste from Twitter
   - **Client Secret**: Paste from Twitter
   - **Redirect URL**: Should be pre-filled
7. Click "Save"

## Step 5: Add Yourself as Admin

After you've logged in for the first time with your X account:

1. Go to Supabase **Table Editor**
2. Open the `auth.users` table
3. Find your user and copy your `id`
4. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO admins (user_id, x_username)
   VALUES ('your-user-id-here', '@your_x_handle');
   ```

## Step 6: Update Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your based-bingo project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Redeploy your app

## Testing Locally

1. Make sure `.env` file has correct values
2. Run `npm run dev`
3. Click "Sign in with X"
4. After login, you should see your X username
5. Try submitting a tweet

## Troubleshooting

### "Invalid login credentials"
- Check that X OAuth is enabled in Supabase
- Verify callback URL matches exactly

### "Failed to fetch user data"
- Check that API credentials in `.env` are correct
- Make sure `.env` file is not in `.gitignore` for local dev

### Can't see admin panel
- Make sure you added yourself to the `admins` table
- Check browser console for errors

## Security Notes

- Never commit `.env` to git (it's in `.gitignore`)
- The anon key is safe to expose in frontend
- Row Level Security (RLS) protects your data
- Users can only insert their own submissions

## Database Functions

Useful SQL queries for admin tasks:

**View all submissions:**
```sql
SELECT
  x_username,
  COUNT(*) as submissions_count,
  STRING_AGG(letter, '' ORDER BY created_at) as letters_completed
FROM submissions
GROUP BY x_username
ORDER BY submissions_count DESC;
```

**Check if game is complete:**
```sql
SELECT x_username, COUNT(DISTINCT letter) as unique_letters
FROM submissions
GROUP BY x_username
HAVING COUNT(DISTINCT letter) = 4;
```

**Reset all data (USE WITH CAUTION):**
```sql
DELETE FROM submissions;
```
