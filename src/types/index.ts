// User model - stored after successful Instagram login
export interface User {
  id: string;
  instagramUserId: string;
  instagramUsername: string;
  accessToken: string;
  tokenExpiry: number; // Unix timestamp
  pageId: string; // Facebook Page connected to Instagram
  accountType: 'BUSINESS' | 'CREATOR';
  createdAt: number;
  updatedAt: number;
}

// Instagram media item from Graph API
export interface InstagramMedia {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS';
  mediaUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  timestamp: string;
  permalink?: string;
}

// Automation configuration
export interface Automation {
  id: string;
  userId: string;
  mediaId: string;
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaCaption?: string;
  keyword: string; // Case-insensitive match
  dmMessage: string;
  replyOncePerUser: boolean;
  isActive: boolean;
  dmsSent: number;
  createdAt: number;
  updatedAt: number;
}

// Log of sent DMs
export interface AutomationLog {
  id: string;
  automationId: string;
  commenterInstagramId: string;
  commenterUsername?: string;
  commentText: string;
  status: 'sent' | 'failed' | 'skipped';
  errorMessage?: string;
  createdAt: number;
}

// Session data stored in cookie
export interface SessionData {
  userId: string;
  instagramUserId: string;
  instagramUsername: string;
  accessToken: string;
}

// Webhook payload from Instagram
export interface InstagramWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      field: string;
      value: {
        from: {
          id: string;
          username?: string;
        };
        media: {
          id: string;
        };
        id: string;
        text: string;
      };
    }>;
  }>;
}

