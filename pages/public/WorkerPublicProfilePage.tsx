import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
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

interface Worker {
  id: string;
  profile_id: string;
  full_name: string;
  email: string;
  phone?: string;
  city?: string;
  postal_code?: string;
  country: string;
  bio?: string;
  specialization?: string;
  skills: string[];
  languages: string[];
  hourly_rate?: number;
  years_experience: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  avatar_url?: string;
  portfolio_images?: string[];
  linkedin_url?: string;
  website?: string;
  rating: number;
  rating_count: number;
  completed_jobs: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WorkerReview {
  id: string;
  worker_id: string;
  employer_id: string;
  employer_name: string;
  rating: number;
  comment: string;
  quality_rating?: number;
  punctuality_rating?: number;
  communication_rating?: number;
  safety_rating?: number;
  would_recommend?: boolean;
  created_at: string;
}

interface WorkerProject {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  completion_date: string;
}

export default function WorkerPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<WorkerReview[]>([]);
  const [projects, setProjects] = useState<WorkerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'skills' | 'reviews' | 'about'>('skills');

  useEffect(() => {
    if (id) {
      loadWorkerData();
    }
  }, [id]);

  const loadWorkerData = async () => {
    if (!id) return;

    try {
      // Load worker profile
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .select('*')
        .eq('id', id)
        .single();

      if (workerError) throw workerError;
      
      // Map Supabase data to Worker interface (using as any for now - schema mismatch)
      if (workerData) {
        setWorker(workerData as any);
      }

      // Load reviews from reviews table
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          quality_rating,
          punctuality_rating,
          communication_rating,
          safety_rating,
          would_recommend,
          created_at,
          employer_id,
          profiles!reviews_reviewer_id_fkey(full_name)
        `)
        .eq('worker_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!reviewsError && reviewsData) {
        setReviews(reviewsData.map(review => ({
          id: review.id,
          worker_id: id,
          employer_id: review.employer_id || '',
          employer_name: (review.profiles as any)?.full_name || 'Anoniem',
          rating: review.rating,
          comment: review.comment || '',
          quality_rating: review.quality_rating || undefined,
          punctuality_rating: review.punctuality_rating || undefined,
          communication_rating: review.communication_rating || undefined,
          safety_rating: review.safety_rating || undefined,
          would_recommend: review.would_recommend || undefined,
          created_at: review.created_at || new Date().toISOString()
        })));
      }

    } catch (error) {
      console.error('Error loading worker:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pracownik nie znaleziony</h2>
          <p className="text-gray-600 mb-6">Ten profil nie istnieje lub został usunięty</p>
          <Link
            to="/workers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do wyszukiwarki
          </Link>
        </div>
      </div>
    );
  }

  const availabilityColors = {
    available: 'bg-green-100 text-green-700',
    busy: 'bg-yellow-100 text-yellow-700',
    unavailable: 'bg-red-100 text-red-700'
  };

  const availabilityLabels = {
    available: 'Dostępny',
    busy: 'Zajęty',
    unavailable: 'Niedostępny'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/workers')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do wyszukiwarki pracowników
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-5xl font-bold border-4 border-white/20">
              {worker.avatar_url ? (
                <img src={worker.avatar_url} alt={worker.full_name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                worker.full_name.charAt(0)
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{worker.full_name}</h1>
                  {worker.specialization && (
                    <p className="text-xl text-blue-100 mb-4">{worker.specialization}</p>
                  )}
                  
                  {/* Rating & Status */}
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">{worker.rating.toFixed(1)}</span>
                      <span className="text-blue-100">({worker.rating_count} opinii)</span>
                    </div>
                    
                    {worker.is_verified && (
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        <span className="font-medium">Zweryfikowany</span>
                      </div>
                    )}

                    <div className={`px-4 py-2 rounded-lg font-medium ${availabilityColors[worker.availability_status]} bg-opacity-20 border border-white/30`}>
                      {availabilityLabels[worker.availability_status]}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 text-blue-100">
                    {worker.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{worker.city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{worker.years_experience} lat doświadczenia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>{worker.completed_jobs} zrealizowanych projektów</span>
                    </div>
                    {worker.hourly_rate && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">€{worker.hourly_rate}/godz</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Button */}
                <a
                  href={`mailto:${worker.email}`}
                  className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
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
              { id: 'skills', label: 'Umiejętności' },
              { id: 'reviews', label: 'Opinie' },
              { id: 'about', label: 'O mnie' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  px-4 py-4 border-b-2 font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
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
            {activeTab === 'skills' && <SkillsTab worker={worker} />}
            {activeTab === 'reviews' && <ReviewsTab reviews={reviews} worker={worker} />}
            {activeTab === 'about' && <AboutTab worker={worker} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ContactCard worker={worker} />
            <SkillsCard worker={worker} />
            <LanguagesCard worker={worker} />
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// TAB COMPONENTS
// =====================================================

function SkillsTab({ worker }: { worker: Worker }) {
  if (!worker.skills || worker.skills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak umiejętności</h3>
        <p className="text-gray-600">Ten pracownik nie dodał jeszcze swoich umiejętności</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Umiejętności</h3>
      <div className="flex flex-wrap gap-3">
        {worker.skills.map((skill) => (
          <span
            key={skill}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReviewsTab({ reviews, worker }: { reviews: WorkerReview[]; worker: Worker }) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak opinii</h3>
        <p className="text-gray-600">Ten pracownik nie ma jeszcze opinii</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">{worker.rating.toFixed(1)}</div>
            <div className="flex items-center gap-1 justify-center mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(worker.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">{worker.rating_count} opinii</div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
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

        {/* Average Detailed Ratings */}
        {reviews.length > 0 && (
          <div className="pt-6 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Średnie oceny szczegółowe</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const qualityAvg = reviews.filter(r => r.quality_rating).reduce((sum, r) => sum + (r.quality_rating || 0), 0) / reviews.filter(r => r.quality_rating).length;
                const punctualityAvg = reviews.filter(r => r.punctuality_rating).reduce((sum, r) => sum + (r.punctuality_rating || 0), 0) / reviews.filter(r => r.punctuality_rating).length;
                const communicationAvg = reviews.filter(r => r.communication_rating).reduce((sum, r) => sum + (r.communication_rating || 0), 0) / reviews.filter(r => r.communication_rating).length;
                const safetyAvg = reviews.filter(r => r.safety_rating).reduce((sum, r) => sum + (r.safety_rating || 0), 0) / reviews.filter(r => r.safety_rating).length;

                return (
                  <>
                    {!isNaN(qualityAvg) && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{qualityAvg.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Jakość pracy</div>
                      </div>
                    )}
                    {!isNaN(punctualityAvg) && (
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">{punctualityAvg.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Punktualność</div>
                      </div>
                    )}
                    {!isNaN(communicationAvg) && (
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">{communicationAvg.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Komunikacja</div>
                      </div>
                    )}
                    {!isNaN(safetyAvg) && (
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 mb-1">{safetyAvg.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">BHP</div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            
            {/* Recommendation percentage */}
            {reviews.filter(r => r.would_recommend !== undefined).length > 0 && (
              <div className="mt-4 text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Math.round((reviews.filter(r => r.would_recommend === true).length / reviews.filter(r => r.would_recommend !== undefined).length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">klientów poleca tego pracownika</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
                {review.employer_name.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{review.employer_name}</h4>
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
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('pl-PL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {review.would_recommend && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Poleca</span>
                    </div>
                  )}
                </div>
                
                {/* Detailed Ratings */}
                {(review.quality_rating || review.punctuality_rating || review.communication_rating || review.safety_rating) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    {review.quality_rating && (
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Jakość</div>
                        <div className="flex items-center justify-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.quality_rating!
                                  ? 'fill-blue-500 text-blue-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {review.punctuality_rating && (
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Punktualność</div>
                        <div className="flex items-center justify-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.punctuality_rating!
                                  ? 'fill-green-500 text-green-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {review.communication_rating && (
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Komunikacja</div>
                        <div className="flex items-center justify-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.communication_rating!
                                  ? 'fill-purple-500 text-purple-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {review.safety_rating && (
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">BHP</div>
                        <div className="flex items-center justify-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.safety_rating!
                                  ? 'fill-orange-500 text-orange-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutTab({ worker }: { worker: Worker }) {
  return (
    <div className="space-y-6">
      {/* Bio */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">O mnie</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {worker.bio || 'Pracownik nie dodał jeszcze opisu'}
        </p>
      </div>

      {/* Professional Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Informacje zawodowe</h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Lata doświadczenia" value={`${worker.years_experience} lat`} />
          <InfoField label="Zrealizowane projekty" value={worker.completed_jobs.toString()} />
          {worker.hourly_rate && <InfoField label="Stawka godzinowa" value={`€${worker.hourly_rate}/godz`} />}
          <InfoField label="Status" value={worker.availability_status === 'available' ? 'Dostępny' : worker.availability_status === 'busy' ? 'Zajęty' : 'Niedostępny'} />
        </div>
      </div>

      {/* Portfolio */}
      {worker.portfolio_images && worker.portfolio_images.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Portfolio</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {worker.portfolio_images.map((img, idx) => (
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
    </div>
  );
}

// =====================================================
// SIDEBAR COMPONENTS
// =====================================================

function ContactCard({ worker }: { worker: Worker }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Kontakt</h3>
      
      <a
        href={`mailto:${worker.email}`}
        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <Mail className="w-5 h-5 text-gray-400" />
        <span className="text-sm">{worker.email}</span>
      </a>

      {worker.phone && (
        <a
          href={`tel:${worker.phone}`}
          className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Phone className="w-5 h-5 text-gray-400" />
          <span className="text-sm">{worker.phone}</span>
        </a>
      )}

      {worker.website && (
        <a
          href={worker.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Globe className="w-5 h-5 text-gray-400" />
          <span className="text-sm">Website</span>
          <ExternalLink className="w-4 h-4 ml-auto" />
        </a>
      )}

      {worker.linkedin_url && (
        <a
          href={worker.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <ExternalLink className="w-5 h-5 text-gray-400" />
          <span className="text-sm">LinkedIn</span>
          <ExternalLink className="w-4 h-4 ml-auto" />
        </a>
      )}

      {worker.city && (
        <div className="flex items-center gap-3 text-gray-700">
          <MapPin className="w-5 h-5 text-gray-400" />
          <span className="text-sm">{worker.city}, {worker.country}</span>
        </div>
      )}
    </div>
  );
}

function SkillsCard({ worker }: { worker: Worker }) {
  if (!worker.skills || worker.skills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Główne umiejętności</h3>
      <div className="flex flex-wrap gap-2">
        {worker.skills.slice(0, 8).map((skill: string) => (
          <span
            key={skill}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function LanguagesCard({ worker }: { worker: Worker }) {
  if (!worker.languages || worker.languages.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Languages className="w-5 h-5 text-blue-600" />
        Języki
      </h3>
      <div className="flex flex-wrap gap-2">
        {worker.languages.map((lang: string) => (
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
