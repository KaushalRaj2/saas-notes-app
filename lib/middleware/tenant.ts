import { Db, ObjectId } from 'mongodb';

export async function getTenantInfo(db: Db, tenantId: string) {
  const tenant = await db.collection('tenants').findOne({
    _id: new ObjectId(tenantId)
  });
  return tenant;
}

export function ensureTenantIsolation(query: Record<string, unknown>, tenantId: string) {
  return {
    ...query,
    tenantId: new ObjectId(tenantId)
  };
}

export async function checkSubscriptionLimit(
  db: Db, 
  tenantId: string, 
  collectionName: string
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const tenant = await getTenantInfo(db, tenantId);
  if (!tenant) {
    return { allowed: false, limit: 0, current: 0 };
  }
  
  const currentCount = await db.collection(collectionName).countDocuments({
    tenantId: new ObjectId(tenantId)
  });
  
  // Pro plan has unlimited notes (-1 or Infinity)
  if (tenant.plan === 'pro' || tenant.noteLimit === -1) {
    return {
      allowed: true,
      limit: -1, // Unlimited for display
      current: currentCount
    };
  }
  
  // Free plan has limited notes
  const limit = tenant.noteLimit || 3;
  
  return {
    allowed: currentCount < limit,
    limit: limit,
    current: currentCount
  };
}
