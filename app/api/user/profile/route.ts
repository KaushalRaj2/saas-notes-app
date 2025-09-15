import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/middleware/auth';
import { ObjectId } from 'mongodb';

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
    
    
    const userData = await db.collection('users').findOne(
      { _id: new ObjectId(user.userId) },
      { projection: { password: 0 } }
    );

    
    const tenantData = await db.collection('tenants').findOne({
      _id: new ObjectId(user.tenantId)
    });

    return NextResponse.json({
      user: {
        id: userData?._id.toString(),
        email: userData?.email,
        role: userData?.role,
        createdAt: userData?.createdAt,
        tenant: {
          id: tenantData?._id.toString(),
          name: tenantData?.name,
          slug: tenantData?.slug,
          plan: tenantData?.plan,
          noteLimit: tenantData?.noteLimit
        }
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
