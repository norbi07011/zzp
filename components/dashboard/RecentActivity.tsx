import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  DocumentTextIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import type { ActivityItem } from '../../services/dashboard';

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  loading = false
}) => {
  const { t, i18n } = useTranslation();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'expense':
        return <CreditCardIcon className="w-5 h-5" />;
      case 'payment':
        return <BanknotesIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'invoice':
        return 'bg-blue-50 text-blue-600';
      case 'expense':
        return 'bg-red-50 text-red-600';
      case 'payment':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: t('dashboard.activity.pending', 'Pending'),
      completed: t('dashboard.activity.completed', 'Completed'),
      overdue: t('dashboard.activity.overdue', 'Overdue')
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: i18n.language === 'nl' ? nl : undefined
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('dashboard.activity.title', 'Recent Activity')}
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('dashboard.activity.title', 'Recent Activity')}
        </h2>
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {t('dashboard.activity.empty.title', 'No activity yet')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('dashboard.activity.empty.description', 'Your recent invoices, expenses, and payments will appear here.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('dashboard.activity.title', 'Recent Activity')}
        </h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          {t('dashboard.activity.viewAll', 'View all')}
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Icon */}
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                {getStatusBadge(activity.status)}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {activity.description}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(activity.date)}
              </p>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                activity.amount >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {activity.amount >= 0 ? '+' : '-'}{formatAmount(activity.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
