import bcrypt from 'bcryptjs';
import { getDatabase } from './mongodb';
import { User, Tenant } from '@/types';

export async function seedDatabase() {
  const db = await getDatabase();
  
  // Clear existing data
  await db.collection('tenants').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('notes').deleteMany({});
  
  // Create tenants
  const tenants = [
    {
      name: 'Acme Corporation',
      slug: 'acme',
      plan: 'free' as const,
      noteLimit: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Globex Corporation',
      slug: 'globex', 
      plan: 'free' as const,
      noteLimit: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Insert tenants and get IDs
  const tenantResults = await db.collection('tenants').insertMany(tenants);
  const acmeTenantId = tenantResults.insertedIds; // Keep as ObjectId
  const globexTenantId = tenantResults.insertedIds[1]; // Keep as ObjectId

  // Create test users
  const hashedPassword = await bcrypt.hash('password', 12);
  
  const users = [
    {
      email: 'admin@acme.test',
      password: hashedPassword,
      role: 'admin' as const,
      tenantId: acmeTenantId, // Use ObjectId directly
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'user@acme.test',
      password: hashedPassword,
      role: 'member' as const,
      tenantId: acmeTenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'admin@globex.test',
      password: hashedPassword,
      role: 'admin' as const,
      tenantId: globexTenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'user@globex.test',
      password: hashedPassword,
      role: 'member' as const,
      tenantId: globexTenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('users').insertMany(users);
  
  console.log('✅ Database seeded successfully!');
  console.log('Test accounts created:');
  console.log('- admin@acme.test / password');
  console.log('- user@acme.test / password');
  console.log('- admin@globex.test / password');
  console.log('- user@globex.test / password');
}
