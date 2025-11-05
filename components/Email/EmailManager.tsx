// @ts-nocheck
/**
 * EMAIL MANAGER COMPONENT
 * Admin panel for managing emails, templates, and viewing analytics
 */

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import type { EmailJob, EmailStats, EmailTemplateType } from '../../types/email';
import { emailService } from '../../services/email/emailService';
import './EmailManager.css';

export const EmailManager: React.FC = () => {
  const [emailJobs, setEmailJobs] = useState<EmailJob[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | EmailJob['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Calculate period dates
      const periodDates = getPeriodDates(period);

      // Load stats
      const statsData = await emailService.getEmailStats(undefined, periodDates);
      setStats(statsData);

      // Load email jobs (would be from database)
      // For now, mock data
      setEmailJobs([]);
    } catch (error) {
      console.error('Failed to load email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDates = (p: typeof period) => {
    const now = new Date();
    const from = new Date();

    switch (p) {
      case '24h':
        from.setHours(now.getHours() - 24);
        break;
      case '7d':
        from.setDate(now.getDate() - 7);
        break;
      case '30d':
        from.setDate(now.getDate() - 30);
        break;
      case 'all':
        return undefined;
    }

    return { from, to: now };
  };

  const getStatusIcon = (status: EmailJob['status']) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="status-icon success" />;
      case 'opened':
        return <Eye className="status-icon info" />;
      case 'clicked':
        return <MousePointerClick className="status-icon primary" />;
      case 'pending':
      case 'scheduled':
        return <Clock className="status-icon warning" />;
      case 'bounced':
      case 'complained':
      case 'failed':
        return <XCircle className="status-icon danger" />;
      default:
        return <Mail className="status-icon" />;
    }
  };

  const getStatusText = (status: EmailJob['status']) => {
    const statusMap: Record<EmailJob['status'], string> = {
      pending: 'In wachtrij',
      scheduled: 'Gepland',
      sending: 'Verzenden',
      sent: 'Verzonden',
      delivered: 'Afgeleverd',
      opened: 'Geopend',
      clicked: 'Geklikt',
      bounced: 'Bounced',
      complained: 'Spam gemeld',
      failed: 'Mislukt',
    };
    return statusMap[status] || status;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredJobs = emailJobs.filter((job) => {
    if (filter !== 'all' && job.status !== filter) return false;
    if (searchTerm) {
      const email = Array.isArray(job.emailData.to)
        ? job.emailData.to[0].email
        : job.emailData.to.email;
      return email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             job.emailData.subject.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="email-manager-loading">
        <RefreshCw className="spinner" />
        <p>E-mail gegevens laden...</p>
      </div>
    );
  }

  return (
    <div className="email-manager">
      {/* Header */}
      <div className="email-manager-header">
        <h1>
          <Mail />
          E-mail Beheer
        </h1>
        <button className="btn btn-primary" onClick={loadData}>
          <RefreshCw />
          Vernieuwen
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="email-stats-grid">
          <div className="stat-card">
            <div className="stat-icon sent">
              <Send />
            </div>
            <div className="stat-content">
              <h3>{stats.totalSent.toLocaleString()}</h3>
              <p>Verzonden</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon delivered">
              <CheckCircle />
            </div>
            <div className="stat-content">
              <h3>{stats.totalDelivered.toLocaleString()}</h3>
              <p>Afgeleverd</p>
              <span className="stat-percentage">{stats.deliveryRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon opened">
              <Eye />
            </div>
            <div className="stat-content">
              <h3>{stats.totalOpened.toLocaleString()}</h3>
              <p>Geopend</p>
              <span className="stat-percentage">{stats.openRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon clicked">
              <MousePointerClick />
            </div>
            <div className="stat-content">
              <h3>{stats.totalClicked.toLocaleString()}</h3>
              <p>Geklikt</p>
              <span className="stat-percentage">{stats.clickRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bounced">
              <AlertTriangle />
            </div>
            <div className="stat-content">
              <h3>{stats.totalBounced.toLocaleString()}</h3>
              <p>Bounced</p>
              <span className="stat-percentage danger">{stats.bounceRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon complaints">
              <XCircle />
            </div>
            <div className="stat-content">
              <h3>{stats.totalComplaints.toLocaleString()}</h3>
              <p>Spam meldingen</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="email-filters">
        <div className="filter-group">
          <label>Periode:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
            <option value="24h">Laatste 24 uur</option>
            <option value="7d">Laatste 7 dagen</option>
            <option value="30d">Laatste 30 dagen</option>
            <option value="all">Alles</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">Alle statussen</option>
            <option value="pending">In wachtrij</option>
            <option value="sent">Verzonden</option>
            <option value="delivered">Afgeleverd</option>
            <option value="opened">Geopend</option>
            <option value="clicked">Geklikt</option>
            <option value="failed">Mislukt</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>

        <div className="filter-group search">
          <input
            type="text"
            placeholder="Zoek op e-mail of onderwerp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Filter />
        </div>
      </div>

      {/* Email Jobs Table */}
      <div className="email-jobs-table">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Ontvanger</th>
              <th>Onderwerp</th>
              <th>Type</th>
              <th>Verzonden</th>
              <th>Laatste update</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  <Mail />
                  <p>Geen e-mails gevonden</p>
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => {
                const recipient = Array.isArray(job.emailData.to)
                  ? job.emailData.to[0]
                  : job.emailData.to;

                return (
                  <tr key={job.id}>
                    <td>
                      <div className="status-badge">
                        {getStatusIcon(job.status)}
                        <span>{getStatusText(job.status)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="recipient">
                        <strong>{recipient.name || recipient.email}</strong>
                        {recipient.name && <span>{recipient.email}</span>}
                      </div>
                    </td>
                    <td>{job.emailData.subject}</td>
                    <td>
                      {job.emailData.templateType ? (
                        <span className="template-badge">
                          {job.emailData.templateType}
                        </span>
                      ) : (
                        <span className="text-muted">Custom</span>
                      )}
                    </td>
                    <td>{job.sentAt ? formatDate(job.sentAt) : '-'}</td>
                    <td>{formatDate(job.updatedAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="Details bekijken">
                          <Eye />
                        </button>
                        {job.status === 'failed' && (
                          <button className="btn-icon" title="Opnieuw verzenden">
                            <RefreshCw />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredJobs.length > 0 && (
        <div className="pagination">
          <span>
            {filteredJobs.length} {filteredJobs.length === 1 ? 'e-mail' : 'e-mails'}
          </span>
        </div>
      )}
    </div>
  );
};
