# 🚀 Deployment Guide

This guide covers various deployment options for the Mystical Tarot Bot, from local development to production environments.

## 📋 Prerequisites

Before deploying, ensure you have:

- **Telegram Bot Token**: Get from [@BotFather](https://t.me/botfather)
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/)
- **Node.js**: Version 16 or higher
- **Git**: For version control

## 🏠 Local Development

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd tarot-telegram-bot

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Environment Variables
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
DATABASE_PATH=./data/tarot_bot.db
PORT=3000
NODE_ENV=development
MAX_READINGS_PER_DAY=10
MAX_READINGS_PER_HOUR=3
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  tarot-bot:
    build: .
    ports:
      - "3000:3000"
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_MODEL=gpt-3.5-turbo
      - DATABASE_PATH=./data/tarot_bot.db
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### Docker Commands
```bash
# Build and run with Docker
docker build -t tarot-telegram-bot .
docker run -p 3000:3000 --env-file .env tarot-telegram-bot

# Or use Docker Compose
docker-compose up -d
```

## ☁️ Cloud Deployment

### Railway

Railway is a modern platform that makes deployment simple.

#### Steps:
1. **Connect Repository**
   - Go to [Railway](https://railway.app/)
   - Connect your GitHub repository
   - Select the tarot-telegram-bot repository

2. **Configure Environment**
   - Add environment variables:
     - `TELEGRAM_BOT_TOKEN`
     - `OPENAI_API_KEY`
     - `OPENAI_MODEL=gpt-3.5-turbo`
     - `NODE_ENV=production`

3. **Deploy**
   - Railway will automatically deploy on push
   - Monitor logs in the Railway dashboard

#### Railway Configuration
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Heroku

#### Steps:
1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-tarot-bot-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set TELEGRAM_BOT_TOKEN=your_token
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### Heroku Configuration
```json
{
  "name": "tarot-telegram-bot",
  "version": "1.0.0",
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node src/index.js",
    "postinstall": "npm run db:init"
  }
}
```

### DigitalOcean

#### Steps:
1. **Create Droplet**
   - Choose Ubuntu 22.04 LTS
   - Select Node.js one-click app
   - Choose appropriate size (1GB RAM minimum)

2. **Connect to Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y

   # Install Node.js (if not already installed)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs

   # Install PM2
   npm install -g pm2
   ```

4. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd tarot-telegram-bot

   # Install dependencies
   npm install

   # Set up environment
   cp .env.example .env
   nano .env  # Edit with your API keys

   # Start with PM2
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

#### PM2 Ecosystem Configuration
```javascript
module.exports = {
  apps: [{
    name: 'tarot-telegram-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### AWS EC2

#### Steps:
1. **Launch EC2 Instance**
   - Choose Amazon Linux 2 AMI
   - Select t2.micro (free tier) or larger
   - Configure security group to allow SSH

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install Node.js**
   ```bash
   # Install Node.js 18
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs

   # Install PM2
   sudo npm install -g pm2
   ```

4. **Deploy Application**
   ```bash
   # Clone and setup (same as DigitalOcean)
   git clone <repository-url>
   cd tarot-telegram-bot
   npm install
   cp .env.example .env
   # Edit .env file
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## 🔧 Production Configuration

### Environment Variables (Production)
```env
TELEGRAM_BOT_TOKEN=your_production_bot_token
OPENAI_API_KEY=your_production_openai_key
OPENAI_MODEL=gpt-3.5-turbo
DATABASE_PATH=./data/tarot_bot.db
PORT=3000
NODE_ENV=production
MAX_READINGS_PER_DAY=20
MAX_READINGS_PER_HOUR=5
```

### Security Best Practices

#### 1. Environment Variables
- Never commit `.env` files to version control
- Use platform-specific secret management
- Rotate API keys regularly

#### 2. Database Security
```bash
# Set proper permissions for database file
chmod 600 data/tarot_bot.db
chown node:node data/tarot_bot.db
```

#### 3. Process Management
```bash
# Use PM2 for production
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Monitor application
pm2 monit
pm2 logs tarot-telegram-bot
```

### Monitoring & Logging

#### PM2 Monitoring
```bash
# View application status
pm2 status

# Monitor resources
pm2 monit

# View logs
pm2 logs tarot-telegram-bot

# Restart application
pm2 restart tarot-telegram-bot
```

#### Health Check Endpoint
The bot includes a health check endpoint at `/health`:
```bash
curl http://localhost:3000/health
# Returns: {"status": "ok", "timestamp": "2024-01-01T00:00:00.000Z"}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Railway
      uses: railway/deploy@v1
      with:
        railway_token: ${{ secrets.RAILWAY_TOKEN }}
        service: tarot-telegram-bot
```

### Environment Setup
1. Add secrets to GitHub repository
2. Configure deployment triggers
3. Set up monitoring and alerts

## 📊 Performance Optimization

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_readings_user_id ON readings(user_id);
CREATE INDEX idx_readings_created_at ON readings(created_at);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
```

### Memory Management
```javascript
// In ecosystem.config.js
module.exports = {
  apps: [{
    name: 'tarot-telegram-bot',
    script: 'src/index.js',
    instances: 1,
    max_memory_restart: '512M',
    node_args: '--max-old-space-size=512'
  }]
};
```

### Rate Limiting
```javascript
// Configure rate limits based on your OpenAI plan
const RATE_LIMITS = {
  requests_per_minute: 60,
  requests_per_day: 1000,
  tokens_per_minute: 90000
};
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Bot Not Responding
```bash
# Check if bot is running
pm2 status

# Check logs for errors
pm2 logs tarot-telegram-bot

# Restart bot
pm2 restart tarot-telegram-bot
```

#### 2. Database Issues
```bash
# Check database file permissions
ls -la data/tarot_bot.db

# Recreate database if corrupted
rm data/tarot_bot.db
npm run db:init
```

#### 3. API Rate Limits
```bash
# Check OpenAI API usage
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage
```

#### 4. Memory Issues
```bash
# Monitor memory usage
pm2 monit

# Check Node.js memory
node --max-old-space-size=512 src/index.js
```

### Log Analysis
```bash
# View recent logs
pm2 logs tarot-telegram-bot --lines 100

# Filter error logs
pm2 logs tarot-telegram-bot | grep ERROR

# Monitor in real-time
pm2 logs tarot-telegram-bot --follow
```

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] Database file permissions set
- [ ] API keys rotated regularly
- [ ] HTTPS enabled (if applicable)
- [ ] Rate limiting configured
- [ ] Monitoring and alerting set up
- [ ] Regular backups scheduled
- [ ] Security updates applied

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer for multiple instances
- Implement session sharing
- Consider database clustering

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching strategies

### Cost Optimization
- Monitor API usage
- Use appropriate instance sizes
- Implement auto-scaling policies

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review logs for error messages
3. Verify environment variables
4. Test locally before deploying
5. Create an issue on GitHub

---

**🚀 Happy Deploying! May your bot bring mystical guidance to users worldwide! ✨**

