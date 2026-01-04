/**
 * Initiates Meta OAuth flow for Instagram login
 * Redirects user to Facebook Login dialog
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  
  // Required permissions for Instagram automation
  const scopes = [
    'instagram_basic',
    'instagram_manage_comments', 
    'instagram_manage_messages',
    'pages_show_list',
    'pages_read_engagement',
  ].join(',');

  // Build Facebook OAuth URL
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('response_type', 'code');

  return NextResponse.redirect(authUrl.toString());
}

