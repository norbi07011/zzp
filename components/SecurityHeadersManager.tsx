import React, { useState, useEffect } from 'react';

// Security Headers Manager - CSP, HSTS, and Security Headers Configuration
export const SecurityHeadersManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState('headers');
  const [securityHeaders, setSecurityHeaders] = useState<SecurityHeadersConfig>({});
  const [cspPolicy, setCspPolicy] = useState<CSPPolicy>({});
  const [securityTests, setSecurityTests] = useState<SecurityTest[]>([]);
  const [headerAnalysis, setHeaderAnalysis] = useState<HeaderAnalysis>({});

  // Security Headers Configuration Interface
  interface SecurityHeadersConfig {
    contentSecurityPolicy?: {
      enabled: boolean;
      reportOnly: boolean;
      directives: Record<string, string[]>;
    };
    strictTransportSecurity?: {
      enabled: boolean;
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
    xFrameOptions?: {
      enabled: boolean;
      value: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
      uri?: string;
    };
    xContentTypeOptions?: {
      enabled: boolean;
      value: 'nosniff';
    };
    referrerPolicy?: {
      enabled: boolean;
      value: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
    };
    permissionsPolicy?: {
      enabled: boolean;
      directives: Record<string, string[]>;
    };
    crossOriginEmbedderPolicy?: {
      enabled: boolean;
      value: 'unsafe-none' | 'require-corp';
    };
    crossOriginOpenerPolicy?: {
      enabled: boolean;
      value: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';
    };
    crossOriginResourcePolicy?: {
      enabled: boolean;
      value: 'cross-origin' | 'same-origin' | 'same-site';
    };
  }

  // CSP Policy Interface
  interface CSPPolicy {
    defaultSrc?: string[];
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    connectSrc?: string[];
    fontSrc?: string[];
    objectSrc?: string[];
    mediaSrc?: string[];
    frameSrc?: string[];
    childSrc?: string[];
    workerSrc?: string[];
    manifestSrc?: string[];
    prefetchSrc?: string[];
    baseUri?: string[];
    formAction?: string[];
    frameAncestors?: string[];
    reportUri?: string[];
    reportTo?: string[];
  }

  // Security Test Interface
  interface SecurityTest {
    id: string;
    name: string;
    category: 'headers' | 'csp' | 'hsts' | 'cookies' | 'tls' | 'misc';
    status: 'pass' | 'fail' | 'warning' | 'info';
    description: string;
    result: string;
    recommendation?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    lastTested: string;
  }

  // Header Analysis Interface
  interface HeaderAnalysis {
    score?: number;
    grade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    summary?: {
      total: number;
      passed: number;
      warnings: number;
      failed: number;
    };
    lastAnalysis?: string;
    improvements?: string[];
  }

  // Initialize mock data
  useEffect(() => {
    // Mock security headers configuration
    const mockHeaders: SecurityHeadersConfig = {
      contentSecurityPolicy: {
        enabled: true,
        reportOnly: false,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'", 'https://api.platform.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'object-src': ["'none'"],
          'media-src': ["'self'"],
          'frame-src': ["'none'"],
          'report-uri': ['/csp-report']
        }
      },
      strictTransportSecurity: {
        enabled: true,
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      xFrameOptions: {
        enabled: true,
        value: 'DENY'
      },
      xContentTypeOptions: {
        enabled: true,
        value: 'nosniff'
      },
      referrerPolicy: {
        enabled: true,
        value: 'strict-origin-when-cross-origin'
      },
      permissionsPolicy: {
        enabled: true,
        directives: {
          'geolocation': ['self'],
          'microphone': ['none'],
          'camera': ['none'],
          'payment': ['self'],
          'usb': ['none'],
          'magnetometer': ['none'],
          'gyroscope': ['none'],
          'accelerometer': ['none']
        }
      },
      crossOriginEmbedderPolicy: {
        enabled: true,
        value: 'require-corp'
      },
      crossOriginOpenerPolicy: {
        enabled: true,
        value: 'same-origin'
      },
      crossOriginResourcePolicy: {
        enabled: true,
        value: 'same-origin'
      }
    };

    // Mock CSP policy
    const mockCSP: CSPPolicy = {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://www.google-analytics.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'https://www.google-analytics.com'],
      connectSrc: ["'self'", 'https://api.platform.com', 'https://analytics.google.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      reportUri: ['/csp-report']
    };

    // Mock security tests
    const mockTests: SecurityTest[] = [
      {
        id: '1',
        name: 'Content Security Policy',
        category: 'csp',
        status: 'pass',
        description: 'CSP header is present and properly configured',
        result: 'CSP header found with restrictive policy',
        recommendation: 'Consider removing unsafe-inline from script-src',
        severity: 'medium',
        lastTested: '2025-01-08T14:30:00Z'
      },
      {
        id: '2',
        name: 'HTTP Strict Transport Security',
        category: 'hsts',
        status: 'pass',
        description: 'HSTS header enforces HTTPS connections',
        result: 'HSTS enabled with 1 year max-age and includeSubDomains',
        severity: 'low',
        lastTested: '2025-01-08T14:30:00Z'
      },
      {
        id: '3',
        name: 'X-Frame-Options',
        category: 'headers',
        status: 'pass',
        description: 'Prevents clickjacking attacks',
        result: 'X-Frame-Options set to DENY',
        severity: 'low',
        lastTested: '2025-01-08T14:30:00Z'
      },
      {
        id: '4',
        name: 'X-Content-Type-Options',
        category: 'headers',
        status: 'pass',
        description: 'Prevents MIME type sniffing',
        result: 'X-Content-Type-Options set to nosniff',
        severity: 'low',
        lastTested: '2025-01-08T14:30:00Z'
      },
      {
        id: '5',
        name: 'Referrer Policy',
        category: 'headers',
        status: 'warning',
        description: 'Controls referrer information sent with requests',
        result: 'Referrer-Policy set to strict-origin-when-cross-origin',
        recommendation: 'Consider using no-referrer for better privacy',
        severity: 'low',
        lastTested: '2025-01-08T14:30:00Z'
      },
      {
        id: '6',
        name: 'Permissions Policy',
        category: 'headers',
        status: 'pass',
        description: 'Controls browser features and APIs',
        result: 'Permissions-Policy properly configured',
        severity: 'low',
        lastTested: '2025-01-08T14:30:00Z'
      },
      {
        id: '7',
        name: 'TLS Configuration',
        category: 'tls',
        status: 'pass',
        description: 'TLS version and cipher suite analysis',
        result: 'TLS 1.3 enabled with strong cipher suites',
        severity: 'low',
        lastTested: '2025-01-08T14:30:00Z'
      },
      {
        id: '8',
        name: 'Cookie Security',
        category: 'cookies',
        status: 'warning',
        description: 'Cookie security attributes analysis',
        result: 'Some cookies missing Secure or SameSite attributes',
        recommendation: 'Add Secure and SameSite=Strict to all cookies',
        severity: 'medium',
        lastTested: '2025-01-08T14:30:00Z'
      }
    ];

    // Mock header analysis
    const mockAnalysis: HeaderAnalysis = {
      score: 87,
      grade: 'B',
      summary: {
        total: 15,
        passed: 12,
        warnings: 2,
        failed: 1
      },
      lastAnalysis: '2025-01-08T14:30:00Z',
      improvements: [
        'Remove unsafe-inline from CSP script-src directive',
        'Add Secure attribute to all cookies',
        'Implement Certificate Transparency monitoring',
        'Consider adding Expect-CT header'
      ]
    };

    setSecurityHeaders(mockHeaders);
    setCspPolicy(mockCSP);
    setSecurityTests(mockTests);
    setHeaderAnalysis(mockAnalysis);
  }, []);

  // Render Security Headers Configuration
  const renderHeadersConfig = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Security Headers Configuration</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Test Headers
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Deploy Config
          </button>
        </div>
      </div>

      {/* Security Score Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white">Security Score</h4>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">{headerAnalysis.score}</div>
            <div className="text-sm text-gray-400">Grade: {headerAnalysis.grade}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Security Posture</span>
            <span>{headerAnalysis.score}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full" 
              style={{ width: `${headerAnalysis.score}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">{headerAnalysis.summary?.passed}</div>
            <div className="text-xs text-gray-400">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">{headerAnalysis.summary?.warnings}</div>
            <div className="text-xs text-gray-400">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">{headerAnalysis.summary?.failed}</div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">{headerAnalysis.summary?.total}</div>
            <div className="text-xs text-gray-400">Total Tests</div>
          </div>
        </div>
      </div>

      {/* Content Security Policy */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white flex items-center">
            🛡️ Content Security Policy (CSP)
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              securityHeaders.contentSecurityPolicy?.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              {securityHeaders.contentSecurityPolicy?.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </h4>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-300">Report Only:</label>
            <input 
              type="checkbox" 
              checked={securityHeaders.contentSecurityPolicy?.reportOnly || false}
            />
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(securityHeaders.contentSecurityPolicy?.directives || {}).map(([directive, sources]) => (
            <div key={directive} className="p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-white">{directive}</h5>
                <button className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">
                  Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
          <h5 className="text-sm font-medium text-yellow-200 mb-1">⚠️ Recommendation</h5>
          <p className="text-xs text-yellow-300">Consider removing 'unsafe-inline' from script-src for better security</p>
        </div>
      </div>

      {/* HTTP Strict Transport Security */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white flex items-center">
            🔒 HTTP Strict Transport Security (HSTS)
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              securityHeaders.strictTransportSecurity?.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              {securityHeaders.strictTransportSecurity?.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Age (seconds)</label>
            <input 
              type="number" 
              value={securityHeaders.strictTransportSecurity?.maxAge || 31536000}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={securityHeaders.strictTransportSecurity?.includeSubDomains || false}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Include Subdomains</label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={securityHeaders.strictTransportSecurity?.preload || false}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Preload</label>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
          <h5 className="text-sm font-medium text-blue-200 mb-1">ℹ️ Generated Header</h5>
          <code className="text-xs text-blue-300 font-mono">
            Strict-Transport-Security: max-age={securityHeaders.strictTransportSecurity?.maxAge}
            {securityHeaders.strictTransportSecurity?.includeSubDomains ? '; includeSubDomains' : ''}
            {securityHeaders.strictTransportSecurity?.preload ? '; preload' : ''}
          </code>
        </div>
      </div>

      {/* Other Security Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* X-Frame-Options */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-medium text-white mb-4 flex items-center">
            🖼️ X-Frame-Options
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              securityHeaders.xFrameOptions?.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              {securityHeaders.xFrameOptions?.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </h4>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Policy</label>
            <select 
              value={securityHeaders.xFrameOptions?.value || 'DENY'}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            >
              <option value="DENY">DENY</option>
              <option value="SAMEORIGIN">SAMEORIGIN</option>
              <option value="ALLOW-FROM">ALLOW-FROM</option>
            </select>
          </div>
        </div>

        {/* X-Content-Type-Options */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-medium text-white mb-4 flex items-center">
            📄 X-Content-Type-Options
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              securityHeaders.xContentTypeOptions?.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              {securityHeaders.xContentTypeOptions?.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </h4>
          
          <div className="text-sm text-gray-300">
            <p>Prevents MIME type sniffing attacks</p>
            <code className="text-blue-300 bg-gray-900 px-2 py-1 rounded mt-2 inline-block">
              X-Content-Type-Options: nosniff
            </code>
          </div>
        </div>

        {/* Referrer Policy */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-medium text-white mb-4 flex items-center">
            🔗 Referrer Policy
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              securityHeaders.referrerPolicy?.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              {securityHeaders.referrerPolicy?.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </h4>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Policy</label>
            <select 
              value={securityHeaders.referrerPolicy?.value || 'strict-origin-when-cross-origin'}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            >
              <option value="no-referrer">no-referrer</option>
              <option value="no-referrer-when-downgrade">no-referrer-when-downgrade</option>
              <option value="origin">origin</option>
              <option value="origin-when-cross-origin">origin-when-cross-origin</option>
              <option value="same-origin">same-origin</option>
              <option value="strict-origin">strict-origin</option>
              <option value="strict-origin-when-cross-origin">strict-origin-when-cross-origin</option>
              <option value="unsafe-url">unsafe-url</option>
            </select>
          </div>
        </div>

        {/* Permissions Policy */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-medium text-white mb-4 flex items-center">
            🎛️ Permissions Policy
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              securityHeaders.permissionsPolicy?.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              {securityHeaders.permissionsPolicy?.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </h4>
          
          <div className="space-y-2">
            {Object.entries(securityHeaders.permissionsPolicy?.directives || {}).slice(0, 3).map(([feature, allowlist]) => (
              <div key={feature} className="flex justify-between items-center text-sm">
                <span className="text-gray-300 capitalize">{feature}:</span>
                <span className="text-white">{allowlist.join(', ')}</span>
              </div>
            ))}
            <button className="text-xs text-blue-400 hover:text-blue-300">View All Permissions</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Security Tests
  const renderSecurityTests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Security Tests & Analysis</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Run All Tests
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Export Report
          </button>
        </div>
      </div>

      {/* Test Categories Filter */}
      <div className="flex space-x-2 mb-6">
        {['all', 'headers', 'csp', 'hsts', 'cookies', 'tls', 'misc'].map(category => (
          <button
            key={category}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm capitalize"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Security Tests Results */}
      <div className="space-y-4">
        {securityTests.map(test => (
          <div key={test.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className={`w-4 h-4 rounded-full ${
                  test.status === 'pass' ? 'bg-green-500' :
                  test.status === 'warning' ? 'bg-yellow-500' :
                  test.status === 'fail' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></span>
                <div>
                  <h4 className="text-lg font-medium text-white">{test.name}</h4>
                  <p className="text-sm text-gray-400">{test.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.severity === 'critical' ? 'bg-red-900 text-red-200' :
                  test.severity === 'high' ? 'bg-orange-900 text-orange-200' :
                  test.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-blue-900 text-blue-200'
                }`}>
                  {test.severity.toUpperCase()}
                </span>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(test.lastTested).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="text-sm font-medium text-white mb-2">Test Result:</h5>
              <p className="text-sm text-gray-300 bg-gray-900 p-3 rounded-lg">{test.result}</p>
            </div>

            {test.recommendation && (
              <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                <h5 className="text-sm font-medium text-yellow-200 mb-1">💡 Recommendation</h5>
                <p className="text-xs text-yellow-300">{test.recommendation}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-4">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Retest
              </button>
              {test.status === 'fail' && (
                <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                  Fix Issue
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render CSP Builder
  const renderCSPBuilder = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">CSP Policy Builder</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Validate Policy
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Generate Header
          </button>
        </div>
      </div>

      {/* CSP Directives */}
      <div className="space-y-4">
        {Object.entries(cspPolicy).map(([directive, sources]) => (
          <div key={directive} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-white">{directive.replace(/([A-Z])/g, '-$1').toLowerCase()}</h4>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                  Add Source
                </button>
                <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                  Remove
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {sources?.map((source: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-blue-900 text-blue-200 rounded-lg text-sm flex items-center">
                  {source}
                  <button className="ml-2 text-blue-200 hover:text-white">×</button>
                </span>
              )) || []}
            </div>

            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Add new source..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 text-sm"
              />
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                Add
              </button>
            </div>

            {/* Common Sources Suggestions */}
            <div className="mt-3">
              <div className="text-xs text-gray-400 mb-2">Common sources:</div>
              <div className="flex flex-wrap gap-1">
                {["'self'", "'unsafe-inline'", "'unsafe-eval'", "'none'", "https:", "data:"].map(suggestion => (
                  <button 
                    key={suggestion}
                    className="px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-xs"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generated CSP Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">Generated CSP Header</h4>
        <div className="bg-gray-900 p-4 rounded-lg">
          <code className="text-sm text-green-400 font-mono whitespace-pre-wrap">
            {Object.entries(cspPolicy)
              .filter(([_, sources]) => sources && sources.length > 0)
              .map(([directive, sources]) => 
                `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${sources?.join(' ')}`
              )
              .join('; ')
            }
          </code>
        </div>
        <div className="mt-3 flex space-x-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Copy Header
          </button>
          <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
            Test Policy
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Security Headers Management</h1>
        <p className="text-gray-400">Configure CSP, HSTS, and security headers for enhanced protection</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'headers', label: 'Security Headers', icon: '🛡️' },
          { id: 'tests', label: 'Security Tests', icon: '🧪' },
          { id: 'csp', label: 'CSP Builder', icon: '📝' }
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
      {activeSection === 'headers' && renderHeadersConfig()}
      {activeSection === 'tests' && renderSecurityTests()}
      {activeSection === 'csp' && renderCSPBuilder()}
    </div>
  );
};