/**
 * Google Calendar API client and utilities
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  hangoutLink?: string;
  htmlLink?: string;
}

/**
 * Create OAuth2 client with credentials
 */
export function getOAuth2Client(): OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/api/auth/callback/google'
  );

  if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  return oauth2Client;
}

/**
 * Fetch calendar events for the authenticated user
 */
export async function getCalendarEvents(
  auth: OAuth2Client,
  timeMin?: string,
  timeMax?: string,
  maxResults: number = 50
): Promise<CalendarEvent[]> {
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax,
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events: CalendarEvent[] = [];

  if (response.data.items) {
    for (const item of response.data.items) {
      const event: CalendarEvent = {
        id: item.id || '',
        summary: item.summary || 'Untitled Event',
        description: item.description,
        startTime: new Date(item.start?.dateTime || item.start?.date || ''),
        endTime: new Date(item.end?.dateTime || item.end?.date || ''),
        location: item.location,
        hangoutLink: item.hangoutLink,
        htmlLink: item.htmlLink,
      };

      events.push(event);
    }
  }

  return events;
}

/**
 * Filter events to only those with location data
 */
export function filterEventsWithLocation(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((event) => event.location && event.location.trim().length > 0);
}

/**
 * Parse location string from event
 * Could contain address, coordinates, or just a place name
 */
export function parseEventLocation(
  location: string
): { address: string; coordinates?: { lat: number; lng: number } } {
  // Check if location contains coordinates (lat, lng format)
  const coordRegex = /\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/;
  const match = location.match(coordRegex);

  if (match) {
    return {
      address: location.replace(coordRegex, '').trim(),
      coordinates: {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      },
    };
  }

  return {
    address: location,
  };
}
