import { NextRequest } from 'next/server';
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import { JWTPayload } from '@/types';
import { Db, ObjectId } from 'mongodb';

export async function authenticateUser(request: NextRequest): Promise<{
  user: JWTPayload;
  db: Db;
} | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return null;
    }
    
    const payload = verifyJWT(token);
    if (!payload) {
      return null;
    }
    
    const db = await getDatabase();
    
    // Verify user still exists and belongs to tenant
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(payload.userId),
      email: payload.email,
      tenantId: new ObjectId(payload.tenantId)
    });
    
    if (!user) {
      return null;
    }
    
    return { user: payload, db };
    
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  return auth;
}

export async function requireRole(request: NextRequest, allowedRoles: ('admin' | 'member')[]) {
  const auth = await authenticateUser(request);
  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  if (!allowedRoles.includes(auth.user.role)) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return auth;
}
