const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./src/config/config");
const { initDatabase, closeDatabase } = require("./src/config/database");
const { errorHandler, notFound } = require("./src/middleware/auth");

// Import routes
const authRoutes = require("./src/routes/auth");
const carRoutes = require("./src/routes/cars");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging middleware
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request size limiting
app.use((req, res, next) => {
  const contentLength = parseInt(req.get("content-length") || "0");
  if (contentLength > 10 * 1024 * 1024) {
    // 10MB limit
    return res.status(413).json({
      success: false,
      error: "Request entity too large",
    });
  }
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "AutoAssist Backend is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to AutoAssist Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      cars: "/api/cars",
      health: "/health",
    },
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    await initDatabase();
    console.log("✅ Database initialized successfully");

    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`🚀 AutoAssist Backend server running on port ${PORT}`);
      console.log(`📱 Environment: ${config.nodeEnv}`);
      console.log(`🌐 CORS enabled for: ${config.cors.origin}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
