import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  CloudArrowDownIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface BundleStats {
  totalSize: number;
  gzipSize: number;
  chunks: ChunkInfo[];
  assets: AssetInfo[];
  dependencies: DependencyInfo[];
}

interface ChunkInfo {
  name: string;
  size: number;
  gzipSize: number;
  modules: string[];
  type: 'vendor' | 'app' | 'runtime';
}

interface AssetInfo {
  name: string;
  size: number;
  type: 'js' | 'css' | 'img' | 'font' | 'other';
}

interface DependencyInfo {
  name: string;
  size: number;
  version: string;
  usage: 'direct' | 'peer' | 'dev';
}

// Mock data for demonstration - in real app this would come from build stats
const generateMockBundleStats = (): BundleStats => {
  return {
    totalSize: 2847392, // ~2.7MB
    gzipSize: 856732,   // ~836KB
    chunks: [
      {
        name: 'vendor-react',
        size: 154832,
        gzipSize: 48291,
        modules: ['react', 'react-dom', 'react-router-dom'],
        type: 'vendor'
      },
      {
        name: 'vendor-ui',
        size: 87234,
        gzipSize: 22156,
        modules: ['@heroicons/react', 'lucide-react'],
        type: 'vendor'
      },
      {
        name: 'vendor-supabase',
        size: 234567,
        gzipSize: 67891,
        modules: ['@supabase/supabase-js'],
        type: 'vendor'
      },
      {
        name: 'main',
        size: 1234567,
        gzipSize: 387234,
        modules: ['App.tsx', 'components/*', 'pages/*'],
        type: 'app'
      },
      {
        name: 'runtime',
        size: 23456,
        gzipSize: 8734,
        modules: ['vite/runtime'],
        type: 'runtime'
      }
    ],
    assets: [
      { name: 'main.js', size: 1234567, type: 'js' },
      { name: 'vendor-react.js', size: 154832, type: 'js' },
      { name: 'vendor-ui.js', size: 87234, type: 'js' },
      { name: 'styles.css', size: 45678, type: 'css' },
      { name: 'logo.svg', size: 2345, type: 'img' },
      { name: 'icons.woff2', size: 23456, type: 'font' }
    ],
    dependencies: [
      { name: 'react', size: 45678, version: '18.2.0', usage: 'direct' },
      { name: 'react-dom', size: 67890, version: '18.2.0', usage: 'direct' },
      { name: 'react-router-dom', size: 41264, version: '6.8.0', usage: 'direct' },
      { name: '@supabase/supabase-js', size: 234567, version: '2.38.0', usage: 'direct' },
      { name: '@heroicons/react', size: 87234, version: '2.0.18', usage: 'direct' }
    ]
  };
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getCompressionRatio = (original: number, compressed: number): number => {
  return Math.round(((original - compressed) / original) * 100);
};

const getSizeWarningLevel = (size: number): 'good' | 'warning' | 'critical' => {
  if (size < 100000) return 'good';      // < 100KB
  if (size < 500000) return 'warning';   // < 500KB  
  return 'critical';                     // > 500KB
};

const getSizeColor = (level: string): string => {
  switch (level) {
    case 'good': return 'text-green-600 bg-green-50';
    case 'warning': return 'text-yellow-600 bg-yellow-50';
    case 'critical': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const BundleAnalyzer: React.FC = () => {
  const [stats, setStats] = useState<BundleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'chunks' | 'assets' | 'dependencies'>('overview');

  useEffect(() => {
    // Simulate loading bundle stats
    setTimeout(() => {
      setStats(generateMockBundleStats());
      setLoading(false);
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

  if (!stats) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Bundle Stats Not Available</h3>
        <p className="text-gray-600">Run a production build to analyze bundle size.</p>
      </div>
    );
  }

  const compressionRatio = getCompressionRatio(stats.totalSize, stats.gzipSize);

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6" />
          Bundle Analyzer
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/dist/stats.html', '_blank')}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center gap-1"
          >
            <DocumentTextIcon className="w-4 h-4" />
            View Full Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'chunks', label: 'Chunks' },
          { key: 'assets', label: 'Assets' },
          { key: 'dependencies', label: 'Dependencies' }
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-800">Total Bundle Size</div>
              <div className="text-2xl font-bold text-blue-900">
                {formatFileSize(stats.totalSize)}
              </div>
              <div className="text-xs text-blue-600">Uncompressed</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800">Gzipped Size</div>
              <div className="text-2xl font-bold text-green-900">
                {formatFileSize(stats.gzipSize)}
              </div>
              <div className="text-xs text-green-600">{compressionRatio}% compression</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-800">Total Chunks</div>
              <div className="text-2xl font-bold text-purple-900">
                {stats.chunks.length}
              </div>
              <div className="text-xs text-purple-600">Code-split bundles</div>
            </div>
          </div>

          {/* Size Breakdown Chart (Simplified) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Size Breakdown</h3>
            <div className="space-y-2">
              {stats.chunks.map((chunk, index) => {
                const percentage = (chunk.size / stats.totalSize) * 100;
                const level = getSizeWarningLevel(chunk.size);
                
                return (
                  <div key={chunk.name} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium truncate">{chunk.name}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                      <div
                        className={`h-3 rounded-full ${
                          level === 'good' ? 'bg-green-500' :
                          level === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 w-16 text-right">
                      {formatFileSize(chunk.size)}
                    </div>
                    <div className="text-xs text-gray-500 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Chunks Tab */}
      {activeTab === 'chunks' && (
        <div className="space-y-4">
          {stats.chunks.map(chunk => {
            const level = getSizeWarningLevel(chunk.size);
            const compressionRatio = getCompressionRatio(chunk.size, chunk.gzipSize);
            
            return (
              <div key={chunk.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{chunk.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSizeColor(level)}`}>
                      {chunk.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatFileSize(chunk.size)}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(chunk.gzipSize)} gzipped ({compressionRatio}%)
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Modules:</span> {chunk.modules.join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-2">
          {stats.assets.map(asset => {
            const level = getSizeWarningLevel(asset.size);
            
            return (
              <div key={asset.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSizeColor(level)}`}>
                    {asset.type.toUpperCase()}
                  </span>
                  <span className="font-medium">{asset.name}</span>
                </div>
                <div className="text-sm font-medium">{formatFileSize(asset.size)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dependencies Tab */}
      {activeTab === 'dependencies' && (
        <div className="space-y-2">
          {stats.dependencies.map(dep => {
            const level = getSizeWarningLevel(dep.size);
            
            return (
              <div key={dep.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSizeColor(level)}`}>
                    {dep.usage}
                  </span>
                  <div>
                    <div className="font-medium">{dep.name}</div>
                    <div className="text-sm text-gray-500">v{dep.version}</div>
                  </div>
                </div>
                <div className="text-sm font-medium">{formatFileSize(dep.size)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BundleAnalyzer;