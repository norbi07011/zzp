import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getAccountant, 
  getAccountantServices, 
  getAccountantReviews,
  type Accountant,
  type AccountantService,
  type AccountantReview 
} from '../../src/services/accountantService';
import { 
  Star, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase,
  Award,
  Languages,
  Calendar,
  MessageSquare,
  CheckCircleIcon,
  ArrowLeft,
  ExternalLink
} from '../../components/icons';
import { AddToTeamButton } from '../../components/AddToTeamButton';
import { useAuth } from '../../contexts/AuthContext';

export default function AccountantProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [accountant, setAccountant] = useState<Accountant | null>(null);
  const [services, setServices] = useState<AccountantService[]>([]);
  const [reviews, setReviews] = useState<AccountantReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about'>('services');

  useEffect(() => {
    if (id) {
      loadAccountantData();
    }
  }, [id]);

  const loadAccountantData = async () => {
    if (!id) return;

    try {
      const [accountantData, servicesData, reviewsData] = await Promise.all([
        getAccountant(id),
        getAccountantServices(id),
        getAccountantReviews(id)
      ]);

      setAccountant(accountantData);
      setServices(servicesData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading accountant:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!accountant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Księgowy nie znaleziony</h2>
          <p className="text-gray-600 mb-6">Ten profil nie istnieje lub został usunięty</p>
          <Link
            to="/accountants"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do wyszukiwarki
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/accountants')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do wyszukiwarki księgowych
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-5xl font-bold border-4 border-white/20">
              {accountant.full_name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{accountant.full_name}</h1>
                  {accountant.company_name && (
                    <p className="text-xl text-amber-100 mb-4">{accountant.company_name}</p>
                  )}
                  
                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">{accountant.rating.toFixed(1)}</span>
                      <span className="text-amber-100">({accountant.rating_count} opinii)</span>
                    </div>
                    {accountant.is_verified && (
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        <span className="font-medium">Zweryfikowany</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 text-amber-100">
                    {accountant.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{accountant.city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{accountant.years_experience} lat doświadczenia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>{accountant.total_clients} klientów</span>
                    </div>
                  </div>
                </div>

                {/* Contact Button */}
                <a
                  href={`mailto:${accountant.email}`}
                  className="px-6 py-3 bg-white text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition-colors shadow-lg"
                >
                  Skontaktuj się
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {[
              { id: 'services', label: 'Usługi' },
              { id: 'reviews', label: 'Opinie' },
              { id: 'about', label: 'O mnie' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  px-4 py-4 border-b-2 font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'services' && <ServicesTab services={services} />}
            {activeTab === 'reviews' && <ReviewsTab reviews={reviews} accountant={accountant} />}
            {activeTab === 'about' && <AboutTab accountant={accountant} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add to Team Button - visible for employer/accountant */}
            {(authUser?.role === 'employer' || authUser?.role === 'accountant') && accountant?.id && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Współpraca w projekcie
                    </h4>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      Zaproś {accountant.company_name || accountant.full_name || 'tego księgowego'} do projektu zespołowego
                    </p>
                    <AddToTeamButton 
                      userId={accountant.id}
                      userEmail={accountant.email}
                      userType="accountant"
                      displayName={accountant.company_name || accountant.full_name || accountant.email}
                      avatarUrl={accountant.avatar_url}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <ContactCard accountant={accountant} />
            <SpecializationsCard accountant={accountant} />
            <LanguagesCard accountant={accountant} />
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// TAB COMPONENTS
// =====================================================

function ServicesTab({ services }: { services: AccountantService[] }) {
  if (services.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak usług</h3>
        <p className="text-gray-600">Ten księgowy nie dodał jeszcze swoich usług</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              {service.features && service.features.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {service.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-amber-600 mb-1">
                €{service.price_from}
              </div>
              <div className="text-sm text-gray-600">{service.price_unit}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsTab({ reviews, accountant }: { reviews: AccountantReview[]; accountant: Accountant }) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak opinii</h3>
        <p className="text-gray-600">Ten księgowy nie ma jeszcze opinii</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">{accountant.rating.toFixed(1)}</div>
            <div className="flex items-center gap-1 justify-center mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(accountant.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">{accountant.rating_count} opinii</div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const percentage = (count / reviews.length) * 100;
              
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{stars}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                {(review.client_name || review.reviewer_name || 'A').charAt(0)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{review.client_name || review.reviewer_name || 'Anoniem'}</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                
                <p className="text-gray-700">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutTab({ accountant }: { accountant: Accountant }) {
  return (
    <div className="space-y-6">
      {/* Bio */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">O mnie</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {accountant.bio || 'Księgowy nie dodał jeszcze opisu'}
        </p>
      </div>

      {/* Professional Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Informacje zawodowe</h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Lata doświadczenia" value={`${accountant.years_experience} lat`} />
          <InfoField label="Liczba klientów" value={accountant.total_clients.toString()} />
          {accountant.kvk_number && <InfoField label="KVK" value={accountant.kvk_number} />}
          {accountant.btw_number && <InfoField label="BTW" value={accountant.btw_number} />}
          {accountant.license_number && <InfoField label="Licencja" value={accountant.license_number} />}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// SIDEBAR COMPONENTS
// =====================================================

function ContactCard({ accountant }: { accountant: Accountant }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Kontakt</h3>
      
      <a
        href={`mailto:${accountant.email}`}
        className="flex items-center gap-3 text-gray-700 hover:text-amber-600 transition-colors"
      >
        <Mail className="w-5 h-5 text-gray-400" />
        <span className="text-sm">{accountant.email}</span>
      </a>

      {accountant.phone && (
        <a
          href={`tel:${accountant.phone}`}
          className="flex items-center gap-3 text-gray-700 hover:text-amber-600 transition-colors"
        >
          <Phone className="w-5 h-5 text-gray-400" />
          <span className="text-sm">{accountant.phone}</span>
        </a>
      )}

      {accountant.website && (
        <a
          href={accountant.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-gray-700 hover:text-amber-600 transition-colors"
        >
          <Globe className="w-5 h-5 text-gray-400" />
          <span className="text-sm">Website</span>
          <ExternalLink className="w-4 h-4 ml-auto" />
        </a>
      )}

      {accountant.city && (
        <div className="flex items-center gap-3 text-gray-700">
          <MapPin className="w-5 h-5 text-gray-400" />
          <span className="text-sm">{accountant.city}</span>
        </div>
      )}
    </div>
  );
}

function SpecializationsCard({ accountant }: { accountant: Accountant }) {
  if (!accountant.specializations || accountant.specializations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Specjalizacje</h3>
      <div className="flex flex-wrap gap-2">
        {accountant.specializations.map((spec: string) => (
          <span
            key={spec}
            className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium"
          >
            {spec}
          </span>
        ))}
      </div>
    </div>
  );
}

function LanguagesCard({ accountant }: { accountant: Accountant }) {
  if (!accountant.languages || accountant.languages.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Languages className="w-5 h-5 text-amber-600" />
        Języki
      </h3>
      <div className="flex flex-wrap gap-2">
        {accountant.languages.map((lang: string) => (
          <span
            key={lang}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
          >
            {lang}
          </span>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// HELPER COMPONENTS
// =====================================================

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-base text-gray-900">{value}</dd>
    </div>
  );
}
