// Environment Configuration
require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "autoassist_db",
    user: process.env.DB_USER || "username",
    password: process.env.DB_PASSWORD || "password",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-key",
    expireTime: process.env.JWT_EXPIRE_TIME || "7d",
  },

  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

module.exports = config;
