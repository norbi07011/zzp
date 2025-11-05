// =====================================================
// REPORTS PAGE (SIMPLIFIED)
// =====================================================
// Financial reporting without charts
// Adapted from NORBS for ZZP Werkplaats
// =====================================================

import { useState, useMemo } from 'react';
import { useTranslation } from '../i18n';
import { useSupabaseInvoices, useSupabaseExpenses, useSupabaseBTW } from '../hooks';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency, formatDate } from '../lib';
import { useAuth } from '../../../../contexts/AuthContext';
import type { BTWDeclaration } from '../types';

interface ReportsProps {
  onNavigate: (page: string) => void;
}

export default function Reports({ onNavigate }: ReportsProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { invoices } = useSupabaseInvoices(user?.id || '');
  const { expenses } = useSupabaseExpenses(user?.id || '');
  const { declarations } = useSupabaseBTW(user?.id || '');

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // Available years from invoices
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    (invoices || []).forEach(inv => {
      const year = new Date(inv.invoice_date).getFullYear();
      years.add(year);
    });
    if (years.size === 0) years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [invoices, currentYear]);

  // Year data
  const yearData = useMemo(() => {
    const year = parseInt(selectedYear);
    const yearInvoices = (invoices || []).filter(inv => {
      const invYear = new Date(inv.invoice_date).getFullYear();
      return invYear === year;
    });
    const yearExpenses = (expenses || []).filter(exp => {
      const expYear = new Date(exp.date).getFullYear();
      return expYear === year;
    });

    const totalRevenue = yearInvoices.reduce((sum, inv) => sum + (inv.total_gross || 0), 0);
    const totalNet = yearInvoices.reduce((sum, inv) => sum + (inv.total_net || 0), 0);
    const totalVat = yearInvoices.reduce((sum, inv) => sum + (inv.total_vat || 0), 0);
    
    const totalExpenses = yearExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalExpensesVat = yearExpenses.reduce((sum, exp) => {
      const vat = (exp.amount || 0) * (exp.vat_rate / 100);
      const deductible = exp.is_deductible ? (exp.deductible_percentage || 100) / 100 : 0;
      return sum + (vat * deductible);
    }, 0);

    const profit = totalNet - totalExpenses;

    // Paid vs unpaid invoices
    const paidInvoices = yearInvoices.filter(inv => inv.status === 'paid');
    const unpaidInvoices = yearInvoices.filter(inv => inv.status !== 'paid');
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.total_gross || 0), 0);
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + (inv.total_gross || 0), 0);

    return {
      totalRevenue,
      totalNet,
      totalVat,
      totalExpenses,
      totalExpensesVat,
      profit,
      invoicesCount: yearInvoices.length,
      expensesCount: yearExpenses.length,
      paidCount: paidInvoices.length,
      unpaidCount: unpaidInvoices.length,
      totalPaid,
      totalUnpaid,
    };
  }, [selectedYear, invoices, expenses]);

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    const year = parseInt(selectedYear);
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthInvoices = (invoices || []).filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return invDate.getFullYear() === year && invDate.getMonth() + 1 === month;
      });
      const monthExpenses = (expenses || []).filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getFullYear() === year && expDate.getMonth() + 1 === month;
      });

      const revenue = monthInvoices.reduce((sum, inv) => sum + (inv.total_gross || 0), 0);
      const expensesTotal = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const profit = revenue - expensesTotal;

      return {
        month,
        monthName: new Date(year, i, 1).toLocaleDateString('pl-PL', { month: 'long' }),
        revenue,
        expenses: expensesTotal,
        profit,
        count: monthInvoices.length,
      };
    });
    return months;
  }, [selectedYear, invoices, expenses]);

  // Quarterly breakdown
  const quarterlyData = useMemo(() => {
    const quarters = [
      { quarter: 'Q1', months: [1, 2, 3] },
      { quarter: 'Q2', months: [4, 5, 6] },
      { quarter: 'Q3', months: [7, 8, 9] },
      { quarter: 'Q4', months: [10, 11, 12] },
    ];
    return quarters.map(q => {
      const qMonths = monthlyData.filter(m => q.months.includes(m.month));
      const revenue = qMonths.reduce((sum, m) => sum + m.revenue, 0);
      const expensesTotal = qMonths.reduce((sum, m) => sum + m.expenses, 0);
      const profit = revenue - expensesTotal;
      return {
        quarter: q.quarter,
        revenue,
        expenses: expensesTotal,
        profit,
        count: qMonths.reduce((sum, m) => sum + m.count, 0),
      };
    });
  }, [monthlyData]);

  // VAT declarations status
  const vatStatus = useMemo(() => {
    const year = parseInt(selectedYear);
    const yearDeclarations = (declarations || []).filter((decl: BTWDeclaration) => {
      const declYear = parseInt(decl.quarter.split('Q')[0]);
      return declYear === year;
    });
    const submitted = yearDeclarations.filter((d: BTWDeclaration) => d.status === 'submitted' || d.status === 'paid');
    const paid = yearDeclarations.filter((d: BTWDeclaration) => d.status === 'paid');
    const totalBalance = yearDeclarations.reduce((sum: number, d: BTWDeclaration) => sum + (d.balance || 0), 0);

    return {
      total: yearDeclarations.length,
      submitted: submitted.length,
      paid: paid.length,
      totalBalance,
    };
  }, [selectedYear, declarations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                📊 {t.reports.title}
              </h1>
              <p className="text-purple-100 text-lg">Raporty finansowe i analiza</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-purple-100">Rok:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-xl text-white font-bold border-2 border-white/30"
              >
                {availableYears.map(year => (
                  <option key={year} value={year} className="text-gray-900">{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100">
            <div className="text-sm text-gray-600 mb-1">Przychody brutto</div>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(yearData.totalRevenue)}</div>
            <div className="text-xs text-gray-500 mt-1">{yearData.invoicesCount} faktur</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-100">
            <div className="text-sm text-gray-600 mb-1">Wydatki</div>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(yearData.totalExpenses)}</div>
            <div className="text-xs text-gray-500 mt-1">{yearData.expensesCount} pozycji</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="text-sm text-gray-600 mb-1">Zysk</div>
            <div className={`text-3xl font-bold ${yearData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(yearData.profit)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {yearData.profit >= 0 ? '↗️ Dodatni' : '↘️ Ujemny'}
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-100">
            <div className="text-sm text-gray-600 mb-1">VAT do rozliczenia</div>
            <div className="text-3xl font-bold text-purple-600">{formatCurrency(vatStatus.totalBalance)}</div>
            <div className="text-xs text-gray-500 mt-1">{vatStatus.paid}/4 deklaracji opłacone</div>
          </Card>
        </div>

        {/* Payment Status */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Status płatności</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Opłacone</span>
                <Badge variant="success">{yearData.paidCount} faktur</Badge>
              </div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(yearData.totalPaid)}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Nieopłacone</span>
                <Badge variant="warning">{yearData.unpaidCount} faktur</Badge>
              </div>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(yearData.totalUnpaid)}</div>
            </div>
          </div>
        </Card>

        {/* Quarterly Breakdown */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Rozliczenie kwartalne</h2>
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 p-4 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl font-bold text-gray-700 text-sm">
              <div>Kwartał</div>
              <div className="text-right">Przychody</div>
              <div className="text-right">Wydatki</div>
              <div className="text-right">Zysk</div>
              <div className="text-right">Faktury</div>
            </div>
            
            {/* Data */}
            {quarterlyData.map((q) => (
              <div
                key={q.quarter}
                className="grid grid-cols-5 gap-4 items-center p-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/80 transition-all"
              >
                <div className="font-bold text-gray-900">{q.quarter}</div>
                <div className="text-right font-mono text-blue-600">{formatCurrency(q.revenue)}</div>
                <div className="text-right font-mono text-red-600">{formatCurrency(q.expenses)}</div>
                <div className={`text-right font-mono font-bold ${q.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(q.profit)}
                </div>
                <div className="text-right text-gray-700">{q.count}</div>
              </div>
            ))}
            
            {/* Total */}
            <div className="grid grid-cols-5 gap-4 items-center p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl font-bold border-2 border-blue-300">
              <div className="text-gray-900">RAZEM</div>
              <div className="text-right font-mono text-blue-700">{formatCurrency(yearData.totalRevenue)}</div>
              <div className="text-right font-mono text-red-700">{formatCurrency(yearData.totalExpenses)}</div>
              <div className={`text-right font-mono ${yearData.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(yearData.profit)}
              </div>
              <div className="text-right text-gray-900">{yearData.invoicesCount}</div>
            </div>
          </div>
        </Card>

        {/* Monthly Breakdown */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📆 Rozliczenie miesięczne</h2>
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 p-4 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl font-bold text-gray-700 text-sm">
              <div>Miesiąc</div>
              <div className="text-right">Przychody</div>
              <div className="text-right">Wydatki</div>
              <div className="text-right">Zysk</div>
              <div className="text-right">Faktury</div>
            </div>
            
            {/* Data */}
            {monthlyData.filter(m => m.revenue > 0 || m.expenses > 0).map((m) => (
              <div
                key={m.month}
                className="grid grid-cols-5 gap-4 items-center p-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/80 transition-all text-sm"
              >
                <div className="font-bold text-gray-900 capitalize">{m.monthName}</div>
                <div className="text-right font-mono text-blue-600">{formatCurrency(m.revenue)}</div>
                <div className="text-right font-mono text-red-600">{formatCurrency(m.expenses)}</div>
                <div className={`text-right font-mono font-bold ${m.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(m.profit)}
                </div>
                <div className="text-right text-gray-700">{m.count}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* VAT Summary */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🧾 Podsumowanie VAT</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">VAT należny</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(yearData.totalVat)}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">VAT naliczony (do odliczenia)</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(yearData.totalExpensesVat)}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Saldo VAT (do zapłaty)</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(yearData.totalVat - yearData.totalExpensesVat)}
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <div className="font-bold text-gray-900">Status deklaracji VAT</div>
                <div className="text-sm text-gray-700 mt-1">
                  Złożono {vatStatus.submitted}/4 deklaracji kwartalnych • Opłacono {vatStatus.paid}/4 • 
                  Saldo do rozliczenia: {formatCurrency(vatStatus.totalBalance)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
