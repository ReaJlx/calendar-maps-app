# Calendar Maps App - Production Deployment Guide

## 🚀 Production Deployment

This guide covers deploying Calendar Maps App to production.

### Prerequisites
- Google Cloud Project with APIs enabled
- Vercel account or alternative hosting
- Custom domain (recommended)
- Environment variables configured

## Deployment Options

### Option 1: Vercel (Recommended)

#### Easiest Deployment
```bash
npm install -g vercel
vercel
```

#### Environment Variables
Set in Vercel Dashboard:
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URL=https://yourdomain.com/api/auth/callback/google
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
GOOGLE_MAPS_API_KEY=...
```

#### Custom Domain
1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS records
4. Update GOOGLE_REDIRECT_URL in env vars

### Option 2: Docker

#### Build Docker Image
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Run Container
```bash
docker build -t calendar-maps-app .
docker run -p 3000:3000 \
  -e GOOGLE_CLIENT_ID=... \
  -e GOOGLE_CLIENT_SECRET=... \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=... \
  calendar-maps-app
```

### Option 3: Self-Hosted

#### Server Requirements
- Node.js 18+
- npm or yarn
- HTTPS certificate (Let's Encrypt)
- Reverse proxy (nginx/apache)

#### Deployment Steps
```bash
# SSH into server
ssh user@server.com

# Clone repository
git clone https://github.com/ReaJlx/calendar-maps-app
cd calendar-maps-app

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Set environment variables
echo "GOOGLE_CLIENT_ID=..." > .env.local
echo "GOOGLE_CLIENT_SECRET=..." >> .env.local
# ... add other variables

# Start application
npm start
```

#### Nginx Configuration
```nginx
upstream calendar_maps {
  server localhost:3000;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  location / {
    proxy_pass http://calendar_maps;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Google Cloud Configuration

### Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable APIs:
   - Google Calendar API
   - Google Maps API
4. Create OAuth 2.0 credential (Web Application)
5. Add authorized origins:
   - https://yourdomain.com
   - https://*.vercel.app (if using Vercel)
6. Add authorized redirect URI:
   - https://yourdomain.com/api/auth/callback/google

### API Keys
- **Google Maps API Key**: Enable Maps JavaScript API
- **Google Calendar API**: Can use OAuth token directly
- Restrict keys to your domain

## Production Checklist

### Before Launch
- [ ] Environment variables configured
- [ ] Google Cloud APIs enabled
- [ ] OAuth redirect URLs updated
- [ ] HTTPS certificate installed
- [ ] Custom domain configured
- [ ] Database configured (if using)
- [ ] Backups enabled
- [ ] Monitoring setup (Sentry, DataDog, etc.)
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] CDN configured (optional)

### Security
- [ ] HTTPS enforced
- [ ] Security headers set
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] API keys restricted
- [ ] Secrets in environment variables
- [ ] No hardcoded credentials
- [ ] SQL injection protection (if using DB)
- [ ] XSS protection enabled
- [ ] CSRF tokens enabled

### Performance
- [ ] Page caching configured
- [ ] Database indices created
- [ ] Images optimized
- [ ] Code splitting verified
- [ ] Bundle size acceptable
- [ ] API response times < 2s
- [ ] Geocoding cache TTL set
- [ ] CDN for static assets

### Monitoring & Logging
- [ ] Error logging configured
- [ ] Performance metrics captured
- [ ] API request logging enabled
- [ ] User analytics setup
- [ ] Uptime monitoring active
- [ ] Alert thresholds configured
- [ ] Logs centralized

### Backup & Recovery
- [ ] Database backups enabled
- [ ] Backup retention set
- [ ] Disaster recovery plan
- [ ] Restore procedure tested
- [ ] Data encryption enabled

## Post-Deployment

### First 24 Hours
1. Monitor error rates
2. Check performance metrics
3. Verify all features working
4. Test login flows
5. Monitor API usage
6. Check for security issues

### First Week
1. Gather user feedback
2. Monitor analytics
3. Check for edge cases
4. Optimize based on usage
5. Review performance data

### Ongoing
1. Monitor error trends
2. Keep dependencies updated
3. Review access logs
4. Optimize performance
5. Plan for scaling

## Rollback Plan

If deployment fails:

```bash
# Revert to previous version
git revert <commit-hash>
git push

# Redeploy
vercel --prod
```

Or use Vercel's built-in rollback:
1. Go to Deployments tab
2. Select previous version
3. Click "Promote to Production"

## Scaling Considerations

### Caching Strategy
- Implement Redis for distributed caching
- Cache geocoding results (1-hour TTL)
- Cache calendar events (5-minute TTL)

### Database Optimization
- Create indices on frequently queried fields
- Implement connection pooling
- Archive old data

### Performance Optimization
- Implement API pagination
- Add batch endpoints
- Compress responses
- Optimize database queries

### Load Balancing
- Use load balancer for multiple instances
- Implement health checks
- Auto-scaling based on CPU/memory

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor security advisories
- Review error logs weekly
- Check performance metrics
- Audit access logs

### Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions (careful)
npm install <package>@latest
```

## Support & Documentation

### For Users
- Provide support email
- Create FAQ
- Document troubleshooting
- Offer live chat support

### For Developers
- Document API endpoints
- Maintain changelog
- Create deployment guide
- Document database schema

## Disaster Recovery

### Backup Schedule
- Database: Daily backups
- Code: Weekly releases
- Configuration: Version controlled

### Recovery Time Objectives (RTO)
- Critical issues: 1 hour
- Major issues: 4 hours
- Minor issues: 24 hours

### Recovery Point Objectives (RPO)
- Database: 1 day
- Code: 1 week
- Configuration: Real-time

---

**For detailed setup instructions, see README_SETUP.md**
**For testing procedures, see TESTING.md**
**For architecture details, see PROJECT.md**

*Last updated: Jan 29, 2025*
