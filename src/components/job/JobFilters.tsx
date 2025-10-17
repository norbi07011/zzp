/**
 * JobFilters Component
 * Advanced filtering for job search
 */

import React, { useState } from 'react';
import { JobFilters as JobFiltersType } from '../../services/job';

interface JobFiltersProps {
  onFilterChange: (filters: JobFiltersType) => void;
  onReset: () => void;
}

const CATEGORIES = [
  'Development',
  'Design',
  'Marketing',
  'Sales',
  'Project Management',
  'Data Analysis',
  'Content Writing',
  'Customer Service',
  'Other'
];

const JOB_TYPES = [
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
  { value: 'project', label: 'Project' },
  { value: 'part-time', label: 'Part-time' }
];

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior' },
  { value: 'medior', label: 'Medior' },
  { value: 'senior', label: 'Senior' },
  { value: 'expert', label: 'Expert' }
];

const WORK_LOCATIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' }
];

export const JobFilters: React.FC<JobFiltersProps> = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterUpdate = (key: keyof JobFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCheckboxChange = (key: keyof JobFiltersType, value: string, checked: boolean) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    handleFilterUpdate(key, newValues.length > 0 ? newValues : undefined);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.job_type?.length) count++;
    if (filters.experience_level?.length) count++;
    if (filters.work_location?.length) count++;
    if (filters.city) count++;
    if (filters.hourly_rate_min || filters.hourly_rate_max) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filters
          {getActiveFiltersCount() > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Reset
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden'}`}>
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterUpdate('category', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Type
          </label>
          <div className="space-y-2">
            {JOB_TYPES.map(type => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.job_type?.includes(type.value) || false}
                  onChange={(e) => handleCheckboxChange('job_type', type.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map(level => (
              <label key={level.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.experience_level?.includes(level.value) || false}
                  onChange={(e) => handleCheckboxChange('experience_level', level.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Work Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Location
          </label>
          <div className="space-y-2">
            {WORK_LOCATIONS.map(location => (
              <label key={location.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.work_location?.includes(location.value) || false}
                  onChange={(e) => handleCheckboxChange('work_location', location.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{location.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            value={filters.city || ''}
            onChange={(e) => handleFilterUpdate('city', e.target.value || undefined)}
            placeholder="e.g. Amsterdam"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Hourly Rate Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate (€)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={filters.hourly_rate_min || ''}
              onChange={(e) => handleFilterUpdate('hourly_rate_min', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Min"
              min="0"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={filters.hourly_rate_max || ''}
              onChange={(e) => handleFilterUpdate('hourly_rate_max', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Max"
              min="0"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Filters (Always Visible) */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => handleFilterUpdate('work_location', ['remote'])}
          className={`px-3 py-1 rounded-full text-sm ${
            filters.work_location?.includes('remote')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🏠 Remote
        </button>
        <button
          onClick={() => handleFilterUpdate('job_type', ['freelance'])}
          className={`px-3 py-1 rounded-full text-sm ${
            filters.job_type?.includes('freelance')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💼 Freelance
        </button>
        <button
          onClick={() => handleFilterUpdate('experience_level', ['senior'])}
          className={`px-3 py-1 rounded-full text-sm ${
            filters.experience_level?.includes('senior')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ⭐ Senior
        </button>
      </div>
    </div>
  );
};

export default JobFilters;
