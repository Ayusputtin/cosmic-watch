const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/cosmic_watch',
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  NASA_API_KEY: process.env.NASA_API_KEY || 'DEMO_KEY',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
