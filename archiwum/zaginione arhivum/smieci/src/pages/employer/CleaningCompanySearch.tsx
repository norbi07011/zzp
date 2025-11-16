import React, { useState, useEffect } from 'react';
import { CleaningCompany, WeeklyAvailability, DayOfWeek, getDayShortLabel, getCleaningSpecializationLabel, countAvailableDays } from '../../../types';
import AvailabilityCalendar from '../../components/cleaning/AvailabilityCalendar';

interface CleaningCompanySearchProps {
  // Opcjonalnie: możesz przekazać domyślne filtry
  defaultCity?: string;
}

export const CleaningCompanySearch: React.FC<CleaningCompanySearchProps> = ({ defaultCity }) => {
  const [companies, setCompanies] = useState<CleaningCompany[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtry
  const [filters, setFilters] = useState({
    city: defaultCity || '',
    requiredDays: [] as DayOfWeek[], // Które dni pracodawca potrzebuje
    minRating: 0,
    maxDistance: 50,
    hasOwnEquipment: false
  });

  // TODO: Pobierz dane z Supabase
  useEffect(() => {
    fetchCleaningCompanies();
  }, [filters]);

  const fetchCleaningCompanies = async () => {
    setLoading(true);
    
    // TODO: Implementacja Supabase query
    // Przykład:
    // let query = supabase
    //   .from('cleaning_companies')
    //   .select('*')
    //   .eq('profile_visibility', 'public')
    //   .eq('accepting_new_clients', true);
    
    // if (filters.city) {
    //   query = query.eq('location_city', filters.city);
    // }
    
    // if (filters.requiredDays.length > 0) {
    //   // Sprawdź czy firma ma dostępne wymagane dni
    //   // filters.requiredDays.forEach(day => {
    //   //   query = query.eq(`availability->${day}`, true);
    //   // });
    // }
    
    // const { data, error } = await query;
    
    // Mock data na razie
    const mockData: CleaningCompany[] = [
      {
        id: '1',
        user_id: 'user1',
        company_name: 'Clean & Shine BV',
        owner_name: 'Anna Kowalska',
        phone: '+31 6 12345678',
        email: 'anna@cleanshine.nl',
        location_city: 'Amsterdam',
        location_province: 'Noord-Holland',
        service_radius_km: 25,
        specialization: ['cleaning_after_construction', 'deep_cleaning'],
        additional_services: ['own_equipment', 'eco_products', 'insurance'],
        availability: {
          monday: true,
          tuesday: false,
          wednesday: true,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        },
        preferred_days_per_week: 2,
        hourly_rate_min: 25,
        hourly_rate_max: 35,
        rate_negotiable: true,
        years_experience: 5,
        team_size: 2,
        bio: 'Profesjonalne sprzątanie po budowach. Posiadamy własny sprzęt i produkty ekologiczne.',
        portfolio_images: [],
        average_rating: 4.8,
        total_reviews: 23,
        subscription_tier: 'pro',
        subscription_status: 'active',
        profile_visibility: 'public',
        accepting_new_clients: true,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: 'user2',
        company_name: 'SprzątamSzybko',
        owner_name: 'Maria Nowak',
        phone: '+31 6 98765432',
        location_city: 'Amsterdam',
        service_radius_km: 20,
        specialization: ['cleaning_after_construction'],
        additional_services: ['same_day_service', 'weekend_available'],
        availability: {
          monday: false,
          tuesday: true,
          wednesday: false,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        preferred_days_per_week: 3,
        hourly_rate_min: 20,
        hourly_rate_max: 30,
        rate_negotiable: true,
        years_experience: 3,
        team_size: 1,
        bio: 'Szybko i dokładnie. Elastyczne godziny pracy.',
        portfolio_images: [],
        average_rating: 4.5,
        total_reviews: 12,
        subscription_tier: 'basic',
        subscription_status: 'active',
        profile_visibility: 'public',
        accepting_new_clients: true,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setCompanies(mockData);
      setLoading(false);
    }, 500);
  };

  const toggleRequiredDay = (day: DayOfWeek) => {
    setFilters(prev => ({
      ...prev,
      requiredDays: prev.requiredDays.includes(day)
        ? prev.requiredDays.filter(d => d !== day)
        : [...prev.requiredDays, day]
    }));
  };

  const checkAvailability = (company: CleaningCompany): boolean => {
    if (filters.requiredDays.length === 0) return true;
    
    // Sprawdź czy firma ma dostępne WSZYSTKIE wymagane dni
    return filters.requiredDays.every(day => company.availability[day]);
  };

  const filteredCompanies = companies.filter(company => {
    if (filters.city && company.location_city !== filters.city) return false;
    if (!checkAvailability(company)) return false;
    if (company.average_rating < filters.minRating) return false;
    return true;
  });

  const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Firmy Sprzątające
        </h1>
        <p className="text-gray-600">
          Znajdź firmę sprzątającą dostępną w dni, które Cię interesują
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filtry - Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtry</h2>

            {/* Miasto */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Miasto
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="np. Amsterdam"
              />
            </div>

            {/* KLUCZOWE: Wybór wymaganych dni */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Potrzebuję firmy w te dni:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleRequiredDay(day)}
                    className={`
                      px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all
                      ${filters.requiredDays.includes(day)
                        ? 'bg-blue-500 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    {getDayShortLabel(day)}
                  </button>
                ))}
              </div>
              {filters.requiredDays.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Wybrano {filters.requiredDays.length} {filters.requiredDays.length === 1 ? 'dzień' : 'dni'}
                </p>
              )}
            </div>

            {/* Minimalna ocena */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimalna ocena
              </label>
              <select
                value={filters.minRating}
                onChange={e => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">Wszystkie</option>
                <option value="3.5">3.5+ ⭐</option>
                <option value="4.0">4.0+ ⭐⭐</option>
                <option value="4.5">4.5+ ⭐⭐⭐</option>
              </select>
            </div>

            {/* Własny sprzęt */}
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasOwnEquipment}
                  onChange={e => setFilters(prev => ({ ...prev, hasOwnEquipment: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Własny sprzęt</span>
              </label>
            </div>

            {/* Reset */}
            <button
              onClick={() => setFilters({ city: '', requiredDays: [], minRating: 0, maxDistance: 50, hasOwnEquipment: false })}
              className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Wyczyść filtry
            </button>
          </div>
        </aside>

        {/* Lista firm */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Ładowanie...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">
                Nie znaleziono firm spełniających kryteria
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Spróbuj zmienić filtry
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Znaleziono {filteredCompanies.length} {filteredCompanies.length === 1 ? 'firma' : 'firm'}
              </div>

              {filteredCompanies.map(company => (
                <div key={company.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {company.company_name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {company.owner_name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        📍 {company.location_city} (zasięg: {company.service_radius_km}km)
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-500 mb-1">
                        <span className="text-lg font-bold">{company.average_rating}</span>
                        <span>⭐</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        ({company.total_reviews} opinii)
                      </p>
                    </div>
                  </div>

                  {/* Stawka */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      €{company.hourly_rate_min} - €{company.hourly_rate_max}
                    </span>
                    <span className="text-gray-600 text-sm"> / godz</span>
                    {company.rate_negotiable && (
                      <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Do negocjacji
                      </span>
                    )}
                  </div>

                  {/* Specjalizacja */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {company.specialization.map(spec => (
                        <span
                          key={spec}
                          className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                        >
                          {getCleaningSpecializationLabel(spec)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dodatkowe usługi */}
                  {company.additional_services.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {company.additional_services.map(service => (
                        <span
                          key={service}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          ✓ {service === 'own_equipment' ? 'Własny sprzęt' : 
                             service === 'eco_products' ? 'Eko produkty' :
                             service === 'insurance' ? 'Ubezpieczenie' : service}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* KALENDARZ DOSTĘPNOŚCI - READ-ONLY */}
                  <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Dostępność ({countAvailableDays(company.availability)} dni/tydzień)
                    </h4>
                    <AvailabilityCalendar
                      availability={company.availability}
                      editable={false}
                      compact={true}
                    />
                  </div>

                  {/* Bio */}
                  {company.bio && (
                    <p className="text-gray-600 text-sm mb-4">
                      {company.bio}
                    </p>
                  )}

                  {/* Doświadczenie */}
                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    <span>👷 {company.team_size} {company.team_size === 1 ? 'osoba' : 'osoby'}</span>
                    <span>📅 {company.years_experience} lat doświadczenia</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Wyślij wiadomość
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      📞 Zadzwoń
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      ⭐ Zapisz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CleaningCompanySearch;
