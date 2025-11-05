/**
 * =====================================================
 * EMPLOYER ACCOUNTANT SEARCH PAGE
 * =====================================================
 * Podstrona dla pracodawców do wyszukiwania księgowych
 * Zintegrowana z panelem pracodawcy
 * Updated: 2025-01-28
 */

import { useState, useEffect } from 'react';
import { searchAccountants, type Accountant } from '../../src/services/accountantService';
import { 
  Star, 
  MapPin, 
  Briefcase,
  CheckCircleIcon,
  Award,
  Languages as LanguagesIcon,
  Phone,
  Mail,
  Globe
} from '../../components/icons';
import { LoadingOverlay } from '../../components/Loading';

const CITIES = [
  'Amsterdam',
  'Rotterdam',
  'Den Haag',
  'Utrecht',
  'Eindhoven',
  'Groningen',
  'Tilburg',
  'Almere',
  'Breda',
  'Nijmegen'
];

const SPECIALIZATIONS = [
  'Salarisadministratie',
  'BTW-aangifte',
  'Jaaraangifte',
  'Boekhouden',
  'Belastingadvies',
  'Bedrijfsadministratie',
  'Financiële planning',
  'ZZP-begeleiding'
];

const LANGUAGES = [
  'Nederlands',
  'English',
  'Polski',
  'Deutsch',
  'Français'
];

type SortOption = 'popular' | 'rating' | 'experience' | 'name';

export default function EmployerAccountantSearchPage() {
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadAccountants();
  }, []);

  const loadAccountants = async () => {
    try {
      setLoading(true);
      const result = await searchAccountants({
        // Pokaż tylko zweryfikowanych księgowych
        isVerified: true
      });
      setAccountants(result.accountants);
    } catch (error) {
      console.error('Error loading accountants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrowanie
  const filteredAccountants = accountants.filter(accountant => {
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesName = accountant.full_name.toLowerCase().includes(term);
      const matchesCompany = accountant.company_name?.toLowerCase().includes(term);
      const matchesCity = accountant.city?.toLowerCase().includes(term);
      if (!matchesName && !matchesCompany && !matchesCity) return false;
    }

    // City
    if (selectedCity && accountant.city !== selectedCity) return false;

    // Specializations
    if (selectedSpecializations.length > 0) {
      const hasSpecialization = selectedSpecializations.some(spec => 
        accountant.specializations.includes(spec)
      );
      if (!hasSpecialization) return false;
    }

    // Languages
    if (selectedLanguages.length > 0) {
      const hasLanguage = selectedLanguages.some(lang => 
        accountant.languages.includes(lang)
      );
      if (!hasLanguage) return false;
    }

    // Rating
    if (minRating > 0 && accountant.rating < minRating) return false;

    return true;
  });

  // Sortowanie
  const sortedAccountants = [...filteredAccountants].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return b.years_experience - a.years_experience;
      case 'name':
        return a.full_name.localeCompare(b.full_name);
      case 'popular':
      default:
        return b.total_clients - a.total_clients;
    }
  });

  // Paginacja
  const totalPages = Math.ceil(sortedAccountants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAccountants = sortedAccountants.slice(startIndex, startIndex + itemsPerPage);

  const handleSpecializationToggle = (spec: string) => {
    setSelectedSpecializations(prev => 
      prev.includes(spec) 
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
    setCurrentPage(1);
  };

  const handleLanguageToggle = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedSpecializations([]);
    setSelectedLanguages([]);
    setMinRating(0);
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Ładowanie księgowych..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧾 Wyszukaj księgowego
          </h1>
          <p className="text-lg text-gray-600">
            Znajdź zweryfikowanego księgowego dla swojej firmy
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtry - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtry</h3>
                {(searchTerm || selectedCity || selectedSpecializations.length > 0 || 
                  selectedLanguages.length > 0 || minRating > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    Wyczyść
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wyszukaj
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Imię, firma, miasto..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* City */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miasto
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Wszystkie miasta</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Specializations */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specjalizacje
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {SPECIALIZATIONS.map(spec => (
                    <label key={spec} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSpecializations.includes(spec)}
                        onChange={() => handleSpecializationToggle(spec)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Języki
                </label>
                <div className="space-y-2">
                  {LANGUAGES.map(lang => (
                    <label key={lang} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang)}
                        onChange={() => handleLanguageToggle(lang)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimalna ocena
                </label>
                <select
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value={0}>Dowolna ocena</option>
                  <option value={3}>3+ gwiazdki</option>
                  <option value={4}>4+ gwiazdki</option>
                  <option value={4.5}>4.5+ gwiazdki</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-gray-600">
                Znaleziono <span className="font-semibold">{filteredAccountants.length}</span> księgowych
              </p>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Sortuj według:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="popular">Popularności</option>
                  <option value="rating">Oceny</option>
                  <option value="experience">Doświadczenia</option>
                  <option value="name">Nazwiska</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {currentAccountants.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Brak wyników
                </h3>
                <p className="text-gray-600 mb-4">
                  Nie znaleziono księgowych spełniających wybrane kryteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Wyczyść filtry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentAccountants.map((accountant) => (
                  <div key={accountant.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-orange-600">
                            {accountant.full_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-1">
                            {accountant.full_name}
                            {accountant.is_verified && (
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            )}
                          </h3>
                          {accountant.company_name && (
                            <p className="text-sm text-gray-600">{accountant.company_name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rating & Experience */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {renderStars(accountant.rating)}
                        <span className="ml-1 text-sm text-gray-600">
                          ({accountant.rating_count})
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {accountant.years_experience} lat doświadczenia
                      </span>
                    </div>

                    {/* Location */}
                    {accountant.city && (
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {accountant.city}
                      </div>
                    )}

                    {/* Specializations */}
                    {accountant.specializations.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1 mb-2">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Specjalizacje:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {accountant.specializations.slice(0, 3).map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                          {accountant.specializations.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{accountant.specializations.length - 3} więcej
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {accountant.languages.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1 mb-2">
                          <LanguagesIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Języki:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {accountant.languages.slice(0, 3).map((lang, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {lang}
                            </span>
                          ))}
                          {accountant.languages.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{accountant.languages.length - 3} więcej
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>🏢 {accountant.total_clients} klientów</span>
                      <span>⭐ {accountant.rating.toFixed(1)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                        📧 Wyślij wiadomość
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        ❤️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Poprzednia
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-orange-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Następna
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}