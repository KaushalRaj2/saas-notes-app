import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { signJWT } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get tenant info
    const tenant = await db.collection('tenants').findOne({ _id: user.tenantId });
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Generate JWT
    const token = signJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId.toString(),
      tenantSlug: tenant.slug
    });

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        tenant: {
          id: tenant._id.toString(),
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
