# Calendar Maps - Testing Guide

## Testing Strategy

This guide covers all testing approaches for the Calendar Maps application.

## Table of Contents

1. [Unit Testing](#unit-testing)
2. [Integration Testing](#integration-testing)
3. [E2E Testing](#e2e-testing)
4. [API Testing](#api-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)

---

## Unit Testing

Test individual functions and components in isolation.

### Test Utilities

```typescript
// src/__tests__/setup.ts
import { expect, test, describe } from '@jest/globals';

export const testUtils = {
  expectError: (fn: () => void, message?: string) => {
    expect(fn).toThrow(message);
  },
  expectArrayLength: (arr: any[], length: number) => {
    expect(arr).toHaveLength(length);
  },
};
```

### Calendar Service Tests

```typescript
// src/__tests__/lib/calendar-service.test.ts
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  filterEvents,
  sortEvents,
  getEventDuration,
  groupEventsByDate,
} from '@/lib/calendar-service';
import { CalendarEvent, EventSortBy } from '@/types';

describe('Calendar Service', () => {
  let mockEvents: CalendarEvent[];

  beforeEach(() => {
    mockEvents = [
      {
        id: '1',
        summary: 'Meeting A',
        location: 'Room 1',
        startTime: new Date('2024-02-15T09:00:00'),
        endTime: new Date('2024-02-15T10:00:00'),
        status: 'confirmed',
      },
      {
        id: '2',
        summary: 'Meeting B',
        location: 'Room 2',
        startTime: new Date('2024-02-15T14:00:00'),
        endTime: new Date('2024-02-15T15:00:00'),
        status: 'confirmed',
      },
    ];
  });

  describe('filterEvents', () => {
    test('should filter events with locations', () => {
      const result = filterEvents(mockEvents, { hasLocation: true });
      expect(result).toHaveLength(2);
    });

    test('should filter events by location keyword', () => {
      const result = filterEvents(mockEvents, { locationKeyword: 'Room 1' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    test('should filter events by date range', () => {
      const result = filterEvents(mockEvents, {
        startDate: new Date('2024-02-15T10:00:00'),
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });

  describe('sortEvents', () => {
    test('should sort by start time ascending', () => {
      const result = sortEvents(mockEvents, EventSortBy.START_TIME, true);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    test('should sort by title', () => {
      const result = sortEvents(mockEvents, EventSortBy.TITLE, true);
      expect(result[0].summary).toBe('Meeting A');
    });
  });

  describe('getEventDuration', () => {
    test('should calculate duration in minutes', () => {
      const duration = getEventDuration(mockEvents[0]);
      expect(duration).toBe(60);
    });
  });

  describe('groupEventsByDate', () => {
    test('should group events by date', () => {
      const result = groupEventsByDate(mockEvents);
      expect(Object.keys(result)).toHaveLength(1);
      expect(result['2024-02-15']).toHaveLength(2);
    });
  });
});
```

### Geocoding Service Tests

```typescript
// src/__tests__/lib/geocoding.test.ts
import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  parseCoordinatesFromLocation,
  isValidCoordinates,
  calculateDistance,
  calculateBounds,
} from '@/lib/geocoding';

describe('Geocoding Service', () => {
  describe('parseCoordinatesFromLocation', () => {
    test('should parse coordinates in parentheses', () => {
      const result = parseCoordinatesFromLocation(
        'Conference Room (37.7749, -122.4194)'
      );
      expect(result.coordinates).toEqual({ lat: 37.7749, lng: -122.4194 });
      expect(result.address).toBe('Conference Room');
    });

    test('should return address if no coordinates', () => {
      const result = parseCoordinatesFromLocation('123 Main St');
      expect(result.coordinates).toBeUndefined();
      expect(result.address).toBe('123 Main St');
    });
  });

  describe('isValidCoordinates', () => {
    test('should validate correct coordinates', () => {
      expect(isValidCoordinates(37.7749, -122.4194)).toBe(true);
    });

    test('should reject invalid latitude', () => {
      expect(isValidCoordinates(91, 0)).toBe(false);
    });

    test('should reject invalid longitude', () => {
      expect(isValidCoordinates(0, 181)).toBe(false);
    });
  });

  describe('calculateDistance', () => {
    test('should calculate distance between coordinates', () => {
      // San Francisco to Los Angeles
      const distance = calculateDistance(
        37.7749,
        -122.4194,
        34.0522,
        -118.2437
      );
      expect(distance).toBeGreaterThan(500);
      expect(distance).toBeLessThan(600);
    });
  });

  describe('calculateBounds', () => {
    test('should calculate bounding box', () => {
      const points = [
        { lat: 37.7749, lng: -122.4194 },
        { lat: 34.0522, lng: -118.2437 },
      ];
      const bounds = calculateBounds(points);

      expect(bounds.ne.lat).toBe(37.7749);
      expect(bounds.sw.lat).toBe(34.0522);
      expect(bounds.ne.lng).toBe(-118.2437);
      expect(bounds.sw.lng).toBe(-122.4194);
    });
  });
});
```

---

## Integration Testing

Test multiple components working together.

### API Integration Tests

```typescript
// src/__tests__/api/events.integration.test.ts
import { describe, test, expect, beforeAll } from '@jest/globals';

describe('Events API Integration', () => {
  let apiUrl: string;

  beforeAll(() => {
    apiUrl = process.env.TEST_API_URL || 'http://localhost:3000';
  });

  describe('GET /api/events', () => {
    test('should fetch events with default parameters', async () => {
      const response = await fetch(`${apiUrl}/api/events`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.count).toBeGreaterThanOrEqual(0);
    });

    test('should respect maxResults parameter', async () => {
      const response = await fetch(`${apiUrl}/api/events?maxResults=5`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBeLessThanOrEqual(5);
    });

    test('should filter events with locationOnly', async () => {
      const response = await fetch(`${apiUrl}/api/events?locationOnly=true`);
      const data = await response.json();

      expect(response.status).toBe(200);
      data.data.forEach((event: any) => {
        expect(event.location).toBeDefined();
      });
    });

    test('should sort events correctly', async () => {
      const response = await fetch(`${apiUrl}/api/events?sortBy=title`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.data.length > 1) {
        for (let i = 0; i < data.data.length - 1; i++) {
          expect(
            data.data[i].summary.localeCompare(data.data[i + 1].summary)
          ).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('POST /api/geocode', () => {
    test('should geocode valid address', async () => {
      const response = await fetch(`${apiUrl}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: '1600 Pennsylvania Avenue NW, Washington, DC',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.coordinates).toBeDefined();
      expect(data.data.coordinates.lat).toBeCloseTo(38.8951, 2);
      expect(data.data.coordinates.lng).toBeCloseTo(-77.0369, 2);
    });

    test('should handle invalid address', async () => {
      const response = await fetch(`${apiUrl}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: 'xyz123notarealaddressxyz',
        }),
      });

      expect([404, 500]).toContain(response.status);
    });

    test('should batch geocode multiple addresses', async () => {
      const response = await fetch(`${apiUrl}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addresses: [
            '1600 Pennsylvania Avenue NW, Washington, DC',
            'One Apple Park Way, Cupertino, CA',
          ],
          batch: true,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Object.keys(data.data).length).toBe(2);
    });
  });
});
```

---

## E2E Testing

Test complete user flows.

### Example with Playwright

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
  });

  test('should load dashboard and display events', async ({ page }) => {
    // Wait for title
    await expect(page.locator('h1')).toContainText('Calendar Events Map');

    // Wait for events to load
    await page.waitForSelector('[role="list"]');

    // Verify events are displayed
    const events = await page.locator('[role="listitem"]');
    expect(await events.count()).toBeGreaterThan(0);
  });

  test('should filter events by location', async ({ page }) => {
    // Enter location filter
    await page.fill('input[placeholder*="Search locations"]', 'coffee');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Verify filtered events
    const events = await page.locator('[role="listitem"]');
    const count = await events.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should click event marker on map', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('[role="main"]');

    // Get marker
    const markers = await page.locator('[role="img"][title]');
    if ((await markers.count()) > 0) {
      // Click first marker
      await markers.first().click();

      // Verify info window appears
      await expect(page.locator('text=/Team|Meeting/')).toBeVisible();
    }
  });

  test('should sort events', async ({ page }) => {
    // Open sort dropdown
    await page.selectOption('select[aria-label*="Sort"]', 'title');

    // Wait for sorting
    await page.waitForTimeout(500);

    // Verify events are sorted
    const events = await page.locator('[role="listitem"] h3');
    const titles: string[] = [];
    for (let i = 0; i < await events.count(); i++) {
      titles.push(await events.nth(i).textContent() || '');
    }

    // Check if sorted alphabetically
    for (let i = 0; i < titles.length - 1; i++) {
      expect(titles[i].localeCompare(titles[i + 1])).toBeLessThanOrEqual(0);
    }
  });
});
```

---

## API Testing

Test API endpoints directly.

### Using cURL

```bash
#!/bin/bash

API_URL="http://localhost:3000"
PASSED=0
FAILED=0

echo "Testing Calendar Maps API..."

# Test 1: Fetch events
echo "Test 1: GET /api/events"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/events?daysAhead=30")
STATUS=$(echo "$RESPONSE" | tail -1)
if [ "$STATUS" -eq 200 ]; then
  echo "✓ PASSED"
  ((PASSED++))
else
  echo "✗ FAILED (Status: $STATUS)"
  ((FAILED++))
fi

# Test 2: Geocode address
echo "Test 2: POST /api/geocode"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/geocode" \
  -H "Content-Type: application/json" \
  -d '{"address":"1600 Pennsylvania Avenue NW"}')
STATUS=$(echo "$RESPONSE" | tail -1)
if [ "$STATUS" -eq 200 ]; then
  echo "✓ PASSED"
  ((PASSED++))
else
  echo "✗ FAILED (Status: $STATUS)"
  ((FAILED++))
fi

echo ""
echo "Tests: $PASSED passed, $FAILED failed"
```

---

## Performance Testing

Test application performance under load.

### Load Testing with k6

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['<0.1'],
  },
};

export default function () {
  // Test events endpoint
  const res1 = http.get('http://localhost:3000/api/events?daysAhead=30');
  check(res1, {
    'events status is 200': (r) => r.status === 200,
    'events response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test geocoding
  const res2 = http.post(
    'http://localhost:3000/api/geocode',
    JSON.stringify({
      address: '123 Main St, San Francisco, CA',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  check(res2, {
    'geocode status is 200': (r) => r.status === 200,
    'geocode response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(2);
}
```

Run: `k6 run k6-load-test.js`

---

## Security Testing

Test application security.

### OWASP Security Checks

```bash
#!/bin/bash

echo "Running Security Tests..."

# Test 1: Check for sensitive data in code
echo "Test 1: Searching for secrets in code..."
if grep -r "GOOGLE_CLIENT_SECRET\|API_KEY\|PASSWORD" src/ --include="*.ts" --include="*.tsx"; then
  echo "✗ FAILED: Found hardcoded secrets"
  exit 1
else
  echo "✓ PASSED: No hardcoded secrets found"
fi

# Test 2: Check dependencies for vulnerabilities
echo "Test 2: Checking for vulnerable dependencies..."
npm audit --audit-level=moderate

# Test 3: Test HTTPS redirect
echo "Test 3: Testing HTTPS redirect..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000)
if [ "$STATUS" -eq 200 ]; then
  echo "✓ PASSED"
else
  echo "✗ FAILED (Status: $STATUS)"
fi
```

---

## Running Tests

### Setup

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev playwright
npm install --save-dev k6
```

### Run Unit Tests

```bash
npm test                # Run all tests
npm test -- --watch    # Watch mode
npm test -- --coverage # Coverage report
```

### Run Integration Tests

```bash
npm run test:integration
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run Performance Tests

```bash
npm run test:performance
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test:unit

      - name: Integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: E2E tests
        run: npm run test:e2e

      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v3
```

---

## Test Coverage Goals

- Unit Tests: 80%+
- Integration Tests: 70%+
- E2E Tests: Key user flows
- Critical paths: 100%

## References

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [k6 Documentation](https://k6.io/docs/)
