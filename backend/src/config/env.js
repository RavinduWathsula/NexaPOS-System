import dotenv from 'dotenv'
dotenv.config()

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'nexapos_fallback_jwt_secret_key_2024',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'nexapos_fallback_refresh_key_2024',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || 'LKR',
  STORE_NAME: process.env.STORE_NAME || 'NexaPOS Mobile & Electronics (Pvt) Ltd',
  STORE_BRANCH: process.env.STORE_BRANCH || 'Colombo Main Branch',
}

