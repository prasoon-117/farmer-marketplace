import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'farmer-marketplace-jwt-secret-p309-secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_URL: process.env.DATABASE_URL || `file:${path.resolve(__dirname, '../../data/marketplace.db')}`,
};
