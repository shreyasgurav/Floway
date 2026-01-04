/**
 * Fetch user's Instagram media (posts/reels)
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserMedia } from '@/lib/instagram';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await db.getUserById(session.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch recent media from Instagram
    const media = await getUserMedia(
      user.instagramUserId,
      user.accessToken,
      12 // Limit to 12 recent posts
    );

    return NextResponse.json({ media });

  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

