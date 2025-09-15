const { MongoClient } = require('mongodb');

// Direct connection without dotenv
const uri = "mongodb://kaushal:kaushal1234@kaushal-projects-shard-00-00.cq5zkcc.mongodb.net:27017/saas-notes-db?ssl=true&authSource=admin";

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test database operation
    const db = client.db('saas-notes-db');
    const result = await db.admin().ping();
    console.log('✅ Database ping successful:', result);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.close();
  }
}

testConnection();
