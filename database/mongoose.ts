import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

// Use a more explicit connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vanshikaagarwal8484_db_user:PguxHOx1yiZKMEKh@cluster0.qezxdg3.mongodb.net/bookified?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}
declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}
let cached = global.mongooseCache||(global.mongooseCache = { conn: null, promise: null });
export const connectToDatabase = async () => {
  console.log('🔍 Attempting to connect to MongoDB...');
  console.log('📋 Connection URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
  
  if (cached.conn) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }
  
  if (!cached.promise) {
    console.log('🔄 Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4 // Use IPv4
    });
  }
  
  try {
    console.log('⏳ Waiting for MongoDB connection...');
    cached.conn = await cached.promise;
    console.log('🎉 MongoDB connected successfully!');
    console.log('📊 Database name:', cached.conn.connection.name);
    console.log('🌐 Connection host:', cached.conn.connection.host);
  } catch (error) {
    cached.promise = null;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ MongoDB connection failed:', errorMessage);
    console.error('🔧 Troubleshooting tips:');
    console.error('   1. Check if MongoDB Atlas cluster is running');
    console.error('   2. Verify your IP is whitelisted in MongoDB Atlas');
    console.error('   3. Check if connection string is correct');
    console.error('   4. Ensure you have internet connection');
    throw error;
  }
  
  return cached.conn;
};
export default cached;
