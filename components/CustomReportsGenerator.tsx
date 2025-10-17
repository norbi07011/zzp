import React, { useState, useRef, useMemo } from 'react';
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  TableCellsIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ShareIcon,
  PrinterIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FolderIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// Report Generation Interfaces
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'analytics' | 'compliance' | 'custom';
  type: 'dashboard' | 'table' | 'chart' | 'mixed';
  sections: ReportSection[];
  settings: ReportSettings;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

export interface ReportSection {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'text' | 'image';
  title: string;
  config: {
    dataSource?: string;
    metrics?: string[];
    visualization?: 'line' | 'bar' | 'pie' | 'table' | 'number';
    timeframe?: string;
    filters?: Record<string, any>;
    formatting?: {
      showLegend?: boolean;
      showGrid?: boolean;
      colors?: string[];
    };
  };
  layout: {
    width: number; // 1-12 grid columns
    height: number; // In grid units
    order: number;
  };
}

export interface ReportSettings {
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header: {
    enabled: boolean;
    content: string;
    showLogo: boolean;
    showDate: boolean;
  };
  footer: {
    enabled: boolean;
    content: string;
    showPageNumbers: boolean;
  };
  styling: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: number;
  };
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  format: 'pdf' | 'excel' | 'powerpoint' | 'html' | 'csv';
  status: 'generating' | 'completed' | 'failed';
  progress: number;
  fileSize?: number;
  downloadUrl?: string;
  generatedAt: string;
  expiresAt: string;
  parameters: Record<string, any>;
}

// Props
interface CustomReportsGeneratorProps {
  onReportGenerate?: (template: ReportTemplate, format: string) => void;
  onTemplateCreate?: (template: ReportTemplate) => void;
  onTemplateUpdate?: (template: ReportTemplate) => void;
  className?: string;
}

// Mock data
const mockTemplates: ReportTemplate[] = [
  {
    id: 'template-1',
    name: 'Executive Dashboard',
    description: 'High-level KPIs and business metrics for executive review',
    category: 'financial',
    type: 'dashboard',
    sections: [
      {
        id: 'section-1',
        type: 'kpi',
        title: 'Key Metrics',
        config: {
          metrics: ['revenue', 'users', 'conversion_rate'],
          timeframe: '30d'
        },
        layout: { width: 12, height: 2, order: 1 }
      },
      {
        id: 'section-2',
        type: 'chart',
        title: 'Revenue Trend',
        config: {
          dataSource: 'financial',
          visualization: 'line',
          timeframe: '90d',
          metrics: ['revenue']
        },
        layout: { width: 8, height: 4, order: 2 }
      }
    ],
    settings: {
      pageSize: 'A4',
      orientation: 'landscape',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      header: { enabled: true, content: 'Executive Report', showLogo: true, showDate: true },
      footer: { enabled: true, content: 'Confidential', showPageNumbers: true },
      styling: { primaryColor: '#3b82f6', secondaryColor: '#8b5cf6', fontFamily: 'Arial', fontSize: 12 }
    },
    isPublic: true,
    createdBy: 'Admin',
    createdAt: '2025-01-20',
    usageCount: 45
  },
  {
    id: 'template-2',
    name: 'Monthly Operations Report',
    description: 'Detailed operational metrics and performance indicators',
    category: 'operational',
    type: 'mixed',
    sections: [
      {
        id: 'section-1',
        type: 'table',
        title: 'Performance Metrics',
        config: {
          dataSource: 'operations',
          timeframe: '30d'
        },
        layout: { width: 12, height: 6, order: 1 }
      }
    ],
    settings: {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 15, right: 15, bottom: 15, left: 15 },
      header: { enabled: true, content: 'Operations Report', showLogo: false, showDate: true },
      footer: { enabled: true, content: '', showPageNumbers: true },
      styling: { primaryColor: '#059669', secondaryColor: '#0891b2', fontFamily: 'Helvetica', fontSize: 11 }
    },
    isPublic: false,
    createdBy: 'Operations Manager',
    createdAt: '2025-01-15',
    usageCount: 23
  },
  {
    id: 'template-3',
    name: 'Analytics Deep Dive',
    description: 'Comprehensive analytics report with detailed charts and insights',
    category: 'analytics',
    type: 'chart',
    sections: [
      {
        id: 'section-1',
        type: 'chart',
        title: 'User Engagement',
        config: {
          dataSource: 'analytics',
          visualization: 'bar',
          timeframe: '60d'
        },
        layout: { width: 6, height: 4, order: 1 }
      },
      {
        id: 'section-2',
        type: 'chart',
        title: 'Conversion Funnel',
        config: {
          dataSource: 'analytics',
          visualization: 'pie',
          timeframe: '30d'
        },
        layout: { width: 6, height: 4, order: 2 }
      }
    ],
    settings: {
      pageSize: 'A3',
      orientation: 'landscape',
      margins: { top: 25, right: 25, bottom: 25, left: 25 },
      header: { enabled: true, content: 'Analytics Report', showLogo: true, showDate: true },
      footer: { enabled: true, content: 'Generated by Analytics Team', showPageNumbers: true },
      styling: { primaryColor: '#7c3aed', secondaryColor: '#f59e0b', fontFamily: 'Times New Roman', fontSize: 10 }
    },
    isPublic: true,
    createdBy: 'Analytics Team',
    createdAt: '2025-01-10',
    usageCount: 67
  }
];

const mockGeneratedReports: GeneratedReport[] = [
  {
    id: 'report-1',
    templateId: 'template-1',
    name: 'Executive Dashboard - January 2025',
    format: 'pdf',
    status: 'completed',
    progress: 100,
    fileSize: 2567890,
    downloadUrl: '/reports/executive-jan-2025.pdf',
    generatedAt: '2025-01-27 14:30:00',
    expiresAt: '2025-02-27 14:30:00',
    parameters: { dateRange: 'January 2025' }
  },
  {
    id: 'report-2',
    templateId: 'template-2',
    name: 'Operations Report - Q4 2024',
    format: 'excel',
    status: 'completed',
    progress: 100,
    fileSize: 1234567,
    downloadUrl: '/reports/operations-q4-2024.xlsx',
    generatedAt: '2025-01-26 09:15:00',
    expiresAt: '2025-02-26 09:15:00',
    parameters: { quarter: 'Q4 2024' }
  },
  {
    id: 'report-3',
    templateId: 'template-3',
    name: 'Analytics Deep Dive - December 2024',
    format: 'powerpoint',
    status: 'generating',
    progress: 65,
    generatedAt: '2025-01-27 15:45:00',
    expiresAt: '2025-02-27 15:45:00',
    parameters: { month: 'December 2024' }
  }
];

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getCategoryColor = (category: ReportTemplate['category']): string => {
  switch (category) {
    case 'financial': return 'text-green-400 bg-green-500/10';
    case 'operational': return 'text-blue-400 bg-blue-500/10';
    case 'analytics': return 'text-purple-400 bg-purple-500/10';
    case 'compliance': return 'text-yellow-400 bg-yellow-500/10';
    case 'custom': return 'text-gray-400 bg-gray-500/10';
  }
};

const getStatusColor = (status: GeneratedReport['status']): string => {
  switch (status) {
    case 'completed': return 'text-green-400 bg-green-500/10';
    case 'generating': return 'text-blue-400 bg-blue-500/10';
    case 'failed': return 'text-red-400 bg-red-500/10';
  }
};

// Template Card Component
const TemplateCard: React.FC<{
  template: ReportTemplate;
  onGenerate: (template: ReportTemplate) => void;
  onEdit: (template: ReportTemplate) => void;
  onPreview: (template: ReportTemplate) => void;
}> = ({ template, onGenerate, onEdit, onPreview }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-white/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{template.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
              {template.category}
            </span>
            {template.isPublic && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
                Public
              </span>
            )}
          </div>
          <p className="text-sm text-gray-300 mb-3">{template.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              <span>{template.createdBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{template.createdAt}</span>
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              <span>{template.usageCount} uses</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onPreview(template)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
          >
            Preview
          </button>
          <button
            onClick={() => onEdit(template)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
      
      <div className="border-t border-white/20 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            {template.sections.length} section{template.sections.length !== 1 ? 's' : ''} • {template.settings.pageSize} {template.settings.orientation}
          </div>
          
          <div className="flex gap-2">
            {['PDF', 'Excel', 'PowerPoint'].map(format => (
              <button
                key={format}
                onClick={() => onGenerate(template)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Generated Report Card Component
const GeneratedReportCard: React.FC<{
  report: GeneratedReport;
  template: ReportTemplate;
  onDownload: (report: GeneratedReport) => void;
  onShare: (report: GeneratedReport) => void;
}> = ({ report, template, onDownload, onShare }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-white mb-1">{report.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
              {report.status}
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-300">
              {report.format.toUpperCase()}
            </span>
          </div>
          
          <div className="text-xs text-gray-400 space-y-1">
            <div>Generated: {report.generatedAt}</div>
            <div>Template: {template.name}</div>
            {report.fileSize && <div>Size: {formatFileSize(report.fileSize)}</div>}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {report.status === 'completed' && (
            <>
              <button
                onClick={() => onDownload(report)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                <DocumentArrowDownIcon className="w-3 h-3" />
                Download
              </button>
              <button
                onClick={() => onShare(report)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
              >
                <ShareIcon className="w-3 h-3" />
                Share
              </button>
            </>
          )}
        </div>
      </div>
      
      {report.status === 'generating' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Generating...</span>
            <span>{report.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${report.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Template Builder Component
const TemplateBuilder: React.FC<{
  template?: ReportTemplate;
  onSave: (template: ReportTemplate) => void;
  onCancel: () => void;
}> = ({ template, onSave, onCancel }) => {
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate>(
    template || {
      id: `template-${Date.now()}`,
      name: 'New Report Template',
      description: '',
      category: 'custom',
      type: 'mixed',
      sections: [],
      settings: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        header: { enabled: true, content: '', showLogo: true, showDate: true },
        footer: { enabled: true, content: '', showPageNumbers: true },
        styling: { primaryColor: '#3b82f6', secondaryColor: '#8b5cf6', fontFamily: 'Arial', fontSize: 12 }
      },
      isPublic: false,
      createdBy: 'Current User',
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    }
  );
  
  const addSection = () => {
    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      type: 'kpi',
      title: 'New Section',
      config: {},
      layout: { width: 6, height: 3, order: editingTemplate.sections.length + 1 }
    };
    
    setEditingTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };
  
  const removeSection = (sectionId: string) => {
    setEditingTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };
  
  const updateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    setEditingTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, ...updates } : s
      )
    }));
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">
          {template ? 'Edit Template' : 'Create New Template'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onSave(editingTemplate)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            Save Template
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Template Name
          </label>
          <input
            type="text"
            value={editingTemplate.name}
            onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={editingTemplate.category}
            onChange={(e) => setEditingTemplate(prev => ({ ...prev, category: e.target.value as any }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="financial">Financial</option>
            <option value="operational">Operational</option>
            <option value="analytics">Analytics</option>
            <option value="compliance">Compliance</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={editingTemplate.description}
          onChange={(e) => setEditingTemplate(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
        />
      </div>
      
      {/* Sections */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white">Report Sections</h4>
          <button
            onClick={addSection}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Add Section
          </button>
        </div>
        
        <div className="space-y-4">
          {editingTemplate.sections.map(section => (
            <div key={section.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Section Type
                    </label>
                    <select
                      value={section.type}
                      onChange={(e) => updateSection(section.id, { type: e.target.value as any })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    >
                      <option value="kpi">KPI Cards</option>
                      <option value="chart">Chart</option>
                      <option value="table">Table</option>
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Width (1-12)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={section.layout.width}
                      onChange={(e) => updateSection(section.id, { 
                        layout: { ...section.layout, width: Number(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => removeSection(section.id)}
                  className="ml-4 p-1 text-red-400 hover:text-red-300 transition-colors"
                  title="Remove Section"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          
          {editingTemplate.sections.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No sections added yet. Click "Add Section" to get started.
            </div>
          )}
        </div>
      </div>
      
      {/* Page Settings */}
      <div className="border-t border-white/20 pt-6">
        <h4 className="text-lg font-medium text-white mb-4">Page Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Page Size
            </label>
            <select
              value={editingTemplate.settings.pageSize}
              onChange={(e) => setEditingTemplate(prev => ({
                ...prev,
                settings: { ...prev.settings, pageSize: e.target.value as any }
              }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Orientation
            </label>
            <select
              value={editingTemplate.settings.orientation}
              onChange={(e) => setEditingTemplate(prev => ({
                ...prev,
                settings: { ...prev.settings, orientation: e.target.value as any }
              }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Primary Color
            </label>
            <input
              type="color"
              value={editingTemplate.settings.styling.primaryColor}
              onChange={(e) => setEditingTemplate(prev => ({
                ...prev,
                settings: { 
                  ...prev.settings, 
                  styling: { ...prev.settings.styling, primaryColor: e.target.value }
                }
              }))}
              className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Font Size
            </label>
            <input
              type="number"
              min="8"
              max="18"
              value={editingTemplate.settings.styling.fontSize}
              onChange={(e) => setEditingTemplate(prev => ({
                ...prev,
                settings: { 
                  ...prev.settings, 
                  styling: { ...prev.settings.styling, fontSize: Number(e.target.value) }
                }
              }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Custom Reports Generator Component
export const CustomReportsGenerator: React.FC<CustomReportsGeneratorProps> = ({
  onReportGenerate,
  onTemplateCreate,
  onTemplateUpdate,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'generated' | 'builder'>('templates');
  const [templates] = useState<ReportTemplate[]>(mockTemplates);
  const [generatedReports] = useState<GeneratedReport[]>(mockGeneratedReports);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  
  const handleGenerateReport = (template: ReportTemplate) => {
    if (onReportGenerate) {
      onReportGenerate(template, 'pdf');
    }
    console.log('Generating report from template:', template.name);
  };
  
  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsBuilding(true);
    setActiveTab('builder');
  };
  
  const handlePreviewTemplate = (template: ReportTemplate) => {
    console.log('Previewing template:', template.name);
    // Would open preview modal
  };
  
  const handleSaveTemplate = (template: ReportTemplate) => {
    if (selectedTemplate) {
      if (onTemplateUpdate) {
        onTemplateUpdate(template);
      }
    } else {
      if (onTemplateCreate) {
        onTemplateCreate(template);
      }
    }
    setIsBuilding(false);
    setSelectedTemplate(null);
    setActiveTab('templates');
  };
  
  const handleCancelBuilder = () => {
    setIsBuilding(false);
    setSelectedTemplate(null);
    setActiveTab('templates');
  };
  
  const handleDownloadReport = (report: GeneratedReport) => {
    console.log('Downloading report:', report.name);
    // Would trigger download
  };
  
  const handleShareReport = (report: GeneratedReport) => {
    console.log('Sharing report:', report.name);
    // Would open share modal
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Custom Reports Generator</h2>
          <p className="text-blue-200">Create, manage, and generate custom reports</p>
        </div>
        
        {!isBuilding && (
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setIsBuilding(true);
              setActiveTab('builder');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Create New Template
          </button>
        )}
      </div>
      
      {/* Tab Navigation */}
      {!isBuilding && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg">
          <div className="flex border-b border-white/20">
            {[
              { key: 'templates', label: 'Report Templates', icon: DocumentTextIcon },
              { key: 'generated', label: 'Generated Reports', icon: FolderIcon }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-400 text-white bg-white/10'
                      : 'border-transparent text-blue-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="space-y-6">
        {/* Templates Tab */}
        {activeTab === 'templates' && !isBuilding && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onGenerate={handleGenerateReport}
                onEdit={handleEditTemplate}
                onPreview={handlePreviewTemplate}
              />
            ))}
          </div>
        )}
        
        {/* Generated Reports Tab */}
        {activeTab === 'generated' && !isBuilding && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedReports.map(report => {
              const template = templates.find(t => t.id === report.templateId);
              return template ? (
                <GeneratedReportCard
                  key={report.id}
                  report={report}
                  template={template}
                  onDownload={handleDownloadReport}
                  onShare={handleShareReport}
                />
              ) : null;
            })}
          </div>
        )}
        
        {/* Template Builder */}
        {activeTab === 'builder' && isBuilding && (
          <TemplateBuilder
            template={selectedTemplate || undefined}
            onSave={handleSaveTemplate}
            onCancel={handleCancelBuilder}
          />
        )}
      </div>
    </div>
  );
};

export default CustomReportsGenerator;