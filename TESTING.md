# AutoAssist Backend API Testing Guide

This guide provides comprehensive testing instructions for the AutoAssist Backend API.

## 🚀 Quick Start Testing

### 1. Setup Environment

```bash
# Copy environment template
cp env.example .env

# Update .env with your database credentials
# Then run setup
./setup.sh
```

### 2. Create Sample Data

```bash
# Create sample Excel file
npm run create-sample

# Import sample data
npm run import-data ./data/sample-cars.xlsx
```

### 3. Start Server

```bash
# Development mode
npm run dev

# Or production mode
npm start
```

## 🧪 Manual API Testing

### Health Check

```bash
curl http://localhost:5000/health
```

**Expected Response:**

```json
{
  "success": true,
  "message": "AutoAssist Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### Authentication Testing

#### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

#### 2. Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Save the token from the response for authenticated requests.**

#### 3. Verify Token

```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Get User Profile

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Cars API Testing

#### 1. Get All Cars

```bash
curl http://localhost:5000/api/cars
```

#### 2. Get Cars with Pagination

```bash
curl "http://localhost:5000/api/cars?page=1&limit=5"
```

#### 3. Filter Cars by Brand

```bash
curl "http://localhost:5000/api/cars?brand=Toyota"
```

#### 4. Filter Cars by Price Range

```bash
curl "http://localhost:5000/api/cars?price_min=500000&price_max=2000000"
```

#### 5. Filter Cars by Year

```bash
curl "http://localhost:5000/api/cars?year=2020"
```

#### 6. Filter Cars by Fuel Type

```bash
curl "http://localhost:5000/api/cars?fuel_type=Petrol"
```

#### 7. Sort Cars by Price (Ascending)

```bash
curl "http://localhost:5000/api/cars?sort_by=price&sort_order=asc"
```

#### 8. Search Cars

```bash
curl "http://localhost:5000/api/cars/search?q=Toyota"
```

#### 9. Get Single Car

```bash
curl http://localhost:5000/api/cars/1
```

#### 10. Get Car Brands

```bash
curl http://localhost:5000/api/cars/brands
```

#### 11. Get Filter Options

```bash
curl http://localhost:5000/api/cars/filters
```

## 🔧 Advanced Testing Scenarios

### Complex Filtering

```bash
# Multiple filters combined
curl "http://localhost:5000/api/cars?brand=Toyota&price_min=1000000&price_max=2000000&year=2020&fuel_type=Petrol&sort_by=price&sort_order=asc"
```

### Error Testing

#### Invalid Car ID

```bash
curl http://localhost:5000/api/cars/99999
```

**Expected:** 404 Not Found

#### Invalid Authentication

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid_token"
```

**Expected:** 401 Unauthorized

#### Invalid Registration Data

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ab",
    "email": "invalid-email",
    "password": "123"
  }'
```

**Expected:** 400 Bad Request with validation errors

## 📊 Performance Testing

### Load Testing with Multiple Requests

```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl http://localhost:5000/api/cars &
done
wait
```

### Pagination Performance

```bash
# Test different page sizes
curl "http://localhost:5000/api/cars?limit=1"
curl "http://localhost:5000/api/cars?limit=50"
curl "http://localhost:5000/api/cars?limit=100"
```

## 🐛 Debugging Tips

### 1. Check Server Logs

The server logs all requests in development mode. Look for:

- Request/response details
- Database connection status
- Error messages

### 2. Database Connection

```bash
# Test database connection
npm run db:setup
```

### 3. Environment Variables

```bash
# Check if .env file exists and has correct values
cat .env
```

### 4. Port Conflicts

```bash
# Check if port 5000 is in use
lsof -i :5000
```

## 📝 Test Data Verification

### Verify Imported Data

```bash
# Check if cars were imported
curl http://localhost:5000/api/cars | jq '.data | length'

# Check specific car details
curl http://localhost:5000/api/cars/1 | jq '.data'
```

### Database Verification

```sql
-- Connect to PostgreSQL and run:
SELECT COUNT(*) FROM cars;
SELECT brand, model, year, price FROM cars LIMIT 5;
```

## 🚨 Common Issues and Solutions

### 1. Database Connection Failed

- **Issue:** Cannot connect to PostgreSQL
- **Solution:**
  - Ensure PostgreSQL is running
  - Check database credentials in .env
  - Verify database exists: `createdb autoassist_db`

### 2. Port Already in Use

- **Issue:** Port 5000 is occupied
- **Solution:**
  - Change PORT in .env file
  - Kill process using port: `kill $(lsof -t -i:5000)`

### 3. Import Data Failed

- **Issue:** Excel file import fails
- **Solution:**
  - Check file format (must be .xlsx)
  - Verify column names match expected format
  - Check file permissions

### 4. Authentication Errors

- **Issue:** JWT token validation fails
- **Solution:**
  - Check JWT_SECRET in .env
  - Ensure token is properly formatted
  - Verify token hasn't expired

## 📈 Monitoring and Metrics

### Health Monitoring

```bash
# Regular health checks
watch -n 5 'curl -s http://localhost:5000/health | jq'
```

### API Response Times

```bash
# Measure response time
time curl -s http://localhost:5000/api/cars > /dev/null
```

## 🎯 Success Criteria

Your backend is working correctly if:

✅ Health endpoint returns 200 OK  
✅ Authentication endpoints work (register/login)  
✅ Cars API returns data with proper pagination  
✅ Filtering and sorting work correctly  
✅ Search functionality returns relevant results  
✅ Error handling returns proper HTTP status codes  
✅ Database operations complete successfully  
✅ CORS is configured for frontend integration

## 📚 Additional Resources

- [Postman Collection](./AutoAssist-API.postman_collection.json) - Import this for GUI testing
- [API Documentation](./README.md) - Complete API reference
- [Database Schema](./data/README.md) - Data structure documentation
- [Setup Script](./setup.sh) - Automated setup script

---

**Happy Testing! 🚀**
