/**
 * React hook for geocoding addresses
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { GeocodedLocation } from '@/types';

interface UseGeocodingOptions {
  cacheResults?: boolean;
}

interface UseGeocodingReturn {
  geocode: (address: string) => Promise<GeocodedLocation | null>;
  batchGeocode: (addresses: string[]) => Promise<Record<string, GeocodedLocation>>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  cache: Map<string, GeocodedLocation>;
  clearCache: () => void;
}

const globalCache = new Map<string, GeocodedLocation>();

export function useGeocoding(options: UseGeocodingOptions = {}): UseGeocodingReturn {
  const { cacheResults = true } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, GeocodedLocation>>(
    cacheResults ? globalCache : new Map()
  );

  /**
   * Get cache key for address
   */
  const getCacheKey = (address: string): string => {
    return address.toLowerCase().trim();
  };

  /**
   * Geocode a single address
   */
  const geocode = useCallback(
    async (address: string): Promise<GeocodedLocation | null> => {
      if (!address || address.trim().length === 0) {
        setError('Address is required');
        return null;
      }

      const cacheKey = getCacheKey(address);

      // Check cache
      if (cacheResults && cacheRef.current.has(cacheKey)) {
        return cacheRef.current.get(cacheKey)!;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Geocoding failed (${response.status})`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Geocoding failed');
        }

        const location = data.data as GeocodedLocation;

        // Cache result
        if (cacheResults) {
          cacheRef.current.set(cacheKey, location);
        }

        return location;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [cacheResults]
  );

  /**
   * Batch geocode multiple addresses
   */
  const batchGeocode = useCallback(
    async (addresses: string[]): Promise<Record<string, GeocodedLocation>> => {
      if (!addresses || addresses.length === 0) {
        setError('At least one address is required');
        return {};
      }

      if (addresses.length > 100) {
        setError('Maximum 100 addresses per request');
        return {};
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addresses,
            batch: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Batch geocoding failed (${response.status})`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Batch geocoding failed');
        }

        const results = (data.data || {}) as Record<string, GeocodedLocation>;

        // Cache results
        if (cacheResults) {
          for (const [address, location] of Object.entries(results)) {
            const cacheKey = getCacheKey(address);
            cacheRef.current.set(cacheKey, location);
          }
        }

        return results;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMsg);
        return {};
      } finally {
        setLoading(false);
      }
    },
    [cacheResults]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    geocode,
    batchGeocode,
    loading,
    error,
    clearError,
    cache: cacheRef.current,
    clearCache,
  };
}
