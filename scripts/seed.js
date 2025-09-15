
const path = require('path');


require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('Using MongoDB URI:', process.env.MONGODB_URI); 
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('saas-notes-db');
    
    console.log('🗑️ Clearing existing data...');
    
    await db.collection('tenants').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('notes').deleteMany({});
    
    console.log('🏢 Creating tenants...');
    
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

    
    const tenantResults = await db.collection('tenants').insertMany(tenants);
    const tenantIds = Object.values(tenantResults.insertedIds);
    
    console.log('✅ Tenants created with IDs:', tenantIds.map(id => id.toString()));
    
    const acmeTenantId = tenantIds[0];
    const globexTenantId = tenantIds[1];

    console.log('👥 Creating users...');
    
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

    const userResults = await db.collection('users').insertMany(users);
    console.log('✅ Users created with IDs:', Object.values(userResults.insertedIds).map(id => id.toString()));
    
    
    console.log('🔍 Verifying user-tenant linking...');
    for (const user of users) {
      const createdUser = await db.collection('users').findOne({ email: user.email });
      const linkedTenant = await db.collection('tenants').findOne({ _id: user.tenantId });
      console.log(`✅ ${user.email} -> ${linkedTenant?.name} (${createdUser?.tenantId})`);
    }
    
    console.log('✅ Database seeded successfully!');
    console.log('Test accounts created:');
    console.log('- admin@acme.test / password (Acme Corporation)');
    console.log('- user@acme.test / password (Acme Corporation)');
    console.log('- admin@globex.test / password (Globex Corporation)');
    console.log('- user@globex.test / password (Globex Corporation)');
    
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
