/**
 * Event filter controls component
 */

'use client';

import React, { useState } from 'react';
import { EventSortBy } from '@/types';

interface EventFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sortBy: EventSortBy) => void;
  onLocationFilterChange: (keyword: string) => void;
}

export interface FilterState {
  locationOnly: boolean;
  showGeocoded: boolean;
  showFailed: boolean;
}

export function EventFilters({
  onFilterChange,
  onSortChange,
  onLocationFilterChange,
}: EventFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    locationOnly: true,
    showGeocoded: true,
    showFailed: false,
  });

  const [sortBy, setSortBy] = useState<EventSortBy>(EventSortBy.START_TIME);
  const [locationKeyword, setLocationKeyword] = useState('');

  const handleFilterToggle = (key: keyof FilterState) => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as EventSortBy;
    setSortBy(newSort);
    onSortChange(newSort);
  };

  const handleLocationKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setLocationKeyword(keyword);
    onLocationFilterChange(keyword);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-4 md:gap-6">
        {/* Sort Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={EventSortBy.START_TIME}>Start Time</option>
            <option value={EventSortBy.TITLE}>Title (A-Z)</option>
            <option value={EventSortBy.LOCATION}>Location</option>
            <option value={EventSortBy.DURATION}>Duration</option>
            <option value={EventSortBy.ATTENDEE_COUNT}>Attendee Count</option>
          </select>
        </div>

        {/* Location Keyword Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location Keyword
          </label>
          <input
            type="text"
            placeholder="Search locations..."
            value={locationKeyword}
            onChange={handleLocationKeywordChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Toggles */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Filters
          </label>
          <div className="flex items-center space-x-3 text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.locationOnly}
                onChange={() => handleFilterToggle('locationOnly')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">With Location</span>
            </label>
          </div>
        </div>

        {/* Geocoding Status Toggle */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <div className="flex items-center space-x-3 text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showFailed}
                onChange={() => handleFilterToggle('showFailed')}
                className="w-4 h-4 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
              />
              <span className="ml-2 text-gray-700">Show Errors</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
