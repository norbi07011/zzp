import React, { useState, useEffect } from 'react';

// Performance Optimization Manager - Advanced Caching, CDN, and Performance Monitoring
export const PerformanceOptimizationManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({});
  const [cacheConfig, setCacheConfig] = useState<CacheConfiguration>({});
  const [cdnConfig, setCdnConfig] = useState<CDNConfiguration>({ enabled: false });
  const [optimizationTasks, setOptimizationTasks] = useState<OptimizationTask[]>([]);

  // Performance Metrics Interface
  interface PerformanceMetrics {
    coreWebVitals?: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
      fcp: number; // First Contentful Paint
      ttfb: number; // Time to First Byte
    };
    bundleAnalysis?: {
      totalSize: number;
      mainChunkSize: number;
      vendorChunkSize: number;
      assetsCount: number;
      compressionRatio: number;
    };
    cachePerformance?: {
      hitRate: number;
      missRate: number;
      avgResponseTime: number;
      totalRequests: number;
      cacheSize: number;
    };
    cdnMetrics?: {
      bandwidth: number;
      requestCount: number;
      cacheHitRatio: number;
      avgLatency: number;
      dataTransferred: number;
    };
    lighthouse?: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
      pwa: number;
    };
  }

  // Cache Configuration Interface
  interface CacheConfiguration {
    redis?: {
      enabled: boolean;
      host: string;
      port: number;
      ttl: number;
      maxMemory: string;
      evictionPolicy: 'allkeys-lru' | 'allkeys-lfu' | 'volatile-lru' | 'volatile-lfu';
      keyspaceNotifications: boolean;
    };
    browserCache?: {
      enabled: boolean;
      staticAssets: number; // seconds
      apiResponses: number; // seconds
      images: number; // seconds
      fonts: number; // seconds
    };
    serviceWorker?: {
      enabled: boolean;
      cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
      maxAge: number;
      maxEntries: number;
    };
    memoryCache?: {
      enabled: boolean;
      maxSize: number; // MB
      algorithm: 'lru' | 'lfu' | 'fifo';
      ttl: number;
    };
  }

  // CDN Configuration Interface
  interface CDNConfiguration {
    provider?: 'cloudflare' | 'aws-cloudfront' | 'azure-cdn' | 'google-cloud-cdn';
    enabled: boolean;
    endpoints?: {
      static: string;
      api: string;
      images: string;
      videos: string;
    };
    caching?: {
      staticTtl: number;
      dynamicTtl: number;
      browserTtl: number;
    };
    compression?: {
      enabled: boolean;
      level: number;
      types: string[];
    };
    minification?: {
      html: boolean;
      css: boolean;
      js: boolean;
    };
  }

  // Optimization Task Interface
  interface OptimizationTask {
    id: string;
    name: string;
    category: 'bundle' | 'cache' | 'cdn' | 'images' | 'code' | 'monitoring';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    estimatedGain: string;
    startedAt?: string;
    completedAt?: string;
    results?: {
      before: number;
      after: number;
      improvement: number;
    };
  }

  // Initialize mock data
  useEffect(() => {
    // Mock performance metrics
    const mockMetrics: PerformanceMetrics = {
      coreWebVitals: {
        lcp: 1.2, // Good: < 2.5s
        fid: 45,  // Good: < 100ms
        cls: 0.08, // Good: < 0.1
        fcp: 0.9,  // Good: < 1.8s
        ttfb: 180  // Good: < 200ms
      },
      bundleAnalysis: {
        totalSize: 2.1, // MB
        mainChunkSize: 451.67, // KB
        vendorChunkSize: 146.09, // KB
        assetsCount: 67,
        compressionRatio: 3.2
      },
      cachePerformance: {
        hitRate: 87.5,
        missRate: 12.5,
        avgResponseTime: 45,
        totalRequests: 15420,
        cacheSize: 512 // MB
      },
      cdnMetrics: {
        bandwidth: 125.6, // GB/day
        requestCount: 89500,
        cacheHitRatio: 92.3,
        avgLatency: 28, // ms
        dataTransferred: 45.2 // GB today
      },
      lighthouse: {
        performance: 95,
        accessibility: 98,
        bestPractices: 92,
        seo: 100,
        pwa: 89
      }
    };

    // Mock cache configuration
    const mockCacheConfig: CacheConfiguration = {
      redis: {
        enabled: true,
        host: 'redis-cluster.platform.com',
        port: 6379,
        ttl: 3600,
        maxMemory: '2gb',
        evictionPolicy: 'allkeys-lru',
        keyspaceNotifications: true
      },
      browserCache: {
        enabled: true,
        staticAssets: 31536000, // 1 year
        apiResponses: 300, // 5 minutes
        images: 2592000, // 30 days
        fonts: 31536000 // 1 year
      },
      serviceWorker: {
        enabled: true,
        cacheStrategy: 'stale-while-revalidate',
        maxAge: 86400, // 24 hours
        maxEntries: 50
      },
      memoryCache: {
        enabled: true,
        maxSize: 256, // MB
        algorithm: 'lru',
        ttl: 900 // 15 minutes
      }
    };

    // Mock CDN configuration
    const mockCdnConfig: CDNConfiguration = {
      provider: 'cloudflare',
      enabled: true,
      endpoints: {
        static: 'https://static.platform.com',
        api: 'https://api.platform.com',
        images: 'https://images.platform.com',
        videos: 'https://videos.platform.com'
      },
      caching: {
        staticTtl: 31536000, // 1 year
        dynamicTtl: 300, // 5 minutes
        browserTtl: 86400 // 24 hours
      },
      compression: {
        enabled: true,
        level: 6,
        types: ['text/html', 'text/css', 'application/javascript', 'application/json']
      },
      minification: {
        html: true,
        css: true,
        js: true
      }
    };

    // Mock optimization tasks
    const mockTasks: OptimizationTask[] = [
      {
        id: '1',
        name: 'Tree Shaking Optimization',
        category: 'code',
        status: 'completed',
        priority: 'high',
        description: 'Remove unused code and optimize bundle size',
        impact: 'Bundle size reduction',
        estimatedGain: '-25% bundle size',
        startedAt: '2025-01-08T10:00:00Z',
        completedAt: '2025-01-08T12:30:00Z',
        results: { before: 2.8, after: 2.1, improvement: 25 }
      },
      {
        id: '2',
        name: 'Redis Cache Implementation',
        category: 'cache',
        status: 'in_progress',
        priority: 'critical',
        description: 'Implement Redis for API response caching',
        impact: 'API response time',
        estimatedGain: '-60% response time',
        startedAt: '2025-01-08T13:00:00Z'
      },
      {
        id: '3',
        name: 'CDN Image Optimization',
        category: 'images',
        status: 'pending',
        priority: 'medium',
        description: 'Optimize and compress images via CDN',
        impact: 'Page load time',
        estimatedGain: '-40% image load time'
      },
      {
        id: '4',
        name: 'Critical CSS Extraction',
        category: 'code',
        status: 'completed',
        priority: 'high',
        description: 'Extract and inline critical CSS',
        impact: 'First Contentful Paint',
        estimatedGain: '-300ms FCP',
        startedAt: '2025-01-08T09:00:00Z',
        completedAt: '2025-01-08T11:15:00Z',
        results: { before: 1.2, after: 0.9, improvement: 25 }
      },
      {
        id: '5',
        name: 'Service Worker Cache Strategy',
        category: 'cache',
        status: 'completed',
        priority: 'medium',
        description: 'Implement stale-while-revalidate strategy',
        impact: 'Repeat visit performance',
        estimatedGain: '+40% cache hit rate',
        startedAt: '2025-01-08T08:00:00Z',
        completedAt: '2025-01-08T10:45:00Z',
        results: { before: 62, after: 87, improvement: 40 }
      },
      {
        id: '6',
        name: 'Real-time Performance Monitoring',
        category: 'monitoring',
        status: 'in_progress',
        priority: 'high',
        description: 'Setup real-time performance tracking',
        impact: 'Performance visibility',
        estimatedGain: '100% monitoring coverage',
        startedAt: '2025-01-08T14:00:00Z'
      }
    ];

    setPerformanceMetrics(mockMetrics);
    setCacheConfig(mockCacheConfig);
    setCdnConfig(mockCdnConfig);
    setOptimizationTasks(mockTasks);
  }, []);

  // Render Performance Overview
  const renderPerformanceOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Performance Overview</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Run Lighthouse Audit
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Core Web Vitals</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {performanceMetrics.coreWebVitals?.lcp}s
            </div>
            <div className="text-sm text-gray-400 mb-1">Largest Contentful Paint</div>
            <div className="text-xs text-green-400">Good (&lt; 2.5s)</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {performanceMetrics.coreWebVitals?.fid}ms
            </div>
            <div className="text-sm text-gray-400 mb-1">First Input Delay</div>
            <div className="text-xs text-green-400">Good (&lt; 100ms)</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {performanceMetrics.coreWebVitals?.cls}
            </div>
            <div className="text-sm text-gray-400 mb-1">Cumulative Layout Shift</div>
            <div className="text-xs text-green-400">Good (&lt; 0.1)</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {performanceMetrics.coreWebVitals?.fcp}s
            </div>
            <div className="text-sm text-gray-400 mb-1">First Contentful Paint</div>
            <div className="text-xs text-green-400">Good (&lt; 1.8s)</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {performanceMetrics.coreWebVitals?.ttfb}ms
            </div>
            <div className="text-sm text-gray-400 mb-1">Time to First Byte</div>
            <div className="text-xs text-green-400">Good (&lt; 200ms)</div>
          </div>
        </div>
      </div>

      {/* Lighthouse Scores */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Lighthouse Scores</h4>
        
        <div className="space-y-4">
          {[
            { name: 'Performance', score: performanceMetrics.lighthouse?.performance || 0, color: 'green' },
            { name: 'Accessibility', score: performanceMetrics.lighthouse?.accessibility || 0, color: 'green' },
            { name: 'Best Practices', score: performanceMetrics.lighthouse?.bestPractices || 0, color: 'green' },
            { name: 'SEO', score: performanceMetrics.lighthouse?.seo || 0, color: 'green' },
            { name: 'PWA', score: performanceMetrics.lighthouse?.pwa || 0, color: 'yellow' }
          ].map(metric => (
            <div key={metric.name} className="flex items-center space-x-4">
              <div className="w-24 text-sm text-gray-300">{metric.name}</div>
              <div className="flex-1 bg-gray-700 rounded-full h-3">
                <div 
                  className={`bg-${metric.color}-600 h-3 rounded-full`} 
                  style={{ width: `${metric.score}%` }}
                ></div>
              </div>
              <div className="w-16 text-sm text-white text-right">{metric.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bundle Analysis */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Bundle Analysis</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <div className="text-xl font-bold text-blue-400">
              {performanceMetrics.bundleAnalysis?.totalSize}MB
            </div>
            <div className="text-xs text-gray-400">Total Bundle Size</div>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <div className="text-xl font-bold text-green-400">
              {performanceMetrics.bundleAnalysis?.mainChunkSize}KB
            </div>
            <div className="text-xs text-gray-400">Main Chunk</div>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <div className="text-xl font-bold text-yellow-400">
              {performanceMetrics.bundleAnalysis?.vendorChunkSize}KB
            </div>
            <div className="text-xs text-gray-400">Vendor Chunk</div>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <div className="text-xl font-bold text-purple-400">
              {performanceMetrics.bundleAnalysis?.assetsCount}
            </div>
            <div className="text-xs text-gray-400">Total Assets</div>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <div className="text-xl font-bold text-cyan-400">
              {performanceMetrics.bundleAnalysis?.compressionRatio}x
            </div>
            <div className="text-xs text-gray-400">Compression Ratio</div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Performance Trends</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">Load Time Trend</h5>
            <div className="text-2xl font-bold text-green-400 mb-1">-28%</div>
            <div className="text-xs text-gray-400">vs last month</div>
            <div className="text-xs text-green-400">↓ 0.4s improvement</div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">Bundle Size Trend</h5>
            <div className="text-2xl font-bold text-green-400 mb-1">-25%</div>
            <div className="text-xs text-gray-400">vs last week</div>
            <div className="text-xs text-green-400">↓ 0.7MB reduction</div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">Cache Hit Rate</h5>
            <div className="text-2xl font-bold text-green-400 mb-1">+40%</div>
            <div className="text-xs text-gray-400">vs last week</div>
            <div className="text-xs text-green-400">↑ Better caching</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Quick Performance Actions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Analyze Bundle', description: 'Run webpack bundle analyzer', icon: '📊', color: 'blue' },
            { title: 'Clear Cache', description: 'Clear all application caches', icon: '🗑️', color: 'red' },
            { title: 'Optimize Images', description: 'Compress and optimize images', icon: '🖼️', color: 'green' },
            { title: 'Minify Assets', description: 'Minify CSS and JavaScript', icon: '⚡', color: 'yellow' },
            { title: 'Test Performance', description: 'Run comprehensive performance test', icon: '🧪', color: 'purple' },
            { title: 'Update CDN', description: 'Refresh CDN configuration', icon: '🌐', color: 'cyan' }
          ].map((action, index) => (
            <button
              key={index}
              className={`p-4 bg-gray-900 border border-gray-700 rounded-lg hover:border-${action.color}-500 transition-colors text-left`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{action.icon}</span>
                <h5 className="text-sm font-medium text-white">{action.title}</h5>
              </div>
              <p className="text-xs text-gray-400">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Cache Management
  const renderCacheManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Cache Management</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Test Cache
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Apply Config
          </button>
        </div>
      </div>

      {/* Cache Performance Metrics */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Cache Performance</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {performanceMetrics.cachePerformance?.hitRate}%
            </div>
            <div className="text-sm text-gray-400">Cache Hit Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {performanceMetrics.cachePerformance?.missRate}%
            </div>
            <div className="text-sm text-gray-400">Cache Miss Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {performanceMetrics.cachePerformance?.avgResponseTime}ms
            </div>
            <div className="text-sm text-gray-400">Avg Response Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {performanceMetrics.cachePerformance?.totalRequests.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Requests</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {performanceMetrics.cachePerformance?.cacheSize}MB
            </div>
            <div className="text-sm text-gray-400">Cache Size</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">Cache Hit Rate Trend</h5>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${performanceMetrics.cachePerformance?.hitRate}%` }}
              ></div>
            </div>
            <div className="text-xs text-green-400">+25% improvement this week</div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">Response Time</h5>
            <div className="text-lg font-bold text-blue-400 mb-1">45ms</div>
            <div className="text-xs text-gray-400">Average</div>
            <div className="text-xs text-green-400">-60% vs no cache</div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">Memory Usage</h5>
            <div className="text-lg font-bold text-purple-400 mb-1">512MB</div>
            <div className="text-xs text-gray-400">of 2GB limit</div>
            <div className="text-xs text-yellow-400">25% utilization</div>
          </div>
        </div>
      </div>

      {/* Redis Configuration */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-medium text-white flex items-center">
            ⚡ Redis Cache Configuration
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              cacheConfig.redis?.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              {cacheConfig.redis?.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </h4>
          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Test Connection
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Redis Host</label>
            <input 
              type="text" 
              value={cacheConfig.redis?.host || ''}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Port</label>
            <input 
              type="number" 
              value={cacheConfig.redis?.port || 6379}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">TTL (seconds)</label>
            <input 
              type="number" 
              value={cacheConfig.redis?.ttl || 3600}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Memory</label>
            <input 
              type="text" 
              value={cacheConfig.redis?.maxMemory || '2gb'}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Eviction Policy</label>
            <select 
              value={cacheConfig.redis?.evictionPolicy || 'allkeys-lru'}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            >
              <option value="allkeys-lru">allkeys-lru</option>
              <option value="allkeys-lfu">allkeys-lfu</option>
              <option value="volatile-lru">volatile-lru</option>
              <option value="volatile-lfu">volatile-lfu</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={cacheConfig.redis?.keyspaceNotifications || false}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Enable keyspace notifications</label>
          </div>
        </div>
      </div>

      {/* Browser Cache Settings */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Browser Cache Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Static Assets (seconds)</label>
            <input 
              type="number" 
              value={cacheConfig.browserCache?.staticAssets || 31536000}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">Default: 1 year (31536000)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">API Responses (seconds)</label>
            <input 
              type="number" 
              value={cacheConfig.browserCache?.apiResponses || 300}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">Default: 5 minutes (300)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Images (seconds)</label>
            <input 
              type="number" 
              value={cacheConfig.browserCache?.images || 2592000}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">Default: 30 days (2592000)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fonts (seconds)</label>
            <input 
              type="number" 
              value={cacheConfig.browserCache?.fonts || 31536000}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">Default: 1 year (31536000)</p>
          </div>
        </div>
      </div>

      {/* Service Worker Cache */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6 flex items-center">
          🔄 Service Worker Cache
          <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
            cacheConfig.serviceWorker?.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
          }`}>
            {cacheConfig.serviceWorker?.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cache Strategy</label>
            <select 
              value={cacheConfig.serviceWorker?.cacheStrategy || 'stale-while-revalidate'}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            >
              <option value="cache-first">Cache First</option>
              <option value="network-first">Network First</option>
              <option value="stale-while-revalidate">Stale While Revalidate</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Age (seconds)</label>
            <input 
              type="number" 
              value={cacheConfig.serviceWorker?.maxAge || 86400}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Entries</label>
            <input 
              type="number" 
              value={cacheConfig.serviceWorker?.maxEntries || 50}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render CDN Configuration
  const renderCDNConfiguration = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">CDN Configuration</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Test CDN
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Deploy Config
          </button>
        </div>
      </div>

      {/* CDN Performance Metrics */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">CDN Performance</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {performanceMetrics.cdnMetrics?.bandwidth}GB
            </div>
            <div className="text-sm text-gray-400">Daily Bandwidth</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {performanceMetrics.cdnMetrics?.requestCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Requests Today</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {performanceMetrics.cdnMetrics?.cacheHitRatio}%
            </div>
            <div className="text-sm text-gray-400">Cache Hit Ratio</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {performanceMetrics.cdnMetrics?.avgLatency}ms
            </div>
            <div className="text-sm text-gray-400">Avg Latency</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {performanceMetrics.cdnMetrics?.dataTransferred}GB
            </div>
            <div className="text-sm text-gray-400">Data Transferred</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">Global Coverage</h5>
            <div className="text-lg font-bold text-green-400 mb-1">200+</div>
            <div className="text-xs text-gray-400">Edge locations</div>
            <div className="text-xs text-green-400">99.9% uptime</div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">Performance Gain</h5>
            <div className="text-lg font-bold text-blue-400 mb-1">-65%</div>
            <div className="text-xs text-gray-400">Load time reduction</div>
            <div className="text-xs text-green-400">vs origin server</div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-3">Bandwidth Savings</h5>
            <div className="text-lg font-bold text-purple-400 mb-1">78%</div>
            <div className="text-xs text-gray-400">Origin bandwidth saved</div>
            <div className="text-xs text-green-400">€2,400/month saved</div>
          </div>
        </div>
      </div>

      {/* CDN Provider Configuration */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-medium text-white flex items-center">
            🌐 CDN Provider
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              cdnConfig.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              {cdnConfig.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </h4>
          <div className="text-sm text-gray-300">
            Provider: {cdnConfig.provider?.toUpperCase()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
            <select 
              value={cdnConfig.provider || 'cloudflare'}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            >
              <option value="cloudflare">Cloudflare</option>
              <option value="aws-cloudfront">AWS CloudFront</option>
              <option value="azure-cdn">Azure CDN</option>
              <option value="google-cloud-cdn">Google Cloud CDN</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={cdnConfig.enabled || false}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Enable CDN</label>
          </div>
        </div>
      </div>

      {/* CDN Endpoints */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">CDN Endpoints</h4>
        
        <div className="space-y-4">
          {Object.entries(cdnConfig.endpoints || {}).map(([type, url]) => (
            <div key={type} className="flex items-center space-x-4">
              <div className="w-24 text-sm text-gray-300 capitalize">{type}:</div>
              <input 
                type="text" 
                value={url}
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                readOnly
              />
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Test
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Caching Rules */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Caching Rules</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Static Assets TTL</label>
            <input 
              type="number" 
              value={cdnConfig.caching?.staticTtl || 31536000}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">1 year (31536000 seconds)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Dynamic Content TTL</label>
            <input 
              type="number" 
              value={cdnConfig.caching?.dynamicTtl || 300}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">5 minutes (300 seconds)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Browser Cache TTL</label>
            <input 
              type="number" 
              value={cdnConfig.caching?.browserTtl || 86400}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
            <p className="text-xs text-gray-400 mt-1">24 hours (86400 seconds)</p>
          </div>
        </div>
      </div>

      {/* Compression & Minification */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Compression & Minification</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-white mb-4">Compression Settings</h5>
            <div className="space-y-3">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={cdnConfig.compression?.enabled || false}
                  className="mr-2"
                />
                <label className="text-sm text-gray-300">Enable Gzip/Brotli compression</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Compression Level</label>
                <input 
                  type="range" 
                  min="1" 
                  max="9" 
                  value={cdnConfig.compression?.level || 6}
                  className="w-full"
                />
                <div className="text-xs text-gray-400">Level: {cdnConfig.compression?.level || 6}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-white mb-4">Minification</h5>
            <div className="space-y-3">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={cdnConfig.minification?.html || false}
                  className="mr-2"
                />
                <label className="text-sm text-gray-300">Minify HTML</label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={cdnConfig.minification?.css || false}
                  className="mr-2"
                />
                <label className="text-sm text-gray-300">Minify CSS</label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={cdnConfig.minification?.js || false}
                  className="mr-2"
                />
                <label className="text-sm text-gray-300">Minify JavaScript</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Optimization Tasks
  const renderOptimizationTasks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Optimization Tasks</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Run All Tasks
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Create Task
          </button>
        </div>
      </div>

      {/* Task Progress Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Task Progress Overview</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {optimizationTasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {optimizationTasks.filter(t => t.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-400">In Progress</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {optimizationTasks.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {optimizationTasks.filter(t => t.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-400">Failed</div>
          </div>
        </div>

        <div className="space-y-2">
          {['bundle', 'cache', 'cdn', 'images', 'code', 'monitoring'].map(category => {
            const categoryTasks = optimizationTasks.filter(t => t.category === category);
            const completedTasks = categoryTasks.filter(t => t.status === 'completed').length;
            const totalTasks = categoryTasks.length;
            const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            return (
              <div key={category} className="flex items-center space-x-4">
                <div className="w-24 text-sm text-gray-300 capitalize">{category}</div>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm text-gray-300 text-right">
                  {completedTasks}/{totalTasks}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimization Tasks List */}
      <div className="space-y-4">
        {optimizationTasks.map(task => (
          <div key={task.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className={`w-4 h-4 rounded-full ${
                  task.status === 'completed' ? 'bg-green-500' :
                  task.status === 'in_progress' ? 'bg-yellow-500' :
                  task.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></span>
                <div>
                  <h4 className="text-lg font-medium text-white">{task.name}</h4>
                  <p className="text-sm text-gray-400">{task.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'critical' ? 'bg-red-900 text-red-200' :
                  task.priority === 'high' ? 'bg-orange-900 text-orange-200' :
                  task.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-blue-900 text-blue-200'
                }`}>
                  {task.priority.toUpperCase()}
                </span>
                <div className="text-xs text-gray-400 mt-1">
                  {task.category}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-400">Impact:</span>
                <span className="text-white ml-2">{task.impact}</span>
              </div>
              <div>
                <span className="text-sm text-gray-400">Estimated Gain:</span>
                <span className="text-green-400 ml-2">{task.estimatedGain}</span>
              </div>
              <div>
                <span className="text-sm text-gray-400">Status:</span>
                <span className="text-white ml-2 capitalize">{task.status.replace('_', ' ')}</span>
              </div>
            </div>

            {task.results && (
              <div className="p-3 bg-gray-900 rounded-lg mb-4">
                <h5 className="text-sm font-medium text-white mb-2">Results:</h5>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-red-400">{task.results.before}</div>
                    <div className="text-xs text-gray-400">Before</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">{task.results.after}</div>
                    <div className="text-xs text-gray-400">After</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-400">+{task.results.improvement}%</div>
                    <div className="text-xs text-gray-400">Improvement</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {task.startedAt && (
                  <span>Started: {new Date(task.startedAt).toLocaleString()}</span>
                )}
                {task.completedAt && (
                  <span className="ml-4">Completed: {new Date(task.completedAt).toLocaleString()}</span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {task.status === 'pending' && (
                  <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                    Start Task
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
                    Monitor
                  </button>
                )}
                {task.status === 'failed' && (
                  <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                    Retry
                  </button>
                )}
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Performance Optimization Manager</h1>
        <p className="text-gray-400">Advanced caching, CDN configuration, and performance monitoring</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Performance Overview', icon: '📊' },
          { id: 'cache', label: 'Cache Management', icon: '⚡' },
          { id: 'cdn', label: 'CDN Configuration', icon: '🌐' },
          { id: 'tasks', label: 'Optimization Tasks', icon: '🎯' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === tab.id
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
      {activeSection === 'overview' && renderPerformanceOverview()}
      {activeSection === 'cache' && renderCacheManagement()}
      {activeSection === 'cdn' && renderCDNConfiguration()}
      {activeSection === 'tasks' && renderOptimizationTasks()}
    </div>
  );
};