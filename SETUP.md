# API Keys Setup Guide

## Required Environment Variables

Create a file named `.env.local` in the root directory with these 3 values:

```env
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_VERIFY_TOKEN=any_random_string_you_create
```

## Where to Get These Values

### 1. META_APP_ID & META_APP_SECRET

**Step 1:** Go to [developers.facebook.com](https://developers.facebook.com) and log in

**Step 2:** Click "My Apps" → "Create App"

**Step 3:** Select app type: **"Business"**

**Step 4:** Fill in app details:
- App name: `InstaFlow` (or any name)
- Contact email: your email
- Click "Create App"

**Step 5:** Add products:
- Click "Add Product" → Find **"Facebook Login"** → Click "Set Up"
- Click "Add Product" → Find **"Instagram Graph API"** → Click "Set Up"

**Step 6:** Get your credentials:
- Go to **Settings** → **Basic**
- Copy **App ID** → This is your `META_APP_ID`
- Click **Show** next to App Secret → Copy it → This is your `META_APP_SECRET`

**Step 7:** Configure OAuth redirect:
- Go to **Facebook Login** → **Settings**
- Add to "Valid OAuth Redirect URIs":
  - `http://localhost:3000/api/auth/callback` (for development)
  - `https://yourdomain.com/api/auth/callback` (for production)

**Step 8:** Request permissions:
- Go to **App Review** → **Permissions and Features**
- **CRITICAL:** Instagram permissions are NEVER requested in Facebook Login
- Request ONLY these Facebook Pages permissions:
  - `pages_show_list` - List user's Facebook Pages (required)
  - `pages_read_engagement` - Read Page engagement (required)
- Instagram permissions (`instagram_basic`, `instagram_manage_comments`, etc.) are granted automatically when accessing Instagram through a connected Page

### 2. NEXT_PUBLIC_APP_URL

- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com` (after deploying)

### 3. WEBHOOK_VERIFY_TOKEN

Create any random string (e.g., `my_secret_webhook_token_12345`). You'll use this same value when setting up webhooks in Meta Developer Console.

## Quick Start

1. Create `.env.local` file in project root
2. Add the 4 variables above
3. Run `npm run dev`
4. Open `http://localhost:3000`

## For Production (Vercel)

1. Deploy to Vercel
2. In Vercel dashboard → Settings → Environment Variables
3. Add all 4 variables
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
5. Update OAuth redirect URI in Meta Developer Console to your production URL

## Webhook Setup (After Deployment)

1. In Meta Developer Console → Webhooks
2. Subscribe to "Instagram" product
3. Select "comments" field
4. Callback URL: `https://yourdomain.com/api/webhook/instagram`
5. Verify Token: (same as `WEBHOOK_VERIFY_TOKEN` from `.env.local`)

