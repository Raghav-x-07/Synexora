const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/synexora';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to primary MongoDB at ${uri}: ${error.message}`);

    // If in development, attempt to spin up in-memory MongoDB fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Attempting to initialize in-memory MongoDB for local development/testing...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const memUri = mongodInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] In-Memory MongoDB Connected at ${memUri}`);
        return;
      } catch (memErr) {
        console.warn(`[Database Warning] In-memory MongoDB not initialized: ${memErr.message}`);
      }
    }

    if (process.env.NODE_ENV === 'production') {
      console.error('[Database Fatal] Exiting in production due to MongoDB connection failure.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
