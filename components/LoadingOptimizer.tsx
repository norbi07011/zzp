import React, { useState, useEffect } from 'react';
import { 
  BoltIcon, 
  PhotoIcon, 
  DocumentTextIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ResourceTiming {
  name: string;
  type: 'script' | 'stylesheet' | 'image' | 'fetch' | 'other';
  size: number;
  duration: number;
  startTime: number;
  blocking: boolean;
  critical: boolean;
}

interface LoadingMetrics {
  domContentLoaded: number;
  windowLoad: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  resources: ResourceTiming[];
}

interface OptimizationSuggestion {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  action: string;
}

// Performance measurement utilities
const measurePerformance = (): LoadingMetrics => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  // Get paint metrics
  const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime || 0;
  const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;

  // Process resource timings
  const resourceTimings: ResourceTiming[] = resources.map(resource => {
    const duration = resource.responseEnd - resource.requestStart;
    const size = resource.transferSize || 0;
    
    // Determine resource type
    let type: ResourceTiming['type'] = 'other';
    if (resource.initiatorType === 'script') type = 'script';
    else if (resource.initiatorType === 'css') type = 'stylesheet';
    else if (resource.initiatorType === 'img') type = 'image';
    else if (resource.initiatorType === 'fetch' || resource.initiatorType === 'xmlhttprequest') type = 'fetch';

    // Check if resource is render-blocking
    const blocking = type === 'stylesheet' || (type === 'script' && !resource.name.includes('defer') && !resource.name.includes('async'));
    
    // Check if resource is critical (loaded early in the process)
    const critical = resource.startTime < 1000;

    return {
      name: resource.name,
      type,
      size,
      duration,
      startTime: resource.startTime,
      blocking,
      critical
    };
  });

  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    windowLoad: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint,
    firstContentfulPaint,
    largestContentfulPaint: 0, // Would be measured via observer
    firstInputDelay: 0, // Would be measured via observer
    cumulativeLayoutShift: 0, // Would be measured via observer
    totalBlockingTime: resourceTimings
      .filter(r => r.blocking)
      .reduce((sum, r) => sum + r.duration, 0),
    resources: resourceTimings
  };
};

// Generate optimization suggestions based on metrics
const generateSuggestions = (metrics: LoadingMetrics): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];

  // Check for large resources
  const largeResources = metrics.resources.filter(r => r.size > 500000); // > 500KB
  if (largeResources.length > 0) {
    suggestions.push({
      type: 'warning',
      title: 'Large Resources Detected',
      description: `${largeResources.length} resources are larger than 500KB`,
      impact: 'high',
      effort: 'medium',
      action: 'Optimize images, compress assets, implement code splitting'
    });
  }

  // Check for render-blocking resources
  const blockingResources = metrics.resources.filter(r => r.blocking);
  if (blockingResources.length > 3) {
    suggestions.push({
      type: 'critical',
      title: 'Too Many Render-Blocking Resources',
      description: `${blockingResources.length} resources are blocking page render`,
      impact: 'high',
      effort: 'medium',
      action: 'Use async/defer for scripts, inline critical CSS'
    });
  }

  // Check First Contentful Paint
  if (metrics.firstContentfulPaint > 2500) {
    suggestions.push({
      type: 'warning',
      title: 'Slow First Contentful Paint',
      description: `FCP is ${(metrics.firstContentfulPaint / 1000).toFixed(2)}s (should be < 2.5s)`,
      impact: 'high',
      effort: 'high',
      action: 'Optimize critical rendering path, reduce main thread blocking'
    });
  }

  // Check Total Blocking Time
  if (metrics.totalBlockingTime > 300) {
    suggestions.push({
      type: 'warning',
      title: 'High Total Blocking Time',
      description: `TBT is ${metrics.totalBlockingTime.toFixed(0)}ms (should be < 300ms)`,
      impact: 'medium',
      effort: 'medium',
      action: 'Split long tasks, optimize JavaScript execution'
    });
  }

  // Check number of requests
  if (metrics.resources.length > 50) {
    suggestions.push({
      type: 'info',
      title: 'High Number of Requests',
      description: `${metrics.resources.length} HTTP requests detected`,
      impact: 'medium',
      effort: 'low',
      action: 'Bundle resources, use HTTP/2 server push, implement resource hints'
    });
  }

  // Check for unoptimized images
  const largeImages = metrics.resources.filter(r => r.type === 'image' && r.size > 100000);
  if (largeImages.length > 0) {
    suggestions.push({
      type: 'warning',
      title: 'Unoptimized Images',
      description: `${largeImages.length} images are larger than 100KB`,
      impact: 'medium',
      effort: 'low',
      action: 'Use modern image formats (WebP, AVIF), implement lazy loading'
    });
  }

  return suggestions;
};

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getResourceTypeIcon = (type: ResourceTiming['type']) => {
  switch (type) {
    case 'script': return <DocumentTextIcon className="w-4 h-4" />;
    case 'stylesheet': return <DocumentTextIcon className="w-4 h-4" />;
    case 'image': return <PhotoIcon className="w-4 h-4" />;
    case 'fetch': return <GlobeAltIcon className="w-4 h-4" />;
    default: return <DocumentTextIcon className="w-4 h-4" />;
  }
};

const getResourceTypeColor = (type: ResourceTiming['type']): string => {
  switch (type) {
    case 'script': return 'bg-yellow-100 text-yellow-800';
    case 'stylesheet': return 'bg-blue-100 text-blue-800';
    case 'image': return 'bg-green-100 text-green-800';
    case 'fetch': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getSuggestionIcon = (type: OptimizationSuggestion['type']) => {
  switch (type) {
    case 'critical': return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
    case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    case 'info': return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
    default: return <CheckCircleIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getSuggestionColor = (type: OptimizationSuggestion['type']): string => {
  switch (type) {
    case 'critical': return 'border-red-200 bg-red-50';
    case 'warning': return 'border-yellow-200 bg-yellow-50';
    case 'info': return 'border-blue-200 bg-blue-50';
    default: return 'border-gray-200 bg-gray-50';
  }
};

export const LoadingOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<LoadingMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'suggestions'>('overview');

  useEffect(() => {
    // Measure performance after a short delay to ensure all resources are loaded
    setTimeout(() => {
      try {
        const performanceMetrics = measurePerformance();
        setMetrics(performanceMetrics);
        setSuggestions(generateSuggestions(performanceMetrics));
      } catch (error) {
        console.error('Failed to measure performance:', error);
      } finally {
        setLoading(false);
      }
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Performance Data Not Available</h3>
        <p className="text-gray-600">Performance API is not supported or data is unavailable.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BoltIcon className="w-6 h-6" />
          Loading Performance Optimizer
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Rerun Analysis
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'resources', label: 'Resources' },
          { key: 'suggestions', label: 'Suggestions' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Core Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-800">First Contentful Paint</div>
              <div className="text-2xl font-bold text-blue-900">
                {formatDuration(metrics.firstContentfulPaint)}
              </div>
              <div className="text-xs text-blue-600">
                {metrics.firstContentfulPaint < 2500 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800">DOM Content Loaded</div>
              <div className="text-2xl font-bold text-green-900">
                {formatDuration(metrics.domContentLoaded)}
              </div>
              <div className="text-xs text-green-600">Document ready</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm font-medium text-yellow-800">Window Load</div>
              <div className="text-2xl font-bold text-yellow-900">
                {formatDuration(metrics.windowLoad)}
              </div>
              <div className="text-xs text-yellow-600">All resources loaded</div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm font-medium text-red-800">Total Blocking Time</div>
              <div className="text-2xl font-bold text-red-900">
                {formatDuration(metrics.totalBlockingTime)}
              </div>
              <div className="text-xs text-red-600">
                {metrics.totalBlockingTime < 300 ? 'Good' : 'High'}
              </div>
            </div>
          </div>

          {/* Resource Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Resource Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['script', 'stylesheet', 'image', 'fetch'].map(type => {
                const typeResources = metrics.resources.filter(r => r.type === type);
                const totalSize = typeResources.reduce((sum, r) => sum + r.size, 0);
                
                return (
                  <div key={type} className="bg-white rounded border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {getResourceTypeIcon(type as ResourceTiming['type'])}
                      <span className="font-medium capitalize">{type}s</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Count: {typeResources.length}</div>
                      <div>Size: {formatFileSize(totalSize)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Loaded Resources ({metrics.resources.length})</h3>
            <div className="text-sm text-gray-500">
              Total: {formatFileSize(metrics.resources.reduce((sum, r) => sum + r.size, 0))}
            </div>
          </div>
          
          {metrics.resources
            .sort((a, b) => b.size - a.size) // Sort by size descending
            .map((resource, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getResourceTypeColor(resource.type)}`}>
                      {resource.type}
                    </span>
                    {resource.blocking && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        Blocking
                      </span>
                    )}
                    {resource.critical && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        Critical
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatFileSize(resource.size)}</div>
                    <div className="text-sm text-gray-500">{formatDuration(resource.duration)}</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 truncate">
                  {resource.name}
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Started: {formatDuration(resource.startTime)} after navigation
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Optimization Suggestions ({suggestions.length})</h3>
          
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h4 className="text-lg font-medium text-green-800 mb-2">Great Performance!</h4>
              <p className="text-green-600">No optimization suggestions at this time.</p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getSuggestionColor(suggestion.type)}`}>
                <div className="flex items-start gap-3">
                  {getSuggestionIcon(suggestion.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-70">
                          Impact: {suggestion.impact}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-70">
                          Effort: {suggestion.effort}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{suggestion.description}</p>
                    <div className="text-sm font-medium">
                      <ClockIcon className="w-4 h-4 inline mr-1" />
                      Action: {suggestion.action}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LoadingOptimizer;