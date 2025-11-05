/**
 * =====================================================
 * EMPLOYER PROFILE PAGE
 * =====================================================
 * Display complete employer profile with edit capabilities
 * Created: 2025-10-28
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import employerProfileService from '../../services/employerProfileService';
import type { Database } from '../../src/lib/database.types';

type Employer = Database['public']['Tables']['employers']['Row'];

export default function EmployerProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [user]);

  async function loadProfile() {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await employerProfileService.getEmployerByUserId(user.id);
      
      if (data) {
        setEmployer(data);
        const completion = employerProfileService.calculateProfileCompletion(data);
        setProfileCompletion(completion);
      }
    } catch (error) {
      console.error('Error loading employer profile:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-red-900 mb-2">Profil nie znaleziony</h2>
          <p className="text-red-700">Nie można załadować danych profilu pracodawcy.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header with Logo and Completion */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        <div className="relative px-6 pb-6">
          {/* Company Logo */}
          <div className="absolute -top-16 left-6">
            {employer.logo_url ? (
              <img
                src={employer.logo_url}
                alt={employer.company_name || 'Company logo'}
                className="w-32 h-32 rounded-xl border-4 border-white object-cover bg-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-xl border-4 border-white bg-gray-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <div className="pt-20 flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {employer.company_name || 'Nazwa firmy'}
              </h1>
              {employer.verified && (
                <div className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Zweryfikowany pracodawca</span>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/employer/profile/edit')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edytuj profil
            </button>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Kompletność profilu</span>
              <span className="font-bold text-blue-600">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  profileCompletion === 100
                    ? 'bg-green-500'
                    : profileCompletion >= 70
                    ? 'bg-blue-500'
                    : 'bg-yellow-500'
                }`}
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Company Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Dane firmy</h2>
            
            <div className="space-y-4">
              {employer.kvk_number && (
                <InfoRow
                  icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>}
                  label="Numer KVK"
                  value={employer.kvk_number}
                />
              )}
              
              {employer.industry && (
                <InfoRow
                  icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>}
                  label="Branża"
                  value={employer.industry}
                />
              )}
              
              {employer.company_size && (
                <InfoRow
                  icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>}
                  label="Wielkość firmy"
                  value={employer.company_size}
                />
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kontakt</h2>
            
            <div className="space-y-4">
              {employer.contact_email && (
                <InfoRow
                  icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>}
                  label="Email"
                  value={employer.contact_email}
                  href={`mailto:${employer.contact_email}`}
                />
              )}
              
              {employer.contact_phone && (
                <InfoRow
                  icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>}
                  label="Telefon"
                  value={employer.contact_phone}
                  href={`tel:${employer.contact_phone}`}
                />
              )}
              
              {employer.website && (
                <InfoRow
                  icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>}
                  label="Strona internetowa"
                  value={employer.website}
                  href={employer.website}
                  external
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Description */}
          {employer.description && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">O firmie</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {employer.description}
              </p>
            </div>
          )}

          {/* Address */}
          {(employer.address || employer.city || employer.country) && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Lokalizacja
              </h2>
              
              <div className="text-gray-700 space-y-1">
                {employer.address && <p>{employer.address}</p>}
                {employer.postal_code && employer.city && (
                  <p>{employer.postal_code} {employer.city}</p>
                )}
                {!employer.postal_code && employer.city && <p>{employer.city}</p>}
                {employer.country && <p>{employer.country}</p>}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statystyki</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Oferty pracy"
                value={employer.total_jobs_posted || 0}
                color="blue"
              />
              <StatCard
                label="Zatrudnienia"
                value={employer.total_hires || 0}
                color="green"
              />
              {employer.avg_rating && (
                <StatCard
                  label="Średnia ocena"
                  value={employer.avg_rating.toFixed(1)}
                  color="yellow"
                  suffix="★"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoRow({
  icon,
  label,
  value,
  href,
  external = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-500 mb-0.5">{label}</div>
        <div className={`font-medium ${href ? 'text-blue-600 hover:underline' : 'text-gray-900'} break-words`}>
          {value}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  return content;
}

function StatCard({
  label,
  value,
  color,
  suffix = ''
}: {
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'yellow';
  suffix?: string;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700'
  };

  return (
    <div className={`${colors[color]} rounded-lg p-4 text-center`}>
      <div className="text-2xl font-bold mb-1">
        {value}{suffix}
      </div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}
