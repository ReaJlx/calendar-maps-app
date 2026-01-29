/**
 * Dashboard page - Main calendar map view
 */

'use client';

import { useEffect, useState } from 'react';
import { CalendarMap } from '@/components/CalendarMap';

interface Event {
  id: string;
  summary: string;
  location: string;
  startTime: string;
  endTime: string;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events?daysAhead=30&maxResults=100');
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data.events || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Refresh events every 5 minutes
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Calendar Events Map
          </h1>
          <p className="text-gray-600">
            Your Google Calendar events with locations displayed on a map
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading your events...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Found <strong>{events.length}</strong> events with locations in the next 30 days
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm" style={{ height: '700px' }}>
              {events.length > 0 ? (
                <CalendarMap
                  events={events.map((event) => ({
                    ...event,
                    coordinates: undefined,
                  }))}
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500 text-lg">No events with locations found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Add locations to your calendar events to see them here
                    </p>
                  </div>
                </div>
              )}
            </div>

            {events.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Upcoming Events
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {event.summary}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        📍 {event.location}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(event.startTime).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
