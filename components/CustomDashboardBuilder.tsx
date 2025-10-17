import React, { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
  PlusIcon,
  Cog6ToothIcon,
  TrashIcon,
  Square3Stack3DIcon,
  ChartBarIcon,
  TableCellsIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  BookmarkIcon,
  ShareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Custom Dashboard Builder with Drag & Drop
interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'calendar' | 'todo' | 'weather' | 'clock' | 'contacts' | 'notes';
  title: string;
  config: {
    dataSource?: string;
    chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
    metrics?: string[];
    refreshInterval?: number;
    showHeader?: boolean;
    color?: string;
    size?: 'small' | 'medium' | 'large';
  };
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  isPublic: boolean;
  createdAt: Date;
  lastModified: Date;
  owner: string;
  tags: string[];
  backgroundColor: string;
}

interface WidgetTemplate {
  type: DashboardWidget['type'];
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  defaultConfig: DashboardWidget['config'];
  defaultLayout: DashboardWidget['layout'];
}

export const CustomDashboardBuilder: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('view');

  // Widget templates
  const widgetTemplates: WidgetTemplate[] = [
    {
      type: 'metric',
      name: 'KPI Metric',
      description: 'Display key performance indicators and metrics',
      icon: ChartBarIcon,
      defaultConfig: {
        dataSource: 'analytics',
        metrics: ['revenue'],
        refreshInterval: 300,
        showHeader: true,
        color: 'blue',
        size: 'medium'
      },
      defaultLayout: { x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 }
    },
    {
      type: 'chart',
      name: 'Chart Widget',
      description: 'Visualize data with various chart types',
      icon: ChartBarIcon,
      defaultConfig: {
        chartType: 'line',
        dataSource: 'sales',
        refreshInterval: 600,
        showHeader: true,
        color: 'green'
      },
      defaultLayout: { x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 }
    },
    {
      type: 'table',
      name: 'Data Table',
      description: 'Display data in tabular format',
      icon: TableCellsIcon,
      defaultConfig: {
        dataSource: 'clients',
        refreshInterval: 300,
        showHeader: true
      },
      defaultLayout: { x: 0, y: 0, w: 8, h: 4, minW: 4, minH: 3 }
    },
    {
      type: 'calendar',
      name: 'Calendar View',
      description: 'Show upcoming events and appointments',
      icon: CalendarIcon,
      defaultConfig: {
        dataSource: 'events',
        refreshInterval: 900,
        showHeader: true,
        color: 'purple'
      },
      defaultLayout: { x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 }
    },
    {
      type: 'todo',
      name: 'Task List',
      description: 'Display and manage todo items',
      icon: DocumentTextIcon,
      defaultConfig: {
        dataSource: 'tasks',
        refreshInterval: 300,
        showHeader: true,
        color: 'orange'
      },
      defaultLayout: { x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 3 }
    },
    {
      type: 'clock',
      name: 'World Clock',
      description: 'Display time in different timezones',
      icon: ClockIcon,
      defaultConfig: {
        refreshInterval: 1,
        showHeader: true,
        color: 'gray'
      },
      defaultLayout: { x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 }
    },
    {
      type: 'contacts',
      name: 'Contact List',
      description: 'Show recent contacts and clients',
      icon: UserIcon,
      defaultConfig: {
        dataSource: 'contacts',
        refreshInterval: 600,
        showHeader: true,
        color: 'indigo'
      },
      defaultLayout: { x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 3 }
    },
    {
      type: 'notes',
      name: 'Quick Notes',
      description: 'Add and view quick notes',
      icon: DocumentTextIcon,
      defaultConfig: {
        showHeader: true,
        color: 'yellow'
      },
      defaultLayout: { x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 2 }
    }
  ];

  useEffect(() => {
    // Mock dashboard data
    const mockDashboards: Dashboard[] = [
      {
        id: '1',
        name: 'Executive Overview',
        description: 'High-level business metrics and KPIs',
        widgets: [
          {
            id: 'widget1',
            type: 'metric',
            title: 'Monthly Revenue',
            config: {
              dataSource: 'analytics',
              metrics: ['revenue'],
              refreshInterval: 300,
              showHeader: true,
              color: 'green',
              size: 'large'
            },
            layout: { x: 0, y: 0, w: 3, h: 2 }
          },
          {
            id: 'widget2',
            type: 'chart',
            title: 'Sales Trend',
            config: {
              chartType: 'line',
              dataSource: 'sales',
              refreshInterval: 600,
              showHeader: true,
              color: 'blue'
            },
            layout: { x: 3, y: 0, w: 6, h: 4 }
          },
          {
            id: 'widget3',
            type: 'metric',
            title: 'Active Clients',
            config: {
              dataSource: 'clients',
              metrics: ['active_count'],
              refreshInterval: 300,
              showHeader: true,
              color: 'purple',
              size: 'medium'
            },
            layout: { x: 9, y: 0, w: 3, h: 2 }
          },
          {
            id: 'widget4',
            type: 'table',
            title: 'Recent Projects',
            config: {
              dataSource: 'projects',
              refreshInterval: 300,
              showHeader: true
            },
            layout: { x: 0, y: 4, w: 12, h: 3 }
          }
        ],
        isPublic: true,
        createdAt: new Date(Date.now() - 604800000), // 1 week ago
        lastModified: new Date(Date.now() - 86400000), // 1 day ago
        owner: 'admin',
        tags: ['executive', 'overview', 'kpi'],
        backgroundColor: '#f8fafc'
      },
      {
        id: '2',
        name: 'Sales Dashboard',
        description: 'Sales performance and pipeline tracking',
        widgets: [
          {
            id: 'widget5',
            type: 'chart',
            title: 'Sales Pipeline',
            config: {
              chartType: 'bar',
              dataSource: 'deals',
              refreshInterval: 300,
              showHeader: true,
              color: 'green'
            },
            layout: { x: 0, y: 0, w: 8, h: 4 }
          },
          {
            id: 'widget6',
            type: 'metric',
            title: 'Conversion Rate',
            config: {
              dataSource: 'sales',
              metrics: ['conversion_rate'],
              refreshInterval: 600,
              showHeader: true,
              color: 'orange',
              size: 'large'
            },
            layout: { x: 8, y: 0, w: 4, h: 2 }
          },
          {
            id: 'widget7',
            type: 'contacts',
            title: 'Top Prospects',
            config: {
              dataSource: 'prospects',
              refreshInterval: 300,
              showHeader: true,
              color: 'blue'
            },
            layout: { x: 8, y: 2, w: 4, h: 4 }
          }
        ],
        isPublic: false,
        createdAt: new Date(Date.now() - 432000000), // 5 days ago
        lastModified: new Date(Date.now() - 3600000), // 1 hour ago
        owner: 'sales_manager',
        tags: ['sales', 'pipeline', 'prospects'],
        backgroundColor: '#f0fdf4'
      },
      {
        id: '3',
        name: 'Project Management',
        description: 'Track project progress and team productivity',
        widgets: [
          {
            id: 'widget8',
            type: 'calendar',
            title: 'Project Timeline',
            config: {
              dataSource: 'projects',
              refreshInterval: 900,
              showHeader: true,
              color: 'purple'
            },
            layout: { x: 0, y: 0, w: 8, h: 5 }
          },
          {
            id: 'widget9',
            type: 'todo',
            title: 'Urgent Tasks',
            config: {
              dataSource: 'tasks',
              refreshInterval: 300,
              showHeader: true,
              color: 'red'
            },
            layout: { x: 8, y: 0, w: 4, h: 5 }
          },
          {
            id: 'widget10',
            type: 'metric',
            title: 'Team Utilization',
            config: {
              dataSource: 'team',
              metrics: ['utilization'],
              refreshInterval: 3600,
              showHeader: true,
              color: 'indigo',
              size: 'medium'
            },
            layout: { x: 0, y: 5, w: 6, h: 2 }
          }
        ],
        isPublic: false,
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
        lastModified: new Date(Date.now() - 7200000), // 2 hours ago
        owner: 'project_manager',
        tags: ['projects', 'team', 'productivity'],
        backgroundColor: '#faf5ff'
      }
    ];

    setDashboards(mockDashboards);
    setCurrentDashboard(mockDashboards[0]);
  }, []);

  const addWidget = (template: WidgetTemplate) => {
    if (!currentDashboard) return;

    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}`,
      type: template.type,
      title: template.name,
      config: { ...template.defaultConfig },
      layout: { ...template.defaultLayout }
    };

    setCurrentDashboard(prev => prev ? {
      ...prev,
      widgets: [...prev.widgets, newWidget],
      lastModified: new Date()
    } : null);

    setShowWidgetLibrary(false);
  };

  const removeWidget = (widgetId: string) => {
    if (!currentDashboard) return;

    setCurrentDashboard(prev => prev ? {
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId),
      lastModified: new Date()
    } : null);
  };

  const updateWidgetLayout = useCallback((layout: any[]) => {
    if (!currentDashboard) return;

    setCurrentDashboard(prev => prev ? {
      ...prev,
      widgets: prev.widgets.map(widget => {
        const layoutItem = layout.find(l => l.i === widget.id);
        return layoutItem ? {
          ...widget,
          layout: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h
          }
        } : widget;
      }),
      lastModified: new Date()
    } : null);
  }, [currentDashboard]);

  const saveDashboard = () => {
    if (!currentDashboard) return;

    setDashboards(prev => prev.map(d => 
      d.id === currentDashboard.id ? currentDashboard : d
    ));
    setIsEditing(false);
    setViewMode('view');
  };

  const createNewDashboard = () => {
    const newDashboard: Dashboard = {
      id: `dashboard_${Date.now()}`,
      name: 'New Dashboard',
      description: 'Custom dashboard',
      widgets: [],
      isPublic: false,
      createdAt: new Date(),
      lastModified: new Date(),
      owner: 'current_user',
      tags: [],
      backgroundColor: '#ffffff'
    };

    setDashboards(prev => [...prev, newDashboard]);
    setCurrentDashboard(newDashboard);
    setIsEditing(true);
    setViewMode('edit');
  };

  const renderWidget = (widget: DashboardWidget) => {
    const getWidgetIcon = (type: string) => {
      switch (type) {
        case 'metric': return <ChartBarIcon className="w-4 h-4" />;
        case 'chart': return <ChartBarIcon className="w-4 h-4" />;
        case 'table': return <TableCellsIcon className="w-4 h-4" />;
        case 'calendar': return <CalendarIcon className="w-4 h-4" />;
        case 'todo': return <DocumentTextIcon className="w-4 h-4" />;
        case 'clock': return <ClockIcon className="w-4 h-4" />;
        case 'contacts': return <UserIcon className="w-4 h-4" />;
        case 'notes': return <DocumentTextIcon className="w-4 h-4" />;
        default: return <Square3Stack3DIcon className="w-4 h-4" />;
      }
    };

    const getWidgetContent = (widget: DashboardWidget) => {
      switch (widget.type) {
        case 'metric':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-3xl font-bold text-gray-900 mb-2">€45,678</div>
              <div className="text-sm text-green-600 flex items-center gap-1">
                <span>↗</span> +12.5% vs last month
              </div>
            </div>
          );
        case 'chart':
          return (
            <div className="h-full flex items-center justify-center">
              <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-end justify-around p-4">
                {[40, 65, 45, 80, 60, 75, 90].map((height, i) => (
                  <div
                    key={i}
                    className="bg-blue-500 rounded-t"
                    style={{ height: `${height}%`, width: '10px' }}
                  />
                ))}
              </div>
            </div>
          );
        case 'table':
          return (
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Client</th>
                    <th className="text-left p-2">Project</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="p-2">ABC Corp</td><td className="p-2">Website</td><td className="p-2">Active</td></tr>
                  <tr><td className="p-2">XYZ Ltd</td><td className="p-2">App Dev</td><td className="p-2">Review</td></tr>
                  <tr><td className="p-2">Tech Co</td><td className="p-2">SEO</td><td className="p-2">Complete</td></tr>
                </tbody>
              </table>
            </div>
          );
        case 'calendar':
          return (
            <div className="h-full p-2">
              <div className="grid grid-cols-7 gap-1 text-xs">
                <div className="text-center font-medium">Mo</div>
                <div className="text-center font-medium">Tu</div>
                <div className="text-center font-medium">We</div>
                <div className="text-center font-medium">Th</div>
                <div className="text-center font-medium">Fr</div>
                <div className="text-center font-medium">Sa</div>
                <div className="text-center font-medium">Su</div>
                {Array.from({ length: 35 }, (_, i) => (
                  <div key={i} className="aspect-square bg-gray-50 rounded text-center flex items-center justify-center">
                    {i > 4 && i < 30 ? i - 4 : ''}
                  </div>
                ))}
              </div>
            </div>
          );
        case 'todo':
          return (
            <div className="space-y-2 p-2">
              {['Complete project proposal', 'Review client feedback', 'Update website content', 'Schedule team meeting'].map((task, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span className={i === 0 ? 'line-through text-gray-500' : ''}>{task}</span>
                </div>
              ))}
            </div>
          );
        case 'clock':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-2xl font-mono font-bold text-gray-900">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600">Amsterdam</div>
            </div>
          );
        case 'contacts':
          return (
            <div className="space-y-2 p-2">
              {[
                { name: 'John Doe', company: 'ABC Corp', status: 'active' },
                { name: 'Jane Smith', company: 'XYZ Ltd', status: 'prospect' },
                { name: 'Bob Johnson', company: 'Tech Co', status: 'client' }
              ].map((contact, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-gray-500">{contact.company}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        case 'notes':
          return (
            <div className="p-2 h-full">
              <textarea
                className="w-full h-full border-none resize-none focus:outline-none text-sm"
                placeholder="Add your notes here..."
                defaultValue="Remember to follow up with client about project timeline..."
              />
            </div>
          );
        default:
          return (
            <div className="flex items-center justify-center h-full text-gray-500">
              Widget Content
            </div>
          );
      }
    };

    return (
      <div key={widget.id} className="bg-white rounded-lg shadow-sm border overflow-hidden h-full">
        {widget.config.showHeader && (
          <div className="border-b bg-gray-50 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getWidgetIcon(widget.type)}
              <span className="text-sm font-medium text-gray-900">{widget.title}</span>
            </div>
            {viewMode === 'edit' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedWidget(widget)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Cog6ToothIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
        <div className="p-2 h-full">
          {getWidgetContent(widget)}
        </div>
      </div>
    );
  };

  if (!currentDashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Square3Stack3DIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Dashboard Selected</h3>
          <p className="text-gray-600 mb-4">Create a new dashboard or select an existing one</p>
          <button
            onClick={createNewDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Square3Stack3DIcon className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Custom Dashboard Builder</h2>
            <p className="text-gray-600">Create and customize interactive dashboards</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={currentDashboard.id}
            onChange={(e) => {
              const dashboard = dashboards.find(d => d.id === e.target.value);
              if (dashboard) setCurrentDashboard(dashboard);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dashboards.map(dashboard => (
              <option key={dashboard.id} value={dashboard.id}>{dashboard.name}</option>
            ))}
          </select>
          <button
            onClick={createNewDashboard}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Dashboard
          </button>
        </div>
      </div>

      {/* Dashboard Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{currentDashboard.name}</h3>
            <p className="text-gray-600">{currentDashboard.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'edit' ? 'view' : 'edit')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                viewMode === 'edit' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {viewMode === 'edit' ? 'Exit Edit' : 'Edit'}
            </button>
            {viewMode === 'edit' && (
              <>
                <button
                  onClick={() => setShowWidgetLibrary(true)}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Add Widget
                </button>
                <button
                  onClick={saveDashboard}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            {currentDashboard.owner}
          </span>
          <span className="flex items-center gap-1">
            {currentDashboard.isPublic ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
            {currentDashboard.isPublic ? 'Public' : 'Private'}
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            Modified {currentDashboard.lastModified.toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Square3Stack3DIcon className="w-4 h-4" />
            {currentDashboard.widgets.length} widgets
          </span>
        </div>

        {currentDashboard.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <BookmarkIcon className="w-4 h-4 text-gray-400" />
            {currentDashboard.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ResponsiveGridLayout
          className="layout"
          layouts={{
            lg: currentDashboard.widgets.map(w => ({
              i: w.id,
              x: w.layout.x,
              y: w.layout.y,
              w: w.layout.w,
              h: w.layout.h,
              minW: w.layout.minW,
              minH: w.layout.minH,
              maxW: w.layout.maxW,
              maxH: w.layout.maxH
            }))
          }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          onLayoutChange={updateWidgetLayout}
          isDraggable={viewMode === 'edit'}
          isResizable={viewMode === 'edit'}
          margin={[16, 16]}
        >
          {currentDashboard.widgets.map(widget => renderWidget(widget))}
        </ResponsiveGridLayout>

        {currentDashboard.widgets.length === 0 && (
          <div className="text-center py-12">
            <Square3Stack3DIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Widgets Added</h3>
            <p className="text-gray-600 mb-4">Start building your dashboard by adding widgets</p>
            {viewMode === 'edit' && (
              <button
                onClick={() => setShowWidgetLibrary(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Widget
              </button>
            )}
          </div>
        )}
      </div>

      {/* Widget Library Modal */}
      {showWidgetLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Widget Library</h3>
              <button
                onClick={() => setShowWidgetLibrary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgetTemplates.map(template => (
                <div
                  key={template.type}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => addWidget(template)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <template.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {template.defaultLayout.w}x{template.defaultLayout.h} grid
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Add Widget
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Actions */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
        <div className="text-sm text-gray-600">
          Dashboard last saved: {currentDashboard.lastModified.toLocaleString()}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1">
            <ShareIcon className="w-4 h-4" />
            Share
          </button>
          <button className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};