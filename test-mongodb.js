const mongoose = require('mongoose');
const { config } = require('dotenv');

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vanshikaagarwal8484_db_user:PguxHOx1yiZKMEKh@cluster0.qezxdg3.mongodb.net/bookified?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔍 Testing MongoDB connection...');
console.log('📋 URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));

async function testConnection() {
  try {
    console.log('⏳ Connecting...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    });
    
    console.log('🎉 Connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Disconnected');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Solutions to try:');
      console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com/');
      console.log('2. Select cluster0');
      console.log('3. Go to Network Access');
      console.log('4. Click "Add IP Address"');
      console.log('5. Choose "Allow Access from Anywhere" (0.0.0.0/0)');
      console.log('6. Click "Confirm"');
      console.log('7. Wait 2-3 minutes for changes to apply');
      console.log('8. Try again');
    }
  }
}

testConnection();
