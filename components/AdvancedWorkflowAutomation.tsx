import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  CalendarIcon,
  BoltIcon,
  ChartBarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import * as cron from 'node-cron';

// Advanced Workflow Automation Hub (Non-AI)
interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual' | 'webhook' | 'form_submission' | 'status_change';
  config: {
    event?: string;
    schedule?: string; // cron expression
    webhook_url?: string;
    form_id?: string;
    status_from?: string;
    status_to?: string;
  };
}

interface WorkflowAction {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'update_status' | 'create_task' | 'delay' | 'condition' | 'notification';
  name: string;
  config: {
    template?: string;
    recipient?: string;
    subject?: string;
    delay_hours?: number;
    webhook_url?: string;
    condition?: string;
    field_to_update?: string;
    new_value?: string;
    task_title?: string;
    task_assignee?: string;
    notification_type?: 'info' | 'success' | 'warning' | 'error';
    notification_message?: string;
  };
  position: { x: number; y: number };
}

interface WorkflowConnection {
  from: string;
  to: string;
  condition?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'error';
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  connections: WorkflowConnection[];
  createdAt: Date;
  lastRun: Date | null;
  nextRun: Date | null;
  runCount: number;
  successCount: number;
  errorCount: number;
  category: 'sales' | 'marketing' | 'support' | 'hr' | 'operations';
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  startTime: Date;
  endTime: Date | null;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  currentAction: string | null;
  executedActions: string[];
  errorMessage?: string;
  triggerData: any;
}

export const AdvancedWorkflowAutomation: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'builder' | 'executions' | 'templates'>('overview');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    // Mock workflow data
    const mockWorkflows: Workflow[] = [
      {
        id: '1',
        name: 'New User Onboarding',
        description: 'Automated welcome sequence for new user registrations',
        status: 'active',
        trigger: {
          type: 'event',
          config: { event: 'user.registered' }
        },
        actions: [
          {
            id: 'action1',
            type: 'email',
            name: 'Send Welcome Email',
            config: {
              template: 'welcome_email',
              recipient: 'new_user',
              subject: 'Welcome to ZZP Werkplaats!'
            },
            position: { x: 100, y: 100 }
          },
          {
            id: 'action2',
            type: 'delay',
            name: 'Wait 24 Hours',
            config: { delay_hours: 24 },
            position: { x: 300, y: 100 }
          },
          {
            id: 'action3',
            type: 'email',
            name: 'Profile Completion Reminder',
            config: {
              template: 'profile_reminder',
              recipient: 'new_user',
              subject: 'Complete your profile to get started'
            },
            position: { x: 500, y: 100 }
          }
        ],
        connections: [
          { from: 'action1', to: 'action2' },
          { from: 'action2', to: 'action3' }
        ],
        createdAt: new Date(Date.now() - 604800000), // 1 week ago
        lastRun: new Date(Date.now() - 3600000), // 1 hour ago
        nextRun: null,
        runCount: 247,
        successCount: 239,
        errorCount: 8,
        category: 'marketing'
      },
      {
        id: '2',
        name: 'Invoice Payment Reminder',
        description: 'Automated reminders for overdue invoices',
        status: 'active',
        trigger: {
          type: 'schedule',
          config: { schedule: '0 9 * * *' } // Daily at 9 AM
        },
        actions: [
          {
            id: 'action1',
            type: 'condition',
            name: 'Check Overdue Invoices',
            config: { condition: 'invoice.due_date < today AND invoice.status = "unpaid"' },
            position: { x: 100, y: 100 }
          },
          {
            id: 'action2',
            type: 'email',
            name: 'Send Payment Reminder',
            config: {
              template: 'payment_reminder',
              recipient: 'invoice_client',
              subject: 'Payment Reminder - Invoice Overdue'
            },
            position: { x: 300, y: 100 }
          },
          {
            id: 'action3',
            type: 'update_status',
            name: 'Mark as Reminded',
            config: {
              field_to_update: 'reminder_sent',
              new_value: 'true'
            },
            position: { x: 500, y: 100 }
          }
        ],
        connections: [
          { from: 'action1', to: 'action2', condition: 'has_overdue_invoices' },
          { from: 'action2', to: 'action3' }
        ],
        createdAt: new Date(Date.now() - 1209600000), // 2 weeks ago
        lastRun: new Date(Date.now() - 86400000), // yesterday
        nextRun: new Date(Date.now() + 86400000), // tomorrow 9 AM
        runCount: 14,
        successCount: 14,
        errorCount: 0,
        category: 'operations'
      },
      {
        id: '3',
        name: 'Project Completion Follow-up',
        description: 'Automated follow-up after project completion',
        status: 'active',
        trigger: {
          type: 'status_change',
          config: {
            status_from: 'in_progress',
            status_to: 'completed'
          }
        },
        actions: [
          {
            id: 'action1',
            type: 'email',
            name: 'Request Feedback',
            config: {
              template: 'feedback_request',
              recipient: 'project_client',
              subject: 'How was your experience? Please share feedback'
            },
            position: { x: 100, y: 100 }
          },
          {
            id: 'action2',
            type: 'delay',
            name: 'Wait 3 Days',
            config: { delay_hours: 72 },
            position: { x: 300, y: 100 }
          },
          {
            id: 'action3',
            type: 'create_task',
            name: 'Schedule Follow-up Call',
            config: {
              task_title: 'Follow-up call with client',
              task_assignee: 'account_manager'
            },
            position: { x: 500, y: 100 }
          }
        ],
        connections: [
          { from: 'action1', to: 'action2' },
          { from: 'action2', to: 'action3' }
        ],
        createdAt: new Date(Date.now() - 432000000), // 5 days ago
        lastRun: new Date(Date.now() - 172800000), // 2 days ago
        nextRun: null,
        runCount: 23,
        successCount: 22,
        errorCount: 1,
        category: 'sales'
      },
      {
        id: '4',
        name: 'Weekly Performance Report',
        description: 'Automated weekly performance reports to stakeholders',
        status: 'active',
        trigger: {
          type: 'schedule',
          config: { schedule: '0 8 * * 1' } // Mondays at 8 AM
        },
        actions: [
          {
            id: 'action1',
            type: 'webhook',
            name: 'Generate Report Data',
            config: { webhook_url: '/api/reports/generate-weekly' },
            position: { x: 100, y: 100 }
          },
          {
            id: 'action2',
            type: 'email',
            name: 'Send Report to Management',
            config: {
              template: 'weekly_report',
              recipient: 'management_team',
              subject: 'Weekly Performance Report'
            },
            position: { x: 300, y: 100 }
          }
        ],
        connections: [
          { from: 'action1', to: 'action2' }
        ],
        createdAt: new Date(Date.now() - 2592000000), // 1 month ago
        lastRun: new Date(Date.now() - 518400000), // last Monday
        nextRun: new Date(Date.now() + 86400000), // next Monday
        runCount: 4,
        successCount: 4,
        errorCount: 0,
        category: 'operations'
      }
    ];

    // Mock execution data
    const mockExecutions: WorkflowExecution[] = [
      {
        id: '1',
        workflowId: '1',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 3540000),
        status: 'completed',
        currentAction: null,
        executedActions: ['action1', 'action2', 'action3'],
        triggerData: { user_id: '123', email: 'john@example.com' }
      },
      {
        id: '2',
        workflowId: '2',
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() - 86340000),
        status: 'completed',
        currentAction: null,
        executedActions: ['action1', 'action2', 'action3'],
        triggerData: { overdue_invoices: 5 }
      },
      {
        id: '3',
        workflowId: '3',
        startTime: new Date(Date.now() - 172800000),
        endTime: null,
        status: 'running',
        currentAction: 'action2',
        executedActions: ['action1'],
        triggerData: { project_id: '456', client_email: 'client@company.com' }
      },
      {
        id: '4',
        workflowId: '1',
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 7100000),
        status: 'failed',
        currentAction: 'action2',
        executedActions: ['action1'],
        errorMessage: 'SMTP server connection failed',
        triggerData: { user_id: '789', email: 'user@example.com' }
      }
    ];

    setWorkflows(mockWorkflows);
    setExecutions(mockExecutions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime()));
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExecutionStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email': return <EnvelopeIcon className="w-4 h-4" />;
      case 'sms': return <PhoneIcon className="w-4 h-4" />;
      case 'webhook': return <BoltIcon className="w-4 h-4" />;
      case 'delay': return <ClockIcon className="w-4 h-4" />;
      case 'condition': return <CogIcon className="w-4 h-4" />;
      case 'create_task': return <DocumentTextIcon className="w-4 h-4" />;
      case 'update_status': return <ArrowPathIcon className="w-4 h-4" />;
      case 'notification': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <CogIcon className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales': return <ChartBarIcon className="w-5 h-5 text-green-600" />;
      case 'marketing': return <UserIcon className="w-5 h-5 text-blue-600" />;
      case 'support': return <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />;
      case 'hr': return <UserIcon className="w-5 h-5 text-purple-600" />;
      case 'operations': return <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />;
      default: return <CogIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, status: workflow.status === 'active' ? 'paused' : 'active' }
        : workflow
    ));
  };

  const runWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const execution: WorkflowExecution = {
      id: Date.now().toString(),
      workflowId,
      startTime: new Date(),
      endTime: null,
      status: 'running',
      currentAction: workflow.actions[0]?.id || null,
      executedActions: [],
      triggerData: { manual_trigger: true }
    };

    setExecutions(prev => [execution, ...prev]);

    // Simulate workflow execution
    await new Promise(resolve => setTimeout(resolve, 3000));

    setExecutions(prev => prev.map(exec => 
      exec.id === execution.id 
        ? { 
            ...exec, 
            status: 'completed', 
            endTime: new Date(),
            currentAction: null,
            executedActions: workflow.actions.map(a => a.id)
          }
        : exec
    ));

    // Update workflow run count
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { 
            ...w, 
            lastRun: new Date(),
            runCount: w.runCount + 1,
            successCount: w.successCount + 1
          }
        : w
    ));
  };

  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const totalRuns = workflows.reduce((sum, w) => sum + w.runCount, 0);
  const successRate = workflows.reduce((sum, w) => sum + w.successCount, 0) / Math.max(totalRuns, 1) * 100;
  const runningExecutions = executions.filter(e => e.status === 'running').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CogIcon className="w-8 h-8 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Workflow Automation</h2>
            <p className="text-gray-600">Business process automation and workflow management</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowBuilder(!showBuilder)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Create Workflow
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4" />
            Templates
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <PlayIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Active Workflows</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{activeWorkflows}</div>
          <div className="text-sm text-green-600">of {workflows.length} total</div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <ArrowPathIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Total Executions</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalRuns.toLocaleString()}</div>
          <div className="text-sm text-blue-600">all time</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Success Rate</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{successRate.toFixed(1)}%</div>
          <div className="text-sm text-purple-600">execution success</div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <BoltIcon className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Currently Running</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{runningExecutions}</div>
          <div className="text-sm text-orange-600">active executions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'workflows', label: 'Workflows', icon: CogIcon },
            { id: 'executions', label: 'Executions', icon: PlayIcon },
            { id: 'templates', label: 'Templates', icon: DocumentTextIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Executions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h3>
              <div className="space-y-3">
                {executions.slice(0, 5).map(execution => {
                  const workflow = workflows.find(w => w.id === execution.workflowId);
                  return (
                    <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          execution.status === 'completed' ? 'bg-green-100 text-green-600' :
                          execution.status === 'running' ? 'bg-blue-100 text-blue-600' :
                          execution.status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {execution.status === 'completed' && <CheckCircleIcon className="w-4 h-4" />}
                          {execution.status === 'running' && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                          {execution.status === 'failed' && <XCircleIcon className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{workflow?.name}</div>
                          <div className="text-xs text-gray-600">
                            {execution.startTime.toLocaleString()} • {execution.executedActions.length} actions
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getExecutionStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workflow Categories */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflows by Category</h3>
              <div className="space-y-4">
                {['sales', 'marketing', 'support', 'hr', 'operations'].map(category => {
                  const categoryWorkflows = workflows.filter(w => w.category === category);
                  const activeCount = categoryWorkflows.filter(w => w.status === 'active').length;
                  return (
                    <div key={category} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(category)}
                        <div>
                          <div className="font-medium text-gray-900 capitalize">{category}</div>
                          <div className="text-sm text-gray-600">{activeCount} active, {categoryWorkflows.length} total</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{categoryWorkflows.length}</div>
                        <div className="text-xs text-gray-500">workflows</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workflows.map(workflow => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(workflow.category)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                          <div className="text-xs text-gray-500">{workflow.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 capitalize">
                        {workflow.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{workflow.trigger.type.replace('_', ' ')}</div>
                      {workflow.trigger.config.schedule && (
                        <div className="text-xs text-gray-500">Cron: {workflow.trigger.config.schedule}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {workflow.lastRun ? workflow.lastRun.toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {workflow.runCount > 0 ? ((workflow.successCount / workflow.runCount) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="text-xs text-gray-500">{workflow.runCount} runs</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => runWorkflow(workflow.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleWorkflow(workflow.id)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        {workflow.status === 'active' ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                      </button>
                      <button className="text-gray-600 hover:text-gray-700">
                        <CogIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Executions Tab */}
      {activeTab === 'executions' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Workflow Executions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions Executed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {executions.map(execution => {
                  const workflow = workflows.find(w => w.id === execution.workflowId);
                  const duration = execution.endTime 
                    ? Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)
                    : Math.round((Date.now() - execution.startTime.getTime()) / 1000);
                  
                  return (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{workflow?.name}</div>
                        <div className="text-xs text-gray-500">{workflow?.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {execution.status === 'completed' && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                          {execution.status === 'running' && <ArrowPathIcon className="w-4 h-4 text-blue-500 animate-spin" />}
                          {execution.status === 'failed' && <XCircleIcon className="w-4 h-4 text-red-500" />}
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getExecutionStatusColor(execution.status)}`}>
                            {execution.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {execution.startTime.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {duration}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {execution.executedActions.length} / {workflow?.actions.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {execution.currentAction || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {execution.errorMessage ? (
                          <div className="text-sm text-red-600 max-w-xs truncate">
                            {execution.errorMessage}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {execution.status === 'completed' ? 'Completed successfully' : 
                             execution.status === 'running' ? 'In progress...' : '-'}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Customer Onboarding',
                description: 'Welcome new customers with automated email sequence',
                category: 'marketing',
                actions: 5
              },
              {
                name: 'Lead Nurturing',
                description: 'Automated follow-up sequence for sales leads',
                category: 'sales',
                actions: 7
              },
              {
                name: 'Invoice Management',
                description: 'Automated invoice generation and payment reminders',
                category: 'operations',
                actions: 4
              },
              {
                name: 'Support Ticket Routing',
                description: 'Automatically route and assign support tickets',
                category: 'support',
                actions: 3
              },
              {
                name: 'Employee Onboarding',
                description: 'Complete new hire onboarding process',
                category: 'hr',
                actions: 8
              },
              {
                name: 'Project Completion',
                description: 'Post-project follow-up and feedback collection',
                category: 'operations',
                actions: 6
              }
            ].map((template, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryIcon(template.category)}
                  <span className={`px-2 py-1 text-xs font-semibold rounded capitalize ${getStatusColor('active')}`}>
                    {template.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{template.actions} actions</span>
                  <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};