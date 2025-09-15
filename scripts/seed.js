// scripts/seed.js
const path = require('path');

// Load environment variables from .env.local (not just .env)
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('Using MongoDB URI:', process.env.MONGODB_URI); // Debug log
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('saas-notes-db');
    
    // Clear existing data
    await db.collection('tenants').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('notes').deleteMany({});
    
    // Create tenants
    const tenants = [
      {
        name: 'Acme Corporation',
        slug: 'acme',
        plan: 'free',
        noteLimit: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Globex Corporation',
        slug: 'globex', 
        plan: 'free',
        noteLimit: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert tenants and get IDs
    const tenantResults = await db.collection('tenants').insertMany(tenants);
    const acmeTenantId = tenantResults.insertedIds;
    const globexTenantId = tenantResults.insertedIds[20];

    // Create test users
    const hashedPassword = await bcrypt.hash('password', 12);
    
    const users = [
      {
        email: 'admin@acme.test',
        password: hashedPassword,
        role: 'admin',
        tenantId: acmeTenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user@acme.test',
        password: hashedPassword,
        role: 'member',
        tenantId: acmeTenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'admin@globex.test',
        password: hashedPassword,
        role: 'admin',
        tenantId: globexTenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user@globex.test',
        password: hashedPassword,
        role: 'member',
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
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await client.close();
  }
}

seedDatabase()
  .then(() => {
    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
