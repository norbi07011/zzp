import { useEffect, useState } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

export interface PerformanceMetrics {
  FCP?: number;  // First Contentful Paint
  LCP?: number;  // Largest Contentful Paint
  FID?: number;  // First Input Delay
  CLS?: number;  // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: any; // NetworkInformation type not widely supported
}

// Performance thresholds (Google recommendations)
export const PERFORMANCE_THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 }
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private listeners: Array<(metrics: PerformanceMetrics) => void> = [];

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // Collect Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));
    
    // FID is deprecated, using INP (Interaction to Next Paint) instead
    // For now we'll handle it manually if needed
  }

  private handleMetric(metric: Metric) {
    this.metrics[metric.name as keyof PerformanceMetrics] = metric.value;
    this.notifyListeners();
    
    // Send to analytics (if configured)
    this.sendToAnalytics(metric);
  }

  private sendToAnalytics(metric: Metric) {
    // Send to Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        custom_parameter_1: metric.id,
        non_interaction: true
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          url: window.location.href,
          timestamp: Date.now()
        })
      }).catch(() => {
        // Silently fail - analytics shouldn't break the app
      });
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.metrics));
  }

  public subscribe(listener: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public generateReport(): PerformanceReport {
    return {
      metrics: this.getMetrics(),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection
    };
  }

  // Get performance score (0-100)
  public getPerformanceScore(): number {
    const weights = { FCP: 0.15, LCP: 0.25, FID: 0.25, CLS: 0.25, TTFB: 0.1 };
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(this.metrics).forEach(([key, value]) => {
      if (value !== undefined) {
        const threshold = PERFORMANCE_THRESHOLDS[key as keyof typeof PERFORMANCE_THRESHOLDS];
        const weight = weights[key as keyof typeof weights];
        
        if (threshold && weight) {
          let score = 100;
          if (value > threshold.poor) {
            score = 0;
          } else if (value > threshold.good) {
            score = 50;
          }
          
          totalScore += score * weight;
          totalWeight += weight;
        }
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setScore(performanceMonitor.getPerformanceScore());
    });

    // Set initial values
    setMetrics(performanceMonitor.getMetrics());
    setScore(performanceMonitor.getPerformanceScore());

    return unsubscribe;
  }, []);

  return { metrics, score };
};

// Performance Badge Component
export const PerformanceBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { score, metrics } = usePerformanceMetrics();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🚀';
    if (score >= 50) return '⚡';
    return '🐌';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)} ${className}`}>
      <span>{getScoreIcon(score)}</span>
      <span>Performance: {score}/100</span>
      {Object.keys(metrics).length > 0 && (
        <span className="text-xs opacity-75">
          ({Object.keys(metrics).length} metrics)
        </span>
      )}
    </div>
  );
};

// Performance Details Component
export const PerformanceDetails: React.FC = () => {
  const { metrics, score } = usePerformanceMetrics();

  const formatValue = (key: string, value: number) => {
    if (key === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const getMetricStatus = (key: string, value: number) => {
    const threshold = PERFORMANCE_THRESHOLDS[key as keyof typeof PERFORMANCE_THRESHOLDS];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>
        <PerformanceBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(metrics).map(([key, value]) => {
          const status = getMetricStatus(key, value);
          const statusColor = getStatusColor(status);
          
          return (
            <div key={key} className={`p-4 rounded-lg ${statusColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{key}</div>
                  <div className="text-lg font-bold">
                    {formatValue(key, value)}
                  </div>
                </div>
                <div className="text-xs capitalize">
                  {status.replace('-', ' ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(metrics).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">📊</div>
          <p>Performance metrics are being collected...</p>
          <p className="text-sm">Interact with the page to see metrics.</p>
        </div>
      )}
    </div>
  );
};

// Resource Performance Monitor
export const useResourceMetrics = () => {
  const [resources, setResources] = useState<PerformanceEntry[]>([]);

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      setResources(prev => [...prev, ...entries]);
    });

    observer.observe({ entryTypes: ['resource', 'navigation', 'measure'] });

    return () => observer.disconnect();
  }, []);

  const getSlowResources = () => {
    return resources
      .filter(entry => entry.duration > 1000) // Slower than 1s
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
  };

  const getTotalResourceSize = () => {
    return resources.reduce((total, entry) => {
      return total + ((entry as any).transferSize || 0);
    }, 0);
  };

  return {
    resources,
    slowResources: getSlowResources(),
    totalSize: getTotalResourceSize(),
    resourceCount: resources.length
  };
};

export default performanceMonitor;