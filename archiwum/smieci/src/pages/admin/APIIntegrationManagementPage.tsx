// @ts-nocheck
/**
 * APIIntegrationManagementPage
 * Admin panel for API integrations, webhooks, and automation
 */

import React, { useState } from 'react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  requests: number;
  status: 'active' | 'expired' | 'revoked';
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggered?: string;
  successRate: number;
  totalCalls: number;
}

interface Integration {
  id: string;
  name: string;
  provider: string;
  type: 'payment' | 'email' | 'analytics' | 'crm' | 'storage';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

export const APIIntegrationManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api-keys' | 'webhooks' | 'integrations'>('api-keys');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);

  const apiKeys: APIKey[] = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'pk_live_51H3***************************',
      permissions: ['read:users', 'write:jobs', 'read:analytics'],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      requests: 284392,
      status: 'active'
    },
    {
      id: '2',
      name: 'Mobile App API Key',
      key: 'pk_test_51H3***************************',
      permissions: ['read:users', 'read:jobs', 'write:applications'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      requests: 156892,
      status: 'active'
    },
    {
      id: '3',
      name: 'Legacy Integration',
      key: 'pk_test_41G2***************************',
      permissions: ['read:users'],
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      requests: 45678,
      status: 'revoked'
    }
  ];

  const webhooks: Webhook[] = [
    {
      id: '1',
      url: 'https://api.partner.com/webhooks/job-created',
      events: ['job.created', 'job.updated'],
      status: 'active',
      lastTriggered: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      successRate: 98.5,
      totalCalls: 12847
    },
    {
      id: '2',
      url: 'https://analytics.service.com/events',
      events: ['user.signup', 'user.login', 'payment.completed'],
      status: 'active',
      lastTriggered: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      successRate: 99.2,
      totalCalls: 34521
    },
    {
      id: '3',
      url: 'https://old-system.example.com/webhook',
      events: ['certificate.issued'],
      status: 'error',
      lastTriggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      successRate: 45.3,
      totalCalls: 892
    }
  ];

  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Stripe Payments',
      provider: 'Stripe',
      type: 'payment',
      status: 'connected',
      lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'SendGrid Email',
      provider: 'SendGrid',
      type: 'email',
      status: 'connected',
      lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Google Analytics',
      provider: 'Google',
      type: 'analytics',
      status: 'connected',
      lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      name: 'Supabase Storage',
      provider: 'Supabase',
      type: 'storage',
      status: 'connected',
      lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      name: 'HubSpot CRM',
      provider: 'HubSpot',
      type: 'crm',
      status: 'disconnected'
    }
  ];

  const availableEvents = [
    'user.signup', 'user.login', 'user.logout',
    'job.created', 'job.updated', 'job.deleted',
    'application.submitted', 'application.approved',
    'payment.completed', 'payment.failed',
    'certificate.issued', 'certificate.verified'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
      case 'revoked':
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💳';
      case 'email': return '📧';
      case 'analytics': return '📊';
      case 'crm': return '👥';
      case 'storage': return '💾';
      default: return '🔌';
    }
  };

  const handleRevokeKey = (keyId: string) => {
    if (confirm('Revoke this API key? This action cannot be undone.')) {
      alert(`API key ${keyId} revoked`);
    }
  };

  const handleTestWebhook = (webhookId: string) => {
    alert(`Testing webhook ${webhookId}...`);
  };

  const handleDeleteWebhook = (webhookId: string) => {
    if (confirm('Delete this webhook?')) {
      alert(`Webhook ${webhookId} deleted`);
    }
  };

  const handleConnectIntegration = (integrationId: string) => {
    alert(`Connecting integration ${integrationId}...`);
  };

  const handleSyncIntegration = (integrationId: string) => {
    alert(`Syncing integration ${integrationId}...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔌 API & Integrations</h1>
          <p className="text-gray-600">Manage API keys, webhooks, and third-party integrations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active API Keys</h3>
            <p className="text-3xl font-bold text-gray-900">
              {apiKeys.filter(k => k.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">API Requests (24h)</h3>
            <p className="text-3xl font-bold text-green-600">284k</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Webhooks</h3>
            <p className="text-3xl font-bold text-blue-600">
              {webhooks.filter(w => w.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Integrations</h3>
            <p className="text-3xl font-bold text-purple-600">
              {integrations.filter(i => i.status === 'connected').length}/{integrations.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`pb-2 px-4 ${activeTab === 'api-keys' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`pb-2 px-4 ${activeTab === 'webhooks' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Webhooks
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`pb-2 px-4 ${activeTab === 'integrations' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Integrations
          </button>
        </div>

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowKeyModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Create API Key
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiKeys.map(key => (
                    <tr key={key.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{key.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{key.key}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.slice(0, 2).map(perm => (
                            <span key={perm} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {perm}
                            </span>
                          ))}
                          {key.permissions.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{key.permissions.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {key.requests.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {key.lastUsed 
                          ? new Date(key.lastUsed).toLocaleDateString('nl-NL')
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(key.status)}`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {key.status === 'active' && (
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowWebhookModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Webhook
              </button>
            </div>

            <div className="space-y-4">
              {webhooks.map(webhook => (
                <div key={webhook.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-sm bg-gray-100 px-3 py-1 rounded">{webhook.url}</code>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(webhook.status)}`}>
                          {webhook.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {webhook.events.map(event => (
                          <span key={event} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestWebhook(webhook.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <span className={`ml-2 font-medium ${webhook.successRate > 90 ? 'text-green-600' : 'text-red-600'}`}>
                        {webhook.successRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Calls:</span>
                      <span className="ml-2 font-medium text-gray-900">{webhook.totalCalls.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Triggered:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {webhook.lastTriggered 
                          ? new Date(webhook.lastTriggered).toLocaleString('nl-NL')
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-2 gap-6">
            {integrations.map(integration => (
              <div key={integration.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getTypeIcon(integration.type)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-500">{integration.provider}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                </div>
                
                {integration.lastSync && (
                  <p className="text-sm text-gray-500 mb-4">
                    Last synced: {new Date(integration.lastSync).toLocaleString('nl-NL')}
                  </p>
                )}

                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <button
                        onClick={() => handleSyncIntegration(integration.id)}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        Sync Now
                      </button>
                      <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnectIntegration(integration.id)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default APIIntegrationManagementPage;
