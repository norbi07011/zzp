import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ChartBarIcon,
  CloudIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

// ERP Integration Hub - Enterprise Resource Planning Systems
interface ERPSystem {
  id: string;
  name: string;
  type: 'accounting' | 'crm' | 'hr' | 'inventory' | 'project';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: Date;
  apiEndpoint: string;
  credentials: {
    type: 'oauth' | 'apikey' | 'basic';
    status: 'valid' | 'expired' | 'invalid';
  };
  syncData: {
    invoices: number;
    customers: number;
    products: number;
    projects: number;
  };
  configuration: {
    autoSync: boolean;
    syncInterval: number; // minutes
    dataMapping: Record<string, string>;
  };
}

interface SyncLog {
  id: string;
  systemId: string;
  timestamp: Date;
  type: 'full' | 'incremental' | 'manual';
  status: 'success' | 'error' | 'warning';
  recordsProcessed: number;
  message: string;
  duration: number; // seconds
}

export const ERPIntegrationHub: React.FC = () => {
  const [systems, setSystems] = useState<ERPSystem[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'systems' | 'sync' | 'settings'>('overview');
  const [syncingSystem, setSyncingSystem] = useState<string | null>(null);

  useEffect(() => {
    // Mock ERP systems data
    const mockSystems: ERPSystem[] = [
      {
        id: '1',
        name: 'Exact Online',
        type: 'accounting',
        provider: 'Exact',
        status: 'connected',
        lastSync: new Date(Date.now() - 1800000), // 30 min ago
        apiEndpoint: 'https://start.exactonline.nl/api/v1',
        credentials: { type: 'oauth', status: 'valid' },
        syncData: { invoices: 1247, customers: 589, products: 234, projects: 45 },
        configuration: {
          autoSync: true,
          syncInterval: 30,
          dataMapping: {
            'customer_name': 'company_name',
            'invoice_date': 'created_at',
            'amount': 'total_amount'
          }
        }
      },
      {
        id: '2',
        name: 'SAP Business One',
        type: 'accounting',
        provider: 'SAP',
        status: 'connected',
        lastSync: new Date(Date.now() - 3600000), // 1 hour ago
        apiEndpoint: 'https://api.sap.com/businessone',
        credentials: { type: 'apikey', status: 'valid' },
        syncData: { invoices: 2156, customers: 892, products: 567, projects: 123 },
        configuration: {
          autoSync: true,
          syncInterval: 60,
          dataMapping: {
            'CardName': 'company_name',
            'DocDate': 'invoice_date',
            'DocTotal': 'amount'
          }
        }
      },
      {
        id: '3',
        name: 'Microsoft Dynamics 365',
        type: 'crm',
        provider: 'Microsoft',
        status: 'syncing',
        lastSync: new Date(Date.now() - 300000), // 5 min ago
        apiEndpoint: 'https://api.businesscentral.dynamics.com',
        credentials: { type: 'oauth', status: 'valid' },
        syncData: { invoices: 892, customers: 1245, products: 345, projects: 67 },
        configuration: {
          autoSync: true,
          syncInterval: 15,
          dataMapping: {
            'name': 'company_name',
            'createdon': 'created_at',
            'revenue': 'annual_revenue'
          }
        }
      },
      {
        id: '4',
        name: 'AFAS Profit',
        type: 'hr',
        provider: 'AFAS Software',
        status: 'error',
        lastSync: new Date(Date.now() - 7200000), // 2 hours ago
        apiEndpoint: 'https://api.afas.nl/profit',
        credentials: { type: 'apikey', status: 'expired' },
        syncData: { invoices: 0, customers: 234, products: 0, projects: 89 },
        configuration: {
          autoSync: false,
          syncInterval: 240,
          dataMapping: {
            'medewerker': 'employee_name',
            'functie': 'job_title',
            'afdeling': 'department'
          }
        }
      },
      {
        id: '5',
        name: 'Visma.net',
        type: 'accounting',
        provider: 'Visma',
        status: 'disconnected',
        lastSync: new Date(Date.now() - 86400000), // 1 day ago
        apiEndpoint: 'https://api.visma.net',
        credentials: { type: 'oauth', status: 'invalid' },
        syncData: { invoices: 567, customers: 234, products: 123, projects: 23 },
        configuration: {
          autoSync: false,
          syncInterval: 120,
          dataMapping: {}
        }
      }
    ];

    // Mock sync logs
    const mockLogs: SyncLog[] = [
      {
        id: '1',
        systemId: '1',
        timestamp: new Date(Date.now() - 1800000),
        type: 'incremental',
        status: 'success',
        recordsProcessed: 23,
        message: 'Successfully synchronized 23 new invoices',
        duration: 45
      },
      {
        id: '2',
        systemId: '2',
        timestamp: new Date(Date.now() - 3600000),
        type: 'full',
        status: 'success',
        recordsProcessed: 2156,
        message: 'Full synchronization completed',
        duration: 287
      },
      {
        id: '3',
        systemId: '4',
        timestamp: new Date(Date.now() - 7200000),
        type: 'manual',
        status: 'error',
        recordsProcessed: 0,
        message: 'Authentication failed: API key expired',
        duration: 5
      },
      {
        id: '4',
        systemId: '3',
        timestamp: new Date(Date.now() - 300000),
        type: 'incremental',
        status: 'warning',
        recordsProcessed: 45,
        message: 'Synchronized with 3 data conflicts resolved',
        duration: 67
      }
    ];

    setSystems(mockSystems);
    setSyncLogs(mockLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'syncing':
        return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'disconnected':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'disconnected': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accounting':
        return <CurrencyEuroIcon className="w-5 h-5 text-green-600" />;
      case 'crm':
        return <UserIcon className="w-5 h-5 text-blue-600" />;
      case 'hr':
        return <UserIcon className="w-5 h-5 text-purple-600" />;
      case 'inventory':
        return <DocumentTextIcon className="w-5 h-5 text-orange-600" />;
      case 'project':
        return <CalendarIcon className="w-5 h-5 text-indigo-600" />;
      default:
        return <CogIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const syncSystem = async (systemId: string) => {
    setSyncingSystem(systemId);
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update system status
    setSystems(prev => prev.map(system => 
      system.id === systemId 
        ? { ...system, status: 'connected', lastSync: new Date() }
        : system
    ));

    // Add sync log
    const newLog: SyncLog = {
      id: Date.now().toString(),
      systemId,
      timestamp: new Date(),
      type: 'manual',
      status: 'success',
      recordsProcessed: Math.floor(Math.random() * 100) + 1,
      message: 'Manual synchronization completed successfully',
      duration: 3
    };

    setSyncLogs(prev => [newLog, ...prev.slice(0, 9)]);
    setSyncingSystem(null);
  };

  const disconnectSystem = (systemId: string) => {
    setSystems(prev => prev.map(system => 
      system.id === systemId 
        ? { ...system, status: 'disconnected' }
        : system
    ));
  };

  const connectedSystems = systems.filter(s => s.status === 'connected' || s.status === 'syncing');
  const totalRecords = systems.reduce((sum, s) => sum + s.syncData.invoices + s.syncData.customers + s.syncData.products + s.syncData.projects, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ERP Integration Hub</h2>
            <p className="text-gray-600">Enterprise Resource Planning system integrations</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <CloudIcon className="w-4 h-4" />
            Add Integration
          </button>
          <button 
            onClick={() => {
              connectedSystems.forEach(system => {
                if (system.status === 'connected') {
                  syncSystem(system.id);
                }
              });
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Sync All
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Connected Systems</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{connectedSystems.length}</div>
          <div className="text-sm text-blue-600">of {systems.length} configured</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <DocumentTextIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Total Records</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalRecords.toLocaleString()}</div>
          <div className="text-sm text-green-600">synchronized</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Last Sync</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {Math.min(...connectedSystems.map(s => (Date.now() - s.lastSync.getTime()) / 60000))}m
          </div>
          <div className="text-sm text-purple-600">ago</div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Sync Success</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {((syncLogs.filter(l => l.status === 'success').length / syncLogs.length) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-orange-600">success rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'systems', label: 'Systems', icon: BuildingOfficeIcon },
            { id: 'sync', label: 'Sync Logs', icon: ClockIcon },
            { id: 'settings', label: 'Settings', icon: CogIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status Overview</h3>
              <div className="space-y-4">
                {systems.map(system => (
                  <div key={system.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(system.type)}
                      <div>
                        <div className="font-medium text-gray-900">{system.name}</div>
                        <div className="text-sm text-gray-600">{system.provider}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(system.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(system.status)}`}>
                        {system.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sync Activity</h3>
              <div className="space-y-3">
                {syncLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                      {log.status === 'error' && <XCircleIcon className="w-4 h-4 text-red-500" />}
                      {log.status === 'warning' && <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {systems.find(s => s.id === log.systemId)?.name}
                        </div>
                        <div className="text-xs text-gray-600">{log.message}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Systems Tab */}
      {activeTab === 'systems' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {systems.map(system => (
                  <tr key={system.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(system.type)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{system.name}</div>
                          <div className="text-xs text-gray-500">{system.provider}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 capitalize">
                        {system.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(system.status)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(system.status)}`}>
                          {system.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {system.lastSync.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(system.syncData.invoices + system.syncData.customers + system.syncData.products + system.syncData.projects).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => syncSystem(system.id)}
                        disabled={syncingSystem === system.id || system.status === 'disconnected'}
                        className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      >
                        {syncingSystem === system.id ? 'Syncing...' : 'Sync'}
                      </button>
                      <button
                        onClick={() => disconnectSystem(system.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Disconnect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sync Logs Tab */}
      {activeTab === 'sync' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Synchronization Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {syncLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {systems.find(s => s.id === log.systemId)?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 capitalize">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                        {log.status === 'error' && <XCircleIcon className="w-4 h-4 text-red-500" />}
                        {log.status === 'warning' && <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === 'success' ? 'bg-green-100 text-green-800' :
                          log.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.recordsProcessed.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.duration}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {log.message}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Integration Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Sync Interval</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                  <option value="240">Every 4 hours</option>
                  <option value="1440">Daily</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Error Notification</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Email notifications for sync errors</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">SMS alerts for critical failures</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="ml-2 text-sm text-gray-700">Slack notifications</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">6 months</option>
                  <option value="365">1 year</option>
                  <option value="0">Forever</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Settings
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};