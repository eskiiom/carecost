import dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
}; 