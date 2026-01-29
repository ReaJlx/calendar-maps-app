# Calendar Maps API Documentation

## Base URL

- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

## Authentication

All API endpoints require proper Google OAuth setup. Some endpoints can work with either:
- User OAuth tokens (from browser session)
- Service account refresh tokens (server-side)

## Endpoints

### Calendar Events

#### GET /api/events

Fetch calendar events with optional filtering, sorting, and geocoding.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `daysAhead` | number | 30 | Days into future to fetch (1-365) |
| `maxResults` | number | 100 | Max events to return (1-250) |
| `sortBy` | string | startTime | Sort field: `startTime`, `title`, `location`, `duration`, `attendeeCount` |
| `locationOnly` | boolean | false | Only return events with locations |
| `locationKeyword` | string | - | Filter events by location keyword |
| `includeGeocoding` | boolean | false | Include geocoded coordinates |
| `status` | string | - | Comma-separated: `confirmed`, `tentative`, `cancelled` |

**Example Request:**

```bash
curl "http://localhost:3000/api/events?daysAhead=30&locationOnly=true&includeGeocoding=true"
```

**Success Response (200):**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "abc123",
      "summary": "Team Standup",
      "description": "Daily sync",
      "location": "Conference Room A",
      "startTime": "2024-02-15T09:00:00.000Z",
      "endTime": "2024-02-15T09:30:00.000Z",
      "status": "confirmed",
      "attendees": [
        {
          "email": "user@example.com",
          "displayName": "John Doe",
          "responseStatus": "accepted",
          "optional": false
        }
      ],
      "organizer": {
        "email": "organizer@example.com",
        "displayName": "Jane Smith"
      },
      "htmlLink": "https://calendar.google.com/...",
      "hangoutLink": "https://meet.google.com/...",
      "geocoded": {
        "address": "Conference Room A",
        "formattedAddress": "123 Main St, San Francisco, CA 94102",
        "coordinates": {
          "lat": 37.7749,
          "lng": -122.4194
        },
        "placeId": "ChIJ..."
      }
    }
  ],
  "timestamp": "2024-02-15T10:00:00Z"
}
```

**Error Response (4xx/5xx):**

```json
{
  "success": false,
  "error": "Authentication failed",
  "message": "Unable to initialize OAuth client. Check Google API credentials.",
  "timestamp": "2024-02-15T10:00:00Z"
}
```

**Status Codes:**
- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Auth failed
- `500 Internal Server Error`: Server error

---

### Geocoding

#### POST /api/geocode

Geocode a single address or batch geocode multiple addresses.

**Single Address Request:**

```json
{
  "address": "123 Main St, San Francisco, CA"
}
```

**Batch Request:**

```json
{
  "addresses": [
    "123 Main St, San Francisco, CA",
    "456 Market St, San Francisco, CA",
    "789 Mission St, San Francisco, CA"
  ],
  "batch": true
}
```

**Single Address Response (200):**

```json
{
  "success": true,
  "data": {
    "address": "123 Main St, San Francisco, CA",
    "formattedAddress": "123 Main Street, San Francisco, CA 94102, USA",
    "coordinates": {
      "lat": 37.7749,
      "lng": -122.4194
    },
    "placeId": "ChIJ7Rk8ZXkDkIARQ...",
    "components": {
      "country": "United States",
      "state": "CA",
      "city": "San Francisco",
      "street": "Main Street"
    }
  },
  "timestamp": "2024-02-15T10:00:00Z"
}
```

**Batch Response (200):**

```json
{
  "success": true,
  "data": {
    "123 Main St, San Francisco, CA": {
      "address": "123 Main St, San Francisco, CA",
      "formattedAddress": "123 Main Street, San Francisco, CA 94102, USA",
      "coordinates": {
        "lat": 37.7749,
        "lng": -122.4194
      }
    },
    "456 Market St, San Francisco, CA": {
      "address": "456 Market St, San Francisco, CA",
      "formattedAddress": "456 Market Street, San Francisco, CA 94103, USA",
      "coordinates": {
        "lat": 37.7933,
        "lng": -122.3988
      }
    }
  },
  "geocoded": 2,
  "cached": 0,
  "failed": 0,
  "timestamp": "2024-02-15T10:00:00Z"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Bad request",
  "message": "address parameter is required and must be a string",
  "timestamp": "2024-02-15T10:00:00Z"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Geocoding failed",
  "message": "No geocoding results found for \"invalid address xyz\"",
  "timestamp": "2024-02-15T10:00:00Z"
}
```

**Status Codes:**
- `200 OK`: Successful geocoding
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Address not geocoded
- `500 Internal Server Error`: Server error

**Limits:**
- Single address: No limit
- Batch request: Maximum 100 addresses per request
- Rate limiting: Google's standard rate limits apply

---

#### GET /api/geocode?stats=true

Get geocoding cache statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "size": 45,
    "maxSize": 1000,
    "ttl": 3600000
  },
  "timestamp": "2024-02-15T10:00:00Z"
}
```

---

### Authentication

#### GET /api/auth/callback/google

OAuth callback endpoint. User is redirected here after Google authentication.

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: State parameter for CSRF protection
- `error`: Error code if authorization failed

**Success Response:**
- Redirects to `/dashboard`
- Sets secure HTTP-only cookies with tokens

**Error Response:**
- Redirects to `/auth/error?error=...`

---

## Data Types

### CalendarEvent

```typescript
{
  id: string;
  summary: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'tentative' | 'cancelled';
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: 'needsAction' | 'declined' | 'tentativelyAccepted' | 'accepted';
    optional?: boolean;
  }>;
  organizer?: {
    email: string;
    displayName?: string;
  };
  htmlLink?: string;
  hangoutLink?: string;
}
```

### GeocodedLocation

```typescript
{
  address: string;
  formattedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  components?: {
    country?: string;
    state?: string;
    city?: string;
    street?: string;
  };
}
```

---

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error category",
  "message": "Detailed error message",
  "timestamp": "2024-02-15T10:00:00Z"
}
```

### Common Error Codes

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Invalid parameters | 400 | Missing or invalid query/body | Check request format |
| Authentication failed | 401 | Missing/expired tokens | Re-authenticate |
| Address not found | 404 | Invalid address | Try different format |
| Rate limit exceeded | 429 | Too many requests | Wait and retry |
| Server error | 500 | Internal error | Contact support |

---

## Rate Limiting

- **API Endpoints**: Limited by Google API quotas
- **Geocoding**: 50 requests/second (Google standard)
- **Calendar**: 1,000 requests/day per user

---

## Caching

- **Geocoding Cache**: 1 hour TTL, max 1,000 entries
- **Calendar Events**: Not cached (always fresh)
- **Browser Cache**: Use HTTP headers for caching policy

---

## CORS

All endpoints allow CORS requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Examples

### Fetch upcoming events with geocoding

```bash
curl -X GET \
  "http://localhost:3000/api/events?daysAhead=60&maxResults=50&includeGeocoding=true&locationOnly=true" \
  -H "Accept: application/json"
```

### Geocode multiple addresses

```bash
curl -X POST \
  "http://localhost:3000/api/geocode" \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      "1600 Pennsylvania Avenue NW, Washington, DC",
      "One Apple Park Way, Cupertino, CA",
      "1 Microsoft Way, Redmond, WA"
    ],
    "batch": true
  }'
```

### Filter events by location

```bash
curl -X GET \
  "http://localhost:3000/api/events?locationKeyword=coffee&sortBy=location" \
  -H "Accept: application/json"
```

---

## Testing

### Using cURL

```bash
# Set your API URL
API_URL="http://localhost:3000"

# Test events endpoint
curl -X GET "$API_URL/api/events?daysAhead=7"

# Test geocoding
curl -X POST "$API_URL/api/geocode" \
  -H "Content-Type: application/json" \
  -d '{"address":"123 Main St"}'
```

### Using JavaScript/Fetch

```javascript
// Fetch events
const response = await fetch('/api/events?daysAhead=30&includeGeocoding=true');
const data = await response.json();
console.log(data);

// Geocode address
const geocodeResponse = await fetch('/api/geocode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: '123 Main St' })
});
const geocoded = await geocodeResponse.json();
console.log(geocoded);
```

---

## API Versioning

Current version: **v1**

The API follows semantic versioning. Breaking changes will increment the major version.

---

## Support & Feedback

For issues or feature requests, please refer to the main [README.md](./README.md) and [SETUP.md](./SETUP.md).
