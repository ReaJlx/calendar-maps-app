/**
 * Geocoding service with caching and error handling
 */

import { GeocodedLocation, CacheEntry } from '@/types';

/**
 * In-memory cache for geocoding results
 */
const geocodeCache = new Map<string, CacheEntry<GeocodedLocation>>();

/**
 * Cache TTL in milliseconds (1 hour)
 */
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Maximum cache size to prevent memory bloat
 */
const MAX_CACHE_SIZE = 1000;

/**
 * Get cache key from address
 */
function getCacheKey(address: string): string {
  return address.toLowerCase().trim();
}

/**
 * Clear expired cache entries
 */
function clearExpiredCache(): void {
  const now = Date.now();
  let cleared = 0;

  for (const [key, entry] of geocodeCache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      geocodeCache.delete(key);
      cleared++;
    }
  }

  if (cleared > 0) {
    console.log(`Cleared ${cleared} expired geocoding cache entries`);
  }
}

/**
 * Enforce cache size limit
 */
function enforceMaxCacheSize(): void {
  if (geocodeCache.size > MAX_CACHE_SIZE) {
    // Remove oldest entries
    const entries = Array.from(geocodeCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toDelete = entries.length - MAX_CACHE_SIZE;
    for (let i = 0; i < toDelete; i++) {
      geocodeCache.delete(entries[i][0]);
    }

    console.log(`Cache size exceeded. Removed ${toDelete} entries.`);
  }
}

/**
 * Get cached result for an address
 */
function getCachedResult(address: string): GeocodedLocation | null {
  const key = getCacheKey(address);
  const entry = geocodeCache.get(key);

  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    geocodeCache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Cache a geocoding result
 */
function cacheResult(address: string, location: GeocodedLocation): void {
  const key = getCacheKey(address);
  geocodeCache.set(key, {
    data: location,
    timestamp: Date.now(),
    ttl: CACHE_TTL,
  });

  enforceMaxCacheSize();
}

/**
 * Parse coordinates from location string
 * Supports formats like "(40.7128, -74.0060)" or "40.7128,-74.0060"
 */
export function parseCoordinatesFromLocation(location: string): {
  coordinates?: { lat: number; lng: number };
  address: string;
} {
  // Try to match coordinates in parentheses
  const parenMatch = location.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
  if (parenMatch) {
    return {
      address: location.replace(parenMatch[0], '').trim(),
      coordinates: {
        lat: parseFloat(parenMatch[1]),
        lng: parseFloat(parenMatch[2]),
      },
    };
  }

  // Try to match coordinates without parentheses
  const coordMatch = location.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return {
      address: location,
      coordinates: {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2]),
      },
    };
  }

  return { address: location };
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Geocode a single address using Google Geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeocodedLocation> {
  // Check cache first
  const cached = getCachedResult(address);
  if (cached) {
    console.log(`[Geocoding] Cache hit for "${address}"`);
    return cached;
  }

  if (!address || address.trim().length === 0) {
    throw new Error('Address is required');
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error_message) {
      throw new Error(`Geocoding API error: ${data.error_message}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error(`No geocoding results found for "${address}"`);
    }

    const result = data.results[0];
    const location: GeocodedLocation = {
      address,
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      placeId: result.place_id,
    };

    // Parse address components
    if (result.address_components) {
      const components: Record<string, string> = {};

      for (const component of result.address_components) {
        if (component.types.includes('country')) {
          components.country = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          components.state = component.short_name;
        } else if (component.types.includes('locality')) {
          components.city = component.long_name;
        } else if (component.types.includes('route')) {
          components.street = component.long_name;
        }
      }

      if (Object.keys(components).length > 0) {
        location.components = components;
      }
    }

    // Cache the result
    cacheResult(address, location);

    console.log(`[Geocoding] Successfully geocoded "${address}"`);
    return location;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Geocoding] Failed to geocode "${address}":`, errorMessage);
    throw error;
  }
}

/**
 * Batch geocode multiple addresses
 */
export async function batchGeocodeAddresses(
  addresses: string[],
  parallel = 5
): Promise<Map<string, GeocodedLocation>> {
  const results = new Map<string, GeocodedLocation>();
  const errors = new Map<string, string>();

  // Remove duplicates
  const uniqueAddresses = Array.from(new Set(addresses));

  // Process in parallel chunks
  for (let i = 0; i < uniqueAddresses.length; i += parallel) {
    const chunk = uniqueAddresses.slice(i, i + parallel);
    const promises = chunk.map((addr) =>
      geocodeAddress(addr)
        .then((location) => {
          results.set(addr, location);
        })
        .catch((error) => {
          errors.set(addr, error instanceof Error ? error.message : 'Unknown error');
        })
    );

    await Promise.all(promises);

    // Add small delay between chunks to avoid rate limiting
    if (i + parallel < uniqueAddresses.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (errors.size > 0) {
    console.warn(`[Geocoding] ${errors.size} addresses failed to geocode:`, Object.fromEntries(errors));
  }

  return results;
}

/**
 * Calculate distance between two coordinates (haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find bounding box for a set of coordinates
 */
export function calculateBounds(
  points: Array<{ lat: number; lng: number }>
): { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } } {
  if (points.length === 0) {
    return {
      ne: { lat: 0, lng: 0 },
      sw: { lat: 0, lng: 0 },
    };
  }

  let maxLat = points[0].lat;
  let minLat = points[0].lat;
  let maxLng = points[0].lng;
  let minLng = points[0].lng;

  for (const point of points) {
    maxLat = Math.max(maxLat, point.lat);
    minLat = Math.min(minLat, point.lat);
    maxLng = Math.max(maxLng, point.lng);
    minLng = Math.min(minLng, point.lng);
  }

  return {
    ne: { lat: maxLat, lng: maxLng },
    sw: { lat: minLat, lng: minLng },
  };
}

/**
 * Clear the geocoding cache
 */
export function clearGeocodeCache(): void {
  const size = geocodeCache.size;
  geocodeCache.clear();
  console.log(`[Geocoding] Cleared ${size} cache entries`);
}

/**
 * Get cache statistics
 */
export function getGeocachStats(): {
  size: number;
  maxSize: number;
  ttl: number;
} {
  return {
    size: geocodeCache.size,
    maxSize: MAX_CACHE_SIZE,
    ttl: CACHE_TTL,
  };
}

/**
 * Perform periodic cache maintenance
 */
export function startCacheMaintenanceInterval(intervalMs = 5 * 60 * 1000): NodeJS.Timer {
  return setInterval(() => {
    clearExpiredCache();
  }, intervalMs);
}
