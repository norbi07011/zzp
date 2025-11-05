// =====================================================
// PDF GENERATOR FOR INVOICES
// =====================================================
// Generate PDF invoices with QR codes (SEPA payment)
// Supports multi-language (PL/NL/EN)
// =====================================================

import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { Invoice, Company, InvoiceLanguage } from '../types/index.js';
import { formatCurrency, formatDate } from './utils.js';
import { generateSEPAQRPayload } from './invoice-utils.js';

// =====================================================
// TRANSLATIONS
// =====================================================
const translations = {
  pl: {
    invoice: 'FAKTURA',
    invoice_number: 'Numer faktury',
    invoice_date: 'Data wystawienia',
    due_date: 'Termin płatności',
    seller: 'SPRZEDAWCA',
    buyer: 'NABYWCA',
    description: 'Opis',
    quantity: 'Ilość',
    unit: 'Jedn.',
    unit_price: 'Cena jedn.',
    vat_rate: 'VAT',
    net_amount: 'Wartość netto',
    vat_amount: 'Kwota VAT',
    gross_amount: 'Wartość brutto',
    total: 'RAZEM',
    payment_method: 'Metoda płatności',
    bank_transfer: 'Przelew bankowy',
    account_number: 'Numer konta',
    notes: 'Uwagi',
    thank_you: 'Dziękujemy za współpracę!',
  },
  nl: {
    invoice: 'FACTUUR',
    invoice_number: 'Factuurnummer',
    invoice_date: 'Factuurdatum',
    due_date: 'Vervaldatum',
    seller: 'VERKOPER',
    buyer: 'KOPER',
    description: 'Omschrijving',
    quantity: 'Aantal',
    unit: 'Eenh.',
    unit_price: 'Eenheidsprijs',
    vat_rate: 'BTW',
    net_amount: 'Netto bedrag',
    vat_amount: 'BTW bedrag',
    gross_amount: 'Bruto bedrag',
    total: 'TOTAAL',
    payment_method: 'Betalingsmethode',
    bank_transfer: 'Bankoverschrijving',
    account_number: 'Rekeningnummer',
    notes: 'Opmerkingen',
    thank_you: 'Bedankt voor uw vertrouwen!',
  },
  en: {
    invoice: 'INVOICE',
    invoice_number: 'Invoice number',
    invoice_date: 'Invoice date',
    due_date: 'Due date',
    seller: 'SELLER',
    buyer: 'BUYER',
    description: 'Description',
    quantity: 'Qty',
    unit: 'Unit',
    unit_price: 'Unit price',
    vat_rate: 'VAT',
    net_amount: 'Net amount',
    vat_amount: 'VAT amount',
    gross_amount: 'Gross amount',
    total: 'TOTAL',
    payment_method: 'Payment method',
    bank_transfer: 'Bank transfer',
    account_number: 'Account number',
    notes: 'Notes',
    thank_you: 'Thank you for your business!',
  },
};

// =====================================================
// PDF GENERATOR CLASS
// =====================================================
export class InvoicePDFGenerator {
  private doc: jsPDF;
  private t: typeof translations.en;
  private language: InvoiceLanguage;
  private yPosition: number = 20;
  private readonly pageWidth: number = 210; // A4 width in mm
  private readonly pageHeight: number = 297; // A4 height in mm
  private readonly margin: number = 20;

  constructor(language: InvoiceLanguage = 'nl') {
    this.doc = new jsPDF();
    this.language = language;
    this.t = translations[language];
  }

  /**
   * Generate complete invoice PDF
   */
  async generateInvoice(
    invoice: Invoice,
    company: Company
  ): Promise<Blob> {
    // Reset position
    this.yPosition = 20;

    // Add header
    await this.addHeader(company);

    // Add invoice info
    this.addInvoiceInfo(invoice);

    // Add parties (seller/buyer)
    this.addParties(company, invoice);

    // Add line items table
    this.addLineItemsTable(invoice);

    // Add totals
    this.addTotals(invoice);

    // Add payment info
    this.addPaymentInfo(company, invoice);

    // Add QR code if SEPA data available
    if (company.iban && invoice.payment_qr_payload) {
      await this.addQRCode(invoice.payment_qr_payload);
    }

    // Add footer
    this.addFooter(invoice);

    // Return as blob
    return this.doc.output('blob');
  }

  /**
   * Add company header with logo
   */
  private async addHeader(company: Company): Promise<void> {
    // Company name (large, bold)
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(company.name, this.margin, this.yPosition);
    this.yPosition += 10;

    // Invoice title (right side)
    this.doc.setFontSize(24);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      this.t.invoice,
      this.pageWidth - this.margin,
      25,
      { align: 'right' }
    );
    this.doc.setTextColor(0, 0, 0);

    this.yPosition += 5;
  }

  /**
   * Add invoice number, date, due date
   */
  private addInvoiceInfo(invoice: Invoice): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const rightX = this.pageWidth - this.margin;

    this.doc.text(`${this.t.invoice_number}:`, rightX - 60, this.yPosition);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(invoice.invoice_number, rightX, this.yPosition, { align: 'right' });
    this.yPosition += 5;

    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${this.t.invoice_date}:`, rightX - 60, this.yPosition);
    this.doc.text(formatDate(invoice.invoice_date), rightX, this.yPosition, { align: 'right' });
    this.yPosition += 5;

    this.doc.text(`${this.t.due_date}:`, rightX - 60, this.yPosition);
    this.doc.text(formatDate(invoice.due_date), rightX, this.yPosition, { align: 'right' });
    this.yPosition += 10;
  }

  /**
   * Add seller and buyer information
   */
  private addParties(company: Company, invoice: Invoice): void {
    const clientData = invoice.client_snapshot as any;
    const midX = this.pageWidth / 2;

    // Seller (left column)
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.t.seller, this.margin, this.yPosition);
    
    const sellerY = this.yPosition + 5;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(company.name, this.margin, sellerY);
    this.doc.text(company.address || '', this.margin, sellerY + 4);
    this.doc.text(`${company.postal_code || ''} ${company.city || ''}`, this.margin, sellerY + 8);
    if (company.vat_number) {
      this.doc.text(`VAT: ${company.vat_number}`, this.margin, sellerY + 12);
    }
    if (company.kvk_number) {
      this.doc.text(`KVK: ${company.kvk_number}`, this.margin, sellerY + 16);
    }

    // Buyer (right column)
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.t.buyer, midX + 10, this.yPosition);
    
    const buyerY = this.yPosition + 5;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    if (clientData) {
      this.doc.text(clientData.name || '', midX + 10, buyerY);
      this.doc.text(clientData.address || '', midX + 10, buyerY + 4);
      this.doc.text(`${clientData.postal_code || ''} ${clientData.city || ''}`, midX + 10, buyerY + 8);
      if (clientData.vat_number) {
        this.doc.text(`VAT: ${clientData.vat_number}`, midX + 10, buyerY + 12);
      }
    }

    this.yPosition += 35;
  }

  /**
   * Add line items table
   */
  private addLineItemsTable(invoice: Invoice): void {
    const tableTop = this.yPosition;
    const colWidths = [70, 15, 15, 25, 15, 25, 25];
    const colX = [
      this.margin,
      this.margin + colWidths[0],
      this.margin + colWidths[0] + colWidths[1],
      this.margin + colWidths[0] + colWidths[1] + colWidths[2],
      this.margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      this.margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4],
      this.margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5],
    ];

    // Table header
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, tableTop, this.pageWidth - 2 * this.margin, 7, 'F');
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.t.description, colX[0] + 2, tableTop + 5);
    this.doc.text(this.t.quantity, colX[1] + 2, tableTop + 5);
    this.doc.text(this.t.unit, colX[2] + 2, tableTop + 5);
    this.doc.text(this.t.unit_price, colX[3] + 2, tableTop + 5);
    this.doc.text(this.t.vat_rate, colX[4] + 2, tableTop + 5);
    this.doc.text(this.t.net_amount, colX[5] + 2, tableTop + 5);
    this.doc.text(this.t.gross_amount, colX[6] + 2, tableTop + 5);

    this.yPosition = tableTop + 10;

    // Table rows
    this.doc.setFont('helvetica', 'normal');
    invoice.lines?.forEach((line, index) => {
      this.doc.text(line.description, colX[0] + 2, this.yPosition);
      this.doc.text(line.quantity.toString(), colX[1] + 2, this.yPosition);
      this.doc.text(line.unit || '', colX[2] + 2, this.yPosition);
      this.doc.text(formatCurrency(line.unit_price), colX[3] + 2, this.yPosition);
      this.doc.text(`${line.vat_rate}%`, colX[4] + 2, this.yPosition);
      this.doc.text(formatCurrency(line.line_net), colX[5] + 2, this.yPosition);
      this.doc.text(formatCurrency(line.line_gross), colX[6] + 2, this.yPosition);

      this.yPosition += 6;
    });

    this.yPosition += 5;
  }

  /**
   * Add totals section
   */
  private addTotals(invoice: Invoice): void {
    const rightX = this.pageWidth - this.margin;
    const labelX = rightX - 60;

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');

    // Net total
    this.doc.text(`${this.t.net_amount}:`, labelX, this.yPosition);
    this.doc.text(formatCurrency(invoice.total_net), rightX, this.yPosition, { align: 'right' });
    this.yPosition += 5;

    // VAT total
    this.doc.text(`${this.t.vat_amount}:`, labelX, this.yPosition);
    this.doc.text(formatCurrency(invoice.total_vat), rightX, this.yPosition, { align: 'right' });
    this.yPosition += 5;

    // Line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(labelX, this.yPosition, rightX, this.yPosition);
    this.yPosition += 5;

    // Gross total (bold)
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${this.t.total}:`, labelX, this.yPosition);
    this.doc.text(formatCurrency(invoice.total_gross), rightX, this.yPosition, { align: 'right' });
    this.yPosition += 10;
  }

  /**
   * Add payment information
   */
  private addPaymentInfo(company: Company, invoice: Invoice): void {
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.t.payment_method + ':', this.margin, this.yPosition);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.t.bank_transfer, this.margin + 40, this.yPosition);
    this.yPosition += 5;

    if (company.iban) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(this.t.account_number + ':', this.margin, this.yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(company.iban, this.margin + 40, this.yPosition);
      this.yPosition += 5;
    }

    if (company.bic) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('BIC:', this.margin, this.yPosition);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(company.bic, this.margin + 40, this.yPosition);
      this.yPosition += 10;
    }
  }

  /**
   * Add SEPA QR code for payment
   */
  private async addQRCode(qrPayload: string): Promise<void> {
    try {
      const qrDataURL = await QRCode.toDataURL(qrPayload, {
        width: 300,
        margin: 1,
      });

      const qrSize = 40;
      const qrX = this.pageWidth - this.margin - qrSize;
      const qrY = this.pageHeight - this.margin - qrSize - 30;

      this.doc.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);

      // QR code label
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Scan to pay', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  /**
   * Add footer with notes and thank you message
   */
  private addFooter(invoice: Invoice): void {
    const footerY = this.pageHeight - this.margin - 20;

    // Notes
    if (invoice.notes) {
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(this.t.notes + ':', this.margin, footerY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(invoice.notes, this.margin, footerY + 4, {
        maxWidth: this.pageWidth - 2 * this.margin - 50,
      });
    }

    // Thank you message
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      this.t.thank_you,
      this.pageWidth / 2,
      this.pageHeight - this.margin,
      { align: 'center' }
    );
    this.doc.setTextColor(0, 0, 0);
  }

  /**
   * Download PDF
   */
  downloadPDF(filename: string): void {
    this.doc.save(filename);
  }

  /**
   * Get PDF as blob
   */
  getBlob(): Blob {
    return this.doc.output('blob');
  }
}

/**
 * Helper function to generate and download invoice PDF
 */
export async function generateInvoicePDF(
  invoice: Invoice,
  company: Company,
  download: boolean = true
): Promise<Blob> {
  const generator = new InvoicePDFGenerator(invoice.language);
  const blob = await generator.generateInvoice(invoice, company);

  if (download) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return blob;
}
