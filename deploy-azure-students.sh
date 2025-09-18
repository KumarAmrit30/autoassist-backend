#!/bin/bash

# Azure for Students Deployment Script
# This script uses regions and configurations that work with student subscriptions

set -e

echo "🎓 AutoAssist Backend Azure Deployment Script (Student-Friendly)"
echo "================================================================"

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

# Configuration - Using student-friendly settings
RESOURCE_GROUP="AutoAssist"
APP_NAME="autoassist-backend"
LOCATION="West US 2"  # Most commonly allowed for students
DATABASE_NAME="autoassist-db"
POSTGRES_SERVER="autoassist-postgres"

echo "📋 Deployment Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   App Name: $APP_NAME"
echo "   Location: $LOCATION"
echo "   Database Server: $POSTGRES_SERVER"
echo ""

# Create resource group
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# Try PostgreSQL Single Server first (more compatible with student subscriptions)
echo "🗄️ Creating PostgreSQL Single Server (student-friendly)..."
az postgres server create \
    --resource-group $RESOURCE_GROUP \
    --name $POSTGRES_SERVER \
    --location "$LOCATION" \
    --admin-user autoassistadmin \
    --admin-password $(openssl rand -base64 32) \
    --sku-name B_Gen5_1 \
    --version 11

# Create database
echo "📊 Creating database..."
az postgres db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $POSTGRES_SERVER \
    --name $DATABASE_NAME

# Create App Service plan
echo "🏗️ Creating App Service plan..."
az appservice plan create \
    --name "${APP_NAME}-plan" \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --sku F1 \
    --is-linux

# Create web app
echo "🌐 Creating web app..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan "${APP_NAME}-plan" \
    --name $APP_NAME \
    --runtime "NODE|18-lts"

# Get database connection details
DB_HOST=$(az postgres server show --resource-group $RESOURCE_GROUP --name $POSTGRES_SERVER --query "fullyQualifiedDomainName" -o tsv)
DB_PASSWORD=$(az postgres server show --resource-group $RESOURCE_GROUP --name $POSTGRES_SERVER --query "administratorLoginPassword" -o tsv)

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
echo "2. Your app will be available at:"
echo "   https://$APP_NAME.azurewebsites.net"
echo ""
echo "3. Database connection details:"
echo "   Host: $DB_HOST"
echo "   Database: $DATABASE_NAME"
echo "   Username: autoassistadmin"
echo "   Password: [stored in App Service settings]"
echo ""
echo "🔗 Useful commands:"
echo "   View logs: az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "   Restart app: az webapp restart --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "   Delete resources: az group delete --name $RESOURCE_GROUP --yes"
