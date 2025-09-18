const { pool } = require("../config/database");

class Car {
  constructor(data) {
    this.id = data.id;
    this.brand = data.brand;
    this.model = data.model;
    this.variant = data.variant;
    this.year = data.year;
    this.price = data.price;
    this.fuel_type = data.fuel_type;
    this.transmission = data.transmission;
    this.mileage = data.mileage;
    this.engine_cc = data.engine_cc;
    this.power_bhp = data.power_bhp;
    this.seats = data.seats;
    this.body_type = data.body_type;
    this.image_url = data.image_url;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new car
  static async create(carData) {
    const {
      brand,
      model,
      variant,
      year,
      price,
      fuel_type,
      transmission,
      mileage,
      engine_cc,
      power_bhp,
      seats,
      body_type,
      image_url,
      description,
    } = carData;

    const query = `
      INSERT INTO cars (
        brand, model, variant, year, price, fuel_type, transmission,
        mileage, engine_cc, power_bhp, seats, body_type, image_url, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      brand,
      model,
      variant,
      year,
      price,
      fuel_type,
      transmission,
      mileage,
      engine_cc,
      power_bhp,
      seats,
      body_type,
      image_url,
      description,
    ];

    const result = await pool.query(query, values);
    return new Car(result.rows[0]);
  }

  // Get all cars with filtering, sorting, and pagination
  static async findAll(options = {}) {
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

    let query = "SELECT * FROM cars WHERE 1=1";
    const values = [];
    let paramCount = 0;

    // Add filters
    if (brand) {
      paramCount++;
      query += ` AND brand ILIKE $${paramCount}`;
      values.push(`%${brand}%`);
    }

    if (price_min) {
      paramCount++;
      query += ` AND price >= $${paramCount}`;
      values.push(price_min);
    }

    if (price_max) {
      paramCount++;
      query += ` AND price <= $${paramCount}`;
      values.push(price_max);
    }

    if (year) {
      paramCount++;
      query += ` AND year = $${paramCount}`;
      values.push(year);
    }

    if (fuel_type) {
      paramCount++;
      query += ` AND fuel_type ILIKE $${paramCount}`;
      values.push(`%${fuel_type}%`);
    }

    if (transmission) {
      paramCount++;
      query += ` AND transmission ILIKE $${paramCount}`;
      values.push(`%${transmission}%`);
    }

    if (body_type) {
      paramCount++;
      query += ` AND body_type ILIKE $${paramCount}`;
      values.push(`%${body_type}%`);
    }

    if (search) {
      paramCount++;
      query += ` AND (brand ILIKE $${paramCount} OR model ILIKE $${paramCount} OR variant ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    // Add sorting
    const validSortFields = ["price", "year", "brand", "model", "created_at"];
    const validSortOrders = ["ASC", "DESC"];

    const sortField = validSortFields.includes(sort_by)
      ? sort_by
      : "created_at";
    const sortOrder = validSortOrders.includes(sort_order.toUpperCase())
      ? sort_order.toUpperCase()
      : "DESC";

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    values.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push(offset);

    const result = await pool.query(query, values);
    const cars = result.rows.map((row) => new Car(row));

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM cars WHERE 1=1";
    const countValues = [];
    let countParamCount = 0;

    // Apply same filters for count
    if (brand) {
      countParamCount++;
      countQuery += ` AND brand ILIKE $${countParamCount}`;
      countValues.push(`%${brand}%`);
    }

    if (price_min) {
      countParamCount++;
      countQuery += ` AND price >= $${countParamCount}`;
      countValues.push(price_min);
    }

    if (price_max) {
      countParamCount++;
      countQuery += ` AND price <= $${countParamCount}`;
      countValues.push(price_max);
    }

    if (year) {
      countParamCount++;
      countQuery += ` AND year = $${countParamCount}`;
      countValues.push(year);
    }

    if (fuel_type) {
      countParamCount++;
      countQuery += ` AND fuel_type ILIKE $${countParamCount}`;
      countValues.push(`%${fuel_type}%`);
    }

    if (transmission) {
      countParamCount++;
      countQuery += ` AND transmission ILIKE $${countParamCount}`;
      countValues.push(`%${transmission}%`);
    }

    if (body_type) {
      countParamCount++;
      countQuery += ` AND body_type ILIKE $${countParamCount}`;
      countValues.push(`%${body_type}%`);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (brand ILIKE $${countParamCount} OR model ILIKE $${countParamCount} OR variant ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    return {
      cars,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get car by ID
  static async findById(id) {
    const query = "SELECT * FROM cars WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new Car(result.rows[0]);
  }

  // Get unique brands
  static async getBrands() {
    const query = "SELECT DISTINCT brand FROM cars ORDER BY brand";
    const result = await pool.query(query);
    return result.rows.map((row) => row.brand);
  }

  // Get filter options
  static async getFilterOptions() {
    const queries = {
      brands: "SELECT DISTINCT brand FROM cars ORDER BY brand",
      fuelTypes:
        "SELECT DISTINCT fuel_type FROM cars WHERE fuel_type IS NOT NULL ORDER BY fuel_type",
      transmissions:
        "SELECT DISTINCT transmission FROM cars WHERE transmission IS NOT NULL ORDER BY transmission",
      bodyTypes:
        "SELECT DISTINCT body_type FROM cars WHERE body_type IS NOT NULL ORDER BY body_type",
      years: "SELECT DISTINCT year FROM cars ORDER BY year DESC",
      priceRange:
        "SELECT MIN(price) as min_price, MAX(price) as max_price FROM cars",
    };

    const results = {};

    // Column name mapping
    const columnMapping = {
      brands: "brand",
      fuelTypes: "fuel_type",
      transmissions: "transmission",
      bodyTypes: "body_type",
      years: "year",
    };

    for (const [key, query] of Object.entries(queries)) {
      const result = await pool.query(query);
      if (key === "priceRange") {
        results[key] = result.rows[0];
      } else {
        const columnName = columnMapping[key];
        results[key] = result.rows.map((row) => row[columnName]);
      }
    }

    return results;
  }

  // Bulk insert cars
  static async bulkInsert(carsData) {
    const query = `
      INSERT INTO cars (
        brand, model, variant, year, price, fuel_type, transmission,
        mileage, engine_cc, power_bhp, seats, body_type, image_url, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const carData of carsData) {
        const values = [
          carData.brand,
          carData.model,
          carData.variant,
          carData.year,
          carData.price,
          carData.fuel_type,
          carData.transmission,
          carData.mileage,
          carData.engine_cc,
          carData.power_bhp,
          carData.seats,
          carData.body_type,
          carData.image_url,
          carData.description,
        ];
        await client.query(query, values);
      }

      await client.query("COMMIT");
      console.log(`Successfully inserted ${carsData.length} cars`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Car;
