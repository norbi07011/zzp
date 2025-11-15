import React, { useState } from 'react';
import { SecurityComplianceManager } from '../../components/SecurityComplianceManager';
import { DataProtectionManager } from '../../components/DataProtectionManager';
import { SecurityHeadersManager } from '../../components/SecurityHeadersManager';

// Security & Compliance Dashboard - Enterprise Security Management
export const SecurityCompliancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Security Overview Statistics
  const securityStats = {
    overallScore: 87,
    grade: 'B+',
    securityEvents: {
      total: 156,
      critical: 2,
      high: 8,
      medium: 23,
      low: 123
    },
    compliance: {
      gdpr: { score: 92, status: 'compliant' },
      owasp: { score: 88, status: 'good' },
      iso27001: { score: 85, status: 'in_progress' }
    },
    dataProtection: {
      consents: 1247,
      requests: 52,
      violations: 0,
      dataTypes: 25
    },
    headers: {
      configured: 12,
      missing: 3,
      warnings: 2,
      score: 87
    }
  };

  // Recent Security Activities
  const recentActivities = [
    {
      id: '1',
      type: 'security_event',
      title: 'Failed login attempts detected',
      description: 'Multiple failed login attempts from IP 203.0.113.42',
      timestamp: '2025-01-08T14:30:00Z',
      severity: 'medium',
      status: 'investigating'
    },
    {
      id: '2',
      type: 'compliance_update',
      title: 'GDPR consent updated',
      description: 'User consent preferences updated for marketing communications',
      timestamp: '2025-01-08T13:15:00Z',
      severity: 'low',
      status: 'completed'
    },
    {
      id: '3',
      type: 'data_request',
      title: 'Data erasure request processed',
      description: 'Complete data deletion for user@example.com',
      timestamp: '2025-01-08T12:45:00Z',
      severity: 'medium',
      status: 'completed'
    },
    {
      id: '4',
      type: 'security_test',
      title: 'Security headers updated',
      description: 'CSP policy updated to remove unsafe-inline directive',
      timestamp: '2025-01-08T11:20:00Z',
      severity: 'low',
      status: 'completed'
    }
  ];

  // Quick Actions
  const quickActions = [
    {
      title: 'Run Security Scan',
      description: 'Perform comprehensive security assessment',
      icon: '🔍',
      action: 'scan',
      color: 'blue'
    },
    {
      title: 'Review Security Events',
      description: 'Check latest security incidents',
      icon: '⚠️',
      action: 'events',
      color: 'yellow'
    },
    {
      title: 'Process Data Requests',
      description: 'Handle pending GDPR requests',
      icon: '📋',
      action: 'requests',
      color: 'green'
    },
    {
      title: 'Update Security Headers',
      description: 'Configure CSP and security headers',
      icon: '🛡️',
      action: 'headers',
      color: 'purple'
    },
    {
      title: 'Generate Compliance Report',
      description: 'Create comprehensive compliance report',
      icon: '📊',
      action: 'report',
      color: 'indigo'
    },
    {
      title: 'Audit User Permissions',
      description: 'Review user access and permissions',
      icon: '👥',
      action: 'audit',
      color: 'red'
    }
  ];

  // Render Security Overview
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">{securityStats.overallScore}</div>
          <div className="text-sm text-gray-400 mb-1">Overall Security Score</div>
          <div className="text-lg font-medium text-white">Grade: {securityStats.grade}</div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">{securityStats.compliance.gdpr.score}%</div>
          <div className="text-sm text-gray-400 mb-1">GDPR Compliance</div>
          <div className={`text-sm font-medium ${
            securityStats.compliance.gdpr.status === 'compliant' ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {securityStats.compliance.gdpr.status.toUpperCase()}
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">{securityStats.securityEvents.total}</div>
          <div className="text-sm text-gray-400 mb-1">Security Events</div>
          <div className="text-sm text-red-400">{securityStats.securityEvents.critical} Critical</div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">{securityStats.dataProtection.consents}</div>
          <div className="text-sm text-gray-400 mb-1">Active Consents</div>
          <div className="text-sm text-green-400">{securityStats.dataProtection.violations} Violations</div>
        </div>
      </div>

      {/* Security Health Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-white mb-6">Security Health Dashboard</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* OWASP Compliance */}
          <div className="p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">OWASP Top 10</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                securityStats.compliance.owasp.score >= 90 ? 'bg-green-900 text-green-200' :
                securityStats.compliance.owasp.score >= 70 ? 'bg-yellow-900 text-yellow-200' :
                'bg-red-900 text-red-200'
              }`}>
                {securityStats.compliance.owasp.status.toUpperCase()}
              </span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Security Score</span>
                <span>{securityStats.compliance.owasp.score}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${securityStats.compliance.owasp.score}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* ISO 27001 */}
          <div className="p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">ISO 27001</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                securityStats.compliance.iso27001.status === 'certified' ? 'bg-green-900 text-green-200' :
                securityStats.compliance.iso27001.status === 'in_progress' ? 'bg-yellow-900 text-yellow-200' :
                'bg-red-900 text-red-200'
              }`}>
                {securityStats.compliance.iso27001.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Readiness</span>
                <span>{securityStats.compliance.iso27001.score}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${securityStats.compliance.iso27001.score}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Security Headers */}
          <div className="p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-white">Security Headers</h4>
              <span className="text-xs text-gray-400">{securityStats.headers.configured}/15 Configured</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Header Score</span>
                <span>{securityStats.headers.score}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${securityStats.headers.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`p-4 bg-gray-900 border border-gray-700 rounded-lg hover:border-${action.color}-500 transition-colors text-left`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{action.icon}</span>
                <h4 className="text-lg font-medium text-white">{action.title}</h4>
              </div>
              <p className="text-sm text-gray-400">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Security Activities */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Security Activities</h3>
        
        <div className="space-y-4">
          {recentActivities.map(activity => (
            <div key={activity.id} className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className={`w-3 h-3 rounded-full mt-2 ${
                    activity.severity === 'critical' ? 'bg-red-500' :
                    activity.severity === 'high' ? 'bg-orange-500' :
                    activity.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></span>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">{activity.title}</h4>
                    <p className="text-sm text-gray-400 mb-2">{activity.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Type: {activity.type.replace('_', ' ')}</span>
                      <span>Time: {new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-900 text-green-200' :
                    activity.status === 'investigating' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-blue-900 text-blue-200'
                  }`}>
                    {activity.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View All Activities
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Security & Compliance Management</h1>
        <p className="text-gray-400">Enterprise security hardening, GDPR compliance, and comprehensive security management</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Security Overview', icon: '📊' },
          { id: 'compliance', label: 'Security & Compliance', icon: '🛡️' },
          { id: 'data-protection', label: 'Data Protection', icon: '🔒' },
          { id: 'security-headers', label: 'Security Headers', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'compliance' && <SecurityComplianceManager />}
      {activeTab === 'data-protection' && <DataProtectionManager />}
      {activeTab === 'security-headers' && <SecurityHeadersManager />}
    </div>
  );
};