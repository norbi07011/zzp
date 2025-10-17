import { useState } from 'react';
import { Link } from 'react-router-dom';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface SearchHistory {
  id: string;
  date: string;
  category: string;
  level: string;
  resultsCount: number;
}

interface SavedWorker {
  id: string;
  name: string;
  photo: string;
  category: string;
  rate: number;
  rating: number;
}

interface Message {
  id: string;
  from: string;
  subject: string;
  date: string;
  unread: boolean;
}

// Mock data
const MOCK_STATS: StatCard[] = [
  {
    label: 'Wyszukiwania w tym miesiącu',
    value: 87,
    icon: 'search',
    color: 'bg-blue-500'
  },
  {
    label: 'Zapisani pracownicy',
    value: 8,
    icon: 'bookmark',
    color: 'bg-orange-500'
  },
  {
    label: 'Kontakty w tym miesiącu',
    value: 12,
    icon: 'message',
    color: 'bg-green-500'
  },
  {
    label: 'Dni do końca subskrypcji',
    value: 23,
    icon: 'calendar',
    color: 'bg-purple-500'
  }
];

const MOCK_SEARCH_HISTORY: SearchHistory[] = [
  {
    id: '1',
    date: '2025-01-28',
    category: 'Elektryk SEP',
    level: 'Senior',
    resultsCount: 12
  },
  {
    id: '2',
    date: '2025-01-27',
    category: 'Malowanie',
    level: 'Mid',
    resultsCount: 24
  },
  {
    id: '3',
    date: '2025-01-25',
    category: 'Hydraulik/HVAC',
    level: 'Senior',
    resultsCount: 8
  },
  {
    id: '4',
    date: '2025-01-24',
    category: 'Murarz/Tynkarz',
    level: 'Junior',
    resultsCount: 18
  },
  {
    id: '5',
    date: '2025-01-22',
    category: 'Cieśla/Dekarz',
    level: 'Mid',
    resultsCount: 15
  }
];

const MOCK_SAVED_WORKERS: SavedWorker[] = [
  {
    id: '1',
    name: 'Maria Silva',
    photo: 'https://i.pravatar.cc/150?img=1',
    category: 'Malowanie',
    rate: 45,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Jan Kowalski',
    photo: 'https://i.pravatar.cc/150?img=2',
    category: 'Murarz/Tynkarz',
    rate: 40,
    rating: 4.6
  },
  {
    id: '3',
    name: 'Ahmed Hassan',
    photo: 'https://i.pravatar.cc/150?img=3',
    category: 'Elektryk SEP',
    rate: 55,
    rating: 4.9
  },
  {
    id: '4',
    name: 'Peter van Dam',
    photo: 'https://i.pravatar.cc/150?img=4',
    category: 'Hydraulik/HVAC',
    rate: 50,
    rating: 4.7
  },
  {
    id: '5',
    name: 'Sofia Rodriguez',
    photo: 'https://i.pravatar.cc/150?img=5',
    category: 'Stolarka',
    rate: 42,
    rating: 4.5
  },
  {
    id: '6',
    name: 'Piotr Nowak',
    photo: 'https://i.pravatar.cc/150?img=6',
    category: 'Sucha zabudowa',
    rate: 38,
    rating: 4.4
  }
];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    from: 'Maria Silva',
    subject: 'Odpowiedź na zapytanie o projekt',
    date: '2025-01-28',
    unread: true
  },
  {
    id: '2',
    from: 'Ahmed Hassan',
    subject: 'Dostępność na luty',
    date: '2025-01-27',
    unread: true
  },
  {
    id: '3',
    from: 'ZZP Werkplaats Support',
    subject: 'Nowe funkcje w platformie',
    date: '2025-01-26',
    unread: false
  }
];

export const EmployerDashboard = () => {
  const [stats] = useState<StatCard[]>(MOCK_STATS);
  const [searchHistory] = useState<SearchHistory[]>(MOCK_SEARCH_HISTORY);
  const [savedWorkers] = useState<SavedWorker[]>(MOCK_SAVED_WORKERS);
  const [messages] = useState<Message[]>(MOCK_MESSAGES);

  const unreadCount = messages.filter(m => m.unread).length;

  const handleQuickSearch = () => {
    window.location.href = '/employer/search';
  };

  const handleViewSubscription = () => {
    window.location.href = '/employer/subscription';
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@zzpwerkplaats.nl?subject=Wsparcie dla pracodawcy';
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel pracodawcy</h1>
          <p className="mt-2 text-gray-600">Witamy ponownie! Zarządzaj swoimi pracownikami i projektami</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
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
              
              <div className="space-y-4">
                {searchHistory.map(search => (
                  <div key={search.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{search.category}</p>
                        <p className="text-sm text-gray-600">
                          Poziom: {search.level} • {search.resultsCount} wyników
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{new Date(search.date).toLocaleDateString('pl-PL')}</p>
                        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-1">
                          Powtórz
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedWorkers.map(worker => (
                  <div key={worker.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={worker.photo} 
                        alt={worker.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{worker.name}</p>
                        <p className="text-sm text-gray-600">{worker.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">€{worker.rate}/h</span>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">{worker.rating}</span>
                      </div>
                    </div>
                    <button className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                      Kontakt
                    </button>
                  </div>
                ))}
              </div>
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
              
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`border-b border-gray-100 pb-4 last:border-0 last:pb-0 ${
                      message.unread ? 'bg-orange-50 -mx-4 px-4 py-2' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className={`text-sm ${message.unread ? 'font-bold' : 'font-medium'} text-gray-900`}>
                        {message.from}
                      </p>
                      {message.unread && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{message.subject}</p>
                    <p className="text-xs text-gray-500">{new Date(message.date).toLocaleDateString('pl-PL')}</p>
                  </div>
                ))}
              </div>
              
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
