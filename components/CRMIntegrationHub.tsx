import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

// CRM Integration Hub - Customer Relationship Management
interface CRMContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  source: 'website' | 'referral' | 'cold_call' | 'social_media' | 'event';
  assignedTo: string;
  lastContact: Date;
  nextFollowUp: Date | null;
  lifetime_value: number;
  tags: string[];
  stage: string;
  probability: number; // percentage
  notes: string;
}

interface CRMDeal {
  id: string;
  title: string;
  contactId: string;
  value: number;
  stage: 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate: Date | null;
  source: string;
  assignedTo: string;
  createdAt: Date;
  lastActivity: Date;
}

interface CRMActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  contactId: string;
  dealId?: string;
  subject: string;
  description: string;
  completed: boolean;
  scheduledFor: Date;
  completedAt: Date | null;
  assignedTo: string;
  outcome?: string;
}

interface CRMMetrics {
  totalContacts: number;
  activeDeals: number;
  monthlyRevenue: number;
  conversionRate: number;
  avgDealSize: number;
  salesCycleLength: number; // days
  activitiesThisWeek: number;
  followUpsOverdue: number;
}

export const CRMIntegrationHub: React.FC = () => {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'deals' | 'activities' | 'reports'>('dashboard');
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);

  useEffect(() => {
    // Mock CRM data
    const mockContacts: CRMContact[] = [
      {
        id: '1',
        name: 'Jan van der Berg',
        company: 'Berg Bouw BV',
        email: 'j.vandeberg@bergbouw.nl',
        phone: '+31 6 12345678',
        status: 'customer',
        source: 'website',
        assignedTo: 'Sarah Johnson',
        lastContact: new Date(Date.now() - 86400000), // 1 day ago
        nextFollowUp: new Date(Date.now() + 604800000), // 1 week from now
        lifetime_value: 25000,
        tags: ['high-value', 'construction', 'recurring'],
        stage: 'Customer',
        probability: 100,
        notes: 'Loyal customer, prefers email communication'
      },
      {
        id: '2',
        name: 'Maria Santos',
        company: 'Santos Elektro',
        email: 'm.santos@santoselektro.nl',
        phone: '+31 6 87654321',
        status: 'prospect',
        source: 'referral',
        assignedTo: 'Tom Wilson',
        lastContact: new Date(Date.now() - 259200000), // 3 days ago
        nextFollowUp: new Date(Date.now() + 172800000), // 2 days from now
        lifetime_value: 0,
        tags: ['electrical', 'prospect', 'urgent'],
        stage: 'Qualification',
        probability: 65,
        notes: 'Interested in electrical installation services'
      },
      {
        id: '3',
        name: 'Piet Jansen',
        company: 'Jansen Installaties',
        email: 'p.jansen@janseninstallaties.nl',
        phone: '+31 6 11223344',
        status: 'lead',
        source: 'cold_call',
        assignedTo: 'Lisa Chen',
        lastContact: new Date(Date.now() - 432000000), // 5 days ago
        nextFollowUp: new Date(Date.now() - 86400000), // overdue
        lifetime_value: 0,
        tags: ['plumbing', 'small-business', 'follow-up-needed'],
        stage: 'Initial Contact',
        probability: 25,
        notes: 'Needs plumbing services, price sensitive'
      },
      {
        id: '4',
        name: 'Anna Kowalski',
        company: 'Kowalski Renovations',
        email: 'a.kowalski@renovations.pl',
        phone: '+31 6 99887766',
        status: 'customer',
        source: 'social_media',
        assignedTo: 'Mike Johnson',
        lastContact: new Date(Date.now() - 1209600000), // 2 weeks ago
        nextFollowUp: new Date(Date.now() + 1209600000), // 2 weeks from now
        lifetime_value: 45000,
        tags: ['renovation', 'high-value', 'international'],
        stage: 'Customer',
        probability: 100,
        notes: 'Specializes in home renovations, good relationship'
      }
    ];

    const mockDeals: CRMDeal[] = [
      {
        id: '1',
        title: 'Berg Bouw - Office Renovation',
        contactId: '1',
        value: 15000,
        stage: 'negotiation',
        probability: 80,
        expectedCloseDate: new Date(Date.now() + 1209600000), // 2 weeks
        actualCloseDate: null,
        source: 'existing_customer',
        assignedTo: 'Sarah Johnson',
        createdAt: new Date(Date.now() - 2592000000), // 1 month ago
        lastActivity: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: '2',
        title: 'Santos Elektro - Electrical Installation',
        contactId: '2',
        value: 8500,
        stage: 'proposal',
        probability: 65,
        expectedCloseDate: new Date(Date.now() + 604800000), // 1 week
        actualCloseDate: null,
        source: 'referral',
        assignedTo: 'Tom Wilson',
        createdAt: new Date(Date.now() - 1209600000), // 2 weeks ago
        lastActivity: new Date(Date.now() - 259200000) // 3 days ago
      },
      {
        id: '3',
        title: 'Jansen Installaties - Bathroom Renovation',
        contactId: '3',
        value: 3200,
        stage: 'qualification',
        probability: 25,
        expectedCloseDate: new Date(Date.now() + 2419200000), // 1 month
        actualCloseDate: null,
        source: 'cold_call',
        assignedTo: 'Lisa Chen',
        createdAt: new Date(Date.now() - 432000000), // 5 days ago
        lastActivity: new Date(Date.now() - 432000000) // 5 days ago
      }
    ];

    const mockActivities: CRMActivity[] = [
      {
        id: '1',
        type: 'call',
        contactId: '1',
        dealId: '1',
        subject: 'Follow-up on renovation proposal',
        description: 'Discussed timeline and budget adjustments',
        completed: true,
        scheduledFor: new Date(Date.now() - 86400000),
        completedAt: new Date(Date.now() - 86400000),
        assignedTo: 'Sarah Johnson',
        outcome: 'Positive response, moving to negotiation'
      },
      {
        id: '2',
        type: 'email',
        contactId: '2',
        dealId: '2',
        subject: 'Send electrical installation proposal',
        description: 'Detailed proposal with timeline and costs',
        completed: true,
        scheduledFor: new Date(Date.now() - 259200000),
        completedAt: new Date(Date.now() - 259200000),
        assignedTo: 'Tom Wilson',
        outcome: 'Proposal sent, awaiting response'
      },
      {
        id: '3',
        type: 'call',
        contactId: '3',
        subject: 'Initial qualification call',
        description: 'Understand plumbing needs and budget',
        completed: false,
        scheduledFor: new Date(Date.now() + 86400000), // tomorrow
        completedAt: null,
        assignedTo: 'Lisa Chen'
      },
      {
        id: '4',
        type: 'meeting',
        contactId: '1',
        dealId: '1',
        subject: 'Site visit and final measurements',
        description: 'On-site meeting to finalize renovation details',
        completed: false,
        scheduledFor: new Date(Date.now() + 432000000), // 5 days
        completedAt: null,
        assignedTo: 'Sarah Johnson'
      }
    ];

    const mockMetrics: CRMMetrics = {
      totalContacts: mockContacts.length,
      activeDeals: mockDeals.filter(d => !d.stage.includes('closed')).length,
      monthlyRevenue: mockDeals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0),
      conversionRate: 23.5, // percentage
      avgDealSize: mockDeals.reduce((sum, d) => sum + d.value, 0) / mockDeals.length,
      salesCycleLength: 45, // days
      activitiesThisWeek: mockActivities.filter(a => a.scheduledFor > new Date(Date.now() - 604800000)).length,
      followUpsOverdue: mockContacts.filter(c => c.nextFollowUp && c.nextFollowUp < new Date()).length
    };

    setContacts(mockContacts);
    setDeals(mockDeals);
    setActivities(mockActivities);
    setMetrics(mockMetrics);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'customer': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'qualification': return 'bg-yellow-100 text-yellow-800';
      case 'proposal': return 'bg-blue-100 text-blue-800';
      case 'negotiation': return 'bg-purple-100 text-purple-800';
      case 'closed_won': return 'bg-green-100 text-green-800';
      case 'closed_lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneIcon className="w-4 h-4" />;
      case 'email': return <EnvelopeIcon className="w-4 h-4" />;
      case 'meeting': return <CalendarIcon className="w-4 h-4" />;
      case 'task': return <CheckCircleIcon className="w-4 h-4" />;
      case 'note': return <PencilIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  if (!metrics) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserGroupIcon className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">CRM Integration Hub</h2>
            <p className="text-gray-600">Customer Relationship Management and Sales Pipeline</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Add Contact
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Add Deal
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <UserGroupIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Total Contacts</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.totalContacts}</div>
          <div className="text-sm text-blue-600">in pipeline</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Active Deals</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.activeDeals}</div>
          <div className="text-sm text-green-600">in progress</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <CurrencyEuroIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Avg Deal Size</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">€{Math.round(metrics.avgDealSize).toLocaleString()}</div>
          <div className="text-sm text-purple-600">per deal</div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <ArrowTrendingUpIcon className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Conversion Rate</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{metrics.conversionRate}%</div>
          <div className="text-sm text-orange-600">lead to customer</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
            { id: 'contacts', label: 'Contacts', icon: UserGroupIcon },
            { id: 'deals', label: 'Deals', icon: CurrencyEuroIcon },
            { id: 'activities', label: 'Activities', icon: CalendarIcon },
            { id: 'reports', label: 'Reports', icon: ChartBarIcon }
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {activities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${activity.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{activity.subject}</div>
                      <div className="text-xs text-gray-600">
                        {contacts.find(c => c.id === activity.contactId)?.name} • {activity.scheduledFor.toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      activity.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.completed ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Pipeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Pipeline</h3>
              <div className="space-y-4">
                {['qualification', 'proposal', 'negotiation', 'closed_won'].map(stage => {
                  const stageDeals = deals.filter(d => d.stage === stage);
                  const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
                  return (
                    <div key={stage} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{stage.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-600">{stageDeals.length} deals</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">€{stageValue.toLocaleString()}</div>
                        <div className={`text-xs px-2 py-1 rounded ${getStageColor(stage)}`}>
                          {stage.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Overdue Follow-ups Alert */}
          {metrics.followUpsOverdue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-medium text-red-800">Overdue Follow-ups</h3>
              </div>
              <p className="text-red-700 mt-1">
                You have {metrics.followUpsOverdue} contacts with overdue follow-ups that need attention.
              </p>
              <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                View Overdue Contacts
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Follow-up</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LTV</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-xs text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.company}</div>
                      <div className="text-xs text-gray-500">{contact.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.stage}</div>
                      <div className="text-xs text-gray-500">{contact.probability}% probability</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.lastContact.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.nextFollowUp ? (
                        <div className={`text-sm ${contact.nextFollowUp < new Date() ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {contact.nextFollowUp.toLocaleDateString()}
                          {contact.nextFollowUp < new Date() && (
                            <div className="text-xs text-red-500">Overdue</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{contact.lifetime_value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => setSelectedContact(contact)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deals Tab */}
      {activeTab === 'deals' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Close</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deals.map(deal => {
                  const contact = contacts.find(c => c.id === deal.contactId);
                  return (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                        <div className="text-xs text-gray-500">Created {deal.createdAt.toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contact?.name}</div>
                        <div className="text-xs text-gray-500">{contact?.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">€{deal.value.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getStageColor(deal.stage)}`}>
                          {deal.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-900">{deal.probability}%</div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${deal.probability}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deal.expectedCloseDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.assignedTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-blue-600 hover:text-blue-700">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Activities & Tasks</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activities.map(activity => {
                const contact = contacts.find(c => c.id === activity.contactId);
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className={`p-3 rounded-lg ${activity.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{activity.subject}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          activity.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <div className="text-xs text-gray-500">
                        {contact?.name} • {activity.scheduledFor.toLocaleDateString()} • {activity.assignedTo}
                      </div>
                      {activity.outcome && (
                        <div className="text-xs text-green-600 mt-1">Outcome: {activity.outcome}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${activity.completed ? 'text-green-600' : activity.scheduledFor < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                        {activity.completed ? 'Completed' : activity.scheduledFor < new Date() ? 'Overdue' : 'Scheduled'}
                      </div>
                      {!activity.completed && (
                        <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sales Cycle Length</span>
                  <span className="font-semibold">{metrics.salesCycleLength} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-semibold">{metrics.conversionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Deal Size</span>
                  <span className="font-semibold">€{Math.round(metrics.avgDealSize).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Activities This Week</span>
                  <span className="font-semibold">{metrics.activitiesThisWeek}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Health</h3>
              <div className="space-y-3">
                {['qualification', 'proposal', 'negotiation'].map(stage => {
                  const stageDeals = deals.filter(d => d.stage === stage);
                  const percentage = (stageDeals.length / deals.length) * 100;
                  return (
                    <div key={stage}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{stage}</span>
                        <span>{stageDeals.length} deals ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};