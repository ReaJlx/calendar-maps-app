# Calendar Maps 🗺️📅

A modern web application that displays your Google Calendar events on an interactive Google Map. View all your upcoming events with their locations visualized geographically.

## Features ✨

- **Interactive Map Display**: See all your calendar events pinned on a Google Map
- **Smart Geocoding**: Automatically converts event locations to map coordinates with caching
- **Event Filtering**: Filter events by date, location, status, and more
- **Advanced Sorting**: Sort by time, title, location, duration, or attendee count
- **Real-time Updates**: Events refresh automatically every 5 minutes
- **Detailed Info Windows**: Click markers to see comprehensive event details
- **Statistics Dashboard**: View analytics about your events (total, with locations, unique locations)
- **Error Handling**: Gracefully handles geocoding failures and API errors
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Ready**: Tailwind CSS for consistent styling

## Quick Start 🚀

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Project with OAuth and APIs enabled
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calendar-maps-app
   npm install
   ```

2. **Set up Google Cloud**
   - Create Google Cloud project
   - Enable Calendar, Maps, and Geocoding APIs
   - Create OAuth 2.0 credentials
   - Get API keys

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Documentation 📖

- **[Setup Guide](./SETUP.md)** - Detailed setup instructions
- **[API Documentation](./API.md)** - Complete API reference
- **[Project Structure](./PROJECT.md)** - Code organization

## Architecture 🏗️

```
calendar-maps-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── events/           # Calendar events endpoint
│   │   │   ├── geocode/          # Geocoding endpoint
│   │   │   └── auth/             # OAuth callbacks
│   │   ├── dashboard/            # Main dashboard page
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── CalendarMap.tsx       # Interactive map
│   │   ├── EventList.tsx         # Event list display
│   │   └── EventFilters.tsx      # Filter controls
│   ├── lib/
│   │   ├── calendar-service.ts   # Calendar logic
│   │   ├── geocoding.ts          # Geocoding with cache
│   │   └── auth/                 # Authentication
│   └── types/
│       └── index.ts              # TypeScript types
├── public/                       # Static files
└── package.json
```

## Core Components 🧩

### CalendarMap
Interactive Google Map showing event markers with info windows.

**Props:**
- `events`: Array of calendar events
- `apiKey`: Google Maps API key
- `onMarkerClick`: Callback when marker is clicked
- `selectedEventId`: Currently selected event

### EventList
Displays events in a list format with geocoding status.

**Props:**
- `events`: Array of events to display
- `onEventClick`: Callback when event is clicked
- `highlightedEventId`: Currently highlighted event
- `showGeocodeErrors`: Show geocoding errors

### EventFilters
Filter and sort controls for events.

**Features:**
- Sort by: time, title, location, duration, attendees
- Filter: with location, geocoding status
- Search: by location keyword

## API Routes 🔌

### `/api/events`
**GET** - Fetch calendar events with optional geocoding

Query parameters:
- `daysAhead`: Number of days to look ahead (1-365)
- `maxResults`: Maximum events (1-250)
- `sortBy`: Sort field
- `locationOnly`: Only with locations
- `includeGeocoding`: Include coordinates

**Example:**
```bash
GET /api/events?daysAhead=30&includeGeocoding=true&locationOnly=true
```

### `/api/geocode`
**POST** - Geocode addresses

**Single address:**
```json
{ "address": "123 Main St, San Francisco" }
```

**Batch:**
```json
{
  "addresses": ["addr1", "addr2"],
  "batch": true
}
```

### `/api/auth/callback/google`
**GET** - OAuth callback (handled automatically)

## Services 🔧

### CalendarService
- `fetchCalendarEvents()` - Get events from Google Calendar
- `filterEvents()` - Filter by criteria
- `sortEvents()` - Sort by various fields
- `enrichEventsWithLocations()` - Add geocoding
- `calculateStatistics()` - Event analytics

### GeocodingService
- `geocodeAddress()` - Single address geocoding
- `batchGeocodeAddresses()` - Multiple addresses
- `calculateDistance()` - Distance between points
- `calculateBounds()` - Bounding box for locations
- Cache management with TTL

### AuthService
- `getAuthorizationUrl()` - OAuth URL
- `exchangeCodeForTokens()` - Token exchange
- `refreshTokens()` - Refresh expired tokens
- `ensureValidTokens()` - Auto-refresh if needed

## Environment Variables 🔐

```env
# OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/callback/google

# APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
GOOGLE_MAPS_API_KEY=your_maps_key

# Optional
GOOGLE_REFRESH_TOKEN=your_refresh_token
DATABASE_URL=your_database_url
```

## Development 👨‍💻

### Scripts

```bash
# Development
npm run dev              # Start dev server
npm run lint            # Run ESLint
npm run type-check      # Check TypeScript

# Production
npm run build           # Build for production
npm start              # Start production server

# Database
npm run db:generate    # Generate migrations
npm run db:migrate     # Run migrations
npm run db:push        # Push schema to database
npm run db:studio      # Open database studio
```

### Technologies

- **Frontend**: Next.js 16, React 19, TypeScript
- **Maps**: Google Maps API, @react-google-maps/api
- **Styling**: Tailwind CSS
- **Database**: Drizzle ORM, PostgreSQL
- **Authentication**: Google OAuth 2.0, Clerk
- **Deployment**: Vercel, Docker

## Performance Optimizations ⚡

- **Geocoding Cache**: 1-hour TTL, max 1,000 entries
- **Lazy Loading**: Components load on demand
- **Image Optimization**: Next.js image optimization
- **Batch Geocoding**: Process multiple addresses in parallel
- **Rate Limiting**: Respects API quotas

## Security 🔒

- **HTTP-only Cookies**: Tokens stored securely
- **Environment Variables**: Secrets not in code
- **Input Validation**: All API inputs validated
- **CORS**: Configured appropriately
- **HTTPS**: Required in production
- **Token Refresh**: Automatic token management

## Deployment 🚀

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t calendar-maps .
docker run -p 3000:3000 --env-file .env.local calendar-maps
```

### Manual

1. Build: `npm run build`
2. Deploy `build/` directory
3. Set environment variables
4. Start: `npm start`

## Troubleshooting 🐛

### "Failed to authenticate"
- Check OAuth credentials in Google Cloud Console
- Verify redirect URL is correct
- Clear browser cookies

### "Address not found"
- Try more specific address format
- Verify address exists
- Check Maps API is enabled

### Map not loading
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Check browser console for errors
- Ensure Maps API is enabled

### No events showing
- Verify Google Calendar authentication
- Check that events have location data
- Adjust time range

See [SETUP.md](./SETUP.md) for more troubleshooting steps.

## Contributing 🤝

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Support 💬

For questions or issues:

1. Check [SETUP.md](./SETUP.md) and [API.md](./API.md)
2. Review troubleshooting section above
3. Check GitHub Issues
4. Open new issue with details

## Roadmap 🗺️

- [ ] Mobile app (React Native)
- [ ] Multiple calendar support
- [ ] Event clustering on map
- [ ] Custom event colors
- [ ] Export to CSV/ICS
- [ ] Notification alerts
- [ ] Dark mode UI
- [ ] Internationalization (i18n)
- [ ] Real-time collaboration
- [ ] Advanced analytics

## Acknowledgments 🙏

- Google Calendar and Maps APIs
- Next.js and React teams
- Tailwind CSS for styling
- Community contributors

---

**Made with ❤️ for better calendar visualization**
