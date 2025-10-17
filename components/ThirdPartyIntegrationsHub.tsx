import React, { useState, useEffect } from 'react';
import { 
  GlobeAltIcon,
  LinkIcon,
  ShieldCheckIcon,
  KeyIcon,
  CpuChipIcon,
  ServerIcon,
  CloudIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  MapIcon,
  CalculatorIcon,
  CameraIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

interface ServiceProvider {
  id: string;
  name: string;
  category: 'payment' | 'communication' | 'storage' | 'analytics' | 'ai_ml' | 'security' | 'social' | 'productivity' | 'location' | 'media';
  description: string;
  logo: string;
  website: string;
  documentation: string;
  pricing: 'free' | 'freemium' | 'paid' | 'enterprise';
  popularity: number;
  features: string[];
}

interface ThirdPartyConnection {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  connectedAt: Date;
  lastSync: Date;
  dataVolume: number;
  apiCalls: number;
  errorCount: number;
  configuration: {
    apiKey?: string;
    clientId?: string;
    webhookUrl?: string;
    scopes?: string[];
    environment: 'sandbox' | 'production';
    rateLimit: {
      requests: number;
      period: 'minute' | 'hour' | 'day';
      current: number;
    };
  };
  features: {
    enabled: string[];
    available: string[];
  };
  webhooks: {
    incoming: boolean;
    outgoing: boolean;
    events: string[];
  };
}

const ThirdPartyIntegrationsHub: React.FC = () => {
  const [connections, setConnections] = useState<ThirdPartyConnection[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [activeTab, setActiveTab] = useState<'connected' | 'available' | 'marketplace' | 'webhooks'>('connected');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceProvider | null>(null);

  // Mock data initialization
  useEffect(() => {
    const mockProviders: ServiceProvider[] = [
      {
        id: 'stripe',
        name: 'Stripe',
        category: 'payment',
        description: 'Complete payments platform with APIs for online and in-person payments',
        logo: '/api/placeholder/40/40',
        website: 'https://stripe.com',
        documentation: 'https://stripe.com/docs',
        pricing: 'freemium',
        popularity: 95,
        features: ['Payment Processing', 'Subscriptions', 'Invoicing', 'Connect', 'Radar']
      },
      {
        id: 'paypal',
        name: 'PayPal',
        category: 'payment',
        description: 'Global payment solutions for businesses of all sizes',
        logo: '/api/placeholder/40/40',
        website: 'https://paypal.com',
        documentation: 'https://developer.paypal.com',
        pricing: 'freemium',
        popularity: 88,
        features: ['Payment Processing', 'Express Checkout', 'Subscriptions', 'Invoicing']
      },
      {
        id: 'sendgrid',
        name: 'SendGrid',
        category: 'communication',
        description: 'Email delivery service with marketing and transactional capabilities',
        logo: '/api/placeholder/40/40',
        website: 'https://sendgrid.com',
        documentation: 'https://docs.sendgrid.com',
        pricing: 'freemium',
        popularity: 85,
        features: ['Transactional Email', 'Marketing Campaigns', 'Templates', 'Analytics']
      },
      {
        id: 'twilio',
        name: 'Twilio',
        category: 'communication',
        description: 'Communication APIs for voice, video, messaging, and authentication',
        logo: '/api/placeholder/40/40',
        website: 'https://twilio.com',
        documentation: 'https://www.twilio.com/docs',
        pricing: 'paid',
        popularity: 82,
        features: ['SMS', 'Voice Calls', 'Video', 'WhatsApp', 'Authentication']
      },
      {
        id: 'aws-s3',
        name: 'Amazon S3',
        category: 'storage',
        description: 'Object storage service with industry-leading scalability and security',
        logo: '/api/placeholder/40/40',
        website: 'https://aws.amazon.com/s3',
        documentation: 'https://docs.aws.amazon.com/s3',
        pricing: 'paid',
        popularity: 92,
        features: ['Object Storage', 'CDN', 'Versioning', 'Encryption', 'Analytics']
      },
      {
        id: 'google-analytics',
        name: 'Google Analytics',
        category: 'analytics',
        description: 'Web analytics service that tracks and reports website traffic',
        logo: '/api/placeholder/40/40',
        website: 'https://analytics.google.com',
        documentation: 'https://developers.google.com/analytics',
        pricing: 'freemium',
        popularity: 96,
        features: ['Web Analytics', 'Real-time Reporting', 'Custom Dimensions', 'Goals']
      },
      {
        id: 'openai',
        name: 'OpenAI',
        category: 'ai_ml',
        description: 'Advanced AI models for text, image, and code generation',
        logo: '/api/placeholder/40/40',
        website: 'https://openai.com',
        documentation: 'https://platform.openai.com/docs',
        pricing: 'paid',
        popularity: 89,
        features: ['GPT Models', 'DALL-E', 'Whisper', 'Embeddings', 'Fine-tuning']
      },
      {
        id: 'auth0',
        name: 'Auth0',
        category: 'security',
        description: 'Identity platform for developers with authentication and authorization',
        logo: '/api/placeholder/40/40',
        website: 'https://auth0.com',
        documentation: 'https://auth0.com/docs',
        pricing: 'freemium',
        popularity: 78,
        features: ['SSO', 'MFA', 'Social Login', 'User Management', 'RBAC']
      },
      {
        id: 'slack',
        name: 'Slack',
        category: 'communication',
        description: 'Business communication platform with powerful API integrations',
        logo: '/api/placeholder/40/40',
        website: 'https://slack.com',
        documentation: 'https://api.slack.com',
        pricing: 'freemium',
        popularity: 87,
        features: ['Messaging', 'File Sharing', 'Integrations', 'Workflows', 'Analytics']
      },
      {
        id: 'microsoft-graph',
        name: 'Microsoft Graph',
        category: 'productivity',
        description: 'Unified API endpoint for Microsoft 365, Windows, and Enterprise Mobility',
        logo: '/api/placeholder/40/40',
        website: 'https://graph.microsoft.com',
        documentation: 'https://docs.microsoft.com/graph',
        pricing: 'enterprise',
        popularity: 81,
        features: ['Office 365', 'Azure AD', 'OneDrive', 'Teams', 'Outlook']
      },
      {
        id: 'google-maps',
        name: 'Google Maps',
        category: 'location',
        description: 'Mapping and location services with comprehensive geographic data',
        logo: '/api/placeholder/40/40',
        website: 'https://maps.google.com',
        documentation: 'https://developers.google.com/maps',
        pricing: 'freemium',
        popularity: 94,
        features: ['Maps', 'Geocoding', 'Places', 'Directions', 'Street View']
      },
      {
        id: 'cloudinary',
        name: 'Cloudinary',
        category: 'media',
        description: 'Cloud-based image and video management service',
        logo: '/api/placeholder/40/40',
        website: 'https://cloudinary.com',
        documentation: 'https://cloudinary.com/documentation',
        pricing: 'freemium',
        popularity: 75,
        features: ['Image Processing', 'Video Management', 'CDN', 'AI Tagging', 'Optimization']
      }
    ];

    const mockConnections: ThirdPartyConnection[] = [
      {
        id: 'conn-stripe',
        serviceId: 'stripe',
        serviceName: 'Stripe',
        category: 'payment',
        status: 'connected',
        connectedAt: new Date(Date.now() - 86400000 * 30),
        lastSync: new Date(Date.now() - 300000),
        dataVolume: 2500000,
        apiCalls: 15678,
        errorCount: 3,
        configuration: {
          apiKey: 'sk_live_**********************',
          environment: 'production',
          rateLimit: { requests: 100, period: 'minute', current: 45 }
        },
        features: {
          enabled: ['Payment Processing', 'Webhooks', 'Subscriptions'],
          available: ['Connect', 'Radar', 'Invoicing']
        },
        webhooks: {
          incoming: true,
          outgoing: true,
          events: ['payment_intent.succeeded', 'invoice.payment_failed', 'customer.subscription.updated']
        }
      },
      {
        id: 'conn-sendgrid',
        serviceId: 'sendgrid',
        serviceName: 'SendGrid',
        category: 'communication',
        status: 'connected',
        connectedAt: new Date(Date.now() - 86400000 * 15),
        lastSync: new Date(Date.now() - 600000),
        dataVolume: 890000,
        apiCalls: 3245,
        errorCount: 1,
        configuration: {
          apiKey: 'SG.**********************',
          environment: 'production',
          rateLimit: { requests: 600, period: 'minute', current: 12 }
        },
        features: {
          enabled: ['Transactional Email', 'Templates'],
          available: ['Marketing Campaigns', 'Analytics', 'A/B Testing']
        },
        webhooks: {
          incoming: false,
          outgoing: true,
          events: ['delivered', 'bounce', 'open', 'click']
        }
      },
      {
        id: 'conn-google-analytics',
        serviceId: 'google-analytics',
        serviceName: 'Google Analytics',
        category: 'analytics',
        status: 'connected',
        connectedAt: new Date(Date.now() - 86400000 * 60),
        lastSync: new Date(Date.now() - 1800000),
        dataVolume: 5600000,
        apiCalls: 2890,
        errorCount: 0,
        configuration: {
          clientId: 'ga-client-**********************',
          environment: 'production',
          scopes: ['analytics.readonly', 'analytics.manage.users'],
          rateLimit: { requests: 10, period: 'minute', current: 3 }
        },
        features: {
          enabled: ['Reporting API', 'Real-time API'],
          available: ['Management API', 'User Activity API']
        },
        webhooks: {
          incoming: false,
          outgoing: false,
          events: []
        }
      },
      {
        id: 'conn-slack',
        serviceId: 'slack',
        serviceName: 'Slack',
        category: 'communication',
        status: 'error',
        connectedAt: new Date(Date.now() - 86400000 * 7),
        lastSync: new Date(Date.now() - 3600000),
        dataVolume: 125000,
        apiCalls: 567,
        errorCount: 12,
        configuration: {
          webhookUrl: 'https://hooks.slack.com/services/**********************',
          environment: 'production',
          rateLimit: { requests: 1, period: 'minute', current: 0 }
        },
        features: {
          enabled: ['Incoming Webhooks'],
          available: ['Interactive Components', 'Slash Commands', 'Events API']
        },
        webhooks: {
          incoming: true,
          outgoing: false,
          events: ['message.channels']
        }
      }
    ];

    setServiceProviders(mockProviders);
    setConnections(mockConnections);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'configuring':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'disconnected':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'configuring':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string, size: string = 'h-5 w-5') => {
    switch (category) {
      case 'payment':
        return <CreditCardIcon className={size} />;
      case 'communication':
        return <ChatBubbleLeftRightIcon className={size} />;
      case 'storage':
        return <ArchiveBoxIcon className={size} />;
      case 'analytics':
        return <ChartBarIcon className={size} />;
      case 'ai_ml':
        return <CpuChipIcon className={size} />;
      case 'security':
        return <ShieldCheckIcon className={size} />;
      case 'social':
        return <UserGroupIcon className={size} />;
      case 'productivity':
        return <BuildingOfficeIcon className={size} />;
      case 'location':
        return <MapIcon className={size} />;
      case 'media':
        return <CameraIcon className={size} />;
      default:
        return <GlobeAltIcon className={size} />;
    }
  };

  const formatDataVolume = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const categories = [
    { id: 'all', label: 'All Categories', count: serviceProviders.length },
    { id: 'payment', label: 'Payment', count: serviceProviders.filter(s => s.category === 'payment').length },
    { id: 'communication', label: 'Communication', count: serviceProviders.filter(s => s.category === 'communication').length },
    { id: 'storage', label: 'Storage', count: serviceProviders.filter(s => s.category === 'storage').length },
    { id: 'analytics', label: 'Analytics', count: serviceProviders.filter(s => s.category === 'analytics').length },
    { id: 'ai_ml', label: 'AI/ML', count: serviceProviders.filter(s => s.category === 'ai_ml').length },
    { id: 'security', label: 'Security', count: serviceProviders.filter(s => s.category === 'security').length },
    { id: 'productivity', label: 'Productivity', count: serviceProviders.filter(s => s.category === 'productivity').length },
    { id: 'location', label: 'Location', count: serviceProviders.filter(s => s.category === 'location').length },
    { id: 'media', label: 'Media', count: serviceProviders.filter(s => s.category === 'media').length }
  ];

  const filteredProviders = serviceProviders.filter(provider => {
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectService = (service: ServiceProvider) => {
    setSelectedService(service);
    setShowConnectionModal(true);
  };

  const disconnectService = (connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: 'disconnected' as const }
        : conn
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Third-Party Integrations Hub</h2>
          <p className="text-gray-600 mt-1">
            Connect with external services and manage API integrations from one central hub
          </p>
        </div>
        <button
          onClick={() => setShowConnectionModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Integration
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <LinkIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Connected Services</p>
              <p className="text-2xl font-semibold text-gray-900">
                {connections.filter(c => c.status === 'connected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CloudIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Services</p>
              <p className="text-2xl font-semibold text-gray-900">{serviceProviders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BoltIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">API Calls (24h)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {connections.reduce((sum, c) => sum + c.apiCalls, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Errors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {connections.reduce((sum, c) => sum + c.errorCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'connected', label: 'Connected Services', icon: CheckCircleIcon },
            { id: 'available', label: 'Available Services', icon: CloudIcon },
            { id: 'marketplace', label: 'Service Marketplace', icon: GlobeAltIcon },
            { id: 'webhooks', label: 'Webhook Management', icon: BoltIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'connected' && (
        <div className="space-y-6">
          {connections.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {connections.map((connection) => (
                <div key={connection.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getCategoryIcon(connection.category, 'h-8 w-8 text-gray-600')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{connection.serviceName}</h3>
                        <p className="text-sm text-gray-500 capitalize">{connection.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(connection.status)}`}>
                      {getStatusIcon(connection.status)}
                      <span className="ml-1 capitalize">{connection.status}</span>
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Connected:</span>
                      <span className="font-medium">{connection.connectedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">API Calls:</span>
                      <span className="font-medium">{connection.apiCalls.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data Volume:</span>
                      <span className="font-medium">{formatDataVolume(connection.dataVolume)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Errors:</span>
                      <span className={`font-medium ${connection.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {connection.errorCount}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {connection.features.enabled.length} of {connection.features.available.length} features enabled
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Cog6ToothIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => disconnectService(connection.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CloudIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Connected Services</h3>
              <p className="text-gray-500 mb-4">
                Connect to external services to unlock powerful integrations
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Available Services
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProviders.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      {getCategoryIcon(service.category, 'h-8 w-8 text-gray-600')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.pricing === 'free' ? 'bg-green-100 text-green-700' :
                        service.pricing === 'freemium' ? 'bg-blue-100 text-blue-700' :
                        service.pricing === 'paid' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {service.pricing}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-500">Popularity</div>
                    <div className="font-semibold text-gray-900">{service.popularity}%</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{service.description}</p>

                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-700 mb-2">Key Features:</div>
                  <div className="flex flex-wrap gap-1">
                    {service.features.slice(0, 3).map((feature) => (
                      <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                    {service.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{service.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <a
                      href={service.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                    </a>
                    <a
                      href={service.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <GlobeAltIcon className="h-4 w-4" />
                    </a>
                  </div>
                  <button
                    onClick={() => connectService(service)}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <GlobeAltIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Marketplace</h3>
          <p className="text-gray-600 mb-6">
            Discover new services and integrations from our curated marketplace
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            Browse Marketplace
          </button>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Webhook Management</h3>
              <p className="text-sm text-gray-500 mt-1">
                Configure incoming and outgoing webhooks for real-time integration
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Incoming Webhooks</h4>
                  <div className="space-y-3">
                    {connections.filter(c => c.webhooks.incoming).map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{connection.serviceName}</div>
                          <div className="text-sm text-gray-500">
                            {connection.webhooks.events.length} event types
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                          {connection.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Outgoing Webhooks</h4>
                  <div className="space-y-3">
                    {connections.filter(c => c.webhooks.outgoing).map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{connection.serviceName}</div>
                          <div className="text-sm text-gray-500">
                            {connection.webhooks.events.length} event subscriptions
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                          {connection.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Modal */}
      {showConnectionModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                {getCategoryIcon(selectedService.category, 'h-8 w-8 text-gray-600 mr-3')}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedService.name}</h3>
                  <p className="text-sm text-gray-500">Setup new integration</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Connection Name</label>
                  <input
                    type="text"
                    defaultValue={selectedService.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <input
                    type="password"
                    placeholder="Enter your API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowConnectionModal(false);
                    setSelectedService(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Connect Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThirdPartyIntegrationsHub;