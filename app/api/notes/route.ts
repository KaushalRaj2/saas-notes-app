import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/middleware/auth';
import { ensureTenantIsolation, checkSubscriptionLimit, getTenantInfo } from '@/lib/middleware/tenant';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET /api/notes - List all notes for user's tenant
export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { user, db } = auth;
    
    // Get notes with tenant isolation
    const notes = await db.collection('notes')
      .find(ensureTenantIsolation({}, user.tenantId))
      .sort({ createdAt: -1 })
      .toArray();

    // Include user info for each note
    const notesWithUsers = await Promise.all(
      notes.map(async (note) => {
        const noteUser = await db.collection('users').findOne(
          { _id: note.userId },
          { projection: { email: 1 } }
        );
        
        return {
          id: note._id.toString(),
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          user: {
            id: note.userId.toString(),
            email: noteUser?.email || 'Unknown'
          }
        };
      })
    );

    return NextResponse.json({
      notes: notesWithUsers,
      total: notesWithUsers.length
    });

  } catch (error) {
    console.error('Notes fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { user, db } = auth;
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Get tenant info for better error messaging
    const tenant = await getTenantInfo(db, user.tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Check subscription limits
    const limitCheck = await checkSubscriptionLimit(db, user.tenantId, 'notes');
    if (!limitCheck.allowed) {
      const planName = tenant.plan === 'pro' ? 'Pro' : 'Free';
      const upgradeMessage = tenant.plan === 'free' 
        ? ' Please upgrade to Pro for unlimited notes.' 
        : '';
      
      return NextResponse.json(
        { 
          error: 'Note limit reached',
          details: `You have reached the limit of ${limitCheck.limit} notes for your ${planName} plan.${upgradeMessage}`,
          limit: limitCheck.limit,
          current: limitCheck.current,
          plan: tenant.plan
        },
        { status: 403 }
      );
    }

    // Create note with tenant isolation
    const newNote = {
      title,
      content,
      userId: new ObjectId(user.userId),
      tenantId: new ObjectId(user.tenantId),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('notes').insertOne(newNote);

    return NextResponse.json({
      note: {
        id: result.insertedId.toString(),
        title: newNote.title,
        content: newNote.content,
        createdAt: newNote.createdAt,
        updatedAt: newNote.updatedAt,
        user: {
          id: user.userId,
          email: user.email
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Note creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
