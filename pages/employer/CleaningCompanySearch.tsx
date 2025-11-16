import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../src/lib/supabase";
import { useToasts } from "../../contexts/ToastContext";

// Simplified types based on actual database structure
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
  availability: any | null; // JSON field
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  years_experience: number | null;
  team_size: number | null;
  bio: string | null;
  portfolio_images: string[] | null;
  average_rating: number | null;
  total_reviews: number | null;
  accepting_new_clients: boolean;
  created_at: string;
}

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Pon",
  tuesday: "Wt",
  wednesday: "Śr",
  thursday: "Czw",
  friday: "Pt",
  saturday: "Sob",
  sunday: "Niedz",
};

const DAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface CleaningCompanySearchProps {
  defaultCity?: string;
}

export const CleaningCompanySearch: React.FC<CleaningCompanySearchProps> = ({
  defaultCity,
}) => {
  const { addToast } = useToasts();
  const [companies, setCompanies] = useState<CleaningCompany[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    city: defaultCity || "",
    requiredDays: [] as DayOfWeek[],
    minRating: 0,
  });

  useEffect(() => {
    fetchCleaningCompanies();
  }, [filters.city, filters.minRating]);

  const fetchCleaningCompanies = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from("cleaning_companies")
        .select("*")
        .eq("accepting_new_clients", true)
        .order("created_at", { ascending: false });

      if (filters.city) {
        query = query.ilike("location_city", `%${filters.city}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log("✅ Loaded cleaning companies:", data?.length || 0);
      setCompanies((data || []) as CleaningCompany[]);
    } catch (error) {
      console.error("❌ Error fetching cleaning companies:", error);
      addToast("Błąd podczas ładowania firm sprzątających", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleRequiredDay = (day: DayOfWeek) => {
    setFilters((prev) => ({
      ...prev,
      requiredDays: prev.requiredDays.includes(day)
        ? prev.requiredDays.filter((d) => d !== day)
        : [...prev.requiredDays, day],
    }));
  };

  const checkAvailability = (company: CleaningCompany): boolean => {
    if (filters.requiredDays.length === 0) return true;
    if (!company.availability) return false;

    return filters.requiredDays.every(
      (day) => company.availability[day] === true
    );
  };

  const countAvailableDays = (availability: any): number => {
    if (!availability) return 0;
    return Object.values(availability).filter((v) => v === true).length;
  };

  const filteredCompanies = companies.filter((company) => {
    if (!checkAvailability(company)) return false;
    if (company.average_rating && company.average_rating < filters.minRating)
      return false;
    return true;
  });

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
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, city: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="np. Amsterdam"
              />
            </div>

            {/* Wybór wymaganych dni */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Potrzebuję firmy w te dni:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleRequiredDay(day)}
                    className={`
                      px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all
                      ${
                        filters.requiredDays.includes(day)
                          ? "bg-blue-500 border-blue-600 text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }
                    `}
                  >
                    {DAY_LABELS[day]}
                  </button>
                ))}
              </div>
              {filters.requiredDays.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Wybrano {filters.requiredDays.length}{" "}
                  {filters.requiredDays.length === 1 ? "dzień" : "dni"}
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
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minRating: parseFloat(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">Wszystkie</option>
                <option value="3.5">3.5+ ⭐</option>
                <option value="4.0">4.0+ ⭐⭐</option>
                <option value="4.5">4.5+ ⭐⭐⭐</option>
              </select>
            </div>

            {/* Reset */}
            <button
              onClick={() =>
                setFilters({ city: "", requiredDays: [], minRating: 0 })
              }
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
                {companies.length === 0
                  ? "Brak firm sprzątających w bazie danych"
                  : "Nie znaleziono firm spełniających kryteria"}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {companies.length > 0 && "Spróbuj zmienić filtry"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Znaleziono {filteredCompanies.length}{" "}
                {filteredCompanies.length === 1 ? "firma" : "firm"}
              </div>

              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link to={`/public/cleaning-company/${company.id}`}>
                        <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                          {company.company_name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm">
                        {company.owner_name}
                      </p>
                      {company.location_city && (
                        <p className="text-gray-500 text-sm">
                          📍 {company.location_city}
                          {company.service_radius_km &&
                            ` (zasięg: ${company.service_radius_km}km)`}
                        </p>
                      )}
                    </div>

                    {company.average_rating && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500 mb-1">
                          <span className="text-lg font-bold">
                            {company.average_rating.toFixed(1)}
                          </span>
                          <span>⭐</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          ({company.total_reviews || 0} opinii)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Stawka */}
                  {company.hourly_rate_min && company.hourly_rate_max && (
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        €{company.hourly_rate_min} - €{company.hourly_rate_max}
                      </span>
                      <span className="text-gray-600 text-sm"> / godz</span>
                    </div>
                  )}

                  {/* Specjalizacja */}
                  {company.specialization &&
                    company.specialization.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {company.specialization.map((spec, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Dostępność - simplified */}
                  {company.availability && (
                    <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Dostępność ({countAvailableDays(company.availability)}{" "}
                        dni/tydzień)
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {DAYS.map((day) => (
                          <span
                            key={day}
                            className={`
                              px-3 py-1 text-xs rounded-lg
                              ${
                                company.availability[day]
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-400"
                              }
                            `}
                          >
                            {DAY_LABELS[day]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {company.bio && (
                    <p className="text-gray-600 text-sm mb-4">{company.bio}</p>
                  )}

                  {/* Doświadczenie */}
                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    {company.team_size && (
                      <span>
                        👷 {company.team_size}{" "}
                        {company.team_size === 1 ? "osoba" : "osoby"}
                      </span>
                    )}
                    {company.years_experience && (
                      <span>
                        📅 {company.years_experience} lat doświadczenia
                      </span>
                    )}
                  </div>

                  {/* Portfolio images */}
                  {company.portfolio_images &&
                    company.portfolio_images.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Portfolio
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {company.portfolio_images
                            .slice(0, 4)
                            .map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Portfolio ${idx + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      to={`/public/cleaning-company/${company.id}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                    >
                      Zobacz profil
                    </Link>
                    {company.phone && (
                      <a
                        href={`tel:${company.phone}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        📞 Zadzwoń
                      </a>
                    )}
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
