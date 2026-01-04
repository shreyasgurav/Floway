/**
 * Test endpoint to verify Meta app credentials
 * Visit: http://localhost:3000/api/test-credentials
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    hasAppId: !!process.env.META_APP_ID,
    hasAppSecret: !!process.env.META_APP_SECRET,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    webhookToken: !!process.env.WEBHOOK_VERIFY_TOKEN,
  };

  // Test if we can make a basic API call
  let apiTest = { success: false, error: null };
  if (checks.hasAppId && checks.hasAppSecret) {
    try {
      const testUrl = `https://graph.facebook.com/v18.0/${process.env.META_APP_ID}?access_token=${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
      const response = await fetch(testUrl);
      const data = await response.json();
      apiTest = {
        success: !data.error,
        error: data.error?.message || null,
      };
    } catch (e) {
      apiTest.error = e instanceof Error ? e.message : 'Unknown error';
    }
  }

  return NextResponse.json({
    message: 'Meta App Credentials Check',
    checks,
    apiTest,
    instructions: {
      redirectUri: `Make sure this EXACT URL is in Meta Developer Console → Facebook Login → Settings → Valid OAuth Redirect URIs: ${checks.redirectUri}`,
      appCredentials: 'Verify META_APP_ID and META_APP_SECRET match your app in developers.facebook.com',
    },
  }, { status: 200 });
}

