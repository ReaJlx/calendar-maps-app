# Calendar Maps App

Display Google Calendar events on a Google Map, showing only events with location data.

## Project Overview

A Next.js web application that:
- Authenticates users with their Google account
- Fetches their calendar events
- Extracts location data from events
- Displays events as markers on an interactive Google Map
- Shows event details in info windows
- Filters out events without locations

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Backend:** Next.js API Routes
- **APIs:** Google Calendar API, Google Maps API
- **Auth:** Clerk (existing from template)
- **Database:** Supabase + Drizzle ORM (optional, for caching)
- **Styling:** Tailwind CSS
- **Libraries:**
  - `googleapis` - Google Calendar API client
  - `@react-google-maps/api` - React wrapper for Google Maps
  - `google-map-react` - Alternative map component

## Project Phases

1. **Research** (In Progress) - Investigate APIs and best practices
2. **Planning** - Create detailed architecture and task breakdown
3. **Review** - Review plan with team/expert
4. **Implementation** - Build the application
5. **Testing** - Functional and integration testing
6. **Deployment** - Push to repo and deploy

## Development Roadmap

- [ ] API Keys Setup (Google Calendar + Google Maps)
- [ ] Authentication Flow
- [ ] Calendar Events Fetching
- [ ] Location Parsing/Geocoding
- [ ] Map Component Setup
- [ ] Event Markers Display
- [ ] Info Windows with Event Details
- [ ] Filtering (only show events with locations)
- [ ] Real-time Updates
- [ ] Error Handling & Edge Cases
- [ ] Testing & Documentation
- [ ] Deployment & Telegram Notification

## Environment Variables

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

*Created as multi-phase development project - Jan 29, 2025*
