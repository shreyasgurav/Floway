/**
 * Initiates Meta OAuth flow for Instagram login
 * Redirects user to Facebook Login dialog
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  
  // CRITICAL: Instagram permissions are NEVER requested in Facebook Login
  // They are granted implicitly through Page → Instagram Business Account relationship
  // 
  // Phase 1 (Login): Only request Facebook Pages permissions
  // Phase 2 (After login): Access Instagram through connected Page
  const scopes = [
    'pages_show_list',        // List user's Facebook Pages (required)
    'pages_read_engagement',  // Read Page engagement (required for Instagram access)
  ].join(',');

  // Build Facebook OAuth URL
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('response_type', 'code');

  return NextResponse.redirect(authUrl.toString());
}

