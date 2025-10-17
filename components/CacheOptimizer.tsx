import React, { useState, useEffect } from 'react';
import { 
  CloudIcon, 
  ClockIcon, 
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface CacheEntry {
  key: string;
  size: number;
  lastAccessed: Date;
  expiresAt: Date | null;
  hitCount: number;
  type: 'localStorage' | 'sessionStorage' | 'cache-api' | 'memory';
  value: any;
}

interface CacheStats {
  totalSize: number;
  totalEntries: number;
  hitRate: number;
  missRate: number;
  storageBreakdown: {
    localStorage: number;
    sessionStorage: number;
    cacheApi: number;
    memory: number;
  };
}

class CacheManager {
  private static instance: CacheManager;
  private memoryCache = new Map<string, { value: any; expiresAt: Date | null; hitCount: number; lastAccessed: Date; size: number }>();
  private cacheStats = {
    hits: 0,
    misses: 0
  };

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Memory Cache Methods
  setMemory(key: string, value: any, ttl?: number): void {
    const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : null;
    const size = this.calculateSize(value);
    
    this.memoryCache.set(key, {
      value,
      expiresAt,
      hitCount: 0,
      lastAccessed: new Date(),
      size
    });
  }

  getMemory(key: string): any {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }

    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.memoryCache.delete(key);
      this.cacheStats.misses++;
      return null;
    }

    entry.hitCount++;
    entry.lastAccessed = new Date();
    this.cacheStats.hits++;
    return entry.value;
  }

  // LocalStorage Cache Methods
  setLocal(key: string, value: any, ttl?: number): void {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
    const data = { value, expiresAt };
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error);
    }
  }

  getLocal(key: string): any {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        this.cacheStats.misses++;
        return null;
      }

      const data = JSON.parse(item);
      if (data.expiresAt && data.expiresAt < Date.now()) {
        localStorage.removeItem(key);
        this.cacheStats.misses++;
        return null;
      }

      this.cacheStats.hits++;
      return data.value;
    } catch (error) {
      this.cacheStats.misses++;
      return null;
    }
  }

  // Session Storage Cache Methods
  setSession(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('SessionStorage cache set failed:', error);
    }
  }

  getSession(key: string): any {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) {
        this.cacheStats.misses++;
        return null;
      }
      this.cacheStats.hits++;
      return JSON.parse(item);
    } catch (error) {
      this.cacheStats.misses++;
      return null;
    }
  }

  // Cache API Methods (Service Worker)
  async setCacheApi(key: string, response: Response): Promise<void> {
    try {
      const cache = await caches.open('app-cache-v1');
      await cache.put(key, response.clone());
    } catch (error) {
      console.warn('Cache API set failed:', error);
    }
  }

  async getCacheApi(key: string): Promise<Response | null> {
    try {
      const cache = await caches.open('app-cache-v1');
      const response = await cache.match(key);
      
      if (response) {
        this.cacheStats.hits++;
        return response;
      }
      
      this.cacheStats.misses++;
      return null;
    } catch (error) {
      this.cacheStats.misses++;
      return null;
    }
  }

  // Utility Methods
  private calculateSize(value: any): number {
    return new Blob([JSON.stringify(value)]).size;
  }

  getAllEntries(): CacheEntry[] {
    const entries: CacheEntry[] = [];

    // Memory Cache
    for (const [key, entry] of this.memoryCache.entries()) {
      entries.push({
        key,
        size: entry.size,
        lastAccessed: entry.lastAccessed,
        expiresAt: entry.expiresAt,
        hitCount: entry.hitCount,
        type: 'memory',
        value: entry.value
      });
    }

    // LocalStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          const size = new Blob([value || '']).size;
          const data = JSON.parse(value || '{}');
          
          entries.push({
            key,
            size,
            lastAccessed: new Date(), // Not tracked in localStorage
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            hitCount: 0, // Not tracked in localStorage
            type: 'localStorage',
            value: data.value || value
          });
        } catch (error) {
          // Skip invalid entries
        }
      }
    }

    // SessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          const value = sessionStorage.getItem(key);
          const size = new Blob([value || '']).size;
          
          entries.push({
            key,
            size,
            lastAccessed: new Date(), // Not tracked in sessionStorage
            expiresAt: null, // Session storage expires with session
            hitCount: 0, // Not tracked in sessionStorage
            type: 'sessionStorage',
            value: JSON.parse(value || '{}')
          });
        } catch (error) {
          // Skip invalid entries
        }
      }
    }

    return entries;
  }

  getStats(): CacheStats {
    const entries = this.getAllEntries();
    const totalHits = this.cacheStats.hits || 1; // Avoid division by zero
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses || 1;

    const storageBreakdown = {
      localStorage: 0,
      sessionStorage: 0,
      cacheApi: 0,
      memory: 0
    };

    entries.forEach(entry => {
      switch (entry.type) {
        case 'localStorage':
          storageBreakdown.localStorage += entry.size;
          break;
        case 'sessionStorage':
          storageBreakdown.sessionStorage += entry.size;
          break;
        case 'cache-api':
          storageBreakdown.cacheApi += entry.size;
          break;
        case 'memory':
          storageBreakdown.memory += entry.size;
          break;
      }
    });

    return {
      totalSize: entries.reduce((sum, entry) => sum + entry.size, 0),
      totalEntries: entries.length,
      hitRate: Math.round((this.cacheStats.hits / totalRequests) * 100),
      missRate: Math.round((this.cacheStats.misses / totalRequests) * 100),
      storageBreakdown
    };
  }

  clearCache(type?: CacheEntry['type']): void {
    if (!type || type === 'memory') {
      this.memoryCache.clear();
    }
    if (!type || type === 'localStorage') {
      localStorage.clear();
    }
    if (!type || type === 'sessionStorage') {
      sessionStorage.clear();
    }
    if (!type || type === 'cache-api') {
      caches.delete('app-cache-v1');
    }
  }

  removeExpiredEntries(): number {
    let removed = 0;
    const now = new Date();

    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.memoryCache.delete(key);
        removed++;
      }
    }

    // Clean localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const item = localStorage.getItem(key);
          const data = JSON.parse(item || '{}');
          if (data.expiresAt && data.expiresAt < Date.now()) {
            localStorage.removeItem(key);
            removed++;
          }
        } catch (error) {
          // Skip invalid entries
        }
      }
    }

    return removed;
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getCacheTypeColor = (type: CacheEntry['type']): string => {
  switch (type) {
    case 'memory': return 'bg-blue-100 text-blue-800';
    case 'localStorage': return 'bg-green-100 text-green-800';
    case 'sessionStorage': return 'bg-yellow-100 text-yellow-800';
    case 'cache-api': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const CacheOptimizer: React.FC = () => {
  const [cacheManager] = useState(() => CacheManager.getInstance());
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'entries' | 'settings'>('overview');

  const refreshData = () => {
    setEntries(cacheManager.getAllEntries());
    setStats(cacheManager.getStats());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [cacheManager]);

  const handleClearCache = (type?: CacheEntry['type']) => {
    cacheManager.clearCache(type);
    refreshData();
  };

  const handleRemoveExpired = () => {
    const removed = cacheManager.removeExpiredEntries();
    alert(`Removed ${removed} expired entries`);
    refreshData();
  };

  const handleRemoveEntry = (key: string, type: CacheEntry['type']) => {
    switch (type) {
      case 'memory':
        cacheManager['memoryCache'].delete(key);
        break;
      case 'localStorage':
        localStorage.removeItem(key);
        break;
      case 'sessionStorage':
        sessionStorage.removeItem(key);
        break;
    }
    refreshData();
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CloudIcon className="w-6 h-6" />
          Cache Optimizer
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleRemoveExpired()}
            className="px-3 py-1.5 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 flex items-center gap-1"
          >
            <ClockIcon className="w-4 h-4" />
            Clean Expired
          </button>
          <button
            onClick={() => handleClearCache()}
            className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 flex items-center gap-1"
          >
            <TrashIcon className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'entries', label: 'Cache Entries' },
          { key: 'settings', label: 'Settings' }
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
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-800">Total Cache Size</div>
              <div className="text-2xl font-bold text-blue-900">
                {formatFileSize(stats.totalSize)}
              </div>
              <div className="text-xs text-blue-600">{stats.totalEntries} entries</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800">Hit Rate</div>
              <div className="text-2xl font-bold text-green-900">
                {stats.hitRate}%
              </div>
              <div className="text-xs text-green-600">Cache effectiveness</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm font-medium text-yellow-800">Miss Rate</div>
              <div className="text-2xl font-bold text-yellow-900">
                {stats.missRate}%
              </div>
              <div className="text-xs text-yellow-600">Cache misses</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-800">Memory Usage</div>
              <div className="text-2xl font-bold text-purple-900">
                {formatFileSize(stats.storageBreakdown.memory)}
              </div>
              <div className="text-xs text-purple-600">In-memory cache</div>
            </div>
          </div>

          {/* Storage Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Storage Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stats.storageBreakdown).map(([type, size]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCacheTypeColor(type as CacheEntry['type'])}`}>
                      {type}
                    </span>
                  </div>
                  <div className="font-medium">{formatFileSize(size)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Entries Tab */}
      {activeTab === 'entries' && (
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No cache entries found
            </div>
          ) : (
            entries.map((entry, index) => (
              <div key={`${entry.type}-${entry.key}-${index}`} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCacheTypeColor(entry.type)}`}>
                      {entry.type}
                    </span>
                    <span className="font-medium truncate max-w-md">{entry.key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatFileSize(entry.size)}</span>
                    <button
                      onClick={() => handleRemoveEntry(entry.key, entry.type)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Last Accessed:</span><br />
                    {entry.lastAccessed.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Expires:</span><br />
                    {entry.expiresAt ? entry.expiresAt.toLocaleString() : 'Never'}
                  </div>
                  <div>
                    <span className="font-medium">Hit Count:</span><br />
                    {entry.hitCount}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-800">Cache Configuration</h3>
            </div>
            <p className="text-sm text-yellow-700">
              Configure cache settings to optimize performance for your application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CogIcon className="w-5 h-5" />
                Memory Cache Settings
              </h4>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium">Max Memory Size</span>
                  <input 
                    type="number" 
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="50 MB"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Default TTL (seconds)</span>
                  <input 
                    type="number" 
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="3600"
                  />
                </label>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                Auto Cleanup Settings
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Auto-remove expired entries</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Cleanup on page unload</span>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Cleanup Interval (minutes)</span>
                  <input 
                    type="number" 
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="30"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Settings
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for easy cache usage in components
export const useCache = () => {
  const cacheManager = CacheManager.getInstance();
  
  return {
    setMemory: cacheManager.setMemory.bind(cacheManager),
    getMemory: cacheManager.getMemory.bind(cacheManager),
    setLocal: cacheManager.setLocal.bind(cacheManager),
    getLocal: cacheManager.getLocal.bind(cacheManager),
    setSession: cacheManager.setSession.bind(cacheManager),
    getSession: cacheManager.getSession.bind(cacheManager),
    setCacheApi: cacheManager.setCacheApi.bind(cacheManager),
    getCacheApi: cacheManager.getCacheApi.bind(cacheManager),
    clearCache: cacheManager.clearCache.bind(cacheManager),
    getStats: cacheManager.getStats.bind(cacheManager)
  };
};

export default CacheOptimizer;