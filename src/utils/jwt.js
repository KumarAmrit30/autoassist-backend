const jwt = require("jsonwebtoken");
const config = require("../config/config");

class JWTUtils {
  // Generate JWT token
  static generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expireTime,
    });
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // Generate token for user
  static generateUserToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };
    return this.generateToken(payload);
  }
}

module.exports = JWTUtils;
