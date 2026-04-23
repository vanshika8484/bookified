// database/test-connection.ts (or scripts/test-connection.ts)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // 👈 load env FIRST

import { connectToDatabase } from './database/mongoose'; // adjust the relative path as needed

async function testConnection() {
  try {
    console.log('MONGODB_URI present?', !!process.env.MONGODB_URI); // 👈 quick debug
    await connectToDatabase();
    console.log('✅ Atlas connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Atlas connection failed:', error);
    process.exit(1);
  }
}

testConnection();