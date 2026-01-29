/**
 * Event list component displaying calendar events
 */

'use client';

import React from 'react';
import { EventWithLocation } from '@/types';

interface EventListProps {
  events: EventWithLocation[];
  loading?: boolean;
  onEventClick?: (event: EventWithLocation) => void;
  onEventHover?: (eventId: string | null) => void;
  highlightedEventId?: string | null;
  showGeocodeErrors?: boolean;
}

/**
 * Format date for display
 */
function formatEventDate(date: Date): string {
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate duration in minutes
 */
function getDuration(startTime: Date, endTime: Date): number {
  return Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60));
}

/**
 * Format duration
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

export function EventList({
  events,
  loading = false,
  onEventClick,
  onEventHover,
  highlightedEventId,
  showGeocodeErrors = false,
}: EventListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 animate-pulse rounded-lg p-4 h-24"
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg font-medium">No events found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const duration = getDuration(event.startTime, event.endTime);
        const isHighlighted = highlightedEventId === event.id;
        const hasGeocodeError = event.geocodeError;
        const isGeocoded = event.geocoded && !hasGeocodeError;

        // Skip failed geocodes if not showing errors
        if (!showGeocodeErrors && hasGeocodeError) {
          return null;
        }

        return (
          <div
            key={event.id}
            onClick={() => onEventClick?.(event)}
            onMouseEnter={() => onEventHover?.(event.id)}
            onMouseLeave={() => onEventHover?.(null)}
            className={`
              p-4 border rounded-lg cursor-pointer transition-all
              ${
                isHighlighted
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : hasGeocodeError
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:shadow-md'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {event.summary}
                </h3>

                <div className="flex flex-col gap-2 text-xs text-gray-600">
                  {/* Time */}
                  <div className="flex items-center gap-2">
                    <span>🕐</span>
                    <span>{formatEventDate(event.startTime)}</span>
                    <span className="text-gray-400">
                      ({formatDuration(duration)})
                    </span>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5">📍</span>
                      <div className="flex-1">
                        <div>{event.location}</div>
                        {isGeocoded && event.geocoded && (
                          <div className="text-gray-400 text-xs mt-1">
                            {event.geocoded.formattedAddress}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attendees */}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>{event.attendees.length} attendees</span>
                    </div>
                  )}

                  {/* Error message */}
                  {hasGeocodeError && (
                    <div className="text-yellow-700 text-xs flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{event.geocodeError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0 ml-2">
                {isGeocoded && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Geocoded" />
                )}
                {!isGeocoded && event.location && (
                  <div
                    className="w-2 h-2 bg-yellow-500 rounded-full"
                    title="Not geocoded"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
