/**
 * OAuth callback handler
 * Exchanges code for access token, fetches Instagram account, creates user
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  exchangeForLongLivedToken, 
  getUserPages, 
  getInstagramAccount,
  subscribeToWebhooks 
} from '@/lib/instagram';
import { db } from '@/lib/db';
import { setSession } from '@/lib/session';
import { generateId } from '@/lib/utils';
import { User } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=No authorization code received`
    );
  }

  try {
    // Step 1: Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', process.env.META_APP_ID!);
    tokenUrl.searchParams.set('client_secret', process.env.META_APP_SECRET!);
    tokenUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    // Step 2: Exchange for long-lived token (60 days)
    const { accessToken: longLivedToken, expiresIn } = await exchangeForLongLivedToken(
      tokenData.access_token
    );

    // Step 3: Get user's Facebook Pages
    const pages = await getUserPages(longLivedToken);

    if (pages.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=${encodeURIComponent(
          'No Facebook Pages found. Please connect a Page to your Instagram Business account.'
        )}`
      );
    }

    // Step 4: Find Instagram Business/Creator account
    let instagramAccount = null;
    let connectedPage = null;

    for (const page of pages) {
      const igAccount = await getInstagramAccount(page.id, page.accessToken);
      if (igAccount) {
        // Verify it's a Business or Creator account
        if (igAccount.accountType === 'BUSINESS' || igAccount.accountType === 'MEDIA_CREATOR') {
          instagramAccount = igAccount;
          connectedPage = page;
          break;
        }
      }
    }

    if (!instagramAccount || !connectedPage) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=${encodeURIComponent(
          'Instagram automation works only with Business or Creator accounts. Please convert your account type.'
        )}`
      );
    }

    // Step 5: Subscribe to webhooks for comment notifications
    try {
      await subscribeToWebhooks(connectedPage.id, connectedPage.accessToken);
    } catch (e) {
      console.error('Failed to subscribe to webhooks:', e);
      // Continue anyway - webhooks can be set up later
    }

    // Step 6: Check if user exists, create or update
    let user = await db.getUserByInstagramId(instagramAccount.id);

    if (user) {
      // Update existing user
      user = await db.updateUser(user.id, {
        accessToken: connectedPage.accessToken, // Use page token for API calls
        tokenExpiry: Date.now() + (expiresIn * 1000),
      });
    } else {
      // Create new user
      user = await db.createUser({
        id: generateId(),
        instagramUserId: instagramAccount.id,
        instagramUsername: instagramAccount.username,
        accessToken: connectedPage.accessToken,
        tokenExpiry: Date.now() + (expiresIn * 1000),
        pageId: connectedPage.id,
        accountType: instagramAccount.accountType === 'BUSINESS' ? 'BUSINESS' : 'CREATOR',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Step 7: Create session
    await setSession({
      userId: user!.id,
      instagramUserId: user!.instagramUserId,
      instagramUsername: user!.instagramUsername,
      accessToken: user!.accessToken,
    });

    // Redirect to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);

  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=${encodeURIComponent(
        error instanceof Error ? error.message : 'Authentication failed'
      )}`
    );
  }
}

