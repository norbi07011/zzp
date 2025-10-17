import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  BookmarkIcon, 
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// Filter Management Interfaces
export interface FilterTemplate {
  id: string;
  name: string;
  description: string;
  filters: FilterRule[];
  category: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  useCount: number;
  rating: number;
  tags: string[];
}

export interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'range';
  label: string;
  required: boolean;
}

export interface FilterSet {
  id: string;
  name: string;
  filters: FilterRule[];
  isActive: boolean;
  isFavorite: boolean;
  lastUsed: Date;
}

export interface FilterCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  templates: FilterTemplate[];
}

// Mock data generator
const generateMockFilterData = () => {
  const categories: FilterCategory[] = [
    {
      id: 'common',
      name: 'Common Filters',
      icon: '🔧',
      color: 'blue',
      templates: [
        {
          id: 'recent-posts',
          name: 'Recent Posts',
          description: 'Posts from the last 7 days with high engagement',
          filters: [
            {
              id: '1',
              field: 'createdAt',
              operator: 'gte',
              value: '7d',
              type: 'date',
              label: 'Created Date',
              required: true
            },
            {
              id: '2',
              field: 'engagement',
              operator: 'gte',
              value: 10,
              type: 'number',
              label: 'Engagement Score',
              required: false
            }
          ],
          category: 'common',
          isPublic: true,
          createdBy: 'admin',
          createdAt: new Date('2024-01-15'),
          lastModified: new Date('2024-01-20'),
          useCount: 234,
          rating: 4.5,
          tags: ['popular', 'content', 'recent']
        }
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced Filters',
      icon: '⚡',
      color: 'purple',
      templates: [
        {
          id: 'complex-search',
          name: 'Complex Content Search',
          description: 'Multi-criteria search for content with specific attributes',
          filters: [
            {
              id: '3',
              field: 'category',
              operator: 'in',
              value: ['tech', 'programming'],
              type: 'select',
              label: 'Category',
              required: true
            },
            {
              id: '4',
              field: 'wordCount',
              operator: 'between',
              value: [500, 2000],
              type: 'range',
              label: 'Word Count',
              required: false
            }
          ],
          category: 'advanced',
          isPublic: true,
          createdBy: 'expert_user',
          createdAt: new Date('2024-01-10'),
          lastModified: new Date('2024-01-18'),
          useCount: 89,
          rating: 4.8,
          tags: ['advanced', 'content', 'detailed']
        }
      ]
    }
  ];

  const savedFilterSets: FilterSet[] = [
    {
      id: 'set1',
      name: 'My Daily Search',
      filters: [
        {
          id: '5',
          field: 'status',
          operator: 'equals',
          value: 'active',
          type: 'select',
          label: 'Status',
          required: true
        }
      ],
      isActive: true,
      isFavorite: true,
      lastUsed: new Date()
    }
  ];

  return { categories, savedFilterSets };
};

// Filter Management Component
interface FilterManagerProps {
  onApplyFilters: (filters: FilterRule[]) => void;
  availableFields: Array<{
    key: string;
    label: string;
    type: string;
    options?: Array<{ value: string; label: string }>;
  }>;
  currentFilters: FilterRule[];
  className?: string;
}

export const FilterManager: React.FC<FilterManagerProps> = ({
  onApplyFilters,
  availableFields,
  currentFilters,
  className = ""
}) => {
  const [showManager, setShowManager] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'templates' | 'saved'>('current');
  const [filterData, setFilterData] = useState(generateMockFilterData());
  const [selectedTemplate, setSelectedTemplate] = useState<FilterTemplate | null>(null);
  const [editingFilter, setEditingFilter] = useState<FilterRule | null>(null);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  // Template operations
  const applyTemplate = (template: FilterTemplate) => {
    onApplyFilters(template.filters);
    
    // Update usage count
    const updatedCategories = filterData.categories.map(cat => ({
      ...cat,
      templates: cat.templates.map(t => 
        t.id === template.id 
          ? { ...t, useCount: t.useCount + 1 }
          : t
      )
    }));
    setFilterData({ ...filterData, categories: updatedCategories });
    setShowManager(false);
  };

  const saveAsTemplate = () => {
    const name = prompt('Enter template name:');
    if (!name || currentFilters.length === 0) return;

    const newTemplate: FilterTemplate = {
      id: Date.now().toString(),
      name,
      description: `Custom filter template with ${currentFilters.length} filters`,
      filters: currentFilters,
      category: 'custom',
      isPublic: false,
      createdBy: 'current_user',
      createdAt: new Date(),
      lastModified: new Date(),
      useCount: 0,
      rating: 0,
      tags: ['custom']
    };

    // Add to custom category or create it
    const updatedCategories = [...filterData.categories];
    const customCategoryIndex = updatedCategories.findIndex(c => c.id === 'custom');
    
    if (customCategoryIndex >= 0) {
      updatedCategories[customCategoryIndex].templates.push(newTemplate);
    } else {
      updatedCategories.push({
        id: 'custom',
        name: 'My Templates',
        icon: '📁',
        color: 'green',
        templates: [newTemplate]
      });
    }

    setFilterData({ ...filterData, categories: updatedCategories });
  };

  const deleteTemplate = (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const updatedCategories = filterData.categories.map(cat => ({
      ...cat,
      templates: cat.templates.filter(t => t.id !== templateId)
    }));
    setFilterData({ ...filterData, categories: updatedCategories });
  };

  // Filter set operations
  const saveCurrentFilters = () => {
    const name = prompt('Enter filter set name:');
    if (!name || currentFilters.length === 0) return;

    const newFilterSet: FilterSet = {
      id: Date.now().toString(),
      name,
      filters: currentFilters,
      isActive: false,
      isFavorite: false,
      lastUsed: new Date()
    };

    setFilterData({
      ...filterData,
      savedFilterSets: [...filterData.savedFilterSets, newFilterSet]
    });
  };

  const loadFilterSet = (filterSet: FilterSet) => {
    onApplyFilters(filterSet.filters);
    
    // Update last used
    const updatedSets = filterData.savedFilterSets.map(set =>
      set.id === filterSet.id 
        ? { ...set, lastUsed: new Date() }
        : set
    );
    setFilterData({ ...filterData, savedFilterSets: updatedSets });
    setShowManager(false);
  };

  const toggleFavorite = (setId: string) => {
    const updatedSets = filterData.savedFilterSets.map(set =>
      set.id === setId 
        ? { ...set, isFavorite: !set.isFavorite }
        : set
    );
    setFilterData({ ...filterData, savedFilterSets: updatedSets });
  };

  const deleteFilterSet = (setId: string) => {
    if (!confirm('Are you sure you want to delete this filter set?')) return;
    
    const updatedSets = filterData.savedFilterSets.filter(set => set.id !== setId);
    setFilterData({ ...filterData, savedFilterSets: updatedSets });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Filter Manager Toggle */}
      <button
        onClick={() => setShowManager(!showManager)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
          showManager 
            ? 'bg-blue-50 border-blue-300 text-blue-700' 
            : 'border-gray-300 hover:bg-gray-50'
        }`}
      >
        <AdjustmentsHorizontalIcon className="w-4 h-4" />
        Manage Filters
        {currentFilters.length > 0 && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
            {currentFilters.length}
          </span>
        )}
      </button>

      {/* Filter Manager Panel */}
      {showManager && (
        <div className="absolute top-full left-0 z-50 mt-2 w-[600px] bg-white rounded-lg border shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Filter Manager</h3>
            <button
              onClick={() => setShowManager(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b">
            {[
              { key: 'current', label: 'Current Filters' },
              { key: 'templates', label: 'Templates' },
              { key: 'saved', label: 'Saved Sets' }
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

          {/* Tab Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Current Filters Tab */}
            {activeTab === 'current' && (
              <div className="space-y-4">
                {currentFilters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FunnelIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active filters</p>
                    <p className="text-sm">Use templates or create custom filters</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Active Filters ({currentFilters.length})</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={saveAsTemplate}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save as Template
                        </button>
                        <button
                          onClick={saveCurrentFilters}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Save Set
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {currentFilters.map((filter, index) => (
                        <div key={filter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{filter.label}</span>
                            <span className="text-gray-500 ml-2">{filter.operator}</span>
                            <span className="text-gray-700 ml-2">
                              {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingFilter(filter)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const updated = currentFilters.filter(f => f.id !== filter.id);
                                onApplyFilters(updated);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-4">
                {filterData.categories.map((category) => (
                  <div key={category.id}>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      {category.name}
                    </h4>
                    <div className="grid gap-3">
                      {category.templates.map((template) => (
                        <div key={template.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-medium text-gray-900">{template.name}</h5>
                              <p className="text-sm text-gray-600">{template.description}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => applyTemplate(template)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Apply
                              </button>
                              {!template.isPublic && (
                                <button
                                  onClick={() => deleteTemplate(template.id)}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <EyeIcon className="w-3 h-3" />
                              {template.useCount} uses
                            </span>
                            <span className="flex items-center gap-1">
                              <StarIcon className="w-3 h-3" />
                              {template.rating}/5
                            </span>
                            <span className="flex items-center gap-1">
                              <TagIcon className="w-3 h-3" />
                              {template.tags.join(', ')}
                            </span>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500">
                            {template.filters.length} filters • 
                            by {template.createdBy} • 
                            {template.lastModified.toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Saved Sets Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                {filterData.savedFilterSets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookmarkIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No saved filter sets</p>
                    <p className="text-sm">Save your current filters to reuse them later</p>
                  </div>
                ) : (
                  filterData.savedFilterSets.map((filterSet) => (
                    <div key={filterSet.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-900">{filterSet.name}</h5>
                          {filterSet.isFavorite && (
                            <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleFavorite(filterSet.id)}
                            className={`p-1 rounded ${
                              filterSet.isFavorite 
                                ? 'text-yellow-500' 
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <StarIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => loadFilterSet(filterSet)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteFilterSet(filterSet.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {filterSet.filters.length} filters
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          Last used: {filterSet.lastUsed.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterManager;