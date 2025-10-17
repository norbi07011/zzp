import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BoltIcon,
  ClockIcon,
  UsersIcon,
  CursorArrowRaysIcon,
  ChartPieIcon,
  ServerIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';

// Real-time Analytics Interfaces
export interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  threshold?: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  category: 'performance' | 'users' | 'business' | 'system';
}

export interface LiveEvent {
  id: string;
  type: 'user_action' | 'system_event' | 'alert' | 'milestone';
  title: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  source: string;
  metadata?: Record<string, any>;
}

export interface StreamConfig {
  refreshInterval: number;
  maxDataPoints: number;
  enableSound: boolean;
  enableNotifications: boolean;
  autoScroll: boolean;
  filters: {
    categories: string[];
    severities: string[];
    sources: string[];
  };
}

// Props
interface RealTimeAnalyticsDashboardProps {
  onMetricAlert?: (metric: RealTimeMetric) => void;
  onEventFilter?: (filters: StreamConfig['filters']) => void;
  className?: string;
}

// Mock data generators
const generateMockMetrics = (): RealTimeMetric[] => [
  {
    id: 'concurrent_users',
    name: 'Concurrent Users',
    value: Math.floor(Math.random() * 500 + 1200),
    unit: '',
    timestamp: new Date().toISOString(),
    threshold: { warning: 1500, critical: 2000 },
    trend: 'up',
    category: 'users'
  },
  {
    id: 'response_time',
    name: 'Avg Response Time',
    value: Math.floor(Math.random() * 200 + 100),
    unit: 'ms',
    timestamp: new Date().toISOString(),
    threshold: { warning: 300, critical: 500 },
    trend: 'stable',
    category: 'performance'
  },
  {
    id: 'error_rate',
    name: 'Error Rate',
    value: parseFloat((Math.random() * 2).toFixed(2)),
    unit: '%',
    timestamp: new Date().toISOString(),
    threshold: { warning: 1, critical: 3 },
    trend: 'down',
    category: 'system'
  },
  {
    id: 'throughput',
    name: 'Requests/sec',
    value: Math.floor(Math.random() * 200 + 800),
    unit: '/sec',
    timestamp: new Date().toISOString(),
    threshold: { warning: 1200, critical: 1500 },
    trend: 'up',
    category: 'performance'
  },
  {
    id: 'conversion_rate',
    name: 'Live Conversion Rate',
    value: parseFloat((Math.random() * 5 + 2).toFixed(2)),
    unit: '%',
    timestamp: new Date().toISOString(),
    threshold: { warning: 3, critical: 2 },
    trend: 'stable',
    category: 'business'
  },
  {
    id: 'cpu_usage',
    name: 'CPU Usage',
    value: parseFloat((Math.random() * 30 + 40).toFixed(1)),
    unit: '%',
    timestamp: new Date().toISOString(),
    threshold: { warning: 70, critical: 85 },
    trend: 'stable',
    category: 'system'
  }
];

const generateMockEvent = (id: number): LiveEvent => {
  const eventTypes = [
    { type: 'user_action', titles: ['User Login', 'Purchase Completed', 'Profile Updated', 'Search Performed'] },
    { type: 'system_event', titles: ['Server Restart', 'Cache Cleared', 'Backup Completed', 'Update Deployed'] },
    { type: 'alert', titles: ['High CPU Usage', 'Memory Warning', 'Disk Space Low', 'Connection Timeout'] },
    { type: 'milestone', titles: ['100K Users Reached', 'Daily Goal Achieved', 'New Record Set', 'Feature Launched'] }
  ];
  
  const severities = ['info', 'warning', 'error', 'success'] as const;
  const sources = ['Frontend', 'API', 'Database', 'CDN', 'Payment Gateway', 'Analytics'];
  
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const title = eventType.titles[Math.floor(Math.random() * eventType.titles.length)];
  
  return {
    id: `event-${id}`,
    type: eventType.type as any,
    title,
    description: `${title} event triggered by ${sources[Math.floor(Math.random() * sources.length)]}`,
    timestamp: new Date().toISOString(),
    severity: severities[Math.floor(Math.random() * severities.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    metadata: {
      userId: eventType.type === 'user_action' ? Math.floor(Math.random() * 10000) : undefined,
      duration: eventType.type === 'system_event' ? Math.floor(Math.random() * 5000) + 'ms' : undefined
    }
  };
};

// Helper functions
const getMetricStatus = (metric: RealTimeMetric): 'normal' | 'warning' | 'critical' => {
  if (!metric.threshold) return 'normal';
  if (metric.value >= metric.threshold.critical) return 'critical';
  if (metric.value >= metric.threshold.warning) return 'warning';
  return 'normal';
};

const getStatusColor = (status: 'normal' | 'warning' | 'critical'): string => {
  switch (status) {
    case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    case 'normal': return 'text-green-400 bg-green-500/10 border-green-500/30';
  }
};

const getEventSeverityColor = (severity: LiveEvent['severity']): string => {
  switch (severity) {
    case 'error': return 'text-red-400 bg-red-500/10';
    case 'warning': return 'text-yellow-400 bg-yellow-500/10';
    case 'success': return 'text-green-400 bg-green-500/10';
    case 'info': return 'text-blue-400 bg-blue-500/10';
  }
};

const formatValue = (value: number, unit: string): string => {
  if (unit === '%') return `${value}%`;
  if (unit === 'ms') return `${value}ms`;
  if (unit === '/sec') return `${value.toLocaleString()}/sec`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${unit}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k${unit}`;
  return `${value.toLocaleString()}${unit}`;
};

// Real-time Metric Card Component
const RealTimeMetricCard: React.FC<{ 
  metric: RealTimeMetric;
  history: number[];
  onAlert?: (metric: RealTimeMetric) => void;
}> = ({ metric, history, onAlert }) => {
  const status = getMetricStatus(metric);
  const statusColor = getStatusColor(status);
  
  useEffect(() => {
    if (status === 'critical' && onAlert) {
      onAlert(metric);
    }
  }, [status, metric, onAlert]);
  
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 border transition-all ${statusColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">{metric.name}</h3>
          <div className="text-2xl font-bold text-white">
            {formatValue(metric.value, metric.unit)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {status === 'critical' && <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />}
          {status === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />}
          {status === 'normal' && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
          
          <div className="text-xs text-gray-400">
            {new Date(metric.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Mini sparkline */}
      <div className="h-8 flex items-end gap-1">
        {history.slice(-10).map((value, index) => {
          const max = Math.max(...history);
          const min = Math.min(...history);
          const height = max === min ? 50 : ((value - min) / (max - min)) * 100;
          
          return (
            <div
              key={index}
              className={`flex-1 rounded-sm transition-all ${
                status === 'critical' ? 'bg-red-500/50' :
                status === 'warning' ? 'bg-yellow-500/50' : 'bg-green-500/50'
              }`}
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
      
      {/* Threshold indicators */}
      {metric.threshold && (
        <div className="mt-2 text-xs text-gray-400">
          <div>Warning: {formatValue(metric.threshold.warning, metric.unit)}</div>
          <div>Critical: {formatValue(metric.threshold.critical, metric.unit)}</div>
        </div>
      )}
    </div>
  );
};

// Live Event Stream Component
const LiveEventStream: React.FC<{ 
  events: LiveEvent[];
  config: StreamConfig;
  onConfigChange: (config: StreamConfig) => void;
}> = ({ events, config, onConfigChange }) => {
  const eventListRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (config.autoScroll && eventListRef.current) {
      eventListRef.current.scrollTop = eventListRef.current.scrollHeight;
    }
  }, [events.length, config.autoScroll]);
  
  // Filter events based on config
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (config.filters.severities.length > 0 && !config.filters.severities.includes(event.severity)) {
        return false;
      }
      if (config.filters.sources.length > 0 && !config.filters.sources.includes(event.source)) {
        return false;
      }
      return true;
    });
  }, [events, config.filters]);
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Live Event Stream</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onConfigChange({ ...config, autoScroll: !config.autoScroll })}
              className={`p-2 rounded transition-colors ${
                config.autoScroll ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}
              title="Auto-scroll"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onConfigChange({ ...config, enableSound: !config.enableSound })}
              className={`p-2 rounded transition-colors ${
                config.enableSound ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}
              title="Sound notifications"
            >
              {config.enableSound ? <SpeakerWaveIcon className="w-4 h-4" /> : <SpeakerXMarkIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      <div 
        ref={eventListRef}
        className="h-96 overflow-y-auto p-4 space-y-2"
      >
        {filteredEvents.map(event => (
          <div key={event.id} className={`rounded-lg p-3 border transition-all ${getEventSeverityColor(event.severity)} border-current/20`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{event.title}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-current/20">
                    {event.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-1">{event.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                  <span>Source: {event.source}</span>
                  <span>Type: {event.type}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No events match the current filters
          </div>
        )}
      </div>
    </div>
  );
};

// System Health Panel Component
const SystemHealthPanel: React.FC<{ metrics: RealTimeMetric[] }> = ({ metrics }) => {
  const systemMetrics = metrics.filter(m => m.category === 'system');
  const performanceMetrics = metrics.filter(m => m.category === 'performance');
  
  const overallHealth = useMemo(() => {
    const criticalCount = metrics.filter(m => getMetricStatus(m) === 'critical').length;
    const warningCount = metrics.filter(m => getMetricStatus(m) === 'warning').length;
    
    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'healthy';
  }, [metrics]);
  
  const healthColor = overallHealth === 'critical' ? 'text-red-400' :
                     overallHealth === 'warning' ? 'text-yellow-400' : 'text-green-400';
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">System Health</h3>
        <div className={`flex items-center gap-2 ${healthColor}`}>
          {overallHealth === 'critical' && <ExclamationTriangleIcon className="w-5 h-5" />}
          {overallHealth === 'warning' && <ExclamationTriangleIcon className="w-5 h-5" />}
          {overallHealth === 'healthy' && <CheckCircleIcon className="w-5 h-5" />}
          <span className="font-medium capitalize">{overallHealth}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">System Metrics</h4>
          <div className="space-y-3">
            {systemMetrics.map(metric => {
              const status = getMetricStatus(metric);
              return (
                <div key={metric.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {formatValue(metric.value, metric.unit)}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'critical' ? 'bg-red-500' :
                      status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Performance Metrics</h4>
          <div className="space-y-3">
            {performanceMetrics.map(metric => {
              const status = getMetricStatus(metric);
              return (
                <div key={metric.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {formatValue(metric.value, metric.unit)}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'critical' ? 'bg-red-500' :
                      status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Real-time Analytics Dashboard Component
export const RealTimeAnalyticsDashboard: React.FC<RealTimeAnalyticsDashboardProps> = ({
  onMetricAlert,
  onEventFilter,
  className = ''
}) => {
  const [isLive, setIsLive] = useState(true);
  const [metrics, setMetrics] = useState<RealTimeMetric[]>(generateMockMetrics());
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<Record<string, number[]>>({});
  const [config, setConfig] = useState<StreamConfig>({
    refreshInterval: 2000,
    maxDataPoints: 50,
    enableSound: false,
    enableNotifications: true,
    autoScroll: true,
    filters: {
      categories: [],
      severities: [],
      sources: []
    }
  });
  
  let eventCounter = useRef(0);
  
  // Real-time data updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      // Update metrics
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => ({
          ...metric,
          value: Math.max(0, metric.value + (Math.random() - 0.5) * metric.value * 0.1),
          timestamp: new Date().toISOString(),
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
        }))
      );
      
      // Update metrics history
      setMetricsHistory(prevHistory => {
        const newHistory = { ...prevHistory };
        metrics.forEach(metric => {
          if (!newHistory[metric.id]) newHistory[metric.id] = [];
          newHistory[metric.id] = [...newHistory[metric.id], metric.value].slice(-config.maxDataPoints);
        });
        return newHistory;
      });
      
      // Generate random events
      if (Math.random() > 0.7) {
        const newEvent = generateMockEvent(eventCounter.current++);
        setEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
        
        // Play sound for critical events
        if (config.enableSound && (newEvent.severity === 'error' || newEvent.severity === 'warning')) {
          // You would implement actual sound playing here
          console.log('🔊 Sound notification for:', newEvent.title);
        }
      }
    }, config.refreshInterval);
    
    return () => clearInterval(interval);
  }, [isLive, config.refreshInterval, config.enableSound, config.maxDataPoints, metrics]);
  
  // Handle configuration changes
  const handleConfigChange = (newConfig: StreamConfig) => {
    setConfig(newConfig);
    if (onEventFilter) {
      onEventFilter(newConfig.filters);
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Real-time Analytics Dashboard</h2>
          <p className="text-blue-200">Live monitoring and event streaming</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-300">{isLive ? 'Live' : 'Paused'}</span>
          </div>
          
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isLive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>
      
      {/* Real-time Metrics Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Live Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(metric => (
            <RealTimeMetricCard
              key={metric.id}
              metric={metric}
              history={metricsHistory[metric.id] || []}
              onAlert={onMetricAlert}
            />
          ))}
        </div>
      </div>
      
      {/* System Health and Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthPanel metrics={metrics} />
        <LiveEventStream 
          events={events}
          config={config}
          onConfigChange={handleConfigChange}
        />
      </div>
      
      {/* Configuration Panel */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Stream Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refresh Interval (ms)
            </label>
            <select
              value={config.refreshInterval}
              onChange={(e) => handleConfigChange({ ...config, refreshInterval: Number(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value={1000}>1 second</option>
              <option value={2000}>2 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Data Points
            </label>
            <select
              value={config.maxDataPoints}
              onChange={(e) => handleConfigChange({ ...config, maxDataPoints: Number(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value={20}>20 points</option>
              <option value={50}>50 points</option>
              <option value={100}>100 points</option>
              <option value={200}>200 points</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notifications
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enableNotifications}
                  onChange={(e) => handleConfigChange({ ...config, enableNotifications: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">Enable notifications</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.enableSound}
                  onChange={(e) => handleConfigChange({ ...config, enableSound: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">Sound alerts</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalyticsDashboard;