/**
 * CertificateManagementPage
 * Admin panel for managing certificates
 */

import React, { useState, useEffect } from 'react';
import {
  getCertificates,
  getWorkerCertificates,
  getCertificateStats,
  getExpiringCertificates,
  verifyWorkerCertificate,
  Certificate,
  WorkerCertificate,
  CertificateFilters
} from '../../services/certificate';

export const CertificateManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'expiring' | 'stats'>('all');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [workerCertificates, setWorkerCertificates] = useState<WorkerCertificate[]>([]);
  const [expiringCerts, setExpiringCerts] = useState<WorkerCertificate[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CertificateFilters>({});

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const data = await getCertificates(filters);
        setCertificates(data);
      } else if (activeTab === 'assigned') {
        const data = await getWorkerCertificates();
        setWorkerCertificates(data);
      } else if (activeTab === 'expiring') {
        const data = await getExpiringCertificates(30);
        setExpiringCerts(data);
      } else if (activeTab === 'stats') {
        const data = await getCertificateStats();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await verifyWorkerCertificate(id, verified);
      loadData();
    } catch (error) {
      console.error('Error verifying certificate:', error);
    }
  };

  const getDifficultyColor = (level: string) => {
    const colors = {
      basic: 'bg-green-100 text-green-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      professional: '👔',
      safety: '🦺',
      technical: '🔧',
      language: '🗣️',
      education: '🎓'
    };
    return icons[category as keyof typeof icons] || '📜';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📜 Certificate Management</h1>
          <p className="text-gray-600">Manage certificates, verify worker qualifications, and track expirations</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Certificates' },
              { key: 'assigned', label: 'Worker Certificates' },
              { key: 'expiring', label: 'Expiring Soon' },
              { key: 'stats', label: 'Statistics' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* All Certificates Tab */}
        {!loading && activeTab === 'all' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search certificates..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                  >
                    <option value="">All</option>
                    <option value="professional">Professional</option>
                    <option value="safety">Safety</option>
                    <option value="technical">Technical</option>
                    <option value="language">Language</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => setFilters({ ...filters, difficulty_level: e.target.value || undefined })}
                  >
                    <option value="">All</option>
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600"
                      onChange={(e) => setFilters({ ...filters, is_popular: e.target.checked || undefined })}
                    />
                    <span className="ml-2 text-sm text-gray-700">Popular only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => (
                <div key={cert.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{getCategoryIcon(cert.category)}</div>
                    <div className="flex flex-col gap-2">
                      {cert.is_popular && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          ⭐ Popular
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(cert.difficulty_level)}`}>
                        {cert.difficulty_level}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{cert.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Industry:</span>
                      {cert.industry}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Issuer:</span>
                      {cert.issuing_organization}
                    </div>
                    {cert.cost_exam_euros && (
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium mr-2">Exam Cost:</span>
                        €{cert.cost_exam_euros}
                      </div>
                    )}
                    {cert.duration_validity_years && (
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium mr-2">Valid for:</span>
                        {cert.duration_validity_years} years
                      </div>
                    )}
                  </div>

                  {cert.mandatory_for_jobs && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        🚨 Mandatory
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Worker Certificates Tab */}
        {!loading && activeTab === 'assigned' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workerCertificates.map(wc => (
                  <tr key={wc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {wc.worker ? `${wc.worker.first_name} ${wc.worker.last_name}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {wc.certificate?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {wc.certificate_number || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(wc.issue_date).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {wc.expiry_date ? new Date(wc.expiry_date).toLocaleDateString('nl-NL') : 'No expiry'}
                    </td>
                    <td className="px-6 py-4">
                      {wc.is_verified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          ✅ Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          ⏳ Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!wc.is_verified && (
                        <button
                          onClick={() => handleVerify(wc.id, true)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Expiring Soon Tab */}
        {!loading && activeTab === 'expiring' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                ⚠️ {expiringCerts.length} certificates expiring in the next 30 days
              </p>
            </div>

            {expiringCerts.map(wc => (
              <div key={wc.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {wc.worker ? `${wc.worker.first_name} ${wc.worker.last_name}` : 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600">{wc.certificate?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Expires:</p>
                    <p className="font-semibold text-red-600">
                      {wc.expiry_date ? new Date(wc.expiry_date).toLocaleDateString('nl-NL') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Tab */}
        {!loading && activeTab === 'stats' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Certificates</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.total_certificates}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Popular</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.popular_certificates}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.assigned_certificates}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Verified</h3>
              <p className="text-3xl font-bold text-green-600">{stats.verified_certificates}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Expiring Soon</h3>
              <p className="text-3xl font-bold text-red-600">{stats.expiring_soon}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateManagementPage;
