const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/synexoradb";

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`\x1b[32m%s\x1b[0m`, `✓ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.log(`\x1b[33m%s\x1b[0m`, `[MERN Database] Local MongoDB daemon not detected at ${mongoUri}.`);
    console.log(`\x1b[36m%s\x1b[0m`, `[MERN Database] Running in High-Speed In-Memory Simulation Store mode for zero-friction development.`);
    isConnected = false;
  }
};

module.exports = { connectDB, getIsConnected: () => isConnected };
