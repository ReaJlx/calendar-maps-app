/**
 * Calendar service with filtering, sorting, and advanced features
 */

import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import {
  CalendarEvent,
  EventWithLocation,
  EventFilterOptions,
  EventSortBy,
  CalendarStatistics,
} from '@/types';
import { geocodeAddress } from '@/lib/geocoding';

/**
 * Create OAuth2 client
 */
export function createOAuth2Client(): OAuth2Client {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/api/auth/callback/google'
  );

  if (process.env.GOOGLE_REFRESH_TOKEN) {
    client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  return client;
}

/**
 * Fetch calendar events with optional date range
 */
export async function fetchCalendarEvents(
  auth: OAuth2Client,
  options?: {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: string;
  }
): Promise<CalendarEvent[]> {
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId: options?.calendarId || 'primary',
    timeMin: options?.timeMin || new Date().toISOString(),
    timeMax: options?.timeMax,
    maxResults: options?.maxResults || 250,
    singleEvents: options?.singleEvents !== false,
    orderBy: options?.orderBy || 'startTime',
  });

  if (!response.data.items) {
    return [];
  }

  return response.data.items.map((item): CalendarEvent => {
    const startDate = item.start?.dateTime || item.start?.date;
    const endDate = item.end?.dateTime || item.end?.date;

    return {
      id: item.id || '',
      summary: item.summary ?? 'Untitled Event',
      description: item.description ?? undefined,
      location: item.location ?? undefined,
      startTime: new Date(startDate || new Date()),
      endTime: new Date(endDate || new Date()),
      timezone: item.start?.timeZone ?? undefined,
      status: (item.status as any) || 'confirmed',
      attendees: item.attendees?.map((attendee) => ({
        email: attendee.email || '',
        displayName: attendee.displayName ?? undefined,
        responseStatus: (attendee.responseStatus as any) ?? 'needsAction',
        optional: attendee.optional ?? false,
      })),
      organizer: item.organizer
        ? {
            email: item.organizer.email || '',
            displayName: item.organizer.displayName ?? undefined,
          }
        : undefined,
      hangoutLink: item.hangoutLink ?? undefined,
      htmlLink: item.htmlLink ?? undefined,
      conferenceData: item.conferenceData as any,
    };
  });
}

/**
 * Filter events based on criteria
 */
export function filterEvents(
  events: CalendarEvent[],
  options: EventFilterOptions
): CalendarEvent[] {
  return events.filter((event) => {
    // Date range filter
    if (options.startDate && event.startTime < options.startDate) {
      return false;
    }
    if (options.endDate && event.endTime > options.endDate) {
      return false;
    }

    // Location filter
    if (options.hasLocation !== undefined) {
      const hasLocation = !!event.location && event.location.trim().length > 0;
      if (options.hasLocation && !hasLocation) {
        return false;
      }
      if (!options.hasLocation && hasLocation) {
        return false;
      }
    }

    // Location keyword filter
    if (options.locationKeyword && event.location) {
      if (!event.location.toLowerCase().includes(options.locationKeyword.toLowerCase())) {
        return false;
      }
    }

    // Status filter
    if (options.status && !options.status.includes(event.status)) {
      return false;
    }

    // Attendee filter
    if (options.attendeeEmail && event.attendees) {
      const hasAttendee = event.attendees.some(
        (att) => att.email.toLowerCase() === options.attendeeEmail?.toLowerCase()
      );
      if (!hasAttendee) {
        return false;
      }
    }

    // Duration filter
    if (options.minDurationMinutes) {
      const durationMinutes = (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
      if (durationMinutes < options.minDurationMinutes) {
        return false;
      }
    }

    if (options.maxDurationMinutes) {
      const durationMinutes = (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
      if (durationMinutes > options.maxDurationMinutes) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort events by various criteria
 */
export function sortEvents(
  events: CalendarEvent[],
  sortBy: EventSortBy = EventSortBy.START_TIME,
  ascending = true
): CalendarEvent[] {
  const sorted = [...events];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case EventSortBy.START_TIME:
        comparison = a.startTime.getTime() - b.startTime.getTime();
        break;

      case EventSortBy.END_TIME:
        comparison = a.endTime.getTime() - b.endTime.getTime();
        break;

      case EventSortBy.TITLE:
        comparison = a.summary.localeCompare(b.summary);
        break;

      case EventSortBy.LOCATION:
        comparison = (a.location || '').localeCompare(b.location || '');
        break;

      case EventSortBy.DURATION:
        const durationA = a.endTime.getTime() - a.startTime.getTime();
        const durationB = b.endTime.getTime() - b.startTime.getTime();
        comparison = durationA - durationB;
        break;

      case EventSortBy.ATTENDEE_COUNT:
        comparison = (b.attendees?.length || 0) - (a.attendees?.length || 0);
        break;

      default:
        comparison = 0;
    }

    return ascending ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Enrich events with geocoded locations
 */
export async function enrichEventsWithLocations(
  events: CalendarEvent[]
): Promise<EventWithLocation[]> {
  const eventsWithLocation = events.filter((e) => e.location);

  const enriched = await Promise.all(
    eventsWithLocation.map(async (event) => {
      try {
        const geocoded = await geocodeAddress(event.location!);
        return {
          ...event,
          geocoded,
        } as EventWithLocation;
      } catch (error) {
        return {
          ...event,
          geocodeError: error instanceof Error ? error.message : 'Geocoding failed',
        } as EventWithLocation;
      }
    })
  );

  return enriched;
}

/**
 * Get events with locations only
 */
export function getEventsWithLocations(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((e) => e.location && e.location.trim().length > 0);
}

/**
 * Calculate event duration in minutes
 */
export function getEventDuration(event: CalendarEvent): number {
  return (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
}

/**
 * Group events by date
 */
export function groupEventsByDate(
  events: CalendarEvent[]
): Record<string, CalendarEvent[]> {
  const grouped: Record<string, CalendarEvent[]> = {};

  for (const event of events) {
    const dateKey = event.startTime.toISOString().split('T')[0];

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(event);
  }

  return grouped;
}

/**
 * Group events by location
 */
export function groupEventsByLocation(
  events: CalendarEvent[]
): Record<string, CalendarEvent[]> {
  const grouped: Record<string, CalendarEvent[]> = {};

  for (const event of events) {
    if (!event.location) continue;

    if (!grouped[event.location]) {
      grouped[event.location] = [];
    }

    grouped[event.location].push(event);
  }

  return grouped;
}

/**
 * Calculate statistics about calendar events
 */
export function calculateStatistics(events: CalendarEvent[]): CalendarStatistics {
  const eventsWithLocation = getEventsWithLocations(events);
  const locationGroups = groupEventsByLocation(events);
  const dateGroups = groupEventsByDate(events);
  const statusGroups: Record<string, number> = {};

  let totalAttendees = 0;
  let eventCount = 0;

  for (const event of events) {
    const attendeeCount = event.attendees?.length || 0;
    totalAttendees += attendeeCount;
    eventCount++;

    if (!statusGroups[event.status]) {
      statusGroups[event.status] = 0;
    }
    statusGroups[event.status]++;
  }

  return {
    totalEvents: events.length,
    eventsWithLocation: eventsWithLocation.length,
    locationPercentage:
      events.length > 0 ? Math.round((eventsWithLocation.length / events.length) * 100) : 0,
    uniqueLocations: Object.keys(locationGroups).length,
    averageAttendees: eventCount > 0 ? Math.round(totalAttendees / eventCount) : 0,
    upcomingEventCount: events.length,
    eventsByDay: Object.entries(dateGroups).reduce(
      (acc, [date, evts]) => {
        acc[date] = evts.length;
        return acc;
      },
      {} as Record<string, number>
    ),
    eventsByLocation: Object.entries(locationGroups).reduce(
      (acc, [location, evts]) => {
        acc[location] = evts.length;
        return acc;
      },
      {} as Record<string, number>
    ),
    eventsByStatus: statusGroups,
  };
}

/**
 * Find events near a location
 */
export function findEventsNearLocation(
  events: EventWithLocation[],
  center: { lat: number; lng: number },
  radiusKm: number
): EventWithLocation[] {
  const { calculateDistance } = require('@/lib/geocoding');

  return events.filter((event) => {
    if (!event.geocoded) return false;

    const distance = calculateDistance(
      center.lat,
      center.lng,
      event.geocoded.coordinates.lat,
      event.geocoded.coordinates.lng
    );

    return distance <= radiusKm;
  });
}

/**
 * Get upcoming events (next N days)
 */
export function getUpcomingEvents(events: CalendarEvent[], daysAhead = 30): CalendarEvent[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return filterEvents(events, {
    startDate: now,
    endDate: futureDate,
  });
}

/**
 * Get all-day events
 */
export function getAllDayEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((event) => {
    // All-day events have only date, not time
    const isSameDate =
      event.startTime.toISOString().split('T')[0] ===
      event.endTime.toISOString().split('T')[0];
    const startHour = event.startTime.getHours();
    const endHour = event.endTime.getHours();

    return isSameDate && startHour === 0 && endHour === 0;
  });
}

/**
 * Find conflicting events
 */
export function findConflictingEvents(events: CalendarEvent[]): CalendarEvent[][] {
  const conflicts: CalendarEvent[][] = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const eventA = events[i];
      const eventB = events[j];

      // Check if events overlap
      if (eventA.startTime < eventB.endTime && eventA.endTime > eventB.startTime) {
        conflicts.push([eventA, eventB]);
      }
    }
  }

  return conflicts;
}
