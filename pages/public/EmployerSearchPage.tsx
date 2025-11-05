import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingOverlay } from '../../components/Loading';
import { MapPin, Briefcase, Star, User } from '../../components/icons';
import { AddToTeamButton } from '../../components/AddToTeamButton';
import { useAuth } from '../../contexts/AuthContext';

interface Employer {
  id: string;
  company_name: string | null;
  industry: string | null;
  company_size: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  verified: boolean;
  created_at: string;
  // Dodatkowe kolumny z bazy
  profile_id: string;
  kvk_number: string | null;
  subscription_tier: string;
  subscription_status: string;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  avg_rating: number | null;
  rating: number | null;
  rating_count: number | null;
}

export default function EmployerSearchPage() {
  const { user: authUser } = useAuth();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    loadEmployers();
  }, []);

  const loadEmployers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEmployers((data || []) as any);
    } catch (error) {
      console.error('Error loading employers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployers = employers.filter(employer => {
    const matchesSearch = !searchQuery || 
      employer.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employer.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = !industryFilter || employer.industry === industryFilter;

    return matchesSearch && matchesIndustry;
  });

  const industries = Array.from(new Set(employers.map(e => e.industry).filter(Boolean))) as string[];

  if (loading) {
    return <LoadingOverlay isLoading={true} message="Ładowanie pracodawców..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Znajdź Pracodawcę</h1>
          <p className="text-gray-600">Przeglądaj firmy i oferty pracy</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Szukaj
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nazwa firmy, opis..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branża
              </label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Wszystkie branże</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Znaleziono {filteredEmployers.length} {filteredEmployers.length === 1 ? 'pracodawcę' : 'pracodawców'}
          </div>
        </div>

        {/* Employers Grid */}
        {filteredEmployers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Briefcase className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Brak wyników
            </h3>
            <p className="text-gray-600">
              Nie znaleziono pracodawców spełniających kryteria wyszukiwania.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployers.map((employer) => (
              <div
                key={employer.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
              >
                {/* Logo/Header */}
                <div className="h-32 bg-gradient-to-br from-amber-500 to-orange-600 relative">
                  {employer.logo_url ? (
                    <img 
                      src={employer.logo_url} 
                      alt={employer.company_name || 'Company logo'}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Briefcase className="w-12 h-12 text-white opacity-50" />
                    </div>
                  )}
                  {employer.verified && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      ✓ Zweryfikowany
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <Link
                    to={`/employer/${employer.id}`}
                    className="block"
                  >
                    <h3 className="text-lg font-bold text-gray-900 hover:text-amber-600 transition-colors">
                      {employer.company_name || 'Nazwa firmy niedostępna'}
                    </h3>
                  </Link>

                  {employer.industry && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{employer.industry}</span>
                    </div>
                  )}

                  {employer.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{employer.city}{employer.country ? `, ${employer.country}` : ''}</span>
                    </div>
                  )}

                  {employer.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {employer.description}
                    </p>
                  )}

                  {employer.company_size && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{employer.company_size}</span>
                    </div>
                  )}

                  {/* Add to Team Button - visible for accountant/employer */}
                  {authUser?.role === 'accountant' && employer.profile_id && employer.contact_email && (
                    <div className="pt-3 border-t border-gray-100">
                      <AddToTeamButton 
                        userId={employer.profile_id}
                        userEmail={employer.contact_email}
                        userType="employer"
                        displayName={employer.company_name || employer.contact_person || employer.contact_email}
                        avatarUrl={employer.logo_url || undefined}
                        className="w-full text-sm py-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
