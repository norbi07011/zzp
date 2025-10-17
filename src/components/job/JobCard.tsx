/**
 * JobCard Component
 * Displays job posting in card format
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Job } from '../../services/job';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const formatRate = () => {
    if (job.hourly_rate_min && job.hourly_rate_max) {
      return `€${job.hourly_rate_min}-€${job.hourly_rate_max}/hr`;
    } else if (job.hourly_rate_min) {
      return `€${job.hourly_rate_min}+/hr`;
    }
    return 'Rate negotiable';
  };

  const getLocationBadge = () => {
    const colors = {
      remote: 'bg-green-100 text-green-800',
      onsite: 'bg-blue-100 text-blue-800',
      hybrid: 'bg-purple-100 text-purple-800'
    };
    return colors[job.work_location] || colors.hybrid;
  };

  const getJobTypeBadge = () => {
    const colors = {
      freelance: 'bg-orange-100 text-orange-800',
      contract: 'bg-indigo-100 text-indigo-800',
      project: 'bg-pink-100 text-pink-800',
      'part-time': 'bg-yellow-100 text-yellow-800'
    };
    return colors[job.job_type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header - Company & Featured Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {job.company?.logo_url ? (
            <img
              src={job.company.logo_url}
              alt={job.company.company_name}
              className="w-12 h-12 rounded object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 font-bold text-lg">
                {job.company?.company_name?.charAt(0) || 'C'}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {job.company?.company_name || 'Company'}
            </h3>
            <p className="text-sm text-gray-500">{job.company?.industry}</p>
          </div>
        </div>
        {job.featured && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
            ⭐ Featured
          </span>
        )}
      </div>

      {/* Job Title */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h2>

      {/* Description Preview */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Badges - Location, Type, Level */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLocationBadge()}`}>
          {job.work_location.charAt(0).toUpperCase() + job.work_location.slice(1)}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeBadge()}`}>
          {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1)}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
        </span>
        {job.city && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            📍 {job.city}
          </span>
        )}
      </div>

      {/* Skills */}
      {job.required_skills && job.required_skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.required_skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 5 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                +{job.required_skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer - Rate & Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-lg font-bold text-blue-600">{formatRate()}</div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {job.views_count || 0}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {job.applications_count || 0}
          </span>
          <span className="text-xs">
            {new Date(job.created_at).toLocaleDateString('nl-NL')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
