const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");
const {
  validateCarId,
  validateCarQuery,
  validateSearch,
} = require("../middleware/validation");

// Car routes
router.get("/", validateCarQuery, carController.getCars);

router.get("/search", validateSearch, carController.searchCars);

router.get("/brands", carController.getBrands);

router.get("/filters", carController.getFilterOptions);

router.get("/:id", validateCarId, carController.getCarById);

module.exports = router;
