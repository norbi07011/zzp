import React, { useState } from 'react';
import { CleaningCompany, WeeklyAvailability, CleaningSpecialization, getCleaningSpecializationLabel } from '../../../types';
import AvailabilityCalendar from '../../components/cleaning/AvailabilityCalendar';
import { useAuth } from '../../../contexts/AuthContext';

const SPECIALIZATIONS: CleaningSpecialization[] = [
  'cleaning_after_construction',
  'deep_cleaning',
  'office_cleaning',
  'window_cleaning',
  'maintenance_cleaning'
];

const ADDITIONAL_SERVICES = [
  { id: 'own_equipment', label: 'Własny sprzęt' },
  { id: 'eco_products', label: 'Produkty ekologiczne' },
  { id: 'same_day_service', label: 'Usługa tego samego dnia' },
  { id: 'weekend_available', label: 'Dostępność w weekendy' },
  { id: 'insurance', label: 'Ubezpieczenie OC' },
  { id: 'invoice', label: 'Faktura VAT' }
];

export const CleaningCompanyProfile: React.FC = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<CleaningCompany>>({
    company_name: '',
    owner_name: '',
    phone: '',
    email: user?.email || '',
    location_city: '',
    location_province: '',
    service_radius_km: 20,
    specialization: ['cleaning_after_construction'],
    additional_services: [],
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    preferred_days_per_week: 2,
    hourly_rate_min: 25,
    hourly_rate_max: 35,
    rate_negotiable: true,
    years_experience: 0,
    team_size: 1,
    bio: '',
    profile_visibility: 'public',
    accepting_new_clients: true
  });

  const handleAvailabilityChange = (newAvailability: WeeklyAvailability) => {
    setFormData(prev => ({
      ...prev,
      availability: newAvailability
    }));
  };

  const handleSpecializationToggle = (spec: CleaningSpecialization) => {
    const current = formData.specialization || [];
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec];
    
    setFormData(prev => ({ ...prev, specialization: updated }));
  };

  const handleAdditionalServiceToggle = (serviceId: string) => {
    const current = formData.additional_services || [];
    const updated = current.includes(serviceId)
      ? current.filter(s => s !== serviceId)
      : [...current, serviceId];
    
    setFormData(prev => ({ ...prev, additional_services: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Wywołanie API do zapisania profilu
    console.log('Saving cleaning company profile:', formData);
    
    // Przykład: await supabase.from('cleaning_companies').insert(formData)
    alert('Profil zapisany! (TODO: integracja z Supabase)');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profil Firmy Sprzątającej
          </h1>
          <p className="text-gray-600">
            Wypełnij formularz aby pracodawcy mogli Cię znaleźć na podstawie dostępności
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Podstawowe dane */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Podstawowe informacje
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa firmy *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={e => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="np. Clean & Shine BV"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imię i nazwisko właścicielki *
                </label>
                <input
                  type="text"
                  required
                  value={formData.owner_name}
                  onChange={e => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="np. Anna Kowalska"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+31 6 12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="kontakt@firma.nl"
                />
              </div>
            </div>
          </section>

          {/* Lokalizacja */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Lokalizacja i zasięg
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miasto
                </label>
                <input
                  type="text"
                  value={formData.location_city}
                  onChange={e => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Amsterdam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prowincja
                </label>
                <input
                  type="text"
                  value={formData.location_province}
                  onChange={e => setFormData(prev => ({ ...prev, location_province: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Noord-Holland"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promień działania (km)
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={formData.service_radius_km}
                  onChange={e => setFormData(prev => ({ ...prev, service_radius_km: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* KALENDARZ DOSTĘPNOŚCI - NAJWAŻNIEJSZA SEKCJA! */}
          <section className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📅</span>
              Twoja dostępność (kluczowe!)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Zaznacz dni, w które możesz przyjść do pracy. Pracodawcy będą mogli filtrować firmy według dostępności.
            </p>

            <AvailabilityCalendar
              availability={formData.availability!}
              onChange={handleAvailabilityChange}
              editable={true}
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferowana liczba dni pracy w tygodniu
              </label>
              <select
                value={formData.preferred_days_per_week}
                onChange={e => setFormData(prev => ({ ...prev, preferred_days_per_week: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">1 dzień</option>
                <option value="2">2 dni (dorywczo)</option>
                <option value="3">3 dni</option>
                <option value="4">4 dni</option>
                <option value="5">5 dni (pełny etat)</option>
                <option value="6">6 dni</option>
                <option value="7">7 dni</option>
              </select>
            </div>
          </section>

          {/* Specjalizacja */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Specjalizacja
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {SPECIALIZATIONS.map(spec => (
                <label
                  key={spec}
                  className={`
                    flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${formData.specialization?.includes(spec)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.specialization?.includes(spec)}
                    onChange={() => handleSpecializationToggle(spec)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {getCleaningSpecializationLabel(spec)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Dodatkowe usługi */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Dodatkowe usługi / udogodnienia
            </h2>
            <div className="grid md:grid-cols-3 gap-3">
              {ADDITIONAL_SERVICES.map(service => (
                <label
                  key={service.id}
                  className={`
                    flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all
                    ${formData.additional_services?.includes(service.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.additional_services?.includes(service.id)}
                    onChange={() => handleAdditionalServiceToggle(service.id)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    {service.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Stawka */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Stawka godzinowa
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Od (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={formData.hourly_rate_min}
                  onChange={e => setFormData(prev => ({ ...prev, hourly_rate_min: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={formData.hourly_rate_max}
                  onChange={e => setFormData(prev => ({ ...prev, hourly_rate_max: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    checked={formData.rate_negotiable}
                    onChange={e => setFormData(prev => ({ ...prev, rate_negotiable: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Do negocjacji</span>
                </label>
              </div>
            </div>
          </section>

          {/* Doświadczenie */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Doświadczenie i zespół
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lata doświadczenia
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.years_experience}
                  onChange={e => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wielkość ekipy (ile osób)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.team_size}
                  onChange={e => setFormData(prev => ({ ...prev, team_size: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Opis */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              O firmie
            </h2>
            <textarea
              value={formData.bio}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Opisz swoją firmę, doświadczenie, sposób pracy..."
            />
          </section>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Zapisz profil
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, profile_visibility: prev.profile_visibility === 'public' ? 'private' : 'public' }))}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              {formData.profile_visibility === 'public' ? '👁️ Profil publiczny' : '🔒 Profil prywatny'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CleaningCompanyProfile;
