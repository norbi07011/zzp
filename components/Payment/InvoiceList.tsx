// ===================================
// INVOICE LIST COMPONENT - Dutch Facturen
// ===================================

import React from 'react';
import { Download, Eye, Mail, Check, Clock, AlertCircle, XCircle } from 'lucide-react';
import type { Invoice } from '@/types/payment';
import { invoiceService } from '@/services/payment/invoiceService';
import './InvoiceList.css';

interface InvoiceListProps {
  companyId?: string;
  workerId?: string;
  onViewInvoice?: (invoice: Invoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  companyId,
  workerId,
  onViewInvoice,
}) => {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadInvoices();
  }, [companyId, workerId]);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      let data: Invoice[];

      if (companyId) {
        data = await invoiceService.getCompanyInvoices(companyId);
      } else if (workerId) {
        data = await invoiceService.getWorkerInvoices(workerId);
      } else {
        throw new Error('Either companyId or workerId must be provided');
      }

      setInvoices(data);
    } catch (err) {
      console.error('❌ Error loading invoices:', err);
      setError('Fout bij het laden van facturen. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    setActionLoading(`download-${invoice.id}`);

    try {
      const blob = await invoiceService.generateInvoicePDF(invoice.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factuur-${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Error downloading PDF:', err);
      alert('Fout bij het downloaden van de factuur. Probeer het opnieuw.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    const email = prompt('Voer het e-mailadres in om de factuur naar te versturen:');
    if (!email) return;

    setActionLoading(`email-${invoice.id}`);

    try {
      await invoiceService.sendInvoiceEmail(invoice.id, email);
      alert(`Factuur succesvol verstuurd naar ${email}`);
    } catch (err) {
      console.error('❌ Error sending email:', err);
      alert('Fout bij het versturen van de factuur. Probeer het opnieuw.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatAmount = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <Check size={20} className="status-icon success" />;
      case 'sent':
        return <Clock size={20} className="status-icon warning" />;
      case 'overdue':
        return <AlertCircle size={20} className="status-icon danger" />;
      case 'canceled':
        return <XCircle size={20} className="status-icon muted" />;
      default:
        return <Clock size={20} className="status-icon muted" />;
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    const statusMap = {
      draft: 'Concept',
      sent: 'Verstuurd',
      paid: 'Betaald',
      overdue: 'Achterstallig',
      canceled: 'Geannuleerd',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="invoice-list loading">
        <div className="loading-spinner">Facturen laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-list error">
        <div className="error-message">{error}</div>
        <button onClick={loadInvoices} className="retry-button">
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="invoice-list empty">
        <p>Nog geen facturen beschikbaar.</p>
      </div>
    );
  }

  return (
    <div className="invoice-list">
      <div className="invoice-header">
        <h2>Facturen ({invoices.length})</h2>
      </div>

      <div className="invoice-table-container">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Factuurnummer</th>
              <th>Datum</th>
              <th>Vervaldatum</th>
              <th>Bedrag excl. BTW</th>
              <th>BTW (21%)</th>
              <th>Totaal incl. BTW</th>
              <th>Status</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className={`invoice-row status-${invoice.status}`}>
                <td>
                  <strong>{invoice.invoice_number}</strong>
                </td>
                <td>{formatDate(invoice.invoice_date)}</td>
                <td>{formatDate(invoice.due_date)}</td>
                <td>{formatAmount(invoice.subtotal_excl_btw)}</td>
                <td>{formatAmount(invoice.btw_amount)}</td>
                <td>
                  <strong>{formatAmount(invoice.total_incl_btw)}</strong>
                </td>
                <td>
                  <div className="status-badge">
                    {getStatusIcon(invoice.status)}
                    <span>{getStatusText(invoice.status)}</span>
                  </div>
                </td>
                <td>
                  <div className="invoice-actions">
                    <button
                      className="action-button"
                      onClick={() => onViewInvoice?.(invoice)}
                      title="Bekijk factuur"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="action-button"
                      onClick={() => handleDownloadPDF(invoice)}
                      disabled={actionLoading === `download-${invoice.id}`}
                      title="Download PDF"
                    >
                      {actionLoading === `download-${invoice.id}` ? '...' : <Download size={18} />}
                    </button>
                    <button
                      className="action-button"
                      onClick={() => handleSendEmail(invoice)}
                      disabled={actionLoading === `email-${invoice.id}`}
                      title="Verstuur per e-mail"
                    >
                      {actionLoading === `email-${invoice.id}` ? '...' : <Mail size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="invoice-summary">
        <div className="summary-card">
          <h4>Totaal open</h4>
          <p className="amount">
            {formatAmount(
              invoices
                .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
                .reduce((sum, inv) => sum + inv.total_incl_btw, 0)
            )}
          </p>
        </div>
        <div className="summary-card">
          <h4>Totaal betaald</h4>
          <p className="amount success">
            {formatAmount(
              invoices
                .filter((inv) => inv.status === 'paid')
                .reduce((sum, inv) => sum + inv.total_incl_btw, 0)
            )}
          </p>
        </div>
        <div className="summary-card">
          <h4>Achterstallig</h4>
          <p className="amount danger">
            {formatAmount(
              invoices
                .filter((inv) => inv.status === 'overdue')
                .reduce((sum, inv) => sum + inv.total_incl_btw, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
