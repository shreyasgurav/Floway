/**
 * Instagram Graph API utilities
 * Docs: https://developers.facebook.com/docs/instagram-api
 */

import { InstagramMedia } from '@/types';

const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

/**
 * Exchange short-lived token for long-lived token
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', process.env.META_APP_ID!);
  url.searchParams.set('client_secret', process.env.META_APP_SECRET!);
  url.searchParams.set('fb_exchange_token', shortLivedToken);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5184000, // Default 60 days
  };
}

/**
 * Get Facebook Pages the user manages
 */
export async function getUserPages(accessToken: string): Promise<Array<{ id: string; name: string; accessToken: string }>> {
  const url = new URL(`${GRAPH_API_BASE}/me/accounts`);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('fields', 'id,name,access_token');

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.data || [];
}

/**
 * Get Instagram Business Account connected to a Facebook Page
 */
export async function getInstagramAccount(
  pageId: string,
  pageAccessToken: string
): Promise<{ id: string; username: string; accountType: string } | null> {
  const url = new URL(`${GRAPH_API_BASE}/${pageId}`);
  url.searchParams.set('access_token', pageAccessToken);
  url.searchParams.set('fields', 'instagram_business_account{id,username,account_type}');

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.instagram_business_account) {
    return null;
  }

  return {
    id: data.instagram_business_account.id,
    username: data.instagram_business_account.username,
    accountType: data.instagram_business_account.account_type,
  };
}

/**
 * Fetch user's recent Instagram media (posts and reels)
 */
export async function getUserMedia(
  instagramUserId: string,
  accessToken: string,
  limit: number = 12
): Promise<InstagramMedia[]> {
  const url = new URL(`${GRAPH_API_BASE}/${instagramUserId}/media`);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('fields', 'id,media_type,media_url,thumbnail_url,caption,timestamp,permalink');
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return (data.data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    mediaType: item.media_type as InstagramMedia['mediaType'],
    mediaUrl: item.media_url as string | undefined,
    thumbnailUrl: item.thumbnail_url as string | undefined,
    caption: item.caption as string | undefined,
    timestamp: item.timestamp as string,
    permalink: item.permalink as string | undefined,
  }));
}

/**
 * Send a DM to a user via Instagram Graph API
 * Requires instagram_manage_messages permission
 */
export async function sendInstagramDM(
  instagramUserId: string, // The IG account sending the message
  recipientId: string, // Instagram-scoped user ID of the commenter
  message: string,
  accessToken: string
): Promise<{ messageId: string }> {
  const url = `${GRAPH_API_BASE}/${instagramUserId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: {
        id: recipientId,
      },
      message: {
        text: message,
      },
      access_token: accessToken,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return {
    messageId: data.message_id,
  };
}

/**
 * Subscribe to Instagram webhooks for a page
 */
export async function subscribeToWebhooks(
  pageId: string,
  pageAccessToken: string
): Promise<boolean> {
  const url = `${GRAPH_API_BASE}/${pageId}/subscribed_apps`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscribed_fields: ['feed', 'mention', 'comments'],
      access_token: pageAccessToken,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.success === true;
}

