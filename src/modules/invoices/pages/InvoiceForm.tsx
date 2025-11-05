// =====================================================
// INVOICE FORM PAGE
// =====================================================
// Create/Edit invoice with lines, client selection, VAT
// Adapted from NORBS for ZZP Werkplaats (SIMPLIFIED)
// =====================================================

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { useSupabaseInvoices, useSupabaseClients, useSupabaseProducts, useSupabaseCompany } from '../hooks';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { formatCurrency, calculateLineTotals, calculateInvoiceTotals } from '../lib';
import { useAuth } from '../../../../contexts/AuthContext';
import type { InvoiceLine, CreateInvoiceData } from '../types';

interface InvoiceFormProps {
  onNavigate: (page: string, invoiceId?: string) => void;
  editInvoiceId?: string | null;
}

export default function InvoiceForm({ onNavigate, editInvoiceId }: InvoiceFormProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { clients } = useSupabaseClients(user?.id || '');
  const { products } = useSupabaseProducts(user?.id || '');
  const { company } = useSupabaseCompany(user?.id || '');
  const { invoices, createInvoice, updateInvoice } = useSupabaseInvoices(user?.id || '');
  
  const isEditMode = !!editInvoiceId;
  const invoiceToEdit = isEditMode ? invoices?.find(inv => inv.id === editInvoiceId) : null;

  const [selectedClientId, setSelectedClientId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTermDays, setPaymentTermDays] = useState(14);
  const [reverseCharge, setReverseCharge] = useState(false);
  const [notes, setNotes] = useState('');
  const [language, setLanguage] = useState<'pl' | 'nl' | 'en'>('nl');
  const [lines, setLines] = useState<Array<Partial<InvoiceLine>>>([
    {
      description: '',
      quantity: 1,
      unit_price: 0,
      vat_rate: 21,
      unit: 'uur',
    },
  ]);

  const DUTCH_VAT_RATES = [
    { value: 0, label: '0% (VAT exempt / Export)' },
    { value: 9, label: '9% (Reduced rate)' },
    { value: 21, label: '21% (Standard rate)' },
  ];

  useEffect(() => {
    if (isEditMode && invoiceToEdit) {
      setSelectedClientId(invoiceToEdit.client_id || '');
      setInvoiceDate(invoiceToEdit.invoice_date);
      setNotes(invoiceToEdit.notes || '');
      setLanguage(invoiceToEdit.language || 'nl');
      setReverseCharge(invoiceToEdit.is_reverse_charge);
      
      const issue = new Date(invoiceToEdit.invoice_date);
      const due = new Date(invoiceToEdit.due_date);
      const diffDays = Math.floor((due.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24));
      setPaymentTermDays(diffDays);
      
      if (invoiceToEdit.lines && invoiceToEdit.lines.length > 0) {
        setLines(invoiceToEdit.lines.map(line => ({
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          vat_rate: line.vat_rate,
          unit: line.unit,
        })));
      }
    }
  }, [isEditMode, invoiceToEdit]);

  const dueDate = useMemo(() => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + paymentTermDays);
    return date.toISOString().split('T')[0];
  }, [invoiceDate, paymentTermDays]);

  const totals = useMemo(() => {
    const validLines = lines.filter(l => l.description && l.quantity && l.unit_price !== undefined);
    const calculatedLines: InvoiceLine[] = validLines.map((l, index) => {
      const actualVatRate = reverseCharge ? 0 : (l.vat_rate || 0);
      const lineTotals = calculateLineTotals({ ...l, vat_rate: actualVatRate });
      return {
        id: '',
        invoice_id: '',
        line_number: index + 1,
        description: l.description!,
        quantity: l.quantity!,
        unit: l.unit || 'uur',
        unit_price: l.unit_price!,
        vat_rate: actualVatRate,
        line_net: lineTotals.net,
        line_vat: lineTotals.vat,
        line_gross: lineTotals.gross,
        created_at: '',
      };
    });
    return calculateInvoiceTotals(calculatedLines);
  }, [lines, reverseCharge]);

  const handleAddLine = () => {
    setLines([...lines, { description: '', quantity: 1, unit_price: 0, vat_rate: 21, unit: 'uur' }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const handleSaveInvoice = async () => {
    if (!selectedClientId) {
      alert('Please select a client');
      return;
    }

    if (lines.length === 0 || !lines.some(l => l.description)) {
      alert('⚠️ Dodaj przynajmniej jedną pozycję faktury');
      return;
    }

    if (!company) {
      alert('❌ Brak profilu firmy! Przejdź do Ustawień i wypełnij dane firmy.');
      return;
    }

    const invoiceLines = lines
      .filter(l => l.description)
      .map((l, index) => {
        const actualVatRate = reverseCharge ? 0 : (l.vat_rate || 0);
        const lineTotals = calculateLineTotals({ ...l, vat_rate: actualVatRate });
        return {
          line_number: index + 1,
          description: l.description!,
          quantity: l.quantity!,
          unit: l.unit || 'uur',
          unit_price: l.unit_price!,
          vat_rate: actualVatRate,
          line_net: lineTotals.net,
          line_vat: lineTotals.vat,
          line_gross: lineTotals.gross,
        };
      });

    const invoiceData: CreateInvoiceData = {
      client_id: selectedClientId,
      invoice_date: invoiceDate,
      due_date: dueDate,
      language,
      is_reverse_charge: reverseCharge,
      notes,
      template_name: 'modern',
      lines: invoiceLines,
    };

    try {
      if (isEditMode && invoiceToEdit) {
        await updateInvoice(invoiceToEdit.id, { 
          ...invoiceData,
          invoice_number: invoiceToEdit.invoice_number,
        } as any);
        alert(`Faktura zaktualizowana`);
      } else {
        await createInvoice(invoiceData);
        alert(`Faktura utworzona pomyślnie!`);
      }
      
      setTimeout(() => {
        onNavigate('invoices');
      }, 100);
    } catch (error) {
      alert(isEditMode ? 'Błąd podczas aktualizacji faktury' : 'Błąd podczas tworzenia faktury');
      console.error('Save invoice error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {isEditMode ? `📝 ${t.invoiceForm.editTitle}` : `➕ ${t.invoiceForm.createTitle}`}
              </h1>
              <p className="text-blue-100 text-lg">
                {isEditMode ? `Edytuj fakturę ${invoiceToEdit?.invoice_number}` : 'Utwórz nową fakturę'}
              </p>
            </div>
            <Button 
              onClick={() => onNavigate('invoices')}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              {t.common.cancel}
            </Button>
          </div>
        </div>

        {/* Warning jeśli brak company */}
        {!company && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🚫</div>
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Brak profilu firmy!
                </h3>
                <p className="text-red-800 mb-3">
                  Nie możesz utworzyć faktury bez profilu firmy. 
                  Przejdź do <strong>Ustawień</strong> i wypełnij dane firmy.
                </p>
                <Button 
                  onClick={() => onNavigate('settings')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  ⚙️ Przejdź do Ustawień
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Client & Date Info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.invoiceForm.selectClient}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t.clients.name} *</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                <option value="">{t.invoiceForm.selectClient}</option>
                {(clients || []).map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t.invoices.invoiceDate} *</label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t.clients.paymentTermDays}</label>
              <select
                value={paymentTermDays.toString()}
                onChange={(e) => setPaymentTermDays(parseInt(e.target.value))}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                <option value="7">7 dagen</option>
                <option value="14">14 dagen (Standaard NL)</option>
                <option value="30">30 dagen</option>
                <option value="60">60 dagen</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t.invoices.dueDate}</label>
              <Input type="date" value={dueDate} disabled className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t.invoiceForm.language}</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'pl' | 'nl' | 'en')}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                <option value="nl">Nederlands (NL)</option>
                <option value="en">English (EN)</option>
                <option value="pl">Polski (PL)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="reverseCharge"
                checked={reverseCharge}
                onChange={(e) => setReverseCharge(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="reverseCharge" className="text-sm text-gray-700">
                {t.invoiceForm.reverseCharge}
              </label>
            </div>
          </div>
        </Card>

        {/* Invoice Lines */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{t.invoiceForm.addLine}</h2>
            <Button onClick={handleAddLine} className="bg-green-600 hover:bg-green-700 text-white">
              ➕ {t.invoiceForm.addLine}
            </Button>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl bg-white/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Item {index + 1}</span>
                  {lines.length > 1 && (
                    <button
                      onClick={() => handleRemoveLine(index)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🗑️ {t.common.delete}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">{t.invoiceForm.description} *</label>
                    <Textarea
                      value={line.description || ''}
                      onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                      placeholder="Week 39 - Diensten"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t.invoiceForm.quantity} *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.quantity || 0}
                      onChange={(e) => handleLineChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t.invoiceForm.unitPrice} (EUR) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.unit_price || 0}
                      onChange={(e) => handleLineChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">{t.invoiceForm.vatRate} (%)</label>
                    <select
                      value={(reverseCharge ? 0 : (line.vat_rate || 0)).toString()}
                      onChange={(e) => handleLineChange(index, 'vat_rate', parseFloat(e.target.value))}
                      disabled={reverseCharge}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {DUTCH_VAT_RATES.map((rate) => (
                        <option key={rate.value} value={rate.value}>{rate.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-3 gap-3 pt-2 border-t">
                    <div>
                      <div className="text-xs text-gray-600">{t.invoiceForm.netAmount}</div>
                      <div className="font-mono font-bold text-sm">
                        {formatCurrency(calculateLineTotals({ ...line, vat_rate: 0 }).net)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">{t.invoiceForm.vatAmount}</div>
                      <div className="font-mono font-bold text-sm">
                        {formatCurrency(calculateLineTotals({ ...line, vat_rate: reverseCharge ? 0 : (line.vat_rate || 0) }).vat)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">{t.invoiceForm.grossAmount}</div>
                      <div className="font-mono font-bold text-base text-blue-600">
                        {formatCurrency(calculateLineTotals({ ...line, vat_rate: reverseCharge ? 0 : (line.vat_rate || 0) }).gross)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.invoiceForm.notes}</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opmerkingen voor de klant..."
            rows={4}
          />
        </Card>

        {/* Summary */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.invoiceForm.total}</h2>
          <div className="space-y-3 max-w-md ml-auto">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">{t.invoiceForm.netAmount}:</span>
              <span className="font-mono font-semibold">{formatCurrency(totals.total_net)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-600">{t.invoiceForm.vatAmount}:</span>
              <span className="font-mono font-semibold">{formatCurrency(totals.total_vat)}</span>
            </div>
            {reverseCharge && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                Verleggingsregeling - BTW 0%
              </div>
            )}
            <div className="flex justify-between pt-3 border-t-2 border-blue-600">
              <span className="text-xl font-bold">{t.invoiceForm.grossAmount}:</span>
              <span className="text-xl font-mono font-bold text-blue-600">{formatCurrency(totals.total_gross)}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button onClick={() => onNavigate('invoices')} className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3">
            {t.common.cancel}
          </Button>
          <Button onClick={handleSaveInvoice} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-bold">
            {t.common.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
