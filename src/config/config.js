// Environment Configuration
require("dotenv").config();

const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    url: process.env.DATABASE_URL || process.env.MONGO_URI,
    mongoURI: process.env.MONGO_URI || process.env.DATABASE_URL,
    name: process.env.DB_NAME || "autoassist",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-key",
    expireTime: process.env.JWT_EXPIRE_TIME || "7d",
  },

  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:5173", // Vite default port
      "https://autoassist-frontend.vercel.app",
      "https://*.vercel.app",
      /\.vercel\.app$/,
    ],
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

module.exports = config;
