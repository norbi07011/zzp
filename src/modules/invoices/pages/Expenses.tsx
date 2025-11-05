// =====================================================
// EXPENSES PAGE
// =====================================================
// Business expense tracking with VAT deduction
// Adapted from NORBS for ZZP Werkplaats (SIMPLIFIED)
// =====================================================

import { useState, useMemo } from 'react';
import { useTranslation } from '../i18n';
import { useSupabaseExpenses } from '../hooks';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { formatCurrency, formatDate } from '../lib';
import { useAuth } from '../../../../contexts/AuthContext';
import { EXPENSE_CATEGORIES } from '../types';
import type { Expense, ExpenseCategory, PaymentMethod } from '../types';

interface ExpensesProps {
  onNavigate: (page: string, expenseId?: string) => void;
}

export default function Expenses({ onNavigate }: ExpensesProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { expenses, createExpense, updateExpense, deleteExpense } = useSupabaseExpenses(user?.id || '');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  const [formData, setFormData] = useState<{
    date: string;
    category: ExpenseCategory;
    supplier: string;
    description: string;
    amount: number;
    vat_rate: number;
    payment_method: PaymentMethod;
    is_deductible: boolean;
    deductible_percentage: number;
    notes?: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    category: 'software',
    supplier: '',
    description: '',
    amount: 0,
    vat_rate: 21,
    payment_method: 'bank_transfer',
    is_deductible: true,
    deductible_percentage: 100,
  });

  // Filter by month
  const filteredExpenses = useMemo(() => {
    return (expenses || [])
      .filter(exp => exp.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedMonth]);

  // Totals
  const totals = useMemo(() => {
    return {
      count: filteredExpenses.length,
      amount: filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      vat: filteredExpenses.reduce((sum, exp) => sum + exp.vat_amount, 0),
      gross: filteredExpenses.reduce((sum, exp) => sum + exp.amount + exp.vat_amount, 0),
      deductibleVat: filteredExpenses.reduce((sum, exp) => 
        sum + (exp.is_deductible ? exp.vat_amount * (exp.deductible_percentage / 100) : 0), 0
      ),
    };
  }, [filteredExpenses]);

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        date: expense.date,
        category: expense.category,
        supplier: expense.supplier || '',
        description: expense.description,
        amount: expense.amount,
        vat_rate: expense.vat_rate,
        payment_method: expense.payment_method || 'bank_transfer',
        is_deductible: expense.is_deductible,
        deductible_percentage: expense.deductible_percentage,
        notes: expense.notes,
      });
    } else {
      setEditingExpense(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'software',
        supplier: '',
        description: '',
        amount: 0,
        vat_rate: 21,
        payment_method: 'bank_transfer',
        is_deductible: true,
        deductible_percentage: 100,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.supplier || !formData.description || formData.amount <= 0) {
      alert('Dostawca, opis i kwota są wymagane');
      return;
    }

    try {
      const vatAmount = Math.round(formData.amount * (formData.vat_rate / 100) * 100) / 100;

      const expenseData = {
        ...formData,
        user_id: user?.id || '',
        vat_amount: vatAmount,
        is_paid: false, // Default unpaid
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
        alert('Wydatek zaktualizowany');
      } else {
        await createExpense(expenseData);
        alert('Wydatek dodany');
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      alert('Błąd zapisu wydatku');
      console.error(error);
    }
  };

  const handleDelete = async (id: string, supplier: string) => {
    if (confirm(`Czy na pewno usunąć wydatek "${supplier}"?`)) {
      try {
        await deleteExpense(id);
        alert('Wydatek usunięty');
      } catch (error) {
        alert('Błąd usuwania');
        console.error(error);
      }
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Data', 'Kategoria', 'Dostawca', 'Opis', 'Kwota', 'VAT', 'Brutto'].join(';'),
      ...filteredExpenses.map(exp => {
        const categoryInfo = EXPENSE_CATEGORIES.find(c => c.category === exp.category);
        return [
          exp.date,
          categoryInfo?.name_pl || exp.category,
          exp.supplier || '',
          exp.description,
          exp.amount.toFixed(2),
          exp.vat_amount.toFixed(2),
          (exp.amount + exp.vat_amount).toFixed(2),
        ].join(';');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `wydatki_${selectedMonth}.csv`;
    link.click();
    alert('CSV wyeksportowany');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                💳 {t.expenses.title}
              </h1>
              <p className="text-purple-100 text-lg">Koszty biznesowe i rozliczenia VAT</p>
            </div>
            <Button 
              onClick={() => handleOpenDialog()}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl"
            >
              ➕ Nowy wydatek
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100">
            <div className="text-sm text-gray-600 mb-1">Łącznie wydatków</div>
            <div className="text-2xl font-bold text-blue-600">{totals.count}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="text-sm text-gray-600 mb-1">Razem</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.amount)}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-100">
            <div className="text-sm text-gray-600 mb-1">VAT do odliczenia</div>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totals.deductibleVat)}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-100">
            <div className="text-sm text-gray-600 mb-1">Brutto</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.gross)}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Miesiąc:</label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-48"
              />
            </div>
            <Button onClick={handleExportCSV} className="bg-blue-600 hover:bg-blue-700 text-white">
              📥 Eksport CSV
            </Button>
          </div>
        </Card>

        {/* Expenses List */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Wydatki - {selectedMonth}</h2>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Brak wydatków</h3>
              <p className="text-gray-600 mb-6">Dodaj pierwszy wydatek tego miesiąca</p>
              <Button onClick={() => handleOpenDialog()} className="bg-purple-600 hover:bg-purple-700 text-white">
                ➕ Dodaj wydatek
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 p-4 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl border-b border-gray-200 font-bold text-gray-700 text-sm">
                <div>Data</div>
                <div>Kategoria</div>
                <div>Dostawca</div>
                <div className="text-right">Kwota</div>
                <div className="text-right">VAT</div>
                <div>% Odliczenia</div>
                <div className="text-right">Akcje</div>
              </div>
              
              {/* Table Body */}
              {filteredExpenses.map((expense) => {
                const categoryInfo = EXPENSE_CATEGORIES.find(c => c.category === expense.category);
                return (
                  <div
                    key={expense.id}
                    className="grid grid-cols-7 gap-4 items-center p-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/80 hover:shadow-lg transition-all text-sm"
                  >
                    <div className="font-medium text-gray-900">{formatDate(expense.date)}</div>
                    <div className="text-gray-700">
                      {categoryInfo?.name_pl || expense.category}
                    </div>
                    <div className="font-bold text-gray-900">{expense.supplier || '-'}</div>
                    <div className="text-right font-mono text-gray-900">{formatCurrency(expense.amount)}</div>
                    <div className="text-right font-mono text-purple-600">{formatCurrency(expense.vat_amount)}</div>
                    <div>
                      <Badge variant={expense.is_deductible ? 'success' : 'secondary'}>
                        {expense.deductible_percentage}%
                      </Badge>
                    </div>
                    <div className="text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenDialog(expense)}
                        className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-purple-700 text-xs font-medium"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id, expense.supplier || 'wydatek')}
                        className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-red-700 text-xs font-medium"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingExpense ? '✏️ Edytuj wydatek' : '➕ Nowy wydatek'}
              </h2>
              <p className="text-gray-600">Dodaj fakturę zakupu lub koszt biznesowy</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Data *</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kategoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.category} value={cat.category}>
                        {cat.name_pl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Dostawca / Vendor *</label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Adobe, Google, IKEA, MediaMarkt..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Opis</label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Dodatkowy opis wydatku"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kwota (€) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stawka VAT (%)</label>
                  <select
                    value={formData.vat_rate}
                    onChange={(e) => setFormData({ ...formData, vat_rate: parseFloat(e.target.value) })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="0">0%</option>
                    <option value="9">9%</option>
                    <option value="21">21%</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kwota + VAT</label>
                  <div className="flex h-10 items-center px-3 py-2 bg-gray-100 rounded-md font-mono font-bold text-gray-900">
                    {formatCurrency(formData.amount * (1 + formData.vat_rate / 100))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Metoda płatności</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="bank_transfer">Przelew</option>
                  <option value="cash">Gotówka</option>
                  <option value="card">Karta</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Inne</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="vat_deductible"
                    checked={formData.is_deductible}
                    onChange={(e) => setFormData({ ...formData, is_deductible: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="vat_deductible" className="text-sm text-gray-700 font-medium">
                    VAT jest odliczalny
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">% Odliczenia VAT</label>
                  <select
                    value={formData.deductible_percentage}
                    onChange={(e) => setFormData({ ...formData, deductible_percentage: parseFloat(e.target.value) })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    disabled={!formData.is_deductible}
                  >
                    <option value="100">100% (w pełni biznesowy)</option>
                    <option value="75">75%</option>
                    <option value="50">50% (mieszany)</option>
                    <option value="25">25%</option>
                    <option value="0">0% (prywatny)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Notatki</label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Dodatkowe informacje..."
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-4 sticky bottom-0 bg-white">
              <Button 
                onClick={() => setIsDialogOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                {t.common.cancel}
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {t.common.save}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
