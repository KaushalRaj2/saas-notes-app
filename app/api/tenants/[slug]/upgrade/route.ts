import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/middleware/auth';
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

  // Only admins can upgrade subscription
  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Access denied. Only admins can upgrade subscriptions.' },
      { status: 403 }
    );
  }

  try {
    // Find tenant by slug
    const tenant = await db.collection('tenants').findOne({ slug });
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Verify admin belongs to this tenant
    if (tenant._id.toString() !== user.tenantId) {
      return NextResponse.json(
        { error: 'Access denied. You can only upgrade your own tenant.' },
        { status: 403 }
      );
    }

    // Check if already pro
    if (tenant.plan === 'pro') {
      return NextResponse.json(
        { error: 'Tenant is already on Pro plan' },
        { status: 400 }
      );
    }

    // Upgrade to Pro plan
    const updatedTenant = await db.collection('tenants').findOneAndUpdate(
      { _id: tenant._id },
      {
        $set: {
          plan: 'pro',
          noteLimit: -1, // Unlimited notes
          upgradedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    // Handle null case (should not happen since we found the tenant)
    if (!updatedTenant) {
      return NextResponse.json(
        { error: 'Failed to update tenant' },
        { status: 500 }
      );
    }

    console.log(`✅ Tenant ${tenant.name} upgraded to Pro plan by ${user.email}`);

    return NextResponse.json({
      message: 'Successfully upgraded to Pro plan',
      tenant: {
        id: updatedTenant._id.toString(),
        name: updatedTenant.name,
        slug: updatedTenant.slug,
        plan: updatedTenant.plan,
        noteLimit: updatedTenant.noteLimit
      }
    });

  } catch (error: unknown) {
    console.error('Upgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
