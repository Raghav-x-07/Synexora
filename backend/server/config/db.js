const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/synexora";

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`\x1b[32m%s\x1b[0m`, `✓ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.error(`\x1b[31m%s\x1b[0m`, `[Database Error] MongoDB connection failed: ${error.message}`);
  }
};

module.exports = { connectDB, getIsConnected: () => isConnected };

