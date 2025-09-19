# PostgreSQL to MongoDB Atlas Migration Guide

This guide will help you migrate your AutoAssist backend from PostgreSQL to MongoDB Atlas.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up MongoDB Atlas

1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Whitelist your IP address

### 3. Update Environment Variables

Copy your MongoDB Atlas connection string to your `.env` file:

```bash
# Replace with your actual MongoDB Atlas connection string
DATABASE_URL=mongodb+srv://username:password@cluster0.mongodb.net/autoassist_db?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/autoassist_db?retryWrites=true&w=majority
DB_NAME=autoassist_db
```

### 4. Import Your Car Data

If you have existing car data in Excel format:

```bash
npm run import-data data/your-car-data.xlsx
```

### 5. Start the Server

```bash
npm start
```

## What Changed

### Database

- **Before**: PostgreSQL with raw SQL queries
- **After**: MongoDB Atlas with Mongoose ODM

### Models

- **Users**: Now uses Mongoose schema with automatic validation
- **Cars**: Enhanced with MongoDB indexes and text search capabilities

### Features Enhanced

- Better search functionality with MongoDB text indexes
- Improved data validation with Mongoose schemas
- Automatic timestamps and data transformation
- More flexible querying with MongoDB aggregation

## Data Structure Mapping

### Users Collection

```javascript
{
  _id: ObjectId,           // Auto-generated
  username: String,        // Unique, 3-50 chars
  email: String,          // Unique, validated email
  password_hash: String,   // Bcrypt hashed
  created_at: Date,       // Auto timestamp
  updated_at: Date        // Auto timestamp
}
```

### Cars Collection

```javascript
{
  _id: ObjectId,          // Auto-generated (exposed as 'id')
  brand: String,          // Required, max 100 chars
  model: String,          // Required, max 100 chars
  variant: String,        // Optional, max 200 chars
  year: Number,           // Required, 1900-current+1
  price: Number,          // Required, positive
  fuel_type: String,      // Optional, max 50 chars
  transmission: String,   // Optional, max 50 chars
  mileage: String,        // Optional, max 50 chars
  engine_cc: String,      // Optional, max 50 chars
  power_bhp: String,      // Optional, max 50 chars
  seats: Number,          // Optional, 1-50
  body_type: String,      // Optional, max 50 chars
  image_url: String,      // Optional, max 500 chars
  description: String,    // Optional, unlimited
  created_at: Date,       // Auto timestamp
  updated_at: Date        // Auto timestamp
}
```

## Performance Improvements

### Indexes Created

- `brand` (ascending)
- `price` (ascending)
- `year` (ascending)
- `fuel_type` (ascending)
- `transmission` (ascending)
- `body_type` (ascending)
- Text index on `brand`, `model`, `variant` for search

### Query Optimizations

- Parallel aggregation queries for filter options
- Efficient pagination with skip/limit
- Case-insensitive regex searches
- Lean queries for better performance

## API Compatibility

All existing API endpoints remain the same:

- `GET /api/cars` - Get cars with filtering/pagination
- `GET /api/cars/:id` - Get single car
- `GET /api/cars/brands` - Get unique brands
- `GET /api/cars/filters` - Get filter options
- `GET /api/cars/search` - Search cars
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token
- `GET /api/auth/profile` - Get profile

## Migration Benefits

1. **Scalability**: MongoDB Atlas auto-scales based on demand
2. **Performance**: Better indexing and query optimization
3. **Flexibility**: Schema-less design allows for easy data evolution
4. **Cloud-Native**: Managed service with automatic backups
5. **Search**: Enhanced text search capabilities
6. **Developer Experience**: Better debugging tools and monitoring

## Troubleshooting

### Connection Issues

- Ensure IP is whitelisted in MongoDB Atlas
- Check connection string format
- Verify database user credentials

### Data Import Issues

- Ensure Excel file has correct column headers
- Check for data type mismatches
- Verify required fields are present

### Performance Issues

- Monitor using MongoDB Atlas performance advisor
- Consider adding more indexes if needed
- Use lean queries for read-only operations

## Support

If you encounter any issues during migration, check:

1. MongoDB Atlas cluster status
2. Network connectivity
3. Environment variables
4. Application logs

The migration maintains all existing functionality while providing better performance and scalability.
