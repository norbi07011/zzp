import React, { useState, useEffect } from 'react';

// Scalability Management System - Horizontal Scaling, Load Balancing, and Auto-scaling
export const ScalabilityManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [scalingConfig, setScalingConfig] = useState<ScalingConfiguration>({});
  const [loadBalancers, setLoadBalancers] = useState<LoadBalancer[]>([]);
  const [autoScalingGroups, setAutoScalingGroups] = useState<AutoScalingGroup[]>([]);
  const [connectionPools, setConnectionPools] = useState<ConnectionPool[]>([]);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingMetrics>({});

  // Scaling Configuration Interface
  interface ScalingConfiguration {
    horizontal?: {
      enabled: boolean;
      minInstances: number;
      maxInstances: number;
      targetCpuUtilization: number;
      targetMemoryUtilization: number;
      scaleUpPolicy: 'conservative' | 'aggressive' | 'predictive';
      scaleDownPolicy: 'conservative' | 'aggressive' | 'scheduled';
      cooldownPeriod: number; // seconds
    };
    vertical?: {
      enabled: boolean;
      minCpu: number;
      maxCpu: number;
      minMemory: number;
      maxMemory: number;
      autoResize: boolean;
    };
    database?: {
      connectionPooling: boolean;
      maxConnections: number;
      minConnections: number;
      connectionTimeout: number;
      idleTimeout: number;
      readReplicas: number;
      sharding: boolean;
    };
    cdn?: {
      edgeOptimization: boolean;
      globalDistribution: boolean;
      intelligentRouting: boolean;
      bandwidthOptimization: boolean;
    };
  }

  // Load Balancer Interface
  interface LoadBalancer {
    id: string;
    name: string;
    type: 'application' | 'network' | 'gateway';
    algorithm: 'round_robin' | 'least_connections' | 'ip_hash' | 'weighted';
    healthCheck: {
      enabled: boolean;
      interval: number;
      timeout: number;
      healthyThreshold: number;
      unhealthyThreshold: number;
      path: string;
    };
    targets: {
      id: string;
      endpoint: string;
      weight: number;
      status: 'healthy' | 'unhealthy' | 'draining';
      responseTime: number;
      connections: number;
    }[];
    metrics: {
      totalRequests: number;
      successRate: number;
      avgResponseTime: number;
      throughput: number;
    };
    status: 'active' | 'inactive' | 'maintenance';
  }

  // Auto Scaling Group Interface
  interface AutoScalingGroup {
    id: string;
    name: string;
    region: string;
    instances: {
      current: number;
      desired: number;
      min: number;
      max: number;
    };
    launchTemplate: {
      imageId: string;
      instanceType: string;
      securityGroups: string[];
      userData: string;
    };
    scalingPolicies: {
      scaleUp: {
        trigger: string;
        threshold: number;
        adjustment: number;
        cooldown: number;
      };
      scaleDown: {
        trigger: string;
        threshold: number;
        adjustment: number;
        cooldown: number;
      };
    };
    metrics: {
      cpuUtilization: number;
      memoryUtilization: number;
      networkIn: number;
      networkOut: number;
      activeConnections: number;
    };
    status: 'active' | 'updating' | 'error';
  }

  // Connection Pool Interface
  interface ConnectionPool {
    id: string;
    name: string;
    type: 'database' | 'redis' | 'elasticsearch' | 'api';
    configuration: {
      minConnections: number;
      maxConnections: number;
      acquireTimeout: number;
      idleTimeout: number;
      maxLifetime: number;
      testQuery: string;
    };
    metrics: {
      activeConnections: number;
      idleConnections: number;
      totalConnections: number;
      avgAcquireTime: number;
      avgQueryTime: number;
      connectionErrors: number;
    };
    performance: {
      throughput: number;
      latency: number;
      errorRate: number;
      utilization: number;
    };
    status: 'optimal' | 'warning' | 'critical';
  }

  // Scaling Metrics Interface
  interface ScalingMetrics {
    capacity?: {
      current: number;
      available: number;
      utilized: number;
      peak: number;
      projected: number;
    };
    performance?: {
      responseTime: number;
      throughput: number;
      errorRate: number;
      availability: number;
    };
    costs?: {
      current: number; // per hour
      projected: number;
      savings: number;
      efficiency: number;
    };
    trends?: {
      growth: number; // percentage
      seasonality: string;
      predictedLoad: number;
      recommendations: string[];
    };
  }

  // Initialize mock data
  useEffect(() => {
    const mockScalingConfig: ScalingConfiguration = {
      horizontal: {
        enabled: true,
        minInstances: 2,
        maxInstances: 20,
        targetCpuUtilization: 70,
        targetMemoryUtilization: 80,
        scaleUpPolicy: 'aggressive',
        scaleDownPolicy: 'conservative',
        cooldownPeriod: 300
      },
      vertical: {
        enabled: true,
        minCpu: 1,
        maxCpu: 8,
        minMemory: 2,
        maxMemory: 32,
        autoResize: true
      },
      database: {
        connectionPooling: true,
        maxConnections: 100,
        minConnections: 10,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        readReplicas: 3,
        sharding: true
      },
      cdn: {
        edgeOptimization: true,
        globalDistribution: true,
        intelligentRouting: true,
        bandwidthOptimization: true
      }
    };

    const mockLoadBalancers: LoadBalancer[] = [
      {
        id: 'lb-1',
        name: 'Main Application Load Balancer',
        type: 'application',
        algorithm: 'least_connections',
        healthCheck: {
          enabled: true,
          interval: 30,
          timeout: 5,
          healthyThreshold: 2,
          unhealthyThreshold: 3,
          path: '/health'
        },
        targets: [
          {
            id: 'target-1',
            endpoint: 'app-server-1.platform.com',
            weight: 100,
            status: 'healthy',
            responseTime: 45,
            connections: 234
          },
          {
            id: 'target-2',
            endpoint: 'app-server-2.platform.com',
            weight: 100,
            status: 'healthy',
            responseTime: 52,
            connections: 189
          },
          {
            id: 'target-3',
            endpoint: 'app-server-3.platform.com',
            weight: 80,
            status: 'healthy',
            responseTime: 48,
            connections: 156
          }
        ],
        metrics: {
          totalRequests: 145678,
          successRate: 99.97,
          avgResponseTime: 48,
          throughput: 1250
        },
        status: 'active'
      },
      {
        id: 'lb-2',
        name: 'API Gateway Load Balancer',
        type: 'gateway',
        algorithm: 'round_robin',
        healthCheck: {
          enabled: true,
          interval: 15,
          timeout: 3,
          healthyThreshold: 2,
          unhealthyThreshold: 2,
          path: '/api/health'
        },
        targets: [
          {
            id: 'api-1',
            endpoint: 'api-server-1.platform.com',
            weight: 100,
            status: 'healthy',
            responseTime: 23,
            connections: 89
          },
          {
            id: 'api-2',
            endpoint: 'api-server-2.platform.com',
            weight: 100,
            status: 'healthy',
            responseTime: 27,
            connections: 76
          }
        ],
        metrics: {
          totalRequests: 89234,
          successRate: 99.95,
          avgResponseTime: 25,
          throughput: 890
        },
        status: 'active'
      }
    ];

    const mockAutoScalingGroups: AutoScalingGroup[] = [
      {
        id: 'asg-1',
        name: 'Web Application Auto Scaling Group',
        region: 'eu-west-1',
        instances: {
          current: 3,
          desired: 3,
          min: 2,
          max: 10
        },
        launchTemplate: {
          imageId: 'ami-12345678',
          instanceType: 't3.medium',
          securityGroups: ['sg-web-app', 'sg-common'],
          userData: '#!/bin/bash\nyum update -y\ndocker run -d platform/app'
        },
        scalingPolicies: {
          scaleUp: {
            trigger: 'CPU > 70%',
            threshold: 70,
            adjustment: 2,
            cooldown: 300
          },
          scaleDown: {
            trigger: 'CPU < 30%',
            threshold: 30,
            adjustment: -1,
            cooldown: 900
          }
        },
        metrics: {
          cpuUtilization: 45.2,
          memoryUtilization: 62.8,
          networkIn: 1250.5,
          networkOut: 2340.7,
          activeConnections: 579
        },
        status: 'active'
      },
      {
        id: 'asg-2',
        name: 'API Services Auto Scaling Group',
        region: 'eu-west-1',
        instances: {
          current: 2,
          desired: 2,
          min: 1,
          max: 8
        },
        launchTemplate: {
          imageId: 'ami-87654321',
          instanceType: 't3.small',
          securityGroups: ['sg-api', 'sg-common'],
          userData: '#!/bin/bash\nyum update -y\ndocker run -d platform/api'
        },
        scalingPolicies: {
          scaleUp: {
            trigger: 'Requests > 1000/min',
            threshold: 1000,
            adjustment: 1,
            cooldown: 180
          },
          scaleDown: {
            trigger: 'Requests < 200/min',
            threshold: 200,
            adjustment: -1,
            cooldown: 600
          }
        },
        metrics: {
          cpuUtilization: 32.1,
          memoryUtilization: 48.5,
          networkIn: 890.2,
          networkOut: 1456.8,
          activeConnections: 165
        },
        status: 'active'
      }
    ];

    const mockConnectionPools: ConnectionPool[] = [
      {
        id: 'pool-1',
        name: 'Main Database Connection Pool',
        type: 'database',
        configuration: {
          minConnections: 10,
          maxConnections: 100,
          acquireTimeout: 30000,
          idleTimeout: 600000,
          maxLifetime: 1800000,
          testQuery: 'SELECT 1'
        },
        metrics: {
          activeConnections: 23,
          idleConnections: 12,
          totalConnections: 35,
          avgAcquireTime: 2.3,
          avgQueryTime: 15.7,
          connectionErrors: 0
        },
        performance: {
          throughput: 2340,
          latency: 15.7,
          errorRate: 0.02,
          utilization: 35
        },
        status: 'optimal'
      },
      {
        id: 'pool-2',
        name: 'Redis Cache Connection Pool',
        type: 'redis',
        configuration: {
          minConnections: 5,
          maxConnections: 50,
          acquireTimeout: 5000,
          idleTimeout: 300000,
          maxLifetime: 3600000,
          testQuery: 'PING'
        },
        metrics: {
          activeConnections: 8,
          idleConnections: 7,
          totalConnections: 15,
          avgAcquireTime: 0.8,
          avgQueryTime: 1.2,
          connectionErrors: 0
        },
        performance: {
          throughput: 15620,
          latency: 1.2,
          errorRate: 0.01,
          utilization: 30
        },
        status: 'optimal'
      },
      {
        id: 'pool-3',
        name: 'Elasticsearch Connection Pool',
        type: 'elasticsearch',
        configuration: {
          minConnections: 3,
          maxConnections: 25,
          acquireTimeout: 10000,
          idleTimeout: 300000,
          maxLifetime: 1800000,
          testQuery: 'GET /_cluster/health'
        },
        metrics: {
          activeConnections: 5,
          idleConnections: 3,
          totalConnections: 8,
          avgAcquireTime: 3.2,
          avgQueryTime: 8.5,
          connectionErrors: 1
        },
        performance: {
          throughput: 450,
          latency: 8.5,
          errorRate: 0.12,
          utilization: 32
        },
        status: 'warning'
      }
    ];

    const mockScalingMetrics: ScalingMetrics = {
      capacity: {
        current: 5,
        available: 15,
        utilized: 33.3,
        peak: 8,
        projected: 12
      },
      performance: {
        responseTime: 1.42,
        throughput: 2150,
        errorRate: 0.03,
        availability: 99.97
      },
      costs: {
        current: 45.80,
        projected: 52.30,
        savings: 125.40,
        efficiency: 87.5
      },
      trends: {
        growth: 15.2,
        seasonality: 'Peak hours: 9-17 CET',
        predictedLoad: 3200,
        recommendations: [
          'Add 2 more instances during peak hours',
          'Optimize database connection pooling',
          'Implement intelligent caching strategy',
          'Consider spot instances for cost optimization'
        ]
      }
    };

    setScalingConfig(mockScalingConfig);
    setLoadBalancers(mockLoadBalancers);
    setAutoScalingGroups(mockAutoScalingGroups);
    setConnectionPools(mockConnectionPools);
    setScalingMetrics(mockScalingMetrics);
  }, []);

  // Render Scalability Overview
  const renderScalabilityOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Scalability Overview</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Optimize Now
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Auto-Scale
          </button>
        </div>
      </div>

      {/* Capacity Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">System Capacity</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {scalingMetrics.capacity?.current}
            </div>
            <div className="text-sm text-gray-400">Current Instances</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {scalingMetrics.capacity?.available}
            </div>
            <div className="text-sm text-gray-400">Available Capacity</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {scalingMetrics.capacity?.utilized.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Utilization</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {scalingMetrics.capacity?.peak}
            </div>
            <div className="text-sm text-gray-400">Peak Usage</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {scalingMetrics.capacity?.projected}
            </div>
            <div className="text-sm text-gray-400">Projected Need</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Capacity Utilization</span>
            <span className="text-sm text-white">{scalingMetrics.capacity?.utilized.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${
                scalingMetrics.capacity?.utilized! > 80 ? 'bg-red-600' :
                scalingMetrics.capacity?.utilized! > 60 ? 'bg-yellow-600' :
                'bg-green-600'
              }`}
              style={{ width: `${scalingMetrics.capacity?.utilized}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Performance Metrics</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {scalingMetrics.performance?.responseTime.toFixed(2)}s
            </div>
            <div className="text-sm text-gray-400 mb-1">Response Time</div>
            <div className="text-xs text-green-400">Target: &lt; 2.0s</div>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {scalingMetrics.performance?.throughput.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mb-1">Requests/min</div>
            <div className="text-xs text-blue-400">+15% vs yesterday</div>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {scalingMetrics.performance?.errorRate.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-400 mb-1">Error Rate</div>
            <div className="text-xs text-green-400">Target: &lt; 0.1%</div>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {scalingMetrics.performance?.availability.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-400 mb-1">Availability</div>
            <div className="text-xs text-green-400">SLA: 99.9%</div>
          </div>
        </div>
      </div>

      {/* Cost Optimization */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Cost Optimization</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              €{scalingMetrics.costs?.current.toFixed(2)}/hr
            </div>
            <div className="text-sm text-gray-400">Current Cost</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              €{scalingMetrics.costs?.projected.toFixed(2)}/hr
            </div>
            <div className="text-sm text-gray-400">Projected Cost</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              €{scalingMetrics.costs?.savings.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">Monthly Savings</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {scalingMetrics.costs?.efficiency.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Cost Efficiency</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-900 border border-green-700 rounded-lg">
          <h5 className="text-sm font-medium text-green-200 mb-2">💡 Cost Optimization Tips</h5>
          <ul className="text-sm text-green-100 space-y-1">
            <li>• Use spot instances for non-critical workloads (save up to 70%)</li>
            <li>• Implement intelligent auto-scaling policies</li>
            <li>• Optimize resource allocation based on usage patterns</li>
            <li>• Consider reserved instances for baseline capacity</li>
          </ul>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Growth Trends & Predictions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-white mb-4">Traffic Growth</h5>
            <div className="text-3xl font-bold text-green-400 mb-2">
              +{scalingMetrics.trends?.growth.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400 mb-2">Month-over-month growth</div>
            <div className="text-xs text-green-400">
              Predicted load: {scalingMetrics.trends?.predictedLoad.toLocaleString()} req/min
            </div>
            
            <div className="mt-4">
              <div className="text-sm text-gray-400 mb-2">Seasonality Pattern</div>
              <div className="text-sm text-white">{scalingMetrics.trends?.seasonality}</div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-white mb-4">Scaling Recommendations</h5>
            <div className="space-y-2">
              {scalingMetrics.trends?.recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-blue-900 border border-blue-700 rounded text-sm text-blue-200">
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-6">Quick Scaling Actions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Scale Up Now', description: 'Add 2 instances immediately', icon: '⬆️', color: 'green' },
            { title: 'Optimize Pools', description: 'Adjust connection pool sizes', icon: '🎯', color: 'blue' },
            { title: 'Balance Load', description: 'Redistribute traffic evenly', icon: '⚖️', color: 'purple' },
            { title: 'Enable Auto-Scale', description: 'Activate intelligent scaling', icon: '🤖', color: 'cyan' },
            { title: 'Cost Optimize', description: 'Switch to spot instances', icon: '💰', color: 'yellow' },
            { title: 'Health Check', description: 'Verify all systems status', icon: '🏥', color: 'red' }
          ].map((action, index) => (
            <button
              key={index}
              className={`p-4 bg-gray-900 border border-gray-700 rounded-lg hover:border-${action.color}-500 transition-colors text-left`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{action.icon}</span>
                <h5 className="text-sm font-medium text-white">{action.title}</h5>
              </div>
              <p className="text-xs text-gray-400">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Load Balancers
  const renderLoadBalancers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Load Balancers</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Load Balancer
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Health Check
          </button>
        </div>
      </div>

      {/* Load Balancer Cards */}
      <div className="space-y-6">
        {loadBalancers.map(lb => (
          <div key={lb.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-medium text-white">{lb.name}</h4>
                <p className="text-sm text-gray-400">{lb.type} • {lb.algorithm}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  lb.status === 'active' ? 'bg-green-900 text-green-200' :
                  lb.status === 'maintenance' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-red-900 text-red-200'
                }`}>
                  {lb.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {lb.metrics.totalRequests.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Requests</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {lb.metrics.successRate.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {lb.metrics.avgResponseTime}ms
                </div>
                <div className="text-sm text-gray-400">Avg Response</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {lb.metrics.throughput}
                </div>
                <div className="text-sm text-gray-400">Throughput/min</div>
              </div>
            </div>

            {/* Targets */}
            <div>
              <h5 className="text-sm font-medium text-white mb-4">Target Servers</h5>
              <div className="space-y-3">
                {lb.targets.map(target => (
                  <div key={target.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className={`w-3 h-3 rounded-full ${
                        target.status === 'healthy' ? 'bg-green-500' :
                        target.status === 'draining' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></span>
                      <div>
                        <div className="text-sm font-medium text-white">{target.endpoint}</div>
                        <div className="text-xs text-gray-400">Weight: {target.weight}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-white">{target.responseTime}ms</div>
                      <div className="text-xs text-gray-400">{target.connections} connections</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Check Configuration */}
            <div className="mt-6 p-4 bg-gray-900 rounded-lg">
              <h5 className="text-sm font-medium text-white mb-3">Health Check Configuration</h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Interval:</span>
                  <span className="text-white ml-2">{lb.healthCheck.interval}s</span>
                </div>
                <div>
                  <span className="text-gray-400">Timeout:</span>
                  <span className="text-white ml-2">{lb.healthCheck.timeout}s</span>
                </div>
                <div>
                  <span className="text-gray-400">Healthy:</span>
                  <span className="text-white ml-2">{lb.healthCheck.healthyThreshold}</span>
                </div>
                <div>
                  <span className="text-gray-400">Unhealthy:</span>
                  <span className="text-white ml-2">{lb.healthCheck.unhealthyThreshold}</span>
                </div>
                <div>
                  <span className="text-gray-400">Path:</span>
                  <span className="text-white ml-2">{lb.healthCheck.path}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Auto Scaling Groups
  const renderAutoScalingGroups = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Auto Scaling Groups</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create ASG
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Update Policy
          </button>
        </div>
      </div>

      {/* Auto Scaling Group Cards */}
      <div className="space-y-6">
        {autoScalingGroups.map(asg => (
          <div key={asg.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-medium text-white">{asg.name}</h4>
                <p className="text-sm text-gray-400">Region: {asg.region}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                asg.status === 'active' ? 'bg-green-900 text-green-200' :
                asg.status === 'updating' ? 'bg-yellow-900 text-yellow-200' :
                'bg-red-900 text-red-200'
              }`}>
                {asg.status.toUpperCase()}
              </span>
            </div>

            {/* Instance Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {asg.instances.current}
                </div>
                <div className="text-sm text-gray-400">Current</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {asg.instances.desired}
                </div>
                <div className="text-sm text-gray-400">Desired</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {asg.instances.min}
                </div>
                <div className="text-sm text-gray-400">Minimum</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {asg.instances.max}
                </div>
                <div className="text-sm text-gray-400">Maximum</div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <h5 className="text-sm font-medium text-white mb-4">Performance Metrics</h5>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">CPU</span>
                    <span className="text-xs text-white">{asg.metrics.cpuUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        asg.metrics.cpuUtilization > 80 ? 'bg-red-600' :
                        asg.metrics.cpuUtilization > 60 ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${asg.metrics.cpuUtilization}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Memory</span>
                    <span className="text-xs text-white">{asg.metrics.memoryUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        asg.metrics.memoryUtilization > 80 ? 'bg-red-600' :
                        asg.metrics.memoryUtilization > 60 ? 'bg-yellow-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${asg.metrics.memoryUtilization}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-400">
                    {asg.metrics.networkIn.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">Network In (MB/s)</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-bold text-purple-400">
                    {asg.metrics.networkOut.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">Network Out (MB/s)</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-bold text-green-400">
                    {asg.metrics.activeConnections}
                  </div>
                  <div className="text-xs text-gray-400">Active Connections</div>
                </div>
              </div>
            </div>

            {/* Scaling Policies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-900 border border-green-700 rounded-lg">
                <h5 className="text-sm font-medium text-green-200 mb-3">Scale Up Policy</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-300">Trigger:</span>
                    <span className="text-green-100">{asg.scalingPolicies.scaleUp.trigger}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Adjustment:</span>
                    <span className="text-green-100">+{asg.scalingPolicies.scaleUp.adjustment} instances</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Cooldown:</span>
                    <span className="text-green-100">{asg.scalingPolicies.scaleUp.cooldown}s</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
                <h5 className="text-sm font-medium text-red-200 mb-3">Scale Down Policy</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-300">Trigger:</span>
                    <span className="text-red-100">{asg.scalingPolicies.scaleDown.trigger}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-300">Adjustment:</span>
                    <span className="text-red-100">{asg.scalingPolicies.scaleDown.adjustment} instances</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-300">Cooldown:</span>
                    <span className="text-red-100">{asg.scalingPolicies.scaleDown.cooldown}s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Connection Pools
  const renderConnectionPools = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Connection Pools</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Optimize Pools
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Test Connections
          </button>
        </div>
      </div>

      {/* Connection Pool Cards */}
      <div className="space-y-6">
        {connectionPools.map(pool => (
          <div key={pool.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-medium text-white">{pool.name}</h4>
                <p className="text-sm text-gray-400">{pool.type} pool</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                pool.status === 'optimal' ? 'bg-green-900 text-green-200' :
                pool.status === 'warning' ? 'bg-yellow-900 text-yellow-200' :
                'bg-red-900 text-red-200'
              }`}>
                {pool.status.toUpperCase()}
              </span>
            </div>

            {/* Connection Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {pool.metrics.activeConnections}
                </div>
                <div className="text-sm text-gray-400">Active</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {pool.metrics.idleConnections}
                </div>
                <div className="text-sm text-gray-400">Idle</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {pool.metrics.totalConnections}
                </div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <h5 className="text-sm font-medium text-white mb-4">Performance Metrics</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {pool.performance.throughput.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Throughput/min</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {pool.performance.latency.toFixed(1)}ms
                  </div>
                  <div className="text-xs text-gray-400">Avg Latency</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    {pool.performance.errorRate.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-400">Error Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {pool.performance.utilization}%
                  </div>
                  <div className="text-xs text-gray-400">Utilization</div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <h5 className="text-sm font-medium text-white mb-3">Pool Configuration</h5>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Min:</span>
                  <span className="text-white ml-2">{pool.configuration.minConnections}</span>
                </div>
                <div>
                  <span className="text-gray-400">Max:</span>
                  <span className="text-white ml-2">{pool.configuration.maxConnections}</span>
                </div>
                <div>
                  <span className="text-gray-400">Acquire:</span>
                  <span className="text-white ml-2">{pool.configuration.acquireTimeout / 1000}s</span>
                </div>
                <div>
                  <span className="text-gray-400">Idle:</span>
                  <span className="text-white ml-2">{pool.configuration.idleTimeout / 1000}s</span>
                </div>
                <div>
                  <span className="text-gray-400">Lifetime:</span>
                  <span className="text-white ml-2">{pool.configuration.maxLifetime / 1000}s</span>
                </div>
                <div>
                  <span className="text-gray-400">Test:</span>
                  <span className="text-white ml-2">{pool.configuration.testQuery}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Scalability Management</h1>
        <p className="text-gray-400">Horizontal scaling, load balancing, auto-scaling, and connection pooling</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'loadbalancers', label: 'Load Balancers', icon: '⚖️' },
          { id: 'autoscaling', label: 'Auto Scaling', icon: '📈' },
          { id: 'pools', label: 'Connection Pools', icon: '🔗' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeSection === 'overview' && renderScalabilityOverview()}
      {activeSection === 'loadbalancers' && renderLoadBalancers()}
      {activeSection === 'autoscaling' && renderAutoScalingGroups()}
      {activeSection === 'pools' && renderConnectionPools()}
    </div>
  );
};