import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vanshikaagarwal8484_db_user:PguxHOx1yiZKMEKh@cluster0.qezxdg3.mongodb.net/bookified?retryWrites=true&w=majority&appName=Cluster0';
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/bookified';

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
  console.log('=== MongoDB Connection Attempt ===');
  
  if (cached.conn) {
    console.log('Using existing connection');
    return cached.conn;
  }

  // Try Atlas first, then fallback to local
  const connectionUris = [
    { name: 'MongoDB Atlas', uri: MONGODB_URI },
    { name: 'Local MongoDB', uri: LOCAL_MONGODB_URI }
  ];

  for (const { name, uri } of connectionUris) {
    try {
      console.log(`Attempting to connect to ${name}...`);
      console.log(`URI: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
      
      cached.promise = mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      });
      
      cached.conn = await cached.promise;
      console.log(`Successfully connected to ${name}!`);
      console.log(`Database: ${cached.conn.connection.name}`);
      return cached.conn;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to connect to ${name}:`, errorMessage);
      cached.promise = null;
      
      // If this is the last option, throw the error
      if (name === connectionUris[connectionUris.length - 1].name) {
        console.error('All connection attempts failed');
        throw new Error('Failed to connect to any MongoDB instance');
      }
    }
  }
  
  return cached.conn;
};

export default cached;

