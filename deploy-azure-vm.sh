#!/bin/bash

# AutoAssist Backend Azure VM Deployment Script
echo "🚀 Deploying AutoAssist Backend to Azure VM..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing Docker..."
    
    # Update package index
    sudo apt-get update
    
    # Install Docker
    sudo apt-get install -y docker.io docker-compose
    
    # Start Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    echo "✅ Docker installed successfully"
    echo "⚠️  Please log out and log back in for Docker permissions to take effect"
else
    echo "✅ Docker is already installed"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it first."
    echo "Required environment variables:"
    echo "  - PORT=8000"
    echo "  - DATABASE_URL=your_mongodb_atlas_connection_string"
    echo "  - JWT_SECRET=your_jwt_secret"
    exit 1
fi

echo "✅ .env file found"

# Install Node.js if not present (for direct deployment option)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js installed"
fi

# Create deployment directory
DEPLOY_DIR="/opt/autoassist"
echo "📁 Creating deployment directory..."
sudo mkdir -p $DEPLOY_DIR
sudo chown $USER:$USER $DEPLOY_DIR

# Copy application files
echo "📋 Copying application files..."
rsync -av --exclude='node_modules' --exclude='.git' --exclude='*.log' --exclude='.env' ./ $DEPLOY_DIR/

# Navigate to deployment directory
cd $DEPLOY_DIR

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build and run with Docker Compose
echo "🐳 Building and starting Docker containers..."
sudo docker-compose -f docker-compose.atlas.yml up -d --build

# Check if containers are running
echo "🔍 Checking container status..."
sleep 5
if sudo docker-compose -f docker-compose.atlas.yml ps | grep -q "Up"; then
    echo "✅ AutoAssist Backend deployed successfully!"
    echo ""
    echo "🌐 Your backend is now running on:"
    echo "   - Local: http://localhost:8000"
    echo "   - External: http://$(curl -s ifconfig.me):8000"
    echo ""
    echo "🏥 Health check: http://$(curl -s ifconfig.me):8000/health"
    echo "📚 API endpoints: http://$(curl -s ifconfig.me):8000/api/cars"
    echo ""
    echo "📝 To view logs: sudo docker-compose -f docker-compose.atlas.yml logs -f"
    echo "🔄 To restart: sudo docker-compose -f docker-compose.atlas.yml restart"
    echo "🛑 To stop: sudo docker-compose -f docker-compose.atlas.yml down"
else
    echo "❌ Deployment failed. Checking logs..."
    sudo docker-compose -f docker-compose.atlas.yml logs
    exit 1
fi
