# Calendar Maps Application - Setup Guide

## Overview

Calendar Maps is a Next.js application that displays your Google Calendar events on an interactive Google Map. Events are geocoded to show their locations on the map with detailed information.

## Prerequisites

- Node.js 18+ and npm
- Google Cloud Project with APIs enabled
- Environment variables configured

## Step 1: Google Cloud Project Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Calendar API
   - Google Maps API
   - Google Geocoding API

### 1.2 Create OAuth 2.0 Credentials

1. Go to "Credentials" in Google Cloud Console
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
5. Copy the Client ID and Client Secret

### 1.3 Create API Keys

1. Create an API key for Maps and Geocoding APIs
2. Restrict it to prevent misuse (optional but recommended)

## Step 2: Environment Configuration

### 2.1 Copy Example Configuration

```bash
cp .env.example .env.local
```

### 2.2 Fill in Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_from_step_1
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_1
GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/callback/google

# Google APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key  # Server-side
GOOGLE_CALENDAR_API_KEY=your_calendar_api_key  # Optional

# Optional: Pre-configured refresh token (for server-side auth)
# GOOGLE_REFRESH_TOKEN=your_refresh_token

# Database (if using)
DATABASE_URL=your_database_url

# Clerk Auth (optional alternative)
# CLERK_PUBLISHABLE_KEY=your_clerk_key
# CLERK_SECRET_KEY=your_clerk_secret
```

## Step 3: Installation and Setup

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3.3 Build for Production

```bash
npm run build
npm run start
```

## Step 4: Authentication Flow

### OAuth 2.0 Flow

1. User clicks "Connect Calendar"
2. Redirected to Google OAuth consent screen
3. User grants permissions
4. Redirected back with authorization code
5. Exchange code for tokens
6. Store tokens securely (session/database)
7. Use tokens to fetch calendar events

### Token Management

- Access tokens last ~1 hour
- Refresh tokens last indefinitely (until revoked)
- The application automatically refreshes expired tokens
- Tokens are stored in secure HTTP-only cookies

## Step 5: Usage

### Dashboard

The main dashboard at `/dashboard` displays:

- Interactive map with event markers
- Sidebar with event list
- Filters for sorting and searching
- Statistics about your events

### Features

- **Map Display**: Interactive Google Map with event markers
- **Event Details**: Click markers to see event information
- **Filtering**: Filter events by location, date, and status
- **Sorting**: Sort events by time, title, location, or duration
- **Geocoding**: Automatic address-to-coordinates conversion
- **Error Handling**: Graceful handling of geocoding failures

### API Endpoints

#### GET /api/events
Fetch calendar events with optional filtering and geocoding.

**Query Parameters:**
- `daysAhead` (number): Number of days to look ahead (1-365, default: 30)
- `maxResults` (number): Maximum events to return (1-250, default: 100)
- `sortBy` (string): Sort field (startTime, title, location, duration, attendeeCount)
- `locationOnly` (boolean): Only return events with locations
- `locationKeyword` (string): Filter by location keyword
- `includeGeocoding` (boolean): Include geocoding data
- `status` (string): Comma-separated event statuses (confirmed, tentative, cancelled)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "event_id",
      "summary": "Team Meeting",
      "location": "123 Main St, San Francisco",
      "startTime": "2024-02-15T14:00:00Z",
      "endTime": "2024-02-15T15:00:00Z",
      "status": "confirmed",
      "attendees": [...],
      "geocoded": {
        "coordinates": { "lat": 37.7749, "lng": -122.4194 },
        "formattedAddress": "123 Main St, San Francisco, CA 94105"
      }
    }
  ],
  "timestamp": "2024-02-15T10:00:00Z"
}
```

#### POST /api/geocode
Geocode addresses or batch geocode multiple addresses.

**Single Address:**
```json
{
  "address": "123 Main St, San Francisco, CA"
}
```

**Batch:**
```json
{
  "addresses": ["address1", "address2", ...],
  "batch": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "123 Main St, San Francisco, CA",
    "formattedAddress": "123 Main Street, San Francisco, CA 94105",
    "coordinates": { "lat": 37.7749, "lng": -122.4194 },
    "components": {
      "country": "United States",
      "state": "CA",
      "city": "San Francisco"
    }
  },
  "timestamp": "2024-02-15T10:00:00Z"
}
```

#### GET /api/geocode?stats=true
Get geocoding cache statistics.

## Troubleshooting

### "Failed to authenticate" error

- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly set
- Verify the redirect URL matches in Google Cloud Console
- Clear browser cookies and try again

### "Address not found" or geocoding fails

- Check that `GOOGLE_MAPS_API_KEY` is valid and has geocoding API enabled
- Verify API key restrictions don't block the request
- Some addresses might not be recognizable; try being more specific

### Map not loading

- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Check that Maps API is enabled in Google Cloud
- Look for API key restrictions

### No calendar events showing

- Ensure you've authenticated with Google
- Verify events have location data
- Check date range (default is 30 days ahead)
- Try removing the `locationOnly` filter

## Performance Tips

1. **Limit Time Range**: Don't request too many months of events at once
2. **Use Filters**: Filter events to reduce data transfer
3. **Cache Results**: Geocoding results are cached for 1 hour
4. **Pagination**: Use `maxResults` parameter to control response size

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Rotate API Keys** - Regularly rotate Google API keys
3. **Use API Key Restrictions** - Restrict keys to specific APIs and domains
4. **Secure Tokens** - Tokens stored in HTTP-only cookies
5. **HTTPS in Production** - Always use HTTPS for OAuth callbacks
6. **Validate Input** - All API inputs are validated server-side

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Other Hosting

1. Build: `npm run build`
2. Start: `npm run start`
3. Set environment variables in hosting platform
4. Update OAuth redirect URL in Google Cloud Console

## Database Setup (Optional)

If using the database features:

```bash
# Generate migrations
npm run db:generate

# Push to database
npm run db:push

# View studio
npm run db:studio
```

## Further Reading

- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Google Maps API Documentation](https://developers.google.com/maps)
- [Next.js Documentation](https://nextjs.org/docs)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review environment variables
3. Check browser console for errors
4. Review server logs
5. Check Google Cloud Console for API quota issues
