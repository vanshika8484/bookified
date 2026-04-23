// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable');
// }

// declare global {
//   var mongooseCache: {
//     conn: typeof mongoose | null;
//     promise: Promise<typeof mongoose> | null;
//   };
// }

// let cached = global.mongooseCache||(global.mongooseCache = { conn: null, promise: null });

// export const connectToDatabase = async () => {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI, {
//       bufferCommands: false,
//     });
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (error) {
//     cached.promise = null;
//     console.error('Failed to connect to MongoDB', error);
//     throw error;
//   }

//   console.info('Connected to MongoDB');
//   return cached.conn;
// };

// export default cached;

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

const MONGODB_URI = process.env.DB_PATH;

if (!MONGODB_URI) {
  throw new Error('Please define the DB_PATH environment variable');
}

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

export const connectToDatabase = async () => {
  if (cached.conn) {
    console.info('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const options: mongoose.ConnectOptions = {
      bufferCommands: false,
      // Atlas specific options
      maxPoolSize: 10,          // Maximum connections in pool
      serverSelectionTimeoutMS: 5000,  // Timeout for server selection
      socketTimeoutMS: 45000,   // Timeout for socket operations
      family: 4,                // Use IPv4, skip IPv6
    };

    console.info('Connecting to MongoDB Atlas...');
    cached.promise = mongoose.connect(MONGODB_URI as string, options);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB Atlas:', error);
    throw error;
  }

  console.info('Successfully connected to MongoDB Atlas');
  return cached.conn;
};

export default cached;
