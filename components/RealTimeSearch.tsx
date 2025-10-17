import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, 
  ClockIcon, 
  FireIcon,
  ArrowTrendingUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useDebounce } from '../hooks/useDebounce';

// Real-time search interfaces
export interface SearchSuggestion {
  text: string;
  type: 'query' | 'entity' | 'category';
  category?: string;
  count?: number;
  highlighted?: boolean;
}

export interface RecentSearch {
  query: string;
  timestamp: Date;
  resultCount: number;
}

export interface TrendingSearch {
  query: string;
  frequency: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SearchAnalytics {
  totalSearches: number;
  avgResultsPerQuery: number;
  popularQueries: Array<{ query: string; count: number }>;
  searchesPerHour: Array<{ hour: number; count: number }>;
  noResultQueries: string[];
}

// Real-time Search Component
interface RealTimeSearchProps {
  onSearch: (query: string) => Promise<any[]>;
  onSuggestions?: (query: string) => Promise<SearchSuggestion[]>;
  placeholder?: string;
  showHistory?: boolean;
  showTrending?: boolean;
  showAnalytics?: boolean;
  maxSuggestions?: number;
  minQueryLength?: number;
  className?: string;
}

export const RealTimeSearch: React.FC<RealTimeSearchProps> = ({
  onSearch,
  onSuggestions,
  placeholder = "Search in real-time...",
  showHistory = true,
  showTrending = true,
  showAnalytics = false,
  maxSuggestions = 8,
  minQueryLength = 2,
  className = ""
}) => {
  // State management
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced query for suggestions
  const debouncedQuery = useDebounce(query, 200);

  // Load saved data on mount
  useEffect(() => {
    loadRecentSearches();
    loadTrendingSearches();
    if (showAnalytics) {
      loadAnalytics();
    }
  }, [showAnalytics]);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length >= minQueryLength && onSuggestions) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, minQueryLength, onSuggestions]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            executeSearch(suggestions[selectedIndex].text);
          } else if (query.trim()) {
            executeSearch(query);
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, selectedIndex, suggestions, query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!onSuggestions) return;

    setLoading(true);
    try {
      const results = await onSuggestions(searchQuery);
      setSuggestions(results.slice(0, maxSuggestions));
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [onSuggestions, maxSuggestions]);

  // Execute search
  const executeSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowDropdown(false);
    setSelectedIndex(-1);

    try {
      const results = await onSearch(searchQuery);
      
      // Save to recent searches
      saveRecentSearch(searchQuery, results.length);
      
      // Update analytics
      updateSearchAnalytics(searchQuery, results.length);
      
      setQuery(searchQuery);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [onSearch]);

  // Save recent search
  const saveRecentSearch = (searchQuery: string, resultCount: number) => {
    const newSearch: RecentSearch = {
      query: searchQuery,
      timestamp: new Date(),
      resultCount
    };

    const updated = [newSearch, ...recentSearches.filter(s => s.query !== searchQuery)]
      .slice(0, 10); // Keep only last 10
    
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Load recent searches
  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        const parsed = JSON.parse(saved).map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        }));
        setRecentSearches(parsed);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  // Load trending searches (mock data for demo)
  const loadTrendingSearches = () => {
    const mockTrending: TrendingSearch[] = [
      { query: 'react performance', frequency: 156, trend: 'up' },
      { query: 'typescript best practices', frequency: 89, trend: 'up' },
      { query: 'next.js deployment', frequency: 67, trend: 'stable' },
      { query: 'tailwind css', frequency: 45, trend: 'down' },
      { query: 'web vitals optimization', frequency: 78, trend: 'up' }
    ];
    setTrendingSearches(mockTrending);
  };

  // Update search analytics
  const updateSearchAnalytics = (searchQuery: string, resultCount: number) => {
    // In real app, this would send to analytics service
    console.log('Search analytics:', { query: searchQuery, results: resultCount });
  };

  // Load analytics (mock data)
  const loadAnalytics = () => {
    const mockAnalytics: SearchAnalytics = {
      totalSearches: 1247,
      avgResultsPerQuery: 23.4,
      popularQueries: [
        { query: 'react', count: 89 },
        { query: 'typescript', count: 67 },
        { query: 'performance', count: 45 }
      ],
      searchesPerHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 50) + 10
      })),
      noResultQueries: ['obscure query', 'typo qwerty', 'random gibberish']
    };
    setAnalytics(mockAnalytics);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Get suggestion icon
  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'entity':
        return <MagnifyingGlassIcon className="w-4 h-4 text-blue-500" />;
      case 'category':
        return <FireIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-auto"
        >
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => executeSearch(suggestion.text)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  {getSuggestionIcon(suggestion.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {highlightMatch(suggestion.text, query)}
                    </div>
                    {suggestion.category && (
                      <div className="text-xs text-gray-500">
                        in {suggestion.category}
                      </div>
                    )}
                  </div>
                  {suggestion.count && (
                    <div className="text-xs text-gray-400">
                      {suggestion.count} results
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {showHistory && recentSearches.length > 0 && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Recent
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
              {recentSearches.slice(0, 5).map((recent, index) => (
                <button
                  key={index}
                  onClick={() => executeSearch(recent.query)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
                >
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900">{recent.query}</div>
                    <div className="text-xs text-gray-500">
                      {recent.resultCount} results • {recent.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {showTrending && trendingSearches.length > 0 && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Trending
              </div>
              {trendingSearches.slice(0, 4).map((trending, index) => (
                <button
                  key={index}
                  onClick={() => executeSearch(trending.query)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
                >
                  <ArrowTrendingUpIcon className={`w-4 h-4 ${
                    trending.trend === 'up' ? 'text-green-500' :
                    trending.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900">{trending.query}</div>
                    <div className="text-xs text-gray-500">
                      {trending.frequency} searches this week
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Analytics Panel */}
          {showAnalytics && analytics && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Search Analytics
              </div>
              <div className="px-3 py-2 text-sm">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      {analytics.totalSearches.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Total searches</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {analytics.avgResultsPerQuery}
                    </div>
                    <div className="text-xs text-gray-500">Avg results</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Popular: {analytics.popularQueries.map(q => q.query).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {suggestions.length === 0 && recentSearches.length === 0 && query.length < minQueryLength && (
            <div className="py-8 text-center text-gray-500">
              <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">Start typing to search...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeSearch;