// @ts-nocheck
/**
 * ReportsManagementPage
 * Admin panel for generating reports, exports, and data analysis
 */

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Report {
  id: string;
  name: string;
  type: 'users' | 'jobs' | 'revenue' | 'analytics' | 'custom';
  format: 'pdf' | 'csv' | 'excel' | 'json';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generated_at?: string;
  generated_by: string;
  file_url?: string;
  row_count?: number;
}

export const ReportsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Users Report - September 2025',
      type: 'users',
      format: 'excel',
      status: 'completed',
      generated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      generated_by: 'admin@zzp.nl',
      file_url: '/reports/users-sep-2025.xlsx',
      row_count: 342
    },
    {
      id: '2',
      name: 'Revenue Report Q3 2025',
      type: 'revenue',
      format: 'pdf',
      status: 'completed',
      generated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      generated_by: 'admin@zzp.nl',
      file_url: '/reports/revenue-q3-2025.pdf'
    },
    {
      id: '3',
      name: 'Active Jobs Export',
      type: 'jobs',
      format: 'csv',
      status: 'generating',
      generated_by: 'admin@zzp.nl'
    }
  ]);
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { id: 'users', name: 'Users Report', description: 'Export all users data with profiles and activity' },
    { id: 'jobs', name: 'Jobs Report', description: 'Export jobs data with applications and status' },
    { id: 'revenue', name: 'Revenue Report', description: 'Financial data including transactions and subscriptions' },
    { id: 'analytics', name: 'Analytics Report', description: 'Platform usage statistics and metrics' },
    { id: 'workers', name: 'Workers Report', description: 'Worker profiles with certificates and skills' },
    { id: 'employers', name: 'Employers Report', description: 'Company data with job postings' },
    { id: 'certificates', name: 'Certificates Report', description: 'All certificates and verifications' },
    { id: 'messages', name: 'Messages Report', description: 'Communication and messaging data' }
  ];

  const handleGenerateReport = async (type: string, format: string, dateRange: { from: string, to: string }) => {
    setGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: Report = {
        id: Date.now().toString(),
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString('nl-NL')}`,
        type: type as any,
        format: format as any,
        status: 'completed',
        generated_at: new Date().toISOString(),
        generated_by: 'admin@zzp.nl',
        file_url: `/reports/${type}-${Date.now()}.${format}`,
        row_count: Math.floor(Math.random() * 1000) + 100
      };

      setReports([newReport, ...reports]);
      setActiveTab('history');
      alert(`Report generated successfully! ${newReport.row_count} rows exported.`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📄';
      case 'csv': return '📊';
      case 'excel': return '📗';
      case 'json': return '🔧';
      default: return '📁';
    }
  };

  const handleDownload = (report: Report) => {
    alert(`Downloading ${report.name}...`);
  };

  const handleDelete = (reportId: string) => {
    if (confirm('Delete this report?')) {
      setReports(reports.filter(r => r.id !== reportId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Reports Manager</h1>
          <p className="text-gray-600">Generate and export data reports in various formats</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Reports</h3>
            <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {reports.filter(r => r.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-blue-600">
              {reports.filter(r => r.status === 'generating').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">This Month</h3>
            <p className="text-3xl font-bold text-purple-600">
              {reports.filter(r => {
                const reportDate = new Date(r.generated_at || '');
                const now = new Date();
                return reportDate.getMonth() === now.getMonth();
              }).length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-2 px-4 ${activeTab === 'generate' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Generate Report
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Report History
          </button>
        </div>

        {/* Generate Report Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            {/* Quick Reports */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Reports</h3>
              <div className="grid grid-cols-2 gap-4">
                {reportTypes.map(type => (
                  <div key={type.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-1">{type.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateReport(type.id, 'csv', { from: '', to: '' })}
                        disabled={generating}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        📊 CSV
                      </button>
                      <button
                        onClick={() => handleGenerateReport(type.id, 'excel', { from: '', to: '' })}
                        disabled={generating}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 disabled:opacity-50"
                      >
                        📗 Excel
                      </button>
                      <button
                        onClick={() => handleGenerateReport(type.id, 'pdf', { from: '', to: '' })}
                        disabled={generating}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 disabled:opacity-50"
                      >
                        📄 PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Report */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Custom Report</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      {reportTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filters (Optional)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Add custom filters in JSON format..."
                  />
                </div>
                <button
                  disabled={generating}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {generating ? '⏳ Generating...' : '🚀 Generate Custom Report'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rows</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      <div className="text-xs text-gray-500">By {report.generated_by}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span>{getFormatIcon(report.format)}</span>
                        <span className="text-sm text-gray-900">{report.format.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.generated_at 
                        ? new Date(report.generated_at).toLocaleString('nl-NL')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.row_count?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {report.status === 'completed' && (
                          <button
                            onClick={() => handleDownload(report)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Download
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {reports.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No reports generated yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsManagementPage;
