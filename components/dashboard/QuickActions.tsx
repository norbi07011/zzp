import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

export const QuickActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: 'new-invoice',
      label: t('dashboard.actions.newInvoice', 'New Invoice'),
      icon: <DocumentTextIcon className="w-6 h-6" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      path: '/invoices/new'
    },
    {
      id: 'add-expense',
      label: t('dashboard.actions.addExpense', 'Add Expense'),
      icon: <CreditCardIcon className="w-6 h-6" />,
      color: 'bg-red-600 hover:bg-red-700',
      path: '/expenses/new'
    },
    {
      id: 'view-reports',
      label: t('dashboard.actions.viewReports', 'View Reports'),
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: 'bg-green-600 hover:bg-green-700',
      path: '/reports'
    },
    {
      id: 'settings',
      label: t('dashboard.actions.settings', 'Settings'),
      icon: <Cog6ToothIcon className="w-6 h-6" />,
      color: 'bg-purple-600 hover:bg-purple-700',
      path: '/settings'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t('dashboard.actions.title', 'Quick Actions')}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(action.path)}
            className={`${action.color} text-white p-4 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <div className="flex flex-col items-center gap-2">
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => navigate('/help')}
          className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          {t('dashboard.actions.needHelp', 'Need help? View tutorials')}
        </button>
      </div>
    </div>
  );
};
