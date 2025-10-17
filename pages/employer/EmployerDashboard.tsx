/**
 * =====================================================
 * EMPLOYER DASHBOARD - Full Backend Integration
 * =====================================================
 * Updated: 2025-01-13
 * Features: Real-time data from Supabase, no MOCK data
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import employerService, {
  type EmployerStats,
  type SearchHistoryItem,
  type SavedWorker,
  type Message,
} from '../../services/employerService';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export const EmployerDashboard = () => {
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employerId, setEmployerId] = useState<string | null>(null);
  
  // Data state
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedWorkers, setSavedWorkers] = useState<SavedWorker[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // =====================================================
  // DATA LOADING
  // =====================================================

  useEffect(() => {
    console.log('[EMPLOYER-DASH] useEffect triggered, user:', { has_user: !!user, user_id: user?.id, role: user?.role });
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    console.log('[EMPLOYER-DASH] loadDashboardData called, user.id:', user?.id);
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Get employer profile to get employer_id
      console.log('[EMPLOYER-DASH] Fetching employer profile...');
      const employer = await employerService.getEmployerByUserId(user.id);
      console.log('[EMPLOYER-DASH] Employer profile:', { has_employer: !!employer, employer_id: employer?.id });
      
      if (!employer) {
        console.error('[EMPLOYER-DASH] No employer profile found!');
        setError('Employer profile not found. Please complete your profile.');
        setLoading(false);
        return;
      }

      setEmployerId(employer.id);

      // 2. Load all dashboard data in parallel
      console.log('[EMPLOYER-DASH] Loading dashboard data for employer:', employer.id);
      const [
        statsData,
        historyData,
        workersData,
        messagesData,
        unreadCountData,
      ] = await Promise.all([
        employerService.getEmployerStats(employer.id),
        employerService.getSearchHistory(employer.id, 5),
        employerService.getSavedWorkers(employer.id),
        employerService.getMessages(user.id, 3),
        employerService.getUnreadMessageCount(user.id),
      ]);

      console.log('[EMPLOYER-DASH] Data loaded:', { 
        has_stats: !!statsData, 
        history_count: historyData.length,
        saved_workers: workersData.length,
        messages_count: messagesData.length,
        unread: unreadCountData 
      });

      setStats(statsData);
      setSearchHistory(historyData);
      setSavedWorkers(workersData.slice(0, 6)); // Show max 6
      setMessages(messagesData);
      setUnreadCount(unreadCountData);

    } catch (err) {
      console.error('[EMPLOYER-DASH] Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      console.log('[EMPLOYER-DASH] Loading complete');
      setLoading(false);
    }
  };

  // =====================================================
  // STATS CARDS
  // =====================================================

  const getStatsCards = (): StatCard[] => {
    if (!stats) return [];

    return [
      {
        label: 'Wyszukiwania w tym miesiącu',
        value: stats.searches_this_month,
        icon: 'search',
        color: 'bg-blue-500'
      },
      {
        label: 'Zapisani pracownicy',
        value: stats.total_saved_workers,
        icon: 'bookmark',
        color: 'bg-orange-500'
      },
      {
        label: 'Kontakty w tym miesiącu',
        value: stats.contacts_this_month,
        icon: 'message',
        color: 'bg-green-500'
      },
      {
        label: 'Dni do końca subskrypcji',
        value: stats.days_until_expiry > 0 ? stats.days_until_expiry : 0,
        icon: 'calendar',
        color: 'bg-purple-500'
      }
    ];
  };

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleQuickSearch = () => {
    window.location.href = '/employer/search';
  };

  const handleViewSubscription = () => {
    window.location.href = '/employer/subscription';
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@zzpwerkplaats.nl?subject=Wsparcie dla pracodawcy';
  };

  const handleRepeatSearch = async (searchId: string) => {
    // TODO: Implement repeat search with saved parameters
    console.log('Repeat search:', searchId);
  };

  const handleRemoveSavedWorker = async (savedWorkerId: string) => {
    const success = await employerService.removeSavedWorker(savedWorkerId);
    if (success) {
      setSavedWorkers(prev => prev.filter(w => w.id !== savedWorkerId));
      // Update stats
      if (stats) {
        setStats({ ...stats, total_saved_workers: stats.total_saved_workers - 1 });
      }
    }
  };

  // =====================================================
  // ICON COMPONENT
  // =====================================================

  const getIconSvg = (icon: string) => {
    switch (icon) {
      case 'search':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'bookmark':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
      case 'message':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Błąd ładowania</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  const statsCards = getStatsCards();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel pracodawcy</h1>
          <p className="mt-2 text-gray-600">
            Witamy ponownie, {user?.fullName || 'Pracodawco'}! Zarządzaj swoimi pracownikami i projektami
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {getIconSvg(stat.icon)}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Search History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Ostatnie wyszukiwania</h2>
                <Link 
                  to="/employer/search"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Nowe wyszukiwanie →
                </Link>
              </div>
              
              {searchHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Brak historii wyszukiwań</p>
                  <button
                    onClick={handleQuickSearch}
                    className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Rozpocznij pierwsze wyszukiwanie
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchHistory.map(search => (
                    <div key={search.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{search.category}</p>
                          <p className="text-sm text-gray-600">
                            {search.level && `Poziom: ${search.level} • `}
                            {search.results_count} wyników
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(search.search_date).toLocaleDateString('pl-PL')}
                          </p>
                          <button 
                            onClick={() => handleRepeatSearch(search.id)}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-1"
                          >
                            Powtórz
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Workers */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Zapisani pracownicy</h2>
                <Link 
                  to="/employer/search"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Zobacz wszystkich →
                </Link>
              </div>
              
              {savedWorkers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Brak zapisanych pracowników</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Zapisz pracowników podczas wyszukiwania, aby szybko do nich wrócić
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedWorkers.map(savedWorker => (
                    <div key={savedWorker.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors relative group">
                      <div className="flex items-start gap-3 mb-3">
                        <img 
                          src={savedWorker.worker.profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(savedWorker.worker.profile.full_name)}&background=f97316&color=fff`}
                          alt={savedWorker.worker.profile.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {savedWorker.worker.profile.full_name}
                          </p>
                          <p className="text-sm text-gray-600">{savedWorker.worker.specialization}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveSavedWorker(savedWorker.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          title="Usuń"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-900">€{savedWorker.worker.hourly_rate}/h</span>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm text-gray-600">{savedWorker.worker.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <button className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                        Kontakt
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Messages Preview */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Wiadomości</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              {messages.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Brak wiadomości</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`border-b border-gray-100 pb-4 last:border-0 last:pb-0 ${
                        !message.read ? 'bg-orange-50 -mx-4 px-4 py-2 rounded' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className={`text-sm ${!message.read ? 'font-bold' : 'font-medium'} text-gray-900`}>
                          {message.sender_profile.full_name}
                        </p>
                        {!message.read && (
                          <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1 truncate">{message.subject}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Zobacz wszystkie
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Szybkie akcje</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleQuickSearch}
                  className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Nowe wyszukiwanie
                </button>
                
                <button
                  onClick={handleViewSubscription}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Subskrypcja
                </button>
                
                <button
                  onClick={handleContactSupport}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Wsparcie
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
