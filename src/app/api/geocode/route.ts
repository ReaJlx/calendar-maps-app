/**
 * API route to geocode addresses using Google Geocoding API
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Create a client for Geocoding API
    const geocoder = google.maps({
      version: 'v1',
      auth: process.env.GOOGLE_MAPS_API_KEY,
    });

    // Use the googleapis library's geocoding capability
    // Alternatively, we can use the REST API directly
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return NextResponse.json({
        success: true,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
        address: data.results[0].formatted_address,
      });
    }

    return NextResponse.json(
      { error: 'Address not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
