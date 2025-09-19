const mongoose = require("mongoose");

// Define Car Schema
const carSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      maxlength: [100, "Brand cannot exceed 100 characters"],
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
      maxlength: [100, "Model cannot exceed 100 characters"],
    },
    variant: {
      type: String,
      trim: true,
      maxlength: [200, "Variant cannot exceed 200 characters"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be after 1900"],
      max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    fuel_type: {
      type: String,
      trim: true,
      maxlength: [50, "Fuel type cannot exceed 50 characters"],
    },
    transmission: {
      type: String,
      trim: true,
      maxlength: [50, "Transmission cannot exceed 50 characters"],
    },
    mileage: {
      type: String,
      trim: true,
      maxlength: [50, "Mileage cannot exceed 50 characters"],
    },
    engine_cc: {
      type: String,
      trim: true,
      maxlength: [50, "Engine CC cannot exceed 50 characters"],
    },
    power_bhp: {
      type: String,
      trim: true,
      maxlength: [50, "Power BHP cannot exceed 50 characters"],
    },
    seats: {
      type: Number,
      min: [1, "Seats must be at least 1"],
      max: [50, "Seats cannot exceed 50"],
    },
    body_type: {
      type: String,
      trim: true,
      maxlength: [50, "Body type cannot exceed 50 characters"],
    },
    image_url: {
      type: String,
      trim: true,
      maxlength: [500, "Image URL cannot exceed 500 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
carSchema.index({ brand: 1 });
carSchema.index({ price: 1 });
carSchema.index({ year: 1 });
carSchema.index({ fuel_type: 1 });
carSchema.index({ transmission: 1 });
carSchema.index({ body_type: 1 });
carSchema.index({ brand: "text", model: "text", variant: "text" }); // Text search index

// Static methods
carSchema.statics.create = async function (carData) {
  const car = new this(carData);
  return await car.save();
};

carSchema.statics.findAll = async function (options = {}) {
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
  } = options;

  // Build filter object
  const filter = {};

  if (brand) {
    filter.brand = { $regex: brand, $options: "i" };
  }

  if (price_min || price_max) {
    filter.price = {};
    if (price_min) filter.price.$gte = price_min;
    if (price_max) filter.price.$lte = price_max;
  }

  if (year) {
    filter.year = year;
  }

  if (fuel_type) {
    filter.fuel_type = { $regex: fuel_type, $options: "i" };
  }

  if (transmission) {
    filter.transmission = { $regex: transmission, $options: "i" };
  }

  if (body_type) {
    filter.body_type = { $regex: body_type, $options: "i" };
  }

  if (search) {
    filter.$or = [
      { brand: { $regex: search, $options: "i" } },
      { model: { $regex: search, $options: "i" } },
      { variant: { $regex: search, $options: "i" } },
    ];
  }

  // Build sort object
  const validSortFields = ["price", "year", "brand", "model", "created_at"];
  const sortField = validSortFields.includes(sort_by) ? sort_by : "created_at";
  const sortDirection = sort_order.toUpperCase() === "ASC" ? 1 : -1;
  const sort = { [sortField]: sortDirection };

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute queries
  const [cars, total] = await Promise.all([
    this.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    this.countDocuments(filter),
  ]);

  return {
    cars,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

carSchema.statics.findById = async function (id) {
  return await this.findOne({ _id: id });
};

carSchema.statics.getBrands = async function () {
  const brands = await this.distinct("brand");
  return brands.sort();
};

carSchema.statics.getFilterOptions = async function () {
  const [brands, fuelTypes, transmissions, bodyTypes, years, priceRange] =
    await Promise.all([
      this.distinct("brand"),
      this.distinct("fuel_type", { fuel_type: { $ne: null } }),
      this.distinct("transmission", { transmission: { $ne: null } }),
      this.distinct("body_type", { body_type: { $ne: null } }),
      this.distinct("year"),
      this.aggregate([
        {
          $group: {
            _id: null,
            min_price: { $min: "$price" },
            max_price: { $max: "$price" },
          },
        },
      ]),
    ]);

  return {
    brands: brands.sort(),
    fuelTypes: fuelTypes.sort(),
    transmissions: transmissions.sort(),
    bodyTypes: bodyTypes.sort(),
    years: years.sort((a, b) => b - a), // Descending order
    priceRange: priceRange[0] || { min_price: 0, max_price: 0 },
  };
};

carSchema.statics.bulkInsert = async function (carsData) {
  try {
    const result = await this.insertMany(carsData, { ordered: false });
    console.log(`Successfully inserted ${result.length} cars`);
    return result;
  } catch (error) {
    console.error("Bulk insert error:", error);
    throw error;
  }
};

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
