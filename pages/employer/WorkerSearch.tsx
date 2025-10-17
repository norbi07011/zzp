import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { useToasts } from '../../contexts/ToastContext';
import { SubscriptionBadge } from '../../src/components/SubscriptionBadge';
import type { SubscriptionTier } from '../../src/types/subscription';

interface Worker {
  id: string;
  fullName: string;
  photo: string;
  categories: Array<{
    category: string;
    level: 'Junior' | 'Mid' | 'Senior';
    yearsExperience: number;
    preferredRate: number;
  }>;
  city: string;
  workLanguages: string[];
  rating: number;
  reviewsCount: number;
  certificateId: string;
  availability: 'active' | 'busy';
  // NEW: Subscription system
  subscription_tier: SubscriptionTier;
  zzp_certificate_issued: boolean;
  zzp_certificate_number: string | null;
  email?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
}

// Mock data - 15 categories z specyfikacji
const MOCK_WORKERS: Worker[] = [
  {
    id: '1',
    fullName: 'Maria Silva',
    photo: 'https://i.pravatar.cc/150?img=1',
    categories: [
      { category: 'malowanie', level: 'Senior', yearsExperience: 8, preferredRate: 45 }
    ],
    city: 'Amsterdam',
    workLanguages: ['nl', 'en', 'pl'],
    rating: 4.8,
    reviewsCount: 24,
    certificateId: 'CERT-2025-001',
    availability: 'active',
    // NEW: Subscription info
    subscription_tier: 'premium',
    zzp_certificate_issued: true,
    zzp_certificate_number: 'ZZP-20250001',
    email: 'maria.silva@example.com',
    phone: '+31 6 1234 5678',
    bio: 'Doświadczona malarka z 8-letnim stażem. Specjalizuję się w wysokiej jakości wykończeniach wewnętrznych i zewnętrznych. Perfekcjonistka z dbałością o szczegóły.',
    skills: ['Malowanie wewnętrzne', 'Elewacje', 'Tapetowanie', 'Szpachlowanie', 'Techniki dekoracyjne']
  },
  {
    id: '2',
    fullName: 'Jan Kowalski',
    photo: 'https://i.pravatar.cc/150?img=2',
    categories: [
      { category: 'murarz_tynkarz', level: 'Mid', yearsExperience: 5, preferredRate: 40 }
    ],
    city: 'Rotterdam',
    workLanguages: ['pl', 'nl'],
    rating: 4.6,
    reviewsCount: 18,
    certificateId: 'CERT-2025-002',
    availability: 'active',
    // NEW: Basic tier (bez certyfikatu)
    subscription_tier: 'basic',
    zzp_certificate_issued: false,
    zzp_certificate_number: null,
    email: 'jan.kowalski@example.com',
    phone: '+31 6 2345 6789',
    bio: 'Solidny murarz z 5-letnim doświadczeniem w Holandii. Pracowałem przy projektach mieszkaniowych i komercyjnych. Punktualny i rzetelny.',
    skills: ['Murowanie tradycyjne', 'Tynkowanie maszynowe', 'Ściany działowe', 'Elewacje', 'Izolacje']
  },
  {
    id: '3',
    fullName: 'Ahmed Hassan',
    photo: 'https://i.pravatar.cc/150?img=3',
    categories: [
      { category: 'elektryk', level: 'Senior', yearsExperience: 10, preferredRate: 55 }
    ],
    city: 'Utrecht',
    workLanguages: ['ar', 'nl', 'en'],
    rating: 4.9,
    reviewsCount: 32,
    certificateId: 'CERT-2025-003',
    availability: 'active',
    // NEW: Premium tier
    subscription_tier: 'premium',
    zzp_certificate_issued: true,
    zzp_certificate_number: 'ZZP-20250002',
    email: 'ahmed.hassan@example.com',
    phone: '+31 6 3456 7890',
    bio: 'Certyfikowany elektryk SEP z 10-letnim doświadczeniem. Specjalizuję się w instalacjach przemysłowych i inteligentnych systemach domowych.',
    skills: ['Instalacje elektryczne', 'SEP certyfikat', 'Smart home', 'Panele fotowoltaiczne', 'Rozdzielnie elektryczne']
  },
  {
    id: '4',
    fullName: 'Peter van Dam',
    photo: 'https://i.pravatar.cc/150?img=4',
    categories: [
      { category: 'hydraulik_hvac', level: 'Senior', yearsExperience: 12, preferredRate: 50 }
    ],
    city: 'Den Haag',
    workLanguages: ['nl', 'en'],
    rating: 4.7,
    reviewsCount: 28,
    certificateId: 'CERT-2025-004',
    availability: 'busy',
    // NEW: Premium tier
    subscription_tier: 'premium',
    zzp_certificate_issued: true,
    zzp_certificate_number: 'ZZP-2025-003',
    email: 'peter.vandam@example.com',
    phone: '+31 6 4567 8901',
    bio: 'Ekspert w zakresie instalacji sanitarnych i HVAC. 12 lat doświadczenia w projektach komercyjnych i mieszkaniowych. Znany z wysokiej jakości pracy.',
    skills: ['Instalacje wod-kan', 'Ogrzewanie podłogowe', 'Systemy HVAC', 'Pompy ciepła', 'Klimatyzacja']
  }
];

const BUILDING_CATEGORIES = [
  { value: 'murarz_tynkarz', label: 'Murarz/Tynkarz' },
  { value: 'ciesla_dekarz', label: 'Cieśla/Dekarz' },
  { value: 'elektryk', label: 'Elektryk SEP' },
  { value: 'hydraulik_hvac', label: 'Hydraulik/HVAC' },
  { value: 'malowanie', label: 'Malowanie' },
  { value: 'stolarka', label: 'Stolarka' },
  { value: 'sucha_zabudowa', label: 'Sucha zabudowa' },
  { value: 'ogrodzenia', label: 'Ogrodzenia/Bramy' },
  { value: 'kierownik', label: 'Kierownik budowy' },
  { value: 'posadzkarz', label: 'Posadzkarz' },
  { value: 'elewacje', label: 'Elewacje' },
  { value: 'fotowoltaika', label: 'Fotowoltaika' },
  { value: 'brukarz', label: 'Brukarz' },
  { value: 'glazurnik', label: 'Glazurnik' },
  { value: 'other', label: 'Inne' }
];

const WORK_LANGUAGES = [
  { value: 'nl', label: 'Nederlands' },
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'bg', label: 'Български' },
  { value: 'ar', label: 'العربية' },
  { value: 'de', label: 'Deutsch' },
  { value: 'hu', label: 'Magyar' },
  { value: 'fr', label: 'Français' }
];

export const WorkerSearch = () => {
  const { t } = useTranslation();
  const { success, error: showError } = useToasts();
  const [workers] = useState<Worker[]>(MOCK_WORKERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState<string[]>([]);
  const [filterCity, setFilterCity] = useState('');
  const [filterLanguages, setFilterLanguages] = useState<string[]>([]);
  const [rateMin, setRateMin] = useState(5);
  const [rateMax, setRateMax] = useState(200);
  // NEW: Subscription filter
  const [filterSubscriptionTier, setFilterSubscriptionTier] = useState<'all' | 'premium' | 'basic'>('all');
  const [savedWorkers, setSavedWorkers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const workersPerPage = 12;

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubject, setContactSubject] = useState('');

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || 
      worker.categories.some(cat => cat.category === filterCategory);
    
    const matchesLevel = filterLevel.length === 0 || 
      worker.categories.some(cat => filterLevel.includes(cat.level));
    
    const matchesCity = !filterCity || 
      worker.city.toLowerCase().includes(filterCity.toLowerCase());
    
    const matchesLanguages = filterLanguages.length === 0 || 
      filterLanguages.every(lang => worker.workLanguages.includes(lang));
    
    const matchesRate = worker.categories.some(cat => 
      cat.preferredRate >= rateMin && cat.preferredRate <= rateMax
    );

    // NEW: Subscription tier filter
    const matchesSubscription = filterSubscriptionTier === 'all' || 
      worker.subscription_tier === filterSubscriptionTier;

    return matchesSearch && matchesCategory && matchesLevel && matchesCity && matchesLanguages && matchesRate && matchesSubscription;
  });

  // NEW: Sort Premium first (when "all" selected)
  const sortedWorkers = filterSubscriptionTier === 'all'
    ? [...filteredWorkers].sort((a, b) => {
        if (a.subscription_tier === 'premium' && b.subscription_tier === 'basic') return -1;
        if (a.subscription_tier === 'basic' && b.subscription_tier === 'premium') return 1;
        return b.rating - a.rating; // Secondary sort by rating
      })
    : filteredWorkers;

  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = sortedWorkers.slice(indexOfFirstWorker, indexOfLastWorker);
  const totalPages = Math.ceil(sortedWorkers.length / workersPerPage);

  const toggleSaveWorker = (workerId: string) => {
    setSavedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleLevelChange = (level: string) => {
    setFilterLevel(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleLanguageChange = (lang: string) => {
    setFilterLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const handleOpenProfile = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsProfileModalOpen(true);
  };

  const handleOpenContact = (worker: Worker) => {
    setSelectedWorker(worker);
    setContactSubject(`Zapytanie o projekt - ${worker.fullName}`);
    setContactMessage('');
    setIsContactModalOpen(true);
  };

  const handleSendContact = () => {
    if (!contactSubject || !contactMessage) {
      showError('Proszę wypełnić wszystkie pola');
      return;
    }
    success(`✅ Wiadomość wysłana do ${selectedWorker?.fullName}!`);
    setIsContactModalOpen(false);
    setContactSubject('');
    setContactMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Wyszukiwarka Pracowników</h1>
          <p className="mt-2 text-gray-600">Znajdź wykwalifikowanych pracowników budowlanych z certyfikatami</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Filtry</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Szukaj</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Imię, nazwisko, miasto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Kategoria</label>
                <select
                  id="category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">Wszystkie kategorie</option>
                  {BUILDING_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <p className="block text-sm font-medium text-gray-700 mb-2">Poziom doświadczenia</p>
                {['Junior', 'Mid', 'Senior'].map(level => (
                  <label key={level} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={filterLevel.includes(level)}
                      onChange={() => handleLevelChange(level)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{level}</span>
                  </label>
                ))}
              </div>

              {/* City */}
              <div className="mb-6">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">Miasto</label>
                <input
                  id="city"
                  type="text"
                  placeholder="np. Amsterdam"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Languages */}
              <div className="mb-6">
                <p className="block text-sm font-medium text-gray-700 mb-2">Języki pracy</p>
                <div className="max-h-40 overflow-y-auto">
                  {WORK_LANGUAGES.map(lang => (
                    <label key={lang.value} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={filterLanguages.includes(lang.value)}
                        onChange={() => handleLanguageChange(lang.value)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{lang.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subscription Tier */}
              <div className="mb-6">
                <label htmlFor="subscription-tier" className="block text-sm font-medium text-gray-700 mb-2">Typ subskrypcji</label>
                <select
                  id="subscription-tier"
                  value={filterSubscriptionTier}
                  onChange={(e) => setFilterSubscriptionTier(e.target.value as 'all' | 'premium' | 'basic')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">Wszyscy pracownicy</option>
                  <option value="premium">🏆 Premium - Zweryfikowani</option>
                  <option value="basic">🔵 Basic Members</option>
                </select>
              </div>

              {/* Hourly Rate */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stawka godzinowa: €{rateMin} - €{rateMax}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="5"
                    max="200"
                    value={rateMin}
                    onChange={(e) => setRateMin(Number(e.target.value))}
                    className="w-full"
                    aria-label="Minimalna stawka godzinowa"
                  />
                  <input
                    type="range"
                    min="5"
                    max="200"
                    value={rateMax}
                    onChange={(e) => setRateMax(Number(e.target.value))}
                    className="w-full"
                    aria-label="Maksymalna stawka godzinowa"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterLevel([]);
                  setFilterCity('');
                  setFilterLanguages([]);
                  setRateMin(5);
                  setRateMax(200);
                  setFilterSubscriptionTier('all');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Wyczyść filtry
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Premium Workers Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Premium ZZP'ers zichtbaar
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    U ziet alleen gecertificeerde ZZP'ers met een Premium abonnement. Deze professionals hebben hun expertise laten toetsen en zijn volledig geverifieerd.
                  </p>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-700">
                  Znaleziono <span className="font-bold">{filteredWorkers.length}</span> pracowników
                </p>
                <p className="text-sm text-gray-500">
                  Zapisanych: <span className="font-medium">{savedWorkers.length}</span>
                </p>
              </div>
            </div>

            {/* Workers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {currentWorkers.map(worker => (
                <div key={worker.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                  {/* Photo & Name */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={worker.photo} 
                        alt={worker.fullName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">{worker.fullName}</h3>
                        <p className="text-sm text-gray-600">{worker.city}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaveWorker(worker.id)}
                      className={`p-2 rounded-full ${
                        savedWorkers.includes(worker.id)
                          ? 'text-orange-600 bg-orange-100'
                          : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                      aria-label={savedWorkers.includes(worker.id) ? 'Usuń z zapisanych' : 'Zapisz pracownika'}
                    >
                      <svg className="w-6 h-6" fill={savedWorkers.includes(worker.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>

                  {/* Subscription Badge */}
                  <div className="mb-4">
                    <SubscriptionBadge 
                      tier={worker.subscription_tier}
                      certificateNumber={worker.zzp_certificate_number}
                      size="sm"
                    />
                  </div>

                  {/* Availability Status */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      worker.availability === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {worker.availability === 'active' ? '✓ Aktywny' : '✗ Zajęty'}
                    </span>
                  </div>

                  {/* Categories */}
                  {worker.categories.map((cat, idx) => (
                    <div key={idx} className="mb-3">
                      <p className="text-sm font-medium text-gray-900">
                        {BUILDING_CATEGORIES.find(c => c.value === cat.category)?.label || cat.category}
                      </p>
                      <p className="text-xs text-gray-600">
                        {cat.level} • {cat.yearsExperience}+ lat • €{cat.preferredRate}/h
                      </p>
                    </div>
                  ))}

                  {/* Languages */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500">
                      Języki: {worker.workLanguages.map(l => l.toUpperCase()).join(', ')}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-sm font-medium text-gray-900">{worker.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({worker.reviewsCount} opinii)</span>
                  </div>

                  {/* Certificate */}
                  <p className="text-xs text-gray-500 mb-4">
                    Certyfikat: <span className="font-mono">{worker.certificateId}</span>
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenContact(worker)}
                      disabled={worker.availability === 'busy'}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm ${
                        worker.availability === 'busy'
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      {worker.availability === 'busy' ? 'Niedostępny' : 'Kontakt'}
                    </button>
                    <button 
                      onClick={() => handleOpenProfile(worker)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Profil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Poprzednia
                </button>
                <span className="text-sm text-gray-700">
                  Strona {currentPage} z {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Następna
                </button>
              </div>
            )}

            {filteredWorkers.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">Nie znaleziono pracowników spełniających kryteria.</p>
                <p className="text-gray-400 text-sm mt-2">Spróbuj zmienić filtry wyszukiwania.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Worker Profile */}
      {selectedWorker && (
        <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title={selectedWorker.fullName} size="xl">
          <div className="space-y-6">
            {/* Header with photo and basic info */}
            <div className="flex items-start gap-6 pb-6 border-b">
              <img 
                src={selectedWorker.photo} 
                alt={selectedWorker.fullName}
                className="w-32 h-32 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedWorker.fullName}</h3>
                <p className="text-gray-600 mb-3">📍 {selectedWorker.city}</p>
                <div className="flex items-center gap-4 mb-3">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    selectedWorker.availability === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedWorker.availability === 'active' ? '✓ Dostępny' : '✗ Zajęty'}
                  </span>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 font-medium text-gray-900">{selectedWorker.rating}</span>
                    <span className="ml-1 text-sm text-gray-500">({selectedWorker.reviewsCount} opinii)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedWorker.bio && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">O mnie</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedWorker.bio}</p>
              </div>
            )}

            {/* Categories & Rates */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Specjalizacje</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedWorker.categories.map((cat, idx) => (
                  <div key={idx} className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-blue-900">
                      {BUILDING_CATEGORIES.find(c => c.value === cat.category)?.label || cat.category}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Poziom: <span className="font-semibold">{cat.level}</span>
                    </p>
                    <p className="text-sm text-blue-700">
                      Doświadczenie: <span className="font-semibold">{cat.yearsExperience}+ lat</span>
                    </p>
                    <p className="text-lg font-bold text-blue-900 mt-2">
                      €{cat.preferredRate}/h
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            {selectedWorker.skills && selectedWorker.skills.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Umiejętności</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWorker.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Języki pracy</h4>
              <div className="flex flex-wrap gap-2">
                {selectedWorker.workLanguages.map((lang, idx) => (
                  <span key={idx} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                    {WORK_LANGUAGES.find(l => l.value === lang)?.label || lang.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Dane kontaktowe</h4>
              <p className="text-sm text-orange-800">📧 {selectedWorker.email}</p>
              <p className="text-sm text-orange-800">📱 {selectedWorker.phone}</p>
              <p className="text-sm text-orange-800 mt-2">🔖 Certyfikat: <span className="font-mono">{selectedWorker.certificateId}</span></p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setIsProfileModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Zamknij
            </button>
            {selectedWorker.availability === 'active' && (
              <button 
                onClick={() => {
                  setIsProfileModalOpen(false);
                  handleOpenContact(selectedWorker);
                }}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                📨 Wyślij wiadomość
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL: Contact Worker */}
      {selectedWorker && (
        <Modal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} title={`Kontakt: ${selectedWorker.fullName}`} size="lg">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Wskazówka:</strong> Napisz konkretną wiadomość opisującą projekt, lokalizację i czas trwania. Zwiększysz szanse na szybką odpowiedź!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temat *</label>
              <input 
                type="text"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="np. Projekt wykończenia apartamentów - Amsterdam"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wiadomość *</label>
              <textarea 
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={8}
                placeholder={`Cześć ${selectedWorker.fullName},\n\nJestem zainteresowany Twoimi usługami. Mam projekt...\n\nLokalizacja: \nCzas trwania: \nBudżet: €/h\n\nMogę omówić szczegóły telefonicznie lub osobiście.\n\nPozdrawiam`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">{contactMessage.length} znaków</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Pracownik otrzyma:</strong>
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>✓ Email z Twoją wiadomością</li>
                <li>✓ Twoje dane kontaktowe (z profilu firmy)</li>
                <li>✓ Link do Twojego profilu pracodawcy</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setIsContactModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button 
              onClick={handleSendContact}
              className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
            >
              📨 Wyślij wiadomość
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
