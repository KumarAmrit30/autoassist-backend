#!/bin/bash

# Azure Deployment Verification Script
# This script verifies that your Azure deployment is working correctly

set -e

echo "🔍 AutoAssist Backend Deployment Verification"
echo "============================================="

# Configuration
RESOURCE_GROUP="autoassist-rg"
APP_NAME="autoassist-backend"
APP_URL="https://${APP_NAME}.azurewebsites.net"

echo "📋 Verification Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   App Name: $APP_NAME"
echo "   App URL: $APP_URL"
echo ""

# Check if Azure CLI is available
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo "❌ Please login to Azure CLI first: az login"
    exit 1
fi

# Check if resource group exists
echo "🔍 Checking resource group..."
if ! az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo "❌ Resource group '$RESOURCE_GROUP' not found"
    echo "   Please run the deployment script first: ./deploy-azure.sh"
    exit 1
fi
echo "✅ Resource group exists"

# Check if web app exists
echo "🔍 Checking web app..."
if ! az webapp show --resource-group $RESOURCE_GROUP --name $APP_NAME &> /dev/null; then
    echo "❌ Web app '$APP_NAME' not found"
    exit 1
fi
echo "✅ Web app exists"

# Check app status
echo "🔍 Checking app status..."
APP_STATE=$(az webapp show --resource-group $RESOURCE_GROUP --name $APP_NAME --query "state" -o tsv)
if [ "$APP_STATE" != "Running" ]; then
    echo "⚠️  App is not running (State: $APP_STATE)"
    echo "   Attempting to start..."
    az webapp start --resource-group $RESOURCE_GROUP --name $APP_NAME
    sleep 10
else
    echo "✅ App is running"
fi

# Check health endpoint
echo "🔍 Checking health endpoint..."
if curl -f -s "$APP_URL/health" > /dev/null; then
    echo "✅ Health endpoint is responding"
else
    echo "❌ Health endpoint is not responding"
    echo "   URL: $APP_URL/health"
fi

# Check API endpoints
echo "🔍 Checking API endpoints..."
if curl -f -s "$APP_URL/api" > /dev/null; then
    echo "✅ API root endpoint is responding"
else
    echo "❌ API root endpoint is not responding"
fi

# Check database connection
echo "🔍 Checking database connection..."
DB_CONNECTION=$(az webapp config appsettings list --resource-group $RESOURCE_GROUP --name $APP_NAME --query "[?name=='DATABASE_URL'].value" -o tsv)
if [ -n "$DB_CONNECTION" ]; then
    echo "✅ Database connection string is configured"
else
    echo "❌ Database connection string is not configured"
fi

# Get app logs (last 10 lines)
echo "🔍 Checking recent logs..."
echo "Recent logs:"
az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME --num-lines 10 2>/dev/null || echo "   No recent logs available"

echo ""
echo "📊 Deployment Summary:"
echo "   App URL: $APP_URL"
echo "   Health Check: $APP_URL/health"
echo "   API Base: $APP_URL/api"
echo "   Auth Endpoint: $APP_URL/api/auth"
echo "   Cars Endpoint: $APP_URL/api/cars"
echo ""

echo "🔗 Useful Commands:"
echo "   View logs: az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "   Restart app: az webapp restart --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "   Open in browser: open $APP_URL"
echo ""

echo "✅ Verification complete!"
