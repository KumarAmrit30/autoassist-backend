// MongoDB initialization script for local development
// This script runs when the MongoDB container starts

// Switch to the autoassist_db database
db = db.getSiblingDB("autoassist_db");

// Create a user for the application
db.createUser({
  user: "autoassist_user",
  pwd: "autoassist_password",
  roles: [
    {
      role: "readWrite",
      db: "autoassist_db",
    },
  ],
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.cars.createIndex({ brand: 1 });
db.cars.createIndex({ price: 1 });
db.cars.createIndex({ year: 1 });
db.cars.createIndex({ fuel_type: 1 });
db.cars.createIndex({ transmission: 1 });
db.cars.createIndex({ body_type: 1 });
db.cars.createIndex(
  { brand: "text", model: "text", variant: "text" },
  { name: "text_search_index" }
);

print("Database initialized successfully!");
