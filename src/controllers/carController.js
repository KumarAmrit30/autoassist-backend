const { validationResult } = require("express-validator");
const Car = require("../models/Car");

// Get all cars with filtering, sorting, and pagination
const getCars = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      brand,
      price_min,
      price_max,
      year,
      fuel_type,
      transmission,
      body_type,
      search,
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      brand,
      price_min: price_min ? parseFloat(price_min) : undefined,
      price_max: price_max ? parseFloat(price_max) : undefined,
      year: year ? parseInt(year) : undefined,
      fuel_type,
      transmission,
      body_type,
      search,
      sort_by,
      sort_order: sort_order.toUpperCase(),
    };

    const result = await Car.findAll(options);

    res.json({
      success: true,
      data: result.cars,
      pagination: result.pagination,
      message: "Cars retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get single car by ID
const getCarById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    res.json({
      success: true,
      data: car,
      message: "Car retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get unique brands
const getBrands = async (req, res, next) => {
  try {
    const brands = await Car.getBrands();

    res.json({
      success: true,
      data: brands,
      message: "Brands retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get filter options
const getFilterOptions = async (req, res, next) => {
  try {
    const filterOptions = await Car.getFilterOptions();

    res.json({
      success: true,
      data: filterOptions,
      message: "Filter options retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Search cars
const searchCars = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: q.trim(),
    };

    const result = await Car.findAll(options);

    res.json({
      success: true,
      data: result.cars,
      pagination: result.pagination,
      message: `Found ${result.pagination.total} cars matching "${q}"`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCars,
  getCarById,
  getBrands,
  getFilterOptions,
  searchCars,
};
