// @ts-nocheck - Cleaning companies/reviews tables not in generated Supabase types yet
import { supabase } from "../lib/supabase";
import type {
  CleaningCompany,
  CleaningReview,
  DayOfWeek,
  CleaningSpecialization,
} from "../../types";

// ============================================
// HELPER - Wrapper for new tables (bypass TypeScript)
// ============================================

/**
 * Helper: Supabase query dla cleaning_companies
 * (Tabela nie istnieje w wygenerowanych typach)
 */
const cleaningCompaniesTable = () => {
  // @ts-ignore - cleaning_companies table not in generated types yet
  return supabase.from("cleaning_companies");
};

/**
 * Helper: Supabase query dla cleaning_reviews
 * (Tabela nie istnieje w wygenerowanych typach)
 */
const cleaningReviewsTable = () => {
  // @ts-ignore - cleaning_reviews table not in generated types yet
  return supabase.from("cleaning_reviews");
};

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CleaningCompanyFilters {
  city?: string;
  requiredDays?: DayOfWeek[];
  specialization?: CleaningSpecialization[];
  maxDistance?: number;
  minRating?: number;
  hasOwnEquipment?: boolean;
  maxHourlyRate?: number;
}

export interface CleaningCompanyStats {
  totalReviews: number;
  averageRating: number;
  totalContacts: number;
  contactsThisMonth: number;
  profileViews: number;
  viewsThisMonth: number;
}

export interface AddReviewData {
  cleaningCompanyId: string;
  employerId: string;
  rating: number;
  reviewText?: string;
  workDate?: string;
  workDurationHours?: number;
  workType?: string;
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Tworzy nowy profil firmy sprzątającej
 */
export const createCleaningCompany = async (
  data: Partial<CleaningCompany>
): Promise<CleaningCompany> => {
  console.log("🧹 Creating cleaning company profile:", data);

  // @ts-ignore - cleaning_companies table not in generated types yet
  const { data: company, error } = await supabase
    .from("cleaning_companies")
    .insert({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating cleaning company:", error);
    throw new Error(`Failed to create cleaning company: ${error.message}`);
  }

  console.log("✅ Cleaning company created:", company.id);
  return company as CleaningCompany;
};

/**
 * Pobiera profil cleaning company dla zalogowanego usera
 */
export const getMyCleaningCompany = async (
  profileId: string
): Promise<CleaningCompany | null> => {
  console.log("🔍 Fetching my cleaning company profile:", profileId);

  const { data, error } = await supabase
    .from("cleaning_companies")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.error("❌ Error fetching cleaning company:", error);
    throw new Error(`Failed to fetch cleaning company: ${error.message}`);
  }

  if (!data) {
    console.log("⚠️ No cleaning company found for profile:", profileId);
    return null;
  }

  console.log("✅ Cleaning company loaded:", {
    company_id: data.id,
    company_name: data.company_name,
    avatar_url: data.avatar_url,
    has_avatar: !!data.avatar_url,
  });

  return data as CleaningCompany;
};

/**
 * Pobiera profil cleaning company po ID (publiczny dostęp)
 */
export const getCleaningCompanyById = async (
  id: string
): Promise<CleaningCompany | null> => {
  console.log("🔍 Fetching cleaning company by ID:", id);

  const { data, error } = await supabase
    .from("cleaning_companies")
    .select("*")
    .eq("id", id)
    .eq("profile_visibility", "public")
    .maybeSingle();

  if (error) {
    console.error("❌ Error fetching cleaning company:", error);
    throw new Error(`Failed to fetch cleaning company: ${error.message}`);
  }

  return data as CleaningCompany | null;
};

/**
 * Aktualizuje profil firmy sprzątającej
 */
export const updateCleaningCompany = async (
  id: string,
  data: Partial<CleaningCompany>
): Promise<CleaningCompany> => {
  console.log("✏️ Updating cleaning company:", id, data);

  const { data: updated, error } = await supabase
    .from("cleaning_companies")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("❌ Error updating cleaning company:", error);
    throw new Error(`Failed to update cleaning company: ${error.message}`);
  }

  console.log("✅ Cleaning company updated");
  return updated as CleaningCompany;
};

/**
 * Usuwa profil firmy sprzątającej
 */
export const deleteCleaningCompany = async (id: string): Promise<void> => {
  console.log("🗑️ Deleting cleaning company:", id);

  const { error } = await supabase
    .from("cleaning_companies")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("❌ Error deleting cleaning company:", error);
    throw new Error(`Failed to delete cleaning company: ${error.message}`);
  }

  console.log("✅ Cleaning company deleted");
};

// ============================================
// SEARCH & FILTERS
// ============================================

/**
 * Wyszukuje firmy sprzątające z filtrami
 */
export const searchCleaningCompanies = async (
  filters: CleaningCompanyFilters = {}
): Promise<CleaningCompany[]> => {
  console.log("🔍 Searching cleaning companies with filters:", filters);

  let query = supabase
    .from("cleaning_companies")
    .select("*")
    .eq("profile_visibility", "public")
    .eq("accepting_new_clients", true)
    .order("average_rating", { ascending: false });

  // Filtr: miasto
  if (filters.city) {
    query = query.eq("location_city", filters.city);
  }

  // Filtr: min rating
  if (filters.minRating !== undefined) {
    query = query.gte("average_rating", filters.minRating);
  }

  // Filtr: max hourly rate
  if (filters.maxHourlyRate !== undefined) {
    query = query.lte("hourly_rate_min", filters.maxHourlyRate);
  }

  // Filtr: specjalizacja
  if (filters.specialization && filters.specialization.length > 0) {
    query = query.overlaps("specialization", filters.specialization);
  }

  // Filtr: own equipment
  if (filters.hasOwnEquipment) {
    query = query.contains("additional_services", ["own_equipment"]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Error searching cleaning companies:", error);
    throw new Error(`Failed to search cleaning companies: ${error.message}`);
  }

  let results = data as CleaningCompany[];

  // Filtr: wymagane dni (client-side filter bo JSONB queries są skomplikowane)
  if (filters.requiredDays && filters.requiredDays.length > 0) {
    results = results.filter((company) => {
      const availability = company.availability as Record<string, boolean>;
      return filters.requiredDays!.every((day) => availability[day] === true);
    });
  }

  console.log("✅ Found cleaning companies:", results.length);
  return results;
};

/**
 * Pobiera firmy dostępne w konkretnych dniach
 */
export const getCompaniesByAvailability = async (
  days: DayOfWeek[],
  city?: string
): Promise<CleaningCompany[]> => {
  console.log("📅 Fetching companies by availability:", days, city);

  const filters: CleaningCompanyFilters = {
    requiredDays: days,
    city,
  };

  return searchCleaningCompanies(filters);
};

// ============================================
// PORTFOLIO IMAGES
// ============================================

/**
 * Upload zdjęcia do portfolio (Supabase Storage)
 */
export const uploadPortfolioImage = async (
  companyId: string,
  file: File
): Promise<string> => {
  console.log("📸 Uploading portfolio image:", file.name);

  // ✅ TASK #8: Validate ownership - prevent unauthorized uploads
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const { data: company, error: fetchError } = await supabase
    .from("cleaning_companies")
    .select("profile_id")
    .eq("id", companyId)
    .single();

  if (fetchError) {
    console.error("❌ Error fetching company:", fetchError);
    throw new Error("Company not found");
  }

  if (company.profile_id !== user.id) {
    console.error("🚫 Unauthorized upload attempt:", {
      companyId,
      userId: user.id,
      companyOwnerId: company.profile_id,
    });
    throw new Error(
      "Unauthorized: You can only upload to your own company portfolio"
    );
  }

  console.log("✅ Ownership validated - proceeding with upload");

  // Validate file
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${companyId}/${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("portfolio-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("❌ Error uploading image:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("portfolio-images")
    .getPublicUrl(data.path);

  const imageUrl = urlData.publicUrl;

  // Update cleaning_companies.portfolio_images array
  const { data: companyData } = await supabase
    .from("cleaning_companies")
    .select("portfolio_images")
    .eq("id", companyId)
    .single();

  const currentImages = (companyData?.portfolio_images as string[]) || [];
  const updatedImages = [...currentImages, imageUrl];

  await supabase
    .from("cleaning_companies")
    .update({ portfolio_images: updatedImages })
    .eq("id", companyId);

  console.log("✅ Portfolio image uploaded:", imageUrl);
  return imageUrl;
};

/**
 * Usuwa zdjęcie z portfolio
 */
export const deletePortfolioImage = async (
  companyId: string,
  imageUrl: string
): Promise<void> => {
  console.log("🗑️ Deleting portfolio image:", imageUrl);

  // ✅ TASK #8: Validate ownership - prevent unauthorized deletions
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const { data: company, error: fetchError } = await supabase
    .from("cleaning_companies")
    .select("profile_id")
    .eq("id", companyId)
    .single();

  if (fetchError) {
    console.error("❌ Error fetching company:", fetchError);
    throw new Error("Company not found");
  }

  if (company.profile_id !== user.id) {
    console.error("🚫 Unauthorized delete attempt:", {
      companyId,
      userId: user.id,
      companyOwnerId: company.profile_id,
    });
    throw new Error(
      "Unauthorized: You can only delete from your own company portfolio"
    );
  }

  console.log("✅ Ownership validated - proceeding with deletion");

  // Extract file path from URL
  const urlParts = imageUrl.split("/portfolio-images/");
  if (urlParts.length < 2) {
    throw new Error("Invalid image URL");
  }
  const filePath = urlParts[1];

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("portfolio-images")
    .remove([filePath]);

  if (storageError) {
    console.error("❌ Error deleting from storage:", storageError);
    // Continue anyway to remove from DB
  }

  // Remove from cleaning_companies.portfolio_images array
  const { data: companyData } = await supabase
    .from("cleaning_companies")
    .select("portfolio_images")
    .eq("id", companyId)
    .single();

  const currentImages = (companyData?.portfolio_images as string[]) || [];
  const updatedImages = currentImages.filter((url) => url !== imageUrl);

  const { error: dbError } = await supabase
    .from("cleaning_companies")
    .update({ portfolio_images: updatedImages })
    .eq("id", companyId);

  if (dbError) {
    console.error("❌ Error updating DB:", dbError);
    throw new Error(`Failed to update portfolio: ${dbError.message}`);
  }

  console.log("✅ Portfolio image deleted");
};

// ============================================
// REVIEWS (OPINIE)
// ============================================

/**
 * Dodaje opinię (tylko employer)
 */
export const addReview = async (
  data: AddReviewData
): Promise<CleaningReview> => {
  console.log("⭐ Adding review:", data);

  const { data: review, error } = await supabase
    .from("cleaning_reviews")
    .insert({
      cleaning_company_id: data.cleaningCompanyId,
      employer_id: data.employerId,
      rating: data.rating,
      review_text: data.reviewText,
      work_date: data.workDate,
      work_duration_hours: data.workDurationHours,
      work_type: data.workType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error adding review:", error);
    throw new Error(`Failed to add review: ${error.message}`);
  }

  console.log("✅ Review added");
  return review as CleaningReview;
};

/**
 * Pobiera opinie firmy
 */
export const getCompanyReviews = async (
  companyId: string,
  limit: number = 50
): Promise<CleaningReview[]> => {
  console.log("📋 Fetching reviews for company:", companyId);

  const { data, error } = await supabase
    .from("cleaning_reviews")
    .select(
      `
      *,
      employer:employers(id, company_name, profile_id)
    `
    )
    .eq("cleaning_company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("❌ Error fetching reviews:", error);
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  return data as unknown as CleaningReview[];
};

/**
 * Odpowiedź firmy na opinię (tylko cleaning company owner)
 */
export const respondToReview = async (
  reviewId: string,
  responseText: string
): Promise<CleaningReview> => {
  console.log("💬 Responding to review:", reviewId);

  const { data, error } = await supabase
    .from("cleaning_reviews")
    .update({
      response_text: responseText,
      response_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    console.error("❌ Error responding to review:", error);
    throw new Error(`Failed to respond to review: ${error.message}`);
  }

  console.log("✅ Response added");
  return data as CleaningReview;
};

// ============================================
// STATS
// ============================================

/**
 * Pobiera statystyki firmy
 */
/**
 * ✅ TASK #7: Pobierz statystyki firmy sprzątającej (z contact_attempts)
 */
export const getCompanyStats = async (
  companyId: string
): Promise<CleaningCompanyStats> => {
  console.log("📊 Fetching stats for company:", companyId);

  // Pobierz podstawowe dane z tabeli
  const { data: company } = await supabase
    .from("cleaning_companies")
    .select("total_reviews, average_rating")
    .eq("id", companyId)
    .single();

  // ✅ TASK #7: Policz kontakty z tabeli contact_attempts
  const { count: totalContacts } = await supabase
    .from("contact_attempts")
    .select("*", { count: "exact", head: true })
    .eq("cleaning_company_id", companyId);

  // Kontakty w tym miesiącu
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: contactsThisMonth } = await supabase
    .from("contact_attempts")
    .select("*", { count: "exact", head: true })
    .eq("cleaning_company_id", companyId)
    .gte("created_at", thirtyDaysAgo.toISOString());

  // ✅ TASK #9: Policz wyświetlenia profilu z tabeli profile_views
  const { count: profileViews } = await supabase
    .from("profile_views")
    .select("*", { count: "exact", head: true })
    .eq("cleaning_company_id", companyId);

  const { count: viewsThisMonth } = await supabase
    .from("profile_views")
    .select("*", { count: "exact", head: true })
    .eq("cleaning_company_id", companyId)
    .gte("viewed_at", thirtyDaysAgo.toISOString());

  const stats: CleaningCompanyStats = {
    totalReviews: company?.total_reviews || 0,
    averageRating: company?.average_rating || 0,
    totalContacts: totalContacts || 0, // ✅ TASK #7: Real data from DB
    contactsThisMonth: contactsThisMonth || 0, // ✅ TASK #7: Real data from DB
    profileViews: profileViews || 0, // ✅ TASK #9: Real data from DB
    viewsThisMonth: viewsThisMonth || 0, // ✅ TASK #9: Real data from DB
  };

  console.log("✅ Stats fetched:", stats);
  return stats;
};

// ============================================
// CONTACT & MESSAGING
// ============================================

/**
 * Employer kontaktuje się z firmą sprzątającą
 */
export const contactCleaningCompany = async (data: {
  cleaningCompanyId: string;
  employerId: string;
  message: string;
  requiredDays?: DayOfWeek[];
  startDate?: string;
}): Promise<void> => {
  console.log("📧 Employer contacting cleaning company:", data);

  // Pobierz profile_id obu stron
  const { data: company } = await supabase
    .from("cleaning_companies")
    .select("profile_id")
    .eq("id", data.cleaningCompanyId)
    .single();

  const { data: employer } = await supabase
    .from("employers")
    .select("profile_id")
    .eq("id", data.employerId)
    .single();

  if (!company || !employer) {
    throw new Error("Company or employer not found");
  }

  // Utwórz wiadomość w systemie messages
  const messageContent = `${data.message}\n\n${
    data.requiredDays ? `Wymagane dni: ${data.requiredDays.join(", ")}\n` : ""
  }${data.startDate ? `Data rozpoczęcia: ${data.startDate}` : ""}`;

  const { error } = await supabase.from("messages").insert({
    sender_id: employer.profile_id,
    recipient_id: company.profile_id,
    content: messageContent,
    created_at: new Date().toISOString(),
    read: false,
  });

  if (error) {
    console.error("❌ Error sending message:", error);
    throw new Error(`Failed to send message: ${error.message}`);
  }

  console.log("✅ Message sent");

  // ✅ TASK #7: Track contact attempt
  await trackContactAttempt(
    data.cleaningCompanyId,
    data.employerId,
    "message",
    `Initial contact message${
      data.requiredDays ? ` for days: ${data.requiredDays.join(", ")}` : ""
    }`
  );

  // TODO: Wyślij email notification do cleaning company
  // TODO: Wyślij push notification
};

// ============================================
// CRITICAL FUNCTIONS (7)
// ============================================

/**
 * Szybka aktualizacja dostępności bez pełnego zapisu profilu
 */
export const updateAvailability = async (
  companyId: string,
  availability: Record<DayOfWeek, boolean>
): Promise<void> => {
  console.log("📅 Updating availability for company:", companyId);

  const { error } = await supabase
    .from("cleaning_companies")
    .update({
      availability,
      updated_at: new Date().toISOString(),
    })
    .eq("id", companyId);

  if (error) {
    console.error("❌ Error updating availability:", error);
    throw new Error(`Failed to update availability: ${error.message}`);
  }

  console.log("✅ Availability updated successfully");
};

/**
 * Toggle accepting_new_clients (szybkie włączanie/wyłączanie przyjmowania klientów)
 */
export const toggleAcceptingClients = async (
  companyId: string,
  accepting: boolean
): Promise<void> => {
  console.log("🔄 Toggling accepting_new_clients:", { companyId, accepting });

  const { error } = await supabase
    .from("cleaning_companies")
    .update({
      accepting_new_clients: accepting,
      updated_at: new Date().toISOString(),
    })
    .eq("id", companyId);

  if (error) {
    console.error("❌ Error toggling accepting clients:", error);
    throw new Error(`Failed to toggle accepting clients: ${error.message}`);
  }

  console.log("✅ Accepting clients toggled successfully");
};

/**
 * Pobiera ostatnie 10 wiadomości dla cleaning company (dashboard inbox widget)
 */
export const getRecentMessages = async (
  profileId: string,
  limit: number = 10
) => {
  console.log("📬 Fetching recent messages for profile:", profileId);

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, role),
      recipient:profiles!messages_recipient_id_fkey(id, full_name, role)
    `
    )
    .or(`sender_id.eq.${profileId},recipient_id.eq.${profileId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("❌ Error fetching recent messages:", error);
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  if (!data) return [];

  // For each message, fetch avatar based on sender/recipient role
  const messagesWithAvatars = await Promise.all(
    data.map(async (msg: any) => {
      let senderAvatar = null;
      let recipientAvatar = null;

      // Fetch sender avatar
      if (msg.sender?.id && msg.sender?.role) {
        try {
          if (msg.sender.role === "worker") {
            const { data: worker } = await supabase
              .from("workers")
              .select("avatar_url")
              .eq("profile_id", msg.sender.id)
              .single();
            senderAvatar = worker?.avatar_url;
          } else if (msg.sender.role === "employer") {
            const { data: employer } = await supabase
              .from("employers")
              .select("logo_url")
              .eq("profile_id", msg.sender.id)
              .single();
            senderAvatar = employer?.logo_url;
          } else if (msg.sender.role === "accountant") {
            const { data: accountant } = await supabase
              .from("accountants")
              .select("avatar_url")
              .eq("profile_id", msg.sender.id)
              .single();
            senderAvatar = accountant?.avatar_url;
          } else if (msg.sender.role === "cleaning_company") {
            const { data: cleaning } = await supabase
              .from("cleaning_companies")
              .select("avatar_url")
              .eq("profile_id", msg.sender.id)
              .single();
            senderAvatar = cleaning?.avatar_url;
          }
        } catch (err) {
          console.error(
            `Error fetching sender avatar for ${msg.sender.role}:`,
            err
          );
        }
      }

      // Fetch recipient avatar
      if (msg.recipient?.id && msg.recipient?.role) {
        try {
          if (msg.recipient.role === "worker") {
            const { data: worker } = await supabase
              .from("workers")
              .select("avatar_url")
              .eq("profile_id", msg.recipient.id)
              .single();
            recipientAvatar = worker?.avatar_url;
          } else if (msg.recipient.role === "employer") {
            const { data: employer } = await supabase
              .from("employers")
              .select("logo_url")
              .eq("profile_id", msg.recipient.id)
              .single();
            recipientAvatar = employer?.logo_url;
          } else if (msg.recipient.role === "accountant") {
            const { data: accountant } = await supabase
              .from("accountants")
              .select("avatar_url")
              .eq("profile_id", msg.recipient.id)
              .single();
            recipientAvatar = accountant?.avatar_url;
          } else if (msg.recipient.role === "cleaning_company") {
            const { data: cleaning } = await supabase
              .from("cleaning_companies")
              .select("avatar_url")
              .eq("profile_id", msg.recipient.id)
              .single();
            recipientAvatar = cleaning?.avatar_url;
          }
        } catch (err) {
          console.error(
            `Error fetching recipient avatar for ${msg.recipient.role}:`,
            err
          );
        }
      }

      return {
        ...msg,
        sender: {
          ...msg.sender,
          avatar_url: senderAvatar,
        },
        recipient: {
          ...msg.recipient,
          avatar_url: recipientAvatar,
        },
      };
    })
  );

  console.log(`✅ Fetched ${messagesWithAvatars.length} messages with avatars`);
  console.log(
    "📬 First message:",
    messagesWithAvatars[0]
      ? {
          subject: messagesWithAvatars[0].subject,
          sender: messagesWithAvatars[0].sender?.full_name,
          sender_role: messagesWithAvatars[0].sender?.role,
          sender_avatar: messagesWithAvatars[0].sender?.avatar_url,
          has_sender_avatar: !!messagesWithAvatars[0].sender?.avatar_url,
        }
      : "No messages"
  );

  return messagesWithAvatars || [];
};

/**
 * Aktualizuje last_active (wpływa na ranking w wyszukiwarkach)
 */
export const markCompanyAsActive = async (companyId: string): Promise<void> => {
  console.log("⏰ Marking company as active:", companyId);

  const { error } = await supabase
    .from("cleaning_companies")
    .update({
      last_active: new Date().toISOString(),
    })
    .eq("id", companyId);

  if (error) {
    console.error("❌ Error marking company as active:", error);
    throw new Error(`Failed to mark company as active: ${error.message}`);
  }

  console.log("✅ Company marked as active");
};

/**
 * Sprawdza czy employer już wystawił opinię (zapobiega duplikatom)
 */
export const getMyReview = async (
  cleaningCompanyId: string,
  employerId: string
): Promise<CleaningReview | null> => {
  console.log("🔍 Checking if employer already reviewed:", {
    cleaningCompanyId,
    employerId,
  });

  const { data, error } = await supabase
    .from("cleaning_reviews")
    .select("*")
    .eq("cleaning_company_id", cleaningCompanyId)
    .eq("employer_id", employerId)
    .maybeSingle();

  if (error) {
    console.error("❌ Error checking existing review:", error);
    throw new Error(`Failed to check review: ${error.message}`);
  }

  return data as CleaningReview | null;
};

/**
 * Usuwa opinię (tylko employer może usunąć swoją opinię)
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  console.log("🗑️ Deleting review:", reviewId);

  const { error } = await supabase
    .from("cleaning_reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    console.error("❌ Error deleting review:", error);
    throw new Error(`Failed to delete review: ${error.message}`);
  }

  console.log("✅ Review deleted successfully");
};

/**
 * Edytuje istniejącą opinię (rating + tekst)
 */
export const updateReview = async (
  reviewId: string,
  updates: { rating?: number; reviewText?: string }
): Promise<CleaningReview> => {
  console.log("✏️ Updating review:", { reviewId, updates });

  const { data, error } = await supabase
    .from("cleaning_reviews")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    console.error("❌ Error updating review:", error);
    throw new Error(`Failed to update review: ${error.message}`);
  }

  console.log("✅ Review updated successfully");
  return data as CleaningReview;
};

// ============================================
// IMPORTANT FUNCTIONS (5)
// ============================================

/**
 * Top 10 najlepiej ocenianych firm (homepage widget)
 */
export const getTopRatedCompanies = async (
  limit: number = 10
): Promise<CleaningCompany[]> => {
  console.log("⭐ Fetching top rated companies, limit:", limit);

  const { data, error } = await supabase
    .from("cleaning_companies")
    .select("*")
    .eq("profile_visibility", "public")
    .eq("accepting_new_clients", true)
    .gte("total_reviews", 3) // Min 3 opinie żeby być w top
    .order("average_rating", { ascending: false })
    .order("total_reviews", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("❌ Error fetching top rated companies:", error);
    throw new Error(`Failed to fetch top companies: ${error.message}`);
  }

  console.log(`✅ Fetched ${data?.length || 0} top companies`);
  return (data || []) as CleaningCompany[];
};

/**
 * Zlicza wyświetlenia profilu (analytics)
 * NOTE: Wymaga tabeli profile_views w przyszłości
 */
export const trackProfileView = async (
  cleaningCompanyId: string,
  viewerProfileId?: string
): Promise<void> => {
  console.log("👁️ Tracking profile view:", {
    cleaningCompanyId,
    viewerProfileId,
  });

  try {
    // ✅ TASK #9: Insert profile view to database
    const { error } = await supabase.from("profile_views").insert({
      cleaning_company_id: cleaningCompanyId,
      employer_id: viewerProfileId || null,
      viewed_at: new Date().toISOString(),
    });

    if (error) {
      console.error("❌ Error tracking profile view:", error);
      // Don't throw - tracking failure shouldn't break user flow
      return;
    }

    console.log("✅ Profile view tracked");
  } catch (err) {
    console.error("❌ Exception tracking profile view:", err);
    // Silent fail - analytics shouldn't block user experience
  }
};

/**
 * Zlicza próby kontaktu (analytics)
 * NOTE: Wymaga tabeli contact_attempts w przyszłości
 */
/**
 * ✅ TASK #7 KROK 3: Track contact attempt (logs to DB)
 * Zapisuje próbę kontaktu employer → cleaning company
 */
export const trackContactAttempt = async (
  cleaningCompanyId: string,
  employerId: string,
  contactType: "phone" | "email" | "message" = "message",
  notes?: string
): Promise<void> => {
  try {
    console.log("📞 Tracking contact attempt:", {
      cleaningCompanyId,
      employerId,
      contactType,
      notes,
    });

    // ✅ TASK #7: Insert do tabeli contact_attempts
    const { error } = await supabase.from("contact_attempts").insert({
      cleaning_company_id: cleaningCompanyId,
      employer_id: employerId,
      contact_type: contactType,
      notes: notes || null,
    });

    if (error) {
      console.error("❌ Error tracking contact attempt:", error);
      throw error;
    }

    console.log("✅ Contact attempt tracked successfully");
  } catch (err) {
    console.error("❌ Failed to track contact attempt:", err);
    // Don't throw - tracking failure shouldn't break user flow
  }
};

/**
 * Sprawdza konflikt dostępności (czy firma dostępna w wybrane dni)
 */
export const checkAvailabilityConflict = async (
  companyId: string,
  requestedDays: DayOfWeek[]
): Promise<{ available: boolean; conflicts: DayOfWeek[] }> => {
  console.log("🔍 Checking availability conflict:", {
    companyId,
    requestedDays,
  });

  const { data, error } = await supabase
    .from("cleaning_companies")
    .select("availability")
    .eq("id", companyId)
    .single();

  if (error) {
    console.error("❌ Error checking availability:", error);
    throw new Error(`Failed to check availability: ${error.message}`);
  }

  const availability = data.availability as Record<DayOfWeek, boolean>;
  const conflicts = requestedDays.filter((day) => !availability[day]);

  console.log("✅ Availability check:", {
    available: conflicts.length === 0,
    conflicts,
  });
  return {
    available: conflicts.length === 0,
    conflicts,
  };
};

/**
 * Statystyki rozkładu ocen (np. 5★: 15, 4★: 5, 3★: 2)
 */
export const getCompanyReviewStats = async (companyId: string) => {
  console.log("📊 Fetching review stats for company:", companyId);

  const { data, error } = await supabase
    .from("cleaning_reviews")
    .select("rating")
    .eq("cleaning_company_id", companyId);

  if (error) {
    console.error("❌ Error fetching review stats:", error);
    throw new Error(`Failed to fetch review stats: ${error.message}`);
  }

  // Zlicz rozkład ocen
  const stats = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  (data || []).forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      stats[review.rating as keyof typeof stats]++;
    }
  });

  console.log("✅ Review stats calculated:", stats);
  return stats;
};

export default {
  // CRUD
  createCleaningCompany,
  getMyCleaningCompany,
  getCleaningCompanyById,
  updateCleaningCompany,
  deleteCleaningCompany,

  // Search
  searchCleaningCompanies,
  getCompaniesByAvailability,

  // Portfolio
  uploadPortfolioImage,
  deletePortfolioImage,

  // Reviews
  addReview,
  getCompanyReviews,
  respondToReview,
  getMyReview,
  deleteReview,
  updateReview,

  // Stats & Analytics
  getCompanyStats,
  getTopRatedCompanies,
  getCompanyReviewStats,
  trackProfileView,
  trackContactAttempt,

  // Availability & Status
  updateAvailability,
  toggleAcceptingClients,
  markCompanyAsActive,
  checkAvailabilityConflict,

  // Messages
  getRecentMessages,
  contactCleaningCompany,
};
