/**
 * API route to fetch calendar events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client, getCalendarEvents, filterEventsWithLocation } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  try {
    // Get the user's session/auth token
    // This would be replaced with actual auth from Clerk
    const auth = getOAuth2Client();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30');

    // Set time range
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

    // Fetch events
    const events = await getCalendarEvents(auth, timeMin, timeMax, maxResults);

    // Filter to only events with locations
    const eventsWithLocation = filterEventsWithLocation(events);

    return NextResponse.json({
      success: true,
      count: eventsWithLocation.length,
      events: eventsWithLocation.map((event) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        location: event.location,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        htmlLink: event.htmlLink,
      })),
    });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
