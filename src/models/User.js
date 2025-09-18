const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { username, email, password } = userData;

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at, updated_at
    `;

    const values = [username, email, password_hash];
    const result = await pool.query(query, values);
    return new User(result.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);
  }

  // Find user by username
  static async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);
  }

  // Find user by ID
  static async findById(id) {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Get user data without password
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = User;
