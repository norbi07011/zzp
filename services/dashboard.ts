import { supabase } from '@/lib/supabase';

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  estimatedTax: number;
  currentMonth: string;
  previousMonth: string;
  revenueGrowth: number; // Percentage
  expenseGrowth: number; // Percentage
}

/**
 * Recent Activity Item
 */
export interface ActivityItem {
  id: string;
  type: 'invoice' | 'expense' | 'payment';
  title: string;
  description: string;
  amount: number;
  date: string;
  status?: 'pending' | 'completed' | 'overdue';
  icon?: string;
}

/**
 * Revenue Trend Data Point
 */
export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

/**
 * Dashboard Service
 */
class DashboardService {
  /**
   * Get dashboard statistics for current user
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current month dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch invoices for current month
      const { data: currentInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('total, status, issue_date')
        .eq('user_id', user.id)
        .gte('issue_date', currentMonthStart.toISOString().split('T')[0])
        .lte('issue_date', currentMonthEnd.toISOString().split('T')[0]);

      if (invoicesError) throw invoicesError;

      // Fetch invoices for previous month
      const { data: previousInvoices } = await supabase
        .from('invoices')
        .select('total')
        .eq('user_id', user.id)
        .gte('issue_date', previousMonthStart.toISOString().split('T')[0])
        .lte('issue_date', previousMonthEnd.toISOString().split('T')[0]);

      // Fetch expenses for current month
      const { data: currentExpenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .eq('user_id', user.id)
        .gte('expense_date', currentMonthStart.toISOString().split('T')[0])
        .lte('expense_date', currentMonthEnd.toISOString().split('T')[0]);

      if (expensesError) throw expensesError;

      // Fetch expenses for previous month
      const { data: previousExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('expense_date', previousMonthStart.toISOString().split('T')[0])
        .lte('expense_date', previousMonthEnd.toISOString().split('T')[0]);

      // Calculate current month revenue
      const totalRevenue = currentInvoices?.reduce((sum: number, inv: any) => {
        return inv.status === 'paid' ? sum + parseFloat(inv.total.toString()) : sum;
      }, 0) || 0;

      // Calculate previous month revenue
      const previousRevenue = previousInvoices?.reduce((sum: number, inv: any) => {
        return sum + parseFloat(inv.total.toString());
      }, 0) || 0;

      // Calculate current month expenses
      const totalExpenses = currentExpenses?.reduce((sum: number, exp: any) => {
        return sum + parseFloat(exp.amount.toString());
      }, 0) || 0;

      // Calculate previous month expenses
      const previousExpensesTotal = previousExpenses?.reduce((sum: number, exp: any) => {
        return sum + parseFloat(exp.amount.toString());
      }, 0) || 0;

      // Count invoices by status
      const pendingInvoices = currentInvoices?.filter((inv: any) => inv.status === 'sent').length || 0;
      const paidInvoices = currentInvoices?.filter((inv: any) => inv.status === 'paid').length || 0;
      
      // Count overdue invoices
      const today = new Date().toISOString().split('T')[0];
      const { data: overdueData } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'sent')
        .lt('due_date', today);
      
      const overdueInvoices = overdueData?.length || 0;

      // Calculate net profit
      const netProfit = totalRevenue - totalExpenses;

      // Estimate tax (simplified: 21% BTW + 37% income tax on profit)
      const btwOwed = totalRevenue * 0.21; // 21% BTW
      const incomeTaxOwed = netProfit > 0 ? netProfit * 0.37 : 0; // 37% first bracket
      const estimatedTax = btwOwed + incomeTaxOwed;

      // Calculate growth percentages
      const revenueGrowth = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;
      
      const expenseGrowth = previousExpensesTotal > 0
        ? ((totalExpenses - previousExpensesTotal) / previousExpensesTotal) * 100
        : 0;

      // Format month names
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = monthNames[now.getMonth()];
      const previousMonth = monthNames[now.getMonth() === 0 ? 11 : now.getMonth() - 1];

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        pendingInvoices,
        paidInvoices,
        overdueInvoices,
        estimatedTax: Math.round(estimatedTax * 100) / 100,
        currentMonth,
        previousMonth,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        expenseGrowth: Math.round(expenseGrowth * 10) / 10
      };

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get recent activity (invoices, expenses, payments)
   */
  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const activities: ActivityItem[] = [];

      // Fetch recent invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, total, issue_date, status, clients(name)')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false })
        .limit(5);

      if (invoices) {
        invoices.forEach((invoice: any) => {
          const clientName = (invoice.clients as any)?.name || 'Unknown Client';
          activities.push({
            id: invoice.id,
            type: 'invoice',
            title: `Invoice ${invoice.invoice_number}`,
            description: `Sent to ${clientName}`,
            amount: parseFloat(invoice.total.toString()),
            date: invoice.issue_date,
            status: invoice.status as 'pending' | 'completed' | 'overdue',
            icon: '📄'
          });
        });
      }

      // Fetch recent expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('id, description, amount, expense_date, vendor, expense_categories(name)')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .limit(5);

      if (expenses) {
        expenses.forEach((expense: any) => {
          const categoryName = (expense.expense_categories as any)?.name || 'Uncategorized';
          activities.push({
            id: expense.id,
            type: 'expense',
            title: expense.description,
            description: `${categoryName}${expense.vendor ? ` • ${expense.vendor}` : ''}`,
            amount: -parseFloat(expense.amount.toString()),
            date: expense.expense_date,
            status: 'completed',
            icon: '💳'
          });
        });
      }

      // Fetch recent payments (paid invoices)
      const { data: payments } = await supabase
        .from('invoices')
        .select('id, invoice_number, total, payment_date, clients(name)')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .not('payment_date', 'is', null)
        .order('payment_date', { ascending: false })
        .limit(5);

      if (payments) {
        payments.forEach((payment: any) => {
          const clientName = (payment.clients as any)?.name || 'Unknown Client';
          activities.push({
            id: payment.id,
            type: 'payment',
            title: `Payment received`,
            description: `Invoice ${payment.invoice_number} • ${clientName}`,
            amount: parseFloat(payment.total.toString()),
            date: payment.payment_date!,
            status: 'completed',
            icon: '💰'
          });
        });
      }

      // Sort all activities by date (most recent first)
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Return limited results
      return activities.slice(0, limit);

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  /**
   * Get revenue trend for the last 6 months
   */
  async getRevenueTrend(months: number = 6): Promise<RevenueTrendPoint[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const trend: RevenueTrendPoint[] = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        // Fetch invoices for this month
        const { data: monthInvoices } = await supabase
          .from('invoices')
          .select('total, status')
          .eq('user_id', user.id)
          .gte('issue_date', monthStart.toISOString().split('T')[0])
          .lte('issue_date', monthEnd.toISOString().split('T')[0]);

        // Fetch expenses for this month
        const { data: monthExpenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('expense_date', monthStart.toISOString().split('T')[0])
          .lte('expense_date', monthEnd.toISOString().split('T')[0]);

        const revenue = monthInvoices?.reduce((sum: number, inv: any) => {
          return inv.status === 'paid' ? sum + parseFloat(inv.total.toString()) : sum;
        }, 0) || 0;

        const expenses = monthExpenses?.reduce((sum: number, exp: any) => {
          return sum + parseFloat(exp.amount.toString());
        }, 0) || 0;

        const profit = revenue - expenses;

        trend.push({
          month: monthNames[monthDate.getMonth()],
          revenue: Math.round(revenue * 100) / 100,
          expenses: Math.round(expenses * 100) / 100,
          profit: Math.round(profit * 100) / 100
        });
      }

      return trend;

    } catch (error) {
      console.error('Error fetching revenue trend:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
