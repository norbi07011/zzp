import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
  LinkIcon,
  BellIcon,
  ChartBarIcon,
  ServerIcon,
  CloudIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  FingerPrintIcon,
  IdentificationIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  status: 'active' | 'expired' | 'revoked' | 'suspended';
  createdAt: Date;
  lastUsed: Date | null;
  expiresAt: Date | null;
  usageCount: number;
  rateLimit: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
    current: number;
  };
  ipWhitelist: string[];
  environment: 'development' | 'staging' | 'production';
}

interface AuthMethod {
  id: string;
  type: 'api_key' | 'oauth2' | 'jwt' | 'basic' | 'bearer' | 'webhook_signature';
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'configured' | 'pending';
  configuration: Record<string, any>;
  security_level: 'low' | 'medium' | 'high' | 'critical';
  services: string[];
  lastUpdated: Date;
}

interface SecurityEvent {
  id: string;
  type: 'authentication_failure' | 'rate_limit_exceeded' | 'unauthorized_access' | 'key_compromised' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  sourceIp: string;
  userAgent: string;
  apiKey?: string;
  resolved: boolean;
  details: Record<string, any>;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details: Record<string, any>;
}

const APISecurityManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'keys' | 'auth' | 'security' | 'audit' | 'monitoring'>('keys');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showKeyValue, setShowKeyValue] = useState<Record<string, boolean>>({});
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Mock data initialization
  useEffect(() => {
    const mockApiKeys: APIKey[] = [
      {
        id: 'key-1',
        name: 'Production Frontend API',
        keyPrefix: 'pk_live_****',
        permissions: ['read:users', 'write:orders', 'read:analytics'],
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 30),
        lastUsed: new Date(Date.now() - 3600000),
        expiresAt: new Date(Date.now() + 86400000 * 90),
        usageCount: 15678,
        rateLimit: { requests: 1000, period: 'hour', current: 245 },
        ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        environment: 'production'
      },
      {
        id: 'key-2',
        name: 'Mobile App API',
        keyPrefix: 'sk_live_****',
        permissions: ['read:users', 'write:sessions', 'read:content'],
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 15),
        lastUsed: new Date(Date.now() - 1800000),
        expiresAt: new Date(Date.now() + 86400000 * 60),
        usageCount: 8234,
        rateLimit: { requests: 500, period: 'hour', current: 67 },
        ipWhitelist: [],
        environment: 'production'
      },
      {
        id: 'key-3',
        name: 'Webhook Service',
        keyPrefix: 'wh_****',
        permissions: ['write:webhooks', 'read:events'],
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 7),
        lastUsed: new Date(Date.now() - 300000),
        expiresAt: null,
        usageCount: 1245,
        rateLimit: { requests: 100, period: 'minute', current: 12 },
        ipWhitelist: ['34.125.78.0/24'],
        environment: 'production'
      },
      {
        id: 'key-4',
        name: 'Development Testing',
        keyPrefix: 'sk_test_****',
        permissions: ['read:*', 'write:*'],
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 2),
        lastUsed: new Date(Date.now() - 7200000),
        expiresAt: new Date(Date.now() + 86400000 * 30),
        usageCount: 456,
        rateLimit: { requests: 200, period: 'hour', current: 23 },
        ipWhitelist: [],
        environment: 'development'
      },
      {
        id: 'key-5',
        name: 'Legacy Integration',
        keyPrefix: 'leg_****',
        permissions: ['read:legacy_data'],
        status: 'expired',
        createdAt: new Date(Date.now() - 86400000 * 120),
        lastUsed: new Date(Date.now() - 86400000 * 10),
        expiresAt: new Date(Date.now() - 86400000 * 5),
        usageCount: 23456,
        rateLimit: { requests: 50, period: 'hour', current: 0 },
        ipWhitelist: ['172.16.0.0/16'],
        environment: 'production'
      }
    ];

    const mockAuthMethods: AuthMethod[] = [
      {
        id: 'auth-1',
        type: 'oauth2',
        name: 'OAuth 2.0 Authorization Code',
        description: 'Standard OAuth 2.0 flow for web applications',
        status: 'active',
        configuration: {
          client_id: 'oauth2_client_****',
          redirect_urls: ['https://app.example.com/callback'],
          scopes: ['read', 'write', 'admin'],
          token_expiry: 3600
        },
        security_level: 'high',
        services: ['Web Application', 'Admin Panel'],
        lastUpdated: new Date(Date.now() - 86400000 * 5)
      },
      {
        id: 'auth-2',
        type: 'jwt',
        name: 'JWT Bearer Token',
        description: 'JSON Web Tokens for stateless authentication',
        status: 'active',
        configuration: {
          algorithm: 'RS256',
          issuer: 'api.example.com',
          audience: 'zzp-werkplaats',
          expiry: 1800
        },
        security_level: 'high',
        services: ['Mobile API', 'Microservices'],
        lastUpdated: new Date(Date.now() - 86400000 * 2)
      },
      {
        id: 'auth-3',
        type: 'api_key',
        name: 'API Key Authentication',
        description: 'Simple API key based authentication',
        status: 'active',
        configuration: {
          header_name: 'X-API-Key',
          prefix_required: true,
          rotation_period: 90
        },
        security_level: 'medium',
        services: ['Third-party Integrations', 'Webhooks'],
        lastUpdated: new Date(Date.now() - 86400000 * 1)
      },
      {
        id: 'auth-4',
        type: 'webhook_signature',
        name: 'Webhook Signature Verification',
        description: 'HMAC signature verification for webhooks',
        status: 'active',
        configuration: {
          algorithm: 'sha256',
          header_name: 'X-Webhook-Signature',
          secret_rotation: 30
        },
        security_level: 'high',
        services: ['Payment Webhooks', 'External Notifications'],
        lastUpdated: new Date(Date.now() - 86400000 * 3)
      },
      {
        id: 'auth-5',
        type: 'basic',
        name: 'Basic Authentication',
        description: 'Legacy basic authentication for compatibility',
        status: 'inactive',
        configuration: {
          realm: 'API Access',
          encoding: 'base64'
        },
        security_level: 'low',
        services: ['Legacy Systems'],
        lastUpdated: new Date(Date.now() - 86400000 * 30)
      }
    ];

    const mockSecurityEvents: SecurityEvent[] = [
      {
        id: 'event-1',
        type: 'rate_limit_exceeded',
        severity: 'medium',
        message: 'API rate limit exceeded for key pk_live_****',
        timestamp: new Date(Date.now() - 3600000),
        sourceIp: '203.0.113.42',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        apiKey: 'pk_live_****',
        resolved: true,
        details: { limit: 1000, period: 'hour', requests: 1250 }
      },
      {
        id: 'event-2',
        type: 'authentication_failure',
        severity: 'high',
        message: 'Multiple failed authentication attempts detected',
        timestamp: new Date(Date.now() - 7200000),
        sourceIp: '198.51.100.15',
        userAgent: 'curl/7.68.0',
        resolved: false,
        details: { attempts: 15, window: '5 minutes' }
      },
      {
        id: 'event-3',
        type: 'unusual_activity',
        severity: 'medium',
        message: 'API key used from new geographic location',
        timestamp: new Date(Date.now() - 10800000),
        sourceIp: '192.0.2.123',
        userAgent: 'PostmanRuntime/7.29.0',
        apiKey: 'sk_live_****',
        resolved: true,
        details: { previous_location: 'United States', new_location: 'Germany' }
      },
      {
        id: 'event-4',
        type: 'unauthorized_access',
        severity: 'critical',
        message: 'Attempted access with revoked API key',
        timestamp: new Date(Date.now() - 14400000),
        sourceIp: '203.0.113.199',
        userAgent: 'python-requests/2.25.1',
        apiKey: 'rk_****',
        resolved: false,
        details: { revoked_at: '2024-01-15T10:30:00Z', reason: 'Security breach' }
      }
    ];

    const mockAuditLogs: AuditLog[] = [
      {
        id: 'audit-1',
        action: 'API_KEY_CREATED',
        user: 'admin@example.com',
        resource: 'API Key: Webhook Service',
        timestamp: new Date(Date.now() - 86400000),
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        success: true,
        details: { key_id: 'key-3', permissions: ['write:webhooks', 'read:events'] }
      },
      {
        id: 'audit-2',
        action: 'AUTH_METHOD_UPDATED',
        user: 'security@example.com',
        resource: 'OAuth 2.0 Configuration',
        timestamp: new Date(Date.now() - 86400000 * 2),
        ipAddress: '10.0.0.25',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        success: true,
        details: { method_id: 'auth-1', changes: ['redirect_urls'] }
      },
      {
        id: 'audit-3',
        action: 'API_KEY_REVOKED',
        user: 'admin@example.com',
        resource: 'API Key: Legacy Integration',
        timestamp: new Date(Date.now() - 86400000 * 5),
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        success: true,
        details: { key_id: 'key-5', reason: 'Expired and unused' }
      }
    ];

    setApiKeys(mockApiKeys);
    setAuthMethods(mockAuthMethods);
    setSecurityEvents(mockSecurityEvents);
    setAuditLogs(mockAuditLogs);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'configured':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'suspended':
        return 'text-gray-600 bg-gray-100';
      case 'expired':
      case 'revoked':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600 bg-blue-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'critical':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAuthTypeIcon = (type: string) => {
    switch (type) {
      case 'oauth2':
        return <UserIcon className="h-5 w-5" />;
      case 'jwt':
        return <FingerPrintIcon className="h-5 w-5" />;
      case 'api_key':
        return <KeyIcon className="h-5 w-5" />;
      case 'webhook_signature':
        return <ShieldCheckIcon className="h-5 w-5" />;
      case 'basic':
        return <LockClosedIcon className="h-5 w-5" />;
      case 'bearer':
        return <IdentificationIcon className="h-5 w-5" />;
      default:
        return <CogIcon className="h-5 w-5" />;
    }
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId 
        ? { ...key, status: 'revoked' as const }
        : key
    ));
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValue(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const resolveSecurityEvent = (eventId: string) => {
    setSecurityEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, resolved: true }
        : event
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Security & Authentication</h2>
          <p className="text-gray-600 mt-1">
            Manage API keys, authentication methods, and monitor security events
          </p>
        </div>
        <button
          onClick={() => setShowKeyModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Generate API Key
        </button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <KeyIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active API Keys</p>
              <p className="text-2xl font-semibold text-gray-900">
                {apiKeys.filter(key => key.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Auth Methods</p>
              <p className="text-2xl font-semibold text-gray-900">
                {authMethods.filter(method => method.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Security Events</p>
              <p className="text-2xl font-semibold text-gray-900">
                {securityEvents.filter(event => !event.resolved).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">API Requests (24h)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {apiKeys.reduce((sum, key) => sum + key.usageCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'keys', label: 'API Keys', icon: KeyIcon },
            { id: 'auth', label: 'Authentication', icon: ShieldCheckIcon },
            { id: 'security', label: 'Security Events', icon: ExclamationTriangleIcon },
            { id: 'audit', label: 'Audit Logs', icon: DocumentTextIcon },
            { id: 'monitoring', label: 'Monitoring', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'keys' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">API Keys Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Environment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{key.name}</span>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            {showKeyValue[key.id] ? (
                              <EyeSlashIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {showKeyValue[key.id] ? 'sk_live_1234567890abcdef...' : key.keyPrefix}
                        </div>
                        <div className="text-xs text-gray-400">
                          {key.permissions.slice(0, 2).join(', ')}
                          {key.permissions.length > 2 && ` +${key.permissions.length - 2} more`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        key.environment === 'production' ? 'bg-red-100 text-red-700' :
                        key.environment === 'staging' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {key.environment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {key.usageCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {key.rateLimit.current}/{key.rateLimit.requests}
                      </div>
                      <div className="text-xs text-gray-500">per {key.rateLimit.period}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {key.lastUsed ? key.lastUsed.toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <CogIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => revokeApiKey(key.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'auth' && (
        <div className="space-y-6">
          {authMethods.map((method) => (
            <div key={method.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3 text-gray-600">
                    {getAuthTypeIcon(method.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSecurityLevelColor(method.security_level)}`}>
                    {method.security_level} security
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(method.status)}`}>
                    {method.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(method.configuration, null, 2)}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Connected Services</h4>
                  <div className="space-y-2">
                    {method.services.map((service, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {service}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Last updated: {method.lastUpdated.toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <CogIcon className="h-4 w-4 mr-1" />
                  Configure
                </button>
                <button className="inline-flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Documentation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Security Events</h3>
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          <div className="space-y-4">
            {securityEvents.map((event) => (
              <div key={event.id} className={`bg-white rounded-lg shadow-sm border p-4 ${
                event.resolved ? 'border-gray-200' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                    <span className="font-medium text-gray-900">{event.message}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{event.timestamp.toLocaleString()}</span>
                    {!event.resolved && (
                      <button
                        onClick={() => resolveSecurityEvent(event.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Source IP:</span>
                    <span className="ml-1 font-medium">{event.sourceIp}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-1 font-medium">{event.type.replace('_', ' ')}</span>
                  </div>
                  {event.apiKey && (
                    <div>
                      <span className="text-gray-500">API Key:</span>
                      <span className="ml-1 font-medium font-mono">{event.apiKey}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-1 font-medium ${event.resolved ? 'text-green-600' : 'text-red-600'}`}>
                      {event.resolved ? 'Resolved' : 'Unresolved'}
                    </span>
                  </div>
                </div>

                {Object.keys(event.details).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Event Details:</h5>
                    <div className="bg-gray-50 rounded p-2">
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage Overview</h3>
            <div className="space-y-4">
              {apiKeys.filter(key => key.status === 'active').map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{key.name}</div>
                    <div className="text-sm text-gray-500">
                      {key.rateLimit.current}/{key.rateLimit.requests} requests
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {((key.rateLimit.current / key.rateLimit.requests) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">usage</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Keys</span>
                <span className="font-medium text-green-600">
                  {apiKeys.filter(key => key.status === 'active').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Expired Keys</span>
                <span className="font-medium text-red-600">
                  {apiKeys.filter(key => key.status === 'expired').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Unresolved Events</span>
                <span className="font-medium text-orange-600">
                  {securityEvents.filter(event => !event.resolved).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">High Security Methods</span>
                <span className="font-medium text-green-600">
                  {authMethods.filter(method => method.security_level === 'high').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New API Key</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Mobile App Integration"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2">
                    {['read:users', 'write:users', 'read:orders', 'write:orders', 'read:analytics'].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiration</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                    <option value="never">Never expires</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Generate Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APISecurityManager;