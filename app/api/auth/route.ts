import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { signJWT } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔑 Auth POST request received');
  
  try {
    const body = await request.json();
    console.log('📧 Login attempt for:', body.email);
    
    const { email, password } = body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return new NextResponse(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const db = await getDatabase();
    console.log('💾 Database connected');
    
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const tenant = await db.collection('tenants').findOne({ 
      _id: new ObjectId(user.tenantId) 
    });
    
    if (!tenant) {
      console.log('❌ Tenant not found for user:', email);
      console.log('🔍 User tenantId:', user.tenantId);
      
      // Let's also check what tenants exist
      const allTenants = await db.collection('tenants').find({}).toArray();
      console.log('📊 Available tenants:', allTenants.map(t => ({ id: t._id, name: t.name })));
      
      return new NextResponse(
        JSON.stringify({ error: 'Tenant configuration error' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const token = signJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId.toString(),
      tenantSlug: tenant.slug
    });

    console.log('✅ Login successful for:', email);
    
    const responseData = {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        tenant: {
          id: tenant._id.toString(),
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          noteLimit: tenant.noteLimit
        }
      }
    };
    
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error: unknown) {
    console.error('🚨 Auth error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
