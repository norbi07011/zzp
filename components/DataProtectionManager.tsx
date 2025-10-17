import React, { useState, useEffect } from 'react';

// Advanced Data Protection Manager - GDPR & Privacy Compliance
export const DataProtectionManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState('consent');
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({});
  const [dataMapping, setDataMapping] = useState<DataMapping[]>([]);

  // Consent Record Interface
  interface ConsentRecord {
    id: string;
    userId: string;
    userEmail: string;
    consentType: 'marketing' | 'analytics' | 'functional' | 'necessary';
    status: 'granted' | 'withdrawn' | 'expired';
    grantedAt: string;
    withdrawnAt?: string;
    expiresAt?: string;
    ipAddress: string;
    userAgent: string;
    source: 'website' | 'app' | 'email' | 'phone';
    details: {
      purpose: string;
      dataTypes: string[];
      retentionPeriod: number;
      thirdParties: string[];
    };
  }

  // Data Request Interface
  interface DataRequest {
    id: string;
    userId: string;
    userEmail: string;
    requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    submittedAt: string;
    completedAt?: string;
    reason?: string;
    dataTypes: string[];
    description: string;
    verificationMethod: 'email' | 'id_document' | 'phone' | 'in_person';
    processingNotes: string[];
  }

  // Privacy Settings Interface
  interface PrivacySettings {
    dataRetention?: {
      defaultPeriod: number;
      userDataPeriod: number;
      logsPeriod: number;
      backupPeriod: number;
      automaticDeletion: boolean;
    };
    cookieSettings?: {
      necessary: boolean;
      functional: boolean;
      analytics: boolean;
      marketing: boolean;
      customization: boolean;
    };
    dataProcessing?: {
      minimization: boolean;
      purposeLimitation: boolean;
      accuracyMaintenance: boolean;
      storageMinimization: boolean;
      integrityConfidentiality: boolean;
    };
    thirdPartySharing?: {
      analyticsProviders: string[];
      marketingPartners: string[];
      serviceProviders: string[];
      dataProcessors: string[];
    };
  }

  // Data Mapping Interface
  interface DataMapping {
    id: string;
    dataType: string;
    category: 'personal' | 'sensitive' | 'public' | 'internal';
    purpose: string;
    legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
    retention: number;
    location: string;
    encryption: boolean;
    access: string[];
    thirdParties: string[];
  }

  // Initialize mock data
  useEffect(() => {
    // Mock consent records
    const mockConsents: ConsentRecord[] = [
      {
        id: '1',
        userId: 'user123',
        userEmail: 'user@example.com',
        consentType: 'marketing',
        status: 'granted',
        grantedAt: '2025-01-01T10:00:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        source: 'website',
        details: {
          purpose: 'Email marketing campaigns and product updates',
          dataTypes: ['email', 'name', 'preferences'],
          retentionPeriod: 730,
          thirdParties: ['MailChimp', 'Google Analytics']
        }
      },
      {
        id: '2',
        userId: 'user456',
        userEmail: 'customer@company.com',
        consentType: 'analytics',
        status: 'withdrawn',
        grantedAt: '2024-12-15T14:30:00Z',
        withdrawnAt: '2025-01-05T09:15:00Z',
        ipAddress: '10.0.0.25',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        source: 'app',
        details: {
          purpose: 'Website analytics and performance monitoring',
          dataTypes: ['usage_data', 'device_info', 'location'],
          retentionPeriod: 365,
          thirdParties: ['Google Analytics', 'Hotjar']
        }
      },
      {
        id: '3',
        userId: 'user789',
        userEmail: 'member@platform.com',
        consentType: 'functional',
        status: 'granted',
        grantedAt: '2025-01-08T12:00:00Z',
        ipAddress: '172.16.254.1',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        source: 'email',
        details: {
          purpose: 'Platform functionality and user experience',
          dataTypes: ['preferences', 'settings', 'session_data'],
          retentionPeriod: 1095,
          thirdParties: ['AWS', 'Cloudflare']
        }
      }
    ];

    // Mock data requests
    const mockRequests: DataRequest[] = [
      {
        id: '1',
        userId: 'user123',
        userEmail: 'user@example.com',
        requestType: 'access',
        status: 'completed',
        submittedAt: '2025-01-07T10:00:00Z',
        completedAt: '2025-01-08T14:30:00Z',
        dataTypes: ['personal_info', 'usage_data', 'consent_records'],
        description: 'Request for all personal data collected and processed',
        verificationMethod: 'email',
        processingNotes: [
          'Identity verified via email confirmation',
          'Data package prepared and sent',
          'Included all data from past 2 years'
        ]
      },
      {
        id: '2',
        userId: 'user456',
        userEmail: 'customer@company.com',
        requestType: 'erasure',
        status: 'in_progress',
        submittedAt: '2025-01-08T09:15:00Z',
        dataTypes: ['all_data'],
        description: 'Complete account deletion and data erasure',
        verificationMethod: 'id_document',
        processingNotes: [
          'ID document verification completed',
          'Backup data deletion in progress',
          'Third-party data removal requested'
        ]
      },
      {
        id: '3',
        userId: 'user789',
        userEmail: 'member@platform.com',
        requestType: 'rectification',
        status: 'pending',
        submittedAt: '2025-01-08T13:20:00Z',
        dataTypes: ['contact_info'],
        description: 'Update incorrect email address and phone number',
        verificationMethod: 'phone',
        processingNotes: [
          'Request received and logged',
          'Pending phone verification'
        ]
      }
    ];

    // Mock privacy settings
    const mockPrivacySettings: PrivacySettings = {
      dataRetention: {
        defaultPeriod: 730,
        userDataPeriod: 1095,
        logsPeriod: 365,
        backupPeriod: 180,
        automaticDeletion: true
      },
      cookieSettings: {
        necessary: true,
        functional: true,
        analytics: false,
        marketing: false,
        customization: true
      },
      dataProcessing: {
        minimization: true,
        purposeLimitation: true,
        accuracyMaintenance: true,
        storageMinimization: true,
        integrityConfidentiality: true
      },
      thirdPartySharing: {
        analyticsProviders: ['Google Analytics', 'Hotjar'],
        marketingPartners: ['MailChimp'],
        serviceProviders: ['AWS', 'Cloudflare', 'SendGrid'],
        dataProcessors: ['Stripe', 'PayPal']
      }
    };

    // Mock data mapping
    const mockDataMapping: DataMapping[] = [
      {
        id: '1',
        dataType: 'User Profile Data',
        category: 'personal',
        purpose: 'Account management and authentication',
        legalBasis: 'contract',
        retention: 1095,
        location: 'EU (Amsterdam)',
        encryption: true,
        access: ['user', 'admin', 'support'],
        thirdParties: ['AWS']
      },
      {
        id: '2',
        dataType: 'Payment Information',
        category: 'sensitive',
        purpose: 'Transaction processing',
        legalBasis: 'contract',
        retention: 2555,
        location: 'EU (Frankfurt)',
        encryption: true,
        access: ['user', 'finance', 'admin'],
        thirdParties: ['Stripe', 'PayPal']
      },
      {
        id: '3',
        dataType: 'Usage Analytics',
        category: 'personal',
        purpose: 'Service improvement and optimization',
        legalBasis: 'legitimate_interests',
        retention: 365,
        location: 'EU (Dublin)',
        encryption: true,
        access: ['analytics_team', 'product_team'],
        thirdParties: ['Google Analytics']
      },
      {
        id: '4',
        dataType: 'Marketing Preferences',
        category: 'personal',
        purpose: 'Targeted marketing communications',
        legalBasis: 'consent',
        retention: 730,
        location: 'EU (Amsterdam)',
        encryption: true,
        access: ['marketing_team', 'admin'],
        thirdParties: ['MailChimp']
      }
    ];

    setConsentRecords(mockConsents);
    setDataRequests(mockRequests);
    setPrivacySettings(mockPrivacySettings);
    setDataMapping(mockDataMapping);
  }, []);

  // Render Consent Management
  const renderConsentManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Consent Management</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Consents
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Consent Analytics
          </button>
        </div>
      </div>

      {/* Consent Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">1,247</div>
          <div className="text-sm text-gray-400">Active Consents</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">89</div>
          <div className="text-sm text-gray-400">Pending Reviews</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">156</div>
          <div className="text-sm text-gray-400">Withdrawn</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">23</div>
          <div className="text-sm text-gray-400">Expired</div>
        </div>
      </div>

      {/* Consent Filters */}
      <div className="flex space-x-4 mb-6">
        <select className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600">
          <option value="">All Types</option>
          <option value="necessary">Necessary</option>
          <option value="functional">Functional</option>
          <option value="analytics">Analytics</option>
          <option value="marketing">Marketing</option>
        </select>
        <select className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600">
          <option value="">All Statuses</option>
          <option value="granted">Granted</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="expired">Expired</option>
        </select>
        <input 
          type="text" 
          placeholder="Search by email..."
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
        />
      </div>

      {/* Consent Records */}
      <div className="space-y-4">
        {consentRecords.map(consent => (
          <div key={consent.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  consent.status === 'granted' ? 'bg-green-900 text-green-200' :
                  consent.status === 'withdrawn' ? 'bg-red-900 text-red-200' :
                  'bg-yellow-900 text-yellow-200'
                }`}>
                  {consent.status.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  consent.consentType === 'necessary' ? 'bg-blue-900 text-blue-200' :
                  consent.consentType === 'functional' ? 'bg-purple-900 text-purple-200' :
                  consent.consentType === 'analytics' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-pink-900 text-pink-200'
                }`}>
                  {consent.consentType.toUpperCase()}
                </span>
              </div>
              <div className="text-right text-sm text-gray-400">
                <div>Granted: {new Date(consent.grantedAt).toLocaleDateString()}</div>
                {consent.withdrawnAt && (
                  <div>Withdrawn: {new Date(consent.withdrawnAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">{consent.userEmail}</h4>
                <p className="text-sm text-gray-300 mb-4">{consent.details.purpose}</p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Source:</span>
                    <span className="text-white ml-2 capitalize">{consent.source}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">IP Address:</span>
                    <span className="text-white ml-2">{consent.ipAddress}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Retention:</span>
                    <span className="text-white ml-2">{consent.details.retentionPeriod} days</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-white mb-2">Data Types:</h5>
                  <div className="flex flex-wrap gap-2">
                    {consent.details.dataTypes.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-white mb-2">Third Parties:</h5>
                  <div className="flex flex-wrap gap-2">
                    {consent.details.thirdParties.map((party, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                        {party}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                View Details
              </button>
              <button className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
                Update Consent
              </button>
              {consent.status === 'granted' && (
                <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                  Withdraw
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Data Requests
  const renderDataRequests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Data Subject Requests</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Request Analytics
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Export Report
          </button>
        </div>
      </div>

      {/* Request Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-blue-400">24</div>
          <div className="text-xs text-gray-400">Access Requests</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-yellow-400">12</div>
          <div className="text-xs text-gray-400">Rectification</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-red-400">8</div>
          <div className="text-xs text-gray-400">Erasure</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-green-400">5</div>
          <div className="text-xs text-gray-400">Portability</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-purple-400">3</div>
          <div className="text-xs text-gray-400">Restriction</div>
        </div>
      </div>

      {/* Request Processing Time Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-medium text-white mb-4">Average Processing Times</h4>
        <div className="space-y-3">
          {[
            { type: 'Access', time: '18 hours', percentage: 75, color: 'bg-blue-600' },
            { type: 'Rectification', time: '12 hours', percentage: 50, color: 'bg-yellow-600' },
            { type: 'Erasure', time: '36 hours', percentage: 90, color: 'bg-red-600' },
            { type: 'Portability', time: '24 hours', percentage: 60, color: 'bg-green-600' },
            { type: 'Restriction', time: '6 hours', percentage: 25, color: 'bg-purple-600' }
          ].map(item => (
            <div key={item.type} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-300">{item.type}</div>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className={`${item.color} h-2 rounded-full`} 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="w-16 text-sm text-gray-300 text-right">{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Requests List */}
      <div className="space-y-4">
        {dataRequests.map(request => (
          <div key={request.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.requestType === 'access' ? 'bg-blue-900 text-blue-200' :
                  request.requestType === 'rectification' ? 'bg-yellow-900 text-yellow-200' :
                  request.requestType === 'erasure' ? 'bg-red-900 text-red-200' :
                  request.requestType === 'portability' ? 'bg-green-900 text-green-200' :
                  'bg-purple-900 text-purple-200'
                }`}>
                  {request.requestType.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'completed' ? 'bg-green-900 text-green-200' :
                  request.status === 'in_progress' ? 'bg-yellow-900 text-yellow-200' :
                  request.status === 'rejected' ? 'bg-red-900 text-red-200' :
                  'bg-gray-900 text-gray-200'
                }`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-right text-sm text-gray-400">
                <div>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</div>
                {request.completedAt && (
                  <div>Completed: {new Date(request.completedAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">{request.userEmail}</h4>
                <p className="text-sm text-gray-300 mb-4">{request.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-white ml-2">{request.userId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Verification:</span>
                    <span className="text-white ml-2 capitalize">{request.verificationMethod.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Data Types:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.dataTypes.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          {type.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-white mb-2">Processing Notes:</h5>
                <div className="space-y-2">
                  {request.processingNotes.map((note, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="text-gray-300">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                View Details
              </button>
              {request.status === 'pending' && (
                <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                  Start Processing
                </button>
              )}
              {request.status === 'in_progress' && (
                <button className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
                  Update Status
                </button>
              )}
              <button className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
                Add Note
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Privacy Settings
  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Privacy Settings</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Settings
        </button>
      </div>

      {/* Data Retention Settings */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
          🗓️ Data Retention Policy
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default Retention Period (days)</label>
            <input 
              type="number" 
              value={privacySettings.dataRetention?.defaultPeriod || 730}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User Data Retention (days)</label>
            <input 
              type="number" 
              value={privacySettings.dataRetention?.userDataPeriod || 1095}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Logs Retention (days)</label>
            <input 
              type="number" 
              value={privacySettings.dataRetention?.logsPeriod || 365}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Backup Retention (days)</label>
            <input 
              type="number" 
              value={privacySettings.dataRetention?.backupPeriod || 180}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
        </div>

        <div className="flex items-center mt-4">
          <input 
            type="checkbox" 
            checked={privacySettings.dataRetention?.automaticDeletion || false}
            className="mr-2"
          />
          <label className="text-sm text-gray-300">Enable automatic deletion</label>
        </div>
      </div>

      {/* Cookie Settings */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">🍪 Cookie Policy</h4>
        
        <div className="space-y-4">
          {[
            { key: 'necessary', label: 'Necessary Cookies', description: 'Essential for basic website functionality' },
            { key: 'functional', label: 'Functional Cookies', description: 'Remember your preferences and settings' },
            { key: 'analytics', label: 'Analytics Cookies', description: 'Help us understand how visitors use our site' },
            { key: 'marketing', label: 'Marketing Cookies', description: 'Used to deliver personalized advertising' },
            { key: 'customization', label: 'Customization Cookies', description: 'Personalize content and user experience' }
          ].map(cookie => (
            <div key={cookie.key} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div>
                <h5 className="text-sm font-medium text-white">{cookie.label}</h5>
                <p className="text-xs text-gray-400">{cookie.description}</p>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={privacySettings.cookieSettings?.[cookie.key as keyof typeof privacySettings.cookieSettings] || false}
                  disabled={cookie.key === 'necessary'}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">
                  {cookie.key === 'necessary' ? 'Required' : 'Optional'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Processing Principles */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">⚖️ Data Processing Principles</h4>
        
        <div className="space-y-4">
          {[
            { key: 'minimization', label: 'Data Minimization', description: 'Collect only necessary data' },
            { key: 'purposeLimitation', label: 'Purpose Limitation', description: 'Use data only for stated purposes' },
            { key: 'accuracyMaintenance', label: 'Accuracy Maintenance', description: 'Keep data accurate and up-to-date' },
            { key: 'storageMinimization', label: 'Storage Minimization', description: 'Store data only as long as necessary' },
            { key: 'integrityConfidentiality', label: 'Integrity & Confidentiality', description: 'Ensure security and confidentiality' }
          ].map(principle => (
            <div key={principle.key} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div>
                <h5 className="text-sm font-medium text-white">{principle.label}</h5>
                <p className="text-xs text-gray-400">{principle.description}</p>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={privacySettings.dataProcessing?.[principle.key as keyof typeof privacySettings.dataProcessing] || false}
                  className="mr-2"
                />
                <span className={`px-2 py-1 rounded text-xs ${
                  privacySettings.dataProcessing?.[principle.key as keyof typeof privacySettings.dataProcessing] 
                    ? 'bg-green-900 text-green-200' 
                    : 'bg-red-900 text-red-200'
                }`}>
                  {privacySettings.dataProcessing?.[principle.key as keyof typeof privacySettings.dataProcessing] ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Third-Party Data Sharing */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">🤝 Third-Party Data Sharing</h4>
        
        <div className="space-y-4">
          {[
            { key: 'analyticsProviders', label: 'Analytics Providers', items: privacySettings.thirdPartySharing?.analyticsProviders || [] },
            { key: 'marketingPartners', label: 'Marketing Partners', items: privacySettings.thirdPartySharing?.marketingPartners || [] },
            { key: 'serviceProviders', label: 'Service Providers', items: privacySettings.thirdPartySharing?.serviceProviders || [] },
            { key: 'dataProcessors', label: 'Data Processors', items: privacySettings.thirdPartySharing?.dataProcessors || [] }
          ].map(category => (
            <div key={category.key} className="p-4 bg-gray-900 rounded-lg">
              <h5 className="text-sm font-medium text-white mb-2">{category.label}</h5>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs flex items-center">
                    {item}
                    <button className="ml-1 text-blue-200 hover:text-white">×</button>
                  </span>
                ))}
                <button className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                  Add Partner
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Data Mapping
  const renderDataMapping = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Data Mapping & Classification</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Data Type
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Export Mapping
          </button>
        </div>
      </div>

      {/* Data Classification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">12</div>
          <div className="text-sm text-gray-400">Personal Data Types</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">5</div>
          <div className="text-sm text-gray-400">Sensitive Data Types</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">8</div>
          <div className="text-sm text-gray-400">Public Data Types</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">15</div>
          <div className="text-sm text-gray-400">Internal Data Types</div>
        </div>
      </div>

      {/* Data Mapping Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Legal Basis</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Retention</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Encryption</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {dataMapping.map(item => (
                <tr key={item.id} className="hover:bg-gray-700">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">{item.dataType}</div>
                      <div className="text-xs text-gray-400">{item.purpose}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.category === 'personal' ? 'bg-blue-900 text-blue-200' :
                      item.category === 'sensitive' ? 'bg-red-900 text-red-200' :
                      item.category === 'public' ? 'bg-green-900 text-green-200' :
                      'bg-yellow-900 text-yellow-200'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-white capitalize">
                      {item.legalBasis.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-white">{item.retention} days</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-white">{item.location}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.encryption ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}>
                      {item.encryption ? 'Encrypted' : 'Not Encrypted'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">
                        Edit
                      </button>
                      <button className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Flow Visualization */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">Data Flow & Third-Party Sharing</h4>
        
        <div className="space-y-4">
          {dataMapping.map(item => (
            <div key={item.id} className="p-4 bg-gray-900 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-sm font-medium text-white">{item.dataType}</h5>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.category === 'personal' ? 'bg-blue-900 text-blue-200' :
                  item.category === 'sensitive' ? 'bg-red-900 text-red-200' :
                  item.category === 'public' ? 'bg-green-900 text-green-200' :
                  'bg-yellow-900 text-yellow-200'
                }`}>
                  {item.category}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="text-xs font-medium text-gray-400 mb-2">Access Rights:</h6>
                  <div className="flex flex-wrap gap-1">
                    {item.access.map((role, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-900 text-purple-200 rounded text-xs">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h6 className="text-xs font-medium text-gray-400 mb-2">Third Parties:</h6>
                  <div className="flex flex-wrap gap-1">
                    {item.thirdParties.map((party, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-900 text-orange-200 rounded text-xs">
                        {party}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Data Protection & Privacy Management</h1>
        <p className="text-gray-400">GDPR compliance, consent management, and data subject rights</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'consent', label: 'Consent Management', icon: '✅' },
          { id: 'requests', label: 'Data Requests', icon: '📋' },
          { id: 'privacy', label: 'Privacy Settings', icon: '🔒' },
          { id: 'mapping', label: 'Data Mapping', icon: '🗺️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === tab.id
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
      {activeSection === 'consent' && renderConsentManagement()}
      {activeSection === 'requests' && renderDataRequests()}
      {activeSection === 'privacy' && renderPrivacySettings()}
      {activeSection === 'mapping' && renderDataMapping()}
    </div>
  );
};