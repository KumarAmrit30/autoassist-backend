# AutoAssist Backend - Azure VM Deployment Guide

This guide will help you deploy the AutoAssist Backend on your Azure VM using Docker.

## Prerequisites

- ✅ Azure VM instance (Ubuntu 20.04+ recommended)
- ✅ MongoDB Atlas database (already set up)
- ✅ SSH access to your Azure VM
- ✅ Domain/IP address for your VM

## 🚀 Deployment Steps

### 1. Connect to Your Azure VM

```bash
ssh your-username@your-vm-ip-address
```

### 2. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Upload Your Project Files

**Option A: Using Git (Recommended)**

```bash
git clone https://github.com/your-username/autoassist-backend.git
cd autoassist-backend
```

**Option B: Using SCP from your local machine**

```bash
# Run this from your local machine
scp -r /path/to/autoassist_backend your-username@your-vm-ip:/home/your-username/
```

### 4. Create Environment File

Create a `.env` file in your project directory:

```bash
nano .env
```

Add the following content:

```env
# Server Configuration
PORT=8000

# Database Configuration (MongoDB Atlas)
DATABASE_URL=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/autoassist?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 5. Run the Deployment Script

```bash
chmod +x deploy-azure-vm.sh
./deploy-azure-vm.sh
```

This script will:

- Install Docker and Docker Compose
- Install Node.js
- Set up the application
- Build and start Docker containers

### 6. Configure Azure VM Networking

In your Azure portal:

1. Go to your VM → **Networking**
2. Add inbound port rule:
   - **Port**: 8000
   - **Protocol**: TCP
   - **Source**: Any
   - **Action**: Allow
   - **Name**: AutoAssist-Backend

### 7. Configure Firewall (if needed)

```bash
sudo ufw allow 8000
sudo ufw reload
```

## 🌐 Access Your Backend

After successful deployment:

- **Health Check**: `http://your-vm-ip:8000/health`
- **API Endpoints**: `http://your-vm-ip:8000/api/cars`
- **All Cars**: `http://your-vm-ip:8000/api/cars?limit=10`
- **Car Brands**: `http://your-vm-ip:8000/api/cars/brands`

## 📋 Management Commands

### View Logs

```bash
sudo docker-compose -f docker-compose.atlas.yml logs -f
```

### Restart Application

```bash
sudo docker-compose -f docker-compose.atlas.yml restart
```

### Stop Application

```bash
sudo docker-compose -f docker-compose.atlas.yml down
```

### Update Application

```bash
git pull origin main
sudo docker-compose -f docker-compose.atlas.yml down
sudo docker-compose -f docker-compose.atlas.yml up -d --build
```

## 🔧 Troubleshooting

### Check Container Status

```bash
sudo docker-compose -f docker-compose.atlas.yml ps
```

### Check Container Logs

```bash
sudo docker-compose -f docker-compose.atlas.yml logs autoassist-backend
```

### Test Database Connection

```bash
curl http://localhost:8000/health
```

### Check Port Availability

```bash
sudo netstat -tlnp | grep :8000
```

## 🛡️ Security Recommendations

1. **Change default JWT secret** in production
2. **Use HTTPS** with a reverse proxy (Nginx)
3. **Regularly update** your system and Docker images
4. **Monitor logs** for suspicious activity
5. **Backup your MongoDB Atlas** database regularly

## 📈 Production Optimizations

### Option 1: Using PM2 (Alternative to Docker)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name autoassist-backend

# Auto-restart on system reboot
pm2 startup
pm2 save
```

### Option 2: Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/autoassist
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🆘 Support

If you encounter issues:

1. Check the logs: `sudo docker-compose -f docker-compose.atlas.yml logs`
2. Verify MongoDB Atlas connection string
3. Ensure port 8000 is open in Azure security groups
4. Check firewall settings: `sudo ufw status`

## 📊 Monitoring

Monitor your application:

- **Health endpoint**: `/health` returns server status
- **System resources**: Use `htop` or Azure monitoring
- **Application logs**: Docker logs or PM2 logs
