// @ts-nocheck
/**
 * EmailMarketingManagementPage
 * Admin panel for email campaigns, newsletters, and marketing automation
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  recipients_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  is_active: boolean;
  usage_count: number;
}

export const EmailMarketingManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'stats'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [stats, setStats] = useState({
    total_campaigns: 0,
    total_sent: 0,
    avg_open_rate: 0,
    avg_click_rate: 0
  });

  useEffect(() => {
    if (activeTab === 'campaigns') {
      loadCampaigns();
    } else if (activeTab === 'templates') {
      loadTemplates();
    }
  }, [activeTab]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats
      const totalCampaigns = data?.length || 0;
      const sentCampaigns = data?.filter(c => c.status === 'sent') || [];
      const totalSent = sentCampaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
      const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.opened_count || 0), 0);
      const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.clicked_count || 0), 0);

      const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
      const avgClickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

      setStats({
        total_campaigns: totalCampaigns,
        total_sent: totalSent,
        avg_open_rate: avgOpenRate,
        avg_click_rate: avgClickRate
      });

      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      // Use mock data if table doesn't exist
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Welcome Series - January',
          subject: 'Welcome to ZZP Werkplaats!',
          content: 'Thank you for joining...',
          status: 'sent',
          recipients_count: 150,
          sent_count: 150,
          opened_count: 95,
          clicked_count: 42,
          sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'New Features Announcement',
          subject: 'Check out our new features!',
          content: 'We are excited to announce...',
          status: 'scheduled',
          recipients_count: 320,
          sent_count: 0,
          opened_count: 0,
          clicked_count: 0,
          scheduled_for: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setCampaigns(mockCampaigns);
      setStats({
        total_campaigns: 2,
        total_sent: 150,
        avg_open_rate: 63,
        avg_click_rate: 28
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Use mock data
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Welcome Email',
          subject: 'Welcome to {{platform_name}}',
          body: 'Hello {{user_name}}, welcome to our platform!',
          category: 'onboarding',
          is_active: true,
          usage_count: 247
        },
        {
          id: '2',
          name: 'Password Reset',
          subject: 'Reset your password',
          body: 'Click here to reset: {{reset_link}}',
          category: 'transactional',
          is_active: true,
          usage_count: 89
        },
        {
          id: '3',
          name: 'Monthly Newsletter',
          subject: 'Newsletter - {{month}} {{year}}',
          body: 'Here is what happened this month...',
          category: 'newsletter',
          is_active: true,
          usage_count: 12
        }
      ];
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendCampaign = (campaignId: string) => {
    alert(`Campaign ${campaignId} would be sent now`);
  };

  const handleCancelCampaign = (campaignId: string) => {
    alert(`Campaign ${campaignId} would be cancelled`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Email Marketing</h1>
            <p className="text-gray-600">Manage campaigns, newsletters, and automated emails</p>
          </div>
          <button
            onClick={() => setShowNewCampaign(!showNewCampaign)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ New Campaign
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Campaigns</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_campaigns}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Emails Sent</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total_sent}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Open Rate</h3>
            <p className="text-3xl font-bold text-green-600">{stats.avg_open_rate}%</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Click Rate</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.avg_click_rate}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-2 px-4 ${activeTab === 'campaigns' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-2 px-4 ${activeTab === 'templates' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Analytics
          </button>
        </div>

        {/* New Campaign Form */}
        {showNewCampaign && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. Spring Newsletter 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. Discover our spring offers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={6}
                  placeholder="Write your email content here..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>All Users</option>
                    <option>Workers Only</option>
                    <option>Employers Only</option>
                    <option>Premium Users</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save as Draft
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Schedule Campaign
                </button>
                <button
                  onClick={() => setShowNewCampaign(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map(campaign => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-xs text-gray-500">{campaign.subject}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {campaign.recipients_count}
                        </td>
                        <td className="px-6 py-4">
                          {campaign.status === 'sent' ? (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Opened:</span>
                                <span className="font-medium text-green-600">
                                  {campaign.sent_count > 0 ? Math.round((campaign.opened_count / campaign.sent_count) * 100) : 0}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Clicked:</span>
                                <span className="font-medium text-blue-600">
                                  {campaign.sent_count > 0 ? Math.round((campaign.clicked_count / campaign.sent_count) * 100) : 0}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {campaign.sent_at
                            ? new Date(campaign.sent_at).toLocaleDateString('nl-NL')
                            : campaign.scheduled_for
                            ? new Date(campaign.scheduled_for).toLocaleDateString('nl-NL')
                            : 'Draft'
                          }
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {campaign.status === 'draft' && (
                              <button
                                onClick={() => handleSendCampaign(campaign.id)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Send
                              </button>
                            )}
                            {campaign.status === 'scheduled' && (
                              <button
                                onClick={() => handleCancelCampaign(campaign.id)}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Cancel
                              </button>
                            )}
                            <button className="text-sm text-gray-600 hover:text-gray-800">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {campaigns.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No campaigns found
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {templates.map(template => (
                  <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <span className="text-xs text-gray-500">{template.category}</span>
                      </div>
                      {template.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
                      <p className="text-sm text-gray-600">{template.subject}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Body Preview:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{template.body}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Used {template.usage_count} times</span>
                      <div className="flex gap-2">
                        <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                        <button className="text-sm text-gray-600 hover:text-gray-800">Preview</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Campaign Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Open Rate</span>
                    <span className="text-sm font-medium">{stats.avg_open_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${stats.avg_open_rate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Click Rate</span>
                    <span className="text-sm font-medium">{stats.avg_click_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${stats.avg_click_rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Growth Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Campaigns:</span>
                  <span className="font-semibold">{stats.total_campaigns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emails Sent:</span>
                  <span className="font-semibold">{stats.total_sent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg per Campaign:</span>
                  <span className="font-semibold">
                    {stats.total_campaigns > 0 ? Math.round(stats.total_sent / stats.total_campaigns) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailMarketingManagementPage;
