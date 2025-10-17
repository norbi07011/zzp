import React, { useState, useEffect, useMemo } from 'react';
import {
  ChartBarIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import DataVisualizationEngine, { 
  DataPoint, 
  MetricDefinition, 
  VisualizationConfig,
  RealtimeDataStream 
} from './DataVisualizationEngine';

// Business Intelligence Interfaces
export interface KPICard {
  id: string;
  title: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  format: 'number' | 'currency' | 'percentage';
  trend: 'up' | 'down' | 'stable';
  status: 'success' | 'warning' | 'danger' | 'info';
  category: string;
  description: string;
  sparklineData?: number[];
}

export interface BusinessAlert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  relatedKPIs: string[];
}

export interface BusinessGoal {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  milestones: Array<{
    name: string;
    target: number;
    completed: boolean;
    completedAt?: string;
  }>;
}

export interface DashboardFilter {
  dateRange: {
    start: string;
    end: string;
    preset?: '7d' | '30d' | '90d' | '1y' | 'custom';
  };
  categories: string[];
  departments: string[];
  regions: string[];
}

// Props
interface BusinessIntelligenceDashboardProps {
  onExportReport?: (format: 'pdf' | 'excel' | 'powerpoint') => void;
  onKPIClick?: (kpi: KPICard) => void;
  onAlertAction?: (alert: BusinessAlert) => void;
  className?: string;
}

// Mock data generators
const generateMockKPIs = (): KPICard[] => [
  {
    id: 'revenue',
    title: 'Monthly Revenue',
    value: 158750,
    previousValue: 142300,
    target: 175000,
    unit: 'EUR',
    format: 'currency',
    trend: 'up',
    status: 'success',
    category: 'Financial',
    description: 'Total revenue for the current month',
    sparklineData: [142300, 145200, 148900, 151200, 155600, 158750]
  },
  {
    id: 'active_users',
    title: 'Active Users',
    value: 24567,
    previousValue: 23890,
    target: 30000,
    unit: '',
    format: 'number',
    trend: 'up',
    status: 'info',
    category: 'Engagement',
    description: 'Users active in the last 30 days',
    sparklineData: [23890, 24100, 24350, 24200, 24450, 24567]
  },
  {
    id: 'conversion_rate',
    title: 'Conversion Rate',
    value: 3.4,
    previousValue: 4.1,
    target: 5.0,
    unit: '%',
    format: 'percentage',
    trend: 'down',
    status: 'warning',
    category: 'Marketing',
    description: 'Visitor to customer conversion rate',
    sparklineData: [4.1, 3.9, 3.7, 3.5, 3.6, 3.4]
  },
  {
    id: 'customer_satisfaction',
    title: 'Customer Satisfaction',
    value: 4.2,
    previousValue: 4.0,
    target: 4.5,
    unit: '/5',
    format: 'number',
    trend: 'up',
    status: 'success',
    category: 'Quality',
    description: 'Average customer satisfaction score',
    sparklineData: [4.0, 4.1, 4.1, 4.2, 4.2, 4.2]
  },
  {
    id: 'response_time',
    title: 'Avg Response Time',
    value: 145,
    previousValue: 198,
    target: 100,
    unit: 'ms',
    format: 'number',
    trend: 'up',
    status: 'warning',
    category: 'Performance',
    description: 'Average API response time',
    sparklineData: [198, 180, 165, 152, 148, 145]
  },
  {
    id: 'churn_rate',
    title: 'Churn Rate',
    value: 2.1,
    previousValue: 1.8,
    target: 1.5,
    unit: '%',
    format: 'percentage',
    trend: 'down',
    status: 'danger',
    category: 'Retention',
    description: 'Monthly customer churn rate',
    sparklineData: [1.8, 1.9, 2.0, 2.1, 2.1, 2.1]
  }
];

const generateMockAlerts = (): BusinessAlert[] => [
  {
    id: 'alert-1',
    title: 'Conversion Rate Declining',
    message: 'Conversion rate has dropped below 3.5% for the past 3 days. Consider reviewing marketing campaigns.',
    severity: 'high',
    category: 'Marketing',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    actionRequired: true,
    relatedKPIs: ['conversion_rate']
  },
  {
    id: 'alert-2',
    title: 'Churn Rate Above Target',
    message: 'Customer churn rate is 2.1%, exceeding the target of 1.5%. Immediate action recommended.',
    severity: 'critical',
    category: 'Retention',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    actionRequired: true,
    relatedKPIs: ['churn_rate']
  },
  {
    id: 'alert-3',
    title: 'Revenue Target on Track',
    message: 'Monthly revenue is 90.7% of target with 8 days remaining. On track to meet goal.',
    severity: 'low',
    category: 'Financial',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    actionRequired: false,
    relatedKPIs: ['revenue']
  },
  {
    id: 'alert-4',
    title: 'Performance Optimization Needed',
    message: 'API response time increased to 145ms. Consider optimization to meet 100ms target.',
    severity: 'medium',
    category: 'Performance',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    actionRequired: true,
    relatedKPIs: ['response_time']
  }
];

const generateMockGoals = (): BusinessGoal[] => [
  {
    id: 'goal-1',
    name: 'Q4 Revenue Target',
    description: 'Achieve €500k revenue in Q4 2025',
    target: 500000,
    current: 450000,
    deadline: '2025-12-31',
    category: 'Financial',
    priority: 'high',
    status: 'on-track',
    milestones: [
      { name: 'October Target', target: 400000, completed: true, completedAt: '2025-10-31' },
      { name: 'November Target', target: 450000, completed: true, completedAt: '2025-11-30' },
      { name: 'December Target', target: 500000, completed: false }
    ]
  },
  {
    id: 'goal-2',
    name: 'User Growth',
    description: 'Reach 30,000 active users by end of year',
    target: 30000,
    current: 24567,
    deadline: '2025-12-31',
    category: 'Growth',
    priority: 'high',
    status: 'at-risk',
    milestones: [
      { name: 'Q3 Milestone', target: 20000, completed: true, completedAt: '2025-09-30' },
      { name: 'November Milestone', target: 25000, completed: false },
      { name: 'December Target', target: 30000, completed: false }
    ]
  },
  {
    id: 'goal-3',
    name: 'Customer Satisfaction',
    description: 'Maintain 4.5+ satisfaction rating',
    target: 4.5,
    current: 4.2,
    deadline: '2025-12-31',
    category: 'Quality',
    priority: 'medium',
    status: 'behind',
    milestones: [
      { name: 'Survey Implementation', target: 4.0, completed: true, completedAt: '2025-08-15' },
      { name: 'Process Improvements', target: 4.3, completed: false },
      { name: 'Target Achievement', target: 4.5, completed: false }
    ]
  }
];

// Component helper functions
const formatKPIValue = (value: number, format: KPICard['format'], unit: string): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pl-PL', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M${unit}`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k${unit}`;
      }
      return `${value.toLocaleString()}${unit}`;
  }
};

const getStatusColor = (status: KPICard['status']): string => {
  switch (status) {
    case 'success': return 'text-green-400 bg-green-500/10';
    case 'warning': return 'text-yellow-400 bg-yellow-500/10';
    case 'danger': return 'text-red-400 bg-red-500/10';
    case 'info': return 'text-blue-400 bg-blue-500/10';
    default: return 'text-gray-400 bg-gray-500/10';
  }
};

const getAlertSeverityColor = (severity: BusinessAlert['severity']): string => {
  switch (severity) {
    case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
};

const getGoalStatusColor = (status: BusinessGoal['status']): string => {
  switch (status) {
    case 'completed': return 'text-green-400 bg-green-500/10';
    case 'on-track': return 'text-blue-400 bg-blue-500/10';
    case 'at-risk': return 'text-yellow-400 bg-yellow-500/10';
    case 'behind': return 'text-red-400 bg-red-500/10';
    default: return 'text-gray-400 bg-gray-500/10';
  }
};

// KPI Card Component
const KPICardComponent: React.FC<{ 
  kpi: KPICard; 
  onClick?: (kpi: KPICard) => void 
}> = ({ kpi, onClick }) => {
  const changePercent = kpi.previousValue ? 
    ((kpi.value - kpi.previousValue) / kpi.previousValue) * 100 : 0;
  const progressPercent = (kpi.value / kpi.target) * 100;
  
  return (
    <div 
      className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer group"
      onClick={() => onClick?.(kpi)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">{kpi.title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {formatKPIValue(kpi.value, kpi.format, kpi.unit)}
            </span>
            <div className={`flex items-center gap-1 text-sm ${
              changePercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {changePercent >= 0 ? 
                <ArrowTrendingUpIcon className="w-4 h-4" /> : 
                <ArrowTrendingDownIcon className="w-4 h-4" />
              }
              <span>{Math.abs(changePercent).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className={`p-2 rounded-lg ${getStatusColor(kpi.status)}`}>
          {kpi.status === 'success' && <CheckCircleIcon className="w-5 h-5" />}
          {kpi.status === 'warning' && <ExclamationTriangleIcon className="w-5 h-5" />}
          {kpi.status === 'danger' && <XCircleIcon className="w-5 h-5" />}
          {kpi.status === 'info' && <InformationCircleIcon className="w-5 h-5" />}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress to target</span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              progressPercent >= 100 ? 'bg-green-500' :
              progressPercent >= 80 ? 'bg-blue-500' :
              progressPercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>
      
      {/* Sparkline */}
      {kpi.sparklineData && (
        <div className="h-8 flex items-end gap-1">
          {kpi.sparklineData.map((value, index) => {
            const max = Math.max(...kpi.sparklineData!);
            const min = Math.min(...kpi.sparklineData!);
            const height = ((value - min) / (max - min)) * 100;
            
            return (
              <div
                key={index}
                className="flex-1 bg-blue-500/50 rounded-sm transition-all group-hover:bg-blue-400/70"
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            );
          })}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-400">
        {kpi.description}
      </div>
    </div>
  );
};

// Alert Component
const AlertComponent: React.FC<{ 
  alert: BusinessAlert; 
  onAction?: (alert: BusinessAlert) => void 
}> = ({ alert, onAction }) => {
  return (
    <div className={`rounded-lg p-4 border ${getAlertSeverityColor(alert.severity)} ${
      alert.isRead ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-white">{alert.title}</h4>
            <span className={`px-2 py-1 text-xs rounded-full ${
              alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
              alert.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
              alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              {alert.severity}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{new Date(alert.timestamp).toLocaleString()}</span>
            <span>Category: {alert.category}</span>
          </div>
        </div>
        
        {alert.actionRequired && (
          <button
            onClick={() => onAction?.(alert)}
            className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Take Action
          </button>
        )}
      </div>
    </div>
  );
};

// Goal Component
const GoalComponent: React.FC<{ goal: BusinessGoal }> = ({ goal }) => {
  const progressPercent = (goal.current / goal.target) * 100;
  const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{goal.name}</h3>
          <p className="text-sm text-gray-300">{goal.description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${getGoalStatusColor(goal.status)}`}>
          {goal.status.replace('-', ' ')}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400">Current</div>
          <div className="text-xl font-bold text-white">
            {formatKPIValue(goal.current, 'number', '')}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Target</div>
          <div className="text-xl font-bold text-white">
            {formatKPIValue(goal.target, 'number', '')}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Days Left</div>
          <div className="text-xl font-bold text-white">{daysRemaining}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              progressPercent >= 100 ? 'bg-green-500' :
              progressPercent >= 80 ? 'bg-blue-500' :
              progressPercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-300">Milestones</div>
        {goal.milestones.map((milestone, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <div className={`w-4 h-4 rounded-full ${
              milestone.completed ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              {milestone.completed && (
                <CheckCircleIcon className="w-4 h-4 text-white" />
              )}
            </div>
            <span className={milestone.completed ? 'text-gray-300' : 'text-white'}>
              {milestone.name}
            </span>
            <span className="text-gray-400 ml-auto">
              {formatKPIValue(milestone.target, 'number', '')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Business Intelligence Dashboard Component
export const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = ({
  onExportReport,
  onKPIClick,
  onAlertAction,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'kpis' | 'alerts' | 'goals'>('overview');
  const [filter, setFilter] = useState<DashboardFilter>({
    dateRange: { start: '', end: '', preset: '30d' },
    categories: [],
    departments: [],
    regions: []
  });
  const [kpis] = useState(generateMockKPIs());
  const [alerts] = useState(generateMockAlerts());
  const [goals] = useState(generateMockGoals());
  
  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Business Intelligence Dashboard</h2>
          <p className="text-blue-200">Real-time insights and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors">
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            Filters
          </button>
          
          {onExportReport && (
            <div className="flex gap-1">
              {['pdf', 'excel', 'powerpoint'].map(format => (
                <button
                  key={format}
                  onClick={() => onExportReport(format as any)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Alert Summary */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="font-medium text-red-300">Critical Alerts</h3>
              <p className="text-sm text-red-200">
                {criticalAlerts.length} critical alert{criticalAlerts.length !== 1 ? 's' : ''} require immediate attention
              </p>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              View Alerts
            </button>
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg">
        <div className="flex border-b border-white/20">
          {[
            { key: 'overview', label: 'Overview', icon: ChartBarIcon },
            { key: 'kpis', label: 'KPIs', icon: ArrowTrendingUpIcon },
            { key: 'alerts', label: `Alerts ${unreadAlerts.length > 0 ? `(${unreadAlerts.length})` : ''}`, icon: ExclamationTriangleIcon },
            { key: 'goals', label: 'Goals', icon: DocumentChartBarIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-400 text-white bg-white/10'
                    : 'border-transparent text-blue-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Summary Grid */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpis.slice(0, 6).map(kpi => (
                  <KPICardComponent key={kpi.id} kpi={kpi} onClick={onKPIClick} />
                ))}
              </div>
            </div>
            
            {/* Quick Alerts */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {alerts.slice(0, 3).map(alert => (
                  <AlertComponent key={alert.id} alert={alert} onAction={onAlertAction} />
                ))}
              </div>
            </div>
            
            {/* Goals Progress */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Goal Progress</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {goals.slice(0, 2).map(goal => (
                  <GoalComponent key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* KPIs Tab */}
        {activeTab === 'kpis' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpis.map(kpi => (
              <KPICardComponent key={kpi.id} kpi={kpi} onClick={onKPIClick} />
            ))}
          </div>
        )}
        
        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.map(alert => (
              <AlertComponent key={alert.id} alert={alert} onAction={onAlertAction} />
            ))}
          </div>
        )}
        
        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map(goal => (
              <GoalComponent key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessIntelligenceDashboard;