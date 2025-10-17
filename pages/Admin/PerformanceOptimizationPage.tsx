import React, { useState } from 'react';
import { PerformanceOptimizationManager } from '../../components/PerformanceOptimizationManager';
import { RealTimePerformanceMonitor } from '../../components/RealTimePerformanceMonitor';
import { CodeOptimizationManager } from '../../components/CodeOptimizationManager';

export const PerformanceOptimizationPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState('overview');

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Performance Optimization Center
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Advanced performance monitoring, caching optimization, CDN configuration, 
          and code optimization for enterprise-grade applications
        </p>
      </div>

      {/* Performance Score Card */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Overall Performance Score</h2>
          <div className="text-6xl font-bold text-green-400 mb-4">92</div>
          <div className="text-lg text-green-300 mb-6">Excellent Performance</div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">1.2s</div>
              <div className="text-sm text-gray-300">Load Time</div>
              <div className="text-xs text-green-400">-28% vs last month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">95</div>
              <div className="text-sm text-gray-300">Lighthouse Score</div>
              <div className="text-xs text-green-400">+5 points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">87%</div>
              <div className="text-sm text-gray-300">Cache Hit Rate</div>
              <div className="text-xs text-green-400">+15% improvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">2.1MB</div>
              <div className="text-sm text-gray-300">Bundle Size</div>
              <div className="text-xs text-green-400">-25% optimized</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveModule('cache')}
          className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">⚡</div>
            <div>
              <h3 className="text-lg font-semibold text-white">Cache Management</h3>
              <p className="text-sm text-gray-400">Redis, CDN, and browser caching</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Hit Rate</span>
              <span className="text-sm text-green-400">87.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Response Time</span>
              <span className="text-sm text-blue-400">45ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Cache Size</span>
              <span className="text-sm text-purple-400">512MB</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveModule('realtime')}
          className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">📊</div>
            <div>
              <h3 className="text-lg font-semibold text-white">Real-time Monitoring</h3>
              <p className="text-sm text-gray-400">Live performance tracking</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Active Users</span>
              <span className="text-sm text-green-400">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Page Views</span>
              <span className="text-sm text-blue-400">5,832</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Avg Load Time</span>
              <span className="text-sm text-yellow-400">1.42s</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveModule('code')}
          className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">🔧</div>
            <div>
              <h3 className="text-lg font-semibold text-white">Code Optimization</h3>
              <p className="text-sm text-gray-400">Bundle analysis & tree shaking</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Bundle Size</span>
              <span className="text-sm text-blue-400">2.1MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Unused Code</span>
              <span className="text-sm text-red-400">12.4KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Duplicates</span>
              <span className="text-sm text-yellow-400">19.1KB</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveModule('cdn')}
          className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-cyan-500 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">🌐</div>
            <div>
              <h3 className="text-lg font-semibold text-white">CDN Performance</h3>
              <p className="text-sm text-gray-400">Global content delivery</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Cache Hit Ratio</span>
              <span className="text-sm text-green-400">92.3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Avg Latency</span>
              <span className="text-sm text-blue-400">28ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Bandwidth</span>
              <span className="text-sm text-purple-400">125.6GB</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">🚨</div>
            <div>
              <h3 className="text-lg font-semibold text-white">Performance Alerts</h3>
              <p className="text-sm text-gray-400">Real-time notifications</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Critical</span>
              <span className="text-sm text-red-400">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Warnings</span>
              <span className="text-sm text-yellow-400">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Info</span>
              <span className="text-sm text-blue-400">2</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">📈</div>
            <div>
              <h3 className="text-lg font-semibold text-white">Optimization Tasks</h3>
              <p className="text-sm text-gray-400">Available improvements</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Completed</span>
              <span className="text-sm text-green-400">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">In Progress</span>
              <span className="text-sm text-yellow-400">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Available</span>
              <span className="text-sm text-blue-400">4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Performance Trends</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Last 7 Days</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Load Time</span>
                <span className="text-green-400">-12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cache Performance</span>
                <span className="text-green-400">+8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bundle Size</span>
                <span className="text-green-400">-5%</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Last 30 Days</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Lighthouse Score</span>
                <span className="text-green-400">+15 points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error Rate</span>
                <span className="text-green-400">-45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User Experience</span>
                <span className="text-green-400">+22%</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">This Quarter</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Core Web Vitals</span>
                <span className="text-green-400">All Good</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Performance Budget</span>
                <span className="text-green-400">Within Limits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Optimization Goal</span>
                <span className="text-green-400">95% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Performance Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-blue-900 border border-blue-700 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-200 mb-3">
              🚀 High Impact Optimizations
            </h3>
            <ul className="space-y-2 text-blue-100">
              <li>• Implement service worker caching</li>
              <li>• Enable Brotli compression</li>
              <li>• Optimize critical CSS delivery</li>
              <li>• Add resource hints (preload/prefetch)</li>
            </ul>
          </div>
          
          <div className="p-6 bg-green-900 border border-green-700 rounded-lg">
            <h3 className="text-lg font-semibold text-green-200 mb-3">
              ⚡ Quick Wins
            </h3>
            <ul className="space-y-2 text-green-100">
              <li>• Remove unused CSS and JavaScript</li>
              <li>• Optimize image formats (WebP)</li>
              <li>• Enable HTTP/2 push</li>
              <li>• Minify HTML and inline CSS</li>
            </ul>
          </div>
          
          <div className="p-6 bg-purple-900 border border-purple-700 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-200 mb-3">
              🔧 Code Improvements
            </h3>
            <ul className="space-y-2 text-purple-100">
              <li>• Implement code splitting</li>
              <li>• Tree shake unused modules</li>
              <li>• Optimize bundle chunks</li>
              <li>• Remove duplicate dependencies</li>
            </ul>
          </div>
          
          <div className="p-6 bg-yellow-900 border border-yellow-700 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-200 mb-3">
              📊 Monitoring Setup
            </h3>
            <ul className="space-y-2 text-yellow-100">
              <li>• Configure real-time alerts</li>
              <li>• Set performance budgets</li>
              <li>• Track Core Web Vitals</li>
              <li>• Monitor user experience metrics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Performance Optimization</h1>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">All Systems Operational</span>
              </div>
            </div>
            
            <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg">
              {[
                { id: 'overview', label: 'Overview', icon: '🏠' },
                { id: 'cache', label: 'Cache & CDN', icon: '⚡' },
                { id: 'realtime', label: 'Real-time', icon: '📊' },
                { id: 'code', label: 'Code Optimization', icon: '🔧' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModule(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeModule === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeModule === 'overview' && renderOverview()}
        {activeModule === 'cache' && <PerformanceOptimizationManager />}
        {activeModule === 'realtime' && <RealTimePerformanceMonitor />}
        {activeModule === 'code' && <CodeOptimizationManager />}
      </div>
    </div>
  );
};