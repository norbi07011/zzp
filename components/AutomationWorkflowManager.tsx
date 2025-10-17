import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  CalendarIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CodeBracketIcon,
  ServerIcon,
  CpuChipIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CloudIcon,
  BoltIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'api_call' | 'webhook' | 'email' | 'notification' | 'data_processing' | 'conditional' | 'delay';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  configuration: Record<string, any>;
  executionTime?: number;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
}

interface AutomatedWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'webhook' | 'schedule' | 'api_event' | 'manual' | 'data_change';
    configuration: Record<string, any>;
    isActive: boolean;
  };
  steps: WorkflowStep[];
  status: 'active' | 'inactive' | 'error' | 'running';
  lastExecution: Date | null;
  nextExecution: Date | null;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ScheduledOperation {
  id: string;
  name: string;
  type: 'backup' | 'sync' | 'cleanup' | 'report' | 'maintenance' | 'analysis';
  schedule: {
    type: 'cron' | 'interval' | 'once';
    expression: string;
    timezone: string;
  };
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'disabled';
  lastRun: Date | null;
  nextRun: Date | null;
  runCount: number;
  configuration: Record<string, any>;
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    channels: string[];
  };
}

const AutomationWorkflowManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<AutomatedWorkflow[]>([]);
  const [scheduledOps, setScheduledOps] = useState<ScheduledOperation[]>([]);
  const [activeTab, setActiveTab] = useState<'workflows' | 'schedules' | 'monitoring' | 'builder'>('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data initialization
  useEffect(() => {
    const mockWorkflows: AutomatedWorkflow[] = [
      {
        id: 'wf-1',
        name: 'Customer Onboarding Automation',
        description: 'Automated workflow for new customer registration and setup',
        trigger: {
          type: 'webhook',
          configuration: {
            url: '/webhooks/customer-registration',
            method: 'POST',
            authentication: 'api_key'
          },
          isActive: true
        },
        steps: [
          {
            id: 'step-1',
            name: 'Validate Customer Data',
            type: 'data_processing',
            status: 'completed',
            configuration: { validation_rules: ['email', 'phone', 'required_fields'] },
            executionTime: 150,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: 'step-2',
            name: 'Create User Account',
            type: 'api_call',
            status: 'completed',
            configuration: { endpoint: '/api/users', method: 'POST' },
            executionTime: 320,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: 'step-3',
            name: 'Send Welcome Email',
            type: 'email',
            status: 'completed',
            configuration: { template: 'welcome', provider: 'sendgrid' },
            executionTime: 180,
            retryCount: 0,
            maxRetries: 2
          },
          {
            id: 'step-4',
            name: 'Notify Sales Team',
            type: 'notification',
            status: 'completed',
            configuration: { channel: 'slack', message: 'New customer registered' },
            executionTime: 90,
            retryCount: 0,
            maxRetries: 1
          }
        ],
        status: 'active',
        lastExecution: new Date(Date.now() - 3600000),
        nextExecution: null,
        executionCount: 47,
        successRate: 97.8,
        averageExecutionTime: 2800,
        createdAt: new Date(Date.now() - 86400000 * 30),
        updatedAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'wf-2',
        name: 'Daily Sales Report',
        description: 'Generate and distribute daily sales reports to stakeholders',
        trigger: {
          type: 'schedule',
          configuration: {
            cron: '0 9 * * *',
            timezone: 'UTC'
          },
          isActive: true
        },
        steps: [
          {
            id: 'step-5',
            name: 'Fetch Sales Data',
            type: 'api_call',
            status: 'completed',
            configuration: { endpoint: '/api/sales/daily', filters: ['date_range'] },
            executionTime: 1200,
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: 'step-6',
            name: 'Generate Report',
            type: 'data_processing',
            status: 'completed',
            configuration: { format: 'pdf', template: 'daily_sales' },
            executionTime: 3500,
            retryCount: 0,
            maxRetries: 2
          },
          {
            id: 'step-7',
            name: 'Send to Stakeholders',
            type: 'email',
            status: 'completed',
            configuration: { recipients: ['sales@company.com', 'management@company.com'] },
            executionTime: 450,
            retryCount: 0,
            maxRetries: 2
          }
        ],
        status: 'active',
        lastExecution: new Date(Date.now() - 82800000),
        nextExecution: new Date(Date.now() + 3600000),
        executionCount: 125,
        successRate: 99.2,
        averageExecutionTime: 5150,
        createdAt: new Date(Date.now() - 86400000 * 90),
        updatedAt: new Date(Date.now() - 86400000)
      },
      {
        id: 'wf-3',
        name: 'Error Alert Escalation',
        description: 'Escalate critical errors to appropriate teams with automated responses',
        trigger: {
          type: 'api_event',
          configuration: {
            event_type: 'error',
            severity: 'critical',
            source: 'application_logs'
          },
          isActive: true
        },
        steps: [
          {
            id: 'step-8',
            name: 'Analyze Error Severity',
            type: 'conditional',
            status: 'pending',
            configuration: { conditions: ['severity_level', 'error_frequency', 'impact_scope'] },
            retryCount: 0,
            maxRetries: 1
          },
          {
            id: 'step-9',
            name: 'Create Support Ticket',
            type: 'api_call',
            status: 'pending',
            configuration: { endpoint: '/api/tickets', priority: 'high' },
            retryCount: 0,
            maxRetries: 3
          },
          {
            id: 'step-10',
            name: 'Alert DevOps Team',
            type: 'notification',
            status: 'pending',
            configuration: { channel: 'pagerduty', escalation_policy: 'critical' },
            retryCount: 0,
            maxRetries: 5
          }
        ],
        status: 'active',
        lastExecution: new Date(Date.now() - 14400000),
        nextExecution: null,
        executionCount: 8,
        successRate: 87.5,
        averageExecutionTime: 890,
        createdAt: new Date(Date.now() - 86400000 * 15),
        updatedAt: new Date(Date.now() - 7200000)
      }
    ];

    const mockScheduledOps: ScheduledOperation[] = [
      {
        id: 'sched-1',
        name: 'Database Backup',
        type: 'backup',
        schedule: {
          type: 'cron',
          expression: '0 2 * * *',
          timezone: 'UTC'
        },
        status: 'scheduled',
        lastRun: new Date(Date.now() - 86400000),
        nextRun: new Date(Date.now() + 7200000),
        runCount: 365,
        configuration: {
          databases: ['main', 'analytics'],
          retention_days: 30,
          compression: true,
          encryption: true
        },
        notifications: {
          onSuccess: false,
          onFailure: true,
          channels: ['email', 'slack']
        }
      },
      {
        id: 'sched-2',
        name: 'Weekly Performance Analysis',
        type: 'analysis',
        schedule: {
          type: 'cron',
          expression: '0 8 * * 1',
          timezone: 'UTC'
        },
        status: 'scheduled',
        lastRun: new Date(Date.now() - 518400000),
        nextRun: new Date(Date.now() + 86400000),
        runCount: 52,
        configuration: {
          metrics: ['response_time', 'error_rate', 'throughput'],
          period: '7_days',
          generate_report: true,
          alert_thresholds: {
            response_time: 500,
            error_rate: 1.0
          }
        },
        notifications: {
          onSuccess: true,
          onFailure: true,
          channels: ['email']
        }
      },
      {
        id: 'sched-3',
        name: 'Cache Cleanup',
        type: 'cleanup',
        schedule: {
          type: 'interval',
          expression: '0 */4 * * *',
          timezone: 'UTC'
        },
        status: 'scheduled',
        lastRun: new Date(Date.now() - 14400000),
        nextRun: new Date(Date.now() + 14400000),
        runCount: 2190,
        configuration: {
          cache_types: ['redis', 'memcached'],
          max_age_hours: 24,
          memory_threshold: 80
        },
        notifications: {
          onSuccess: false,
          onFailure: true,
          channels: ['email']
        }
      },
      {
        id: 'sched-4',
        name: 'Monthly Sync with CRM',
        type: 'sync',
        schedule: {
          type: 'cron',
          expression: '0 0 1 * *',
          timezone: 'UTC'
        },
        status: 'scheduled',
        lastRun: new Date(Date.now() - 2592000000),
        nextRun: new Date(Date.now() + 86400000 * 15),
        runCount: 12,
        configuration: {
          source: 'internal_db',
          destination: 'salesforce',
          sync_fields: ['customers', 'opportunities', 'activities'],
          conflict_resolution: 'source_wins'
        },
        notifications: {
          onSuccess: true,
          onFailure: true,
          channels: ['email', 'slack']
        }
      }
    ];

    setWorkflows(mockWorkflows);
    setScheduledOps(mockScheduledOps);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'scheduled':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'disabled':
        return 'text-gray-600 bg-gray-100';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'scheduled':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'inactive':
      case 'disabled':
        return <PauseIcon className="h-4 w-4" />;
      case 'error':
      case 'failed':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'running':
        return <ArrowPathIcon className="h-4 w-4 animate-spin" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'api_call':
        return <CodeBracketIcon className="h-4 w-4" />;
      case 'webhook':
        return <BoltIcon className="h-4 w-4" />;
      case 'email':
        return <BellIcon className="h-4 w-4" />;
      case 'notification':
        return <BellIcon className="h-4 w-4" />;
      case 'data_processing':
        return <CpuChipIcon className="h-4 w-4" />;
      case 'conditional':
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case 'delay':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <Cog6ToothIcon className="h-4 w-4" />;
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    setIsLoading(true);
    // Simulate workflow execution
    setTimeout(() => {
      setWorkflows(prev => prev.map(wf => 
        wf.id === workflowId 
          ? { 
              ...wf, 
              status: 'running' as const, 
              lastExecution: new Date(),
              executionCount: wf.executionCount + 1
            }
          : wf
      ));
      
      // Simulate completion after a few seconds
      setTimeout(() => {
        setWorkflows(prev => prev.map(wf => 
          wf.id === workflowId 
            ? { ...wf, status: 'active' as const }
            : wf
        ));
      }, 3000);
      
      setIsLoading(false);
    }, 1000);
  };

  const selectedWorkflowData = workflows.find(wf => wf.id === selectedWorkflow);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automation & Workflow Manager</h2>
          <p className="text-gray-600 mt-1">
            Manage automated workflows, scheduled operations, and business process automation
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Workflow
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BoltIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Workflows</p>
              <p className="text-2xl font-semibold text-gray-900">
                {workflows.filter(wf => wf.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Scheduled Operations</p>
              <p className="text-2xl font-semibold text-gray-900">{scheduledOps.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Executions Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {workflows.reduce((sum, wf) => sum + (wf.lastExecution && 
                  wf.lastExecution.getDate() === new Date().getDate() ? 1 : 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(workflows.reduce((sum, wf) => sum + wf.successRate, 0) / workflows.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'workflows', label: 'Workflows', icon: BoltIcon },
            { id: 'schedules', label: 'Scheduled Operations', icon: CalendarIcon },
            { id: 'monitoring', label: 'Monitoring', icon: ChartBarIcon },
            { id: 'builder', label: 'Workflow Builder', icon: WrenchScrewdriverIcon }
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
      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflows List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Automated Workflows</h3>
              </div>
              <div className="p-4 space-y-3">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    onClick={() => setSelectedWorkflow(workflow.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedWorkflow === workflow.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(workflow.status)}`}>
                        {getStatusIcon(workflow.status)}
                        <span className="ml-1 capitalize">{workflow.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Trigger:</span>
                        <span className="font-medium capitalize">{workflow.trigger.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Steps:</span>
                        <span className="font-medium">{workflow.steps.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-medium text-green-600">{workflow.successRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workflow Details */}
          <div className="lg:col-span-2">
            {selectedWorkflowData ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedWorkflowData.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedWorkflowData.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => executeWorkflow(selectedWorkflowData.id)}
                        disabled={isLoading || selectedWorkflowData.status === 'running'}
                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {selectedWorkflowData.status === 'running' ? (
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <PlayIcon className="h-4 w-4 mr-2" />
                        )}
                        Execute
                      </button>
                      <button className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Workflow Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Executions</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedWorkflowData.executionCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Success Rate</p>
                      <p className="text-lg font-semibold text-green-600">{selectedWorkflowData.successRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Avg. Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {(selectedWorkflowData.averageExecutionTime / 1000).toFixed(1)}s
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Last Run</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedWorkflowData.lastExecution ? 
                          selectedWorkflowData.lastExecution.toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Workflow Steps</h4>
                  <div className="space-y-4">
                    {selectedWorkflowData.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        {/* Step Number */}
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mr-4">
                          {index + 1}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="mr-2 text-gray-400">
                                {getStepIcon(step.type)}
                              </div>
                              <h5 className="font-medium text-gray-900">{step.name}</h5>
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {step.type.replace('_', ' ')}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(step.status)}`}>
                              {getStatusIcon(step.status)}
                              <span className="ml-1 capitalize">{step.status}</span>
                            </span>
                          </div>
                          
                          {step.executionTime && (
                            <div className="text-sm text-gray-500">
                              Execution time: {step.executionTime}ms
                              {step.retryCount > 0 && (
                                <span className="ml-2">
                                  (Retries: {step.retryCount}/{step.maxRetries})
                                </span>
                              )}
                            </div>
                          )}

                          {step.errorMessage && (
                            <div className="text-sm text-red-600 mt-1">
                              Error: {step.errorMessage}
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        {index < selectedWorkflowData.steps.length - 1 && (
                          <div className="flex-shrink-0 ml-4">
                            <div className="w-0 h-0 border-l-4 border-l-gray-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trigger Configuration */}
                <div className="p-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Trigger Configuration</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Type:</span>
                      <span className="text-sm text-gray-900 capitalize">{selectedWorkflowData.trigger.type}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`text-sm font-medium ${
                        selectedWorkflowData.trigger.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedWorkflowData.trigger.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">Configuration:</span>
                      <pre className="mt-1 text-xs text-gray-600 bg-white rounded p-2 overflow-x-auto">
                        {JSON.stringify(selectedWorkflowData.trigger.configuration, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <BoltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Workflow</h3>
                <p className="text-gray-500">
                  Choose a workflow from the list to view details and manage execution
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Operations</h3>
              <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Schedule
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Run Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scheduledOps.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {op.type === 'backup' && <ServerIcon className="h-8 w-8 text-blue-600" />}
                          {op.type === 'sync' && <ArrowPathIcon className="h-8 w-8 text-green-600" />}
                          {op.type === 'cleanup' && <TrashIcon className="h-8 w-8 text-orange-600" />}
                          {op.type === 'analysis' && <ChartBarIcon className="h-8 w-8 text-purple-600" />}
                          {op.type === 'report' && <DocumentTextIcon className="h-8 w-8 text-indigo-600" />}
                          {op.type === 'maintenance' && <Cog6ToothIcon className="h-8 w-8 text-gray-600" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{op.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{op.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{op.schedule.expression}</div>
                      <div className="text-sm text-gray-500">{op.schedule.timezone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(op.status)}`}>
                        {getStatusIcon(op.status)}
                        <span className="ml-1 capitalize">{op.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {op.nextRun ? op.nextRun.toLocaleString() : 'Not scheduled'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {op.runCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <PlayIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Performance</h3>
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{workflow.name}</div>
                    <div className="text-sm text-gray-500">
                      {workflow.executionCount} executions • {workflow.successRate}% success
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {(workflow.averageExecutionTime / 1000).toFixed(1)}s
                    </div>
                    <div className="text-xs text-gray-500">avg. time</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Workflows</span>
                <span className="font-medium text-green-600">
                  {workflows.filter(wf => wf.status === 'active').length}/{workflows.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Failed Executions (24h)</span>
                <span className="font-medium text-red-600">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Scheduled Operations</span>
                <span className="font-medium text-green-600">
                  {scheduledOps.filter(op => op.status === 'scheduled').length}/{scheduledOps.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Response Time</span>
                <span className="font-medium text-blue-600">2.3s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'builder' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Workflow Builder</h3>
          <p className="text-gray-600 mb-6">
            Drag-and-drop workflow builder for creating complex automation sequences
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            Start Building
          </button>
        </div>
      )}
    </div>
  );
};

export default AutomationWorkflowManager;