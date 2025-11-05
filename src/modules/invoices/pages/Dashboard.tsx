// =====================================================
// DASHBOARD PAGE
// =====================================================
// Main dashboard with invoice statistics and recent invoices
// Adapted from NORBS for ZZP Werkplaats with Supabase
// =====================================================

import { useTranslation } from '../i18n';
import { useSupabaseInvoices, useSupabaseClients } from '../hooks';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency, formatDate } from '../lib';
import { useMemo } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';

interface DashboardProps {
  onNavigate: (page: string, id?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  
  const { invoices, loading: invoicesLoading } = useSupabaseInvoices(user?.id || '');
  const { clients, loading: clientsLoading } = useSupabaseClients(user?.id || '');

  const stats = useMemo(() => {
    if (invoicesLoading || !invoices) return {
      unpaid: 0,
      thisMonth: 0,
      thisYear: 0,
      totalInvoices: 0,
    };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const unpaidTotal = invoices
      ?.filter(inv => inv.status === 'unpaid')
      .reduce((sum, inv) => sum + inv.total_gross, 0) || 0;

    const thisMonthTotal = invoices
      ?.filter(inv => {
        const date = new Date(inv.invoice_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.total_gross, 0) || 0;

    const thisYearTotal = invoices
      ?.filter(inv => {
        const date = new Date(inv.invoice_date);
        return date.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.total_gross, 0) || 0;

    return {
      unpaid: unpaidTotal,
      thisMonth: thisMonthTotal,
      thisYear: thisYearTotal,
      totalInvoices: invoices?.length || 0,
    };
  }, [invoices, invoicesLoading]);

  const recentInvoices = useMemo(() => {
    return (invoices || [])
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 5);
  }, [invoices]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'error'> = {
      paid: 'success',
      unpaid: 'error',
      partial: 'warning',
      cancelled: 'secondary',
    };
    
    const labels: Record<string, string> = {
      paid: t.invoices.statuses.paid,
      unpaid: t.invoices.statuses.unpaid,
      partial: t.invoices.statuses.partial,
      cancelled: t.invoices.statuses.cancelled,
    };
    
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                🎯 {t.dashboard.title}
              </h1>
              <p className="text-blue-100 text-lg">Witaj w nowoczesnym systemie fakturowania</p>
            </div>
            <Button 
              onClick={() => onNavigate('invoice-form')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-xl"
            >
              ➕ {t.invoices.newInvoice}
            </Button>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-xl"></div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Unpaid */}
          <Card className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10"></div>
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{t.dashboard.unpaidInvoices}</h3>
              <div className="p-2 bg-red-100 rounded-xl">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="relative text-3xl font-bold text-gray-900 font-mono">
              {formatCurrency(stats.unpaid)}
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-red-200/30 rounded-full blur-lg"></div>
          </Card>

          {/* This Month */}
          <Card className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10"></div>
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{t.dashboard.thisMonth}</h3>
              <div className="p-2 bg-blue-100 rounded-xl">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="relative text-3xl font-bold text-gray-900 font-mono">
              {formatCurrency(stats.thisMonth)}
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-200/30 rounded-full blur-lg"></div>
          </Card>

          {/* This Year */}
          <Card className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10"></div>
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{t.dashboard.thisYear}</h3>
              <div className="p-2 bg-green-100 rounded-xl">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="relative text-3xl font-bold text-gray-900 font-mono">
              {formatCurrency(stats.thisYear)}
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-green-200/30 rounded-full blur-lg"></div>
          </Card>

          {/* Total Invoices */}
          <Card className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10"></div>
            <div className="relative flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{t.dashboard.totalInvoices}</h3>
              <div className="p-2 bg-purple-100 rounded-xl">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="relative text-3xl font-bold text-gray-900 font-mono">
              {stats.totalInvoices}
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-purple-200/30 rounded-full blur-lg"></div>
          </Card>
        </div>

        {/* Modern Recent Invoices */}
        <Card className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/30 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.dashboard.recentInvoices}</h2>
                <p className="text-gray-600">Ostatnie 5 faktur w systemie</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            
            {invoicesLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">{t.common.loading}</p>
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl inline-block mb-6">
                  <svg className="w-16 h-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Brak faktur</h3>
                <p className="text-gray-600 mb-6 text-lg">Utwórz pierwszą fakturę</p>
                <Button 
                  onClick={() => onNavigate('invoice-form')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-xl"
                >
                  ➕ {t.invoices.newInvoice}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInvoices.map((invoice) => {
                  const client = clients?.find(c => c.id === invoice.client_id);
                  return (
                    <div
                      key={invoice.id}
                      className="group relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 p-6 hover:bg-white/80 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                      onClick={() => onNavigate('invoice-form', invoice.id)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
                      <div className="relative flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-mono font-bold text-lg text-gray-900 mb-1">
                            {invoice.invoice_number}
                          </div>
                          <div className="text-gray-600 font-medium">
                            {client?.name || 'Unknown'}
                          </div>
                        </div>
                        <div className="text-right mr-6">
                          <div className="font-mono font-bold text-xl text-gray-900">
                            {formatCurrency(invoice.total_gross)}
                          </div>
                          <div className="text-gray-600">
                            {formatDate(invoice.invoice_date)}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {getStatusBadge(invoice.status)}
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-blue-200/20 rounded-full blur-xl group-hover:bg-purple-200/30 transition-all duration-300"></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
