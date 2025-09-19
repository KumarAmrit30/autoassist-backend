# AutoAssist Backend API

A comprehensive backend API for AutoAssist Car Marketplace built with Node.js, Express.js, and MongoDB Atlas.

## 🚨 **MIGRATED TO MONGODB ATLAS**

This application has been fully migrated from PostgreSQL to MongoDB Atlas. See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration information.

## 🚀 Features

- **JWT Authentication**: Secure user registration and login with JWT tokens
- **Car Data Management**: Complete CRUD operations for car listings
- **Advanced Filtering**: Filter cars by brand, price, year, fuel type, transmission, etc.
- **Search Functionality**: Full-text search across car brands, models, and variants
- **Pagination**: Efficient data pagination for large datasets
- **Data Import**: Import car data from Excel files
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Centralized error handling with proper HTTP status codes

## 📋 Prerequisites

- Node.js (>= 14.0.0)
- MongoDB Atlas account (recommended) or local MongoDB (>= 6.0)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd autoassist_backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your MongoDB Atlas configuration:

   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=mongodb+srv://username:password@cluster0.mongodb.net/autoassist_db?retryWrites=true&w=majority
   MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/autoassist_db?retryWrites=true&w=majority
   DB_NAME=autoassist_db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE_TIME=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up MongoDB Atlas**

   1. Create a MongoDB Atlas account at https://cloud.mongodb.com
   2. Create a new cluster
   3. Create a database user
   4. Get your connection string
   5. Whitelist your IP address
   6. Replace the `DATABASE_URL` in your `.env` file

   ```bash
   # Initialize database connection (optional - auto-connects on startup)
   npm run db:setup
   ```

5. **Import car data (optional)**
   ```bash
   npm run import-data <path-to-excel-file>
   ```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token"
  },
  "message": "User registered successfully"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Verify Token

```http
GET /api/auth/verify
Authorization: Bearer <jwt-token>
```

#### Get User Profile

```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

### Car Endpoints

#### Get All Cars

```http
GET /api/cars?page=1&limit=10&brand=Toyota&price_min=500000&price_max=2000000&year=2020&fuel_type=Petrol&transmission=Manual&sort_by=price&sort_order=asc
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `brand` (optional): Filter by brand
- `price_min` (optional): Minimum price
- `price_max` (optional): Maximum price
- `year` (optional): Filter by year
- `fuel_type` (optional): Filter by fuel type
- `transmission` (optional): Filter by transmission
- `body_type` (optional): Filter by body type
- `search` (optional): Search in brand, model, variant
- `sort_by` (optional): Sort field (price, year, brand, model, created_at)
- `sort_order` (optional): Sort order (asc, desc)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "brand": "Toyota",
      "model": "Camry",
      "variant": "Hybrid",
      "year": 2020,
      "price": 1500000,
      "fuel_type": "Petrol",
      "transmission": "Automatic",
      "mileage": "15 kmpl",
      "engine_cc": "2487 cc",
      "power_bhp": "215 bhp",
      "seats": 5,
      "body_type": "Sedan",
      "image_url": "https://example.com/image.jpg",
      "description": "Premium sedan with hybrid technology"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "message": "Cars retrieved successfully"
}
```

#### Get Single Car

```http
GET /api/cars/:id
```

#### Search Cars

```http
GET /api/cars/search?q=Toyota Camry&page=1&limit=10
```

#### Get Car Brands

```http
GET /api/cars/brands
```

**Response:**

```json
{
  "success": true,
  "data": ["Toyota", "Honda", "Maruti", "Hyundai", "BMW"],
  "message": "Brands retrieved successfully"
}
```

#### Get Filter Options

```http
GET /api/cars/filters
```

**Response:**

```json
{
  "success": true,
  "data": {
    "brands": ["Toyota", "Honda", "Maruti"],
    "fuelTypes": ["Petrol", "Diesel", "Electric"],
    "transmissions": ["Manual", "Automatic", "CVT"],
    "bodyTypes": ["Sedan", "SUV", "Hatchback"],
    "years": [2024, 2023, 2022, 2021, 2020],
    "priceRange": {
      "min_price": "500000",
      "max_price": "5000000"
    }
  },
  "message": "Filter options retrieved successfully"
}
```

### Health Check

```http
GET /health
```

## 🗄️ Database Schema (MongoDB)

### Users Collection

```javascript
{
  _id: ObjectId,           // Auto-generated MongoDB ID
  username: String,        // Unique, 3-50 characters
  email: String,          // Unique, validated email format
  password_hash: String,   // Bcrypt hashed password
  created_at: Date,       // Auto timestamp
  updated_at: Date        // Auto timestamp
}
```

### Cars Collection

```javascript
{
  _id: ObjectId,          // Auto-generated MongoDB ID (exposed as 'id' in API)
  brand: String,          // Required, max 100 characters
  model: String,          // Required, max 100 characters
  variant: String,        // Optional, max 200 characters
  year: Number,           // Required, 1900 to current year + 1
  price: Number,          // Required, positive number
  fuel_type: String,      // Optional, max 50 characters
  transmission: String,   // Optional, max 50 characters
  mileage: String,        // Optional, max 50 characters
  engine_cc: String,      // Optional, max 50 characters
  power_bhp: String,      // Optional, max 50 characters
  seats: Number,          // Optional, 1-50
  body_type: String,      // Optional, max 50 characters
  image_url: String,      // Optional, max 500 characters
  description: String,    // Optional, unlimited length
  created_at: Date,       // Auto timestamp
  updated_at: Date        // Auto timestamp
}
```

### Indexes

- **Users**: `email` (unique), `username` (unique)
- **Cars**: `brand`, `price`, `year`, `fuel_type`, `transmission`, `body_type`
- **Text Search**: `brand`, `model`, `variant` (for search functionality)

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run import-data <file-path>` - Import car data from Excel file
- `npm run create-sample` - Create sample Excel file for testing
- `npm run db:setup` - Initialize database tables
- `npm run db:reset` - Reset database (drop and recreate tables)

## 📁 Project Structure

```
autoassist_backend/
├── src/
│   ├── config/          # Database and app configuration
│   │   ├── config.js    # Environment configuration
│   │   └── database.js  # MongoDB connection and setup
│   ├── controllers/    # Route controllers
│   │   ├── authController.js
│   │   └── carController.js
│   ├── models/          # Database models
│   │   ├── User.js
│   │   └── Car.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   └── cars.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js      # Authentication and error handling
│   │   └── validation.js # Input validation
│   ├── utils/           # Utility functions
│   │   └── jwt.js      # JWT token utilities
│   └── scripts/         # Data import scripts
│       └── import-cars.js
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── server.js            # Main application entry point
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Prevents abuse of authentication endpoints
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **SQL Injection Prevention**: Parameterized queries
- **Request Size Limiting**: Prevents large payload attacks

## 🚀 Data Import

To import car data from an Excel file:

1. Place your Excel file in the project directory
2. Run the import script:
   ```bash
   npm run import-data ./path/to/your/file.xlsx
   ```

The script will:

- Read the Excel file
- Clean and validate the data
- Map columns to database fields
- Bulk insert into MongoDB

**Expected Excel Format:**

- Columns: Brand, Model, Variant, Year, Price, Fuel Type, Transmission, Mileage, Engine CC, Power BHP, Seats, Body Type, Image URL, Description
- First row should contain headers
- Data should start from the second row

## 🧪 Testing

### Quick Testing Setup

1. **Create sample data and test the API:**

   ```bash
   # Create sample Excel file
   npm run create-sample

   # Import sample data
   npm run import-data ./data/sample-cars.xlsx

   # Start server
   npm run dev

   # Test health endpoint
   curl http://localhost:5000/health
   ```

2. **For comprehensive testing, see [TESTING.md](./TESTING.md)**

### Using Postman

1. Import the AutoAssist API collection: `AutoAssist-API.postman_collection.json`
2. Set the `baseUrl` variable to `http://localhost:5000`
3. Run the authentication requests first to get a token
4. Use the token for authenticated endpoints

## 🐛 Error Handling

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "pagination": {} // For list endpoints
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message",
  "details": {} // Only in development mode
}
```

## 🔧 Environment Variables

| Variable          | Description                     | Default               |
| ----------------- | ------------------------------- | --------------------- |
| `PORT`            | Server port                     | 5000                  |
| `NODE_ENV`        | Environment                     | development           |
| `DATABASE_URL`    | MongoDB Atlas connection string | -                     |
| `JWT_SECRET`      | JWT secret key                  | -                     |
| `JWT_EXPIRE_TIME` | Token expiry time               | 7d                    |
| `FRONTEND_URL`    | Frontend URL for CORS           | http://localhost:3000 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**AutoAssist Backend API** - Built with ❤️ for the AutoAssist Car Marketplace
