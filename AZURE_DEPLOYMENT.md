# Azure Deployment Guide for AutoAssist Backend

This guide will help you deploy your AutoAssist backend to Azure App Service with Azure Database for PostgreSQL.

## Prerequisites

1. **Azure CLI** installed and configured

   ```bash
   # Install Azure CLI
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

   # Login to Azure
   az login
   ```

2. **Git** repository (for automated deployment)
3. **Node.js 18+** (for local development)

## Deployment Options

### Option 1: Automated Deployment Script (Recommended)

1. **Run the deployment script:**

   ```bash
   ./deploy-azure.sh
   ```

2. **The script will:**

   - Create Azure Resource Group
   - Set up PostgreSQL Flexible Server
   - Create App Service Plan and Web App
   - Configure environment variables
   - Set up database connection

3. **Deploy your code:**

   ```bash
   # Create deployment package
   zip -r autoassist-backend.zip . -x "node_modules/*" ".git/*" "*.md" "data/*"

   # Deploy to Azure
   az webapp deployment source config-zip \
     --resource-group autoassist-rg \
     --name autoassist-backend \
     --src autoassist-backend.zip
   ```

### Option 2: Manual Azure Portal Setup

1. **Create Resource Group:**

   - Go to Azure Portal
   - Create new Resource Group: `autoassist-rg`

2. **Create PostgreSQL Database:**

   - Create "Azure Database for PostgreSQL - Flexible Server"
   - Server name: `autoassist-postgres`
   - Admin username: `autoassistadmin`
   - Password: Generate secure password
   - Database name: `autoassist-db`

3. **Create App Service:**

   - Create "Web App"
   - Runtime: Node.js 18 LTS
   - App Service Plan: B1 (Basic)

4. **Configure Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://autoassistadmin:PASSWORD@autoassist-postgres.postgres.database.azure.com:5432/autoassist-db?sslmode=require
   DB_HOST=autoassist-postgres.postgres.database.azure.com
   DB_PORT=5432
   DB_NAME=autoassist-db
   DB_USER=autoassistadmin
   DB_PASSWORD=YOUR_PASSWORD
   JWT_SECRET=your-64-character-secret-key
   JWT_EXPIRE_TIME=7d
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### Option 3: GitHub Actions (CI/CD)

1. **Set up GitHub Secrets:**

   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add secret: `AZUREAPPSERVICE_PUBLISHPROFILE`

2. **Get Publish Profile:**

   ```bash
   az webapp deployment list-publishing-profiles \
     --resource-group autoassist-rg \
     --name autoassist-backend \
     --xml
   ```

3. **Push to main branch:**
   - The GitHub Action will automatically deploy your code

## Post-Deployment Steps

1. **Verify Deployment:**

   ```bash
   # Check app status
   curl https://autoassist-backend.azurewebsites.net/health

   # View logs
   az webapp log tail --resource-group autoassist-rg --name autoassist-backend
   ```

2. **Import Sample Data:**

   ```bash
   # Connect to your app and run data import
   az webapp ssh --resource-group autoassist-rg --name autoassist-backend
   npm run import-data
   ```

3. **Configure Custom Domain (Optional):**
   ```bash
   az webapp config hostname add \
     --resource-group autoassist-rg \
     --name autoassist-backend \
     --hostname your-domain.com
   ```

## Environment Variables Reference

| Variable          | Description                  | Example                                           |
| ----------------- | ---------------------------- | ------------------------------------------------- |
| `NODE_ENV`        | Environment mode             | `production`                                      |
| `PORT`            | Server port                  | `5000`                                            |
| `DATABASE_URL`    | PostgreSQL connection string | `postgresql://user:pass@host:5432/db`             |
| `DB_HOST`         | Database host                | `autoassist-postgres.postgres.database.azure.com` |
| `DB_PORT`         | Database port                | `5432`                                            |
| `DB_NAME`         | Database name                | `autoassist-db`                                   |
| `DB_USER`         | Database username            | `autoassistadmin`                                 |
| `DB_PASSWORD`     | Database password            | `your-secure-password`                            |
| `JWT_SECRET`      | JWT signing secret           | `64-character-random-string`                      |
| `JWT_EXPIRE_TIME` | JWT expiration time          | `7d`                                              |
| `FRONTEND_URL`    | Frontend URL for CORS        | `https://your-frontend.com`                       |

## Monitoring and Maintenance

1. **View Application Logs:**

   ```bash
   az webapp log tail --resource-group autoassist-rg --name autoassist-backend
   ```

2. **Restart Application:**

   ```bash
   az webapp restart --resource-group autoassist-rg --name autoassist-backend
   ```

3. **Scale Application:**

   ```bash
   az appservice plan update \
     --resource-group autoassist-rg \
     --name autoassist-backend-plan \
     --sku S1
   ```

4. **Backup Database:**
   - Azure automatically handles PostgreSQL backups
   - Configure retention period in Azure Portal

## Troubleshooting

### Common Issues:

1. **Database Connection Failed:**

   - Check firewall rules in PostgreSQL server
   - Verify connection string format
   - Ensure SSL is enabled (`sslmode=require`)

2. **App Won't Start:**

   - Check Node.js version compatibility
   - Verify all environment variables are set
   - Check application logs for errors

3. **CORS Issues:**

   - Update `FRONTEND_URL` environment variable
   - Check CORS configuration in `server.js`

4. **Performance Issues:**
   - Scale up App Service plan
   - Optimize database queries
   - Enable Application Insights

### Useful Commands:

```bash
# Get app URL
az webapp show --resource-group autoassist-rg --name autoassist-backend --query "defaultHostName" -o tsv

# Update app settings
az webapp config appsettings set --resource-group autoassist-rg --name autoassist-backend --settings KEY=VALUE

# Delete all resources
az group delete --name autoassist-rg --yes
```

## Cost Optimization

1. **Use Basic App Service Plan** for development
2. **Scale down** during non-peak hours
3. **Use Burstable PostgreSQL** tier for development
4. **Enable auto-shutdown** for development environments

## Security Best Practices

1. **Use strong passwords** for database
2. **Enable SSL/TLS** for all connections
3. **Use Azure Key Vault** for sensitive secrets
4. **Enable Application Insights** for monitoring
5. **Configure firewall rules** for database access
6. **Regular security updates** for dependencies

## Support

- Azure Documentation: https://docs.microsoft.com/en-us/azure/
- App Service Documentation: https://docs.microsoft.com/en-us/azure/app-service/
- PostgreSQL Documentation: https://docs.microsoft.com/en-us/azure/postgresql/
