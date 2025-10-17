import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  MagnifyingGlassIcon, 
  EyeIcon,
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Search Analytics Interfaces
export interface SearchMetrics {
  totalSearches: number;
  uniqueQueries: number;
  avgResultsPerQuery: number;
  avgSearchTime: number;
  successRate: number; // Percentage of searches with results
  clickThroughRate: number;
}

export interface PopularQuery {
  query: string;
  count: number;
  avgResults: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface SearchTimeDistribution {
  timeRange: string;
  count: number;
  percentage: number;
}

export interface NoResultQuery {
  query: string;
  count: number;
  lastSeen: Date;
  suggestions?: string[];
}

export interface UserSearchBehavior {
  avgQueriesPerSession: number;
  avgQueryLength: number;
  mostCommonFilters: Array<{ filter: string; usage: number }>;
  refinementRate: number; // How often users refine their searches
}

export interface SearchPerformanceData {
  hour: number;
  searches: number;
  avgResponseTime: number;
  successRate: number;
}

// Mock data generator
const generateMockAnalytics = () => {
  const metrics: SearchMetrics = {
    totalSearches: 15634,
    uniqueQueries: 8945,
    avgResultsPerQuery: 23.4,
    avgSearchTime: 145, // milliseconds
    successRate: 94.2,
    clickThroughRate: 67.8
  };

  const popularQueries: PopularQuery[] = [
    { query: 'react performance', count: 234, avgResults: 45, trend: 'up', trendPercentage: 15.3 },
    { query: 'typescript best practices', count: 189, avgResults: 67, trend: 'up', trendPercentage: 8.7 },
    { query: 'css grid layout', count: 156, avgResults: 34, trend: 'stable', trendPercentage: 0 },
    { query: 'javascript async await', count: 134, avgResults: 89, trend: 'down', trendPercentage: -5.2 },
    { query: 'web accessibility', count: 123, avgResults: 23, trend: 'up', trendPercentage: 12.1 },
    { query: 'api design patterns', count: 98, avgResults: 45, trend: 'up', trendPercentage: 9.8 },
    { query: 'database optimization', count: 87, avgResults: 67, trend: 'stable', trendPercentage: 0 },
    { query: 'security vulnerabilities', count: 76, avgResults: 12, trend: 'up', trendPercentage: 18.9 }
  ];

  const timeDistribution: SearchTimeDistribution[] = [
    { timeRange: '0-50ms', count: 4567, percentage: 29.2 },
    { timeRange: '50-100ms', count: 6234, percentage: 39.9 },
    { timeRange: '100-200ms', count: 3456, percentage: 22.1 },
    { timeRange: '200-500ms', count: 1234, percentage: 7.9 },
    { timeRange: '500ms+', count: 143, percentage: 0.9 }
  ];

  const noResultQueries: NoResultQuery[] = [
    { 
      query: 'obscure framework xyz', 
      count: 23, 
      lastSeen: new Date('2024-01-20'),
      suggestions: ['popular framework', 'framework comparison', 'new frameworks 2024']
    },
    { 
      query: 'deprecated api method', 
      count: 18, 
      lastSeen: new Date('2024-01-19'),
      suggestions: ['current api methods', 'api migration guide', 'updated documentation']
    },
    { 
      query: 'typo javascrpt', 
      count: 15, 
      lastSeen: new Date('2024-01-18'),
      suggestions: ['javascript', 'typescript', 'javascript tutorials']
    }
  ];

  const userBehavior: UserSearchBehavior = {
    avgQueriesPerSession: 3.4,
    avgQueryLength: 12.8,
    mostCommonFilters: [
      { filter: 'date', usage: 45.2 },
      { filter: 'category', usage: 38.7 },
      { filter: 'difficulty', usage: 23.1 },
      { filter: 'language', usage: 19.8 }
    ],
    refinementRate: 32.1
  };

  const performanceData: SearchPerformanceData[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    searches: Math.floor(Math.random() * 200) + 50,
    avgResponseTime: Math.floor(Math.random() * 100) + 80,
    successRate: Math.random() * 10 + 90
  }));

  return {
    metrics,
    popularQueries,
    timeDistribution,
    noResultQueries,
    userBehavior,
    performanceData
  };
};

export const SearchAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<ReturnType<typeof generateMockAnalytics> | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'performance' | 'behavior'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setAnalyticsData(generateMockAnalytics());
      setLoading(false);
    }, 1000);
  }, [selectedTimeRange]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({length: 4}).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const { metrics, popularQueries, timeDistribution, noResultQueries, userBehavior, performanceData } = analyticsData;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6" />
          Search Analytics
        </h2>
        <div className="flex gap-2">
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedTimeRange === range
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'queries', label: 'Popular Queries' },
          { key: 'performance', label: 'Performance' },
          { key: 'behavior', label: 'User Behavior' }
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-blue-800">Total Searches</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatNumber(metrics.totalSearches)}
                  </div>
                </div>
                <MagnifyingGlassIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-green-800">Success Rate</div>
                  <div className="text-2xl font-bold text-green-900">
                    {metrics.successRate}%
                  </div>
                </div>
                <TrophyIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-purple-800">Avg Response</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {metrics.avgSearchTime}ms
                  </div>
                </div>
                <ClockIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Unique Queries</div>
              <div className="text-xl font-bold text-gray-900">{formatNumber(metrics.uniqueQueries)}</div>
              <div className="text-xs text-gray-500">Different search terms</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Avg Results</div>
              <div className="text-xl font-bold text-gray-900">{metrics.avgResultsPerQuery}</div>
              <div className="text-xs text-gray-500">Per search query</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Click Rate</div>
              <div className="text-xl font-bold text-gray-900">{metrics.clickThroughRate}%</div>
              <div className="text-xs text-gray-500">Users clicking results</div>
            </div>
          </div>

          {/* Response Time Distribution */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Response Time Distribution</h3>
            <div className="space-y-2">
              {timeDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium">{item.timeRange}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-16 text-right">
                    {item.percentage}%
                  </div>
                  <div className="text-sm text-gray-500 w-20 text-right">
                    ({formatNumber(item.count)})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Queries Tab */}
      {activeTab === 'queries' && (
        <div className="space-y-6">
          {/* Popular Queries */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Most Popular Queries</h3>
            <div className="space-y-3">
              {popularQueries.map((query, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{query.query}</div>
                      <div className="text-sm text-gray-500">
                        {formatNumber(query.count)} searches • {query.avgResults} avg results
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(query.trend)}
                    {query.trend !== 'stable' && (
                      <span className={`text-sm font-medium ${
                        query.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {query.trend === 'up' ? '+' : ''}{query.trendPercentage}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* No Results Queries */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
              Queries with No Results
            </h3>
            <div className="space-y-3">
              {noResultQueries.map((query, index) => (
                <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">"{query.query}"</div>
                    <div className="text-sm text-gray-500">
                      {query.count} attempts • Last: {query.lastSeen.toLocaleDateString()}
                    </div>
                  </div>
                  {query.suggestions && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Suggestions:</span> {query.suggestions.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Hourly Performance Chart */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Search Volume by Hour</h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {performanceData.map((data, index) => {
                const maxSearches = Math.max(...performanceData.map(d => d.searches));
                const height = (data.searches / maxSearches) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${data.hour}:00 - ${data.searches} searches`}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {data.hour}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Average Response Time by Hour</h4>
              <div className="space-y-2">
                {performanceData.slice(0, 8).map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{data.hour}:00</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(data.avgResponseTime / 200) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{data.avgResponseTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Success Rate Trends</h4>
              <div className="space-y-2">
                {performanceData.slice(0, 8).map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{data.hour}:00</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${data.successRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{data.successRate.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Behavior Tab */}
      {activeTab === 'behavior' && (
        <div className="space-y-6">
          {/* User Behavior Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-4">Search Behavior</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg queries per session</span>
                  <span className="font-medium">{userBehavior.avgQueriesPerSession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg query length</span>
                  <span className="font-medium">{userBehavior.avgQueryLength} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Refinement rate</span>
                  <span className="font-medium">{userBehavior.refinementRate}%</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <FunnelIcon className="w-5 h-5" />
                Most Used Filters
              </h4>
              <div className="space-y-3">
                {userBehavior.mostCommonFilters.map((filter, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{filter.filter}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${filter.usage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{filter.usage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAnalyticsDashboard;