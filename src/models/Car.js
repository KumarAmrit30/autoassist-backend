const mongoose = require("mongoose");

// Define Car Schema based on the CSV structure
const carSchema = new mongoose.Schema(
  {
    Car_ID: {
      type: Number,
      unique: true,
      required: true,
    },
    Car_Full_Name: {
      type: String,
      required: [true, "Car full name is required"],
      trim: true,
      maxlength: [200, "Car full name cannot exceed 200 characters"],
    },
    Identification_Brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      maxlength: [100, "Brand cannot exceed 100 characters"],
    },
    Identification_Model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
      maxlength: [100, "Model cannot exceed 100 characters"],
    },
    Identification_Variant: {
      type: String,
      trim: true,
      maxlength: [200, "Variant cannot exceed 200 characters"],
    },
    Identification_Year_of_Manufacture: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be after 1900"],
      max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
    },
    Identification_Body_Type: {
      type: String,
      trim: true,
      maxlength: [50, "Body type cannot exceed 50 characters"],
    },
    Identification_Segment: {
      type: String,
      trim: true,
      maxlength: [50, "Segment cannot exceed 50 characters"],
    },
    // Dimensions
    Dimensions_Length_mm: Number,
    Dimensions_Width_mm: Number,
    Dimensions_Height_mm: Number,
    Dimensions_Wheelbase_mm: Number,
    Dimensions_Ground_Clearance_mm: Number,
    Dimensions_Kerb_Weight_kg: Number,
    Dimensions_Turning_Radius_m: Number,
    Dimensions_Fuel_Tank_Capacity_litres: Number,

    // Engine
    Engine_Engine_Displacement_cc: Number,
    Engine_Cylinder_Count: Number,
    Engine_Turbocharged_or_Naturally_Aspirated: String,
    Engine_Power_bhp: Number,
    Engine_Torque_Nm: Number,

    // Transmission
    Transmission_Transmission_Type: String,
    Transmission_Gear_Count: String,
    Transmission_Drive_Type: String,

    // Performance
    "Performance_Acceleration_0-100_km_h,_sec": Number,
    Performance_Top_Speed_km_h: Number,

    // Fuel & Emissions
    "Fuel_&_Emissions_Mileage_ARAI,_kmpl": Number,
    "Fuel_&_Emissions_Emission_Standard": String,
    "Fuel_&_Emissions_AdBlue_System": String,

    // Safety
    Safety_Airbags_Count: Number,
    Safety_ABS_with_EBD: String,
    Safety_Electronic_Stability_Control_ESC: String,
    Safety_Traction_Control: String,
    Safety_Hill_Hold_Assist: String,
    Safety_ISOFIX_Child_Seat_Mounts: String,
    Safety_Crash_Test_Rating: String,
    Safety_Rear_Parking_Sensors: String,
    Safety_Rear_Parking_Camera: String,
    "Safety_360°_Camera": String,

    // Comfort
    Comfort_Air_Conditioning: String,
    Comfort_Rear_AC_Vents: String,
    Comfort_Air_Purifier: String,
    Comfort_Cooled_Glove_Box: String,
    Comfort_Ventilated_Seats: String,
    Comfort_Electrically_Adjustable_Driver_Seat: String,
    "Comfort_Keyless_Entry___Push-Button_Start": String,
    Comfort_Cruise_Control: String,
    "Comfort_Tilt_&_Telescopic_Steering": String,
    Comfort_Ambient_Lighting: String,
    "Comfort_Rain-Sensing_Wipers": String,
    Comfort_Sunroof_Type: String,

    // Infotainment
    Infotainment_Touchscreen_Size_inches: Number,
    Infotainment_Apple_CarPlay___Android_Auto: String,
    "Infotainment_Speaker_Count_&_Brand": String,
    Infotainment_Wireless_Charging: String,
    Infotainment_Digital_Instrument_Cluster: String,
    "Infotainment_Heads-Up_Display_HUD": String,
    Infotainment_Connected_Car_Tech: String,
    Infotainment_Voice_Commands: String,

    // Practicality
    Practicality_Boot_Space_litres: Number,
    Practicality_Foldable_Rear_Seats: String,
    Practicality_Roof_Rails: String,
    Practicality_Spare_Wheel_Type: String,

    // Exterior
    Exterior_Wheel_Type: String,
    Exterior_LED_Headlamps: String,
    Exterior_LED_DRLs: String,
    Exterior_Fog_Lamps: String,
    Exterior_Cornering_Lamps: String,
    "Exterior_Auto-Folding_ORVMs": String,

    // ADAS
    ADAS_Adaptive_Cruise_Control: String,
    ADAS_Lane_Keep_Assist: String,
    ADAS_Forward_Collision_Warning: String,
    ADAS_Autonomous_Emergency_Braking_AEB: String,
    ADAS_Blind_Spot_Monitoring: String,
    ADAS_Driver_Drowsiness_Detection: String,
    "ADAS_Rear_Cross-Traffic_Alert": String,

    // Ownership
    Ownership_Warranty: String,
    Ownership_Service_Interval: String,
    Ownership_Roadside_Assistance: String,

    // Additional
    Search_Query: String,
    Image_URL: {
      type: String,
      trim: true,
      maxlength: [500, "Image URL cannot exceed 500 characters"],
    },

    // Add price field for API compatibility (can be calculated or added later)
    price: {
      type: Number,
      min: [0, "Price must be positive"],
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

// Indexes for performance - using actual field names from CSV
carSchema.index({ Identification_Brand: 1 });
carSchema.index({ price: 1 });
carSchema.index({ Identification_Year_of_Manufacture: 1 });
carSchema.index({ Transmission_Transmission_Type: 1 });
carSchema.index({ Identification_Body_Type: 1 });
carSchema.index({
  Identification_Brand: "text",
  Identification_Model: "text",
  Identification_Variant: "text",
  Car_Full_Name: "text",
}); // Text search index

// Virtual fields for API compatibility (map new field names to old API expectations)
carSchema.virtual("brand").get(function () {
  return this.Identification_Brand;
});

carSchema.virtual("model").get(function () {
  return this.Identification_Model;
});

carSchema.virtual("variant").get(function () {
  return this.Identification_Variant;
});

carSchema.virtual("year").get(function () {
  return this.Identification_Year_of_Manufacture;
});

carSchema.virtual("body_type").get(function () {
  return this.Identification_Body_Type;
});

carSchema.virtual("fuel_type").get(function () {
  return this["Fuel_&_Emissions_Emission_Standard"];
});

carSchema.virtual("transmission").get(function () {
  return this.Transmission_Transmission_Type;
});

carSchema.virtual("engine_cc").get(function () {
  return this.Engine_Engine_Displacement_cc;
});

carSchema.virtual("power_bhp").get(function () {
  return this.Engine_Power_bhp;
});

carSchema.virtual("mileage").get(function () {
  return this["Fuel_&_Emissions_Mileage_ARAI,_kmpl"];
});

carSchema.virtual("image_url").get(function () {
  return this.Image_URL;
});

// Ensure virtual fields are serialized
carSchema.set("toJSON", { virtuals: true });
carSchema.set("toObject", { virtuals: true });

// Static methods updated for new field names
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

  // Build filter object using actual field names
  const filter = {};

  if (brand) {
    filter.Identification_Brand = { $regex: brand, $options: "i" };
  }

  if (price_min || price_max) {
    filter.price = {};
    if (price_min) filter.price.$gte = price_min;
    if (price_max) filter.price.$lte = price_max;
  }

  if (year) {
    filter.Identification_Year_of_Manufacture = year;
  }

  if (fuel_type) {
    filter["Fuel_&_Emissions_Emission_Standard"] = {
      $regex: fuel_type,
      $options: "i",
    };
  }

  if (transmission) {
    filter.Transmission_Transmission_Type = {
      $regex: transmission,
      $options: "i",
    };
  }

  if (body_type) {
    filter.Identification_Body_Type = { $regex: body_type, $options: "i" };
  }

  if (search) {
    filter.$or = [
      { Identification_Brand: { $regex: search, $options: "i" } },
      { Identification_Model: { $regex: search, $options: "i" } },
      { Identification_Variant: { $regex: search, $options: "i" } },
      { Car_Full_Name: { $regex: search, $options: "i" } },
    ];
  }

  // Build sort object
  const validSortFields = [
    "price",
    "Identification_Year_of_Manufacture",
    "Identification_Brand",
    "Identification_Model",
    "created_at",
  ];
  let sortField = "created_at";

  // Map API sort fields to actual database fields
  if (sort_by === "year") sortField = "Identification_Year_of_Manufacture";
  else if (sort_by === "brand") sortField = "Identification_Brand";
  else if (sort_by === "model") sortField = "Identification_Model";
  else if (validSortFields.includes(sort_by)) sortField = sort_by;

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
  const brands = await this.distinct("Identification_Brand");
  return brands.sort();
};

carSchema.statics.getFilterOptions = async function () {
  const [brands, fuelTypes, transmissions, bodyTypes, years, priceRange] =
    await Promise.all([
      this.distinct("Identification_Brand"),
      this.distinct("Fuel_&_Emissions_Emission_Standard", {
        "Fuel_&_Emissions_Emission_Standard": { $ne: null },
      }),
      this.distinct("Transmission_Transmission_Type", {
        Transmission_Transmission_Type: { $ne: null },
      }),
      this.distinct("Identification_Body_Type", {
        Identification_Body_Type: { $ne: null },
      }),
      this.distinct("Identification_Year_of_Manufacture"),
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
