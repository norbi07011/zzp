/**
 * PaymentManagementPage
 * Admin panel for managing subscriptions, transactions, invoices
 */

import React, { useState, useEffect } from 'react';
import {
  getSubscriptions,
  getTransactions,
  getPaymentStats,
  updateTransactionStatus,
  updateSubscriptionStatus,
  formatAmount,
  Subscription,
  Transaction,
  PaymentFilters
} from '../../services/payment';

export const PaymentManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'transactions' | 'stats'>('transactions');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentFilters>({});

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'subscriptions') {
        const data = await getSubscriptions();
        setSubscriptions(data);
      } else if (activeTab === 'transactions') {
        const data = await getTransactions(filters);
        setTransactions(data);
      } else if (activeTab === 'stats') {
        const data = await getPaymentStats('month');
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: any, type: 'transaction' | 'subscription') => {
    try {
      if (type === 'transaction') {
        await updateTransactionStatus(id, status);
      } else {
        await updateSubscriptionStatus(id, status);
      }
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-purple-100 text-purple-800',
      past_due: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Payment Management</h1>
          <p className="text-gray-600">Manage subscriptions, transactions, and invoices</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['transactions', 'subscriptions', 'stats'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'stats' ? 'Statistics' : tab}
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

        {/* Transactions Tab */}
        {!loading && activeTab === 'transactions' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : undefined })}
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount (€)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0"
                    onChange={(e) => setFilters({ ...filters, min_amount: parseFloat(e.target.value) || undefined })}
                  />
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.job?.title || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.company?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.worker ? 
                          `${transaction.worker.first_name} ${transaction.worker.last_name}` : 
                          'N/A'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatAmount(transaction.amount_incl_btw)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Fee: {formatAmount(transaction.platform_fee_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-6 py-4">
                        {transaction.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(transaction.id, 'completed', 'transaction')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {!loading && activeTab === 'subscriptions' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period End</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {sub.company?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">{sub.plan_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">{sub.billing_cycle}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sub.current_period_end).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {sub.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'canceled', 'subscription')}
                          className="text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats Tab */}
        {!loading && activeTab === 'stats' && stats && (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">{formatAmount(stats.total_revenue)}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Completed Transactions</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completed_transactions}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Transactions</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending_transactions}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
