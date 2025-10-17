import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  ClockIcon,
  StarIcon,
  XMarkIcon,
  ChevronDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useDebounce } from '../hooks/useDebounce';

// Search interfaces
export interface SearchFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between' | 'exists';
  value: any;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'range';
}

export interface SearchQuery {
  text: string;
  filters: SearchFilter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface SearchResult<T = any> {
  items: T[];
  total: number;
  facets: Record<string, Array<{ value: string; count: number }>>;
  suggestions: string[];
  searchTime: number;
  query: SearchQuery;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  createdAt: Date;
  lastUsed: Date;
  useCount: number;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  searchable: boolean;
  filterable: boolean;
  sortable: boolean;
}

// Advanced Search Engine Component
interface AdvancedSearchEngineProps<T = any> {
  fields: FieldDefinition[];
  onSearch: (query: SearchQuery) => Promise<SearchResult<T>>;
  placeholder?: string;
  showSavedSearches?: boolean;
  showFilters?: boolean;
  showSorting?: boolean;
  maxFilters?: number;
  className?: string;
}

export const AdvancedSearchEngine = <T,>({
  fields,
  onSearch,
  placeholder = "Search...",
  showSavedSearches = true,
  showFilters = true,
  showSorting = true,
  maxFilters = 10,
  className = ""
}: AdvancedSearchEngineProps<T>) => {
  // State management
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [results, setResults] = useState<SearchResult<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search text
  const debouncedSearchText = useDebounce(searchText, 300);

  // Current search query
  const currentQuery: SearchQuery = useMemo(() => ({
    text: debouncedSearchText,
    filters,
    sortBy,
    sortOrder,
    page: 1,
    limit: 20
  }), [debouncedSearchText, filters, sortBy, sortOrder]);

  // Execute search
  const executeSearch = useCallback(async (query: SearchQuery) => {
    if (!query.text && query.filters.length === 0) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const result = await onSearch(query);
      setResults(result);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [onSearch]);

  // Auto-search on query change
  useEffect(() => {
    executeSearch(currentQuery);
  }, [currentQuery, executeSearch]);

  // Load saved searches
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved searches:', error);
      }
    }
  }, []);

  // Filter management
  const addFilter = (field: string) => {
    const fieldDef = fields.find(f => f.key === field);
    if (!fieldDef || filters.length >= maxFilters) return;

    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      field,
      operator: fieldDef.type === 'text' ? 'contains' : 'equals',
      value: '',
      label: fieldDef.label,
      type: fieldDef.type
    };

    setFilters([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<SearchFilter>) => {
    setFilters(filters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const clearAllFilters = () => {
    setFilters([]);
    setSearchText('');
  };

  // Saved searches
  const saveCurrentSearch = () => {
    const name = prompt('Enter search name:');
    if (!name) return;

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query: currentQuery,
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 0
    };

    const updated = [...savedSearches, newSavedSearch];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const loadSavedSearch = (saved: SavedSearch) => {
    setSearchText(saved.query.text);
    setFilters(saved.query.filters);
    setSortBy(saved.query.sortBy);
    setSortOrder(saved.query.sortOrder);

    // Update usage
    const updated = savedSearches.map(s => 
      s.id === saved.id 
        ? { ...s, lastUsed: new Date(), useCount: s.useCount + 1 }
        : s
    );
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const deleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  // Filterable fields
  const filterableFields = fields.filter(f => f.filterable);

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Main Search Bar */}
      <div className="p-4 border-b">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && results?.suggestions && results.suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {results.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchText(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <MagnifyingGlassIcon className="inline w-4 h-4 mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {showFilters && (
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${
                  showAdvanced ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                Filters {filters.length > 0 && `(${filters.length})`}
              </button>
            )}

            {showSavedSearches && (
              <button
                onClick={saveCurrentSearch}
                disabled={!searchText && filters.length === 0}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <BookmarkIcon className="w-4 h-4" />
                Save
              </button>
            )}

            {(searchText || filters.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {filters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span>{filter.label}: {filter.value}</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="p-4 border-b bg-gray-50">
          <div className="space-y-4">
            {/* Add Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Filter
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addFilter(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select field to filter...</option>
                {filterableFields.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter List */}
            {filters.map((filter) => (
              <FilterRow
                key={filter.id}
                filter={filter}
                fieldDefinition={fields.find(f => f.key === filter.field)!}
                onUpdate={(updates) => updateFilter(filter.id, updates)}
                onRemove={() => removeFilter(filter.id)}
              />
            ))}

            {/* Sorting */}
            {showSorting && (
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Default</option>
                    {fields.filter(f => f.sortable).map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {showSavedSearches && savedSearches.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Searches</h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.slice(0, 5).map((saved) => (
              <div key={saved.id} className="flex items-center gap-1">
                <button
                  onClick={() => loadSavedSearch(saved)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-1"
                >
                  <ClockIcon className="w-3 h-3" />
                  {saved.name}
                  <span className="text-xs text-gray-500">({saved.useCount})</span>
                </button>
                <button
                  onClick={() => deleteSavedSearch(saved.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <XMarkIcon className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Found <span className="font-medium">{results.total}</span> results
              <span className="text-xs text-gray-400 ml-2">
                ({results.searchTime}ms)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <EyeIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {results.items.length} showing
              </span>
            </div>
          </div>

          {/* Facets */}
          {Object.keys(results.facets).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Refine by:</h4>
              <div className="flex flex-wrap gap-4">
                {Object.entries(results.facets).map(([field, facets]) => (
                  <div key={field} className="text-sm">
                    <span className="font-medium text-gray-600 capitalize">{field}:</span>
                    {facets.slice(0, 3).map((facet) => (
                      <button
                        key={facet.value}
                        onClick={() => addFilter(field)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        {facet.value} ({facet.count})
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Filter Row Component
interface FilterRowProps {
  filter: SearchFilter;
  fieldDefinition: FieldDefinition;
  onUpdate: (updates: Partial<SearchFilter>) => void;
  onRemove: () => void;
}

const FilterRow: React.FC<FilterRowProps> = ({
  filter,
  fieldDefinition,
  onUpdate,
  onRemove
}) => {
  const operators = useMemo(() => {
    switch (fieldDefinition.type) {
      case 'text':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'startsWith', label: 'Starts with' },
          { value: 'endsWith', label: 'Ends with' }
        ];
      case 'number':
      case 'date':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'gt', label: 'Greater than' },
          { value: 'lt', label: 'Less than' },
          { value: 'gte', label: 'Greater or equal' },
          { value: 'lte', label: 'Less or equal' },
          { value: 'between', label: 'Between' }
        ];
      case 'select':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'in', label: 'In' }
        ];
      case 'boolean':
        return [
          { value: 'equals', label: 'Equals' }
        ];
      default:
        return [{ value: 'equals', label: 'Equals' }];
    }
  }, [fieldDefinition.type]);

  const renderValueInput = () => {
    switch (fieldDefinition.type) {
      case 'select':
        return (
          <select
            value={filter.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {fieldDefinition.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'boolean':
        return (
          <select
            value={filter.value}
            onChange={(e) => onUpdate({ value: e.target.value === 'true' })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            value={filter.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={filter.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );
      default:
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="Enter value..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
      <div className="min-w-0 flex-1 grid grid-cols-3 gap-3">
        <div>
          <span className="text-sm font-medium text-gray-700">{filter.label}</span>
        </div>
        <div>
          <select
            value={filter.operator}
            onChange={(e) => onUpdate({ operator: e.target.value as any })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {operators.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          {renderValueInput()}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AdvancedSearchEngine;