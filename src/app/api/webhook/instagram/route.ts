/**
 * Instagram Webhook Handler
 * Receives comment notifications and triggers DM automation
 * 
 * Setup in Meta Developer Console:
 * 1. Go to Webhooks section
 * 2. Subscribe to "Instagram" product
 * 3. Select "comments" field
 * 4. Set callback URL to: https://yourdomain.com/api/webhook/instagram
 * 5. Set verify token to match WEBHOOK_VERIFY_TOKEN env var
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendInstagramDM } from '@/lib/instagram';
import { containsKeyword, generateId, delay } from '@/lib/utils';
import { InstagramWebhookPayload } from '@/types';

// GET - Webhook verification (Meta requires this)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify the token matches our secret
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// POST - Receive webhook events
export async function POST(request: NextRequest) {
  try {
    const payload: InstagramWebhookPayload = await request.json();

    console.log('Received webhook:', JSON.stringify(payload, null, 2));

    // Validate it's from Instagram
    if (payload.object !== 'instagram') {
      return NextResponse.json({ received: true });
    }

    // Process each entry
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        // We only care about comment events
        if (change.field !== 'comments') continue;

        const { from, media, text } = change.value;
        const commenterId = from.id;
        const commenterUsername = from.username;
        const mediaId = media.id;
        const commentText = text;

        console.log(`Comment received: "${commentText}" from @${commenterUsername} on media ${mediaId}`);

        // Find active automation for this media
        const automation = await db.getActiveAutomationByMediaId(mediaId);

        if (!automation) {
          console.log('No active automation for this media');
          continue;
        }

        // Check if comment contains the keyword
        if (!containsKeyword(commentText, automation.keyword)) {
          console.log(`Comment doesn't contain keyword "${automation.keyword}"`);
          continue;
        }

        // Check if user already received a DM (if reply-once is enabled)
        if (automation.replyOncePerUser) {
          const alreadySent = await db.hasUserReceivedDM(automation.id, commenterId);
          if (alreadySent) {
            console.log(`User ${commenterId} already received DM for this automation`);
            
            // Log as skipped
            await db.createLog({
              id: generateId(),
              automationId: automation.id,
              commenterInstagramId: commenterId,
              commenterUsername,
              commentText,
              status: 'skipped',
              createdAt: Date.now(),
            });
            
            continue;
          }
        }

        // Get user to get access token
        const user = await db.getUserById(automation.userId);
        if (!user) {
          console.error('User not found for automation');
          continue;
        }

        // Add small delay to avoid rate limiting
        await delay(1500);

        // Send DM
        try {
          await sendInstagramDM(
            user.instagramUserId,
            commenterId,
            automation.dmMessage,
            user.accessToken
          );

          console.log(`DM sent to ${commenterId}`);

          // Log success
          await db.createLog({
            id: generateId(),
            automationId: automation.id,
            commenterInstagramId: commenterId,
            commenterUsername,
            commentText,
            status: 'sent',
            createdAt: Date.now(),
          });

          // Increment counter
          await db.incrementDmsSent(automation.id);

        } catch (error) {
          console.error('Failed to send DM:', error);

          // Log failure
          await db.createLog({
            id: generateId(),
            automationId: automation.id,
            commenterInstagramId: commenterId,
            commenterUsername,
            commentText,
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            createdAt: Date.now(),
          });
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ received: true });
  }
}

