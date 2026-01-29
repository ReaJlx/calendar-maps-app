/**
 * Enhanced Calendar Map component with markers and info windows
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { EventWithLocation } from '@/types';
import { calculateBounds } from '@/lib/geocoding';

interface CalendarMapProps {
  events: EventWithLocation[];
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (event: EventWithLocation) => void;
  selectedEventId?: string | null;
  loading?: boolean;
}

const mapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
};

const defaultCenter = { lat: 48.8566, lng: 2.3522 }; // Paris as default

/**
 * Get color for marker based on event status
 */
function getMarkerColor(event: EventWithLocation): string {
  if (event.geocodeError) {
    return '#fbbf24'; // Amber for errors
  }
  if (event.status === 'cancelled') {
    return '#ef4444'; // Red for cancelled
  }
  if (event.status === 'tentative') {
    return '#94a3b8'; // Gray for tentative
  }
  return '#3b82f6'; // Blue for confirmed
}

/**
 * Calculate appropriate zoom level for bounds
 */
function getZoomLevel(bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }): number {
  const latDiff = Math.abs(bounds.ne.lat - bounds.sw.lat);
  const lngDiff = Math.abs(bounds.ne.lng - bounds.sw.lng);

  if (latDiff === 0 && lngDiff === 0) return 14;

  const maxDiff = Math.max(latDiff, lngDiff);
  if (maxDiff > 10) return 6;
  if (maxDiff > 5) return 8;
  if (maxDiff > 1) return 10;
  if (maxDiff > 0.1) return 12;
  return 14;
}

export function CalendarMap({
  events,
  apiKey,
  center = defaultCenter,
  zoom = 12,
  onMarkerClick,
  selectedEventId,
  loading = false,
}: CalendarMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(selectedEventId || null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [infoWindowEvent, setInfoWindowEvent] = useState<EventWithLocation | null>(null);

  // Update map bounds when events change
  useEffect(() => {
    if (events.length === 0 || !map) return;

    const geocodedEvents = events.filter((e) => e.geocoded?.coordinates);

    if (geocodedEvents.length === 0) {
      // Reset to default center if no geocoded events
      setMapCenter(center);
      setMapZoom(zoom);
      return;
    }

    if (geocodedEvents.length === 1) {
      // Center on single event
      const coords = geocodedEvents[0].geocoded!.coordinates;
      setMapCenter(coords);
      setMapZoom(14);
      return;
    }

    // Calculate bounds for all events
    const points = geocodedEvents.map((e) => e.geocoded!.coordinates);
    const bounds = calculateBounds(points);
    const newZoom = getZoomLevel(bounds);

    // Calculate center of bounds
    const centerLat = (bounds.ne.lat + bounds.sw.lat) / 2;
    const centerLng = (bounds.ne.lng + bounds.sw.lng) / 2;

    setMapCenter({ lat: centerLat, lng: centerLng });
    setMapZoom(newZoom);
  }, [events, map]);

  const onLoad = React.useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (event: EventWithLocation) => {
    setSelectedMarker(event.id);
    setInfoWindowEvent(event);
    onMarkerClick?.(event);
  };

  // Render loading state
  if (loading) {
    return (
      <div
        style={mapContainerStyle}
        className="flex items-center justify-center bg-gray-100 rounded-lg"
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  // Get events with geocoded locations
  const geocodedEvents = events.filter((e) => e.geocoded?.coordinates);

  // Render no geocoded events state
  if (geocodedEvents.length === 0) {
    return (
      <div
        style={mapContainerStyle}
        className="flex items-center justify-center bg-gray-100 rounded-lg"
      >
        <div className="text-center">
          <p className="text-gray-600">No events with locations to display</p>
          <p className="text-gray-400 text-sm mt-1">Geocoding events...</p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            {
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }],
            },
            {
              elementType: 'labels.icon',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'administrative.land_parcel',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#bdbdbd' }],
            },
          ],
        }}
      >
        {geocodedEvents.map((event) => (
          <React.Fragment key={event.id}>
            {/* Marker */}
            <Marker
              position={event.geocoded!.coordinates}
              onClick={() => handleMarkerClick(event)}
              title={event.summary}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: event.id === selectedMarker ? 12 : 8,
                fillColor: getMarkerColor(event),
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              zIndex={event.id === selectedMarker ? 100 : 50}
            />

            {/* Info Window */}
            {selectedMarker === event.id && infoWindowEvent === event && (
              <InfoWindow
                position={event.geocoded!.coordinates}
                onCloseClick={() => {
                  setSelectedMarker(null);
                  setInfoWindowEvent(null);
                }}
              >
                <div className="p-3 max-w-sm bg-white rounded-lg">
                  {/* Title */}
                  <h3 className="font-bold text-sm mb-2 text-gray-900">
                    {event.summary}
                  </h3>

                  {/* Location */}
                  <div className="text-xs text-gray-700 mb-2">
                    <div className="font-semibold mb-1">📍 Location:</div>
                    <div className="text-gray-600">{event.location}</div>
                    {event.geocoded && (
                      <div className="text-gray-500 text-xs mt-1">
                        {event.geocoded.formattedAddress}
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <div className="text-xs text-gray-700 mb-2">
                    <div className="font-semibold mb-1">🕐 Time:</div>
                    <div className="text-gray-600">
                      {new Date(event.startTime).toLocaleString()}
                    </div>
                  </div>

                  {/* Attendees */}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="text-xs text-gray-700 mb-2">
                      <div className="font-semibold mb-1">
                        👥 Attendees ({event.attendees.length}):
                      </div>
                      <div className="text-gray-600 max-h-16 overflow-y-auto">
                        {event.attendees.map((att) => (
                          <div key={att.email} className="text-xs">
                            {att.displayName || att.email}
                            {att.responseStatus !== 'accepted' && (
                              <span className="text-gray-400 ml-1">
                                ({att.responseStatus})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {event.description && (
                    <div className="text-xs text-gray-700 mb-2">
                      <div className="font-semibold mb-1">📝 Description:</div>
                      <div className="text-gray-600 max-h-20 overflow-y-auto">
                        {event.description}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 pt-2 border-t border-gray-200 flex gap-2">
                    {event.htmlLink && (
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        View in Calendar
                      </a>
                    )}
                    {event.hangoutLink && (
                      <a
                        href={event.hangoutLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>

                  {/* Error message */}
                  {event.geocodeError && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      {event.geocodeError}
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
