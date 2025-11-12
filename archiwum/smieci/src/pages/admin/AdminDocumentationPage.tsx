// @ts-nocheck
/**
 * AdminDocumentationPage
 * Admin panel documentation hub with guides and help resources
 */

import React, { useState } from 'react';

interface DocSection {
  id: string;
  title: string;
  icon: string;
  articles: Article[];
}

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  updated: string;
}

export const AdminDocumentationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const documentation: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        {
          id: '1',
          title: 'Admin Panel Overview',
          description: 'Introduction to the admin panel and its features',
          content: `# Admin Panel Overview

Welcome to the ZZP Werkplaats Admin Panel! This comprehensive dashboard gives you complete control over your platform.

## Key Features

### Dashboard
- Real-time statistics and metrics
- Quick actions for common tasks
- Recent activity monitoring

### User Management
- View and manage all users
- Worker and employer profiles
- Account verification and moderation

### Content Management
- Blog posts and articles
- Certificate management
- Job listings moderation

### System Administration
- Performance monitoring
- Security settings
- Backup and recovery

## Navigation

The admin panel is organized into 24 specialized modules, each designed for specific administrative tasks.`,
          updated: '2025-10-09'
        },
        {
          id: '2',
          title: 'Quick Start Guide',
          description: 'Get up and running in 5 minutes',
          content: `# Quick Start Guide

## Step 1: Access the Admin Panel
Navigate to \`/admin\` and log in with your admin credentials.

## Step 2: Review Dashboard
Check the main dashboard for:
- Active users
- Recent jobs
- System health
- Pending tasks

## Step 3: Configure Settings
Go to System Settings (⚙️) to configure:
- Email notifications
- Payment gateway
- Security preferences

## Step 4: Customize Features
Enable/disable features in Settings > Features tab.

## Step 5: Monitor Performance
Use the Performance Manager (⚡) to track system health.`,
          updated: '2025-10-09'
        }
      ]
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: '👥',
      articles: [
        {
          id: '3',
          title: 'Managing Workers',
          description: 'How to manage worker accounts and profiles',
          content: `# Managing Workers

## Viewing Workers
Navigate to Workers Manager to view all registered workers.

## Verification Process
1. Review worker profile
2. Check certificates
3. Verify contact information
4. Approve or reject

## Bulk Actions
- Export worker data
- Send notifications
- Update statuses

## Common Tasks
- Approve certificates
- Handle disputes
- Manage subscriptions`,
          updated: '2025-10-08'
        },
        {
          id: '4',
          title: 'Managing Employers',
          description: 'How to manage employer accounts and companies',
          content: `# Managing Employers

## Company Verification
1. Check company registration
2. Verify KVK number
3. Review business documents
4. Approve company profile

## Job Posting Moderation
- Review job listings
- Check for policy violations
- Approve/reject postings

## Premium Features
- Manage subscriptions
- Handle billing issues
- Track usage metrics`,
          updated: '2025-10-08'
        }
      ]
    },
    {
      id: 'security',
      title: 'Security & Compliance',
      icon: '🔒',
      articles: [
        {
          id: '5',
          title: 'GDPR Compliance',
          description: 'Handling data requests and privacy compliance',
          content: `# GDPR Compliance

## Data Subject Requests
Users can request:
- Access to their data
- Data deletion
- Data export
- Data correction

## Processing Requests
1. Navigate to Compliance Manager
2. Review pending requests
3. Verify user identity
4. Process request within 30 days

## Data Protection
- Encryption at rest
- Secure backups
- Access logging
- Regular audits`,
          updated: '2025-10-09'
        },
        {
          id: '6',
          title: 'Security Best Practices',
          description: 'Keep your platform secure',
          content: `# Security Best Practices

## Access Control
- Use strong passwords
- Enable 2FA for all admins
- Regular permission audits
- Limit admin access

## Monitoring
- Review audit logs daily
- Check failed login attempts
- Monitor unusual activity
- Set up alerts

## Data Protection
- Regular backups (daily)
- Encrypted connections
- Secure API keys
- Update dependencies

## Incident Response
1. Identify the threat
2. Contain the issue
3. Investigate root cause
4. Implement fixes
5. Document learnings`,
          updated: '2025-10-08'
        }
      ]
    },
    {
      id: 'system-admin',
      title: 'System Administration',
      icon: '⚙️',
      articles: [
        {
          id: '7',
          title: 'Backup & Recovery',
          description: 'Protect your data with proper backups',
          content: `# Backup & Recovery

## Backup Types
- **Full Backup**: Complete database snapshot
- **Incremental**: Changes since last backup
- **Differential**: Changes since last full backup

## Automated Schedules
- Daily full backups (02:00 UTC)
- Hourly incrementals
- Weekly archives
- Monthly long-term storage

## Recovery Process
1. Navigate to Backup Manager
2. Select recovery point
3. Review backup details
4. Confirm restoration
5. Verify data integrity

## Best Practices
- Test restores monthly
- Keep 30-day retention
- Store backups off-site
- Document procedures`,
          updated: '2025-10-09'
        },
        {
          id: '8',
          title: 'Performance Optimization',
          description: 'Keep your platform running smoothly',
          content: `# Performance Optimization

## Monitoring Metrics
- Server response time
- Database query performance
- Cache hit rates
- Error rates

## Optimization Tips
1. **Database**: Add indexes to frequently queried columns
2. **Caching**: Use Redis for session data
3. **CDN**: Serve static assets via CDN
4. **Code**: Minify JavaScript and CSS

## Troubleshooting Slow Performance
- Check server resources (CPU, Memory)
- Review slow query logs
- Clear cache if stale
- Restart services if needed

## Scaling
- Horizontal scaling for high traffic
- Database read replicas
- Load balancing
- Auto-scaling groups`,
          updated: '2025-10-08'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      articles: [
        {
          id: '9',
          title: 'Common Issues',
          description: 'Solutions to frequently encountered problems',
          content: `# Common Issues & Solutions

## Email Not Sending
**Problem**: Users not receiving emails

**Solutions**:
1. Check SMTP settings in System Settings
2. Verify SendGrid API key
3. Check email queue status
4. Review spam filters
5. Test with "Send Test Email"

## Payment Failures
**Problem**: Payment processing errors

**Solutions**:
1. Verify Stripe API keys
2. Check webhook configuration
3. Review error logs
4. Test in Stripe dashboard
5. Contact Stripe support

## Login Issues
**Problem**: Users cannot log in

**Solutions**:
1. Check session configuration
2. Clear browser cookies
3. Review failed login logs
4. Reset user password
5. Check rate limiting

## Database Connection
**Problem**: Database connection errors

**Solutions**:
1. Check database status
2. Verify connection string
3. Review max connections
4. Restart database service
5. Check network connectivity`,
          updated: '2025-10-09'
        },
        {
          id: '10',
          title: 'Error Code Reference',
          description: 'Understanding system error codes',
          content: `# Error Code Reference

## Authentication Errors (401-403)
- **401**: Unauthorized - Invalid credentials
- **403**: Forbidden - Insufficient permissions

## Server Errors (500-503)
- **500**: Internal Server Error
- **502**: Bad Gateway
- **503**: Service Unavailable

## Database Errors (DB-XXX)
- **DB-001**: Connection timeout
- **DB-002**: Query execution failed
- **DB-003**: Deadlock detected

## Payment Errors (PAY-XXX)
- **PAY-001**: Card declined
- **PAY-002**: Insufficient funds
- **PAY-003**: Invalid card number

## Getting Help
- Check system logs
- Review audit trail
- Contact technical support
- Submit bug report`,
          updated: '2025-10-08'
        }
      ]
    },
    {
      id: 'api',
      title: 'API Documentation',
      icon: '🔌',
      articles: [
        {
          id: '11',
          title: 'API Overview',
          description: 'Introduction to the platform API',
          content: `# API Overview

## Authentication
All API requests require authentication using API keys.

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.zzp-werkplaats.nl/v1/users
\`\`\`

## Base URL
\`https://api.zzp-werkplaats.nl/v1\`

## Rate Limits
- **Free**: 100 requests/hour
- **Premium**: 1,000 requests/hour
- **Enterprise**: Unlimited

## Response Format
All responses are in JSON format.

\`\`\`json
{
  "success": true,
  "data": {...},
  "meta": {
    "page": 1,
    "total": 100
  }
}
\`\`\`

## Common Endpoints
- \`GET /users\` - List users
- \`POST /jobs\` - Create job
- \`GET /certificates\` - List certificates
- \`POST /payments\` - Process payment`,
          updated: '2025-10-09'
        }
      ]
    }
  ];

  const filteredDocumentation = documentation.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.articles.length > 0);

  const activeDoc = documentation.find(d => d.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Admin Documentation</h1>
          <p className="text-gray-600">Comprehensive guides and help resources</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg text-lg"
            />
            <span className="absolute left-4 top-3.5 text-2xl">🔍</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {(searchQuery ? filteredDocumentation : documentation).map(section => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setSelectedArticle(null);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <a href="#" className="block text-blue-600 hover:text-blue-800">📖 User Guide</a>
                  <a href="#" className="block text-blue-600 hover:text-blue-800">🎥 Video Tutorials</a>
                  <a href="#" className="block text-blue-600 hover:text-blue-800">💬 Community Forum</a>
                  <a href="#" className="block text-blue-600 hover:text-blue-800">📧 Contact Support</a>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="col-span-3">
            {selectedArticle ? (
              /* Article View */
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
                >
                  ← Back to {activeDoc?.title}
                </button>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h2>
                <p className="text-gray-500 mb-6">Last updated: {selectedArticle.updated}</p>
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {selectedArticle.content}
                  </div>
                </div>
              </div>
            ) : (
              /* Articles List */
              <>
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{activeDoc?.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{activeDoc?.title}</h2>
                  </div>
                  <p className="text-gray-600">
                    {activeDoc?.articles.length} article{activeDoc?.articles.length !== 1 ? 's' : ''} in this category
                  </p>
                </div>

                <div className="space-y-4">
                  {activeDoc?.articles.map(article => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-gray-600 mb-3">{article.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Updated: {article.updated}</span>
                        <span className="text-blue-600 hover:text-blue-800">Read more →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentationPage;
