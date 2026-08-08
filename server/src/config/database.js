import mongoose from 'mongoose';
import config from './index.js';

/**
 * Connect to MongoDB database instance
 */
export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[Database] Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB Disconnected. Reconnecting...');
    });

    return conn;
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    // In development mode, allow server to run for skeleton testing even if DB is not live yet
    if (config.env === 'production') {
      process.exit(1);
    }
  }
};

export default connectDatabase;
