// @ts-nocheck
/**
 * AdvancedSearchManagementPage
 * Admin panel for advanced search, filters, and indexing
 */

import React, { useState } from 'react';

interface SearchIndex {
  name: string;
  table: string;
  columns: string[];
  status: 'active' | 'building' | 'error';
  documents: number;
  lastUpdated: string;
}

interface SearchQuery {
  id: string;
  query: string;
  filters: Record<string, any>;
  results: number;
  timestamp: string;
  userId: string;
  executionTime: number;
}

export const AdvancedSearchManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'indexes' | 'queries' | 'test'>('indexes');
  const [rebuilding, setRebuilding] = useState<string | null>(null);
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testFilters, setTestFilters] = useState({
    category: '',
    location: '',
    priceMin: '',
    priceMax: '',
    dateFrom: '',
    dateTo: ''
  });

  const searchIndexes: SearchIndex[] = [
    {
      name: 'Users Index',
      table: 'profiles',
      columns: ['full_name', 'bio', 'skills', 'location'],
      status: 'active',
      documents: 3847,
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Jobs Index',
      table: 'jobs',
      columns: ['title', 'description', 'requirements', 'location', 'category'],
      status: 'active',
      documents: 1892,
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Companies Index',
      table: 'companies',
      columns: ['name', 'description', 'industry', 'location'],
      status: 'active',
      documents: 567,
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Certificates Index',
      table: 'certificates',
      columns: ['name', 'description', 'issuer', 'category'],
      status: 'active',
      documents: 2341,
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Blog Posts Index',
      table: 'blog_posts',
      columns: ['title', 'content', 'excerpt', 'tags'],
      status: 'building',
      documents: 156,
      lastUpdated: new Date().toISOString()
    }
  ];

  const recentQueries: SearchQuery[] = [
    {
      id: '1',
      query: 'electrician amsterdam',
      filters: { category: 'construction', location: 'amsterdam' },
      results: 47,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      userId: 'user_123',
      executionTime: 125
    },
    {
      id: '2',
      query: 'frontend developer',
      filters: { category: 'it', priceMin: '50' },
      results: 83,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      userId: 'user_456',
      executionTime: 89
    },
    {
      id: '3',
      query: 'plumber urgent',
      filters: { location: 'rotterdam', urgent: true },
      results: 12,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      userId: 'user_789',
      executionTime: 156
    },
    {
      id: '4',
      query: 'graphic designer',
      filters: { category: 'creative' },
      results: 34,
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      userId: 'user_234',
      executionTime: 98
    },
    {
      id: '5',
      query: 'zzp certificate',
      filters: { type: 'certificate' },
      results: 123,
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      userId: 'user_567',
      executionTime: 67
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'building': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRebuildIndex = async (indexName: string) => {
    if (confirm(`Rebuild index "${indexName}"? This may take several minutes.`)) {
      setRebuilding(indexName);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setRebuilding(null);
      alert(`Index "${indexName}" rebuilt successfully!`);
    }
  };

  const handleTestSearch = async () => {
    if (!testQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTestResults([
      {
        id: 1,
        title: 'Experienced Electrician - Amsterdam',
        type: 'worker',
        relevance: 0.95,
        snippet: 'Licensed electrician with 10+ years experience in commercial and residential projects...'
      },
      {
        id: 2,
        title: 'Electrical Installation Job - City Center',
        type: 'job',
        relevance: 0.87,
        snippet: 'Looking for certified electrician for large office building renovation project...'
      },
      {
        id: 3,
        title: 'NEN 3140 Electrical Safety Certificate',
        type: 'certificate',
        relevance: 0.72,
        snippet: 'Official certification for electrical installations and safety procedures...'
      }
    ]);
  };

  const handleClearFilters = () => {
    setTestFilters({
      category: '',
      location: '',
      priceMin: '',
      priceMax: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Advanced Search Manager</h1>
          <p className="text-gray-600">Manage search indexes, filters, and query optimization</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Indexes</h3>
            <p className="text-3xl font-bold text-gray-900">{searchIndexes.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Documents Indexed</h3>
            <p className="text-3xl font-bold text-green-600">
              {searchIndexes.reduce((sum, idx) => sum + idx.documents, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Query Time</h3>
            <p className="text-3xl font-bold text-blue-600">
              {Math.round(recentQueries.reduce((sum, q) => sum + q.executionTime, 0) / recentQueries.length)}ms
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Queries/Hour</h3>
            <p className="text-3xl font-bold text-purple-600">234</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('indexes')}
            className={`pb-2 px-4 ${activeTab === 'indexes' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Search Indexes
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`pb-2 px-4 ${activeTab === 'queries' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Recent Queries
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`pb-2 px-4 ${activeTab === 'test' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Test Search
          </button>
        </div>

        {/* Search Indexes Tab */}
        {activeTab === 'indexes' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Index Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Columns</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchIndexes.map(index => (
                  <tr key={index.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{index.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">{index.table}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {index.columns.slice(0, 2).map(col => (
                          <span key={col} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {col}
                          </span>
                        ))}
                        {index.columns.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{index.columns.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(index.status)}`}>
                        {index.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {index.documents.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(index.lastUpdated).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRebuildIndex(index.name)}
                        disabled={rebuilding === index.name}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      >
                        {rebuilding === index.name ? '⏳ Rebuilding...' : '🔄 Rebuild'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Queries Tab */}
        {activeTab === 'queries' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filters</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Results</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exec Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentQueries.map(query => (
                  <tr key={query.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{query.query}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(query.filters).map(([key, value]) => (
                          <span key={key} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {query.results}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${query.executionTime > 150 ? 'text-red-600' : 'text-green-600'}`}>
                        {query.executionTime}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(query.timestamp).toLocaleTimeString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {query.userId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Test Search Tab */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 Test Search Engine</h3>
              
              {/* Search Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Query</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="Enter search query..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleTestSearch()}
                  />
                  <button
                    onClick={handleTestSearch}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    🔍 Search
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Advanced Filters</h4>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Category</label>
                    <select
                      value={testFilters.category}
                      onChange={(e) => setTestFilters({...testFilters, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="">All Categories</option>
                      <option value="construction">Construction</option>
                      <option value="it">IT</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Location</label>
                    <input
                      type="text"
                      value={testFilters.location}
                      onChange={(e) => setTestFilters({...testFilters, location: e.target.value})}
                      placeholder="City or region"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Price Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={testFilters.priceMin}
                        onChange={(e) => setTestFilters({...testFilters, priceMin: e.target.value})}
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        value={testFilters.priceMax}
                        onChange={(e) => setTestFilters({...testFilters, priceMax: e.target.value})}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {testResults.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Search Results ({testResults.length})
                </h3>
                <div className="space-y-4">
                  {testResults.map(result => (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{result.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {result.type}
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            {Math.round(result.relevance * 100)}% match
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{result.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchManagementPage;
