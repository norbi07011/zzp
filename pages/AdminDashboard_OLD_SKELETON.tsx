import React, { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

// Advanced Stats Component
interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: 'cyber' | 'success' | 'premium' | 'warning';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, color }) => {
  const gradientMap = {
    cyber: 'bg-gradient-cyber',
    success: 'bg-gradient-success',
    premium: 'bg-gradient-premium',
    warning: 'bg-gradient-to-br from-orange-500 to-red-600'
  };

  const shadowMap = {
    cyber: 'shadow-glow-cyber',
    success: 'shadow-glow-success',
    premium: 'shadow-glow-premium',
    warning: 'shadow-lg hover:shadow-2xl'
  };

  return (
    <div className={`${gradientMap[color]} ${shadowMap[color]} rounded-2xl p-6 text-white group hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
      {/* Floating orb background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="text-5xl group-hover:animate-float">{icon}</div>
          <div className="text-right">
            <p className={`text-xs px-2 py-1 rounded-full ${
              changeType === 'positive' ? 'bg-green-500/20 text-green-100' :
              changeType === 'negative' ? 'bg-red-500/20 text-red-100' :
              'bg-white/20 text-white'
            }`}>
              {change}
            </p>
          </div>
        </div>
        <p className="text-sm opacity-90 mb-1 font-medium">{title}</p>
        <p className="text-5xl font-bold group-hover:animate-glow">{value}</p>
      </div>
    </div>
  );
};

// Module Card Component
interface ModuleCardProps {
  title: string;
  description: string;
  path: string;
  icon: string;
  stats: { label: string; value: string; trend: string };
  color: 'cyber' | 'success' | 'premium';
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, path, icon, stats, color }) => {
  const accentMap = {
    cyber: 'border-accent-cyber hover:border-accent-cyber text-accent-cyber hover:text-accent-cyber',
    success: 'border-accent-techGreen hover:border-accent-techGreen text-accent-techGreen hover:text-accent-techGreen',
    premium: 'border-accent-neonPurple hover:border-accent-neonPurple text-accent-neonPurple hover:text-accent-neonPurple'
  };

  return (
    <Link
      to={path}
      className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d hover:shadow-glow-cyber transition-all p-6 border border-accent-cyber/20 hover:scale-105 group relative overflow-hidden"
    >
      {/* Animated background orb */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-cyber/5 rounded-full blur-3xl group-hover:bg-accent-cyber/10 transition-all duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="text-5xl group-hover:animate-float group-hover:rotate-12 transition-transform duration-300">{icon}</div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${accentMap[color].split(' ')[2]} group-hover:animate-glow`}>{stats.value}</p>
            <p className="text-xs text-neutral-400">{stats.label}</p>
            <p className="text-xs text-accent-techGreen mt-1">{stats.trend}</p>
          </div>
        </div>
        <h3 className={`text-xl font-bold text-white mb-2 group-hover:${accentMap[color].split(' ')[4]} transition-colors`}>{title}</h3>
        <p className="text-sm text-neutral-400 mb-4">{description}</p>
        <div className={`flex items-center ${accentMap[color].split(' ')[2]} font-medium text-sm`}>
          Otwórz moduł →
        </div>
      </div>
    </Link>
  );
};

// Quick Action Button
interface QuickActionProps {
  icon: string;
  label: string;
  onClick: () => void;
  color: 'cyber' | 'success' | 'premium' | 'warning';
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick, color }) => {
  const colorMap = {
    cyber: 'bg-accent-cyber hover:bg-accent-cyber/80 shadow-glow-cyber',
    success: 'bg-accent-techGreen hover:bg-accent-techGreen/80 shadow-glow-success',
    premium: 'bg-accent-neonPurple hover:bg-accent-neonPurple/80 shadow-glow-premium',
    warning: 'bg-orange-600 hover:bg-orange-700 shadow-lg'
  };

  return (
    <button
      onClick={onClick}
      className={`${colorMap[color]} text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all flex items-center gap-2 group`}
    >
      <span className="text-2xl group-hover:animate-float">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');

  const adminModules = [
    {
      title: 'Zarządzanie Terminami',
      description: 'Przeglądaj zgłoszenia, potwierdzaj terminy testów i wprowadzaj wyniki',
      path: '/admin/appointments',
      icon: '📅',
      color: 'cyber' as const,
      stats: { label: 'Oczekujących', value: '8', trend: '+2 dziś' }
    },
    {
      title: 'Zarządzanie Pracownikami',
      description: 'Przeglądaj profile, zarządzaj certyfikatami i kontroluj dostęp',
      path: '/admin/workers',
      icon: '👷',
      color: 'success' as const,
      stats: { label: 'Aktywnych', value: '245', trend: '+12 ten tydzień' }
    },
    {
      title: 'Zarządzanie Pracodawcami',
      description: 'Przeglądaj firmy, zarządzaj subskrypcjami i monitoruj aktywność',
      path: '/admin/employers',
      icon: '🏢',
      color: 'premium' as const,
      stats: { label: 'Subskrypcji', value: '89', trend: '+5 ten miesiąc' }
    },
    {
      title: 'Zarządzanie Certyfikatami',
      description: 'Generuj, wysyłaj i zarządzaj certyfikatami doświadczenia',
      path: '/admin/certificates',
      icon: '📜',
      color: 'cyber' as const,
      stats: { label: 'Aktywnych', value: '245', trend: '+18 ten tydzień' }
    },
    {
      title: 'Harmonogram Testów',
      description: 'Zarządzaj slotami, pojemnością i dostępnością terminów',
      path: '/admin/scheduler',
      icon: '🗓️',
      color: 'success' as const,
      stats: { label: 'Slotów ten tydzień', value: '75', trend: '+8 nowych' }
    },
    {
      title: 'Media & Pliki',
      description: 'Zarządzaj zdjęciami, video, dokumentami i folderami',
      path: '/admin/media',
      icon: '📁',
      color: 'premium' as const,
      stats: { label: 'Plików', value: '1.2k', trend: '+45 dzisiaj' }
    },
    {
      title: 'Wiadomości & Komunikacja',
      description: 'Chat, email templates, powiadomienia push i SMS',
      path: '/admin/messages',
      icon: '💬',
      color: 'cyber' as const,
      stats: { label: 'Wiadomości/dzień', value: '234', trend: '+23%' }
    },
    {
      title: 'Płatności & Faktury',
      description: 'Subskrypcje, transakcje, refundy i faktury VAT',
      path: '/admin/billing',
      icon: '💰',
      color: 'success' as const,
      stats: { label: 'MRR', value: '€45k', trend: '+12%' }
    },
    {
      title: 'Analityka & Raporty',
      description: 'Dashboard analytics, KPI tracking, custom reports',
      path: '/admin/analytics',
      icon: '📊',
      color: 'premium' as const,
      stats: { label: 'Daily Active Users', value: '1.8k', trend: '+15%' }
    },
    {
      title: 'Bezpieczeństwo & Logi',
      description: 'Activity logs, security alerts, IP blocking, 2FA',
      path: '/admin/security',
      icon: '🛡️',
      color: 'cyber' as const,
      stats: { label: 'Security Events', value: '23', trend: '-5 resolved' }
    },
    {
      title: 'Baza Danych & Backup',
      description: 'Database management, backups, imports, exports',
      path: '/admin/database',
      icon: '💾',
      color: 'success' as const,
      stats: { label: 'Backup Size', value: '2.4GB', trend: 'Auto enabled' }
    },
    {
      title: 'Email Marketing',
      description: 'Campaigns, templates, newsletters, automation',
      path: '/admin/email-marketing',
      icon: '📧',
      color: 'premium' as const,
      stats: { label: 'Open Rate', value: '42%', trend: '+8%' }
    },
    {
      title: 'SEO & Meta Tags',
      description: 'Meta descriptions, keywords, sitemaps, redirects',
      path: '/admin/seo',
      icon: '🔍',
      color: 'cyber' as const,
      stats: { label: 'Organic Traffic', value: '12.5k', trend: '+18%' }
    },
    {
      title: 'Blog & Content CMS',
      description: 'Articles, categories, authors, media library',
      path: '/admin/blog',
      icon: '✍️',
      color: 'success' as const,
      stats: { label: 'Published Posts', value: '87', trend: '+12 ten miesiąc' }
    },
    {
      title: 'Ustawienia Systemu',
      description: 'Configuration, API keys, integrations, permissions',
      path: '/admin/settings',
      icon: '⚙️',
      color: 'premium' as const,
      stats: { label: 'Integrations', value: '15', trend: 'All active' }
    }
  ];

  const quickActions = [
    { icon: '➕', label: 'Dodaj Pracownika', onClick: () => alert('Opening worker form...'), color: 'success' as const },
    { icon: '📧', label: 'Wyślij Newsletter', onClick: () => alert('Opening email composer...'), color: 'cyber' as const },
    { icon: '📊', label: 'Generuj Raport', onClick: () => alert('Opening report generator...'), color: 'premium' as const },
    { icon: '💰', label: 'Przetwórz Płatności', onClick: () => alert('Opening billing...'), color: 'success' as const },
  ];

  return (
    <div className="min-h-screen bg-primary-dark relative overflow-hidden">
      {/* Cosmic Background Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-accent-cyber/20 rounded-full blur-[150px] animate-pulse"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-accent-techGreen/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-neonPurple/10 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Header */}
      <div className="bg-gradient-glass backdrop-blur-md shadow-glow-cyber border-b border-accent-cyber/20 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white font-heading mb-2 animate-glow">🚀 Panel Administratora</h1>
              <p className="text-lg text-neutral-300">Witaj w panelu zarządzania platformą ZZP Werkplaats - wszystko w jednym miejscu</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <div className="bg-gradient-glass backdrop-blur-md border border-accent-cyber/30 rounded-xl p-2 flex gap-2">
                {(['today', 'week', 'month', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      timeRange === range
                        ? 'bg-accent-cyber text-white shadow-glow-cyber'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {range === 'today' ? 'Dziś' : range === 'week' ? 'Tydzień' : range === 'month' ? 'Miesiąc' : 'Rok'}
                  </button>
                ))}
              </div>
              <button className="bg-accent-neonPurple hover:bg-accent-neonPurple/80 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all shadow-glow-premium">
                ⚙️ Ustawienia
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Quick Actions */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white font-heading">⚡ Szybkie Akcje</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, idx) => (
              <QuickAction key={idx} {...action} />
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 font-heading">📈 Statystyki Kluczowe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Oczekujące terminy"
              value="8"
              change="+25%"
              changeType="positive"
              icon="📅"
              color="cyber"
            />
            <StatCard
              title="Aktywni pracownicy"
              value="245"
              change="+12 ten tydzień"
              changeType="positive"
              icon="👷"
              color="success"
            />
            <StatCard
              title="Aktywne firmy"
              value="89"
              change="+5 ten miesiąc"
              changeType="positive"
              icon="🏢"
              color="premium"
            />
            <StatCard
              title="Testy w tym tygodniu"
              value="23"
              change="75 slotów dostępnych"
              changeType="neutral"
              icon="✅"
              color="success"
            />
            <StatCard
              title="Miesięczny przychód (MRR)"
              value="€45k"
              change="+12%"
              changeType="positive"
              icon="💰"
              color="success"
            />
            <StatCard
              title="Daily Active Users"
              value="1.8k"
              change="+15%"
              changeType="positive"
              icon="👥"
              color="cyber"
            />
            <StatCard
              title="Conversion Rate"
              value="3.2%"
              change="+0.8%"
              changeType="positive"
              icon="📊"
              color="premium"
            />
            <StatCard
              title="System Health"
              value="99.9%"
              change="All systems operational"
              changeType="positive"
              icon="🛡️"
              color="success"
            />
          </div>
        </div>

        {/* Modules Grid */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-6 font-heading">🎛️ Moduły zarządzania</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adminModules.map((module) => (
              <ModuleCard key={module.path} {...module} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Log */}
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-accent-cyber/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-heading">🕐 Ostatnia aktywność</h2>
              <button className="text-accent-cyber hover:text-accent-techGreen transition-colors text-sm font-medium">
                Zobacz wszystko →
              </button>
            </div>
            <div className="space-y-4">
              {[
                { icon: '✅', color: 'bg-green-500', title: 'Test zaliczony - utworzono konto Worker', desc: 'Maria Silva • Malowanie • CERT-2025-001', time: '5 minut temu' },
                { icon: '📅', color: 'bg-blue-500', title: 'Nowe zgłoszenie na test', desc: 'Jan Kowalski • Murarz/Tynkarz • 10 paź 09:00', time: '15 minut temu' },
                { icon: '🏢', color: 'bg-purple-500', title: 'Nowa rejestracja pracodawcy', desc: 'BuildCo Amsterdam BV • Plan Pro (€99/mies.)', time: '1 godzinę temu' },
                { icon: '📜', color: 'bg-orange-500', title: 'Wysłano certyfikat email', desc: 'CERT-2025-002 • Ahmed Hassan • Elektryk', time: '2 godziny temu' },
                { icon: '💰', color: 'bg-green-600', title: 'Płatność otrzymana', desc: 'Rotterdam Construction Ltd • €99.00 • Pro Plan', time: '3 godziny temu' }
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-white/10 last:border-0 group hover:bg-white/5 p-3 rounded-xl transition-all">
                  <div className={`flex-shrink-0 w-12 h-12 ${activity.color} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-1">{activity.title}</p>
                    <p className="text-sm text-neutral-400 mb-1">{activity.desc}</p>
                    <p className="text-xs text-accent-cyber">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl shadow-3d border border-accent-techGreen/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-heading">🛡️ Status Systemu</h2>
              <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { service: 'API Server', status: 'online', uptime: '99.9%', response: '45ms' },
                { service: 'Database', status: 'online', uptime: '100%', response: '12ms' },
                { service: 'File Storage', status: 'online', uptime: '99.8%', response: '89ms' },
                { service: 'Email Service', status: 'online', uptime: '99.7%', response: '234ms' },
                { service: 'Payment Gateway', status: 'online', uptime: '100%', response: '156ms' },
                { service: 'CDN', status: 'online', uptime: '99.9%', response: '23ms' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">{item.service}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-neutral-400">Uptime: <span className="text-accent-techGreen">{item.uptime}</span></span>
                    <span className="text-neutral-400">Response: <span className="text-accent-cyber">{item.response}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
