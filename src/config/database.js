const mongoose = require("mongoose");
const config = require("./config");

// MongoDB connection options
const mongoOptions = {
  maxPoolSize: 20, // Maximum number of connections in the pool
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0, // Disable mongoose buffering
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = config.database.url || config.database.mongoURI;

    if (!mongoURI) {
      throw new Error(
        "MongoDB connection string is required. Please set DATABASE_URL or MONGO_URI in your environment variables."
      );
    }

    await mongoose.connect(mongoURI, mongoOptions);
    console.log("Connected to MongoDB Atlas successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

// Database initialization functions
const initDatabase = async () => {
  try {
    await connectDB();
    console.log("MongoDB database connection initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Reset database (drop collections)
const resetDatabase = async () => {
  try {
    await connectDB();

    // Drop all collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
    }

    console.log("Database collections dropped successfully");
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
};

// Graceful shutdown
const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
};

module.exports = {
  connectDB,
  initDatabase,
  resetDatabase,
  closeDatabase,
  mongoose,
};
