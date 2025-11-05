// =====================================================
// INVOICE UTILITIES
// =====================================================
// Helper functions for invoice operations
// - Invoice numbering
// - SEPA QR code generation
// - Payment reference generation
// - Amount calculations
// =====================================================

import type { Invoice, InvoiceLine, Company, Client } from '../types/index.js';

/**
 * Generate SEPA QR code payload (EPC QR code format)
 * Used for European payment QR codes
 */
export function generateSEPAQRPayload(
  company: Company,
  invoice: Invoice,
  amount: number
): string {
  // EPC QR code format (version 002)
  // Reference: https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines-enable-data-capture-initiation
  
  const lines = [
    'BCD',                                    // Service tag
    '002',                                    // Version
    '1',                                      // Character set (1 = UTF-8)
    'SCT',                                    // Identification (SEPA Credit Transfer)
    company.bic || '',                        // BIC
    company.name.substring(0, 70),            // Beneficiary name (max 70 chars)
    company.iban || '',                       // Beneficiary account (IBAN)
    `EUR${amount.toFixed(2)}`,                // Amount (EUR + value)
    '',                                       // Purpose (empty)
    invoice.payment_reference || invoice.invoice_number, // Structured reference
    invoice.invoice_number,                   // Unstructured remittance
    '',                                       // Beneficiary to originator information
  ];

  return lines.join('\n');
}

/**
 * Generate payment reference (structured format)
 * Format: INV-YYYYMMDD-XXX
 */
export function generatePaymentReference(invoiceNumber: string, date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `INV-${year}${month}${day}-${invoiceNumber}`;
}

/**
 * Calculate line totals
 */
export function calculateLineTotals(line: Partial<InvoiceLine>): {
  net: number;
  vat: number;
  gross: number;
} {
  const quantity = line.quantity || 0;
  const unitPrice = line.unit_price || 0;
  const vatRate = line.vat_rate || 0;

  const net = quantity * unitPrice;
  const vat = net * (vatRate / 100);
  const gross = net + vat;

  return {
    net: Math.round(net * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    gross: Math.round(gross * 100) / 100,
  };
}

/**
 * Calculate invoice totals from lines
 */
export function calculateInvoiceTotals(lines: InvoiceLine[]): {
  total_net: number;
  total_vat: number;
  total_gross: number;
} {
  const totals = lines.reduce(
    (acc, line) => {
      const lineTotals = calculateLineTotals(line);
      return {
        net: acc.net + lineTotals.net,
        vat: acc.vat + lineTotals.vat,
        gross: acc.gross + lineTotals.gross,
      };
    },
    { net: 0, vat: 0, gross: 0 }
  );

  return {
    total_net: Math.round(totals.net * 100) / 100,
    total_vat: Math.round(totals.vat * 100) / 100,
    total_gross: Math.round(totals.gross * 100) / 100,
  };
}

/**
 * Get next invoice number
 * Format: FV-YYYY-MM-XXX
 */
export function getNextInvoiceNumber(
  existingInvoices: Invoice[],
  date: Date
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // Filter invoices from the same month
  const monthInvoices = existingInvoices.filter(inv => {
    const invDate = new Date(inv.invoice_date);
    return (
      invDate.getFullYear() === year &&
      invDate.getMonth() === date.getMonth()
    );
  });

  const nextNumber = monthInvoices.length + 1;
  const numberPart = String(nextNumber).padStart(3, '0');

  return `FV-${year}-${month}-${numberPart}`;
}

/**
 * Validate IBAN format (basic validation)
 */
export function validateIBAN(iban: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Basic format check (2 letters + 2 digits + up to 30 alphanumeric)
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
  
  return ibanRegex.test(cleanIban);
}

/**
 * Format IBAN for display (with spaces every 4 characters)
 */
export function formatIBAN(iban: string): string {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  return cleanIban.match(/.{1,4}/g)?.join(' ') || iban;
}

/**
 * Validate VAT number format (basic EU format)
 */
export function validateVATNumber(vat: string, country: string): boolean {
  const cleanVat = vat.replace(/\s/g, '').toUpperCase();
  
  // Basic validation - should start with country code
  const countryCode = cleanVat.substring(0, 2);
  
  if (countryCode !== country.toUpperCase()) {
    return false;
  }

  // Minimum length check
  return cleanVat.length >= 8;
}

/**
 * Get client snapshot for invoice
 * Stores client data at the time of invoice creation
 */
export function getClientSnapshot(client: Client | null): any {
  if (!client) return null;

  return {
    name: client.name,
    type: client.type,
    contact_person: client.contact_person,
    email: client.email,
    phone: client.phone,
    address: client.address,
    postal_code: client.postal_code,
    city: client.city,
    country: client.country,
    kvk_number: client.kvk_number,
    vat_number: client.vat_number,
    nip_number: client.nip_number,
    tax_id: client.tax_id,
  };
}

/**
 * Calculate days until due
 */
export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return false;
  }
  
  return getDaysUntilDue(invoice.due_date) < 0;
}

/**
 * Get invoice status color for badges
 */
export function getInvoiceStatusColor(status: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'partial':
      return 'warning';
    case 'cancelled':
      return 'error';
    case 'unpaid':
      return 'info';
    default:
      return 'default';
  }
}

/**
 * Export invoice data to CSV format
 */
export function exportInvoicesToCSV(invoices: Invoice[]): string {
  const headers = [
    'Invoice Number',
    'Date',
    'Due Date',
    'Client',
    'Status',
    'Net Amount',
    'VAT Amount',
    'Gross Amount',
    'Paid Amount',
    'Currency',
  ];

  const rows = invoices.map(inv => [
    inv.invoice_number,
    inv.invoice_date,
    inv.due_date,
    inv.client_snapshot?.name || '',
    inv.status,
    inv.total_net.toFixed(2),
    inv.total_vat.toFixed(2),
    inv.total_gross.toFixed(2),
    inv.paid_amount?.toFixed(2) || '0.00',
    'EUR',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}
