import { NextRequest } from 'next/server';
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import { JWTPayload } from '@/types';

export async function authenticateUser(request: NextRequest): Promise<{
  user: JWTPayload;
  db: any;
} | null> {
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
  
  // Verify user still exists
  const user = await db.collection('users').findOne({ 
    email: payload.email,
    tenantId: payload.tenantId 
  });
  
  if (!user) {
    return null;
  }
  
  return { user: payload, db };
}
