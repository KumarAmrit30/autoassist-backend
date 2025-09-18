#!/bin/bash

# AutoAssist Backend Setup Script
echo "🚀 Setting up AutoAssist Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (>= 14.0.0) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
else
    echo "✅ .env file already exists"
fi

# Check if database exists
echo "🗄️ Checking database setup..."
DB_NAME=$(grep DB_NAME .env | cut -d'=' -f2)
DB_USER=$(grep DB_USER .env | cut -d'=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d'=' -f2)

if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  Please update your .env file with correct database credentials"
    echo "   Required: DB_NAME, DB_USER, DB_PASSWORD"
    exit 1
fi

# Test database connection
echo "🔌 Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d postgres -c "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Cannot connect to PostgreSQL. Please check your credentials and ensure PostgreSQL is running."
    exit 1
fi

echo "✅ Database connection successful"

# Create database if it doesn't exist
echo "🗄️ Creating database if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' created successfully"
else
    echo "ℹ️  Database '$DB_NAME' already exists or creation failed"
fi

# Initialize database tables
echo "🏗️ Initializing database tables..."
npm run db:setup

if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database tables"
    exit 1
fi

echo "✅ Database tables initialized successfully"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with correct database credentials if needed"
echo "2. Import car data: npm run import-data <path-to-excel-file>"
echo "3. Start development server: npm run dev"
echo "4. Test API endpoints using the Postman collection"
echo ""
echo "📚 For more information, see README.md"
echo "🔗 API will be available at: http://localhost:5000"
echo "🏥 Health check: http://localhost:5000/health"
