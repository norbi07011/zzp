import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  CloudArrowDownIcon,
  BoltIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { PerformanceDetails } from './PerformanceMonitor';
import BundleAnalyzer from './BundleAnalyzer';
import CacheOptimizer from './CacheOptimizer';
import LoadingOptimizer from './LoadingOptimizer';

interface PerformanceScore {
  overall: number;
  loading: number;
  interactivity: number;
  visualStability: number;
  bestPractices: number;
}

interface SystemInfo {
  userAgent: string;
  platform: string;
  memory: number;
  connection: string;
  devicePixelRatio: number;
  screen: {
    width: number;
    height: number;
  };
}

// Calculate performance score based on various metrics
const calculatePerformanceScore = (): PerformanceScore => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
  const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
  
  // Scoring based on Core Web Vitals thresholds
  const loadingScore = Math.max(0, Math.min(100, 100 - (fcp / 25))); // Good FCP < 2.5s
  const interactivityScore = Math.max(0, Math.min(100, 100 - (domContentLoaded / 10))); // Good DOM < 1s
  const visualStabilityScore = 85; // Mock CLS score
  const bestPracticesScore = 90; // Mock best practices score
  
  const overall = Math.round((loadingScore + interactivityScore + visualStabilityScore + bestPracticesScore) / 4);
  
  return {
    overall,
    loading: Math.round(loadingScore),
    interactivity: Math.round(interactivityScore),
    visualStability: Math.round(visualStabilityScore),
    bestPractices: Math.round(bestPracticesScore)
  };
};

// Get system information
const getSystemInfo = (): SystemInfo => {
  const nav = navigator as any;
  
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    memory: nav.deviceMemory || 0,
    connection: nav.connection?.effectiveType || 'unknown',
    devicePixelRatio: window.devicePixelRatio,
    screen: {
      width: screen.width,
      height: screen.height
    }
  };
};

const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600 bg-green-50';
  if (score >= 70) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

const getScoreIcon = (score: number) => {
  if (score >= 90) return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
  if (score >= 70) return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
  return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
};

export const PerformanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'bundle' | 'cache' | 'loading'>('overview');
  const [performanceScore, setPerformanceScore] = useState<PerformanceScore | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calculate performance scores and system info
    setTimeout(() => {
      try {
        setPerformanceScore(calculatePerformanceScore());
        setSystemInfo(getSystemInfo());
      } catch (error) {
        console.error('Failed to calculate performance metrics:', error);
      } finally {
        setLoading(false);
      }
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border p-6">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
          <p className="text-gray-600">
            Monitor and optimize your application's performance in real-time
          </p>
        </div>

        {/* Performance Scores */}
        {performanceScore && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Overall Score</h3>
                {getScoreIcon(performanceScore.overall)}
              </div>
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(performanceScore.overall)}`}>
                {performanceScore.overall}
              </div>
              <div className="text-xs text-gray-500">Performance Index</div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Loading</h3>
                {getScoreIcon(performanceScore.loading)}
              </div>
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(performanceScore.loading)}`}>
                {performanceScore.loading}
              </div>
              <div className="text-xs text-gray-500">FCP, LCP</div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Interactivity</h3>
                {getScoreIcon(performanceScore.interactivity)}
              </div>
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(performanceScore.interactivity)}`}>
                {performanceScore.interactivity}
              </div>
              <div className="text-xs text-gray-500">TBT, FID</div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Visual Stability</h3>
                {getScoreIcon(performanceScore.visualStability)}
              </div>
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(performanceScore.visualStability)}`}>
                {performanceScore.visualStability}
              </div>
              <div className="text-xs text-gray-500">CLS</div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Best Practices</h3>
                {getScoreIcon(performanceScore.bestPractices)}
              </div>
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(performanceScore.bestPractices)}`}>
                {performanceScore.bestPractices}
              </div>
              <div className="text-xs text-gray-500">Security, A11y</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 bg-white rounded-t-lg">
          {[
            { key: 'overview', label: 'Overview', icon: ChartBarIcon },
            { key: 'monitoring', label: 'Real-time Monitoring', icon: CpuChipIcon },
            { key: 'bundle', label: 'Bundle Analysis', icon: CloudArrowDownIcon },
            { key: 'cache', label: 'Cache Optimization', icon: Cog6ToothIcon },
            { key: 'loading', label: 'Loading Performance', icon: BoltIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-8">
              {/* System Information */}
              {systemInfo && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Platform</div>
                      <div className="text-sm">{systemInfo.platform}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Connection</div>
                      <div className="text-sm capitalize">{systemInfo.connection}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Device Memory</div>
                      <div className="text-sm">{systemInfo.memory || 'Unknown'} GB</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Screen Resolution</div>
                      <div className="text-sm">{systemInfo.screen.width}x{systemInfo.screen.height}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Device Pixel Ratio</div>
                      <div className="text-sm">{systemInfo.devicePixelRatio}x</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4 text-blue-900">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('bundle')}
                    className="p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors text-left"
                  >
                    <CloudArrowDownIcon className="w-8 h-8 text-blue-600 mb-2" />
                    <div className="font-medium">Analyze Bundle</div>
                    <div className="text-sm text-gray-600">View bundle size and optimization</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('cache')}
                    className="p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors text-left"
                  >
                    <Cog6ToothIcon className="w-8 h-8 text-blue-600 mb-2" />
                    <div className="font-medium">Optimize Cache</div>
                    <div className="text-sm text-gray-600">Manage caching strategies</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('loading')}
                    className="p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors text-left"
                  >
                    <BoltIcon className="w-8 h-8 text-blue-600 mb-2" />
                    <div className="font-medium">Loading Analysis</div>
                    <div className="text-sm text-gray-600">Check resource loading</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('monitoring')}
                    className="p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors text-left"
                  >
                    <CpuChipIcon className="w-8 h-8 text-blue-600 mb-2" />
                    <div className="font-medium">Real-time Monitor</div>
                    <div className="text-sm text-gray-600">Watch live performance</div>
                  </button>
                </div>
              </div>

              {/* Performance Tips */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4 text-green-900">Performance Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Optimize Images</div>
                        <div className="text-sm text-gray-600">Use WebP format and lazy loading</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Enable Compression</div>
                        <div className="text-sm text-gray-600">Use Gzip or Brotli compression</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Minimize JavaScript</div>
                        <div className="text-sm text-gray-600">Remove unused code and dependencies</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Use CDN</div>
                        <div className="text-sm text-gray-600">Serve static assets from CDN</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Implement Caching</div>
                        <div className="text-sm text-gray-600">Use browser and server-side caching</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Optimize Critical Path</div>
                        <div className="text-sm text-gray-600">Inline critical CSS and defer non-critical resources</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && <PerformanceDetails />}
          {activeTab === 'bundle' && <BundleAnalyzer />}
          {activeTab === 'cache' && <CacheOptimizer />}
          {activeTab === 'loading' && <LoadingOptimizer />}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;