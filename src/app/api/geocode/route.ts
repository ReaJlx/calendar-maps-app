/**
 * API routes for geocoding addresses and batch geocoding
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  geocodeAddress,
  batchGeocodeAddresses,
  parseCoordinatesFromLocation,
  isValidCoordinates,
} from '@/lib/geocoding';
import { GeocodingResponse, BatchGeocodeResponse, ApiResponse } from '@/types';

/**
 * POST /api/geocode - Geocode a single address or batch of addresses
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { address, addresses, batch = false } = body;

    // Handle batch geocoding
    if (batch && addresses && Array.isArray(addresses)) {
      return handleBatchGeocoding(addresses);
    }

    // Handle single address
    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'address parameter is required and must be a string',
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Try to parse coordinates from the address first
    const parsed = parseCoordinatesFromLocation(address);
    if (
      parsed.coordinates &&
      isValidCoordinates(parsed.coordinates.lat, parsed.coordinates.lng)
    ) {
      const response: GeocodingResponse = {
        success: true,
        data: {
          address,
          formattedAddress: address,
          coordinates: parsed.coordinates,
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    }

    // Geocode using Google API
    try {
      const location = await geocodeAddress(address);

      const response: GeocodingResponse = {
        success: true,
        data: location,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Geocoding failed';

      return NextResponse.json(
        {
          success: false,
          error: 'Geocoding failed',
          message: errorMsg,
          timestamp: new Date().toISOString(),
        } as GeocodingResponse,
        { status: 404 }
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Invalid request';

    return NextResponse.json(
      {
        success: false,
        error: 'Bad request',
        message: errorMsg,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>,
      { status: 400 }
    );
  }
}

/**
 * Handle batch geocoding
 */
async function handleBatchGeocoding(addresses: string[]): Promise<NextResponse> {
  try {
    // Validate input
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'addresses must be a non-empty array',
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (addresses.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Maximum 100 addresses per batch request',
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Filter out empty strings and validate
    const validAddresses = addresses.filter(
      (addr) => typeof addr === 'string' && addr.trim().length > 0
    );

    if (validAddresses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'No valid addresses provided',
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Geocode addresses
    const results = await batchGeocodeAddresses(validAddresses, 5);

    // Count results
    const geocoded = results.size;
    const failed = validAddresses.length - geocoded;

    const response: BatchGeocodeResponse = {
      success: true,
      data: Object.fromEntries(results),
      geocoded,
      cached: 0, // Could track this if caching metadata was available
      failed,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Batch geocoding failed';
    console.error('[Batch Geocode] Error:', errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: 'Batch geocoding failed',
        message: errorMsg,
        geocoded: 0,
        cached: 0,
        failed: 0,
        timestamp: new Date().toISOString(),
      } as BatchGeocodeResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/geocode - Get cache statistics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get('stats') === 'true') {
      // Import inside function to avoid circular dependencies
      const { getGeocachStats } = await import('@/lib/geocoding');
      const stats = getGeocachStats();

      return NextResponse.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Bad request',
        message: 'Use POST for geocoding or add ?stats=true for cache statistics',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>,
      { status: 400 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Error',
        message: errorMsg,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * OPTIONS endpoint for CORS
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
