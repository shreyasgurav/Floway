/**
 * Automation CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { Automation } from '@/types';

// GET - List user's automations
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const automations = await db.getAutomationsByUserId(session.userId);
    return NextResponse.json({ automations });

  } catch (error) {
    console.error('Error fetching automations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
      { status: 500 }
    );
  }
}

// POST - Create new automation
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { mediaId, mediaThumbnail, mediaCaption, keyword, dmMessage, replyOncePerUser = true } = body;

    // Validation
    if (!mediaId || !keyword || !dmMessage) {
      return NextResponse.json(
        { error: 'Missing required fields: mediaId, keyword, dmMessage' },
        { status: 400 }
      );
    }

    if (keyword.length > 50) {
      return NextResponse.json(
        { error: 'Keyword must be 50 characters or less' },
        { status: 400 }
      );
    }

    if (dmMessage.length > 1000) {
      return NextResponse.json(
        { error: 'DM message must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Check if automation already exists for this media
    const existing = await db.getActiveAutomationByMediaId(mediaId);
    if (existing && existing.userId === session.userId) {
      return NextResponse.json(
        { error: 'An automation already exists for this post. Please edit or delete it first.' },
        { status: 409 }
      );
    }

    // Create automation
    const automation: Automation = {
      id: generateId(),
      userId: session.userId,
      mediaId,
      mediaThumbnail,
      mediaCaption,
      keyword: keyword.trim(),
      dmMessage: dmMessage.trim(),
      replyOncePerUser,
      isActive: true,
      dmsSent: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.createAutomation(automation);

    return NextResponse.json({ automation }, { status: 201 });

  } catch (error) {
    console.error('Error creating automation:', error);
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    );
  }
}

