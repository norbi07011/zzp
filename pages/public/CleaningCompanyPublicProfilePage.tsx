import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Modal } from "../../components/Modal";
import { ReviewCleaningCompanyModal } from "../../src/components/employer/ReviewCleaningCompanyModal";
import {
  Star,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Users,
} from "../../components/icons";

interface CleaningCompany {
  id: string;
  profile_id: string;
  company_name: string;
  owner_name: string;
  phone: string | null;
  email: string | null;
  location_city: string | null;
  location_province: string | null;
  service_radius_km: number | null;
  specialization: string[] | null;
  additional_services: string[] | null;
  availability: any;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  rate_negotiable: boolean | null;
  years_experience: number | null;
  team_size: number | null;
  bio: string | null;
  portfolio_images: string[] | null;
  average_rating: number | null;
  total_reviews: number | null;
  accepting_new_clients: boolean | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  created_at: string | null;
}

interface CleaningReview {
  id: string;
  cleaning_company_id: string;
  employer_id: string;
  rating: number;
  review_text: string | null;
  work_date: string | null;
  created_at: string | null;
}

export default function CleaningCompanyPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState<CleaningCompany | null>(null);
  const [reviews, setReviews] = useState<CleaningReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "about" | "portfolio" | "reviews" | "contact"
  >("about");

  // Contact modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [employerId, setEmployerId] = useState<string | null>(null);

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadCompanyData();
      trackProfileView();
    }
  }, [id, employerId]);

  useEffect(() => {
    const loadEmployerId = async () => {
      if (user && user.role === "employer") {
        try {
          const { data, error } = await supabase
            .from("employers")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle();

          if (!error && data) {
            setEmployerId(data.id);
          }
        } catch (err) {
          console.error("Error loading employer ID:", err);
        }
      }
    };

    loadEmployerId();
  }, [user]);

  const loadCompanyData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Load company profile
      const { data: companyData, error: companyError } = await supabase
        .from("cleaning_companies")
        .select("*")
        .eq("id", id)
        .maybeSingle(); // ✅ FIXED: .maybeSingle() zwraca null zamiast error gdy 0 rows

      if (companyError) throw companyError;
      if (!companyData) {
        throw new Error("Company not found");
      }
      setCompany(companyData);

      // Load reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("cleaning_reviews")
        .select("*")
        .eq("cleaning_company_id", id)
        .order("created_at", { ascending: false });

      if (!reviewsError && reviewsData) {
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error("Error loading company data:", error);
    } finally {
      setLoading(false);
    }
  };

  const trackProfileView = async () => {
    if (!user || !id || !employerId) return;

    try {
      await supabase.from("profile_views").insert({
        cleaning_company_id: id,
        employer_id: employerId,
        viewed_at: new Date().toISOString(),
      });

      console.log("✅ Profile view tracked for cleaning company:", id);
    } catch (error) {
      console.error("Error tracking profile view:", error);
    }
  };

  const handleOpenContact = () => {
    if (!user) {
      alert("Zaloguj się aby wysłać wiadomość do firmy");
      return;
    }
    setIsContactModalOpen(true);
  };

  const handleSendContact = async () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      alert("Proszę wypełnić wszystkie pola");
      return;
    }

    if (!user?.id || !company?.profile_id) {
      alert("❌ Błąd: brak danych użytkownika lub firmy");
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: company.profile_id,
        subject: contactSubject,
        content: contactMessage,
        is_read: false,
      });

      if (error) throw error;

      // Track contact attempt
      // TODO: contact_attempts table not in database.types.ts yet
      // if (employerId) {
      //   await supabase.from("contact_attempts").insert({
      //     cleaning_company_id: company.id,
      //     employer_id: employerId,
      //     contact_type: "message",
      //     notes: `Subject: ${contactSubject}`,
      //   });
      // }

      alert("✅ Wiadomość wysłana!");
      setIsContactModalOpen(false);
      setContactSubject("");
      setContactMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("❌ Błąd wysyłania wiadomości");
    }
  };

  const handleCallClick = async () => {
    if (!company?.phone) return;

    // TODO: contact_attempts table not in database.types.ts yet
    // if (employerId) {
    //   try {
    //     await supabase.from("contact_attempts").insert({
    //       cleaning_company_id: company.id,
    //       employer_id: employerId,
    //       contact_type: "phone",
    //       notes: `Phone: ${company.phone}`,
    //     });
    //   } catch (error) {
    //     console.error("Error tracking phone contact:", error);
    //   }
    // }

    window.location.href = `tel:${company.phone}`;
  };

  const handleEmailClick = async () => {
    if (!company?.email) return;

    // TODO: contact_attempts table not in database.types.ts yet
    // if (employerId) {
    //   try {
    //     await supabase.from("contact_attempts").insert({
    //       cleaning_company_id: company.id,
    //       employer_id: employerId,
    //       contact_type: "email",
    //       notes: `Email: ${company.email}`,
    //     });
    //   } catch (error) {
    //     console.error("Error tracking email contact:", error);
    //   }
    // }

    window.location.href = `mailto:${company.email}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Firma nie znaleziona
          </h2>
          <button
            onClick={() => navigate("/cleaning-companies")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Wróć do wyszukiwania
          </button>
        </div>
      </div>
    );
  }

  const availableDays = Object.entries(company.availability || {}).filter(
    ([_, val]) => val === true
  );
  const dayLabels: Record<string, string> = {
    monday: "Pon",
    tuesday: "Wt",
    wednesday: "Śr",
    thursday: "Czw",
    friday: "Pt",
    saturday: "Sob",
    sunday: "Niedz",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with cover image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-800">
        {company.cover_image_url && (
          <img
            src={company.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Wstecz</span>
        </button>
      </div>

      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {company.avatar_url ? (
                <img
                  src={company.avatar_url}
                  alt={company.company_name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-blue-100 flex items-center justify-center">
                  <Briefcase className="w-16 h-16 text-blue-600" />
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {company.company_name}
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    właściciel: {company.owner_name}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= (company.average_rating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {(company.average_rating || 0).toFixed(1)} (
                      {company.total_reviews || 0} opinii)
                    </span>
                  </div>

                  {/* Location & Experience */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    {company.location_city && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5" />
                        <span>{company.location_city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-5 h-5" />
                      <span>{company.years_experience} lat doświadczenia</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <span>Zespół: {company.team_size} os.</span>
                    </div>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="flex flex-col gap-2">
                  {company.phone && (
                    <button
                      onClick={handleCallClick}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Zadzwoń
                    </button>
                  )}
                  {company.email && (
                    <button
                      onClick={handleEmailClick}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      Email
                    </button>
                  )}
                  <button
                    onClick={handleOpenContact}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Wiadomość
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="flex gap-8">
              {["about", "portfolio", "reviews", "contact"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-4 px-2 font-medium transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "about" && "O firmie"}
                  {tab === "portfolio" && "Portfolio"}
                  {tab === "reviews" && `Opinie (${company.total_reviews})`}
                  {tab === "contact" && "Kontakt"}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === "about" && (
              <div className="space-y-6">
                {/* Bio */}
                {company.bio && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      O nas
                    </h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {company.bio}
                    </p>
                  </div>
                )}

                {/* Specialization */}
                {company.specialization &&
                  company.specialization.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Specjalizacja
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {company.specialization.map((spec) => (
                          <span
                            key={spec}
                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
                          >
                            {spec.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Additional Services */}
                {company.additional_services &&
                  company.additional_services.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Dodatkowe usługi
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {company.additional_services.map((service) => (
                          <div
                            key={service}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>{service.replace(/_/g, " ")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Availability */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Dostępność
                  </h3>
                  <div className="flex gap-2">
                    {availableDays.map(([day]) => (
                      <span
                        key={day}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium"
                      >
                        {dayLabels[day]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                {company.hourly_rate_min && company.hourly_rate_max && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Stawka godzinowa
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      €{company.hourly_rate_min} - €{company.hourly_rate_max}
                      /godz
                    </p>
                    {company.rate_negotiable && (
                      <p className="text-sm text-gray-600 mt-1">
                        Stawka do negocjacji
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "portfolio" && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Portfolio
                </h3>
                {company.portfolio_images &&
                company.portfolio_images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {company.portfolio_images.map((image, index) => (
                      <div
                        key={index}
                        className="rounded-lg overflow-hidden shadow-lg"
                      >
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Brak zdjęć w portfolio</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Opinie ({reviews.length})
                  </h3>
                  {user && user.role === "employer" && employerId && (
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Dodaj opinię
                    </button>
                  )}
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-50 rounded-lg p-6"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">
                            {review.created_at
                              ? new Date(review.created_at).toLocaleDateString(
                                  "pl-PL"
                                )
                              : "Brak daty"}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-gray-700">{review.review_text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Brak opinii</p>
                    {user && user.role === "employer" && employerId && (
                      <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Dodaj pierwszą opinię
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Dane kontaktowe
                </h3>
                <div className="space-y-4">
                  {company.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span>{company.email}</span>
                    </div>
                  )}
                  {company.location_city && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span>
                        {company.location_city}
                        {company.location_province &&
                          `, ${company.location_province}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Wyślij wiadomość"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temat
            </label>
            <input
              type="text"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              placeholder="np. Zapytanie o usługę sprzątania"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wiadomość
            </label>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Wpisz swoją wiadomość..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSendContact}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Wyślij
            </button>
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Anuluj
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      {company && employerId && (
        <ReviewCleaningCompanyModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          companyId={company.id}
          companyName={company.company_name}
          employerId={employerId}
          onSuccess={loadCompanyData}
        />
      )}
    </div>
  );
}
