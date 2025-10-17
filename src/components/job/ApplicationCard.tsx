/**
 * ApplicationCard Component
 * Display job application with status
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  cover_letter?: string;
  hourly_rate?: number;
  availability_date?: string;
  created_at: string;
  updated_at: string;
  job?: {
    id: string;
    title: string;
    company_id: string;
    category?: string;
    work_location?: string;
    city?: string;
  };
  worker?: {
    id: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    title?: string;
    hourly_rate?: number;
    avatar_url?: string;
  };
}

interface ApplicationCardProps {
  application: Application;
  viewMode: 'worker' | 'employer';
  onStatusChange?: (applicationId: string, status: Application['status']) => Promise<void>;
  onWithdraw?: (applicationId: string) => Promise<void>;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  accepted: {
    label: 'Accepted',
    icon: '✅',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  rejected: {
    label: 'Rejected',
    icon: '❌',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  withdrawn: {
    label: 'Withdrawn',
    icon: '↩️',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
};

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  viewMode,
  onStatusChange,
  onWithdraw
}) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);

  const statusConfig = STATUS_CONFIG[application.status];

  const handleStatusChange = async (newStatus: Application['status']) => {
    if (!onStatusChange) return;
    setIsUpdating(true);
    try {
      await onStatusChange(application.id, newStatus);
      setShowActions(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWithdraw = async () => {
    if (!onWithdraw || !confirm('Are you sure you want to withdraw this application?')) return;
    setIsUpdating(true);
    try {
      await onWithdraw(application.id);
    } catch (error) {
      console.error('Failed to withdraw:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCardClick = () => {
    if (viewMode === 'worker' && application.job) {
      navigate(`/jobs/${application.job.id}`);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${
        viewMode === 'worker' ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {viewMode === 'worker' && application.job && (
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {application.job.title}
              </h3>
              <div className="flex items-center text-sm text-gray-600 space-x-3">
                {application.job.category && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    {application.job.category}
                  </span>
                )}
                {application.job.city && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {application.job.city}
                  </span>
                )}
              </div>
            </div>
          )}

          {viewMode === 'employer' && application.worker && (
            <div className="flex items-center">
              {application.worker.avatar_url ? (
                <img
                  src={application.worker.avatar_url}
                  alt="Worker"
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold text-lg">
                    {application.worker.first_name?.[0]}{application.worker.last_name?.[0]}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {application.worker.first_name} {application.worker.last_name}
                </h3>
                {application.worker.title && (
                  <p className="text-sm text-gray-600">{application.worker.title}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            {statusConfig.icon} {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Application Details */}
      <div className="space-y-2 mb-3">
        {application.cover_letter && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
            <p className="text-sm text-gray-600 line-clamp-3">{application.cover_letter}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          {application.hourly_rate && (
            <div>
              <span className="text-gray-600">Proposed Rate:</span>
              <span className="ml-1 font-medium text-gray-900">€{application.hourly_rate}/hr</span>
            </div>
          )}
          {application.availability_date && (
            <div>
              <span className="text-gray-600">Available from:</span>
              <span className="ml-1 font-medium text-gray-900">
                {new Date(application.availability_date).toLocaleDateString('nl-NL')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Applied {new Date(application.created_at).toLocaleDateString('nl-NL')}
        </span>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {viewMode === 'employer' && application.status === 'pending' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                disabled={isUpdating}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
              >
                Actions
              </button>
              {showActions && (
                <div className="absolute right-0 mt-32 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('accepted');
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('rejected');
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
            </>
          )}

          {viewMode === 'worker' && application.status === 'pending' && onWithdraw && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleWithdraw();
              }}
              disabled={isUpdating}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            >
              Withdraw
            </button>
          )}

          {viewMode === 'worker' && application.status === 'accepted' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/messages?job=${application.job_id}`);
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
            >
              Contact Employer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
