#!/bin/bash

# AutoAssist Backend Test Script
echo "🧪 Testing AutoAssist Backend Setup..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "✅ .env file created. Please update database credentials."
fi

# Test if server can start
echo "🚀 Testing server startup..."
timeout 10s npm start > /dev/null 2>&1 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Test health endpoint
echo "🏥 Testing health endpoint..."
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Health endpoint is working"
else
    echo "❌ Health endpoint failed"
fi

# Test API endpoints
echo "🔗 Testing API endpoints..."

# Test root endpoint
if curl -s http://localhost:5000/ > /dev/null; then
    echo "✅ Root endpoint is working"
else
    echo "❌ Root endpoint failed"
fi

# Test cars endpoint
if curl -s http://localhost:5000/api/cars > /dev/null; then
    echo "✅ Cars endpoint is working"
else
    echo "❌ Cars endpoint failed"
fi

# Test brands endpoint
if curl -s http://localhost:5000/api/cars/brands > /dev/null; then
    echo "✅ Brands endpoint is working"
else
    echo "❌ Brands endpoint failed"
fi

# Clean up
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 Backend test completed!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database credentials"
echo "2. Run: npm run db:setup"
echo "3. Import car data: npm run import-data <path-to-excel-file>"
echo "4. Start development server: npm run dev"
