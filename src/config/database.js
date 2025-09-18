const { Pool } = require("pg");
const config = require("./config");

// Create connection pool
const pool = new Pool({
  connectionString: config.database.url,
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Database initialization functions
const initDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cars table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        variant VARCHAR(200),
        year INTEGER NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        fuel_type VARCHAR(50),
        transmission VARCHAR(50),
        mileage VARCHAR(50),
        engine_cc VARCHAR(50),
        power_bhp VARCHAR(50),
        seats INTEGER,
        body_type VARCHAR(50),
        image_url VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
      CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
      CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
      CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars(fuel_type);
      CREATE INDEX IF NOT EXISTS idx_cars_transmission ON cars(transmission);
      CREATE INDEX IF NOT EXISTS idx_cars_body_type ON cars(body_type);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Reset database (drop and recreate tables)
const resetDatabase = async () => {
  try {
    await pool.query("DROP TABLE IF EXISTS cars CASCADE");
    await pool.query("DROP TABLE IF EXISTS users CASCADE");
    console.log("Database tables dropped successfully");
    await initDatabase();
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
};

module.exports = {
  pool,
  initDatabase,
  resetDatabase,
};
