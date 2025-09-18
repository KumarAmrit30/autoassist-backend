#!/bin/bash

# Alternative Azure Deployment Script - Region-Aware
# This script automatically detects available regions and deploys accordingly

set -e

echo "🚀 AutoAssist Backend Azure Deployment Script (Region-Aware)"
echo "============================================================="

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
DATABASE_NAME="autoassist-db"
POSTGRES_SERVER="autoassist-postgres"

# Get available locations for your subscription
echo "🔍 Detecting available locations for your subscription..."
AVAILABLE_LOCATIONS=$(az account list-locations --query "[].name" -o tsv | head -10)

echo "Available locations:"
echo "$AVAILABLE_LOCATIONS"
echo ""

# Try to find a suitable location
SUITABLE_LOCATIONS=("West US 2" "Central US" "East US 2" "West Europe" "Southeast Asia" "North Europe" "East Asia")
LOCATION=""

for loc in "${SUITABLE_LOCATIONS[@]}"; do
    if echo "$AVAILABLE_LOCATIONS" | grep -q "^$loc$"; then
        LOCATION="$loc"
        echo "✅ Selected location: $LOCATION"
        break
    fi
done

if [ -z "$LOCATION" ]; then
    echo "❌ No suitable location found. Using first available location."
    LOCATION=$(echo "$AVAILABLE_LOCATIONS" | head -1)
    echo "📍 Using: $LOCATION"
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

# Create PostgreSQL server with retry logic
echo "🗄️ Creating PostgreSQL server..."
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if az postgres flexible-server create \
        --resource-group $RESOURCE_GROUP \
        --name $POSTGRES_SERVER \
        --location "$LOCATION" \
        --admin-user autoassistadmin \
        --admin-password $(openssl rand -base64 32) \
        --sku-name Standard_B1ms \
        --tier Burstable \
        --public-access 0.0.0.0 \
        --storage-size 32; then
        echo "✅ PostgreSQL server created successfully"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "❌ Attempt $RETRY_COUNT failed. Retrying..."
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            sleep 5
        else
            echo "❌ Failed to create PostgreSQL server after $MAX_RETRIES attempts"
            echo "💡 Alternative: Use Azure Database for PostgreSQL Single Server instead"
            echo "   Run: az postgres server create --resource-group $RESOURCE_GROUP --name $POSTGRES_SERVER --location \"$LOCATION\" --admin-user autoassistadmin --admin-password \$(openssl rand -base64 32) --sku-name B_Gen5_1"
            exit 1
        fi
    fi
done

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
