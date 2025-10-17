import React, { useState, useEffect } from 'react';

// Real-time Performance Monitoring System
export const RealTimePerformanceMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('realtime');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);

  // Performance Data Interface
  interface PerformanceData {
    realTimeMetrics?: {
      currentUsers: number;
      pageViews: number;
      avgLoadTime: number;
      bounceRate: number;
      serverLoad: number;
      memoryUsage: number;
      cpuUsage: number;
      networkLatency: number;
    };
    webVitals?: {
      lcp: number[];
      fid: number[];
      cls: number[];
      fcp: number[];
      ttfb: number[];
      timestamps: string[];
    };
    userExperience?: {
      satisfactory: number;
      tolerable: number;
      frustrating: number;
      averageSessionTime: number;
      pagesPerSession: number;
    };
    errorTracking?: {
      jsErrors: number;
      networkErrors: number;
      totalErrors: number;
      errorRate: number;
      criticalErrors: string[];
    };
    geographicData?: {
      topCountries: { country: string; users: number; avgLoadTime: number }[];
      regions: { region: string; performance: number }[];
    };
  }

  // Alert Interface
  interface Alert {
    id: string;
    type: 'warning' | 'error' | 'critical' | 'info';
    title: string;
    message: string;
    timestamp: string;
    metric: string;
    value: number;
    threshold: number;
    acknowledged: boolean;
    resolved: boolean;
  }

  // User Session Interface
  interface UserSession {
    id: string;
    userId: string;
    startTime: string;
    duration: number;
    pageViews: number;
    country: string;
    device: string;
    browser: string;
    loadTime: number;
    vitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
    status: 'active' | 'ended';
  }

  // Initialize mock real-time data
  useEffect(() => {
    const mockPerformanceData: PerformanceData = {
      realTimeMetrics: {
        currentUsers: 1247,
        pageViews: 5832,
        avgLoadTime: 1.42,
        bounceRate: 23.4,
        serverLoad: 45.2,
        memoryUsage: 68.7,
        cpuUsage: 34.5,
        networkLatency: 89
      },
      webVitals: {
        lcp: [1.2, 1.3, 1.1, 1.4, 1.2, 1.3, 1.1, 1.2, 1.4, 1.3],
        fid: [45, 52, 38, 60, 42, 48, 35, 41, 55, 49],
        cls: [0.08, 0.09, 0.07, 0.10, 0.08, 0.09, 0.06, 0.08, 0.11, 0.09],
        fcp: [0.9, 1.0, 0.8, 1.1, 0.9, 1.0, 0.8, 0.9, 1.2, 1.0],
        ttfb: [180, 195, 165, 210, 175, 190, 160, 185, 205, 190],
        timestamps: [
          '10:00', '10:15', '10:30', '10:45', '11:00', 
          '11:15', '11:30', '11:45', '12:00', '12:15'
        ]
      },
      userExperience: {
        satisfactory: 78.5,
        tolerable: 18.2,
        frustrating: 3.3,
        averageSessionTime: 4.2, // minutes
        pagesPerSession: 3.7
      },
      errorTracking: {
        jsErrors: 23,
        networkErrors: 8,
        totalErrors: 31,
        errorRate: 0.53, // %
        criticalErrors: [
          'TypeError: Cannot read property of undefined - /dashboard',
          'Network timeout - API call failed - /api/users',
          'Memory leak detected - Component not unmounting'
        ]
      },
      geographicData: {
        topCountries: [
          { country: 'Netherlands', users: 456, avgLoadTime: 1.2 },
          { country: 'Germany', users: 234, avgLoadTime: 1.4 },
          { country: 'Belgium', users: 189, avgLoadTime: 1.3 },
          { country: 'France', users: 167, avgLoadTime: 1.6 },
          { country: 'UK', users: 145, avgLoadTime: 1.8 }
        ],
        regions: [
          { region: 'Western Europe', performance: 95.2 },
          { region: 'Northern Europe', performance: 93.8 },
          { region: 'Central Europe', performance: 91.5 },
          { region: 'Eastern Europe', performance: 89.3 },
          { region: 'Southern Europe', performance: 87.9 }
        ]
      }
    };

    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Load Time Detected',
        message: 'Average load time exceeded threshold of 2.0s',
        timestamp: '2025-01-08T14:23:00Z',
        metric: 'Load Time',
        value: 2.34,
        threshold: 2.0,
        acknowledged: false,
        resolved: false
      },
      {
        id: '2',
        type: 'critical',
        title: 'JavaScript Error Spike',
        message: 'JS error rate increased by 300% in last 15 minutes',
        timestamp: '2025-01-08T14:18:00Z',
        metric: 'Error Rate',
        value: 1.2,
        threshold: 0.5,
        acknowledged: true,
        resolved: false
      },
      {
        id: '3',
        type: 'info',
        title: 'Traffic Increase',
        message: 'Current users 25% above normal levels',
        timestamp: '2025-01-08T14:10:00Z',
        metric: 'Active Users',
        value: 1247,
        threshold: 1000,
        acknowledged: true,
        resolved: true
      },
      {
        id: '4',
        type: 'error',
        title: 'CDN Cache Miss Rate High',
        message: 'Cache miss rate exceeded 20% threshold',
        timestamp: '2025-01-08T13:55:00Z',
        metric: 'Cache Miss Rate',
        value: 23.4,
        threshold: 20.0,
        acknowledged: false,
        resolved: false
      }
    ];

    const mockUserSessions: UserSession[] = [
      {
        id: '1',
        userId: 'user_123',
        startTime: '2025-01-08T14:15:00Z',
        duration: 8.5, // minutes
        pageViews: 5,
        country: 'Netherlands',
        device: 'Desktop',
        browser: 'Chrome',
        loadTime: 1.2,
        vitals: { lcp: 1.1, fid: 42, cls: 0.07 },
        status: 'active'
      },
      {
        id: '2',
        userId: 'user_456',
        startTime: '2025-01-08T14:12:00Z',
        duration: 12.3,
        pageViews: 8,
        country: 'Germany',
        device: 'Mobile',
        browser: 'Safari',
        loadTime: 1.8,
        vitals: { lcp: 1.6, fid: 65, cls: 0.12 },
        status: 'active'
      },
      {
        id: '3',
        userId: 'user_789',
        startTime: '2025-01-08T14:08:00Z',
        duration: 15.7,
        pageViews: 12,
        country: 'Belgium',
        device: 'Tablet',
        browser: 'Firefox',
        loadTime: 1.4,
        vitals: { lcp: 1.3, fid: 48, cls: 0.09 },
        status: 'ended'
      },
      {
        id: '4',
        userId: 'user_012',
        startTime: '2025-01-08T14:20:00Z',
        duration: 3.2,
        pageViews: 2,
        country: 'France',
        device: 'Mobile',
        browser: 'Chrome',
        loadTime: 2.1,
        vitals: { lcp: 1.9, fid: 78, cls: 0.15 },
        status: 'active'
      },
      {
        id: '5',
        userId: 'user_345',
        startTime: '2025-01-08T13:58:00Z',
        duration: 25.4,
        pageViews: 18,
        country: 'UK',
        device: 'Desktop',
        browser: 'Edge',
        loadTime: 1.6,
        vitals: { lcp: 1.4, fid: 52, cls: 0.08 },
        status: 'ended'
      }
    ];

    setPerformanceData(mockPerformanceData);
    setAlerts(mockAlerts);
    setUserSessions(mockUserSessions);

    // Simulate real-time updates
    if (isMonitoring) {
      const interval = setInterval(() => {
        setPerformanceData(prevData => ({
          ...prevData,
          realTimeMetrics: {
            ...prevData.realTimeMetrics!,
            currentUsers: prevData.realTimeMetrics!.currentUsers + Math.floor(Math.random() * 20 - 10),
            pageViews: prevData.realTimeMetrics!.pageViews + Math.floor(Math.random() * 15),
            avgLoadTime: Math.max(0.5, prevData.realTimeMetrics!.avgLoadTime + (Math.random() * 0.2 - 0.1)),
            serverLoad: Math.max(0, Math.min(100, prevData.realTimeMetrics!.serverLoad + (Math.random() * 10 - 5))),
            memoryUsage: Math.max(0, Math.min(100, prevData.realTimeMetrics!.memoryUsage + (Math.random() * 5 - 2.5))),
            cpuUsage: Math.max(0, Math.min(100, prevData.realTimeMetrics!.cpuUsage + (Math.random() * 8 - 4)))
          }
        }));
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  // Render Real-time Dashboard
  const renderRealTimeDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Real-time Performance Dashboard</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-300">
              {isMonitoring ? 'Live Monitoring' : 'Monitoring Paused'}
            </span>
          </div>
          <button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-4 py-2 rounded-lg ${
              isMonitoring 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMonitoring ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-300">Current Users</h4>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {performanceData.realTimeMetrics?.currentUsers.toLocaleString()}
          </div>
          <div className="text-sm text-green-400">+12% vs yesterday</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-300">Page Views</h4>
            <span className="text-2xl">📄</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {performanceData.realTimeMetrics?.pageViews.toLocaleString()}
          </div>
          <div className="text-sm text-green-400">+8% vs yesterday</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-300">Avg Load Time</h4>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {performanceData.realTimeMetrics?.avgLoadTime.toFixed(2)}s
          </div>
          <div className="text-sm text-yellow-400">
            {performanceData.realTimeMetrics?.avgLoadTime! > 2.0 ? '⚠️ Above threshold' : '✅ Good performance'}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-300">Bounce Rate</h4>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {performanceData.realTimeMetrics?.bounceRate.toFixed(1)}%
          </div>
          <div className="text-sm text-green-400">-2.3% vs yesterday</div>
        </div>
      </div>

      {/* Server Metrics */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Server Performance</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Server Load</span>
              <span className="text-sm text-white">{performanceData.realTimeMetrics?.serverLoad.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  performanceData.realTimeMetrics?.serverLoad! > 80 ? 'bg-red-600' :
                  performanceData.realTimeMetrics?.serverLoad! > 60 ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${performanceData.realTimeMetrics?.serverLoad}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Memory Usage</span>
              <span className="text-sm text-white">{performanceData.realTimeMetrics?.memoryUsage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  performanceData.realTimeMetrics?.memoryUsage! > 80 ? 'bg-red-600' :
                  performanceData.realTimeMetrics?.memoryUsage! > 60 ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${performanceData.realTimeMetrics?.memoryUsage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">CPU Usage</span>
              <span className="text-sm text-white">{performanceData.realTimeMetrics?.cpuUsage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  performanceData.realTimeMetrics?.cpuUsage! > 80 ? 'bg-red-600' :
                  performanceData.realTimeMetrics?.cpuUsage! > 60 ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${performanceData.realTimeMetrics?.cpuUsage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Web Vitals Trends */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Core Web Vitals Trends</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">LCP (Largest Contentful Paint)</h5>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {performanceData.webVitals?.lcp[performanceData.webVitals.lcp.length - 1]}s
            </div>
            <div className="text-xs text-gray-400">Last 10 measurements average</div>
            <div className="mt-2 text-xs text-green-400">Good performance (&lt; 2.5s)</div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">FID (First Input Delay)</h5>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {performanceData.webVitals?.fid[performanceData.webVitals.fid.length - 1]}ms
            </div>
            <div className="text-xs text-gray-400">Current average</div>
            <div className="mt-2 text-xs text-green-400">Good responsiveness (&lt; 100ms)</div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">CLS (Cumulative Layout Shift)</h5>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {performanceData.webVitals?.cls[performanceData.webVitals.cls.length - 1]}
            </div>
            <div className="text-xs text-gray-400">Visual stability score</div>
            <div className="mt-2 text-xs text-green-400">Good stability (&lt; 0.1)</div>
          </div>
        </div>
      </div>

      {/* User Experience Distribution */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">User Experience Distribution</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-900 rounded-lg">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {performanceData.userExperience?.satisfactory.toFixed(1)}%
            </div>
            <div className="text-sm text-green-200">Satisfactory</div>
            <div className="text-xs text-green-300 mt-1">Fast and responsive</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-900 rounded-lg">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {performanceData.userExperience?.tolerable.toFixed(1)}%
            </div>
            <div className="text-sm text-yellow-200">Tolerable</div>
            <div className="text-xs text-yellow-300 mt-1">Acceptable performance</div>
          </div>
          
          <div className="text-center p-4 bg-red-900 rounded-lg">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {performanceData.userExperience?.frustrating.toFixed(1)}%
            </div>
            <div className="text-sm text-red-200">Frustrating</div>
            <div className="text-xs text-red-300 mt-1">Poor experience</div>
          </div>
        </div>
      </div>

      {/* Geographic Performance */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Geographic Performance</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-white mb-4">Top Countries by Users</h5>
            <div className="space-y-3">
              {performanceData.geographicData?.topCountries.map((country, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded">
                  <div>
                    <div className="text-sm font-medium text-white">{country.country}</div>
                    <div className="text-xs text-gray-400">{country.users} users</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{country.avgLoadTime}s</div>
                    <div className="text-xs text-gray-400">avg load time</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-white mb-4">Regional Performance Scores</h5>
            <div className="space-y-3">
              {performanceData.geographicData?.regions.map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{region.region}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${region.performance}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-white w-12">{region.performance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Tracking */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Error Tracking</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">
              {performanceData.errorTracking?.jsErrors}
            </div>
            <div className="text-sm text-gray-400">JS Errors</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-2">
              {performanceData.errorTracking?.networkErrors}
            </div>
            <div className="text-sm text-gray-400">Network Errors</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {performanceData.errorTracking?.totalErrors}
            </div>
            <div className="text-sm text-gray-400">Total Errors</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">
              {performanceData.errorTracking?.errorRate.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-400">Error Rate</div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-white mb-3">Critical Errors</h5>
          <div className="space-y-2">
            {performanceData.errorTracking?.criticalErrors.map((error, index) => (
              <div key={index} className="p-3 bg-red-900 border border-red-700 rounded text-sm text-red-200">
                {error}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Alerts Management
  const renderAlertsManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Performance Alerts</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Configure Alerts
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Mark All Read
          </button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {alerts.filter(a => a.type === 'critical' && !a.resolved).length}
            </div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {alerts.filter(a => a.type === 'error' && !a.resolved).length}
            </div>
            <div className="text-sm text-gray-400">Errors</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {alerts.filter(a => a.type === 'warning' && !a.resolved).length}
            </div>
            <div className="text-sm text-gray-400">Warnings</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {alerts.filter(a => a.type === 'info' && !a.resolved).length}
            </div>
            <div className="text-sm text-gray-400">Info</div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className={`bg-gray-800 border rounded-lg p-6 ${
            alert.type === 'critical' ? 'border-red-600' :
            alert.type === 'error' ? 'border-orange-600' :
            alert.type === 'warning' ? 'border-yellow-600' :
            'border-blue-600'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className={`w-4 h-4 rounded-full ${
                  alert.type === 'critical' ? 'bg-red-500' :
                  alert.type === 'error' ? 'bg-orange-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></span>
                <div>
                  <h4 className="text-lg font-medium text-white">{alert.title}</h4>
                  <p className="text-sm text-gray-400">{alert.message}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alert.type === 'critical' ? 'bg-red-900 text-red-200' :
                  alert.type === 'error' ? 'bg-orange-900 text-orange-200' :
                  alert.type === 'warning' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-blue-900 text-blue-200'
                }`}>
                  {alert.type.toUpperCase()}
                </span>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-400">Metric:</span>
                <span className="text-white ml-2">{alert.metric}</span>
              </div>
              <div>
                <span className="text-sm text-gray-400">Current Value:</span>
                <span className="text-red-400 ml-2">{alert.value}</span>
              </div>
              <div>
                <span className="text-sm text-gray-400">Threshold:</span>
                <span className="text-yellow-400 ml-2">{alert.threshold}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {alert.acknowledged && (
                  <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs">
                    Acknowledged
                  </span>
                )}
                {alert.resolved && (
                  <span className="px-2 py-1 bg-green-900 text-green-200 rounded text-xs">
                    Resolved
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {!alert.acknowledged && (
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    Acknowledge
                  </button>
                )}
                {!alert.resolved && (
                  <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                    Resolve
                  </button>
                )}
                <button className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render User Sessions
  const renderUserSessions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Live User Sessions</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Data
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Refresh
          </button>
        </div>
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {userSessions.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-400">Active Sessions</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {(userSessions.reduce((sum, s) => sum + s.duration, 0) / userSessions.length).toFixed(1)}min
            </div>
            <div className="text-sm text-gray-400">Avg Session Time</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {(userSessions.reduce((sum, s) => sum + s.pageViews, 0) / userSessions.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Avg Pages/Session</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {(userSessions.reduce((sum, s) => sum + s.loadTime, 0) / userSessions.length).toFixed(2)}s
            </div>
            <div className="text-sm text-gray-400">Avg Load Time</div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h4 className="text-lg font-medium text-white">Recent Sessions</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-gray-300">User</th>
                <th className="px-6 py-3 text-left text-gray-300">Duration</th>
                <th className="px-6 py-3 text-left text-gray-300">Pages</th>
                <th className="px-6 py-3 text-left text-gray-300">Country</th>
                <th className="px-6 py-3 text-left text-gray-300">Device</th>
                <th className="px-6 py-3 text-left text-gray-300">Load Time</th>
                <th className="px-6 py-3 text-left text-gray-300">LCP</th>
                <th className="px-6 py-3 text-left text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {userSessions.map(session => (
                <tr key={session.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 text-white">{session.userId}</td>
                  <td className="px-6 py-4 text-gray-300">{session.duration.toFixed(1)}min</td>
                  <td className="px-6 py-4 text-gray-300">{session.pageViews}</td>
                  <td className="px-6 py-4 text-gray-300">{session.country}</td>
                  <td className="px-6 py-4 text-gray-300">{session.device}</td>
                  <td className="px-6 py-4">
                    <span className={`${
                      session.loadTime < 1.5 ? 'text-green-400' :
                      session.loadTime < 2.5 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {session.loadTime.toFixed(2)}s
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`${
                      session.vitals.lcp < 1.5 ? 'text-green-400' :
                      session.vitals.lcp < 2.5 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {session.vitals.lcp.toFixed(2)}s
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      session.status === 'active' 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-gray-900 text-gray-200'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Real-time Performance Monitor</h1>
        <p className="text-gray-400">Live performance tracking, alerts, and user session monitoring</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'realtime', label: 'Real-time Dashboard', icon: '📊' },
          { id: 'alerts', label: 'Alerts Management', icon: '🚨' },
          { id: 'sessions', label: 'User Sessions', icon: '👥' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'realtime' && renderRealTimeDashboard()}
      {activeTab === 'alerts' && renderAlertsManagement()}
      {activeTab === 'sessions' && renderUserSessions()}
    </div>
  );
};