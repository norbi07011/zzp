import React, { useState, useEffect } from 'react';
import { ClockIcon, BoltIcon, EyeIcon, ServerIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Performance Monitor Component - Task 4.1 Real-time Performance Tracking
interface WebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  inp: number; // Interaction to Next Paint
}

interface PerformanceMetrics {
  vitals: WebVitals;
  loadTime: number;
  domReady: number;
  resourceCount: number;
  cacheHitRate: number;
  memoryUsage: number;
  networkLatency: number;
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  userExperience: {
    bounceRate: number;
    sessionDuration: number;
    pageViews: number;
    conversionRate: number;
  };
}

interface PerformanceTrend {
  timestamp: number;
  value: number;
  metric: string;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [realTimeData, setRealTimeData] = useState<PerformanceTrend[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('lcp');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [alerts, setAlerts] = useState<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }[]>([]);

  useEffect(() => {
    // Simulate real-time performance data collection
    const interval = setInterval(() => {
      if (isLiveMode) {
        const newDataPoint: PerformanceTrend = {
          timestamp: Date.now(),
          value: Math.random() * 100 + 50 + (Math.sin(Date.now() / 10000) * 20),
          metric: selectedMetric
        };
        
        setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
        
        // Check for performance alerts
        if (newDataPoint.value > 150 && selectedMetric === 'lcp') {
          setAlerts(prev => [...prev, {
            type: 'LCP Warning',
            message: 'Largest Contentful Paint is above 2.5s threshold',
            severity: 'high' as const
          }].slice(-5));
        }
      }
    }, 1000);

    // Load initial metrics with realistic data
    const mockMetrics: PerformanceMetrics = {
      vitals: {
        lcp: 1245, // ms - Excellent (<2.5s)
        fid: 45,   // ms - Good (<100ms)
        cls: 0.08, // score - Good (<0.1)
        fcp: 892,  // ms - Good (<1.8s)
        ttfb: 234, // ms - Good (<600ms)
        inp: 67    // ms - Good (<200ms)
      },
      loadTime: 1456,
      domReady: 987,
      resourceCount: 42,
      cacheHitRate: 87.3,
      memoryUsage: 45.6, // MB
      networkLatency: 23, // ms
      lighthouse: {
        performance: 94,
        accessibility: 91,
        bestPractices: 96,
        seo: 88,
        pwa: 85
      },
      userExperience: {
        bounceRate: 23.5, // %
        sessionDuration: 4.2, // minutes
        pageViews: 3.8,
        conversionRate: 12.4 // %
      }
    };

    setTimeout(() => setMetrics(mockMetrics), 500);

    return () => clearInterval(interval);
  }, [isLiveMode, selectedMetric]);

  const getVitalStatus = (vital: string, value: number): { color: string; status: string; grade: string } => {
    switch (vital) {
      case 'lcp':
        if (value < 2500) return { color: 'text-green-600 bg-green-100', status: 'Good', grade: 'A' };
        if (value < 4000) return { color: 'text-yellow-600 bg-yellow-100', status: 'Needs Improvement', grade: 'B' };
        return { color: 'text-red-600 bg-red-100', status: 'Poor', grade: 'F' };
      case 'fid':
      case 'inp':
        if (value < 100) return { color: 'text-green-600 bg-green-100', status: 'Good', grade: 'A' };
        if (value < 300) return { color: 'text-yellow-600 bg-yellow-100', status: 'Needs Improvement', grade: 'B' };
        return { color: 'text-red-600 bg-red-100', status: 'Poor', grade: 'F' };
      case 'cls':
        if (value < 0.1) return { color: 'text-green-600 bg-green-100', status: 'Good', grade: 'A' };
        if (value < 0.25) return { color: 'text-yellow-600 bg-yellow-100', status: 'Needs Improvement', grade: 'B' };
        return { color: 'text-red-600 bg-red-100', status: 'Poor', grade: 'F' };
      case 'fcp':
        if (value < 1800) return { color: 'text-green-600 bg-green-100', status: 'Good', grade: 'A' };
        if (value < 3000) return { color: 'text-yellow-600 bg-yellow-100', status: 'Needs Improvement', grade: 'B' };
        return { color: 'text-red-600 bg-red-100', status: 'Poor', grade: 'F' };
      case 'ttfb':
        if (value < 600) return { color: 'text-green-600 bg-green-100', status: 'Good', grade: 'A' };
        if (value < 1200) return { color: 'text-yellow-600 bg-yellow-100', status: 'Needs Improvement', grade: 'B' };
        return { color: 'text-red-600 bg-red-100', status: 'Poor', grade: 'F' };
      default:
        return { color: 'text-gray-600 bg-gray-100', status: 'Unknown', grade: 'N/A' };
    }
  };

  const getLighthouseColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLighthouseGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const startMonitoring = async () => {
    setMonitoring(true);
    setIsLiveMode(true);
    
    // Simulate performance optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (metrics) {
      setMetrics(prev => prev ? {
        ...prev,
        vitals: {
          ...prev.vitals,
          lcp: Math.max(900, prev.vitals.lcp * 0.85), // Improve LCP
          fid: Math.max(20, prev.vitals.fid * 0.75),  // Improve FID
          cls: Math.max(0.02, prev.vitals.cls * 0.6)  // Improve CLS
        },
        cacheHitRate: Math.min(95, prev.cacheHitRate + 8),
        lighthouse: {
          ...prev.lighthouse,
          performance: Math.min(100, prev.lighthouse.performance + 3)
        }
      } : null);
    }
    
    setMonitoring(false);
  };

  const exportMetrics = () => {
    const exportData = {
      metrics,
      realTimeData,
      alerts,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAlerts = () => setAlerts([]);

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BoltIcon className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
            <p className="text-gray-600">Real-time Core Web Vitals and performance tracking</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isLiveMode 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLiveMode ? 'Stop Live Mode' : 'Start Live Mode'}
          </button>
          <button
            onClick={exportMetrics}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Export Metrics
          </button>
          <button
            onClick={startMonitoring}
            disabled={monitoring}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {monitoring ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Optimizing...
              </>
            ) : (
              'Optimize Performance'
            )}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-red-800">Performance Alerts</h3>
            <button
              onClick={clearAlerts}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-2 rounded ${
                alert.severity === 'high' ? 'bg-red-100' :
                alert.severity === 'medium' ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                <div className="flex justify-between">
                  <span className="font-medium">{alert.type}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    alert.severity === 'high' ? 'bg-red-200 text-red-800' :
                    alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Web Vitals */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Core Web Vitals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Largest Contentful Paint</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${getVitalStatus('lcp', metrics.vitals.lcp).color}`}>
                {getVitalStatus('lcp', metrics.vitals.lcp).grade}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.vitals.lcp}ms</div>
            <div className={`text-sm px-2 py-1 rounded ${getVitalStatus('lcp', metrics.vitals.lcp).color}`}>
              {getVitalStatus('lcp', metrics.vitals.lcp).status}
            </div>
            <div className="mt-3 text-xs text-gray-600">Target: &lt; 2.5s</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BoltIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">First Input Delay</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${getVitalStatus('fid', metrics.vitals.fid).color}`}>
                {getVitalStatus('fid', metrics.vitals.fid).grade}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.vitals.fid}ms</div>
            <div className={`text-sm px-2 py-1 rounded ${getVitalStatus('fid', metrics.vitals.fid).color}`}>
              {getVitalStatus('fid', metrics.vitals.fid).status}
            </div>
            <div className="mt-3 text-xs text-gray-600">Target: &lt; 100ms</div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <EyeIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Cumulative Layout Shift</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${getVitalStatus('cls', metrics.vitals.cls).color}`}>
                {getVitalStatus('cls', metrics.vitals.cls).grade}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.vitals.cls.toFixed(3)}</div>
            <div className={`text-sm px-2 py-1 rounded ${getVitalStatus('cls', metrics.vitals.cls).color}`}>
              {getVitalStatus('cls', metrics.vitals.cls).status}
            </div>
            <div className="mt-3 text-xs text-gray-600">Target: &lt; 0.1</div>
          </div>
        </div>

        {/* Additional Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.vitals.fcp}ms</div>
            <div className="text-sm text-gray-600 mb-2">First Contentful Paint</div>
            <div className={`text-xs px-2 py-1 rounded ${getVitalStatus('fcp', metrics.vitals.fcp).color}`}>
              {getVitalStatus('fcp', metrics.vitals.fcp).grade}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.vitals.ttfb}ms</div>
            <div className="text-sm text-gray-600 mb-2">Time to First Byte</div>
            <div className={`text-xs px-2 py-1 rounded ${getVitalStatus('ttfb', metrics.vitals.ttfb).color}`}>
              {getVitalStatus('ttfb', metrics.vitals.ttfb).grade}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.vitals.inp}ms</div>
            <div className="text-sm text-gray-600 mb-2">Interaction to Next Paint</div>
            <div className={`text-xs px-2 py-1 rounded ${getVitalStatus('inp', metrics.vitals.inp).color}`}>
              {getVitalStatus('inp', metrics.vitals.inp).grade}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-3">
            <ServerIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">System Performance</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-lg font-bold text-gray-900">{metrics.loadTime}ms</div>
              <div className="text-xs text-gray-600">Total Load Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{metrics.memoryUsage.toFixed(1)}MB</div>
              <div className="text-xs text-gray-600">Memory Usage</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Caching & Network</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-lg font-bold text-gray-900">{metrics.cacheHitRate}%</div>
              <div className="text-xs text-gray-600">Cache Hit Rate</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{metrics.networkLatency}ms</div>
              <div className="text-xs text-gray-600">Network Latency</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-3">
            <EyeIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">User Experience</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-lg font-bold text-gray-900">{metrics.userExperience.bounceRate}%</div>
              <div className="text-xs text-gray-600">Bounce Rate</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{metrics.userExperience.sessionDuration}m</div>
              <div className="text-xs text-gray-600">Avg Session</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">Conversions</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-lg font-bold text-gray-900">{metrics.userExperience.conversionRate}%</div>
              <div className="text-xs text-gray-600">Conversion Rate</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{metrics.userExperience.pageViews}</div>
              <div className="text-xs text-gray-600">Pages/Session</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lighthouse Scores */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lighthouse Performance Audit</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {Object.entries(metrics.lighthouse).map(([category, score]) => (
            <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold mb-1 ${getLighthouseColor(score)}`}>
                {score}
              </div>
              <div className={`text-xs px-2 py-1 rounded mb-2 ${
                score >= 90 ? 'bg-green-100 text-green-800' :
                score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Grade {getLighthouseGrade(score)}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Performance Monitoring</h3>
          <div className="flex gap-2">
            {['lcp', 'fid', 'cls', 'fcp'].map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {metric.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-32 flex items-end justify-between gap-1 mb-4">
          {realTimeData.map((point, index) => (
            <div
              key={index}
              className={`rounded-t transition-all duration-300 ${
                isLiveMode ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ 
                height: `${Math.max(5, (point.value / 200) * 100)}%`,
                width: `${100 / Math.max(20, realTimeData.length)}%`
              }}
              title={`${point.value.toFixed(0)}ms`}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Monitoring: {selectedMetric.toUpperCase()}</span>
          <span className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            {isLiveMode ? 'Live' : 'Stopped'}
          </span>
          <span>Last 20 data points</span>
        </div>
      </div>
    </div>
  );
};