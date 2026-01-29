# Calendar Maps - Deployment Guide

## Deployment Strategies

This guide covers multiple deployment options for Calendar Maps.

## Table of Contents

1. [Vercel](#vercel-recommended)
2. [Docker](#docker)
3. [Traditional VPS](#traditional-vps)
4. [AWS](#aws)
5. [Production Checklist](#production-checklist)
6. [Environment Setup](#environment-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Vercel (Recommended)

Vercel is the optimal choice for Next.js applications and provides seamless integration.

### Prerequisites

- GitHub account with repository
- Vercel account (free tier available)
- Google Cloud credentials

### Steps

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Select your repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.local`:

   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URL=https://your-domain.vercel.app/api/auth/callback/google
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
   GOOGLE_MAPS_API_KEY=...
   ```

4. **Update OAuth Redirect URLs**
   - Go to Google Cloud Console
   - Update OAuth redirect URI:
     ```
     https://your-domain.vercel.app/api/auth/callback/google
     ```

5. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Get your deployment URL

6. **Custom Domain** (Optional)
   - In Vercel Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed
   - Update OAuth URLs again in Google Cloud

### Features

- ✅ Automatic deployments from git
- ✅ HTTPS by default
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Environment variables
- ✅ Continuous monitoring
- ✅ Free tier available

### Costs

- Free: Up to 100 GB bandwidth/month
- Pro: $20/month + overages
- Enterprise: Custom pricing

---

## Docker

Deploy in Docker containers on any infrastructure.

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start
CMD ["npm", "start"]
```

### Build and Run Locally

```bash
# Build image
docker build -t calendar-maps:latest .

# Run container
docker run -p 3000:3000 \
  -e GOOGLE_CLIENT_ID="..." \
  -e GOOGLE_CLIENT_SECRET="..." \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..." \
  calendar-maps:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOOGLE_REDIRECT_URL: https://your-domain.com/api/auth/callback/google
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY}
    restart: unless-stopped
    networks:
      - calendar-maps

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - calendar-maps

networks:
  calendar-maps:
    driver: bridge
```

### Deploy to Docker Host

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone <repo-url> calendar-maps
cd calendar-maps

# Create .env file with credentials
echo "GOOGLE_CLIENT_ID=..." >> .env

# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f app
```

---

## Traditional VPS

Deploy on Linux VPS using PM2 or systemd.

### Prerequisites

- Linux VPS (Ubuntu 20.04+ recommended)
- Node.js 18+
- Nginx or Apache
- SSL certificate (Let's Encrypt)

### Setup Steps

1. **SSH into Server**
   ```bash
   ssh root@your-server.com
   ```

2. **Install Dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y nginx
   sudo apt-get install -y certbot python3-certbot-nginx
   ```

3. **Clone Application**
   ```bash
   cd /var/www
   git clone <repo-url> calendar-maps
   cd calendar-maps
   npm install
   npm run build
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit with production values
   nano .env.local
   ```

5. **Setup Nginx**
   ```nginx
   # /etc/nginx/sites-available/calendar-maps
   upstream nextjs {
     server localhost:3000;
   }

   server {
     listen 80;
     server_name your-domain.com;
     return 301 https://$server_name$request_uri;
   }

   server {
     listen 443 ssl http2;
     server_name your-domain.com;

     ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

     client_max_body_size 50M;

     location / {
       proxy_pass http://nextjs;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/calendar-maps /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Get SSL Certificate**
   ```bash
   sudo certbot certonly --nginx -d your-domain.com
   sudo systemctl restart nginx
   ```

7. **Setup PM2**
   ```bash
   sudo npm install -g pm2
   cd /var/www/calendar-maps
   pm2 start npm --name "calendar-maps" -- start
   pm2 startup
   pm2 save
   ```

8. **Systemd Service** (Alternative)
   ```ini
   # /etc/systemd/system/calendar-maps.service
   [Unit]
   Description=Calendar Maps Application
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/calendar-maps
   ExecStart=/usr/bin/npm start
   Restart=on-failure
   RestartSec=10
   StandardOutput=inherit
   StandardError=inherit
   Environment="NODE_ENV=production"

   [Install]
   WantedBy=multi-user.target
   ```

   Enable and start:
   ```bash
   sudo systemctl enable calendar-maps
   sudo systemctl start calendar-maps
   ```

---

## AWS

Deploy using AWS services.

### Using Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize Beanstalk**
   ```bash
   eb init -p node.js-18 calendar-maps
   ```

3. **Create Environment**
   ```bash
   eb create calendar-maps-prod
   ```

4. **Set Environment Variables**
   ```bash
   eb setenv GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... ...
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

### Using ECS + Fargate

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name calendar-maps
   ```

2. **Build and Push Image**
   ```bash
   docker build -t calendar-maps:latest .
   docker tag calendar-maps:latest $ACCOUNT.dkr.ecr.$REGION.amazonaws.com/calendar-maps:latest
   docker push $ACCOUNT.dkr.ecr.$REGION.amazonaws.com/calendar-maps:latest
   ```

3. **Create ECS Task Definition**
   - Configure container with ECR image
   - Set environment variables
   - Configure port mapping (3000)

4. **Create Fargate Service**
   - Select ALB
   - Configure target group
   - Set desired count to 2+ for HA

---

## Production Checklist

### Security

- [ ] All environment variables configured securely
- [ ] OAuth URLs updated in Google Cloud
- [ ] SSL/TLS certificate installed
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] API keys restricted to specific domains
- [ ] Secrets encrypted at rest

### Performance

- [ ] CDN configured (Cloudflare, AWS CloudFront)
- [ ] Database optimized and indexed
- [ ] Caching headers configured
- [ ] Images optimized
- [ ] Code minified and bundled
- [ ] Load testing completed

### Reliability

- [ ] Automated backups configured
- [ ] Health checks enabled
- [ ] Auto-scaling configured (if applicable)
- [ ] Error monitoring setup (Sentry)
- [ ] Log aggregation configured (CloudWatch, ELK)
- [ ] Uptime monitoring enabled

### Monitoring

- [ ] Application metrics tracked
- [ ] Error rate monitoring
- [ ] API response time monitoring
- [ ] Database performance monitoring
- [ ] Disk space monitoring
- [ ] Memory usage monitoring

### Deployment

- [ ] CI/CD pipeline configured
- [ ] Automated testing enabled
- [ ] Staging environment mirrors production
- [ ] Rollback procedure documented
- [ ] Deployment process documented

---

## Environment Setup

### Production Environment Variables

```env
NODE_ENV=production

# OAuth
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_client_secret
GOOGLE_REDIRECT_URL=https://your-domain.com/api/auth/callback/google

# APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=prod_maps_key
GOOGLE_MAPS_API_KEY=prod_maps_key

# Database
DATABASE_URL=postgresql://user:pass@db.example.com:5432/calendar_maps_prod

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
LOG_LEVEL=info
DEBUG=false
```

---

## Monitoring & Maintenance

### Application Logs

```bash
# Vercel
vercel logs

# Docker
docker-compose logs -f app

# VPS
pm2 logs calendar-maps
# or
journalctl -u calendar-maps -f
```

### Health Checks

```bash
# Check application health
curl https://your-domain.com/api/ping

# Check API
curl https://your-domain.com/api/events?daysAhead=1
```

### Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart (VPS)
pm2 restart calendar-maps
# or
sudo systemctl restart calendar-maps
```

### Backup & Recovery

```bash
# Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup-20240215.sql
```

---

## Troubleshooting

### High Memory Usage

```bash
# Check processes
ps aux | grep node

# Monitor memory
free -h
watch free -h
```

### Disk Space Issues

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a

# Clean npm cache
npm cache clean --force
```

### Performance Issues

- Check server resources
- Review slow API logs
- Analyze database queries
- Optimize geocoding cache
- Consider vertical/horizontal scaling

### OAuth Failures

- Verify redirect URLs match exactly
- Check client ID and secret
- Clear browser cookies
- Review Google Cloud logs

---

## References

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
