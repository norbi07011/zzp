// ========================================
// BACKUP: Kod usunięty z src/services/workers.ts
// Data: 2025-01-16
// Powód: Duplikaty cleaning companies w worker search
// Linie: 42-105 (fetch cleaning_companies + transform + combine)
// ========================================

// ❌ USUNIĘTY KOD - cleaning companies w fetchWorkers() (linie 42-105):

// 2. Fetch cleaning companies
const { data: cleaningData, error: cleaningError } = await supabase
  .from("cleaning_companies")
  .select(
    `
    *,
    profile:profiles!cleaning_companies_profile_id_fkey (
      id,
      full_name,
      email,
      avatar_url,
      role
    )
  `
  )
  .order("created_at", { ascending: false });

if (cleaningError) {
  console.error("⚠️ Warning fetching cleaning companies:", cleaningError);
  // Don't throw - cleaning companies are optional
}

// 3. Transform cleaning companies to Worker format
const transformedCleaners: WorkerWithProfile[] = (cleaningData || []).map(
  (cc) => ({
    id: cc.id,
    profile_id: cc.profile_id,
    user_id: cc.user_id,
    specialization: "cleaning", // ✅ All cleaning companies = "cleaning" specialization
    location_city: cc.location_city || null,
    location_province: cc.location_province || null,
    hourly_rate: cc.hourly_rate_min || 0,
    experience_years: cc.years_experience || 0,
    bio: cc.bio || null,
    phone: cc.phone || null,
    avatar_url: cc.avatar_url || cc.logo_url || null,
    rating: cc.average_rating || 0,
    rating_count: cc.total_reviews || 0,
    certifications: cc.specialization || [],
    languages: ["nl"], // Default
    subscription_tier: "basic",
    zzp_certificate_issued: false,
    zzp_certificate_number: null,
    approved_categories: ["cleaning"], // ✅ Auto-approve cleaning category
    profile: cc.profile,
    created_at: cc.created_at,
    updated_at: cc.updated_at,
  })
);

// 4. Combine both arrays
const combined = [...(workersData || []), ...transformedCleaners];

console.log("📊 DEBUG: Combined results:", {
  workersCount: workersData?.length || 0,
  cleaningCount: cleaningData?.length || 0,
  totalCount: combined.length,
});

return combined as WorkerWithProfile[];

// ========================================
// CO TO ROBIŁO:
// - Pobierało cleaning_companies z bazy
// - Transformowało je do formatu Worker
// - Łączyło z workers (UNION)
// - Powodowało duplikaty: lula była w workers + cleaning_companies
// ========================================

// ========================================
// NOWA WERSJA (tylko workers):
// ========================================
export async function fetchWorkers(): Promise<WorkerWithProfile[]> {
  console.log("🔍 Fetching workers (without cleaning companies)...");

  const { data: workersData, error: workersError } = await supabase
    .from("workers")
    .select(
      `
      *,
      profile:profiles!workers_profile_id_fkey (
        id,
        full_name,
        email,
        avatar_url,
        role
      )
    `
    )
    .order("created_at", { ascending: false });

  if (workersError) {
    console.error("❌ Error fetching workers:", workersError);
    throw workersError;
  }

  console.log("📊 Loaded workers:", workersData?.length || 0);
  return (workersData || []) as WorkerWithProfile[];
}
