import React, { useState, useEffect } from 'react';

// Final Production Optimizer - Complete production readiness and optimization system
export const FinalProductionOptimizer: React.FC = () => {
  const [activeSection, setActiveSection] = useState('readiness');
  const [productionStatus, setProductionStatus] = useState<ProductionStatus>({});
  const [deploymentChecklist, setDeploymentChecklist] = useState<DeploymentCheck[]>([]);
  const [performanceBaseline, setPerformanceBaseline] = useState<PerformanceBaseline>({});
  const [securityAudit, setSecurityAudit] = useState<SecurityAudit>({});
  const [optimizationTasks, setOptimizationTasks] = useState<OptimizationTask[]>([]);

  // Production Status Interface
  interface ProductionStatus {
    overall?: {
      score: number;
      status: 'ready' | 'needs_attention' | 'not_ready';
      readinessPercentage: number;
      estimatedGoLive: string;
    };
    categories?: {
      performance: { score: number; status: string; issues: number };
      security: { score: number; status: string; issues: number };
      scalability: { score: number; status: string; issues: number };
      reliability: { score: number; status: string; issues: number };
      monitoring: { score: number; status: string; issues: number };
      compliance: { score: number; status: string; issues: number };
    };
    criticalIssues?: number;
    warningIssues?: number;
    recommendations?: string[];
  }

  // Deployment Check Interface
  interface DeploymentCheck {
    id: string;
    category: 'infrastructure' | 'application' | 'database' | 'security' | 'monitoring' | 'compliance';
    title: string;
    description: string;
    status: 'passed' | 'failed' | 'warning' | 'pending';
    priority: 'critical' | 'high' | 'medium' | 'low';
    automatable: boolean;
    lastChecked: string;
    details: {
      expected: string;
      actual: string;
      impact: string;
      remediation: string;
    };
  }

  // Performance Baseline Interface
  interface PerformanceBaseline {
    metrics?: {
      loadTime: { baseline: number; current: number; target: number; trend: string };
      firstContentfulPaint: { baseline: number; current: number; target: number; trend: string };
      largestContentfulPaint: { baseline: number; current: number; target: number; trend: string };
      cumulativeLayoutShift: { baseline: number; current: number; target: number; trend: string };
      firstInputDelay: { baseline: number; current: number; target: number; trend: string };
      throughput: { baseline: number; current: number; target: number; trend: string };
    };
    loadTesting?: {
      maxConcurrentUsers: number;
      averageResponseTime: number;
      errorRate: number;
      breakingPoint: number;
      status: 'passed' | 'failed' | 'warning';
    };
    optimization?: {
      bundleSize: { before: number; after: number; reduction: number };
      imageOptimization: { before: number; after: number; reduction: number };
      cacheHitRate: number;
      cdnPerformance: number;
    };
  }

  // Security Audit Interface
  interface SecurityAudit {
    vulnerabilities?: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      total: number;
    };
    compliance?: {
      gdpr: { score: number; status: string; issues: string[] };
      iso27001: { score: number; status: string; issues: string[] };
      soc2: { score: number; status: string; issues: string[] };
      pci: { score: number; status: string; issues: string[] };
    };
    penetrationTest?: {
      lastRun: string;
      status: 'passed' | 'failed' | 'in_progress';
      findings: number;
      severity: string;
    };
    securityHeaders?: {
      score: number;
      headers: { name: string; status: 'present' | 'missing' | 'misconfigured' }[];
    };
  }

  // Optimization Task Interface
  interface OptimizationTask {
    id: string;
    title: string;
    category: 'performance' | 'security' | 'scalability' | 'reliability' | 'cost';
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    estimatedImpact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    description: string;
    steps: string[];
    metrics: {
      before: number;
      after: number;
      improvement: number;
      unit: string;
    };
    automatable: boolean;
  }

  // Initialize mock data
  useEffect(() => {
    const mockProductionStatus: ProductionStatus = {
      overall: {
        score: 94,
        status: 'ready',
        readinessPercentage: 96.5,
        estimatedGoLive: '2025-10-10'
      },
      categories: {
        performance: { score: 96, status: 'excellent', issues: 1 },
        security: { score: 94, status: 'strong', issues: 2 },
        scalability: { score: 92, status: 'good', issues: 3 },
        reliability: { score: 98, status: 'excellent', issues: 0 },
        monitoring: { score: 95, status: 'strong', issues: 1 },
        compliance: { score: 89, status: 'acceptable', issues: 4 }
      },
      criticalIssues: 0,
      warningIssues: 11,
      recommendations: [
        'Complete final security header configurations',
        'Implement advanced monitoring alerts',
        'Finalize compliance documentation',
        'Optimize database connection pooling',
        'Set up production-grade logging'
      ]
    };

    const mockDeploymentChecklist: DeploymentCheck[] = [
      {
        id: 'infra-1',
        category: 'infrastructure',
        title: 'Load Balancer Configuration',
        description: 'Verify load balancer is properly configured with health checks',
        status: 'passed',
        priority: 'critical',
        automatable: true,
        lastChecked: '2025-10-08 14:30',
        details: {
          expected: 'Multi-AZ load balancer with health checks enabled',
          actual: 'Configured with 3 availability zones, health checks active',
          impact: 'High availability and traffic distribution',
          remediation: 'N/A - Check passed'
        }
      },
      {
        id: 'infra-2',
        category: 'infrastructure',
        title: 'Auto Scaling Groups',
        description: 'Ensure auto scaling groups are properly configured',
        status: 'passed',
        priority: 'critical',
        automatable: true,
        lastChecked: '2025-10-08 14:25',
        details: {
          expected: 'ASG with min 2, max 10 instances, proper scaling policies',
          actual: 'Configured: min 2, max 10, CPU-based scaling',
          impact: 'Automatic capacity management',
          remediation: 'N/A - Check passed'
        }
      },
      {
        id: 'app-1',
        category: 'application',
        title: 'Environment Variables',
        description: 'All required environment variables are set',
        status: 'warning',
        priority: 'high',
        automatable: false,
        lastChecked: '2025-10-08 14:20',
        details: {
          expected: 'All production environment variables configured',
          actual: 'Missing SMTP_PASSWORD and ANALYTICS_KEY',
          impact: 'Email functionality and analytics may not work',
          remediation: 'Set missing environment variables in production'
        }
      },
      {
        id: 'db-1',
        category: 'database',
        title: 'Database Backup Strategy',
        description: 'Automated backups are configured and tested',
        status: 'passed',
        priority: 'critical',
        automatable: true,
        lastChecked: '2025-10-08 14:15',
        details: {
          expected: 'Daily automated backups with 30-day retention',
          actual: 'Configured: daily backups, 30-day retention, tested restore',
          impact: 'Data protection and disaster recovery',
          remediation: 'N/A - Check passed'
        }
      },
      {
        id: 'sec-1',
        category: 'security',
        title: 'SSL/TLS Configuration',
        description: 'SSL certificates are valid and properly configured',
        status: 'passed',
        priority: 'critical',
        automatable: true,
        lastChecked: '2025-10-08 14:10',
        details: {
          expected: 'Valid SSL certificate with A+ rating',
          actual: 'Valid certificate, A+ SSL Labs rating',
          impact: 'Secure communications',
          remediation: 'N/A - Check passed'
        }
      },
      {
        id: 'sec-2',
        category: 'security',
        title: 'Security Headers',
        description: 'All required security headers are present',
        status: 'warning',
        priority: 'medium',
        automatable: true,
        lastChecked: '2025-10-08 14:05',
        details: {
          expected: 'All OWASP recommended security headers',
          actual: 'Missing Content-Security-Policy header',
          impact: 'Reduced XSS protection',
          remediation: 'Add Content-Security-Policy header'
        }
      },
      {
        id: 'mon-1',
        category: 'monitoring',
        title: 'Application Monitoring',
        description: 'Comprehensive monitoring and alerting is configured',
        status: 'passed',
        priority: 'high',
        automatable: true,
        lastChecked: '2025-10-08 14:00',
        details: {
          expected: 'Full application monitoring with alerts',
          actual: 'Monitoring active, alerts configured for critical metrics',
          impact: 'Proactive issue detection and resolution',
          remediation: 'N/A - Check passed'
        }
      },
      {
        id: 'comp-1',
        category: 'compliance',
        title: 'GDPR Compliance',
        description: 'GDPR requirements are implemented',
        status: 'warning',
        priority: 'high',
        automatable: false,
        lastChecked: '2025-10-08 13:55',
        details: {
          expected: 'Full GDPR compliance implementation',
          actual: 'Cookie consent implemented, data retention policy missing',
          impact: 'Legal compliance risk',
          remediation: 'Implement data retention and deletion policies'
        }
      }
    ];

    const mockPerformanceBaseline: PerformanceBaseline = {
      metrics: {
        loadTime: { baseline: 2.8, current: 1.4, target: 1.5, trend: 'improving' },
        firstContentfulPaint: { baseline: 1.8, current: 0.9, target: 1.0, trend: 'improving' },
        largestContentfulPaint: { baseline: 3.2, current: 1.6, target: 2.0, trend: 'improving' },
        cumulativeLayoutShift: { baseline: 0.15, current: 0.08, target: 0.1, trend: 'improving' },
        firstInputDelay: { baseline: 120, current: 45, target: 100, trend: 'improving' },
        throughput: { baseline: 1200, current: 2150, target: 2000, trend: 'improving' }
      },
      loadTesting: {
        maxConcurrentUsers: 5000,
        averageResponseTime: 180,
        errorRate: 0.02,
        breakingPoint: 8500,
        status: 'passed'
      },
      optimization: {
        bundleSize: { before: 2800, after: 2100, reduction: 25 },
        imageOptimization: { before: 1500, after: 450, reduction: 70 },
        cacheHitRate: 87.5,
        cdnPerformance: 92.3
      }
    };

    const mockSecurityAudit: SecurityAudit = {
      vulnerabilities: {
        critical: 0,
        high: 1,
        medium: 3,
        low: 7,
        total: 11
      },
      compliance: {
        gdpr: { score: 89, status: 'compliant', issues: ['Data retention policy incomplete'] },
        iso27001: { score: 92, status: 'compliant', issues: [] },
        soc2: { score: 94, status: 'compliant', issues: [] },
        pci: { score: 87, status: 'compliant', issues: ['Quarterly vulnerability scans pending'] }
      },
      penetrationTest: {
        lastRun: '2025-10-05',
        status: 'passed',
        findings: 3,
        severity: 'low'
      },
      securityHeaders: {
        score: 85,
        headers: [
          { name: 'X-Frame-Options', status: 'present' },
          { name: 'X-Content-Type-Options', status: 'present' },
          { name: 'X-XSS-Protection', status: 'present' },
          { name: 'Strict-Transport-Security', status: 'present' },
          { name: 'Content-Security-Policy', status: 'missing' },
          { name: 'Referrer-Policy', status: 'present' }
        ]
      }
    };

    const mockOptimizationTasks: OptimizationTask[] = [
      {
        id: 'opt-1',
        title: 'Implement Content Security Policy',
        category: 'security',
        priority: 'high',
        status: 'pending',
        estimatedImpact: 'medium',
        effort: 'low',
        description: 'Add Content-Security-Policy header to prevent XSS attacks',
        steps: [
          'Define CSP policy for application',
          'Test policy in report-only mode',
          'Implement policy in production',
          'Monitor for violations'
        ],
        metrics: {
          before: 85,
          after: 95,
          improvement: 10,
          unit: 'security score'
        },
        automatable: true
      },
      {
        id: 'opt-2',
        title: 'Optimize Database Connection Pooling',
        category: 'performance',
        priority: 'medium',
        status: 'in_progress',
        estimatedImpact: 'high',
        effort: 'medium',
        description: 'Fine-tune database connection pool settings for optimal performance',
        steps: [
          'Analyze current connection patterns',
          'Adjust pool min/max settings',
          'Implement connection lifecycle monitoring',
          'Test under load'
        ],
        metrics: {
          before: 35,
          after: 50,
          improvement: 43,
          unit: '% pool utilization'
        },
        automatable: false
      },
      {
        id: 'opt-3',
        title: 'Enable Advanced Caching',
        category: 'performance',
        priority: 'high',
        status: 'completed',
        estimatedImpact: 'high',
        effort: 'medium',
        description: 'Implement Redis caching for frequently accessed data',
        steps: [
          'Set up Redis cluster',
          'Implement cache warming strategies',
          'Add cache invalidation logic',
          'Monitor cache hit rates'
        ],
        metrics: {
          before: 60,
          after: 87.5,
          improvement: 46,
          unit: '% cache hit rate'
        },
        automatable: true
      },
      {
        id: 'opt-4',
        title: 'Implement Horizontal Pod Autoscaling',
        category: 'scalability',
        priority: 'high',
        status: 'completed',
        estimatedImpact: 'high',
        effort: 'high',
        description: 'Set up intelligent auto-scaling based on multiple metrics',
        steps: [
          'Configure HPA with custom metrics',
          'Set up predictive scaling',
          'Implement cost optimization rules',
          'Test scaling scenarios'
        ],
        metrics: {
          before: 5,
          after: 20,
          improvement: 300,
          unit: 'max instances'
        },
        automatable: true
      },
      {
        id: 'opt-5',
        title: 'Complete GDPR Data Retention Policy',
        category: 'reliability',
        priority: 'high',
        status: 'pending',
        estimatedImpact: 'medium',
        effort: 'high',
        description: 'Implement automated data retention and deletion policies',
        steps: [
          'Define data retention periods',
          'Implement automated deletion jobs',
          'Create user data export functionality',
          'Document compliance procedures'
        ],
        metrics: {
          before: 89,
          after: 95,
          improvement: 7,
          unit: 'compliance score'
        },
        automatable: true
      }
    ];

    setProductionStatus(mockProductionStatus);
    setDeploymentChecklist(mockDeploymentChecklist);
    setPerformanceBaseline(mockPerformanceBaseline);
    setSecurityAudit(mockSecurityAudit);
    setOptimizationTasks(mockOptimizationTasks);
  }, []);

  // Render Production Readiness
  const renderProductionReadiness = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Production Readiness Assessment</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Run Full Audit
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-medium text-white">Overall Production Status</h4>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {productionStatus.overall?.score}%
              </div>
              <div className="text-sm text-gray-400">Production Score</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              productionStatus.overall?.status === 'ready' ? 'bg-green-900 text-green-200' :
              productionStatus.overall?.status === 'needs_attention' ? 'bg-yellow-900 text-yellow-200' :
              'bg-red-900 text-red-200'
            }`}>
              {productionStatus.overall?.status?.toUpperCase().replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {productionStatus.overall?.readinessPercentage}%
            </div>
            <div className="text-sm text-gray-400">Readiness</div>
            <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
              <div 
                className="h-3 bg-green-600 rounded-full"
                style={{ width: `${productionStatus.overall?.readinessPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {productionStatus.criticalIssues}
            </div>
            <div className="text-sm text-gray-400">Critical Issues</div>
            <div className="text-xs text-green-400 mt-1">All resolved ✓</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {productionStatus.warningIssues}
            </div>
            <div className="text-sm text-gray-400">Warning Issues</div>
            <div className="text-xs text-yellow-400 mt-1">Being addressed</div>
          </div>
        </div>

        <div className="p-4 bg-green-900 border border-green-700 rounded-lg">
          <h5 className="text-sm font-medium text-green-200 mb-2">🎯 Estimated Go-Live Date</h5>
          <div className="text-lg font-bold text-green-100">
            {productionStatus.overall?.estimatedGoLive}
          </div>
          <div className="text-sm text-green-300 mt-1">
            Based on current progress and remaining tasks
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Category Assessment</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(productionStatus.categories || {}).map(([category, data]) => (
            <div key={category} className="p-4 bg-gray-900 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-sm font-medium text-white capitalize">
                  {category.replace('_', ' ')}
                </h5>
                <span className={`px-2 py-1 rounded text-xs ${
                  data.status === 'excellent' ? 'bg-green-900 text-green-200' :
                  data.status === 'strong' || data.status === 'good' ? 'bg-blue-900 text-blue-200' :
                  data.status === 'acceptable' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-red-900 text-red-200'
                }`}>
                  {data.status}
                </span>
              </div>
              
              <div className="text-2xl font-bold text-white mb-2">
                {data.score}%
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full ${
                    data.score >= 90 ? 'bg-green-600' :
                    data.score >= 80 ? 'bg-blue-600' :
                    data.score >= 70 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${data.score}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-400">
                {data.issues} issue{data.issues !== 1 ? 's' : ''} remaining
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Production Recommendations</h4>
        
        <div className="space-y-3">
          {productionStatus.recommendations?.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-900 border border-blue-700 rounded-lg">
              <span className="text-blue-400 mt-0.5">💡</span>
              <div className="flex-1">
                <p className="text-sm text-blue-200">{rec}</p>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                Action
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Deployment Checklist
  const renderDeploymentChecklist = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Deployment Checklist</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Run All Checks
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Export Checklist
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Passed', count: deploymentChecklist.filter(c => c.status === 'passed').length, color: 'green' },
          { label: 'Warning', count: deploymentChecklist.filter(c => c.status === 'warning').length, color: 'yellow' },
          { label: 'Failed', count: deploymentChecklist.filter(c => c.status === 'failed').length, color: 'red' },
          { label: 'Pending', count: deploymentChecklist.filter(c => c.status === 'pending').length, color: 'blue' }
        ].map(stat => (
          <div key={stat.label} className="text-center p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>
              {stat.count}
            </div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'infrastructure', 'application', 'database', 'security', 'monitoring', 'compliance'].map(filter => (
          <button
            key={filter}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm capitalize"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {deploymentChecklist.map(check => (
          <div key={check.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`w-3 h-3 rounded-full ${
                    check.status === 'passed' ? 'bg-green-500' :
                    check.status === 'warning' ? 'bg-yellow-500' :
                    check.status === 'failed' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></span>
                  <h4 className="text-lg font-medium text-white">{check.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    check.category === 'infrastructure' ? 'bg-purple-900 text-purple-200' :
                    check.category === 'application' ? 'bg-blue-900 text-blue-200' :
                    check.category === 'database' ? 'bg-green-900 text-green-200' :
                    check.category === 'security' ? 'bg-red-900 text-red-200' :
                    check.category === 'monitoring' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-gray-900 text-gray-200'
                  }`}>
                    {check.category}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{check.description}</p>
                <div className="text-xs text-gray-500">
                  Last checked: {check.lastChecked}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  check.priority === 'critical' ? 'bg-red-900 text-red-200' :
                  check.priority === 'high' ? 'bg-orange-900 text-orange-200' :
                  check.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-gray-900 text-gray-200'
                }`}>
                  {check.priority}
                </span>
                {check.automatable && (
                  <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs">
                    Auto
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-white mb-2">Expected vs Actual</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Expected: </span>
                    <span className="text-white">{check.details.expected}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Actual: </span>
                    <span className={check.status === 'passed' ? 'text-green-400' : 
                                   check.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}>
                      {check.details.actual}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-white mb-2">Impact & Remediation</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Impact: </span>
                    <span className="text-white">{check.details.impact}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Remediation: </span>
                    <span className="text-blue-400">{check.details.remediation}</span>
                  </div>
                </div>
              </div>
            </div>

            {check.status !== 'passed' && (
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Fix Now
                </button>
                <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                  Recheck
                </button>
                <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
                  Skip
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render Performance Baseline
  const renderPerformanceBaseline = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Performance Baseline</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Run Load Test
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Update Baseline
          </button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Core Web Vitals</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Object.entries(performanceBaseline.metrics || {}).map(([metric, data]) => (
            <div key={metric} className="text-center p-4 bg-gray-900 rounded-lg">
              <h5 className="text-xs text-gray-400 mb-2 uppercase">
                {metric.replace(/([A-Z])/g, ' $1').trim()}
              </h5>
              <div className="text-xl font-bold text-green-400 mb-1">
                {data.current}{metric.includes('Time') || metric.includes('Paint') ? 's' : 
                              metric.includes('Delay') ? 'ms' : ''}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                Target: {data.target}{metric.includes('Time') || metric.includes('Paint') ? 's' : 
                                    metric.includes('Delay') ? 'ms' : ''}
              </div>
              <div className={`text-xs ${
                data.trend === 'improving' ? 'text-green-400' : 
                data.trend === 'stable' ? 'text-blue-400' : 'text-red-400'
              }`}>
                {data.trend === 'improving' ? '📈' : data.trend === 'stable' ? '➡️' : '📉'} 
                {data.trend}
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    data.current <= data.target ? 'bg-green-600' : 'bg-yellow-600'
                  }`}
                  style={{ width: `${Math.min((data.current / data.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load Testing Results */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Load Testing Results</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {performanceBaseline.loadTesting?.maxConcurrentUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Max Concurrent Users</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {performanceBaseline.loadTesting?.averageResponseTime}ms
            </div>
            <div className="text-sm text-gray-400">Avg Response Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {performanceBaseline.loadTesting?.errorRate.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-400">Error Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {performanceBaseline.loadTesting?.breakingPoint.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Breaking Point</div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${
          performanceBaseline.loadTesting?.status === 'passed' ? 'bg-green-900 border border-green-700' :
          performanceBaseline.loadTesting?.status === 'warning' ? 'bg-yellow-900 border border-yellow-700' :
          'bg-red-900 border border-red-700'
        }`}>
          <h5 className={`text-sm font-medium mb-2 ${
            performanceBaseline.loadTesting?.status === 'passed' ? 'text-green-200' :
            performanceBaseline.loadTesting?.status === 'warning' ? 'text-yellow-200' :
            'text-red-200'
          }`}>
            Load Test Status: {performanceBaseline.loadTesting?.status?.toUpperCase()}
          </h5>
          <p className={`text-sm ${
            performanceBaseline.loadTesting?.status === 'passed' ? 'text-green-100' :
            performanceBaseline.loadTesting?.status === 'warning' ? 'text-yellow-100' :
            'text-red-100'
          }`}>
            System handled {performanceBaseline.loadTesting?.maxConcurrentUsers.toLocaleString()} concurrent users 
            with {performanceBaseline.loadTesting?.averageResponseTime}ms average response time and 
            {performanceBaseline.loadTesting?.errorRate.toFixed(2)}% error rate.
          </p>
        </div>
      </div>

      {/* Optimization Results */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Optimization Results</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm text-gray-400 mb-3">Bundle Size Optimization</h5>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Before:</span>
              <span className="text-sm text-white">{performanceBaseline.optimization?.bundleSize.before}KB</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">After:</span>
              <span className="text-sm text-green-400">{performanceBaseline.optimization?.bundleSize.after}KB</span>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                -{performanceBaseline.optimization?.bundleSize.reduction}%
              </div>
              <div className="text-xs text-gray-400">Size Reduction</div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm text-gray-400 mb-3">Image Optimization</h5>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Before:</span>
              <span className="text-sm text-white">{performanceBaseline.optimization?.imageOptimization.before}KB</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">After:</span>
              <span className="text-sm text-green-400">{performanceBaseline.optimization?.imageOptimization.after}KB</span>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                -{performanceBaseline.optimization?.imageOptimization.reduction}%
              </div>
              <div className="text-xs text-gray-400">Size Reduction</div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm text-gray-400 mb-3">Cache Performance</h5>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {performanceBaseline.optimization?.cacheHitRate}%
              </div>
              <div className="text-xs text-gray-400">Cache Hit Rate</div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div 
                className="h-2 bg-blue-600 rounded-full"
                style={{ width: `${performanceBaseline.optimization?.cacheHitRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-lg">
            <h5 className="text-sm text-gray-400 mb-3">CDN Performance</h5>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {performanceBaseline.optimization?.cdnPerformance}%
              </div>
              <div className="text-xs text-gray-400">CDN Efficiency</div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div 
                className="h-2 bg-purple-600 rounded-full"
                style={{ width: `${performanceBaseline.optimization?.cdnPerformance}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Final Production Optimizer</h1>
        <p className="text-gray-400">Production readiness assessment, deployment checklist, and performance baseline</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'readiness', label: 'Production Readiness', icon: '🎯' },
          { id: 'checklist', label: 'Deployment Checklist', icon: '✅' },
          { id: 'baseline', label: 'Performance Baseline', icon: '📊' }
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
      {activeSection === 'readiness' && renderProductionReadiness()}
      {activeSection === 'checklist' && renderDeploymentChecklist()}
      {activeSection === 'baseline' && renderPerformanceBaseline()}
    </div>
  );
};