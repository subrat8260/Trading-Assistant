import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://crazysouth75_db_user:EO4qznCV4V55zbd6@cluster0.mtuemss.mongodb.net/trading_assistant?appName=Cluster0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_key_123',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_456',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    refreshRememberExpiresIn: process.env.JWT_REFRESH_REMEMBER_EXPIRES_IN || '30d',
  },
  signal24x7: {
    username: process.env.SIGNAL24X7_USERNAME || 'crazysouth75@gmail.com',
    password: process.env.SIGNAL24X7_PASSWORD || 'Subrat@123',
  },
};

export default config;
