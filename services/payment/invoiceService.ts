// ===================================
// INVOICE SERVICE - Dutch Factuur System
// ===================================

import type { Invoice, InvoiceItem, BTWCalculation } from '@/types/payment';
import { calculateBTW } from '@/types/payment';
import { supabase } from '@/lib/supabase';

export class InvoiceService {
  /**
   * Generate Invoice Number (Dutch format: YYYY-NNNN)
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();

    // Get last invoice number for this year
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', `${year}-%`)
      .order('invoice_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching last invoice:', error);
      return `${year}-0001`;
    }

    if (!data || data.length === 0) {
      return `${year}-0001`;
    }

    const lastNumber = parseInt(data[0].invoice_number.split('-')[1]);
    const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
    return `${year}-${nextNumber}`;
  }

  /**
   * Create Invoice for Subscription
   */
  async createSubscriptionInvoice(
    companyId: string,
    planName: string,
    billingCycle: 'monthly' | 'yearly',
    amountExclBTW: number,
    btwPercentage: number = 21
  ): Promise<Invoice> {
    try {
      // Get company details
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError || !company) {
        throw new Error('Company not found');
      }

      // Calculate BTW
      const btwCalc = calculateBTW(amountExclBTW, btwPercentage);

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Create invoice items
      const items: InvoiceItem[] = [
        {
          description: `${planName} abonnement - ${
            billingCycle === 'monthly' ? 'maandelijks' : 'jaarlijks'
          }`,
          quantity: 1,
          unit_price_excl_btw: amountExclBTW,
          btw_percentage: btwPercentage,
          total_excl_btw: amountExclBTW,
          btw_amount: btwCalc.btw_amount,
          total_incl_btw: btwCalc.amount_incl_btw,
        },
      ];

      const invoiceDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days payment term

      const invoice: Invoice = {
        id: crypto.randomUUID(),
        invoice_number: invoiceNumber,
        company_id: companyId,
        company_name: company.company_name,
        company_kvk: company.kvk_number,
        company_btw: company.btw_number,
        company_address: `${company.address}, ${company.postal_code} ${company.city}`,
        invoice_date: invoiceDate,
        due_date: dueDate,
        items,
        subtotal_excl_btw: amountExclBTW,
        btw_amount: btwCalc.btw_amount,
        total_incl_btw: btwCalc.amount_incl_btw,
        status: 'sent',
        payment_terms_days: 14,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Save to database
      const { error: insertError } = await supabase
        .from('invoices')
        .insert([invoice]);

      if (insertError) {
        throw insertError;
      }

      return invoice;
    } catch (error) {
      console.error('❌ Error creating subscription invoice:', error);
      throw error;
    }
  }

  /**
   * Create Invoice for Worker Payment
   */
  async createWorkerPaymentInvoice(
    jobId: string,
    companyId: string,
    workerId: string,
    amountExclBTW: number,
    platformFeePercentage: number = 5,
    btwPercentage: number = 21
  ): Promise<Invoice> {
    try {
      // Get company, worker, and job details
      const [
        { data: company, error: companyError },
        { data: worker, error: workerError },
        { data: job, error: jobError },
      ] = await Promise.all([
        supabase.from('companies').select('*').eq('id', companyId).single(),
        supabase.from('workers').select('*').eq('id', workerId).single(),
        supabase.from('jobs').select('*').eq('id', jobId).single(),
      ]);

      if (companyError || !company) throw new Error('Company not found');
      if (workerError || !worker) throw new Error('Worker not found');
      if (jobError || !job) throw new Error('Job not found');

      // Calculate amounts
      const btwCalc = calculateBTW(amountExclBTW, btwPercentage);
      const platformFeeAmount = Math.round(
        (btwCalc.amount_incl_btw * platformFeePercentage) / 100
      );

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Create invoice items
      const items: InvoiceItem[] = [
        {
          description: `${job.title} - ${worker.full_name}`,
          quantity: 1,
          unit_price_excl_btw: amountExclBTW,
          btw_percentage: btwPercentage,
          total_excl_btw: amountExclBTW,
          btw_amount: btwCalc.btw_amount,
          total_incl_btw: btwCalc.amount_incl_btw,
        },
        {
          description: `Platform fee (${platformFeePercentage}%)`,
          quantity: 1,
          unit_price_excl_btw: platformFeeAmount,
          btw_percentage: 0,
          total_excl_btw: platformFeeAmount,
          btw_amount: 0,
          total_incl_btw: platformFeeAmount,
        },
      ];

      const invoiceDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term

      const invoice: Invoice = {
        id: crypto.randomUUID(),
        invoice_number: invoiceNumber,
        company_id: companyId,
        company_name: company.company_name,
        company_kvk: company.kvk_number,
        company_btw: company.btw_number,
        company_address: `${company.address}, ${company.postal_code} ${company.city}`,
        worker_id: workerId,
        worker_name: worker.full_name,
        worker_kvk: worker.kvk_number,
        worker_btw: worker.btw_number,
        invoice_date: invoiceDate,
        due_date: dueDate,
        items,
        subtotal_excl_btw: amountExclBTW + platformFeeAmount,
        btw_amount: btwCalc.btw_amount,
        total_incl_btw: btwCalc.amount_incl_btw + platformFeeAmount,
        status: 'sent',
        payment_terms_days: 30,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Save to database
      const { error: insertError } = await supabase
        .from('invoices')
        .insert([invoice]);

      if (insertError) {
        throw insertError;
      }

      return invoice;
    } catch (error) {
      console.error('❌ Error creating worker payment invoice:', error);
      throw error;
    }
  }

  /**
   * Mark Invoice as Paid
   */
  async markInvoiceAsPaid(
    invoiceId: string,
    paymentDate: Date = new Date()
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          payment_date: paymentDate,
          updated_at: new Date(),
        })
        .eq('id', invoiceId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('❌ Error marking invoice as paid:', error);
      throw error;
    }
  }

  /**
   * Get Invoices for Company
   */
  async getCompanyInvoices(companyId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('invoice_date', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Invoice[];
    } catch (error) {
      console.error('❌ Error fetching company invoices:', error);
      throw error;
    }
  }

  /**
   * Get Invoices for Worker
   */
  async getWorkerInvoices(workerId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('worker_id', workerId)
        .order('invoice_date', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Invoice[];
    } catch (error) {
      console.error('❌ Error fetching worker invoices:', error);
      throw error;
    }
  }

  /**
   * Generate PDF Invoice (placeholder - needs backend implementation)
   */
  async generateInvoicePDF(invoiceId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      return await response.blob();
    } catch (error) {
      console.error('❌ Error generating invoice PDF:', error);
      throw error;
    }
  }

  /**
   * Send Invoice via Email (placeholder - needs backend implementation)
   */
  async sendInvoiceEmail(
    invoiceId: string,
    recipientEmail: string
  ): Promise<void> {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recipientEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }
    } catch (error) {
      console.error('❌ Error sending invoice:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
