const XLSX = require("xlsx");
const path = require("path");
const Car = require("../models/Car");
const { initDatabase } = require("../config/database");

// Function to clean and standardize data
const cleanData = (data) => {
  const cleaned = { ...data };

  // Clean price - remove commas and convert to number
  if (cleaned.price) {
    cleaned.price = parseFloat(cleaned.price.toString().replace(/,/g, ""));
  }

  // Clean year - ensure it's a number
  if (cleaned.year) {
    cleaned.year = parseInt(cleaned.year);
  }

  // Clean seats - ensure it's a number
  if (cleaned.seats) {
    cleaned.seats = parseInt(cleaned.seats);
  }

  // Clean string fields - trim whitespace
  const stringFields = [
    "brand",
    "model",
    "variant",
    "fuel_type",
    "transmission",
    "mileage",
    "engine_cc",
    "power_bhp",
    "body_type",
  ];
  stringFields.forEach((field) => {
    if (cleaned[field]) {
      cleaned[field] = cleaned[field].toString().trim();
    }
  });

  // Handle null/undefined values
  Object.keys(cleaned).forEach((key) => {
    if (
      cleaned[key] === null ||
      cleaned[key] === undefined ||
      cleaned[key] === ""
    ) {
      cleaned[key] = null;
    }
  });

  return cleaned;
};

// Function to map Excel columns to database fields
const mapExcelToDatabase = (excelData) => {
  const mappedData = [];

  excelData.forEach((row) => {
    // Check if this is the new transformed dataset format
    if (row["Identification_Brand"]) {
      // New transformed dataset mapping
      const carData = {
        brand: row["Identification_Brand"],
        model: row["Identification_Model"],
        variant: row["Identification_Variant"],
        year: row["Identification_Year_of_Manufacture"],
        price: estimatePrice(row), // We'll need to estimate price as it's not in this dataset
        fuel_type: determineFuelType(row),
        transmission: row["Transmission_Transmission_Type"],
        mileage: row["Fuel_&_Emissions_Mileage_ARAI,_kmpl"] + " kmpl",
        engine_cc: row["Engine_Engine_Displacement_cc"] + " cc",
        power_bhp: row["Engine_Power_bhp"] + " bhp",
        seats: estimateSeats(row), // Estimate based on body type
        body_type: row["Identification_Body_Type"],
        image_url: row["Image_URL"],
        description: generateDescription(row),
      };

      // Only add if we have at least brand, model, year
      if (carData.brand && carData.model && carData.year) {
        mappedData.push(cleanData(carData));
      }
    } else {
      // Original dataset mapping (fallback)
      const carData = {
        brand: row["Brand"] || row["brand"] || row["BRAND"],
        model: row["Model"] || row["model"] || row["MODEL"],
        variant: row["Variant"] || row["variant"] || row["VARIANT"],
        year: row["Year"] || row["year"] || row["YEAR"],
        price: row["Price"] || row["price"] || row["PRICE"],
        fuel_type:
          row["Fuel Type"] ||
          row["Fuel_Type"] ||
          row["fuel_type"] ||
          row["FUEL_TYPE"],
        transmission:
          row["Transmission"] || row["transmission"] || row["TRANSMISSION"],
        mileage: row["Mileage"] || row["mileage"] || row["MILEAGE"],
        engine_cc:
          row["Engine CC"] ||
          row["Engine_CC"] ||
          row["engine_cc"] ||
          row["ENGINE_CC"],
        power_bhp:
          row["Power BHP"] ||
          row["Power_BHP"] ||
          row["power_bhp"] ||
          row["POWER_BHP"],
        seats: row["Seats"] || row["seats"] || row["SEATS"],
        body_type:
          row["Body Type"] ||
          row["Body_Type"] ||
          row["body_type"] ||
          row["BODY_TYPE"],
        image_url:
          row["Image URL"] ||
          row["Image_URL"] ||
          row["image_url"] ||
          row["IMAGE_URL"],
        description:
          row["Description"] || row["description"] || row["DESCRIPTION"],
      };

      // Only add if we have at least brand, model, year, and price
      if (carData.brand && carData.model && carData.year && carData.price) {
        mappedData.push(cleanData(carData));
      }
    }
  });

  return mappedData;
};

// Helper function to estimate price based on car characteristics
const estimatePrice = (row) => {
  const brand = row["Identification_Brand"];
  const bodyType = row["Identification_Body_Type"];
  const engineCC = row["Engine_Engine_Displacement_cc"];
  const powerBHP = row["Engine_Power_bhp"];
  const segment = row["Identification_Segment"];

  // Base price estimation logic (in INR)
  let basePrice = 500000; // 5 lakh base

  // Brand multiplier
  const brandMultipliers = {
    "Maruti Suzuki": 1.0,
    Hyundai: 1.2,
    Tata: 1.1,
    Mahindra: 1.3,
    Kia: 1.4,
    Honda: 1.5,
    Toyota: 1.6,
    Volkswagen: 1.7,
    Skoda: 1.7,
    BMW: 3.0,
    "Mercedes-Benz": 3.5,
    Audi: 3.2,
    Jaguar: 4.0,
    "Land Rover": 4.5,
  };

  // Apply brand multiplier
  basePrice *= brandMultipliers[brand] || 1.0;

  // Body type adjustment
  const bodyTypeMultipliers = {
    Hatchback: 1.0,
    Sedan: 1.3,
    SUV: 1.8,
    "Mini SUV": 1.2,
    "Compact SUV": 1.5,
    "Mid-size SUV": 2.0,
    "Full-size SUV": 2.5,
    Coupe: 2.2,
    Convertible: 2.8,
    MPV: 1.6,
  };

  basePrice *= bodyTypeMultipliers[bodyType] || 1.0;

  // Engine size and power adjustments
  if (engineCC > 2000) basePrice *= 1.5;
  else if (engineCC > 1500) basePrice *= 1.3;
  else if (engineCC > 1000) basePrice *= 1.1;

  if (powerBHP > 200) basePrice *= 1.4;
  else if (powerBHP > 150) basePrice *= 1.2;
  else if (powerBHP > 100) basePrice *= 1.1;

  // Segment adjustment
  const segmentMultipliers = {
    "A-Segment": 0.8,
    "B-Segment": 1.0,
    "C-Segment": 1.4,
    "D-Segment": 1.8,
    "E-Segment": 2.5,
    "F-Segment": 3.0,
  };

  basePrice *= segmentMultipliers[segment] || 1.0;

  return Math.round(basePrice);
};

// Helper function to determine fuel type
const determineFuelType = (row) => {
  const emissionStd = row["Fuel_&_Emissions_Emission_Standard"];
  const adBlue = row["Fuel_&_Emissions_AdBlue_System"];

  if (adBlue === "Yes") return "Diesel";
  if (emissionStd && emissionStd.includes("CNG")) return "CNG";
  if (row["Engine_Engine_Displacement_cc"] > 1500) return "Diesel";
  return "Petrol"; // Default assumption
};

// Helper function to estimate seats based on body type
const estimateSeats = (row) => {
  const bodyType = row["Identification_Body_Type"];
  const segment = row["Identification_Segment"];

  const seatMapping = {
    Hatchback: 5,
    Sedan: 5,
    SUV: 7,
    "Mini SUV": 5,
    "Compact SUV": 5,
    "Mid-size SUV": 7,
    "Full-size SUV": 7,
    MPV: 7,
    Coupe: 4,
    Convertible: 4,
  };

  return seatMapping[bodyType] || 5;
};

// Helper function to generate description
const generateDescription = (row) => {
  const brand = row["Identification_Brand"];
  const model = row["Identification_Model"];
  const variant = row["Identification_Variant"];
  const bodyType = row["Identification_Body_Type"];
  const engineCC = row["Engine_Engine_Displacement_cc"];
  const powerBHP = row["Engine_Power_bhp"];
  const mileage = row["Fuel_&_Emissions_Mileage_ARAI,_kmpl"];
  const transmission = row["Transmission_Transmission_Type"];

  return `${brand} ${model} ${variant} is a ${bodyType.toLowerCase()} powered by a ${engineCC}cc engine producing ${powerBHP} bhp. It offers ${mileage} kmpl mileage with ${transmission} transmission. Features include modern infotainment system and safety features.`;
};

// Main import function
const importCarData = async (filePath) => {
  try {
    console.log("Starting car data import...");

    // Initialize database
    await initDatabase();

    // Read Excel file
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${excelData.length} rows in Excel file`);

    // Map and clean data
    const cleanedData = mapExcelToDatabase(excelData);
    console.log(`Cleaned and mapped ${cleanedData.length} valid car records`);

    if (cleanedData.length === 0) {
      console.log(
        "No valid car records found. Please check your Excel file format."
      );
      return;
    }

    // Clear existing data (optional - remove this if you want to keep existing data)
    console.log("Clearing existing car data...");
    const { pool } = require("../config/database");
    await pool.query("DELETE FROM cars");

    // Bulk insert data
    console.log("Inserting car data into database...");
    await Car.bulkInsert(cleanedData);

    console.log("✅ Car data import completed successfully!");
    console.log(`📊 Imported ${cleanedData.length} car records`);
  } catch (error) {
    console.error("❌ Error importing car data:", error);
    throw error;
  }
};

// CLI execution
if (require.main === module) {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("❌ Please provide the path to the Excel file");
    console.log("Usage: node import-cars.js <path-to-excel-file>");
    console.log(
      "Example: node import-cars.js ./data/Indian_Cars_Dataset_350.xlsx"
    );
    process.exit(1);
  }

  const fullPath = path.resolve(filePath);

  importCarData(fullPath)
    .then(() => {
      console.log("🎉 Import process completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Import process failed:", error);
      process.exit(1);
    });
}

module.exports = { importCarData, cleanData, mapExcelToDatabase };
