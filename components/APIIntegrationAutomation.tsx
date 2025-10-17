import React, { useState, useEffect } from 'react';
import {
  CloudIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import axios, { AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

// API Integration & Automation Component - Task 4.4 Enterprise Integration
interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  authentication: {
    type: 'none' | 'bearer' | 'apikey' | 'basic' | 'oauth';
    credentials: Record<string, string>;
  };
  description: string;
  category: 'payment' | 'communication' | 'analytics' | 'storage' | 'ai' | 'other';
  status: 'active' | 'inactive' | 'error' | 'testing';
  lastUsed: Date;
  responseTime: number;
  successRate: number;
  errorCount: number;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'webhook' | 'schedule' | 'event' | 'manual';
    config: Record<string, any>;
  };
  steps: Array<{
    id: string;
    type: 'api' | 'email' | 'sms' | 'webhook' | 'delay' | 'condition';
    config: Record<string, any>;
    endpoint?: string;
  }>;
  status: 'active' | 'paused' | 'error';
  lastRun: Date | null;
  successCount: number;
  errorCount: number;
  averageRunTime: number;
}

interface APILog {
  id: string;
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  error?: string;
  payload?: any;
  response?: any;
}

export const APIIntegrationAutomation: React.FC = () => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [logs, setLogs] = useState<APILog[]>([]);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'workflows' | 'logs' | 'monitoring'>('endpoints');
  const [isTestingAPI, setIsTestingAPI] = useState<string | null>(null);
  const [newEndpoint, setNewEndpoint] = useState<Partial<APIEndpoint>>({
    name: '',
    url: '',
    method: 'GET',
    headers: {},
    authentication: { type: 'none', credentials: {} },
    category: 'other'
  });
  const [showNewEndpointForm, setShowNewEndpointForm] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(false);

  // Configure axios with retry logic
  const apiClient = axios.create({
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  axiosRetry(apiClient, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
    }
  });

  useEffect(() => {
    // Sample API endpoints
    const sampleEndpoints: APIEndpoint[] = [
      {
        id: '1',
        name: 'Stripe Payment Processing',
        url: 'https://api.stripe.com/v1/charges',
        method: 'POST',
        headers: { 'Authorization': 'Bearer sk_test_...' },
        authentication: { type: 'bearer', credentials: { token: 'sk_test_...' } },
        description: 'Process credit card payments through Stripe',
        category: 'payment',
        status: 'active',
        lastUsed: new Date(Date.now() - 3600000),
        responseTime: 245,
        successRate: 98.5,
        errorCount: 3
      },
      {
        id: '2',
        name: 'SendGrid Email API',
        url: 'https://api.sendgrid.com/v3/mail/send',
        method: 'POST',
        headers: { 'Authorization': 'Bearer SG.xxx' },
        authentication: { type: 'bearer', credentials: { token: 'SG.xxx' } },
        description: 'Send transactional emails via SendGrid',
        category: 'communication',
        status: 'active',
        lastUsed: new Date(Date.now() - 1800000),
        responseTime: 156,
        successRate: 99.2,
        errorCount: 1
      },
      {
        id: '3',
        name: 'Google Analytics Reporting',
        url: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
        method: 'POST',
        headers: { 'Authorization': 'Bearer ya29.xxx' },
        authentication: { type: 'oauth', credentials: { access_token: 'ya29.xxx' } },
        description: 'Fetch analytics data from Google Analytics',
        category: 'analytics',
        status: 'active',
        lastUsed: new Date(Date.now() - 7200000),
        responseTime: 890,
        successRate: 97.8,
        errorCount: 5
      },
      {
        id: '4',
        name: 'Twilio SMS Service',
        url: 'https://api.twilio.com/2010-04-01/Accounts/ACxxx/Messages.json',
        method: 'POST',
        headers: {},
        authentication: { type: 'basic', credentials: { username: 'ACxxx', password: 'xxx' } },
        description: 'Send SMS notifications via Twilio',
        category: 'communication',
        status: 'active',
        lastUsed: new Date(Date.now() - 5400000),
        responseTime: 678,
        successRate: 96.7,
        errorCount: 8
      },
      {
        id: '5',
        name: 'OpenAI GPT API',
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: { 'Authorization': 'Bearer sk-xxx' },
        authentication: { type: 'bearer', credentials: { token: 'sk-xxx' } },
        description: 'AI text generation and processing',
        category: 'ai',
        status: 'testing',
        lastUsed: new Date(Date.now() - 900000),
        responseTime: 1234,
        successRate: 94.5,
        errorCount: 12
      }
    ];

    // Sample automation workflows
    const sampleWorkflows: AutomationWorkflow[] = [
      {
        id: '1',
        name: 'New User Welcome Flow',
        description: 'Send welcome email and SMS when a new user registers',
        trigger: { type: 'webhook', config: { endpoint: '/webhooks/new-user' } },
        steps: [
          { id: '1', type: 'email', config: { template: 'welcome', delay: 0 } },
          { id: '2', type: 'delay', config: { duration: 3600 } },
          { id: '3', type: 'sms', config: { template: 'welcome-sms' } }
        ],
        status: 'active',
        lastRun: new Date(Date.now() - 1800000),
        successCount: 247,
        errorCount: 3,
        averageRunTime: 2.3
      },
      {
        id: '2',
        name: 'Payment Failed Recovery',
        description: 'Handle failed payments with email notifications and retry logic',
        trigger: { type: 'event', config: { event: 'payment.failed' } },
        steps: [
          { id: '1', type: 'email', config: { template: 'payment-failed' } },
          { id: '2', type: 'delay', config: { duration: 86400 } },
          { id: '3', type: 'api', config: { endpoint: 'retry-payment' } },
          { id: '4', type: 'condition', config: { if: 'payment.success', then: 'email-success', else: 'email-final-notice' } }
        ],
        status: 'active',
        lastRun: new Date(Date.now() - 7200000),
        successCount: 89,
        errorCount: 7,
        averageRunTime: 1.8
      },
      {
        id: '3',
        name: 'Weekly Analytics Report',
        description: 'Generate and send weekly analytics reports to stakeholders',
        trigger: { type: 'schedule', config: { cron: '0 9 * * 1' } },
        steps: [
          { id: '1', type: 'api', config: { endpoint: 'google-analytics' } },
          { id: '2', type: 'api', config: { endpoint: 'stripe-analytics' } },
          { id: '3', type: 'email', config: { template: 'weekly-report', recipients: ['team@company.com'] } }
        ],
        status: 'active',
        lastRun: new Date(Date.now() - 518400000),
        successCount: 52,
        errorCount: 1,
        averageRunTime: 12.7
      }
    ];

    // Sample API logs
    const sampleLogs: APILog[] = Array.from({ length: 50 }, (_, i) => ({
      id: i.toString(),
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      endpoint: sampleEndpoints[Math.floor(Math.random() * sampleEndpoints.length)].name,
      method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
      statusCode: Math.random() > 0.1 ? 200 : Math.random() > 0.5 ? 400 : 500,
      responseTime: Math.floor(Math.random() * 2000 + 100),
      success: Math.random() > 0.1,
      error: Math.random() > 0.9 ? 'Connection timeout' : undefined
    }));

    setEndpoints(sampleEndpoints);
    setWorkflows(sampleWorkflows);
    setLogs(sampleLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

    // Real-time monitoring simulation
    let interval: NodeJS.Timeout;
    if (realTimeMonitoring) {
      interval = setInterval(() => {
        const newLog: APILog = {
          id: Date.now().toString(),
          timestamp: new Date(),
          endpoint: sampleEndpoints[Math.floor(Math.random() * sampleEndpoints.length)].name,
          method: ['GET', 'POST', 'PUT'][Math.floor(Math.random() * 3)],
          statusCode: Math.random() > 0.15 ? 200 : 400,
          responseTime: Math.floor(Math.random() * 1000 + 100),
          success: Math.random() > 0.15
        };
        
        setLogs(prev => [newLog, ...prev.slice(0, 49)]);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeMonitoring]);

  const testAPIEndpoint = async (endpoint: APIEndpoint) => {
    setIsTestingAPI(endpoint.id);
    
    try {
      const config: AxiosRequestConfig = {
        method: endpoint.method,
        url: endpoint.url,
        headers: endpoint.headers
      };

      // Add authentication
      if (endpoint.authentication.type === 'bearer') {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${endpoint.authentication.credentials.token}`
        };
      } else if (endpoint.authentication.type === 'apikey') {
        config.headers = {
          ...config.headers,
          'X-API-Key': endpoint.authentication.credentials.apikey
        };
      }

      const startTime = Date.now();
      const response = await apiClient(config);
      const responseTime = Date.now() - startTime;

      const log: APILog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        endpoint: endpoint.name,
        method: endpoint.method,
        statusCode: response.status,
        responseTime,
        success: true,
        response: response.data
      };

      setLogs(prev => [log, ...prev.slice(0, 49)]);
      
      // Update endpoint stats
      setEndpoints(prev => prev.map(ep => 
        ep.id === endpoint.id 
          ? { 
              ...ep, 
              lastUsed: new Date(), 
              responseTime,
              successRate: Math.min(100, ep.successRate + 0.1)
            }
          : ep
      ));

    } catch (error: any) {
      const log: APILog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        endpoint: endpoint.name,
        method: endpoint.method,
        statusCode: error.response?.status || 0,
        responseTime: Date.now() - Date.now(),
        success: false,
        error: error.message
      };

      setLogs(prev => [log, ...prev.slice(0, 49)]);
      
      // Update endpoint error count
      setEndpoints(prev => prev.map(ep => 
        ep.id === endpoint.id 
          ? { ...ep, errorCount: ep.errorCount + 1, status: 'error' as const }
          : ep
      ));
    } finally {
      setIsTestingAPI(null);
    }
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflowId 
        ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' }
        : wf
    ));
  };

  const runWorkflow = async (workflow: AutomationWorkflow) => {
    // Simulate workflow execution
    const startTime = Date.now();
    
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflow.id 
        ? { ...wf, lastRun: new Date() }
        : wf
    ));

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const runTime = (Date.now() - startTime) / 1000;
    const success = Math.random() > 0.1; // 90% success rate
    
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflow.id 
        ? { 
            ...wf,
            successCount: success ? wf.successCount + 1 : wf.successCount,
            errorCount: success ? wf.errorCount : wf.errorCount + 1,
            averageRunTime: (wf.averageRunTime + runTime) / 2
          }
        : wf
    ));
  };

  const addNewEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.url) return;

    const endpoint: APIEndpoint = {
      id: Date.now().toString(),
      name: newEndpoint.name,
      url: newEndpoint.url,
      method: newEndpoint.method || 'GET',
      headers: newEndpoint.headers || {},
      authentication: newEndpoint.authentication || { type: 'none', credentials: {} },
      description: newEndpoint.description || '',
      category: newEndpoint.category || 'other',
      status: 'testing',
      lastUsed: new Date(),
      responseTime: 0,
      successRate: 100,
      errorCount: 0
    };

    setEndpoints(prev => [...prev, endpoint]);
    setNewEndpoint({
      name: '',
      url: '',
      method: 'GET',
      headers: {},
      authentication: { type: 'none', credentials: {} },
      category: 'other'
    });
    setShowNewEndpointForm(false);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return <CreditCardIcon className="w-5 h-5" />;
      case 'communication': return <EnvelopeIcon className="w-5 h-5" />;
      case 'analytics': return <ChartBarIcon className="w-5 h-5" />;
      case 'ai': return <BoltIcon className="w-5 h-5" />;
      default: return <GlobeAltIcon className="w-5 h-5" />;
    }
  };

  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CloudIcon className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">API Integration & Automation</h2>
            <p className="text-gray-600">Enterprise-grade API management and workflow automation</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRealTimeMonitoring(!realTimeMonitoring)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              realTimeMonitoring 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${realTimeMonitoring ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></div>
            Real-time Monitoring
          </button>
          <button
            onClick={() => setShowNewEndpointForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <CloudIcon className="w-4 h-4" />
            Add Endpoint
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <CloudIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Active Endpoints</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {endpoints.filter(e => e.status === 'active').length}
          </div>
          <div className="text-sm text-blue-600">of {endpoints.length} total</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <CogIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Running Workflows</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {workflows.filter(w => w.status === 'active').length}
          </div>
          <div className="text-sm text-green-600">automated processes</div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">Avg Response Time</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {Math.round(endpoints.reduce((sum, e) => sum + e.responseTime, 0) / endpoints.length)}ms
          </div>
          <div className="text-sm text-yellow-600">across all APIs</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Success Rate</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {(endpoints.reduce((sum, e) => sum + e.successRate, 0) / endpoints.length).toFixed(1)}%
          </div>
          <div className="text-sm text-purple-600">overall reliability</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: 'endpoints', label: 'API Endpoints', icon: CloudIcon },
            { id: 'workflows', label: 'Automation Workflows', icon: CogIcon },
            { id: 'logs', label: 'Activity Logs', icon: DocumentTextIcon },
            { id: 'monitoring', label: 'Monitoring', icon: ChartBarIcon }
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

      {/* New Endpoint Form */}
      {showNewEndpointForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New API Endpoint</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newEndpoint.name || ''}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="API endpoint name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select
                    value={newEndpoint.method || 'GET'}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, method: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={newEndpoint.url || ''}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://api.example.com/endpoint"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newEndpoint.category || 'other'}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="payment">Payment</option>
                  <option value="communication">Communication</option>
                  <option value="analytics">Analytics</option>
                  <option value="storage">Storage</option>
                  <option value="ai">AI/ML</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEndpoint.description || ''}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the API endpoint"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewEndpointForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addNewEndpoint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Endpoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {endpoints.map(endpoint => (
                  <tr key={endpoint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-600">
                          {getCategoryIcon(endpoint.category)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{endpoint.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getStatusColor(endpoint.status)}`}>
                        {endpoint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {endpoint.responseTime}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{endpoint.successRate.toFixed(1)}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${endpoint.successRate >= 95 ? 'bg-green-500' : endpoint.successRate >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${endpoint.successRate}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {endpoint.lastUsed.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => testAPIEndpoint(endpoint)}
                        disabled={isTestingAPI === endpoint.id}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                      >
                        {isTestingAPI === endpoint.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Testing...
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-3 h-3" />
                            Test
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          {workflows.map(workflow => (
            <div key={workflow.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{workflow.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Success Rate</div>
                      <div className="font-medium">
                        {workflow.successCount + workflow.errorCount > 0 
                          ? ((workflow.successCount / (workflow.successCount + workflow.errorCount)) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Total Runs</div>
                      <div className="font-medium">{workflow.successCount + workflow.errorCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Avg Runtime</div>
                      <div className="font-medium">{workflow.averageRunTime.toFixed(1)}s</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Last Run</div>
                      <div className="font-medium">
                        {workflow.lastRun ? workflow.lastRun.toLocaleString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleWorkflow(workflow.id)}
                    className={`px-3 py-1 rounded text-sm transition-colors flex items-center gap-1 ${
                      workflow.status === 'active'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {workflow.status === 'active' ? <PauseIcon className="w-3 h-3" /> : <PlayIcon className="w-3 h-3" />}
                    {workflow.status === 'active' ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={() => runWorkflow(workflow)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <BoltIcon className="w-3 h-3" />
                    Run Now
                  </button>
                </div>
              </div>
              
              {/* Workflow Steps */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Workflow Steps</h4>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {workflow.steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <div className="flex-shrink-0 text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                          step.type === 'api' ? 'bg-blue-500' :
                          step.type === 'email' ? 'bg-green-500' :
                          step.type === 'sms' ? 'bg-purple-500' :
                          step.type === 'delay' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}>
                          {step.type === 'api' && <CloudIcon className="w-4 h-4" />}
                          {step.type === 'email' && <EnvelopeIcon className="w-4 h-4" />}
                          {step.type === 'sms' && <DevicePhoneMobileIcon className="w-4 h-4" />}
                          {step.type === 'delay' && <ClockIcon className="w-4 h-4" />}
                          {step.type === 'condition' && <BoltIcon className="w-4 h-4" />}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 capitalize">{step.type}</div>
                      </div>
                      {index < workflow.steps.length - 1 && (
                        <div className="flex-shrink-0 w-8 h-px bg-gray-300"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">API Activity Logs</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${realTimeMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                {realTimeMonitoring ? 'Live monitoring active' : 'Live monitoring disabled'}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.slice(0, 20).map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.endpoint}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getMethodColor(log.method)}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        log.statusCode >= 200 && log.statusCode < 300 ? 'bg-green-100 text-green-800' :
                        log.statusCode >= 400 && log.statusCode < 500 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.responseTime}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.success ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Real-time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Volume</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {logs.filter(log => log.timestamp > new Date(Date.now() - 3600000)).length}
              </div>
              <div className="text-sm text-gray-600">requests in last hour</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Rate</h3>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {((logs.filter(log => !log.success).length / logs.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">overall error rate</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg Response Time</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length)}ms
              </div>
              <div className="text-sm text-gray-600">across all endpoints</div>
            </div>
          </div>

          {/* Endpoint Health */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Endpoint Health Overview</h3>
            <div className="space-y-4">
              {endpoints.map(endpoint => (
                <div key={endpoint.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      endpoint.status === 'active' && endpoint.successRate > 95 ? 'bg-green-500' :
                      endpoint.status === 'active' && endpoint.successRate > 85 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{endpoint.name}</div>
                      <div className="text-sm text-gray-600">{endpoint.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{endpoint.successRate.toFixed(1)}%</div>
                      <div className="text-gray-600">Success</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{endpoint.responseTime}ms</div>
                      <div className="text-gray-600">Response</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{endpoint.errorCount}</div>
                      <div className="text-gray-600">Errors</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};