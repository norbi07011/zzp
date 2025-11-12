import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Modal } from "../../components/Modal";
import {
  BuildingOfficeIcon,
  MapPin,
  User,
  Star,
  Mail,
  Phone,
  Globe,
  Briefcase,
  CheckCircleIcon,
  ClockIcon,
  ExternalLink,
} from "../../components/icons";

interface Employer {
  id: string;
  profile_id: string;
  company_name: string | null;
  logo_url: string | null;
  description: string | null;
  industry: string | null;
  company_size: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  postal_code: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  kvk_number: string | null;
  verified: boolean;
  avg_rating: number | null;
  rating_count: number | null;
  subscription_tier: string | null;
  created_at: string;
  // Extended Dutch company info
  company_type: string | null; // B.V., Uitzendbureau, etc.
  btw_number: string | null; // BTW/VAT number
  rsin_number: string | null; // RSIN
  // Google integration
  google_place_id: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string | null;
  location_city: string | null;
  location_country: string | null;
  specialization: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string | null;
  job_type: string | null;
  status: string;
  created_at: string;
  start_date: string | null;
  applications_count?: number;
}

export default function EmployerPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employer, setEmployer] = useState<Employer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "jobs" | "contact">(
    "about"
  );

  // Contact modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  useEffect(() => {
    if (id) {
      loadEmployerData();
    }
  }, [id]);

  async function loadEmployerData() {
    if (!id) return;

    try {
      setLoading(true);

      // Load employer profile
      const { data: employerData, error: employerError } = await supabase
        .from("employers")
        .select("*")
        .eq("id", id)
        .single();

      if (employerError) throw employerError;
      setEmployer(employerData as any);

      // Load active jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!jobsError && jobsData) {
        setJobs(jobsData as any);
      }
    } catch (error) {
      console.error("Error loading employer data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenContact = () => {
    setIsContactModalOpen(true);
  };

  const handleSendContact = async () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      alert("Proszę wypełnić wszystkie pola");
      return;
    }

    if (!employer?.profile_id) {
      alert("❌ Błąd: brak danych pracodawcy");
      return;
    }

    // For now, we'll just show alert - in production this would check logged in user
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) {
      alert("Zaloguj się aby wysłać wiadomość");
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUser.data.user.id,
        recipient_id: employer.profile_id,
        subject: contactSubject,
        content: contactMessage,
        is_read: false,
      });

      if (error) throw error;

      alert(`✅ Wiadomość wysłana do ${employer.company_name}!`);
      setIsContactModalOpen(false);
      setContactSubject("");
      setContactMessage("");
    } catch (err: any) {
      console.error("Error sending message:", err);
      alert(`❌ Nie udało się wysłać wiadomości: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">
            Pracodawca nie znaleziony
          </h2>
          <p className="text-red-700">Nie można załadować danych pracodawcy.</p>
          <button
            onClick={() => navigate("/employers")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Powrót do wyszukiwania
          </button>
        </div>
      </div>
    );
  }

  const rating = employer.avg_rating || 0;

  // Make handler available to ContactTab
  (window as any).handleOpenContact = handleOpenContact;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {employer.logo_url ? (
                <img
                  src={employer.logo_url}
                  alt={employer.company_name || "Company logo"}
                  className="w-32 h-32 rounded-xl border-4 border-white object-cover bg-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl border-4 border-white bg-white flex items-center justify-center shadow-lg">
                  <BuildingOfficeIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {employer.company_name || "Nazwa firmy"}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {employer.industry && (
                      <span className="flex items-center gap-2 text-green-100">
                        <Briefcase className="w-4 h-4" />
                        {employer.industry}
                      </span>
                    )}
                    {employer.city && (
                      <span className="flex items-center gap-2 text-green-100">
                        <MapPin className="w-4 h-4" />
                        {employer.city}
                        {employer.country ? `, ${employer.country}` : ""}
                      </span>
                    )}
                    {employer.company_size && (
                      <span className="flex items-center gap-2 text-green-100">
                        <User className="w-4 h-4" />
                        {employer.company_size}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {employer.verified && (
                      <span className="flex items-center gap-1 bg-white text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircleIcon className="w-4 h-4" />
                        Zweryfikowany
                      </span>
                    )}

                    {rating > 0 && (
                      <span className="flex items-center gap-1 bg-white text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {rating.toFixed(1)} ({employer.rating_count || 0}{" "}
                        opinii)
                      </span>
                    )}

                    <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                      <Briefcase className="w-4 h-4" />
                      {jobs.length} aktywnych ofert
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/employers")}
                  className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  Powrót
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: "about", label: "O firmie", icon: "📋" },
              {
                id: "jobs",
                label: `Oferty pracy (${jobs.length})`,
                icon: "💼",
              },
              { id: "contact", label: "Kontakt", icon: "📞" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === "about" && <AboutTab employer={employer} />}
            {activeTab === "jobs" && (
              <JobsTab jobs={jobs} employer={employer} />
            )}
            {activeTab === "contact" && <ContactTab employer={employer} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ContactCard employer={employer} />
            <GoogleReviewsCard employer={employer} />
            <LocationCard employer={employer} />
            <CompanyDetailsCard employer={employer} />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* Contact Modal */}
      {employer && (
        <Modal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          title={`Kontakt: ${employer.company_name}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-green-800">
                💡 <strong>Wskazówka:</strong> Opisz swoje doświadczenie,
                umiejętności i dostępność. Zwiększysz szanse na odpowiedź!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="np. Zainteresowanie ofertą pracy - [stanowisko]"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wiadomość <span className="text-red-500">*</span>
              </label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={8}
                placeholder={`Dzień dobry,\n\nJestem zainteresowany współpracą z Państwa firmą.\n\nMoje doświadczenie: \nUmiejętności: \nDostępność: \n\nW załączeniu CV.\n\nPozdrawiam`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {contactMessage.length} znaków
              </p>
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
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              📨 Wyślij wiadomość
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ==================== TAB COMPONENTS ====================

function AboutTab({ employer }: { employer: Employer }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">O firmie</h2>

      {employer.description ? (
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {employer.description}
          </p>
        </div>
      ) : (
        <p className="text-gray-500 italic">Brak opisu firmy</p>
      )}

      {employer.website && (
        <div className="mt-6 pt-6 border-t">
          <a
            href={employer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <Globe className="w-4 h-4" />
            Odwiedź stronę internetową
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

function JobsTab({ jobs, employer }: { jobs: Job[]; employer: Employer }) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Brak aktywnych ofert
        </h3>
        <p className="text-gray-600">
          Ta firma nie ma obecnie opublikowanych ofert pracy.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => (window.location.href = `/job/${job.id}`)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {job.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {job.location_city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location_city}
                  </span>
                )}
                {job.specialization && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {job.specialization}
                  </span>
                )}
                {job.job_type && (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {job.job_type}
                  </span>
                )}
              </div>
            </div>

            {(job.salary_min || job.salary_max) && (
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {job.salary_min && job.salary_max
                    ? `€${job.salary_min} - €${job.salary_max}`
                    : job.salary_min
                    ? `od €${job.salary_min}`
                    : `do €${job.salary_max}`}
                </div>
                {job.salary_period && (
                  <div className="text-sm text-gray-600">
                    /{job.salary_period}
                  </div>
                )}
              </div>
            )}
          </div>

          {job.description && (
            <p className="text-gray-700 line-clamp-2 mb-4">{job.description}</p>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-gray-500">
              Opublikowano{" "}
              {new Date(job.created_at).toLocaleDateString("pl-PL")}
            </span>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              Zobacz szczegóły →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactTab({ employer }: { employer: Employer }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Contact Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Dane kontaktowe
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nazwa firmy
            </label>
            <p className="text-lg text-gray-900">{employer.company_name}</p>
          </div>

          {employer.contact_email && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <a
                href={`mailto:${employer.contact_email}`}
                className="text-lg text-green-600 hover:text-green-700 hover:underline flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                {employer.contact_email}
              </a>
            </div>
          )}

          {employer.contact_phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <a
                href={`tel:${employer.contact_phone}`}
                className="text-lg text-green-600 hover:text-green-700 hover:underline flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                {employer.contact_phone}
              </a>
            </div>
          )}

          {(employer.city || employer.address) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres
              </label>
              <p className="text-lg text-gray-900 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                <span>
                  {employer.address && (
                    <>
                      {employer.address}
                      <br />
                    </>
                  )}
                  {employer.city}, {employer.country}
                </span>
              </p>
            </div>
          )}

          {employer.website && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strona internetowa
              </label>
              <a
                href={employer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-green-600 hover:text-green-700 hover:underline flex items-center gap-2"
              >
                <Globe className="w-5 h-5" />
                {employer.website}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Company registration */}
        {(employer.kvk_number || employer.btw_number) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Dane rejestracyjne
            </h3>
            <div className="space-y-2 text-sm">
              {employer.kvk_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">KVK:</span>
                  <span className="text-gray-900 font-medium">
                    {employer.kvk_number}
                  </span>
                </div>
              )}
              {employer.btw_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">BTW:</span>
                  <span className="text-gray-900 font-medium">
                    {employer.btw_number}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Contact Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Wyślij wiadomość
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Zainteresowany pracą w {employer.company_name}? Skontaktuj się przez
          platformę:
        </p>

        {/* Message Action */}
        <div className="space-y-3">
          <button
            onClick={() => (window as any).handleOpenContact?.()}
            className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
          >
            📨 Wyślij wiadomość
          </button>
        </div>

        {/* Direct contact fallback */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <p className="text-xs text-gray-600 mb-2">
            Lub skontaktuj się bezpośrednio:
          </p>
          <div className="space-y-2">
            {employer.contact_phone && (
              <a
                href={`tel:${employer.contact_phone}`}
                className="block text-sm text-green-600 hover:text-green-700 hover:underline"
              >
                📞 {employer.contact_phone}
              </a>
            )}
            {employer.contact_email && (
              <a
                href={`mailto:${employer.contact_email}`}
                className="block text-sm text-green-600 hover:text-green-700 hover:underline"
              >
                ✉️ {employer.contact_email}
              </a>
            )}
            {employer.website && (
              <a
                href={employer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 hover:underline"
              >
                🌐 {employer.website}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Company info */}
        {employer.company_size && (
          <div className="mt-6 pt-6 border-t border-green-200">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-green-600 mb-1">
                {employer.company_size}
              </div>
              <div className="text-sm text-gray-600">wielkość firmy</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== SIDEBAR COMPONENTS ====================

function ContactCard({ employer }: { employer: Employer }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Kontakt</h3>

      <div className="space-y-3">
        {employer.contact_email && (
          <a
            href={`mailto:${employer.contact_email}`}
            className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-sm">{employer.contact_email}</span>
          </a>
        )}

        {employer.contact_phone && (
          <a
            href={`tel:${employer.contact_phone}`}
            className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Phone className="w-5 h-5 text-gray-400" />
            <span className="text-sm">{employer.contact_phone}</span>
          </a>
        )}

        {employer.website && (
          <a
            href={employer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="text-sm break-all">
              {employer.website.replace(/^https?:\/\//, "")}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

function LocationCard({ employer }: { employer: Employer }) {
  if (
    !employer.address &&
    !employer.city &&
    !employer.country &&
    !employer.latitude
  ) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-gray-400" />
        Lokalizacja
      </h3>

      <div className="text-gray-700 space-y-1 text-sm mb-4">
        {employer.address && <p>{employer.address}</p>}
        {employer.postal_code && employer.city && (
          <p>
            {employer.postal_code} {employer.city}
          </p>
        )}
        {!employer.postal_code && employer.city && <p>{employer.city}</p>}
        {employer.country && <p>{employer.country}</p>}
      </div>

      {/* Google Maps embed */}
      {employer.latitude && employer.longitude && (
        <div className="mt-4">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?q=${employer.latitude},${employer.longitude}&zoom=15&key=YOUR_GOOGLE_MAPS_API_KEY`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {employer.google_maps_url && (
            <a
              href={employer.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              <MapPin className="w-4 h-4" />
              Zobacz na mapie Google
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function CompanyDetailsCard({ employer }: { employer: Employer }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Szczegóły firmy</h3>

      <div className="space-y-3">
        {/* Company Type Badge */}
        {employer.company_type && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Forma prawna</div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                employer.company_type === "B.V."
                  ? "bg-green-100 text-green-800"
                  : employer.company_type === "Uitzendbureau"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {employer.company_type}
            </span>
          </div>
        )}

        {employer.industry && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Branża</div>
            <div className="text-sm font-medium text-gray-900">
              {employer.industry}
            </div>
          </div>
        )}

        {employer.company_size && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Wielkość firmy</div>
            <div className="text-sm font-medium text-gray-900">
              {employer.company_size}
            </div>
          </div>
        )}

        {/* Company Numbers */}
        {employer.kvk_number && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Numer KVK</div>
            <div className="text-sm font-medium text-gray-900">
              {employer.kvk_number}
            </div>
          </div>
        )}

        {employer.btw_number && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Numer BTW/VAT</div>
            <div className="text-sm font-medium text-gray-900">
              {employer.btw_number}
            </div>
          </div>
        )}

        {employer.rsin_number && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Numer RSIN</div>
            <div className="text-sm font-medium text-gray-900">
              {employer.rsin_number}
            </div>
          </div>
        )}

        <div>
          <div className="text-xs text-gray-500 mb-1">Data dołączenia</div>
          <div className="text-sm font-medium text-gray-900">
            {new Date(employer.created_at).toLocaleDateString("pl-PL", {
              year: "numeric",
              month: "long",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleReviewsCard({ employer }: { employer: Employer }) {
  if (!employer.google_rating || employer.google_rating === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Opinie Google</h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl font-bold text-amber-600">
          {employer.google_rating.toFixed(1)}
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(employer.google_rating!)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          {employer.google_review_count !== null &&
            employer.google_review_count > 0 && (
              <div className="text-sm text-gray-600">
                {employer.google_review_count}{" "}
                {employer.google_review_count === 1 ? "opinia" : "opinii"}
              </div>
            )}
        </div>
      </div>

      {employer.google_maps_url && (
        <a
          href={employer.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
        >
          Czytaj opinie na Google
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}
    </div>
  );
}
