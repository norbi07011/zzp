import React, { useState, useEffect } from 'react';

// Code Optimization Manager - Bundle Analysis, Tree Shaking, and Code Splitting
export const CodeOptimizationManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState('analysis');
  const [bundleData, setBundleData] = useState<BundleAnalysis>({});
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [codeMetrics, setCodeMetrics] = useState<CodeMetrics>({});
  const [dependencies, setDependencies] = useState<Dependency[]>([]);

  // Bundle Analysis Interface
  interface BundleAnalysis {
    totalSize?: number; // MB
    gzippedSize?: number; // MB
    chunks?: {
      name: string;
      size: number; // KB
      gzippedSize: number; // KB
      modules: number;
      type: 'entry' | 'vendor' | 'async' | 'runtime';
      loadPriority: 'high' | 'medium' | 'low';
    }[];
    assets?: {
      name: string;
      size: number;
      type: 'js' | 'css' | 'image' | 'font' | 'other';
      cached: boolean;
      compression: number; // ratio
    }[];
    duplicatedModules?: {
      module: string;
      size: number;
      instances: number;
      chunks: string[];
    }[];
    unusedCode?: {
      file: string;
      unusedBytes: number;
      totalBytes: number;
      percentage: number;
    }[];
  }

  // Optimization Interface
  interface Optimization {
    id: string;
    name: string;
    type: 'bundle' | 'tree-shaking' | 'code-splitting' | 'minification' | 'compression';
    status: 'available' | 'applied' | 'in_progress' | 'failed';
    priority: 'high' | 'medium' | 'low';
    description: string;
    estimatedSavings: {
      size: number; // KB
      percentage: number;
    };
    impact: string;
    complexity: 'low' | 'medium' | 'high';
    requirements: string[];
    results?: {
      sizeBefore: number;
      sizeAfter: number;
      actualSavings: number;
      performance: number; // improvement %
    };
  }

  // Code Metrics Interface
  interface CodeMetrics {
    linesOfCode?: number;
    files?: number;
    components?: number;
    functions?: number;
    complexity?: {
      average: number;
      highest: { file: string; score: number }[];
    };
    coverage?: {
      lines: number;
      functions: number;
      branches: number;
      statements: number;
    };
    maintainability?: {
      score: number;
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
      issues: { type: string; count: number }[];
    };
    performance?: {
      buildTime: number; // seconds
      hotReloadTime: number; // ms
      bundleTime: number; // seconds
    };
  }

  // Dependency Interface
  interface Dependency {
    name: string;
    version: string;
    size: number; // KB
    type: 'dependency' | 'devDependency' | 'peerDependency';
    usage: 'used' | 'unused' | 'partial';
    treeShakeable: boolean;
    alternatives?: {
      name: string;
      size: number;
      savings: number;
    }[];
    securityIssues?: number;
    lastUpdated: string;
  }

  // Initialize mock data
  useEffect(() => {
    const mockBundleData: BundleAnalysis = {
      totalSize: 2.1,
      gzippedSize: 0.65,
      chunks: [
        {
          name: 'main',
          size: 451.67,
          gzippedSize: 142.33,
          modules: 45,
          type: 'entry',
          loadPriority: 'high'
        },
        {
          name: 'vendor',
          size: 867.23,
          gzippedSize: 289.45,
          modules: 23,
          type: 'vendor',
          loadPriority: 'high'
        },
        {
          name: 'admin',
          size: 234.56,
          gzippedSize: 78.92,
          modules: 12,
          type: 'async',
          loadPriority: 'medium'
        },
        {
          name: 'dashboard',
          size: 345.78,
          gzippedSize: 115.26,
          modules: 18,
          type: 'async',
          loadPriority: 'medium'
        },
        {
          name: 'runtime',
          size: 12.45,
          gzippedSize: 4.15,
          modules: 1,
          type: 'runtime',
          loadPriority: 'high'
        }
      ],
      assets: [
        { name: 'main.js', size: 451.67, type: 'js', cached: true, compression: 3.2 },
        { name: 'vendor.js', size: 867.23, type: 'js', cached: true, compression: 3.0 },
        { name: 'styles.css', size: 89.45, type: 'css', cached: true, compression: 4.1 },
        { name: 'logo.png', size: 23.67, type: 'image', cached: true, compression: 1.2 },
        { name: 'fonts.woff2', size: 45.23, type: 'font', cached: true, compression: 2.8 }
      ],
      duplicatedModules: [
        {
          module: 'lodash/isArray',
          size: 2.3,
          instances: 3,
          chunks: ['main', 'admin', 'dashboard']
        },
        {
          module: 'date-fns/format',
          size: 4.7,
          instances: 2,
          chunks: ['main', 'dashboard']
        },
        {
          module: 'react-dom/client',
          size: 12.1,
          instances: 2,
          chunks: ['main', 'admin']
        }
      ],
      unusedCode: [
        { file: 'utils/deprecated.ts', unusedBytes: 8945, totalBytes: 8945, percentage: 100 },
        { file: 'components/OldButton.tsx', unusedBytes: 2341, totalBytes: 2341, percentage: 100 },
        { file: 'hooks/useOldApi.ts', unusedBytes: 1876, totalBytes: 1876, percentage: 100 },
        { file: 'utils/helpers.ts', unusedBytes: 1234, totalBytes: 4567, percentage: 27 }
      ]
    };

    const mockOptimizations: Optimization[] = [
      {
        id: '1',
        name: 'Remove Unused Dependencies',
        type: 'tree-shaking',
        status: 'available',
        priority: 'high',
        description: 'Remove unused npm packages and dead code',
        estimatedSavings: { size: 345, percentage: 16.4 },
        impact: 'Bundle size reduction',
        complexity: 'low',
        requirements: ['Package analysis', 'Safe removal verification']
      },
      {
        id: '2',
        name: 'Code Splitting Optimization',
        type: 'code-splitting',
        status: 'available',
        priority: 'high',
        description: 'Split large chunks into smaller, lazy-loaded modules',
        estimatedSavings: { size: 234, percentage: 11.1 },
        impact: 'Initial load time improvement',
        complexity: 'medium',
        requirements: ['Dynamic imports', 'Route-based splitting']
      },
      {
        id: '3',
        name: 'Tree Shaking Enhancement',
        type: 'tree-shaking',
        status: 'applied',
        priority: 'medium',
        description: 'Improve tree shaking for lodash and other utilities',
        estimatedSavings: { size: 123, percentage: 5.9 },
        impact: 'Dead code elimination',
        complexity: 'medium',
        requirements: ['ES6 modules', 'Side-effect free imports'],
        results: {
          sizeBefore: 2100,
          sizeAfter: 1950,
          actualSavings: 150,
          performance: 7.1
        }
      },
      {
        id: '4',
        name: 'Dynamic Import Optimization',
        type: 'code-splitting',
        status: 'in_progress',
        priority: 'medium',
        description: 'Convert static imports to dynamic where appropriate',
        estimatedSavings: { size: 189, percentage: 9.0 },
        impact: 'Faster initial load',
        complexity: 'high',
        requirements: ['Webpack configuration', 'Component refactoring']
      },
      {
        id: '5',
        name: 'Minification Improvement',
        type: 'minification',
        status: 'available',
        priority: 'low',
        description: 'Enhance minification with better compression algorithms',
        estimatedSavings: { size: 67, percentage: 3.2 },
        impact: 'File size reduction',
        complexity: 'low',
        requirements: ['Terser configuration', 'CSS optimization']
      },
      {
        id: '6',
        name: 'Duplicate Module Elimination',
        type: 'bundle',
        status: 'available',
        priority: 'high',
        description: 'Remove duplicate modules across chunks',
        estimatedSavings: { size: 89, percentage: 4.2 },
        impact: 'Bundle optimization',
        complexity: 'medium',
        requirements: ['SplitChunksPlugin configuration']
      }
    ];

    const mockCodeMetrics: CodeMetrics = {
      linesOfCode: 15420,
      files: 187,
      components: 89,
      functions: 456,
      complexity: {
        average: 3.2,
        highest: [
          { file: 'components/Dashboard.tsx', score: 8.9 },
          { file: 'utils/dataProcessor.ts', score: 7.6 },
          { file: 'hooks/useComplexState.ts', score: 6.8 }
        ]
      },
      coverage: {
        lines: 78.5,
        functions: 82.1,
        branches: 71.3,
        statements: 79.8
      },
      maintainability: {
        score: 87.3,
        grade: 'B',
        issues: [
          { type: 'High Complexity', count: 8 },
          { type: 'Long Functions', count: 12 },
          { type: 'Deep Nesting', count: 5 }
        ]
      },
      performance: {
        buildTime: 45.2,
        hotReloadTime: 230,
        bundleTime: 12.8
      }
    };

    const mockDependencies: Dependency[] = [
      {
        name: 'react',
        version: '18.2.0',
        size: 42.3,
        type: 'dependency',
        usage: 'used',
        treeShakeable: false,
        securityIssues: 0,
        lastUpdated: '2024-06-14'
      },
      {
        name: 'lodash',
        version: '4.17.21',
        size: 67.8,
        type: 'dependency',
        usage: 'partial',
        treeShakeable: true,
        alternatives: [
          { name: 'lodash-es', size: 45.2, savings: 22.6 },
          { name: 'individual imports', size: 12.4, savings: 55.4 }
        ],
        securityIssues: 0,
        lastUpdated: '2021-02-20'
      },
      {
        name: 'moment',
        version: '2.29.4',
        size: 89.2,
        type: 'dependency',
        usage: 'used',
        treeShakeable: false,
        alternatives: [
          { name: 'date-fns', size: 23.4, savings: 65.8 },
          { name: 'dayjs', size: 12.7, savings: 76.5 }
        ],
        securityIssues: 1,
        lastUpdated: '2022-07-06'
      },
      {
        name: 'axios',
        version: '1.6.0',
        size: 23.4,
        type: 'dependency',
        usage: 'used',
        treeShakeable: false,
        securityIssues: 0,
        lastUpdated: '2023-10-26'
      },
      {
        name: 'testing-library',
        version: '13.4.0',
        size: 34.6,
        type: 'devDependency',
        usage: 'used',
        treeShakeable: true,
        securityIssues: 0,
        lastUpdated: '2023-05-15'
      },
      {
        name: 'old-package',
        version: '1.2.3',
        size: 15.7,
        type: 'dependency',
        usage: 'unused',
        treeShakeable: true,
        securityIssues: 3,
        lastUpdated: '2020-01-15'
      }
    ];

    setBundleData(mockBundleData);
    setOptimizations(mockOptimizations);
    setCodeMetrics(mockCodeMetrics);
    setDependencies(mockDependencies);
  }, []);

  // Render Bundle Analysis
  const renderBundleAnalysis = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Bundle Analysis</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Analyze Bundle
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Bundle Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Bundle Overview</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {bundleData.totalSize}MB
            </div>
            <div className="text-sm text-gray-400">Total Bundle Size</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {bundleData.gzippedSize}MB
            </div>
            <div className="text-sm text-gray-400">Gzipped Size</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {bundleData.chunks?.length}
            </div>
            <div className="text-sm text-gray-400">Total Chunks</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {((bundleData.gzippedSize! / bundleData.totalSize!) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Compression Ratio</div>
          </div>
        </div>
      </div>

      {/* Chunks Breakdown */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Chunks Breakdown</h4>
        
        <div className="space-y-4">
          {bundleData.chunks?.map((chunk, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded ${
                  chunk.type === 'entry' ? 'bg-blue-500' :
                  chunk.type === 'vendor' ? 'bg-green-500' :
                  chunk.type === 'async' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}></div>
                <div>
                  <h5 className="text-white font-medium">{chunk.name}</h5>
                  <p className="text-sm text-gray-400">{chunk.modules} modules • {chunk.type}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white">{chunk.size.toFixed(2)} KB</div>
                <div className="text-sm text-gray-400">
                  {chunk.gzippedSize.toFixed(2)} KB gzipped
                </div>
              </div>
              
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${
                  chunk.loadPriority === 'high' ? 'bg-red-900 text-red-200' :
                  chunk.loadPriority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-green-900 text-green-200'
                }`}>
                  {chunk.loadPriority} priority
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assets Breakdown */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Assets Breakdown</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {bundleData.assets?.map((asset, index) => (
            <div key={index} className="p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className={`w-3 h-3 rounded-full ${
                  asset.type === 'js' ? 'bg-yellow-500' :
                  asset.type === 'css' ? 'bg-blue-500' :
                  asset.type === 'image' ? 'bg-green-500' :
                  asset.type === 'font' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`}></span>
                {asset.cached && <span className="text-xs text-green-400">📦</span>}
              </div>
              <h5 className="text-white text-sm font-medium mb-1">{asset.name}</h5>
              <div className="text-sm text-gray-400">{asset.size.toFixed(2)} KB</div>
              <div className="text-xs text-gray-500">
                {asset.compression.toFixed(1)}x compression
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Duplicated Modules */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Duplicated Modules</h4>
        
        <div className="space-y-3">
          {bundleData.duplicatedModules?.map((module, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-900 border border-red-700 rounded">
              <div>
                <h5 className="text-white font-medium">{module.module}</h5>
                <p className="text-sm text-red-200">
                  Found in: {module.chunks.join(', ')}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-red-300">{module.size.toFixed(1)} KB</div>
                <div className="text-sm text-red-400">{module.instances} instances</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded">
          <p className="text-yellow-200 text-sm">
            💡 Total wasted space from duplicates: {' '}
            <span className="font-bold">
              {bundleData.duplicatedModules?.reduce((sum, m) => sum + (m.size * (m.instances - 1)), 0).toFixed(1)} KB
            </span>
          </p>
        </div>
      </div>

      {/* Unused Code */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Unused Code</h4>
        
        <div className="space-y-3">
          {bundleData.unusedCode?.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-orange-900 border border-orange-700 rounded">
              <div>
                <h5 className="text-white font-medium">{file.file}</h5>
                <p className="text-sm text-orange-200">
                  {file.percentage === 100 ? 'Completely unused' : `${file.percentage}% unused`}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-orange-300">{(file.unusedBytes / 1024).toFixed(1)} KB unused</div>
                <div className="text-sm text-orange-400">
                  {(file.totalBytes / 1024).toFixed(1)} KB total
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded">
          <p className="text-green-200 text-sm">
            💡 Potential savings from removing unused code: {' '}
            <span className="font-bold">
              {(bundleData.unusedCode?.reduce((sum, f) => sum + f.unusedBytes, 0)! / 1024).toFixed(1)} KB
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  // Render Optimizations
  const renderOptimizations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Code Optimizations</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Run All Available
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Create Custom
          </button>
        </div>
      </div>

      {/* Optimization Summary */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Optimization Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {optimizations.filter(o => o.status === 'available').length}
            </div>
            <div className="text-sm text-gray-400">Available</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {optimizations.filter(o => o.status === 'applied').length}
            </div>
            <div className="text-sm text-gray-400">Applied</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {optimizations.filter(o => o.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-400">In Progress</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {optimizations
                .filter(o => o.status === 'available')
                .reduce((sum, o) => sum + o.estimatedSavings.size, 0)
                .toFixed(0)}KB
            </div>
            <div className="text-sm text-gray-400">Potential Savings</div>
          </div>
        </div>
      </div>

      {/* Optimizations List */}
      <div className="space-y-4">
        {optimizations.map(optimization => (
          <div key={optimization.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className={`w-4 h-4 rounded-full ${
                  optimization.status === 'applied' ? 'bg-green-500' :
                  optimization.status === 'in_progress' ? 'bg-yellow-500' :
                  optimization.status === 'failed' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></span>
                <div>
                  <h4 className="text-lg font-medium text-white">{optimization.name}</h4>
                  <p className="text-sm text-gray-400">{optimization.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  optimization.priority === 'high' ? 'bg-red-900 text-red-200' :
                  optimization.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-blue-900 text-blue-200'
                }`}>
                  {optimization.priority.toUpperCase()}
                </span>
                <div className="text-xs text-gray-400 mt-1">
                  {optimization.type}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-400">Estimated Savings:</span>
                <div className="text-green-400 font-medium">
                  {optimization.estimatedSavings.size}KB ({optimization.estimatedSavings.percentage}%)
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-400">Impact:</span>
                <div className="text-white">{optimization.impact}</div>
              </div>
              <div>
                <span className="text-sm text-gray-400">Complexity:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  optimization.complexity === 'high' ? 'bg-red-900 text-red-200' :
                  optimization.complexity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-green-900 text-green-200'
                }`}>
                  {optimization.complexity}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-sm text-gray-400">Requirements:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {optimization.requirements.map((req, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                    {req}
                  </span>
                ))}
              </div>
            </div>

            {optimization.results && (
              <div className="p-3 bg-gray-900 rounded-lg mb-4">
                <h5 className="text-sm font-medium text-white mb-2">Results:</h5>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm font-bold text-red-400">{optimization.results.sizeBefore}KB</div>
                    <div className="text-xs text-gray-400">Before</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-400">{optimization.results.sizeAfter}KB</div>
                    <div className="text-xs text-gray-400">After</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-400">{optimization.results.actualSavings}KB</div>
                    <div className="text-xs text-gray-400">Saved</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-purple-400">+{optimization.results.performance}%</div>
                    <div className="text-xs text-gray-400">Performance</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                optimization.status === 'applied' ? 'bg-green-900 text-green-200' :
                optimization.status === 'in_progress' ? 'bg-yellow-900 text-yellow-200' :
                optimization.status === 'failed' ? 'bg-red-900 text-red-200' :
                'bg-blue-900 text-blue-200'
              }`}>
                {optimization.status.toUpperCase().replace('_', ' ')}
              </span>
              
              <div className="flex space-x-2">
                {optimization.status === 'available' && (
                  <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                    Apply
                  </button>
                )}
                {optimization.status === 'in_progress' && (
                  <button className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
                    Monitor
                  </button>
                )}
                {optimization.status === 'failed' && (
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

  // Render Code Metrics
  const renderCodeMetrics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Code Quality Metrics</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Run Analysis
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Code Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Code Overview</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {codeMetrics.linesOfCode?.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Lines of Code</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {codeMetrics.files}
            </div>
            <div className="text-sm text-gray-400">Files</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {codeMetrics.components}
            </div>
            <div className="text-sm text-gray-400">Components</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {codeMetrics.functions}
            </div>
            <div className="text-sm text-gray-400">Functions</div>
          </div>
        </div>
      </div>

      {/* Code Complexity */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Code Complexity</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {codeMetrics.complexity?.average.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Average Complexity Score</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Complexity Range:</span>
                <span className="text-white">1-10 (lower is better)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${(codeMetrics.complexity?.average! / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-white mb-3">Highest Complexity Files</h5>
            <div className="space-y-2">
              {codeMetrics.complexity?.highest.map((file, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-900 rounded">
                  <span className="text-sm text-gray-300 truncate">{file.file}</span>
                  <span className={`text-sm font-medium ${
                    file.score > 7 ? 'text-red-400' :
                    file.score > 5 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {file.score.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Coverage */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Test Coverage</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: 'Lines', value: codeMetrics.coverage?.lines || 0, color: 'blue' },
            { name: 'Functions', value: codeMetrics.coverage?.functions || 0, color: 'green' },
            { name: 'Branches', value: codeMetrics.coverage?.branches || 0, color: 'purple' },
            { name: 'Statements', value: codeMetrics.coverage?.statements || 0, color: 'yellow' }
          ].map(metric => (
            <div key={metric.name} className="text-center">
              <div className={`text-2xl font-bold text-${metric.color}-400 mb-2`}>
                {metric.value.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400 mb-2">{metric.name}</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-${metric.color}-600 h-2 rounded-full`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintainability */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Maintainability</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {codeMetrics.maintainability?.grade}
            </div>
            <div className="text-lg text-white mb-2">
              {codeMetrics.maintainability?.score.toFixed(1)} / 100
            </div>
            <div className="text-sm text-gray-400">Maintainability Score</div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-white mb-3">Issues to Address</h5>
            <div className="space-y-2">
              {codeMetrics.maintainability?.issues.map((issue, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-900 rounded">
                  <span className="text-sm text-gray-300">{issue.type}</span>
                  <span className="text-sm text-yellow-400">{issue.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Build Performance</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {codeMetrics.performance?.buildTime.toFixed(1)}s
            </div>
            <div className="text-sm text-gray-400">Build Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {codeMetrics.performance?.hotReloadTime}ms
            </div>
            <div className="text-sm text-gray-400">Hot Reload Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {codeMetrics.performance?.bundleTime.toFixed(1)}s
            </div>
            <div className="text-sm text-gray-400">Bundle Time</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Dependencies
  const renderDependencies = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Dependency Analysis</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Update All
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Security Audit
          </button>
        </div>
      </div>

      {/* Dependencies Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Dependencies Overview</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {dependencies.filter(d => d.type === 'dependency').length}
            </div>
            <div className="text-sm text-gray-400">Dependencies</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {dependencies.filter(d => d.type === 'devDependency').length}
            </div>
            <div className="text-sm text-gray-400">Dev Dependencies</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {dependencies.filter(d => d.usage === 'unused').length}
            </div>
            <div className="text-sm text-gray-400">Unused</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {dependencies.reduce((sum, d) => sum + (d.securityIssues || 0), 0)}
            </div>
            <div className="text-sm text-gray-400">Security Issues</div>
          </div>
        </div>
      </div>

      {/* Dependencies List */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h4 className="text-lg font-medium text-white">Dependencies List</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-gray-300">Package</th>
                <th className="px-6 py-3 text-left text-gray-300">Version</th>
                <th className="px-6 py-3 text-left text-gray-300">Size</th>
                <th className="px-6 py-3 text-left text-gray-300">Usage</th>
                <th className="px-6 py-3 text-left text-gray-300">Tree Shakeable</th>
                <th className="px-6 py-3 text-left text-gray-300">Security</th>
                <th className="px-6 py-3 text-left text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {dependencies.map((dep, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">{dep.name}</div>
                      <div className="text-xs text-gray-400">{dep.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{dep.version}</td>
                  <td className="px-6 py-4 text-gray-300">{dep.size.toFixed(1)} KB</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      dep.usage === 'used' ? 'bg-green-900 text-green-200' :
                      dep.usage === 'partial' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-red-900 text-red-200'
                    }`}>
                      {dep.usage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`${dep.treeShakeable ? 'text-green-400' : 'text-red-400'}`}>
                      {dep.treeShakeable ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {dep.securityIssues ? (
                      <span className="text-red-400">
                        {dep.securityIssues} issues
                      </span>
                    ) : (
                      <span className="text-green-400">✓</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {dep.alternatives && (
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                          Alternatives
                        </button>
                      )}
                      {dep.usage === 'unused' && (
                        <button className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                          Remove
                        </button>
                      )}
                      <button className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Optimization Suggestions</h4>
        
        <div className="space-y-4">
          {dependencies
            .filter(dep => dep.alternatives && dep.alternatives.length > 0)
            .map((dep, index) => (
              <div key={index} className="p-4 bg-blue-900 border border-blue-700 rounded">
                <h5 className="text-white font-medium mb-2">
                  Consider replacing {dep.name}
                </h5>
                <p className="text-blue-200 text-sm mb-3">
                  Current size: {dep.size.toFixed(1)} KB
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dep.alternatives?.map((alt, altIndex) => (
                    <div key={altIndex} className="p-3 bg-blue-800 rounded">
                      <div className="text-white font-medium">{alt.name}</div>
                      <div className="text-blue-200 text-sm">
                        {alt.size.toFixed(1)} KB (-{alt.savings.toFixed(1)} KB)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Code Optimization Manager</h1>
        <p className="text-gray-400">Bundle analysis, tree shaking, code splitting, and dependency optimization</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'analysis', label: 'Bundle Analysis', icon: '📊' },
          { id: 'optimizations', label: 'Optimizations', icon: '⚡' },
          { id: 'metrics', label: 'Code Metrics', icon: '📈' },
          { id: 'dependencies', label: 'Dependencies', icon: '📦' }
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
      {activeSection === 'analysis' && renderBundleAnalysis()}
      {activeSection === 'optimizations' && renderOptimizations()}
      {activeSection === 'metrics' && renderCodeMetrics()}
      {activeSection === 'dependencies' && renderDependencies()}
    </div>
  );
};