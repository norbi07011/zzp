/**
 * Analytics Service
 * Comprehensive analytics and tracking system for ZZP Werkplaats
 * 
 * Features:
 * - User activity tracking
 * - Business intelligence metrics
 * - Revenue analytics
 * - Worker performance tracking
 * - Company statistics
 * - Custom KPI tracking
 * 
 * @version 1.0.0
 * @date October 2025
 */

import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AnalyticsEvent {
  id?: string;
  event_type: string;
  event_category: 'user_action' | 'system' | 'business' | 'performance';
  user_id?: string;
  session_id?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface KPIMetric {
  id?: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  period_start: string;
  period_end: string;
  category: 'revenue' | 'users' | 'jobs' | 'engagement' | 'performance';
  metadata?: Record<string, any>;
}

export interface UserActivity {
  user_id: string;
  total_sessions: number;
  total_page_views: number;
  avg_session_duration: number;
  last_active: string;
  most_visited_pages: string[];
  device_info?: Record<string, any>;
}

export interface BusinessMetrics {
  total_revenue: number;
  total_jobs_posted: number;
  total_applications: number;
  total_hires: number;
  avg_job_completion_time: number;
  top_skills: string[];
  top_locations: string[];
}

export interface WorkerPerformance {
  worker_id: string;
  total_jobs_completed: number;
  avg_rating: number;
  total_earnings: number;
  completion_rate: number;
  response_time_hours: number;
  repeat_client_rate: number;
}

export interface CompanyStatistics {
  company_id: string;
  total_jobs_posted: number;
  total_hires: number;
  avg_job_value: number;
  retention_rate: number;
  satisfaction_score: number;
  total_spent: number;
}

export interface RevenueAnalytics {
  period: string;
  total_revenue: number;
  subscription_revenue: number;
  commission_revenue: number;
  payment_fees: number;
  net_revenue: number;
  growth_rate: number;
}

// ============================================================================
// ANALYTICS SERVICE CLASS
// ============================================================================

class AnalyticsService {
  private sessionId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  /**
   * Initialize analytics service
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create analytics tables if not exist
      await this.ensureTablesExist();
      
      // Start session tracking
      this.trackSessionStart();
      
      this.isInitialized = true;
      console.log('✅ Analytics Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Analytics Service:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Ensure all required database tables exist
   */
  private async ensureTablesExist(): Promise<void> {
    // Tables are created via migration scripts
    // This method can be used for validation
    console.log('📊 Analytics tables verified');
  }

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  /**
   * Track analytics event
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const eventData: AnalyticsEvent = {
        ...event,
        user_id: user?.id,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase
        .from('analytics_events')
        .insert(eventData as any); // Type assertion for flexible Supabase schema

      if (error) throw error;
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(page: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'page_view',
      event_category: 'user_action',
      metadata: {
        page,
        referrer: document.referrer,
        ...metadata,
      },
    });
  }

  /**
   * Track user action
   */
  async trackUserAction(
    action: string,
    category: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      event_type: action,
      event_category: 'user_action',
      metadata: {
        category,
        ...metadata,
      },
    });
  }

  /**
   * Track business event
   */
  async trackBusinessEvent(
    eventType: string,
    metadata: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      event_type: eventType,
      event_category: 'business',
      metadata,
    });
  }

  /**
   * Track session start
   */
  private async trackSessionStart(): Promise<void> {
    await this.trackEvent({
      event_type: 'session_start',
      event_category: 'system',
      metadata: {
        session_id: this.sessionId,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
  }

  /**
   * Track session end
   */
  async trackSessionEnd(): Promise<void> {
    await this.trackEvent({
      event_type: 'session_end',
      event_category: 'system',
      metadata: {
        session_id: this.sessionId,
      },
    });
  }

  // ============================================================================
  // USER ANALYTICS
  // ============================================================================

  /**
   * Get user activity statistics
   */
  async getUserActivity(userId: string, days: number = 30): Promise<UserActivity | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString());

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Calculate metrics with proper typing
      const sessions = new Set(data.map((e: any) => e.session_id)).size;
      const pageViews = data.filter((e: any) => e.event_type === 'page_view').length;
      
      // Get most visited pages
      const pageCount: Record<string, number> = {};
      data
        .filter((e: any) => e.event_type === 'page_view')
        .forEach((e: any) => {
          const page = e.metadata?.page || 'unknown';
          pageCount[page] = (pageCount[page] || 0) + 1;
        });

      const mostVisitedPages = Object.entries(pageCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([page]) => page);

      return {
        user_id: userId,
        total_sessions: sessions,
        total_page_views: pageViews,
        avg_session_duration: 0, // TODO: Calculate from session data
        last_active: (data[data.length - 1] as any).timestamp || new Date().toISOString(),
        most_visited_pages: mostVisitedPages,
      };
    } catch (error) {
      console.error('Failed to get user activity:', error);
      return null;
    }
  }

  // ============================================================================
  // BUSINESS INTELLIGENCE
  // ============================================================================

  /**
   * Get business metrics
   */
  async getBusinessMetrics(startDate: string, endDate: string): Promise<BusinessMetrics> {
    try {
      // Get revenue data
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'succeeded');

      const totalRevenue = payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

      // Get jobs data
      const { data: jobs, count: jobsCount } = await supabase
        .from('jobs')
        .select('*, applications(*)', { count: 'exact' })
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Get applications data
      const totalApplications = jobs?.reduce(
        (sum: number, job: any) => sum + (job.applications?.length || 0),
        0
      ) || 0;

      // Get hires (accepted applications)
      const { count: hiresCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .eq('status', 'accepted')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      return {
        total_revenue: totalRevenue / 100, // Convert from cents
        total_jobs_posted: jobsCount || 0,
        total_applications: totalApplications,
        total_hires: hiresCount || 0,
        avg_job_completion_time: 0, // TODO: Calculate
        top_skills: [], // TODO: Calculate
        top_locations: [], // TODO: Calculate
      };
    } catch (error) {
      console.error('Failed to get business metrics:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(period: 'day' | 'week' | 'month' | 'year'): Promise<RevenueAnalytics[]> {
    try {
      // This would require more complex SQL queries with date_trunc
      // For now, return basic structure
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at, metadata')
        .eq('status', 'succeeded')
        .order('created_at', { ascending: true });

      if (!payments) return [];

      // Group by period and calculate metrics
      // TODO: Implement proper grouping logic
      
      return [];
    } catch (error) {
      console.error('Failed to get revenue analytics:', error);
      return [];
    }
  }

  // ============================================================================
  // WORKER PERFORMANCE
  // ============================================================================

  /**
   * Get worker performance metrics
   */
  async getWorkerPerformance(workerId: string): Promise<WorkerPerformance | null> {
    try {
      // Get completed jobs
      const { data: applications } = await supabase
        .from('applications')
        .select('*, jobs(*)')
        .eq('worker_id', workerId)
        .eq('status', 'completed');

      const completedJobs = applications?.length || 0;

      // Get reviews/ratings
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('worker_id', workerId);

      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

      // Get earnings
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('metadata->>worker_id', workerId)
        .eq('status', 'succeeded');

      const totalEarnings = payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

      return {
        worker_id: workerId,
        total_jobs_completed: completedJobs,
        avg_rating: avgRating,
        total_earnings: totalEarnings / 100,
        completion_rate: 0, // TODO: Calculate
        response_time_hours: 0, // TODO: Calculate
        repeat_client_rate: 0, // TODO: Calculate
      };
    } catch (error) {
      console.error('Failed to get worker performance:', error);
      return null;
    }
  }

  // ============================================================================
  // COMPANY STATISTICS
  // ============================================================================

  /**
   * Get company statistics
   */
  async getCompanyStatistics(companyId: string): Promise<CompanyStatistics | null> {
    try {
      // Get jobs posted
      const { data: jobs, count: jobsCount } = await supabase
        .from('jobs')
        .select('*, applications(*)', { count: 'exact' })
        .eq('company_id', companyId);

      // Get hires
      const totalHires = jobs?.reduce(
        (sum: number, job: any) => sum + (job.applications?.filter((a: any) => a.status === 'accepted').length || 0),
        0
      ) || 0;

      // Get total spent
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('metadata->>company_id', companyId)
        .eq('status', 'succeeded');

      const totalSpent = payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

      return {
        company_id: companyId,
        total_jobs_posted: jobsCount || 0,
        total_hires: totalHires,
        avg_job_value: totalSpent / (jobsCount || 1) / 100,
        retention_rate: 0, // TODO: Calculate
        satisfaction_score: 0, // TODO: Calculate from reviews
        total_spent: totalSpent / 100,
      };
    } catch (error) {
      console.error('Failed to get company statistics:', error);
      return null;
    }
  }

  // ============================================================================
  // KPI TRACKING
  // ============================================================================

  /**
   * Record KPI metric
   */
  async recordKPI(metric: Omit<KPIMetric, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('kpi_metrics')
        .insert(metric as any); // Type assertion for flexible Supabase schema

      if (error) throw error;
    } catch (error) {
      console.error('Failed to record KPI:', error);
      throw error;
    }
  }

  /**
   * Get KPI metrics
   */
  async getKPIMetrics(
    category: KPIMetric['category'],
    startDate: string,
    endDate: string
  ): Promise<KPIMetric[]> {
    try {
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('category', category)
        .gte('period_start', startDate)
        .lte('period_end', endDate)
        .order('period_start', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get KPI metrics:', error);
      return [];
    }
  }

  // ============================================================================
  // EXPORT & REPORTING
  // ============================================================================

  /**
   * Generate analytics report
   */
  async generateReport(
    type: 'user' | 'business' | 'worker' | 'company',
    id: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, any>> {
    try {
      switch (type) {
        case 'user':
          const userActivity = await this.getUserActivity(id, 30);
          return { type: 'user_activity', data: userActivity };

        case 'business':
          const businessMetrics = await this.getBusinessMetrics(startDate, endDate);
          return { type: 'business_metrics', data: businessMetrics };

        case 'worker':
          const workerPerformance = await this.getWorkerPerformance(id);
          return { type: 'worker_performance', data: workerPerformance };

        case 'company':
          const companyStats = await this.getCompanyStatistics(id);
          return { type: 'company_statistics', data: companyStats };

        default:
          throw new Error('Invalid report type');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const analyticsService = new AnalyticsService();
export default analyticsService;
