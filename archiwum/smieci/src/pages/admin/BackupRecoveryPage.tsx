// @ts-nocheck
/**
 * BackupRecoveryPage
 * Admin panel for database backups, recovery, and disaster recovery
 */

import React, { useState } from 'react';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  size: string;
  status: 'completed' | 'in_progress' | 'failed';
  createdAt: string;
  location: string;
  tables: number;
  rows: number;
}

interface Schedule {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  frequency: string;
  nextRun: string;
  lastRun?: string;
  enabled: boolean;
}

export const BackupRecoveryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'backups' | 'schedule' | 'recovery'>('backups');
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const backups: Backup[] = [
    {
      id: '1',
      name: 'Daily Backup - 2025-10-09',
      type: 'full',
      size: '2.4 GB',
      status: 'completed',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      location: 's3://backups/daily/2025-10-09.sql',
      tables: 28,
      rows: 284392
    },
    {
      id: '2',
      name: 'Hourly Backup - 14:00',
      type: 'incremental',
      size: '124 MB',
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      location: 's3://backups/hourly/2025-10-09-14.sql',
      tables: 12,
      rows: 12847
    },
    {
      id: '3',
      name: 'Manual Backup - Pre-Migration',
      type: 'full',
      size: '2.3 GB',
      status: 'completed',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      location: 's3://backups/manual/pre-migration-2025-10-08.sql',
      tables: 28,
      rows: 276543
    },
    {
      id: '4',
      name: 'Weekly Backup - Week 41',
      type: 'full',
      size: '2.2 GB',
      status: 'completed',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 's3://backups/weekly/2025-week-41.sql',
      tables: 28,
      rows: 268921
    },
    {
      id: '5',
      name: 'Hourly Backup - 13:00',
      type: 'incremental',
      size: '89 MB',
      status: 'completed',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      location: 's3://backups/hourly/2025-10-09-13.sql',
      tables: 12,
      rows: 9234
    }
  ];

  const schedules: Schedule[] = [
    {
      id: '1',
      name: 'Daily Full Backup',
      type: 'full',
      frequency: 'Daily at 02:00 UTC',
      nextRun: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      enabled: true
    },
    {
      id: '2',
      name: 'Hourly Incremental',
      type: 'incremental',
      frequency: 'Every hour',
      nextRun: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      lastRun: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      enabled: true
    },
    {
      id: '3',
      name: 'Weekly Archive',
      type: 'full',
      frequency: 'Every Sunday at 00:00 UTC',
      nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      lastRun: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      enabled: true
    },
    {
      id: '4',
      name: 'Monthly Archive',
      type: 'full',
      frequency: 'First day of month at 00:00 UTC',
      nextRun: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
      lastRun: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      enabled: false
    }
  ];

  const recoveryPoints = [
    { id: '1', name: 'Latest (Today 14:00)', backup: backups[1], canRestore: true },
    { id: '2', name: 'This Morning (Today 02:00)', backup: backups[0], canRestore: true },
    { id: '3', name: 'Yesterday (Pre-Migration)', backup: backups[2], canRestore: true },
    { id: '4', name: 'Last Week (Week 41)', backup: backups[3], canRestore: true }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'bg-purple-100 text-purple-800';
      case 'incremental': return 'bg-blue-100 text-blue-800';
      case 'differential': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateBackup = async () => {
    if (!confirm('Create manual backup? This may take several minutes.')) return;
    
    setCreating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setCreating(false);
    alert('Backup created successfully!');
  };

  const handleDownloadBackup = (backupId: string) => {
    alert(`Downloading backup ${backupId}...`);
  };

  const handleDeleteBackup = (backupId: string) => {
    if (confirm('Delete this backup? This action cannot be undone.')) {
      alert(`Backup ${backupId} deleted`);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Restore from this backup? Current data will be replaced. This action cannot be undone!')) return;
    
    setRestoring(backupId);
    await new Promise(resolve => setTimeout(resolve, 5000));
    setRestoring(null);
    alert('Database restored successfully!');
  };

  const handleToggleSchedule = (scheduleId: string) => {
    alert(`Toggling schedule ${scheduleId}...`);
  };

  const handleRunScheduleNow = async (scheduleId: string) => {
    if (!confirm('Run this backup schedule now?')) return;
    alert(`Running schedule ${scheduleId}...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💾 Backup & Recovery</h1>
            <p className="text-gray-600">Database backups, disaster recovery, and data protection</p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {creating ? '⏳ Creating Backup...' : '+ Create Manual Backup'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Backups</h3>
            <p className="text-3xl font-bold text-gray-900">{backups.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Size</h3>
            <p className="text-3xl font-bold text-green-600">7.2 GB</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Last Backup</h3>
            <p className="text-3xl font-bold text-blue-600">2h ago</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Schedules</h3>
            <p className="text-3xl font-bold text-purple-600">
              {schedules.filter(s => s.enabled).length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('backups')}
            className={`pb-2 px-4 ${activeTab === 'backups' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Backup History
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-2 px-4 ${activeTab === 'schedule' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Backup Schedules
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`pb-2 px-4 ${activeTab === 'recovery' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Recovery Points
          </button>
        </div>

        {/* Backup History Tab */}
        {activeTab === 'backups' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Backup Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tables/Rows</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map(backup => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{backup.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{backup.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(backup.type)}`}>
                        {backup.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {backup.size}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {backup.tables} tables / {backup.rows.toLocaleString()} rows
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(backup.createdAt).toLocaleString('nl-NL')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadBackup(backup.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
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
          </div>
        )}

        {/* Backup Schedules Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {schedules.map(schedule => (
              <div key={schedule.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(schedule.type)}`}>
                        {schedule.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        schedule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">📅 {schedule.frequency}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Next Run:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Date(schedule.nextRun).toLocaleString('nl-NL')}
                        </span>
                      </div>
                      {schedule.lastRun && (
                        <div>
                          <span className="text-gray-500">Last Run:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date(schedule.lastRun).toLocaleString('nl-NL')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleSchedule(schedule.id)}
                      className={`px-4 py-2 rounded-lg ${
                        schedule.enabled 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {schedule.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleRunScheduleNow(schedule.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Run Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recovery Points Tab */}
        {activeTab === 'recovery' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Warning: Data Restoration</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Restoring from a backup will replace all current data. Make sure to create a backup of the current state before proceeding.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {recoveryPoints.map(point => (
                <div key={point.id} className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{point.name}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Backup Type:</span>
                          <span className="ml-2 font-medium text-gray-900 capitalize">{point.backup.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Size:</span>
                          <span className="ml-2 font-medium text-gray-900">{point.backup.size}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tables:</span>
                          <span className="ml-2 font-medium text-gray-900">{point.backup.tables}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rows:</span>
                          <span className="ml-2 font-medium text-gray-900">{point.backup.rows.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{point.backup.location}</p>
                    </div>
                    <button
                      onClick={() => handleRestoreBackup(point.backup.id)}
                      disabled={!point.canRestore || restoring === point.backup.id}
                      className="ml-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {restoring === point.backup.id ? '⏳ Restoring...' : '🔄 Restore from This Point'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupRecoveryPage;
