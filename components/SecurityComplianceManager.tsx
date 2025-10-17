import React, { useState, useEffect } from 'react';

// Security Compliance Manager - Enterprise Security & GDPR Compliance
export const SecurityComplianceManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('authentication');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({});

  // Mock Security Event Interface
  interface SecurityEvent {
    id: string;
    type: 'login_attempt' | 'failed_auth' | 'suspicious_activity' | 'data_access' | 'admin_action';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: string;
    userId?: string;
    ipAddress: string;
    userAgent?: string;
    location?: string;
    status: 'resolved' | 'investigating' | 'open' | 'false_positive';
    details: Record<string, any>;
  }

  // Compliance Status Interface
  interface ComplianceStatus {
    gdpr?: {
      score: number;
      status: 'compliant' | 'partial' | 'non_compliant';
      lastAudit: string;
      issues: string[];
    };
    owasp?: {
      score: number;
      vulnerabilities: number;
      lastScan: string;
      criticalIssues: string[];
    };
    iso27001?: {
      score: number;
      status: 'certified' | 'in_progress' | 'needs_work';
      lastAssessment: string;
      recommendations: string[];
    };
  }

  // Audit Log Interface
  interface AuditLog {
    id: string;
    action: string;
    userId: string;
    userEmail: string;
    timestamp: string;
    ipAddress: string;
    resource: string;
    details: Record<string, any>;
    severity: 'info' | 'warning' | 'error';
  }

  // Security Settings Interface
  interface SecuritySettings {
    twoFactorAuth?: {
      enabled: boolean;
      method: 'sms' | 'email' | 'app' | 'hardware';
      backupCodes: boolean;
    };
    passwordPolicy?: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number;
      preventReuse: number;
    };
    sessionManagement?: {
      timeoutMinutes: number;
      maxConcurrentSessions: number;
      secureOnly: boolean;
      sameSite: 'strict' | 'lax' | 'none';
    };
    accessControl?: {
      roleBasedAccess: boolean;
      ipWhitelist: string[];
      geoRestrictions: string[];
      deviceTrust: boolean;
    };
  }

  // Initialize mock data
  useEffect(() => {
    // Mock security events
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'failed_auth',
        severity: 'medium',
        description: 'Multiple failed login attempts detected',
        timestamp: '2025-01-08T14:30:00Z',
        userId: 'user123',
        ipAddress: '192.168.1.100',
        location: 'Netherlands, Amsterdam',
        status: 'investigating',
        details: { attempts: 5, timeWindow: '5 minutes' }
      },
      {
        id: '2',
        type: 'suspicious_activity',
        severity: 'high',
        description: 'Unusual data access pattern detected',
        timestamp: '2025-01-08T13:15:00Z',
        ipAddress: '203.0.113.42',
        location: 'Unknown',
        status: 'open',
        details: { dataVolume: '2.5GB', accessTime: 'off-hours' }
      },
      {
        id: '3',
        type: 'admin_action',
        severity: 'low',
        description: 'Admin role assigned to new user',
        timestamp: '2025-01-08T12:00:00Z',
        userId: 'admin001',
        ipAddress: '10.0.0.50',
        location: 'Netherlands, Rotterdam',
        status: 'resolved',
        details: { newUserId: 'user456', role: 'administrator' }
      },
      {
        id: '4',
        type: 'data_access',
        severity: 'medium',
        description: 'Large dataset export request',
        timestamp: '2025-01-08T11:45:00Z',
        userId: 'user789',
        ipAddress: '172.16.254.1',
        location: 'Netherlands, Utrecht',
        status: 'resolved',
        details: { exportSize: '1.2GB', dataType: 'customer_data' }
      }
    ];

    // Mock compliance status
    const mockCompliance: ComplianceStatus = {
      gdpr: {
        score: 92,
        status: 'compliant',
        lastAudit: '2025-01-01',
        issues: ['Cookie consent optimization needed', 'Data retention policy update required']
      },
      owasp: {
        score: 88,
        vulnerabilities: 3,
        lastScan: '2025-01-07',
        criticalIssues: ['SQL injection protection needed in legacy module']
      },
      iso27001: {
        score: 85,
        status: 'in_progress',
        lastAssessment: '2024-12-15',
        recommendations: ['Implement incident response automation', 'Enhance access logging']
      }
    };

    // Mock audit logs
    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        action: 'User Login',
        userId: 'user123',
        userEmail: 'user@example.com',
        timestamp: '2025-01-08T14:30:00Z',
        ipAddress: '192.168.1.100',
        resource: '/admin/dashboard',
        details: { method: '2FA', device: 'Desktop Chrome' },
        severity: 'info'
      },
      {
        id: '2',
        action: 'Data Export',
        userId: 'user789',
        userEmail: 'analyst@company.com',
        timestamp: '2025-01-08T13:20:00Z',
        ipAddress: '10.0.0.25',
        resource: '/api/customers/export',
        details: { recordCount: 1500, format: 'CSV' },
        severity: 'warning'
      },
      {
        id: '3',
        action: 'Role Assignment',
        userId: 'admin001',
        userEmail: 'admin@company.com',
        timestamp: '2025-01-08T12:00:00Z',
        ipAddress: '10.0.0.50',
        resource: '/admin/users/permissions',
        details: { targetUser: 'user456', newRole: 'administrator' },
        severity: 'warning'
      }
    ];

    // Mock security settings
    const mockSettings: SecuritySettings = {
      twoFactorAuth: {
        enabled: true,
        method: 'app',
        backupCodes: true
      },
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 12
      },
      sessionManagement: {
        timeoutMinutes: 60,
        maxConcurrentSessions: 3,
        secureOnly: true,
        sameSite: 'strict'
      },
      accessControl: {
        roleBasedAccess: true,
        ipWhitelist: ['10.0.0.0/24', '192.168.1.0/24'],
        geoRestrictions: ['NL', 'DE', 'BE'],
        deviceTrust: true
      }
    };

    setSecurityEvents(mockEvents);
    setComplianceStatus(mockCompliance);
    setAuditLogs(mockAuditLogs);
    setSecuritySettings(mockSettings);
  }, []);

  // Render Security Events
  const renderSecurityEvents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Security Events</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Configure Alerts
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Export Events
          </button>
        </div>
      </div>

      {/* Event Filters */}
      <div className="flex space-x-4 mb-6">
        <select className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600">
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600">
          <option value="">All Types</option>
          <option value="login_attempt">Login Attempts</option>
          <option value="failed_auth">Failed Authentication</option>
          <option value="suspicious_activity">Suspicious Activity</option>
          <option value="data_access">Data Access</option>
          <option value="admin_action">Admin Actions</option>
        </select>
        <select className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600">
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="false_positive">False Positive</option>
        </select>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {securityEvents.map(event => (
          <div key={event.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.severity === 'critical' ? 'bg-red-900 text-red-200' :
                  event.severity === 'high' ? 'bg-orange-900 text-orange-200' :
                  event.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-blue-900 text-blue-200'
                }`}>
                  {event.severity.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === 'resolved' ? 'bg-green-900 text-green-200' :
                  event.status === 'investigating' ? 'bg-yellow-900 text-yellow-200' :
                  event.status === 'false_positive' ? 'bg-gray-900 text-gray-200' :
                  'bg-red-900 text-red-200'
                }`}>
                  {event.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-400">
                {new Date(event.timestamp).toLocaleString()}
              </span>
            </div>

            <h4 className="text-lg font-medium text-white mb-2">{event.description}</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="text-white ml-2">{event.type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-400">IP Address:</span>
                <span className="text-white ml-2">{event.ipAddress}</span>
              </div>
              {event.location && (
                <div>
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white ml-2">{event.location}</span>
                </div>
              )}
              {event.userId && (
                <div>
                  <span className="text-gray-400">User ID:</span>
                  <span className="text-white ml-2">{event.userId}</span>
                </div>
              )}
            </div>

            {Object.keys(event.details).length > 0 && (
              <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                <h5 className="text-sm font-medium text-white mb-2">Event Details:</h5>
                <div className="space-y-1">
                  {Object.entries(event.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-white">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-4">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Investigate
              </button>
              <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                Mark Resolved
              </button>
              <button className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
                False Positive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Authentication Management
  const renderAuthentication = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Authentication & Access Control</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Update Settings
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
          🔐 Two-Factor Authentication
          <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
            securitySettings.twoFactorAuth?.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
          }`}>
            {securitySettings.twoFactorAuth?.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Authentication Method</label>
            <select 
              value={securitySettings.twoFactorAuth?.method || 'app'}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            >
              <option value="app">Authenticator App</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="hardware">Hardware Token</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={securitySettings.twoFactorAuth?.backupCodes || false}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Enable backup codes</label>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <h5 className="text-sm font-medium text-white mb-2">2FA Statistics</h5>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">94%</div>
              <div className="text-xs text-gray-400">Users Enrolled</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">1,247</div>
              <div className="text-xs text-gray-400">Active Tokens</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">3</div>
              <div className="text-xs text-gray-400">Recovery Used</div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Policy */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">🔑 Password Policy</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Length</label>
            <input 
              type="number" 
              value={securitySettings.passwordPolicy?.minLength || 12}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password Max Age (days)</label>
            <input 
              type="number" 
              value={securitySettings.passwordPolicy?.maxAge || 90}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={securitySettings.passwordPolicy?.requireUppercase || false}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Uppercase Required</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={securitySettings.passwordPolicy?.requireNumbers || false}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Numbers Required</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={securitySettings.passwordPolicy?.requireSpecialChars || false}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Special Chars Required</label>
          </div>
          <div className="flex items-center">
            <input 
              type="number" 
              value={securitySettings.passwordPolicy?.preventReuse || 12}
              className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 mr-2"
            />
            <label className="text-sm text-gray-300">Prevent Reuse</label>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">⏱️ Session Management</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
            <input 
              type="number" 
              value={securitySettings.sessionManagement?.timeoutMinutes || 60}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Concurrent Sessions</label>
            <input 
              type="number" 
              value={securitySettings.sessionManagement?.maxConcurrentSessions || 3}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SameSite Policy</label>
            <select 
              value={securitySettings.sessionManagement?.sameSite || 'strict'}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            >
              <option value="strict">Strict</option>
              <option value="lax">Lax</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div className="flex items-center mt-4">
          <input 
            type="checkbox" 
            checked={securitySettings.sessionManagement?.secureOnly || false}
            className="mr-2"
          />
          <label className="text-sm text-gray-300">Secure cookies only (HTTPS)</label>
        </div>
      </div>

      {/* Access Control */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">🛡️ Access Control</h4>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={securitySettings.accessControl?.roleBasedAccess || false}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Role-Based Access Control (RBAC)</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">IP Whitelist</label>
            <div className="space-y-2">
              {securitySettings.accessControl?.ipWhitelist?.map((ip, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={ip}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    readOnly
                  />
                  <button className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                    Remove
                  </button>
                </div>
              )) || []}
              <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                Add IP Range
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Geographic Restrictions</label>
            <div className="flex flex-wrap gap-2">
              {securitySettings.accessControl?.geoRestrictions?.map((country, index) => (
                <span key={index} className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-sm">
                  {country}
                </span>
              )) || []}
            </div>
          </div>

          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={securitySettings.accessControl?.deviceTrust || false}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Device Trust Management</label>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Compliance Dashboard
  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Compliance Dashboard</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Run Assessment
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* GDPR Compliance */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white flex items-center">
            🇪🇺 GDPR Compliance
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              complianceStatus.gdpr?.status === 'compliant' ? 'bg-green-900 text-green-200' :
              complianceStatus.gdpr?.status === 'partial' ? 'bg-yellow-900 text-yellow-200' :
              'bg-red-900 text-red-200'
            }`}>
              {complianceStatus.gdpr?.status?.toUpperCase()}
            </span>
          </h4>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {complianceStatus.gdpr?.score}%
            </div>
            <div className="text-xs text-gray-400">Compliance Score</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Overall Compliance</span>
            <span>{complianceStatus.gdpr?.score}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${complianceStatus.gdpr?.score}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h5 className="text-sm font-medium text-white mb-2">Outstanding Issues:</h5>
            <div className="space-y-2">
              {complianceStatus.gdpr?.issues?.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <span className="text-sm text-gray-300">{issue}</span>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">
                    Resolve
                  </button>
                </div>
              )) || []}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">✓</div>
              <div className="text-xs text-gray-400">Data Processing</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">✓</div>
              <div className="text-xs text-gray-400">Consent Management</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">⚠</div>
              <div className="text-xs text-gray-400">Cookie Policy</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">✓</div>
              <div className="text-xs text-gray-400">Right to Deletion</div>
            </div>
          </div>
        </div>
      </div>

      {/* OWASP Security */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white flex items-center">
            🛡️ OWASP Security Assessment
          </h4>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {complianceStatus.owasp?.score}%
            </div>
            <div className="text-xs text-gray-400">Security Score</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Security Posture</span>
            <span>{complianceStatus.owasp?.score}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full" 
              style={{ width: `${complianceStatus.owasp?.score}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-900 rounded-lg">
            <div className="text-lg font-bold text-red-400">{complianceStatus.owasp?.vulnerabilities}</div>
            <div className="text-xs text-gray-400">Vulnerabilities</div>
          </div>
          <div className="text-center p-3 bg-gray-900 rounded-lg">
            <div className="text-lg font-bold text-green-400">A+</div>
            <div className="text-xs text-gray-400">SSL Rating</div>
          </div>
          <div className="text-center p-3 bg-gray-900 rounded-lg">
            <div className="text-lg font-bold text-green-400">100%</div>
            <div className="text-xs text-gray-400">Auth Coverage</div>
          </div>
          <div className="text-center p-3 bg-gray-900 rounded-lg">
            <div className="text-lg font-bold text-yellow-400">85%</div>
            <div className="text-xs text-gray-400">Input Validation</div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-white mb-2">Critical Issues:</h5>
          <div className="space-y-2">
            {complianceStatus.owasp?.criticalIssues?.map((issue, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <span className="text-sm text-red-200">{issue}</span>
                <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">
                  Fix Now
                </button>
              </div>
            )) || []}
          </div>
        </div>
      </div>

      {/* ISO 27001 */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white flex items-center">
            📋 ISO 27001 Assessment
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              complianceStatus.iso27001?.status === 'certified' ? 'bg-green-900 text-green-200' :
              complianceStatus.iso27001?.status === 'in_progress' ? 'bg-yellow-900 text-yellow-200' :
              'bg-red-900 text-red-200'
            }`}>
              {complianceStatus.iso27001?.status?.replace('_', ' ').toUpperCase()}
            </span>
          </h4>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">
              {complianceStatus.iso27001?.score}%
            </div>
            <div className="text-xs text-gray-400">Readiness Score</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Certification Readiness</span>
            <span>{complianceStatus.iso27001?.score}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${complianceStatus.iso27001?.score}%` }}
            ></div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-white mb-2">Recommendations:</h5>
          <div className="space-y-2">
            {complianceStatus.iso27001?.recommendations?.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <span className="text-sm text-gray-300">{rec}</span>
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">
                  Implement
                </button>
              </div>
            )) || []}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Audit Logs
  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Audit Logs</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Filter Logs
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Export Audit Trail
          </button>
        </div>
      </div>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">2,847</div>
          <div className="text-sm text-gray-400">Total Events Today</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">94.2%</div>
          <div className="text-sm text-gray-400">Success Rate</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">23</div>
          <div className="text-sm text-gray-400">Warning Events</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">3</div>
          <div className="text-sm text-gray-400">Error Events</div>
        </div>
      </div>

      {/* Audit Log Filters */}
      <div className="flex space-x-4 mb-6">
        <input 
          type="text" 
          placeholder="Search logs..."
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
        />
        <select className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600">
          <option value="">All Actions</option>
          <option value="login">User Login</option>
          <option value="logout">User Logout</option>
          <option value="data_access">Data Access</option>
          <option value="admin_action">Admin Actions</option>
          <option value="configuration">Configuration Changes</option>
        </select>
        <select className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600">
          <option value="">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        <input 
          type="date" 
          className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
        />
      </div>

      {/* Audit Log Entries */}
      <div className="space-y-4">
        {auditLogs.map(log => (
          <div key={log.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${
                  log.severity === 'error' ? 'bg-red-500' :
                  log.severity === 'warning' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></span>
                <h4 className="text-lg font-medium text-white">{log.action}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  log.severity === 'error' ? 'bg-red-900 text-red-200' :
                  log.severity === 'warning' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-blue-900 text-blue-200'
                }`}>
                  {log.severity.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-400">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-400">User:</span>
                <span className="text-white ml-2">{log.userEmail}</span>
              </div>
              <div>
                <span className="text-gray-400">User ID:</span>
                <span className="text-white ml-2">{log.userId}</span>
              </div>
              <div>
                <span className="text-gray-400">IP Address:</span>
                <span className="text-white ml-2">{log.ipAddress}</span>
              </div>
              <div>
                <span className="text-gray-400">Resource:</span>
                <span className="text-white ml-2">{log.resource}</span>
              </div>
            </div>

            {Object.keys(log.details).length > 0 && (
              <div className="p-3 bg-gray-900 rounded-lg">
                <h5 className="text-sm font-medium text-white mb-2">Additional Details:</h5>
                <div className="space-y-1">
                  {Object.entries(log.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-white">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
          Load More Entries
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Security & Compliance Management</h1>
        <p className="text-gray-400">Enterprise security hardening, GDPR compliance, and audit management</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'authentication', label: 'Authentication', icon: '🔐' },
          { id: 'events', label: 'Security Events', icon: '⚠️' },
          { id: 'compliance', label: 'Compliance', icon: '📋' },
          { id: 'audit', label: 'Audit Logs', icon: '📝' }
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
      {activeTab === 'authentication' && renderAuthentication()}
      {activeTab === 'events' && renderSecurityEvents()}
      {activeTab === 'compliance' && renderCompliance()}
      {activeTab === 'audit' && renderAuditLogs()}
    </div>
  );
};