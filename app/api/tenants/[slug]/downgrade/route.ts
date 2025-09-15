import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/middleware/auth';

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
      { error: 'Access denied. Only admins can manage subscriptions.' },
      { status: 403 }
    );
  }

  try {
    
    const tenant = await db.collection('tenants').findOne({ slug });
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    
    if (tenant._id.toString() !== user.tenantId) {
      return NextResponse.json(
        { error: 'Access denied. You can only manage your own tenant.' },
        { status: 403 }
      );
    }

    
    if (tenant.plan === 'free') {
      return NextResponse.json(
        { error: 'Tenant is already on Free plan' },
        { status: 400 }
      );
    }

    
    const updatedTenant = await db.collection('tenants').findOneAndUpdate(
      { _id: tenant._id },
      {
        $set: {
          plan: 'free',
          noteLimit: 3, 
          downgradedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!updatedTenant) {
      return NextResponse.json(
        { error: 'Failed to downgrade tenant' },
        { status: 500 }
      );
    }

    console.log(`📉 Tenant ${tenant.name} downgraded to Free plan by ${user.email}`);

    return NextResponse.json({
      message: 'Successfully downgraded to Free plan',
      tenant: {
        id: updatedTenant._id.toString(),
        name: updatedTenant.name,
        slug: updatedTenant.slug,
        plan: updatedTenant.plan,
        noteLimit: updatedTenant.noteLimit
      }
    });

  } catch (error: unknown) {
    console.error('Downgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
