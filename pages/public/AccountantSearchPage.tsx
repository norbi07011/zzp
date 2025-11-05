import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchAccountants, type Accountant } from '../../src/services/accountantService';
import { 
  Star, 
  MapPin, 
  Briefcase,
  CheckCircleIcon,
  Award,
  Languages as LanguagesIcon
} from '../../components/icons';
import { LoadingOverlay } from '../../components/Loading';
import { AddToTeamButton } from '../../components/AddToTeamButton';

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

export default function AccountantSearchPage() {
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
        // Bez filtrów - pokaż wszystkich aktywnych
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
      case 'popular':
        return b.total_clients - a.total_clients;
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return b.years_experience - a.years_experience;
      case 'name':
        return a.full_name.localeCompare(b.full_name);
      default:
        return 0;
    }
  });

  // Paginacja
  const totalPages = Math.ceil(sortedAccountants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccountants = sortedAccountants.slice(startIndex, startIndex + itemsPerPage);

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
    setCurrentPage(1);
  };

  const toggleLanguage = (lang: string) => {
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

  const hasActiveFilters = searchTerm || selectedCity || selectedSpecializations.length > 0 || 
                           selectedLanguages.length > 0 || minRating > 0;

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Boekhouders laden..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vind jouw boekhouder</h1>
          <p className="text-lg text-gray-600">
            {sortedAccountants.length} {sortedAccountants.length === 1 ? 'boekhouder' : 'boekhouders'} beschikbaar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Wissen
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoeken
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Naam, bedrijf, stad..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* City */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locatie
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Alle steden</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Specializations */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialisaties
                </label>
                <div className="space-y-2">
                  {SPECIALIZATIONS.map(spec => (
                    <label key={spec} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSpecializations.includes(spec)}
                        onChange={() => toggleSpecialization(spec)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Talen
                </label>
                <div className="space-y-2">
                  {LANGUAGES.map(lang => (
                    <label key={lang} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang)}
                        onChange={() => toggleLanguage(lang)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimale beoordeling
                </label>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => {
                          setMinRating(rating);
                          setCurrentPage(1);
                        }}
                        className="border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-700">{rating}+</span>
                      </span>
                    </label>
                  ))}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === 0}
                      onChange={() => {
                        setMinRating(0);
                        setCurrentPage(1);
                      }}
                      className="border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Alle</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sorteren op:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="popular">Populariteit</option>
                  <option value="rating">Hoogste beoordeling</option>
                  <option value="experience">Meeste ervaring</option>
                  <option value="name">Naam (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Accountant Grid */}
            {paginatedAccountants.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Briefcase className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Geen boekhouders gevonden
                </h3>
                <p className="text-gray-600 mb-4">
                  Probeer je zoekopdracht aan te passen of filters te wissen
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Wis alle filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedAccountants.map((accountant) => (
                    <Link
                      key={accountant.id}
                      to={`/accountant/profile/${accountant.id}`}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {accountant.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {accountant.full_name}
                          </h3>
                          {accountant.company_name && (
                            <p className="text-sm text-gray-600 truncate">{accountant.company_name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {accountant.is_verified && (
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            )}
                            {accountant.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium text-gray-900">
                                  {accountant.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({accountant.rating_count})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      {accountant.city && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{accountant.city}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Award className="w-4 h-4" />
                        <span>{accountant.years_experience} jaar ervaring</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Briefcase className="w-4 h-4" />
                        <span>{accountant.total_clients} klanten</span>
                      </div>

                      {/* Specializations */}
                      {accountant.specializations.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1.5">
                            {accountant.specializations.slice(0, 3).map((spec, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full"
                              >
                                {spec}
                              </span>
                            ))}
                            {accountant.specializations.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{accountant.specializations.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {accountant.languages.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <LanguagesIcon className="w-4 h-4" />
                          <span className="truncate">
                            {accountant.languages.slice(0, 2).join(', ')}
                            {accountant.languages.length > 2 && ` +${accountant.languages.length - 2}`}
                          </span>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                        <Link 
                          to={`/accountant/profile/${accountant.id}`}
                          className="block text-sm font-medium text-amber-600 hover:text-amber-700"
                        >
                          Bekijk profiel →
                        </Link>
                        
                        {/* ✅ NEW: Add to Team Button */}
                        <AddToTeamButton 
                          userId={accountant.profile_id || accountant.id}
                          userEmail={accountant.email}
                          userType="accountant"
                          displayName={accountant.full_name}
                          className="w-full text-sm"
                        />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Vorige
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-amber-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Volgende
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
