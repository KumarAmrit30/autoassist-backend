#!/bin/bash

# Azure Deployment Script for AutoAssist Backend
# This script helps deploy your Node.js backend to Azure App Service

set -e

echo "🚀 AutoAssist Backend Azure Deployment Script"
echo "=============================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo "❌ Please login to Azure CLI first:"
    echo "   az login"
    exit 1
fi

# Configuration
RESOURCE_GROUP="autoassist-rg"
APP_NAME="autoassist-backend"
# Try multiple regions in order of preference
LOCATIONS=("West US 2" "Central US" "East US 2" "West Europe" "Southeast Asia")
DATABASE_NAME="autoassist-db"
POSTGRES_SERVER="autoassist-postgres"

# Function to find available location
find_available_location() {
    for location in "${LOCATIONS[@]}"; do
        echo "🔍 Checking location: $location"
        if az account list-locations --query "[?name=='$location'].name" -o tsv | grep -q "$location"; then
            echo "✅ Location '$location' is available"
            echo "$location"
            return 0
        else
            echo "❌ Location '$location' is not available"
        fi
    done
    echo "❌ No suitable location found"
    return 1
}

# Find available location
LOCATION=$(find_available_location)
if [ $? -ne 0 ]; then
    echo "❌ Could not find an available location. Please contact Azure support."
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   App Name: $APP_NAME"
echo "   Location: $LOCATION"
echo "   Database Server: $POSTGRES_SERVER"
echo ""

# Create resource group
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# Create PostgreSQL server
echo "🗄️ Creating PostgreSQL server..."
az postgres flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $POSTGRES_SERVER \
    --location "$LOCATION" \
    --admin-user autoassistadmin \
    --admin-password $(openssl rand -base64 32) \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --public-access 0.0.0.0 \
    --storage-size 32

# Create database
echo "📊 Creating database..."
az postgres flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $POSTGRES_SERVER \
    --database-name $DATABASE_NAME

# Create App Service plan
echo "🏗️ Creating App Service plan..."
az appservice plan create \
    --name "${APP_NAME}-plan" \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --sku B1 \
    --is-linux

# Create web app
echo "🌐 Creating web app..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan "${APP_NAME}-plan" \
    --name $APP_NAME \
    --runtime "NODE|18-lts"

# Get database connection details
DB_HOST=$(az postgres flexible-server show --resource-group $RESOURCE_GROUP --name $POSTGRES_SERVER --query "fullyQualifiedDomainName" -o tsv)
DB_PASSWORD=$(az postgres flexible-server show --resource-group $RESOURCE_GROUP --name $POSTGRES_SERVER --query "administratorLoginPassword" -o tsv)

# Set environment variables
echo "🔧 Setting environment variables..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        NODE_ENV=production \
        PORT=5000 \
        DATABASE_URL="postgresql://autoassistadmin:${DB_PASSWORD}@${DB_HOST}:5432/${DATABASE_NAME}?sslmode=require" \
        DB_HOST="${DB_HOST}" \
        DB_PORT=5432 \
        DB_NAME="${DATABASE_NAME}" \
        DB_USER=autoassistadmin \
        DB_PASSWORD="${DB_PASSWORD}" \
        JWT_SECRET="$(openssl rand -base64 64)" \
        JWT_EXPIRE_TIME=7d \
        FRONTEND_URL="https://your-frontend-domain.com" \
        RATE_LIMIT_WINDOW_MS=900000 \
        RATE_LIMIT_MAX_REQUESTS=100

echo ""
echo "✅ Azure resources created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy your code using Azure CLI:"
echo "   az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src autoassist-backend.zip"
echo ""
echo "2. Or deploy using Git:"
echo "   az webapp deployment source config --resource-group $RESOURCE_GROUP --name $APP_NAME --repo-url <your-git-repo> --branch main --manual-integration"
echo ""
echo "3. Your app will be available at:"
echo "   https://$APP_NAME.azurewebsites.net"
echo ""
echo "4. Database connection details:"
echo "   Host: $DB_HOST"
echo "   Database: $DATABASE_NAME"
echo "   Username: autoassistadmin"
echo "   Password: [stored in App Service settings]"
echo ""
echo "🔗 Useful commands:"
echo "   View logs: az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "   Restart app: az webapp restart --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "   Delete resources: az group delete --name $RESOURCE_GROUP --yes"
