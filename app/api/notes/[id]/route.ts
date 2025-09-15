import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/middleware/auth';
import { ensureTenantIsolation } from '@/lib/middleware/tenant';
import { ObjectId } from 'mongodb';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if (!auth) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { user, db } = auth;
    const { id } = await params; 

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    
    const note = await db.collection('notes').findOne(
      ensureTenantIsolation({ _id: new ObjectId(id) }, user.tenantId)
    );

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    
    const noteUser = await db.collection('users').findOne(
      { _id: note.userId },
      { projection: { email: 1 } }
    );

    return NextResponse.json({
      note: {
        id: note._id.toString(),
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        user: {
          id: note.userId.toString(),
          email: noteUser?.email || 'Unknown'
        }
      }
    });

  } catch (error) {
    console.error('Note fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params; 

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    
    const result = await db.collection('notes').findOneAndUpdate(
      ensureTenantIsolation(
        { 
          _id: new ObjectId(id),
          userId: new ObjectId(user.userId) 
        }, 
        user.tenantId
      ),
      {
        $set: {
          title,
          content,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      note: {
        id: result._id.toString(),
        title: result.title,
        content: result.content,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        user: {
          id: user.userId,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Note update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if (!auth) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { user, db } = auth;
    const { id } = await params; 

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    const result = await db.collection('notes').findOneAndDelete(
      ensureTenantIsolation(
        { 
          _id: new ObjectId(id),
          userId: new ObjectId(user.userId)
        }, 
        user.tenantId
      )
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Note deleted successfully',
      deletedNote: {
        id: result._id.toString(),
        title: result.title
      }
    });

  } catch (error) {
    console.error('Note deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
