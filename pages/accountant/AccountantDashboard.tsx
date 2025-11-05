import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { getAccountantByProfileId, type Accountant } from '../../src/services/accountantService';
import { DashboardHeader } from '../../components/DashboardComponents';
import { ProjectCommunicationManager } from '../../components/ProjectCommunicationManager';
import FeedPage from '../FeedPage';
import { 
  FileText, 
  Briefcase, 
  ClipboardList, 
  User, 
  Settings, 
  Bell, 
  Star, 
  Calendar,
  MapPin
} from '../../components/icons';

type View = 'feed' | 'submissions' | 'services' | 'forms' | 'profile' | 'settings' | 'communication';

export default function AccountantDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<View>('feed');
  const [accountant, setAccountant] = useState<Accountant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCommunicationOpen, setIsCommunicationOpen] = useState(false);

  useEffect(() => {
    loadAccountant();
  }, [user]);

  const loadAccountant = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const data = await getAccountantByProfileId(user.id);

      if (!data) {
        console.error('No accountant profile found');
        navigate('/');
        return;
      }

      setAccountant(data);
    } catch (error) {
      console.error('Error loading accountant:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!accountant) {
    return null;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'feed':
        return <FeedPage />;
      
      case 'submissions':
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">📋 Zgłoszenia Klientów</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Jan Kowalski - PIT 2024</h3>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Oczekuje
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Złożono: 15 stycznia 2025</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                      Akceptuj
                    </button>
                    <button className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
                      Szczegóły
                    </button>
                  </div>
                </div>
                
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Anna Nowak - Księgowość miesięczna</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Zaakceptowane
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Złożono: 10 stycznia 2025</p>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    Zobacz
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'services':
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">💼 Moje Usługi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <FileText className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">PIT 2024</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Rozliczenie roczne PIT dla pracowników i przedsiębiorców
                </p>
                <p className="text-lg font-bold text-blue-600">od 150 PLN</p>
                <button className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                  Edytuj
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Briefcase className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Księgowość miesięczna</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Pełna obsługa księgowa małych firm
                </p>
                <p className="text-lg font-bold text-green-600">od 500 PLN/msc</p>
                <button className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                  Edytuj
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Calendar className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold mb-2">VAT</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Deklaracje VAT i rozliczenia
                </p>
                <p className="text-lg font-bold text-purple-600">od 200 PLN/msc</p>
                <button className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                  Edytuj
                </button>
              </div>
            </div>
            
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Dodaj Nową Usługę
            </button>
          </div>
        );
      
      case 'forms':
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">📝 Formularze Zgłoszeniowe</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600 mb-4">
                Zarządzaj formularzami zgłoszeniowymi dla swoich usług księgowych.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Formularz PIT</h3>
                    <p className="text-sm text-gray-600">10 pól, aktywny</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Edytuj
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Formularz VAT</h3>
                    <p className="text-sm text-gray-600">8 pól, aktywny</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Edytuj
                  </button>
                </div>
              </div>
              
              <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                + Utwórz Nowy Formularz
              </button>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">👤 Profil Księgowego</h2>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                ✏️ Edytuj Profil
              </button>
            </div>

            {/* Avatar and Cover Image */}
            {(accountant.cover_image_url || accountant.avatar_url) && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {accountant.cover_image_url && (
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
                    <img 
                      src={accountant.cover_image_url} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {accountant.avatar_url && (
                  <div className="px-6 pb-6">
                    <img 
                      src={accountant.avatar_url} 
                      alt={accountant.full_name}
                      className="w-32 h-32 rounded-full border-4 border-white -mt-16 shadow-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Personal & Company Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informacje Podstawowe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Imię i nazwisko:</span>
                  <p className="font-medium">{accountant.full_name}</p>
                </div>
                {accountant.company_name && (
                  <div>
                    <span className="text-gray-600 text-sm">Nazwa firmy:</span>
                    <p className="font-medium">{accountant.company_name}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 text-sm">Email:</span>
                  <p className="font-medium">{accountant.email}</p>
                </div>
                {accountant.phone && (
                  <div>
                    <span className="text-gray-600 text-sm">Telefon:</span>
                    <p className="font-medium">{accountant.phone}</p>
                  </div>
                )}
                {accountant.website && (
                  <div>
                    <span className="text-gray-600 text-sm">Strona WWW:</span>
                    <p className="font-medium">
                      <a 
                        href={accountant.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {accountant.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Numbers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Numery Rejestracyjne
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accountant.kvk_number && (
                  <div>
                    <span className="text-gray-600 text-sm">Numer KVK:</span>
                    <p className="font-medium">{accountant.kvk_number}</p>
                  </div>
                )}
                {accountant.btw_number && (
                  <div>
                    <span className="text-gray-600 text-sm">Numer BTW:</span>
                    <p className="font-medium">{accountant.btw_number}</p>
                  </div>
                )}
                {accountant.license_number && (
                  <div>
                    <span className="text-gray-600 text-sm">Numer Licencji:</span>
                    <p className="font-medium">{accountant.license_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Adres
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accountant.address && (
                  <div>
                    <span className="text-gray-600 text-sm">Ulica:</span>
                    <p className="font-medium">{accountant.address}</p>
                  </div>
                )}
                {accountant.postal_code && (
                  <div>
                    <span className="text-gray-600 text-sm">Kod pocztowy:</span>
                    <p className="font-medium">{accountant.postal_code}</p>
                  </div>
                )}
                {accountant.city && (
                  <div>
                    <span className="text-gray-600 text-sm">Miasto:</span>
                    <p className="font-medium">{accountant.city}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 text-sm">Kraj:</span>
                  <p className="font-medium">{accountant.country}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Informacje Zawodowe
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600 text-sm">Lata doświadczenia:</span>
                  <p className="font-medium">{accountant.years_experience} lat</p>
                </div>
                {accountant.specializations && accountant.specializations.length > 0 && (
                  <div>
                    <span className="text-gray-600 text-sm">Specjalizacje:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {accountant.specializations.map((spec, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {accountant.languages && accountant.languages.length > 0 && (
                  <div>
                    <span className="text-gray-600 text-sm">Języki:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {accountant.languages.map((lang, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {accountant.bio && (
                  <div>
                    <span className="text-gray-600 text-sm">O mnie:</span>
                    <p className="mt-2 text-gray-700 leading-relaxed">{accountant.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Statystyki
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {accountant.rating.toFixed(1)} ⭐
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {accountant.rating_count} opinii
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {accountant.total_clients}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Klientów</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {accountant.is_verified ? '✓' : '?'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {accountant.is_verified ? 'Zweryfikowany' : 'Niezweryfikowany'}
                  </p>
                </div>
              </div>
            </div>

            {/* Portfolio Images */}
            {accountant.portfolio_images && accountant.portfolio_images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Portfolio
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {accountant.portfolio_images.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt={`Portfolio ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg shadow hover:shadow-lg transition-shadow"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Status Konta
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    accountant.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {accountant.is_active ? '✓ Aktywny' : '✗ Nieaktywny'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Data utworzenia:</span>
                  <p className="font-medium">
                    {new Date(accountant.created_at).toLocaleDateString('pl-PL')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Ostatnia aktualizacja:</span>
                  <p className="font-medium">
                    {new Date(accountant.updated_at).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">⚙️ Ustawienia</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Powiadomienia</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span>Nowe zgłoszenia klientów</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Wiadomości email</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Powiadomienia SMS</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Prywatność</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span>Widoczny profil publiczny</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Pokaż oceny</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Konto</h3>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Wyloguj się
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'communication':
        return (
          <div className="max-w-6xl mx-auto">
            <ProjectCommunicationManager 
              userRole="accountant"
            />
          </div>
        );
      
      default:
        return (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">📋 Zgłoszenia Klientów</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600">Wybierz zakładkę aby zobaczyć zawartość.</p>
            </div>
          </div>
        );
    }
  };

  // Zakładki zarządzania profilem księgowego (z Tablicą na początku jak u pracownika)
  const profileTabs = [
    { id: 'feed', label: '📰 Tablica', icon: '📰' },
    { id: 'submissions', label: '📋 Zgłoszenia', icon: '📋' },
    { id: 'services', label: '💼 Usługi', icon: '💼' },
    { id: 'forms', label: '📝 Formularze', icon: '📝' },
    { id: 'communication', label: '💬 Komunikacja', icon: '💬' },
    { id: 'profile', label: '👤 Profil', icon: '👤' },
    { id: 'settings', label: '⚙️ Ustawienia', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <DashboardHeader
        title={`Dashboard - ${accountant.company_name || accountant.full_name}`}
        subtitle="Panel księgowego - zarządzaj klientami i usługami"
        icon="📊"
      >
        <button
          onClick={() => setIsCommunicationOpen(!isCommunicationOpen)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span>💬</span>
          Komunikacja
        </button>
      </DashboardHeader>

      {/* Communication Panel */}
      {isCommunicationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Komunikacja Projektowa</h3>
              <button
                onClick={() => setIsCommunicationOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Zamknij</span>
                ✕
              </button>
            </div>
            <div className="h-full overflow-auto">
              <ProjectCommunicationManager userRole="accountant" />
            </div>
          </div>
        </div>
      )}

      {/* Nawigacja zarządzania profilem księgowego */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 -mb-px overflow-x-auto">
            {profileTabs.map((tab) => {
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as View)}
                  className={`
                    flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  );
}
