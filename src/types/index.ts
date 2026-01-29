/**
 * Comprehensive TypeScript types for Calendar Maps application
 */

/**
 * Calendar event with location data
 */
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string | null;
  location?: string | null;
  startTime: Date;
  endTime: Date;
  timezone?: string | null;
  attendees?: EventAttendee[];
  organizer?: EventOrganizer | null;
  hangoutLink?: string | null;
  htmlLink?: string | null;
  conferenceData?: ConferenceData;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

/**
 * Event attendee information
 */
export interface EventAttendee {
  email: string;
  displayName?: string | null;
  responseStatus: 'needsAction' | 'declined' | 'tentativelyAccepted' | 'accepted';
  optional?: boolean | null;
}

/**
 * Event organizer information
 */
export interface EventOrganizer {
  email: string;
  displayName?: string | null;
}

/**
 * Conference data for virtual meetings
 */
export interface ConferenceData {
  conferenceId?: string;
  conferenceSolution?: {
    key: { type: string };
    name: string;
    iconUri: string;
  };
  entryPoints?: {
    entryPointType: string;
    uri: string;
    label?: string;
    pin?: string;
    accessCode?: string;
    meetingCode?: string;
    passcode?: string;
  }[];
  notes?: string;
}

/**
 * Geocoded location with coordinates
 */
export interface GeocodedLocation {
  address: string;
  formattedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  components?: {
    country?: string;
    state?: string;
    city?: string;
    street?: string;
  };
}

/**
 * Event with geocoded location
 */
export interface EventWithLocation extends CalendarEvent {
  geocoded?: GeocodedLocation;
  geocodeError?: string;
}

/**
 * User preferences for map display
 */
export interface UserPreferences {
  userId: string;
  defaultZoom: number;
  defaultCenter: { lat: number; lng: number };
  eventColors?: Record<string, string>;
  hideDeclinedEvents: boolean;
  showWeekendOnly: boolean;
  sortBy: 'time' | 'location' | 'title';
  filterTags: string[];
}

/**
 * Filter options for events
 */
export interface EventFilterOptions {
  startDate?: Date;
  endDate?: Date;
  locationKeyword?: string;
  status?: ('confirmed' | 'tentative' | 'cancelled')[];
  hasLocation?: boolean;
  attendeeEmail?: string;
  tags?: string[];
  minDurationMinutes?: number;
  maxDurationMinutes?: number;
}

/**
 * Sort options for events
 */
export enum EventSortBy {
  START_TIME = 'startTime',
  END_TIME = 'endTime',
  TITLE = 'title',
  LOCATION = 'location',
  DURATION = 'duration',
  ATTENDEE_COUNT = 'attendeeCount',
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface EventsResponse extends ApiResponse<CalendarEvent[]> {
  count: number;
  pageToken?: string;
}

export interface GeocodingResponse extends ApiResponse<GeocodedLocation> {
  results?: GeocodedLocation[];
}

/**
 * Caching types
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Authentication types
 */
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  googleTokens?: GoogleTokens;
}

/**
 * Error response types
 */
export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  timestamp: string;
  path?: string;
}

/**
 * Batch geocoding request
 */
export interface BatchGeocodeRequest {
  addresses: string[];
  cacheOnly?: boolean;
}

export interface BatchGeocodeResponse extends ApiResponse<Record<string, GeocodedLocation>> {
  cached: number;
  geocoded: number;
  failed: number;
}

/**
 * Map state
 */
export interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  bounds?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  };
}

/**
 * Event marker on map
 */
export interface EventMarker {
  id: string;
  title: string;
  position: { lat: number; lng: number };
  color?: string;
  icon?: string;
  zIndex?: number;
  event: EventWithLocation;
}

/**
 * Cluster of events
 */
export interface EventCluster {
  position: { lat: number; lng: number };
  count: number;
  events: EventMarker[];
  markerSize: 'small' | 'mid' | 'large';
}

/**
 * Statistics/Analytics
 */
export interface CalendarStatistics {
  totalEvents: number;
  eventsWithLocation: number;
  locationPercentage: number;
  uniqueLocations: number;
  averageAttendees: number;
  upcomingEventCount: number;
  eventsByDay: Record<string, number>;
  eventsByLocation: Record<string, number>;
  eventsByStatus: Record<string, number>;
}
