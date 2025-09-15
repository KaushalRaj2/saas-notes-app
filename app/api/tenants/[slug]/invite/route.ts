import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/middleware/auth';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await authenticateUser(request);
  if (!auth) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const { user, db } = auth;
  const { slug } = await params;

  
  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Access denied. Only admins can invite users.' },
      { status: 403 }
    );
  }

  try {
    const { email, role = 'member', password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either "admin" or "member"' },
        { status: 400 }
      );
    }

    
    const tenant = await db.collection('tenants').findOne({ slug });
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    
    if (tenant._id.toString() !== user.tenantId) {
      return NextResponse.json(
        { error: 'Access denied. You can only invite users to your own tenant.' },
        { status: 403 }
      );
    }

    
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      email,
      password: hashedPassword,
      role: role as 'admin' | 'member', 
      tenantId: tenant._id,
      invitedBy: new ObjectId(user.userId),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);

    console.log(`✅ User ${email} invited to ${tenant.name} by ${user.email}`);

    return NextResponse.json({
      message: 'User invited successfully',
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        role: newUser.role,
        tenant: {
          id: tenant._id.toString(),
          name: tenant.name,
          slug: tenant.slug
        }
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Invitation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
