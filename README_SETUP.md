# Calendar Maps App - Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+ and npm
- Google Cloud Project with APIs enabled
- Environment variables configured

### 2. Google Cloud Setup

#### Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Google Calendar API
   - Google Maps API
4. Go to "Credentials" and create "OAuth 2.0 Client IDs"
5. Set authorized JavaScript origins:
   - http://localhost:3000
   - https://yourdomain.com
6. Set authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google
   - https://yourdomain.com/api/auth/callback/google

#### Get API Keys
- **Google Maps API Key**: Maps JS API
- **Google Calendar API Key**: Calendar API (optional for server-side)
- **Client ID & Secret**: OAuth 2.0 credentials

### 3. Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the values:
```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/callback/google
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### 4. Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit http://localhost:3000

### 5. First Time User Flow

1. Click "Sign in with Google"
2. Authorize the app to access your calendar
3. View your calendar events on the map
4. Click events for details

## Features

✅ **Google Calendar Integration**
- Fetch all events from primary calendar
- Show only events with locations
- Display event details in info windows

✅ **Google Maps Display**
- Interactive map with event markers
- Auto-geocoding of event locations
- Marker info windows with event data

✅ **Smart Features**
- Real-time event updates (5-min refresh)
- Location filtering
- Event list view
- Event statistics

## Troubleshooting

### "Authentication Failed"
- Check if redirect URL matches Google Cloud Console
- Verify CLIENT_ID and CLIENT_SECRET
- Clear browser cookies and try again

### "Map Not Loading"
- Verify NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set
- Check if Maps API is enabled in Google Cloud
- Ensure API key restrictions allow your domain

### "No Events Showing"
- Verify calendar has events with locations
- Check console for API errors
- Ensure OAuth token is valid

## Architecture

```
├── /src
│   ├── /app
│   │   ├── /api
│   │   │   ├── /auth - OAuth flows
│   │   │   ├── /events - Calendar API
│   │   │   └── /geocode - Location geocoding
│   │   ├── /dashboard - Main map view
│   │   └── /auth - Auth pages
│   ├── /components
│   │   └── CalendarMap.tsx - Map display
│   ├── /lib
│   │   ├── google-calendar.ts - Calendar client
│   │   └── /auth - OAuth utilities
│   └── /types - TypeScript definitions
└── /public
```

## Performance Notes

- Events are cached client-side
- Geocoding results are cached (1-hour TTL)
- Map updates via polling (5 minutes)
- Supports up to 1000 events per calendar

## Security

- OAuth tokens stored in HTTPOnly cookies
- API keys restricted to specific domains
- No event data stored on server
- Refresh tokens handled securely

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Other Platforms

Set environment variables and run:
```bash
npm run build && npm start
```

## Support

For issues or feature requests, please check:
- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [Google Maps API Docs](https://developers.google.com/maps)
- GitHub Issues

---

*Last Updated: Jan 29, 2025*
