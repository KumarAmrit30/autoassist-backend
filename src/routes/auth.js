const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const carController = require("../controllers/carController");
const { authenticateToken, rateLimit } = require("../middleware/auth");
const {
  validateRegister,
  validateLogin,
  validateCarId,
  validateCarQuery,
  validateSearch,
} = require("../middleware/validation");

// Auth routes
router.post(
  "/register",
  rateLimit(900000, 5), // 5 requests per 15 minutes
  validateRegister,
  authController.register
);

router.post(
  "/login",
  rateLimit(900000, 10), // 10 requests per 15 minutes
  validateLogin,
  authController.login
);

router.get("/verify", authenticateToken, authController.verifyToken);

router.get("/profile", authenticateToken, authController.getProfile);

module.exports = router;
