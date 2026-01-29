'use client';

import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';

interface EventLocation {
  id: string;
  summary: string;
  location: string;
  startTime: string;
  endTime: string;
  coordinates?: { lat: number; lng: number };
}

interface CalendarMapProps {
  events: EventLocation[];
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const mapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '600px',
};

const defaultCenter = { lat: 48.8566, lng: 2.3522 }; // Paris as default

export function CalendarMap({
  events,
  apiKey,
  center = defaultCenter,
  zoom = 12,
}: CalendarMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [geocodedEvents, setGeocodedEvents] = useState<EventLocation[]>([]);

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  // Geocode events without coordinates
  useEffect(() => {
    const geocodeEvent = async (event: EventLocation) => {
      if (event.coordinates) {
        return event;
      }

      try {
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: event.location }),
        });

        if (response.ok) {
          const data = await response.json();
          return { ...event, coordinates: data.coordinates };
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }

      return event;
    };

    Promise.all(events.map(geocodeEvent)).then(setGeocodedEvents);
  }, [events]);

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {geocodedEvents.map((event) =>
          event.coordinates ? (
            <React.Fragment key={event.id}>
              <Marker
                position={event.coordinates}
                onClick={() => setSelectedMarker(event.id)}
                title={event.summary}
              />

              {selectedMarker === event.id && (
                <InfoWindow
                  position={event.coordinates}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2 max-w-xs">
                    <h3 className="font-bold text-sm mb-1">{event.summary}</h3>
                    <p className="text-xs text-gray-600 mb-1">
                      📍 {event.location}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.startTime).toLocaleString()}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          ) : null
        )}
      </GoogleMap>
    </LoadScript>
  );
}
