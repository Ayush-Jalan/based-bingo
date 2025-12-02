# Fixing "requested path is invalid" Error

This error occurs when Twitter's OAuth configuration doesn't match Supabase's expectations.

## ⚠️ CRITICAL: Check These Settings

### 1. Twitter Developer Portal Settings

Go to: https://developer.twitter.com/en/portal/dashboard

**Step 1: Select Your App**
- Click on your app name

**Step 2: Go to "Settings" Tab**
- Scroll down to **"User authentication settings"**
- Click **"Edit"**

**Step 3: Verify OAuth 2.0 Settings**

You MUST have these EXACT settings:

```
✅ App permissions: Read
✅ Type of App: Web App, Automated App or Bot
✅ Callback URI / Redirect URL: https://madifhqhwzfotmpzlqel.supabase.co/auth/v1/callback
✅ Website URL: https://based-bingo-lyart.vercel.app
```

**IMPORTANT:**
- The callback URL MUST be EXACTLY: `https://madifhqhwzfotmpzlqel.supabase.co/auth/v1/callback`
- No trailing slash
- Must use `https://`
- Must end with `/callback`

**Step 4: Save Changes**

### 2. Get Twitter API Keys (Consumer Keys)

After saving User authentication settings:

1. Go to **"Keys and tokens"** tab
2. Look for **"Consumer Keys"** section (also called "API Key and Secret")
3. Copy:
   - **API Key** (also called Consumer Key)
   - **API Key Secret** (also called Consumer Secret)

**IMPORTANT:** You need the API Key/Secret (OAuth 1.0a credentials), NOT OAuth 2.0 Client ID/Secret!

### 3. Configure Supabase

Go to: https://app.supabase.com/project/madifhqhwzfotmpzlqel/auth/providers

**Step 1: Enable Twitter Provider**
- Find "Twitter" in the list
- Toggle it ON

**Step 2: Add Credentials**
- **Twitter Client ID**: Paste **API Key** (Consumer Key) from Twitter
- **Twitter Client Secret**: Paste **API Key Secret** (Consumer Secret) from Twitter
- **Redirect URL** (should be pre-filled): `https://madifhqhwzfotmpzlqel.supabase.co/auth/v1/callback`

**Step 3: Save**

### 4. Configure Site URL in Supabase

Go to: https://app.supabase.com/project/madifhqhwzfotmpzlqel/auth/url-configuration

**Site URL:**
```
https://based-bingo-lyart.vercel.app
```

**Redirect URLs (add both):**
```
https://based-bingo-lyart.vercel.app
https://based-bingo-lyart.vercel.app/**
http://localhost:3000
```

**Save changes**

### 5. Update Vercel Environment Variables

Go to: https://vercel.com → Your Project → Settings → Environment Variables

Make sure these are set:
```
VITE_SUPABASE_URL=https://madifhqhwzfotmpzlqel.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZGlmaHFod3pmb3RtcHpscWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDE2NzcsImV4cCI6MjA4MDI3NzY3N30.XlyzruPhN01p5Mdl1Gbpm4rGPqY-LVaIgJYyqwkG6_c
```

**Redeploy** after adding variables.

## 🧪 Testing Steps

### Test Locally First:

1. Make sure local server is running:
   ```bash
   npm run dev
   ```

2. Open: http://localhost:3000

3. Open browser console (F12)

4. Click "Sign in with X"

5. Check console for errors

### Test on Production:

1. Wait for Vercel deployment to complete
2. Go to: https://based-bingo-lyart.vercel.app
3. Click "Sign in with X"
4. Should redirect to Twitter authorization page

## 🔍 Common Issues & Solutions

### Issue 1: "requested path is invalid"

**Cause:** Callback URL mismatch

**Solution:**
- Double-check callback URL in Twitter is EXACTLY:
  `https://madifhqhwzfotmpzlqel.supabase.co/auth/v1/callback`
- No typos, no extra spaces, no trailing slash

### Issue 2: "Invalid redirect_uri"

**Cause:** Site URL not configured in Supabase

**Solution:**
- Go to Supabase → Authentication → URL Configuration
- Set Site URL to: `https://based-bingo-lyart.vercel.app`

### Issue 3: "Unauthorized client"

**Cause:** Using wrong credentials (API Key instead of OAuth 2.0)

**Solution:**
- Make sure you're using **OAuth 2.0 Client ID/Secret**
- NOT the Consumer API Keys

### Issue 4: Still not working

**Nuclear option - Regenerate everything:**

1. **In Twitter:**
   - Go to Keys and tokens
   - Click "Regenerate" under OAuth 2.0
   - Copy new Client ID and Secret

2. **In Supabase:**
   - Delete Twitter provider
   - Re-enable it
   - Paste NEW credentials
   - Save

3. **Redeploy Vercel**

## ✅ Verification Checklist

Before testing again, verify ALL of these:

- [ ] Twitter app has OAuth 2.0 configured (not just API keys)
- [ ] Callback URL is: `https://madifhqhwzfotmpzlqel.supabase.co/auth/v1/callback`
- [ ] Website URL in Twitter is: `https://based-bingo-lyart.vercel.app`
- [ ] Supabase Twitter provider is enabled
- [ ] Supabase has correct OAuth 2.0 Client ID/Secret
- [ ] Supabase Site URL is: `https://based-bingo-lyart.vercel.app`
- [ ] Vercel has environment variables set
- [ ] Vercel deployment is complete (check deployment status)
- [ ] Code is updated (latest git push deployed)

## 📸 Screenshots of Correct Configuration

### Twitter User Authentication Settings:
```
App permissions: ✅ Read
Type of App: ✅ Web App, Automated App or Bot
Callback URI: ✅ https://madifhqhwzfotmpzlqel.supabase.co/auth/v1/callback
Website URL: ✅ https://based-bingo-lyart.vercel.app
```

### Supabase Twitter Provider:
```
Enabled: ✅ ON
Twitter Client ID: [Your OAuth 2.0 Client ID]
Twitter Client Secret: [Your OAuth 2.0 Client Secret]
Redirect URL: ✅ https://madifhqhwzfotmpzlqel.supabase.co/auth/v1/callback
```

## 🆘 Still Stuck?

If none of the above works:

1. **Check browser console for detailed error**
   - Open DevTools (F12)
   - Go to Console tab
   - Click "Sign in with X"
   - Copy the full error message

2. **Check Supabase logs**
   - Go to: https://app.supabase.com/project/madifhqhwzfotmpzlqel/logs/explorer
   - Look for authentication errors

3. **Verify Twitter app is NOT in restricted mode**
   - Some developer accounts have restrictions
   - Check app status in Twitter Developer Portal

4. **Try incognito mode**
   - Clear browser cache
   - Try in incognito/private window
   - Sometimes cached OAuth state causes issues
