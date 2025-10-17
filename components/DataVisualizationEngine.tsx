import React, { useState, useEffect, useMemo } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Data Visualization Interfaces
export interface DataPoint {
  id: string;
  label: string;
  value: number;
  timestamp: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }>;
}

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  format: 'number' | 'percentage' | 'currency' | 'time' | 'bytes';
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
  category: string;
  isKPI: boolean;
  target?: number;
  thresholds?: {
    warning: number;
    critical: number;
  };
}

export interface VisualizationConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar' | 'heatmap' | 'gauge' | 'table';
  title: string;
  description?: string;
  height?: number;
  width?: number;
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    showLegend?: boolean;
    showTooltips?: boolean;
    showGrid?: boolean;
    animations?: boolean;
    colors?: string[];
    theme?: 'light' | 'dark';
  };
  filters?: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'between';
    value: any;
  }>;
}

export interface RealtimeDataStream {
  id: string;
  name: string;
  endpoint: string;
  interval: number;
  isActive: boolean;
  lastUpdate: string;
  metrics: string[];
}

// Props for the main component
interface DataVisualizationEngineProps {
  data: DataPoint[];
  metrics: MetricDefinition[];
  config: VisualizationConfig;
  realtime?: RealtimeDataStream;
  onDataExport?: (format: 'csv' | 'json' | 'pdf' | 'excel') => void;
  onConfigChange?: (config: VisualizationConfig) => void;
  className?: string;
}

// Mock data generators
const generateMockMetrics = (): MetricDefinition[] => [
  {
    id: 'users_active',
    name: 'Active Users',
    description: 'Number of active users in the last 24 hours',
    unit: 'users',
    format: 'number',
    aggregation: 'count',
    category: 'User Engagement',
    isKPI: true,
    target: 5000,
    thresholds: { warning: 3000, critical: 2000 }
  },
  {
    id: 'revenue_daily',
    name: 'Daily Revenue',
    description: 'Total revenue generated today',
    unit: 'EUR',
    format: 'currency',
    aggregation: 'sum',
    category: 'Financial',
    isKPI: true,
    target: 10000,
    thresholds: { warning: 7500, critical: 5000 }
  },
  {
    id: 'conversion_rate',
    name: 'Conversion Rate',
    description: 'Percentage of visitors who convert',
    unit: '%',
    format: 'percentage',
    aggregation: 'avg',
    category: 'Marketing',
    isKPI: true,
    target: 15,
    thresholds: { warning: 10, critical: 5 }
  },
  {
    id: 'page_load_time',
    name: 'Average Page Load Time',
    description: 'Average time for pages to load',
    unit: 'ms',
    format: 'time',
    aggregation: 'avg',
    category: 'Performance',
    isKPI: false,
    target: 500,
    thresholds: { warning: 1000, critical: 2000 }
  },
  {
    id: 'error_rate',
    name: 'Error Rate',
    description: 'Percentage of requests resulting in errors',
    unit: '%',
    format: 'percentage',
    aggregation: 'avg',
    category: 'Quality',
    isKPI: true,
    target: 1,
    thresholds: { warning: 2, critical: 5 }
  }
];

const generateMockData = (metric: MetricDefinition, days: number = 30): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    let value: number;
    
    switch (metric.id) {
      case 'users_active':
        value = Math.floor(Math.random() * 2000 + 3000 + Math.sin(i * 0.1) * 500);
        break;
      case 'revenue_daily':
        value = Math.floor(Math.random() * 5000 + 7000 + Math.sin(i * 0.2) * 2000);
        break;
      case 'conversion_rate':
        value = Math.random() * 10 + 10 + Math.sin(i * 0.15) * 3;
        break;
      case 'page_load_time':
        value = Math.floor(Math.random() * 300 + 400 + Math.sin(i * 0.3) * 200);
        break;
      case 'error_rate':
        value = Math.random() * 2 + 0.5 + Math.sin(i * 0.25) * 1;
        break;
      default:
        value = Math.random() * 1000;
    }
    
    data.push({
      id: `${metric.id}-${i}`,
      label: date.toISOString().split('T')[0],
      value: Math.max(0, value),
      timestamp: date.toISOString(),
      category: metric.category,
      metadata: {
        metric: metric.name,
        target: metric.target,
        unit: metric.unit
      }
    });
  }
  
  return data;
};

// Utility functions for data formatting
const formatValue = (value: number, format: MetricDefinition['format'], unit: string): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pl-PL', { 
        style: 'currency', 
        currency: unit 
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'time':
      return `${Math.round(value)}${unit}`;
    case 'bytes':
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(value) / Math.log(1024));
      return `${(value / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    case 'number':
    default:
      return new Intl.NumberFormat('pl-PL').format(Math.round(value));
  }
};

const getStatusColor = (value: number, metric: MetricDefinition): string => {
  if (!metric.thresholds) return 'text-blue-400';
  
  if (value >= (metric.target || Infinity)) return 'text-green-400';
  if (value <= metric.thresholds.critical) return 'text-red-400';
  if (value <= metric.thresholds.warning) return 'text-yellow-400';
  return 'text-blue-400';
};

const getTrendIcon = (current: number, previous: number) => {
  if (current > previous) {
    return <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />;
  } else if (current < previous) {
    return <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />;
  }
  return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
};

// Chart components
const LineChart: React.FC<{ data: ChartData; config: VisualizationConfig }> = ({ data, config }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = config.width || 800;
    canvas.height = config.height || 400;
    
    // Simple line chart implementation
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Draw background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (data.datasets.length === 0 || data.labels.length === 0) return;
    
    const dataset = data.datasets[0];
    const maxValue = Math.max(...dataset.data);
    const minValue = Math.min(...dataset.data);
    const valueRange = maxValue - minValue || 1;
    
    // Draw grid
    if (config.options?.showGrid !== false) {
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (i * chartHeight) / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }
      
      // Vertical grid lines
      for (let i = 0; i <= data.labels.length - 1; i++) {
        const x = padding + (i * chartWidth) / (data.labels.length - 1);
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();
      }
    }
    
    // Draw line
    ctx.strokeStyle = dataset.borderColor || '#3b82f6';
    ctx.lineWidth = dataset.borderWidth || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    dataset.data.forEach((value, index) => {
      const x = padding + (index * chartWidth) / (data.labels.length - 1);
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = dataset.borderColor || '#3b82f6';
    dataset.data.forEach((value, index) => {
      const x = padding + (index * chartWidth) / (data.labels.length - 1);
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    
    // X-axis labels
    data.labels.forEach((label, index) => {
      if (index % Math.ceil(data.labels.length / 8) === 0) {
        const x = padding + (index * chartWidth) / (data.labels.length - 1);
        ctx.fillText(label, x, canvas.height - 20);
      }
    });
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange * i) / 5;
      const y = padding + chartHeight - (i * chartHeight) / 5;
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }
    
  }, [data, config]);
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-lg"
        style={{ maxHeight: config.height || 400 }}
      />
      {config.options?.showLegend !== false && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: dataset.borderColor || '#3b82f6' }}
              />
              <span className="text-sm text-gray-300">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BarChart: React.FC<{ data: ChartData; config: VisualizationConfig }> = ({ data, config }) => {
  if (data.datasets.length === 0) return <div className="text-gray-400">No data available</div>;
  
  const dataset = data.datasets[0];
  const maxValue = Math.max(...dataset.data);
  
  return (
    <div className="space-y-4">
      {data.labels.map((label, index) => {
        const value = dataset.data[index];
        const percentage = (value / maxValue) * 100;
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">{label}</span>
              <span className="text-sm font-medium text-white">{value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PieChart: React.FC<{ data: ChartData; config: VisualizationConfig }> = ({ data, config }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || data.datasets.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = config.width || 300;
    canvas.height = config.height || 300;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    const dataset = data.datasets[0];
    const total = dataset.data.reduce((sum, value) => sum + value, 0);
    
    const colors = [
      '#3b82f6', '#8b5cf6', '#06d6a0', '#f59e0b', 
      '#ef4444', '#84cc16', '#f97316', '#6366f1'
    ];
    
    let currentAngle = -Math.PI / 2;
    
    dataset.data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      // Draw slice
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      
      // Draw label
      if (sliceAngle > 0.2) {
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${((value / total) * 100).toFixed(1)}%`,
          labelX,
          labelY
        );
      }
      
      currentAngle += sliceAngle;
    });
    
  }, [data, config]);
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas ref={canvasRef} className="max-w-full h-auto" />
      {config.options?.showLegend !== false && (
        <div className="grid grid-cols-2 gap-2">
          {data.labels.map((label, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: ['#3b82f6', '#8b5cf6', '#06d6a0', '#f59e0b', 
                                   '#ef4444', '#84cc16', '#f97316', '#6366f1'][index % 8]
                }}
              />
              <span className="text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Data Visualization Engine Component
export const DataVisualizationEngine: React.FC<DataVisualizationEngineProps> = ({
  data,
  metrics,
  config,
  realtime,
  onDataExport,
  onConfigChange,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [realtimeData, setRealtimeData] = useState<DataPoint[]>(data);
  
  // Convert data to chart format
  const chartData = useMemo((): ChartData => {
    const relevantData = realtimeData.slice(-30); // Last 30 points
    
    return {
      labels: relevantData.map(point => 
        new Date(point.timestamp).toLocaleDateString('pl-PL', { 
          month: 'short', 
          day: 'numeric' 
        })
      ),
      datasets: [{
        label: config.title,
        data: relevantData.map(point => point.value),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: config.type === 'area',
        tension: 0.4
      }]
    };
  }, [realtimeData, config]);
  
  // Simulated real-time updates
  useEffect(() => {
    if (!realtime?.isActive) return;
    
    const interval = setInterval(() => {
      setRealtimeData(prev => {
        const lastPoint = prev[prev.length - 1];
        const newPoint: DataPoint = {
          id: `realtime-${Date.now()}`,
          label: new Date().toISOString().split('T')[0],
          value: lastPoint.value + (Math.random() - 0.5) * lastPoint.value * 0.1,
          timestamp: new Date().toISOString(),
          category: lastPoint.category,
          metadata: lastPoint.metadata
        };
        
        return [...prev.slice(-49), newPoint]; // Keep last 50 points
      });
    }, realtime.interval);
    
    return () => clearInterval(interval);
  }, [realtime]);
  
  // Chart component selector
  const renderChart = () => {
    switch (config.type) {
      case 'line':
      case 'area':
        return <LineChart data={chartData} config={config} />;
      case 'bar':
        return <BarChart data={chartData} config={config} />;
      case 'pie':
      case 'doughnut':
        return <PieChart data={chartData} config={config} />;
      default:
        return <LineChart data={chartData} config={config} />;
    }
  };
  
  // Calculate current and previous values for trending
  const currentValue = realtimeData[realtimeData.length - 1]?.value || 0;
  const previousValue = realtimeData[realtimeData.length - 2]?.value || 0;
  const changePercent = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{config.title}</h3>
            {config.description && (
              <p className="text-sm text-blue-200">{config.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {realtime?.isActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-300">Live</span>
              </div>
            )}
            
            {onDataExport && (
              <div className="flex gap-1">
                {['csv', 'json', 'pdf', 'excel'].map(format => (
                  <button
                    key={format}
                    onClick={() => onDataExport(format as any)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title={`Export as ${format.toUpperCase()}`}
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Current Value Display */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-white">
                {formatValue(currentValue, metrics[0]?.format || 'number', metrics[0]?.unit || '')}
              </span>
              {getTrendIcon(currentValue, previousValue)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm ${changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">vs previous</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Last Update</div>
            <div className="text-sm text-white">
              {new Date(realtimeData[realtimeData.length - 1]?.timestamp || Date.now()).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <ArrowPathIcon className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : (
          renderChart()
        )}
      </div>
      
      {/* Footer with timeframe selector */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map(timeframe => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ClockIcon className="w-4 h-4" />
            <span>Updated {Math.floor(Math.random() * 5) + 1} minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizationEngine;