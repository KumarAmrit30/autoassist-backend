const { validationResult } = require("express-validator");
const User = require("../models/User");
const JWTUtils = require("../utils/jwt");

// Register user
const register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        error: "Username already taken",
      });
    }

    // Create new user
    const user = await User.create({ username, email, password });

    // Generate JWT token
    const token = JWTUtils.generateUserToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = JWTUtils.generateUserToken(user);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

// Verify token
const verifyToken = async (req, res, next) => {
  try {
    // User is already attached to req by authenticateToken middleware
    res.json({
      success: true,
      data: {
        user: req.user.toJSON(),
      },
      message: "Token is valid",
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  getProfile,
};
