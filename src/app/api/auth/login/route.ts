/**
 * Initiates Meta OAuth flow for Instagram login
 * Redirects user to Facebook Login dialog
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  
  // ======================================================================
  // CORRECT OAUTH SCOPES (DO NOT CHANGE)
  // ======================================================================
  // Step 1: Facebook Login (identity) - ONLY these scopes
  // Step 2: Pages permissions (pages_show_list) - gets Facebook Pages
  // Step 3: Facebook Page → Instagram Business Account (automatic)
  // Step 4: Instagram API permissions (configured in Meta Developer Console)
  // ======================================================================
  // ❌ Do NOT include any instagram_* scopes here
  // ❌ Do NOT include business_manage_messages here
  // ======================================================================
  const scopes = 'public_profile,pages_show_list,pages_read_engagement';

  // Build Facebook OAuth URL
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('response_type', 'code');

  return NextResponse.redirect(authUrl.toString());
}

