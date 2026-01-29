# App Factory Template

A production-ready Next.js template with authentication, database, caching, and media uploads.

## Features

- **Framework**: Next.js 16 with App Router
- **Authentication**: Clerk (optional)
- **Database**: PostgreSQL with Drizzle ORM (optional)
- **Cache**: Upstash Redis (optional)
- **Media**: Cloudinary uploads (optional)
- **Styling**: Tailwind CSS v4

All services are optional and lazily initialized - the app gracefully handles missing configuration.

## Quick Start

```bash
# 1. Clone and install
git clone <repo>
cd template
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Run development server
npm run dev
```

## Environment Variables

See `.env.example` for all available variables. Here's a quick reference:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No | Clerk publishable key |
| `CLERK_SECRET_KEY` | No | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | No | Clerk webhook signing secret |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis REST token |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard page
│   ├── demo/              # Demo pages (cache, media)
│   ├── sign-in/           # Clerk sign-in
│   └── sign-up/           # Clerk sign-up
├── components/            # React components
│   └── ui/               # Reusable UI components
├── config/               # Configuration & env validation
├── hooks/                # React hooks
├── lib/                  # Core utilities
│   ├── auth/            # Authentication helpers
│   ├── cache/           # Cache re-exports
│   ├── db/              # Database connection & schema
│   ├── media/           # Media re-exports
│   └── utils/           # Utility functions
├── services/            # Business logic layer
│   ├── cache/           # Cache service (Upstash)
│   ├── media/           # Media service (Cloudinary)
│   └── user/            # User service (Drizzle)
└── types/               # Global TypeScript types
```

## Architecture

### Service Pattern

Services follow a clean architecture with:
- **Repository**: Low-level data access
- **Service**: Business logic
- **Types**: Service-specific types (colocated)

```typescript
// Example usage
import { userService } from '@/services/user'

const user = await userService.getUserByClerkId(clerkId)
```

### Lazy Initialization

All services are lazily initialized to prevent startup crashes when env vars are missing:

```typescript
import { cacheService } from '@/services/cache'

// Only initializes when first accessed
const stats = await cacheService.getStats()
```

### Environment Validation

Environment variables are validated with Zod when services are accessed:

```typescript
import { getClerkEnv, isClerkConfigured } from '@/config/env'

// Check if configured (non-throwing)
if (isClerkConfigured()) {
  // Use the service
}

// Get validated env (throws if invalid)
const env = getClerkEnv()
```

## Database

### Setup

1. Get a PostgreSQL database (Neon, Supabase, etc.)
2. Set `DATABASE_URL` in `.env`
3. Push schema: `npm run db:push`

### Commands

```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema directly
npm run db:studio    # Open Drizzle Studio
```

## Authentication

### Clerk Setup

1. Create account at [clerk.com](https://clerk.com)
2. Create application
3. Copy keys to `.env`

### Webhook (Optional)

To sync user data to your database:

1. Add webhook endpoint in Clerk dashboard: `https://yourdomain.com/api/webhooks/clerk`
2. Subscribe to: `user.created`, `user.updated`, `user.deleted`
3. Copy signing secret to `CLERK_WEBHOOK_SECRET`

## Demos

The template includes working demos:

- `/demo/cache` - Cache hits/misses and rate limiting
- `/demo/media` - Image upload to Cloudinary

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT
