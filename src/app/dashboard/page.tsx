/**
 * Dashboard page - Main calendar map view with filters and event list
 */

'use client';

import { useEffect, useState } from 'react';
import { CalendarMap } from '@/components/CalendarMap';
import { EventList } from '@/components/EventList';
import { EventFilters, FilterState } from '@/components/EventFilters';
import { EventWithLocation, EventSortBy, CalendarStatistics } from '@/types';

interface Event {
  id: string;
  summary: string;
  location?: string;
  startTime: string;
  endTime: string;
  status: string;
  description?: string;
  attendees?: any[];
  htmlLink?: string;
  hangoutLink?: string;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EventWithLocation[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [stats, setStats] = useState<CalendarStatistics | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    locationOnly: true,
    showGeocoded: true,
    showFailed: false,
  });
  const [sortBy, setSortBy] = useState<EventSortBy>(EventSortBy.START_TIME);
  const [locationKeyword, setLocationKeyword] = useState('');

  /**
   * Fetch calendar events
   */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          daysAhead: '60',
          maxResults: '100',
          sortBy: sortBy,
          locationOnly: 'true',
          includeGeocoding: 'true',
        });

        if (locationKeyword) {
          params.append('locationKeyword', locationKeyword);
        }

        const response = await fetch(`/api/events?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch events');
        }

        const data = await response.json();
        const transformedEvents = transformEvents(data.data || []);

        setEvents(transformedEvents);
        applyFilters(transformedEvents, filters, sortBy, locationKeyword);
        calculateStats(transformedEvents);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMsg);
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
        setGeocoding(false);
      }
    };

    fetchEvents();

    // Refresh events every 5 minutes
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Transform API response to internal format
   */
  function transformEvents(apiEvents: any[]): EventWithLocation[] {
    return apiEvents.map((event: any) => ({
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      status: event.status,
      attendees: event.attendees,
      organizer: event.organizer,
      htmlLink: event.htmlLink,
      hangoutLink: event.hangoutLink,
      geocoded: event.geocoded,
      geocodeError: event.geocodeError,
    }));
  }

  /**
   * Calculate statistics
   */
  function calculateStats(events: EventWithLocation[]) {
    const withLocation = events.filter((e) => e.location);
    const geocoded = events.filter((e) => e.geocoded && !e.geocodeError);

    setStats({
      totalEvents: events.length,
      eventsWithLocation: withLocation.length,
      locationPercentage:
        events.length > 0
          ? Math.round((withLocation.length / events.length) * 100)
          : 0,
      uniqueLocations: new Set(
        withLocation.map((e) => e.location)
      ).size,
      averageAttendees: Math.round(
        events.reduce((sum, e) => sum + (e.attendees?.length || 0), 0) /
          Math.max(events.length, 1)
      ),
      upcomingEventCount: events.length,
      eventsByDay: {},
      eventsByLocation: {},
      eventsByStatus: {},
    });
  }

  /**
   * Apply filters and sorting
   */
  function applyFilters(
    source: EventWithLocation[],
    filterState: FilterState,
    sortByOption: EventSortBy,
    keyword: string
  ) {
    let result = [...source];

    // Apply filters
    if (filterState.locationOnly) {
      result = result.filter((e) => e.location);
    }

    if (!filterState.showFailed) {
      result = result.filter((e) => !e.geocodeError);
    }

    if (keyword) {
      result = result.filter((e) =>
        e.location?.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortByOption) {
      case EventSortBy.START_TIME:
        result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        break;
      case EventSortBy.TITLE:
        result.sort((a, b) => a.summary.localeCompare(b.summary));
        break;
      case EventSortBy.LOCATION:
        result.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
        break;
    }

    setFilteredEvents(result);
  }

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    applyFilters(events, newFilters, sortBy, locationKeyword);
  };

  /**
   * Handle sort changes
   */
  const handleSortChange = (newSortBy: EventSortBy) => {
    setSortBy(newSortBy);
    applyFilters(events, filters, newSortBy, locationKeyword);
  };

  /**
   * Handle location keyword changes
   */
  const handleLocationKeywordChange = (keyword: string) => {
    setLocationKeyword(keyword);
    applyFilters(events, filters, sortBy, keyword);
  };

  /**
   * Handle event selection
   */
  const handleEventClick = (event: EventWithLocation) => {
    setSelectedEventId(event.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Calendar Events Map
          </h1>
          <p className="text-gray-600">
            Your Google Calendar events with locations displayed on an interactive map
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Events</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Events"
              value={stats.totalEvents}
              icon="📅"
            />
            <StatCard
              label="With Locations"
              value={stats.eventsWithLocation}
              icon="📍"
              secondary={`${stats.locationPercentage}%`}
            />
            <StatCard
              label="Unique Locations"
              value={stats.uniqueLocations}
              icon="🗺️"
            />
            <StatCard
              label="Avg Attendees"
              value={stats.averageAttendees}
              icon="👥"
            />
          </div>
        )}

        {/* Filters */}
        <EventFilters
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onLocationFilterChange={handleLocationKeywordChange}
        />

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading your events...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                style={{ height: '700px' }}
              >
                <CalendarMap
                  events={filteredEvents}
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                  loading={geocoding}
                  onMarkerClick={handleEventClick}
                  selectedEventId={selectedEventId}
                />
              </div>
            </div>

            {/* Event List Sidebar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto shadow-sm" style={{ maxHeight: '700px' }}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Events ({filteredEvents.length})
              </h2>
              <EventList
                events={filteredEvents}
                loading={loading}
                onEventClick={handleEventClick}
                highlightedEventId={selectedEventId}
                showGeocodeErrors={filters.showFailed}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Statistics card component
 */
function StatCard({
  label,
  value,
  icon,
  secondary,
}: {
  label: string;
  value: number | string;
  icon: string;
  secondary?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {secondary && <div className="text-sm text-gray-600">{secondary}</div>}
      <div className="text-xs text-gray-600 mt-2">{label}</div>
    </div>
  );
}
