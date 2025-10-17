import React, { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ArrowsUpDownIcon,
  BookmarkIcon,
  ClockIcon,
  TagIcon,
  MapIcon,
  StarIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import debounce from 'lodash.debounce';
import Fuse from 'fuse.js';

// Advanced Search & Filtering Component - Task 4.2 Non-AI Search System
interface SearchableItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  date: Date;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  rating: number;
  price?: number;
  location?: string;
  type: 'document' | 'project' | 'user' | 'product' | 'task';
  metadata: Record<string, any>;
}

interface SearchFilter {
  categories: string[];
  tags: string[];
  statuses: string[];
  priorities: string[];
  dateRange: { start: Date | null; end: Date | null };
  priceRange: { min: number; max: number };
  rating: { min: number; max: number };
  types: string[];
  authors: string[];
}

interface SearchOptions {
  sortBy: 'relevance' | 'date' | 'title' | 'rating' | 'price' | 'author';
  sortOrder: 'asc' | 'desc';
  viewMode: 'list' | 'grid' | 'table';
  itemsPerPage: number;
  showAdvanced: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilter;
  options: SearchOptions;
  savedAt: Date;
}

export const AdvancedSearchFiltering: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<SearchableItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SearchableItem[]>([]);
  const [filters, setFilters] = useState<SearchFilter>({
    categories: [],
    tags: [],
    statuses: [],
    priorities: [],
    dateRange: { start: null, end: null },
    priceRange: { min: 0, max: 10000 },
    rating: { min: 0, max: 5 },
    types: [],
    authors: []
  });
  const [options, setOptions] = useState<SearchOptions>({
    sortBy: 'relevance',
    sortOrder: 'desc',
    viewMode: 'list',
    itemsPerPage: 20,
    showAdvanced: false
  });
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchStats, setSearchStats] = useState({ total: 0, time: 0 });
  const [isSearching, setIsSearching] = useState(false);

  // Fuse.js configuration for fuzzy search
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'description', weight: 0.5 },
      { name: 'tags', weight: 0.6 },
      { name: 'category', weight: 0.4 },
      { name: 'author', weight: 0.3 },
      { name: 'metadata.keywords', weight: 0.4 }
    ],
    threshold: 0.3, // Lower is more strict
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    shouldSort: true
  };

  const fuse = useMemo(() => new Fuse(items, fuseOptions), [items]);

  useEffect(() => {
    // Generate sample data
    const sampleItems: SearchableItem[] = [
      {
        id: '1',
        title: 'React Performance Optimization Guide',
        description: 'Comprehensive guide to optimizing React applications for better performance and user experience.',
        category: 'Development',
        tags: ['React', 'Performance', 'JavaScript', 'Frontend'],
        author: 'John Smith',
        date: new Date('2024-01-15'),
        status: 'active',
        priority: 'high',
        rating: 4.8,
        price: 49.99,
        type: 'document',
        metadata: { keywords: ['optimization', 'react hooks', 'memo', 'usecallback'], difficulty: 'intermediate' }
      },
      {
        id: '2',
        title: 'E-commerce Platform Project',
        description: 'Full-stack e-commerce platform built with React, Node.js, and PostgreSQL.',
        category: 'Project',
        tags: ['E-commerce', 'Full-stack', 'React', 'Node.js', 'PostgreSQL'],
        author: 'Sarah Johnson',
        date: new Date('2024-01-10'),
        status: 'active',
        priority: 'critical',
        rating: 4.9,
        price: 299.99,
        location: 'Remote',
        type: 'project',
        metadata: { keywords: ['payment', 'shopping cart', 'inventory'], stack: 'PERN' }
      },
      {
        id: '3',
        title: 'UI/UX Designer Portfolio',
        description: 'Creative portfolio showcasing modern UI/UX design principles and case studies.',
        category: 'Design',
        tags: ['UI/UX', 'Design', 'Portfolio', 'Creative'],
        author: 'Mike Chen',
        date: new Date('2024-01-08'),
        status: 'active',
        priority: 'medium',
        rating: 4.6,
        type: 'user',
        metadata: { keywords: ['figma', 'adobe', 'prototyping'], experience: '5 years' }
      },
      {
        id: '4',
        title: 'Advanced JavaScript Course',
        description: 'Deep dive into advanced JavaScript concepts including closures, prototypes, and async programming.',
        category: 'Education',
        tags: ['JavaScript', 'Course', 'Advanced', 'Programming'],
        author: 'Emily Davis',
        date: new Date('2024-01-05'),
        status: 'active',
        priority: 'high',
        rating: 4.7,
        price: 79.99,
        type: 'document',
        metadata: { keywords: ['closures', 'promises', 'async await'], duration: '12 hours' }
      },
      {
        id: '5',
        title: 'Mobile App Development Task',
        description: 'Develop a cross-platform mobile application using React Native for iOS and Android.',
        category: 'Development',
        tags: ['Mobile', 'React Native', 'iOS', 'Android'],
        author: 'David Wilson',
        date: new Date('2024-01-03'),
        status: 'pending',
        priority: 'high',
        rating: 4.5,
        price: 199.99,
        type: 'task',
        metadata: { keywords: ['expo', 'navigation', 'state management'], deadline: '2024-03-01' }
      },
      {
        id: '6',
        title: 'Cloud Infrastructure Setup',
        description: 'Design and implement scalable cloud infrastructure using AWS services.',
        category: 'DevOps',
        tags: ['AWS', 'Cloud', 'Infrastructure', 'DevOps'],
        author: 'Lisa Brown',
        date: new Date('2024-01-01'),
        status: 'archived',
        priority: 'medium',
        rating: 4.4,
        price: 149.99,
        location: 'USA',
        type: 'project',
        metadata: { keywords: ['ec2', 's3', 'lambda', 'cloudformation'], complexity: 'high' }
      }
    ];

    setItems(sampleItems);
    setFilteredItems(sampleItems);

    // Sample saved searches
    setSavedSearches([
      {
        id: '1',
        name: 'React Projects',
        query: 'React',
        filters: { ...filters, categories: ['Development'], tags: ['React'] },
        options,
        savedAt: new Date('2024-01-10')
      },
      {
        id: '2',
        name: 'High Priority Tasks',
        query: '',
        filters: { ...filters, priorities: ['high', 'critical'] },
        options,
        savedAt: new Date('2024-01-08')
      }
    ]);
  }, []);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      performSearch(query);
    }, 300),
    [filters, options, items]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const performSearch = (query: string) => {
    setIsSearching(true);
    const startTime = performance.now();

    let results = [...items];

    // Apply text search if query exists
    if (query.trim()) {
      const searchResults = fuse.search(query);
      results = searchResults.map(result => result.item);
    }

    // Apply filters
    results = results.filter(item => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(item.category)) return false;
      
      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => item.tags.includes(tag))) return false;
      
      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) return false;
      
      // Priority filter
      if (filters.priorities.length > 0 && !filters.priorities.includes(item.priority)) return false;
      
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(item.type)) return false;
      
      // Author filter
      if (filters.authors.length > 0 && !filters.authors.includes(item.author)) return false;
      
      // Date range filter
      if (filters.dateRange.start && item.date < filters.dateRange.start) return false;
      if (filters.dateRange.end && item.date > filters.dateRange.end) return false;
      
      // Price range filter
      if (item.price !== undefined) {
        if (item.price < filters.priceRange.min || item.price > filters.priceRange.max) return false;
      }
      
      // Rating filter
      if (item.rating < filters.rating.min || item.rating > filters.rating.max) return false;

      return true;
    });

    // Apply sorting
    results.sort((a, b) => {
      const order = options.sortOrder === 'asc' ? 1 : -1;
      
      switch (options.sortBy) {
        case 'date':
          return (a.date.getTime() - b.date.getTime()) * order;
        case 'title':
          return a.title.localeCompare(b.title) * order;
        case 'rating':
          return (a.rating - b.rating) * order;
        case 'price':
          const aPrice = a.price || 0;
          const bPrice = b.price || 0;
          return (aPrice - bPrice) * order;
        case 'author':
          return a.author.localeCompare(b.author) * order;
        case 'relevance':
        default:
          return 0; // Fuse.js already handles relevance sorting
      }
    });

    const endTime = performance.now();
    setSearchStats({ total: results.length, time: endTime - startTime });
    setFilteredItems(results);
    setCurrentPage(1);
    setIsSearching(false);
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      tags: [],
      statuses: [],
      priorities: [],
      dateRange: { start: null, end: null },
      priceRange: { min: 0, max: 10000 },
      rating: { min: 0, max: 5 },
      types: [],
      authors: []
    });
  };

  const saveSearch = () => {
    const searchName = prompt('Enter a name for this search:');
    if (searchName) {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name: searchName,
        query: searchQuery,
        filters: { ...filters },
        options: { ...options },
        savedAt: new Date()
      };
      setSavedSearches(prev => [...prev, newSearch]);
    }
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    setOptions(savedSearch.options);
  };

  const getUniqueValues = (key: keyof SearchableItem): string[] => {
    const values = items.map(item => {
      const value = item[key];
      return Array.isArray(value) ? value : [value];
    }).flat();
    return [...new Set(values)].filter(Boolean) as string[];
  };

  const getPaginatedItems = () => {
    const startIndex = (currentPage - 1) * options.itemsPerPage;
    const endIndex = startIndex + options.itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredItems.length / options.itemsPerPage);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MagnifyingGlassIcon className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Search & Filtering</h2>
            <p className="text-gray-600">Powerful search with intelligent filtering and sorting</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setOptions(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              options.showAdvanced 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            Advanced Filters
          </button>
          <button
            onClick={saveSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <BookmarkIcon className="w-4 h-4" />
            Save Search
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for documents, projects, users, tasks..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {/* Search Stats */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <div>
            Found <span className="font-medium">{searchStats.total}</span> results 
            {searchStats.time > 0 && (
              <span> in <span className="font-medium">{searchStats.time.toFixed(1)}ms</span></span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Searches</h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map(savedSearch => (
              <button
                key={savedSearch.id}
                onClick={() => loadSavedSearch(savedSearch)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors flex items-center gap-1"
              >
                <ClockIcon className="w-3 h-3" />
                {savedSearch.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {options.showAdvanced && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-6">
            <FunnelIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {getUniqueValues('category').map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, categories: [...prev.categories, category] }));
                        } else {
                          setFilters(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {['active', 'pending', 'inactive', 'archived'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, statuses: [...prev.statuses, status] }));
                        } else {
                          setFilters(prev => ({ ...prev, statuses: prev.statuses.filter(s => s !== status) }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className={`text-sm px-2 py-1 rounded capitalize ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="space-y-2">
                {['low', 'medium', 'high', 'critical'].map(priority => (
                  <label key={priority} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priorities.includes(priority)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, priorities: [...prev.priorities, priority] }));
                        } else {
                          setFilters(prev => ({ ...prev, priorities: prev.priorities.filter(p => p !== priority) }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className={`text-sm px-2 py-1 rounded capitalize ${getPriorityColor(priority)}`}>
                      {priority}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="space-y-2">
                {getUniqueValues('type').map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.types.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, types: [...prev.types, type] }));
                        } else {
                          setFilters(prev => ({ ...prev, types: prev.types.filter(t => t !== type) }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating: {filters.rating.min} - {filters.rating.max}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.rating.min}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    rating: { ...prev.rating, min: parseFloat(e.target.value) } 
                  }))}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.rating.max}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    rating: { ...prev.rating, max: parseFloat(e.target.value) } 
                  }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price: ${filters.priceRange.min} - ${filters.priceRange.max}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="10"
                  value={filters.priceRange.min}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, min: parseInt(e.target.value) } 
                  }))}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="10"
                  value={filters.priceRange.max}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, max: parseInt(e.target.value) } 
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort and View Options */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ArrowsUpDownIcon className="w-4 h-4 text-gray-600" />
              <select
                value={options.sortBy}
                onChange={(e) => setOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="rating">Rating</option>
                <option value="price">Price</option>
                <option value="author">Author</option>
              </select>
              <button
                onClick={() => setOptions(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                }))}
                className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                {options.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setOptions(prev => ({ ...prev, viewMode: 'list' }))}
                  className={`px-3 py-1 text-sm ${
                    options.viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOptions(prev => ({ ...prev, viewMode: 'grid' }))}
                  className={`px-3 py-1 text-sm ${
                    options.viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={options.itemsPerPage}
              onChange={(e) => setOptions(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) }))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search query or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {options.viewMode === 'list' && (
              <div className="divide-y divide-gray-200">
                {getPaginatedItems().map(item => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            {item.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {item.date.toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <TagIcon className="w-4 h-4" />
                            {item.category}
                          </div>
                          {item.price && (
                            <div className="flex items-center gap-1">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              ${item.price}
                            </div>
                          )}
                          {item.location && (
                            <div className="flex items-center gap-1">
                              <MapIcon className="w-4 h-4" />
                              {item.location}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {renderStars(item.rating)}
                            <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{item.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {options.viewMode === 'grid' && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPaginatedItems().map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-1 mb-3">
                        {renderStars(item.rating)}
                        <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          {item.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {item.date.toLocaleDateString()}
                        </div>
                        {item.price && (
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-3 h-3" />
                            ${item.price}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{item.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * options.itemsPerPage) + 1} to {Math.min(currentPage * options.itemsPerPage, filteredItems.length)} of {filteredItems.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 border rounded text-sm ${
                              currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};