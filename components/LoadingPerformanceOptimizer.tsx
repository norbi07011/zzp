import React, { useState, useEffect } from 'react';
import { 
  DocumentChartBarIcon, 
  CpuChipIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

// Loading Performance Optimizer Component - Task 4.1 Page Speed Optimization
interface LoadingMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  tti: number; // Time to Interactive
  tbt: number; // Total Blocking Time
  si: number;  // Speed Index
}

interface ResourceTiming {
  name: string;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'other';
  size: number;
  duration: number;
  blocked: number;
  dns: number;
  connect: number;
  send: number;
  wait: number;
  receive: number;
  priority: 'high' | 'medium' | 'low';
}

interface OptimizationSuggestion {
  type: 'critical' | 'important' | 'moderate' | 'minor';
  category: 'images' | 'scripts' | 'styles' | 'fonts' | 'network' | 'rendering';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  potentialSavings: string;
  implementation: string[];
}

export const LoadingPerformanceOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<LoadingMetrics | null>(null);
  const [resources, setResources] = useState<ResourceTiming[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [selectedOptimizations, setSelectedOptimizations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'suggestions' | 'optimization'>('overview');

  useEffect(() => {
    // Simulate performance data collection
    const mockMetrics: LoadingMetrics = {
      fcp: 1234,  // ms
      lcp: 2156,  // ms
      fid: 56,    // ms
      cls: 0.085, // score
      tti: 3245,  // ms
      tbt: 234,   // ms
      si: 2876    // score
    };

    const mockResources: ResourceTiming[] = [
      {
        name: '/js/main.bundle.js',
        type: 'script',
        size: 2048,
        duration: 456,
        blocked: 12,
        dns: 23,
        connect: 45,
        send: 2,
        wait: 234,
        receive: 140,
        priority: 'high'
      },
      {
        name: '/css/styles.css',
        type: 'stylesheet',
        size: 512,
        duration: 123,
        blocked: 5,
        dns: 0,
        connect: 0,
        send: 1,
        wait: 67,
        receive: 50,
        priority: 'high'
      },
      {
        name: '/images/hero-bg.jpg',
        type: 'image',
        size: 1536,
        duration: 289,
        blocked: 8,
        dns: 15,
        connect: 20,
        send: 3,
        wait: 156,
        receive: 87,
        priority: 'medium'
      },
      {
        name: '/fonts/Inter-Regular.woff2',
        type: 'font',
        size: 256,
        duration: 167,
        blocked: 3,
        dns: 12,
        connect: 18,
        send: 1,
        wait: 89,
        receive: 44,
        priority: 'high'
      },
      {
        name: '/js/vendor.bundle.js',
        type: 'script',
        size: 1024,
        duration: 334,
        blocked: 15,
        dns: 0,
        connect: 0,
        send: 2,
        wait: 178,
        receive: 139,
        priority: 'medium'
      }
    ];

    const mockSuggestions: OptimizationSuggestion[] = [
      {
        type: 'critical',
        category: 'scripts',
        title: 'Reduce JavaScript Bundle Size',
        description: 'Main bundle is 2MB and blocking page render. Consider code splitting and lazy loading.',
        impact: 'Reduce FCP by ~500ms, LCP by ~800ms',
        effort: 'medium',
        potentialSavings: '1.2MB transfer, 2.1s loading time',
        implementation: [
          'Implement dynamic imports for non-critical components',
          'Split vendor libraries into separate chunks',
          'Use tree shaking to eliminate dead code',
          'Implement route-based code splitting'
        ]
      },
      {
        type: 'critical',
        category: 'images',
        title: 'Optimize Image Loading',
        description: 'Large images are not optimized and lack proper loading strategies.',
        impact: 'Reduce LCP by ~400ms, improve CLS',
        effort: 'low',
        potentialSavings: '800KB transfer, 1.5s loading time',
        implementation: [
          'Convert images to WebP format',
          'Implement responsive images with srcset',
          'Add lazy loading for below-fold images',
          'Use appropriate image dimensions'
        ]
      },
      {
        type: 'important',
        category: 'styles',
        title: 'Eliminate Render-Blocking CSS',
        description: 'CSS is blocking first paint. Critical CSS should be inlined.',
        impact: 'Reduce FCP by ~200ms',
        effort: 'medium',
        potentialSavings: '300ms render delay',
        implementation: [
          'Extract and inline critical CSS',
          'Load non-critical CSS asynchronously',
          'Remove unused CSS rules',
          'Optimize CSS delivery'
        ]
      },
      {
        type: 'important',
        category: 'fonts',
        title: 'Optimize Font Loading',
        description: 'Web fonts are causing layout shifts and blocking text rendering.',
        impact: 'Reduce CLS by 0.03, improve text visibility',
        effort: 'low',
        potentialSavings: '150ms font swap delay',
        implementation: [
          'Use font-display: swap for faster text rendering',
          'Preload critical fonts',
          'Implement font fallback strategies',
          'Optimize font file sizes'
        ]
      },
      {
        type: 'moderate',
        category: 'network',
        title: 'Enable HTTP/2 Push',
        description: 'Critical resources could benefit from server push optimization.',
        impact: 'Reduce resource load time by ~100ms',
        effort: 'medium',
        potentialSavings: '200ms resource discovery time',
        implementation: [
          'Configure HTTP/2 server push for critical resources',
          'Implement resource hints (preconnect, prefetch)',
          'Optimize resource prioritization',
          'Use service workers for caching'
        ]
      },
      {
        type: 'minor',
        category: 'rendering',
        title: 'Reduce DOM Complexity',
        description: 'Page has high DOM complexity which affects rendering performance.',
        impact: 'Improve rendering performance by ~50ms',
        effort: 'high',
        potentialSavings: '100ms rendering time',
        implementation: [
          'Simplify DOM structure',
          'Implement virtual scrolling for long lists',
          'Reduce nested elements',
          'Optimize CSS selectors'
        ]
      }
    ];

    setTimeout(() => {
      setMetrics(mockMetrics);
      setResources(mockResources);
      setSuggestions(mockSuggestions);
    }, 500);
  }, []);

  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    
    // Simulate performance analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock optimization results
    const results = {
      before: metrics,
      after: {
        fcp: metrics ? metrics.fcp * 0.7 : 0,
        lcp: metrics ? metrics.lcp * 0.65 : 0,
        fid: metrics ? metrics.fid * 0.5 : 0,
        cls: metrics ? metrics.cls * 0.4 : 0,
        tti: metrics ? metrics.tti * 0.75 : 0,
        tbt: metrics ? metrics.tbt * 0.6 : 0,
        si: metrics ? metrics.si * 0.8 : 0
      },
      improvements: {
        fcp: 30,
        lcp: 35,
        fid: 50,
        cls: 60,
        tti: 25,
        tbt: 40,
        si: 20
      },
      optimizationsApplied: selectedOptimizations.length || 3,
      estimatedSavings: '2.3MB',
      performanceScore: 94
    };
    
    setOptimizationResults(results);
    setIsAnalyzing(false);
  };

  const getMetricStatus = (metric: string, value: number): { color: string; status: string; grade: string } => {
    switch (metric) {
      case 'fcp':
        if (value < 1800) return { color: 'text-green-600 bg-green-100', status: 'Good', grade: 'A' };
        if (value < 3000) return { color: 'text-yellow-600 bg-yellow-100', status: 'Needs Improvement', grade: 'B' };
        return { color: 'text-red-600 bg-red-100', status: 'Poor', grade: 'F' };
      case 'lcp':
        if (value < 2500) return { color: 'text-green-600 bg-green-100', status: 'Good', grade: 'A' };
        if (value < 4000) return { color: 'text-yellow-600 bg-yellow-100', status: 'Needs Improvement', grade: 'B' };
        return { color: 'text-red-600 bg-red-100', status: 'Poor', grade: 'F' };
      case 'fid':
        if (value < 100) return { color: 'text-green-600 bg-green-100', status: 'Good', grade: 'A' };
        if (value < 300) return { color: 'text-yellow-600 bg-yellow-100', status: 'Needs Improvement', grade: 'B' };
        return { color: 'text-red-600 bg-red-100', status: 'Poor', grade: 'F' };
      case 'cls':
        if (value < 0.1) return { color: 'text-green-600 bg-green-100', status: 'Good', grade: 'A' };
        if (value < 0.25) return { color: 'text-yellow-600 bg-yellow-100', status: 'Needs Improvement', grade: 'B' };
        return { color: 'text-red-600 bg-red-100', status: 'Poor', grade: 'F' };
      case 'tti':
        if (value < 3800) return { color: 'text-green-600 bg-green-100', status: 'Good', grade: 'A' };
        if (value < 7300) return { color: 'text-yellow-600 bg-yellow-100', status: 'Needs Improvement', grade: 'B' };
        return { color: 'text-red-600 bg-red-100', status: 'Poor', grade: 'F' };
      default:
        return { color: 'text-gray-600 bg-gray-100', status: 'Unknown', grade: 'N/A' };
    }
  };

  const getSuggestionColor = (type: string): string => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'important': return 'border-orange-200 bg-orange-50';
      case 'moderate': return 'border-yellow-200 bg-yellow-50';
      case 'minor': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getEffortColor = (effort: string): string => {
    switch (effort) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowTrendingUpIcon className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Loading Performance Optimizer</h2>
            <p className="text-gray-600">Advanced page speed optimization and analysis</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={analyzePerformance}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <WrenchScrewdriverIcon className="w-4 h-4" />
                Optimize Performance
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: 'Performance Overview', icon: DocumentChartBarIcon },
            { id: 'resources', label: 'Resource Analysis', icon: CpuChipIcon },
            { id: 'suggestions', label: 'Optimization Suggestions', icon: ExclamationTriangleIcon },
            { id: 'optimization', label: 'Optimization Results', icon: CheckCircleIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Core Web Vitals */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Core Web Vitals</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-600">First Contentful Paint</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getMetricStatus('fcp', metrics.fcp).color}`}>
                    {getMetricStatus('fcp', metrics.fcp).grade}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.fcp}ms</div>
                <div className={`text-sm px-2 py-1 rounded ${getMetricStatus('fcp', metrics.fcp).color}`}>
                  {getMetricStatus('fcp', metrics.fcp).status}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-green-600">Largest Contentful Paint</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getMetricStatus('lcp', metrics.lcp).color}`}>
                    {getMetricStatus('lcp', metrics.lcp).grade}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.lcp}ms</div>
                <div className={`text-sm px-2 py-1 rounded ${getMetricStatus('lcp', metrics.lcp).color}`}>
                  {getMetricStatus('lcp', metrics.lcp).status}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-purple-600">First Input Delay</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getMetricStatus('fid', metrics.fid).color}`}>
                    {getMetricStatus('fid', metrics.fid).grade}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.fid}ms</div>
                <div className={`text-sm px-2 py-1 rounded ${getMetricStatus('fid', metrics.fid).color}`}>
                  {getMetricStatus('fid', metrics.fid).status}
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-yellow-600">Cumulative Layout Shift</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getMetricStatus('cls', metrics.cls).color}`}>
                    {getMetricStatus('cls', metrics.cls).grade}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.cls.toFixed(3)}</div>
                <div className={`text-sm px-2 py-1 rounded ${getMetricStatus('cls', metrics.cls).color}`}>
                  {getMetricStatus('cls', metrics.cls).status}
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.tti}ms</div>
                <div className="text-sm text-gray-600 mb-2">Time to Interactive</div>
                <div className={`text-xs px-2 py-1 rounded ${getMetricStatus('tti', metrics.tti).color}`}>
                  {getMetricStatus('tti', metrics.tti).grade}
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.tbt}ms</div>
                <div className="text-sm text-gray-600 mb-2">Total Blocking Time</div>
                <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">Score</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.si}</div>
                <div className="text-sm text-gray-600 mb-2">Speed Index</div>
                <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">Index</div>
              </div>
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Overall Performance Score</h3>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-600">76</div>
                <div className="text-sm text-gray-600">out of 100</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Performance</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                  </div>
                  <span className="text-sm font-medium">76</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>FCP Impact</span>
                    <span className="text-yellow-600">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LCP Impact</span>
                    <span className="text-yellow-600">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FID Impact</span>
                    <span className="text-green-600">Low</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>CLS Impact</span>
                    <span className="text-green-600">Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TTI Impact</span>
                    <span className="text-red-600">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TBT Impact</span>
                    <span className="text-yellow-600">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Resource Loading Analysis</h3>
            <p className="text-gray-600 mt-1">Detailed breakdown of resource loading performance</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timing Breakdown
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.map((resource, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        resource.type === 'script' ? 'bg-blue-100 text-blue-800' :
                        resource.type === 'stylesheet' ? 'bg-green-100 text-green-800' :
                        resource.type === 'image' ? 'bg-purple-100 text-purple-800' :
                        resource.type === 'font' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {resource.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatBytes(resource.size * 1024)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {resource.duration}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        resource.priority === 'high' ? 'bg-red-100 text-red-800' :
                        resource.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {resource.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <div className="text-xs text-gray-500">
                          DNS: {resource.dns}ms |
                          Connect: {resource.connect}ms |
                          Wait: {resource.wait}ms |
                          Receive: {resource.receive}ms
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          {suggestions.map((suggestion, index) => (
            <div key={index} className={`rounded-lg border p-6 ${getSuggestionColor(suggestion.type)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${
                    suggestion.type === 'critical' ? 'bg-red-500 text-white' :
                    suggestion.type === 'important' ? 'bg-orange-500 text-white' :
                    suggestion.type === 'moderate' ? 'bg-yellow-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {suggestion.type === 'critical' && <ExclamationTriangleIcon className="w-4 h-4" />}
                    {suggestion.type === 'important' && <ClockIcon className="w-4 h-4" />}
                    {suggestion.type === 'moderate' && <DocumentChartBarIcon className="w-4 h-4" />}
                    {suggestion.type === 'minor' && <CpuChipIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
                    <p className="text-gray-600">{suggestion.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getEffortColor(suggestion.effort)}`}>
                    {suggestion.effort} effort
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedOptimizations.includes(suggestion.title)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOptimizations(prev => [...prev, suggestion.title]);
                      } else {
                        setSelectedOptimizations(prev => prev.filter(title => title !== suggestion.title));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Expected Impact</div>
                  <div className="text-sm text-gray-600">{suggestion.impact}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Potential Savings</div>
                  <div className="text-sm text-gray-600">{suggestion.potentialSavings}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Implementation Steps</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {suggestion.implementation.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Optimization Results Tab */}
      {activeTab === 'optimization' && (
        <div className="space-y-6">
          {optimizationResults ? (
            <>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Optimization Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Before Optimization</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>FCP:</span>
                        <span>{optimizationResults.before.fcp}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LCP:</span>
                        <span>{optimizationResults.before.lcp}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FID:</span>
                        <span>{optimizationResults.before.fid}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CLS:</span>
                        <span>{optimizationResults.before.cls.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">After Optimization</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>FCP:</span>
                        <span className="text-green-600 font-medium">{Math.round(optimizationResults.after.fcp)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LCP:</span>
                        <span className="text-green-600 font-medium">{Math.round(optimizationResults.after.lcp)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FID:</span>
                        <span className="text-green-600 font-medium">{Math.round(optimizationResults.after.fid)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CLS:</span>
                        <span className="text-green-600 font-medium">{optimizationResults.after.cls.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-700 mb-3">Performance Improvements</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(optimizationResults.improvements).map(([metric, improvement]) => (
                      <div key={metric} className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{improvement as number}%</div>
                        <div className="text-sm text-gray-600 uppercase">{metric}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{optimizationResults.optimizationsApplied}</div>
                      <div className="text-sm text-gray-600">Optimizations Applied</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{optimizationResults.estimatedSavings}</div>
                      <div className="text-sm text-gray-600">Data Savings</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{optimizationResults.performanceScore}</div>
                      <div className="text-sm text-gray-600">New Performance Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Run Performance Optimization</h3>
              <p className="text-gray-600 mb-4">
                Select optimization suggestions and run the analyzer to see detailed results.
              </p>
              <button
                onClick={analyzePerformance}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Optimization
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};