import React from 'react';
import { PerformanceMonitor } from '../../components/AdvancedPerformanceMonitor';
import { LoadingPerformanceOptimizer } from '../../components/LoadingPerformanceOptimizer';

export const AdminPerformancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PerformanceMonitor />
        <LoadingPerformanceOptimizer />
      </div>
    </div>
  );
};