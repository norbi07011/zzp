// @ts-nocheck
/**
 * ComplianceManagementPage
 * Admin panel for security compliance, GDPR, and data protection
 */

import React, { useState } from 'react';

interface DataRequest {
  id: string;
  type: 'access' | 'deletion' | 'export' | 'correction';
  userId: string;
  userEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  userId: string;
  timestamp: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

interface ConsentRecord {
  userId: string;
  email: string;
  marketing: boolean;
  analytics: boolean;
  thirdParty: boolean;
  lastUpdated: string;
}

export const ComplianceManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gdpr' | 'audit' | 'consent' | 'settings'>('gdpr');
  const [processing, setProcessing] = useState<string | null>(null);

  const dataRequests: DataRequest[] = [
    {
      id: '1',
      type: 'deletion',
      userId: 'user_789',
      userEmail: 'john.doe@example.com',
      status: 'pending',
      requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'export',
      userId: 'user_456',
      userEmail: 'jane.smith@example.com',
      status: 'processing',
      requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'access',
      userId: 'user_234',
      userEmail: 'mike.jones@example.com',
      status: 'completed',
      requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      type: 'correction',
      userId: 'user_567',
      userEmail: 'sarah.wilson@example.com',
      status: 'completed',
      requestedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: '1',
      action: 'User Data Export',
      resource: 'profiles',
      userId: 'admin_123',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      details: 'Exported user data for GDPR request #2',
      severity: 'info'
    },
    {
      id: '2',
      action: 'Failed Login Attempt',
      resource: 'auth',
      userId: 'unknown',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      details: 'Multiple failed login attempts from IP 192.168.1.100',
      severity: 'warning'
    },
    {
      id: '3',
      action: 'Database Backup',
      resource: 'database',
      userId: 'system',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      details: 'Automated daily backup completed successfully',
      severity: 'info'
    },
    {
      id: '4',
      action: 'Unauthorized Access Attempt',
      resource: 'admin_panel',
      userId: 'user_999',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      details: 'User attempted to access admin panel without permissions',
      severity: 'critical'
    },
    {
      id: '5',
      action: 'Consent Updated',
      resource: 'user_preferences',
      userId: 'user_456',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      details: 'User updated marketing consent preferences',
      severity: 'info'
    }
  ];

  const consentRecords: ConsentRecord[] = [
    {
      userId: 'user_123',
      email: 'john.doe@example.com',
      marketing: true,
      analytics: true,
      thirdParty: false,
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      userId: 'user_456',
      email: 'jane.smith@example.com',
      marketing: false,
      analytics: true,
      thirdParty: false,
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      userId: 'user_789',
      email: 'mike.jones@example.com',
      marketing: true,
      analytics: true,
      thirdParty: true,
      lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const complianceChecks = [
    { name: 'GDPR Compliance', status: 'compliant', score: 95 },
    { name: 'Data Encryption', status: 'compliant', score: 100 },
    { name: 'Cookie Policy', status: 'compliant', score: 98 },
    { name: 'Privacy Policy', status: 'warning', score: 85 },
    { name: 'Terms of Service', status: 'compliant', score: 92 },
    { name: 'Data Retention', status: 'compliant', score: 90 }
  ];

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'deletion': return '🗑️';
      case 'export': return '📥';
      case 'access': return '👁️';
      case 'correction': return '✏️';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleProcessRequest = async (requestId: string) => {
    setProcessing(requestId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(null);
    alert(`Request ${requestId} processed successfully`);
  };

  const handleRejectRequest = (requestId: string) => {
    if (confirm('Reject this data request?')) {
      alert(`Request ${requestId} rejected`);
    }
  };

  const handleExportAuditLogs = () => {
    alert('Exporting audit logs...');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔒 Compliance & GDPR</h1>
          <p className="text-gray-600">Security compliance, data protection, and privacy management</p>
        </div>

        {/* Compliance Score */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium mb-1">Overall Compliance Score</h2>
              <p className="text-3xl font-bold">93/100</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Last Assessment</p>
              <p className="font-medium">{new Date().toLocaleDateString('nl-NL')}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {dataRequests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Audit Logs (24h)</h3>
            <p className="text-3xl font-bold text-blue-600">{auditLogs.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Consent Rate</h3>
            <p className="text-3xl font-bold text-green-600">87%</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Critical Issues</h3>
            <p className="text-3xl font-bold text-red-600">0</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('gdpr')}
            className={`pb-2 px-4 ${activeTab === 'gdpr' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            GDPR Requests
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2 px-4 ${activeTab === 'audit' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`pb-2 px-4 ${activeTab === 'consent' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Consent Management
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-4 ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Compliance Checks
          </button>
        </div>

        {/* GDPR Requests Tab */}
        {activeTab === 'gdpr' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataRequests.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getRequestTypeIcon(request.type)}</span>
                        <span className="font-medium text-gray-900 capitalize">{request.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{request.userEmail}</div>
                        <div className="text-gray-500">{request.userId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(request.requestedAt).toLocaleString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {request.completedAt 
                        ? new Date(request.completedAt).toLocaleString('nl-NL')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleProcessRequest(request.id)}
                            disabled={processing === request.id}
                            className="text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
                          >
                            {processing === request.id ? 'Processing...' : 'Process'}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handleExportAuditLogs}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📥 Export Logs
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString('nl-NL')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{log.action}</span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{log.resource}</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.userId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium uppercase text-xs ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Consent Management Tab */}
        {activeTab === 'consent' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marketing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Analytics</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Third Party</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consentRecords.map(record => (
                  <tr key={record.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{record.email}</div>
                        <div className="text-gray-500">{record.userId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded ${
                        record.marketing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.marketing ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded ${
                        record.analytics ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.analytics ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded ${
                        record.thirdParty ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.thirdParty ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(record.lastUpdated).toLocaleDateString('nl-NL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Compliance Checks Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-2 gap-6">
            {complianceChecks.map((check, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-900">{check.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(check.status)}`}>
                    {check.status}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Compliance Score</span>
                    <span className="font-medium text-gray-900">{check.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${check.score >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${check.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceManagementPage;
