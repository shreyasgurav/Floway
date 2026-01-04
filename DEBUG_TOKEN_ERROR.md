# Fix: "Invalid OAuth access token - Cannot parse access token"

This error means Meta can't parse the access token. Here's how to fix it:

## Common Causes

### 1. **Redirect URI Mismatch** (Most Common)

The redirect URI in your code MUST match EXACTLY what's configured in Meta Developer Console.

**Check in Meta Developer Console:**
1. Go to your app → **Facebook Login** → **Settings**
2. Look at **"Valid OAuth Redirect URIs"**
3. It must be EXACTLY: `http://localhost:3000/api/auth/callback` (no trailing slash, exact match)

**Check in your `.env.local`:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Fix:**
- If using `localhost:3000`, make sure it's exactly that (not `127.0.0.1:3000`)
- No trailing slashes
- Must match character-for-character

### 2. **App Credentials Wrong**

**Check your `.env.local` file:**
```env
META_APP_ID=your_actual_app_id_here
META_APP_SECRET=your_actual_app_secret_here
```

**How to get them:**
1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Select your app
3. **Settings** → **Basic**
4. Copy **App ID** → This is `META_APP_ID`
5. Click **Show** next to App Secret → Copy it → This is `META_APP_SECRET`

**Important:** 
- Don't use placeholder values
- Make sure there are no extra spaces
- Restart your dev server after changing `.env.local`

### 3. **Code Already Used or Expired**

OAuth codes can only be used once and expire quickly.

**Fix:**
- Try logging in again (get a fresh code)
- Don't refresh the callback page multiple times

### 4. **App Not in Development Mode for Your Account**

**Check:**
1. Meta Developer Console → **App Roles** → **Roles**
2. Make sure your Facebook account is added as **Admin** or **Developer**
3. Make sure you're logged into Facebook with the same account

## Step-by-Step Debug

1. **Check `.env.local` exists and has correct values:**
   ```bash
   cat .env.local
   ```

2. **Verify redirect URI matches:**
   - In code: `${NEXT_PUBLIC_APP_URL}/api/auth/callback`
   - In Meta Console: Must match exactly

3. **Check server logs:**
   - Look at terminal where `npm run dev` is running
   - You'll see detailed error messages now

4. **Test with Graph API Explorer:**
   - Go to [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
   - Select your app
   - Generate a token
   - This verifies your app credentials work

## Quick Test

1. Make sure `.env.local` has real values (not placeholders)
2. Restart dev server: `npm run dev`
3. Try login again
4. Check terminal for detailed error messages

## Still Not Working?

Check the terminal output - the updated code now shows:
- What redirect URI is being used
- Whether the code was received
- Detailed error messages from Meta

