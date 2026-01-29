/**
 * API route to fetch calendar events with filtering and sorting
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchCalendarEvents,
  filterEvents,
  sortEvents,
  enrichEventsWithLocations,
  getEventsWithLocations,
} from '@/lib/calendar-service';
import { createOAuth2Client } from '@/lib/calendar-service';
import { EventSortBy, EventFilterOptions, ApiResponse, EventsResponse } from '@/types';

/**
 * Validate and parse query parameters
 */
function parseQueryParams(searchParams: URLSearchParams) {
  const daysAhead = Math.min(Math.max(parseInt(searchParams.get('daysAhead') || '30'), 1), 365);
  const maxResults = Math.min(Math.max(parseInt(searchParams.get('maxResults') || '100'), 1), 250);
  const sortBy = (searchParams.get('sortBy') as EventSortBy) || EventSortBy.START_TIME;
  const locationOnly = searchParams.get('locationOnly') === 'true';
  const locationKeyword = searchParams.get('locationKeyword');
  const includeGeocoding = searchParams.get('includeGeocoding') === 'true';
  const status = searchParams.get('status');

  return {
    daysAhead,
    maxResults,
    sortBy,
    locationOnly,
    locationKeyword,
    includeGeocoding,
    status: status ? status.split(',') : undefined,
  };
}

/**
 * GET /api/events - Fetch calendar events
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const params = parseQueryParams(searchParams);

    // Create OAuth client
    let auth;
    try {
      auth = createOAuth2Client();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          message: 'Unable to initialize OAuth client. Check Google API credentials.',
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Set time range
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + params.daysAhead * 24 * 60 * 60 * 1000).toISOString();

    // Fetch events from Google Calendar
    let events;
    try {
      events = await fetchCalendarEvents(auth, {
        timeMin,
        timeMax,
        maxResults: params.maxResults,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch events';
      console.error('[Events API] Calendar fetch error:', errorMsg);

      return NextResponse.json(
        {
          success: false,
          error: 'Calendar fetch failed',
          message: errorMsg,
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Build filter options
    const filterOptions: EventFilterOptions = {
      status: params.status as any,
    };

    if (params.locationKeyword) {
      filterOptions.locationKeyword = params.locationKeyword;
    }

    if (params.locationOnly) {
      filterOptions.hasLocation = true;
    }

    // Apply filters
    let filtered = filterEvents(events, filterOptions);

    // Apply sorting
    filtered = sortEvents(filtered, params.sortBy);

    // Enrich with geocoding if requested
    let enrichedEvents = null;
    if (params.includeGeocoding) {
      try {
        enrichedEvents = await enrichEventsWithLocations(getEventsWithLocations(filtered));
        console.log(`[Events API] Geocoded ${enrichedEvents.filter((e) => e.geocoded).length}/${enrichedEvents.length} events`);
      } catch (error) {
        console.error('[Events API] Geocoding error:', error);
        // Continue without geocoding rather than failing
      }
    }

    const eventCount = enrichedEvents ? enrichedEvents.length : filtered.length;

    const response: EventsResponse = {
      success: true,
      count: eventCount,
      data: enrichedEvents || filtered.map((event) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        location: event.location,
        startTime: event.startTime,
        endTime: event.endTime,
        status: event.status,
        attendees: event.attendees,
        organizer: event.organizer,
        hangoutLink: event.hangoutLink,
        htmlLink: event.htmlLink,
      })),
      timestamp: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    console.log(`[Events API] Successfully fetched ${eventCount} events in ${duration}ms`);

    return NextResponse.json(response, {
      headers: {
        'X-Process-Time': `${duration}ms`,
        'X-Event-Count': eventCount.toString(),
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Events API] Unhandled error:', errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: errorMsg,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * OPTIONS endpoint for CORS
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
