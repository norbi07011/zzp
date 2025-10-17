import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  CogIcon,
  LinkIcon,
  Square3Stack3DIcon,
  ChartBarIcon,
  PhoneIcon,
  CloudIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ERPIntegrationHub } from '../../components/ERPIntegrationHub';
import { CRMIntegrationHub } from '../../components/CRMIntegrationHub';
import { AdvancedWorkflowAutomation } from '../../components/AdvancedWorkflowAutomation';
import { ThirdPartyConnectorsHub } from '../../components/ThirdPartyConnectorsHub';
import { CustomDashboardBuilder } from '../../components/CustomDashboardBuilder';

// DZIEŃ 6 - Enterprise Integration Hub
interface EnterpriseModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'active' | 'inactive' | 'configuring';
  features: string[];
  connectedSystems: number;
  lastActivity: Date;
  component: React.ComponentType;
  category: 'integration' | 'automation' | 'analytics' | 'communication';
}

export const EnterpriseIntegrationPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(true);

  const enterpriseModules: EnterpriseModule[] = [
    {
      id: 'erp',
      name: 'ERP Integration Hub',
      description: 'Connect with Enterprise Resource Planning systems like SAP, Exact Online, Microsoft Dynamics',
      icon: BuildingOfficeIcon,
      status: 'active',
      features: ['Multi-ERP Support', 'Real-time Sync', 'Financial Data', 'HR Integration', 'Inventory Management'],
      connectedSystems: 3,
      lastActivity: new Date(Date.now() - 300000), // 5 minutes ago
      component: ERPIntegrationHub,
      category: 'integration'
    },
    {
      id: 'crm',
      name: 'CRM Integration Hub',
      description: 'Customer Relationship Management with sales pipeline, contacts, and deal tracking',
      icon: PhoneIcon,
      status: 'active',
      features: ['Contact Management', 'Sales Pipeline', 'Deal Tracking', 'Activity Logging', 'Reporting'],
      connectedSystems: 2,
      lastActivity: new Date(Date.now() - 600000), // 10 minutes ago
      component: CRMIntegrationHub,
      category: 'integration'
    },
    {
      id: 'workflow',
      name: 'Advanced Workflow Automation',
      description: 'Intelligent business process automation with triggers, actions, and conditions',
      icon: CogIcon,
      status: 'active',
      features: ['Process Automation', 'Custom Triggers', 'Multi-step Workflows', 'Scheduling', 'Error Handling'],
      connectedSystems: 8,
      lastActivity: new Date(Date.now() - 120000), // 2 minutes ago
      component: AdvancedWorkflowAutomation,
      category: 'automation'
    },
    {
      id: 'connectors',
      name: 'Third-party Connectors Hub',
      description: 'Connect with external services like Stripe, Mailchimp, Slack, Google Drive',
      icon: LinkIcon,
      status: 'active',
      features: ['API Integrations', 'Webhook Support', 'Data Sync', 'Usage Monitoring', 'Error Tracking'],
      connectedSystems: 8,
      lastActivity: new Date(Date.now() - 180000), // 3 minutes ago
      component: ThirdPartyConnectorsHub,
      category: 'integration'
    },
    {
      id: 'dashboard',
      name: 'Custom Dashboard Builder',
      description: 'Create personalized dashboards with drag-and-drop widgets and real-time data',
      icon: Square3Stack3DIcon,
      status: 'active',
      features: ['Drag & Drop', 'Custom Widgets', 'Real-time Data', 'Responsive Design', 'Export/Share'],
      connectedSystems: 0,
      lastActivity: new Date(Date.now() - 900000), // 15 minutes ago
      component: CustomDashboardBuilder,
      category: 'analytics'
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'configuring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'inactive': return <CloudIcon className="w-4 h-4 text-gray-500" />;
      case 'configuring': return <ArrowPathIcon className="w-4 h-4 text-yellow-500 animate-spin" />;
      default: return <CloudIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'integration': return <LinkIcon className="w-5 h-5 text-blue-600" />;
      case 'automation': return <CogIcon className="w-5 h-5 text-purple-600" />;
      case 'analytics': return <ChartBarIcon className="w-5 h-5 text-green-600" />;
      case 'communication': return <PhoneIcon className="w-5 h-5 text-orange-600" />;
      default: return <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const activeModules = enterpriseModules.filter(m => m.status === 'active').length;
  const totalConnections = enterpriseModules.reduce((sum, m) => sum + m.connectedSystems, 0);
  const recentActivity = Math.max(...enterpriseModules.map(m => m.lastActivity.getTime()));

  // Show specific module
  if (activeModule) {
    const module = enterpriseModules.find(m => m.id === activeModule);
    if (module) {
      const ModuleComponent = module.component;
      return (
        <div className="space-y-6">
          {/* Module Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <module.icon className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{module.name}</h1>
                <p className="text-gray-600">{module.description}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveModule(null);
                setShowOverview(true);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Overview
            </button>
          </div>

          {/* Module Component */}
          <ModuleComponent />
        </div>
      );
    }
  }

  // Show overview
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BuildingOfficeIcon className="w-10 h-10 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Integration Hub</h1>
            <p className="text-gray-600">Advanced business integrations and automation platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            DZIEŃ 6 Complete
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Enterprise Ready
          </span>
        </div>
      </div>

      {/* Enterprise Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Active Modules</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{activeModules}</div>
          <div className="text-sm text-blue-600">of {enterpriseModules.length} available</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Total Connections</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalConnections}</div>
          <div className="text-sm text-green-600">integrated systems</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <CogIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Automation Level</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
          <div className="text-sm text-purple-600">processes automated</div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheckIcon className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">System Health</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">99.8%</div>
          <div className="text-sm text-orange-600">uptime last 30 days</div>
        </div>
      </div>

      {/* Enterprise Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enterpriseModules.map(module => (
          <div
            key={module.id}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setActiveModule(module.id);
              setShowOverview(false);
            }}
          >
            {/* Module Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <module.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(module.category)}
                    <span className="text-sm text-gray-600 capitalize">{module.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(module.status)}
                <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(module.status)}`}>
                  {module.status}
                </span>
              </div>
            </div>

            {/* Module Description */}
            <p className="text-gray-600 mb-4">{module.description}</p>

            {/* Module Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{module.connectedSystems}</div>
                <div className="text-xs text-gray-600">Connected Systems</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{module.features.length}</div>
                <div className="text-xs text-gray-600">Key Features</div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-2 mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Key Features:</div>
              <div className="flex flex-wrap gap-1">
                {module.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
                {module.features.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{module.features.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Last Activity */}
            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
              <span>Last activity: {module.lastActivity.toLocaleString()}</span>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Open Module →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveModule('workflow')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <CogIcon className="w-6 h-6 text-purple-600 mb-2" />
            <div className="font-medium text-gray-900">Create Workflow</div>
            <div className="text-sm text-gray-600">Automate business processes</div>
          </button>
          
          <button 
            onClick={() => setActiveModule('connectors')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <LinkIcon className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Add Integration</div>
            <div className="text-sm text-gray-600">Connect external services</div>
          </button>
          
          <button 
            onClick={() => setActiveModule('dashboard')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <Square3Stack3DIcon className="w-6 h-6 text-green-600 mb-2" />
            <div className="font-medium text-gray-900">Build Dashboard</div>
            <div className="text-sm text-gray-600">Create custom analytics</div>
          </button>
          
          <button 
            onClick={() => setActiveModule('crm')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <PhoneIcon className="w-6 h-6 text-orange-600 mb-2" />
            <div className="font-medium text-gray-900">Manage Contacts</div>
            <div className="text-sm text-gray-600">CRM and sales pipeline</div>
          </button>
        </div>
      </div>

      {/* Integration Categories */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['integration', 'automation', 'analytics', 'communication'].map(category => {
            const categoryModules = enterpriseModules.filter(m => m.category === category);
            const activeCount = categoryModules.filter(m => m.status === 'active').length;
            
            return (
              <div key={category} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryIcon(category)}
                  <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{activeCount}</div>
                <div className="text-sm text-gray-600">
                  {activeCount} active of {categoryModules.length} modules
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-blue-600 h-1 rounded-full"
                    style={{ width: `${(activeCount / Math.max(categoryModules.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          {enterpriseModules.map(module => (
            <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <module.icon className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">{module.name}</div>
                  <div className="text-sm text-gray-600">
                    {module.connectedSystems} connections • Last activity: {module.lastActivity.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(module.status)}
                <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(module.status)}`}>
                  {module.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};