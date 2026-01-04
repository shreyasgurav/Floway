# InstaFlow

Instagram comment automation for Business & Creator accounts. When someone comments a keyword on your post, they automatically receive your DM.

## Features

- Login with Instagram (via Meta OAuth)
- Select any post or reel from your account
- Set a trigger keyword (case-insensitive)
- Configure your DM reply message
- Automatic DM sending when keyword is detected
- Reply once per user option
- Simple status dashboard

## Requirements

- Instagram Business or Creator account (not personal/private)
- Facebook Page connected to your Instagram account
- Meta Developer App with required permissions

## Setup

### 1. Create Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app → Select "Business" type
3. Add products: Facebook Login, Instagram Graph API
4. Configure OAuth redirect URL: `https://yourdomain.com/api/auth/callback`

### 2. Configure Permissions

**CRITICAL:** Instagram permissions are NEVER requested in Facebook Login.

Request ONLY these Facebook Pages permissions:
- `pages_show_list` - List user's Facebook Pages (required)
- `pages_read_engagement` - Read Page engagement (required)

Instagram permissions (`instagram_basic`, `instagram_manage_comments`, `instagram_manage_messages`) are granted automatically when accessing Instagram through a connected Page. The Page → Instagram Business Account relationship provides Instagram API access.

### 3. Set Up Webhooks

1. In Meta Developer Console, go to Webhooks
2. Subscribe to "Instagram" product
3. Select "comments" field
4. Set callback URL: `https://yourdomain.com/api/webhook/instagram`
5. Set verify token (same as `WEBHOOK_VERIFY_TOKEN` env var)

### 4. Environment Variables

Create `.env.local` with:

```env
# Meta App Credentials
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Webhook Verification Token (create any random string)
WEBHOOK_VERIFY_TOKEN=your_random_token
```

### 5. Run the App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Deployment

For production (e.g., Vercel):

1. Set all environment variables in your hosting platform
2. Update `NEXT_PUBLIC_APP_URL` to your production domain
3. Update OAuth redirect URL in Meta Developer Console
4. Webhooks require HTTPS - set up the webhook URL after deployment

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/login` | GET | Initiates Meta OAuth flow |
| `/api/auth/callback` | GET | OAuth callback handler |
| `/api/auth/logout` | GET/POST | Clears session |
| `/api/media` | GET | Fetches user's Instagram posts |
| `/api/automations` | GET/POST | List/create automations |
| `/api/automations/[id]` | PATCH/DELETE | Update/delete automation |
| `/api/webhook/instagram` | GET/POST | Instagram webhook endpoint |

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Instagram Graph API
- Meta OAuth

## Notes

- Personal/private Instagram accounts are not supported by the Instagram Graph API
- Webhooks require a publicly accessible HTTPS URL
- For development, use ngrok or similar to tunnel webhooks
- The in-memory database resets on server restart (use Firestore for production)

## Webhook Testing (Development)

1. Install ngrok: `brew install ngrok` or download from ngrok.com
2. Start your dev server: `npm run dev`
3. Start ngrok: `ngrok http 3000`
4. Use the ngrok HTTPS URL for webhook configuration in Meta Developer Console
