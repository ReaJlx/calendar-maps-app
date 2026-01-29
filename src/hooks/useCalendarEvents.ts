/**
 * React hook for fetching calendar events
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { EventWithLocation, EventSortBy, CalendarStatistics } from '@/types';

interface UseCalendarEventsOptions {
  daysAhead?: number;
  maxResults?: number;
  sortBy?: EventSortBy;
  locationOnly?: boolean;
  includeGeocoding?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseCalendarEventsReturn {
  events: EventWithLocation[];
  loading: boolean;
  error: string | null;
  statistics: CalendarStatistics | null;
  refresh: () => Promise<void>;
  setError: (error: string | null) => void;
}

export function useCalendarEvents(
  options: UseCalendarEventsOptions = {}
): UseCalendarEventsReturn {
  const {
    daysAhead = 30,
    maxResults = 100,
    sortBy = EventSortBy.START_TIME,
    locationOnly = true,
    includeGeocoding = true,
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [events, setEvents] = useState<EventWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<CalendarStatistics | null>(null);

  /**
   * Fetch events from API
   */
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        daysAhead: String(daysAhead),
        maxResults: String(maxResults),
        sortBy,
        locationOnly: String(locationOnly),
        includeGeocoding: String(includeGeocoding),
      });

      const response = await fetch(`/api/events?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch events (${response.status})`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch events');
      }

      const transformedEvents = (data.data || []).map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      }));

      setEvents(transformedEvents);

      // Calculate statistics
      if (transformedEvents.length > 0) {
        const withLocation = transformedEvents.filter((e: EventWithLocation) => e.location);
        const stats: CalendarStatistics = {
          totalEvents: transformedEvents.length,
          eventsWithLocation: withLocation.length,
          locationPercentage:
            transformedEvents.length > 0
              ? Math.round((withLocation.length / transformedEvents.length) * 100)
              : 0,
          uniqueLocations: new Set(
            withLocation.map((e: EventWithLocation) => e.location)
          ).size,
          averageAttendees: Math.round(
            transformedEvents.reduce(
              (sum: number, e: EventWithLocation) => sum + (e.attendees?.length || 0),
              0
            ) / transformedEvents.length
          ),
          upcomingEventCount: transformedEvents.length,
          eventsByDay: {},
          eventsByLocation: {},
          eventsByStatus: {},
        };

        setStatistics(stats);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [daysAhead, maxResults, sortBy, locationOnly, includeGeocoding]);

  // Fetch on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchEvents, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchEvents, autoRefresh, refreshInterval]);

  return {
    events,
    loading,
    error,
    statistics,
    refresh: fetchEvents,
    setError,
  };
}
