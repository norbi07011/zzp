-- ============================================================================
-- RLS POLICIES - WSZYSTKIE NOWE TABELE
-- ============================================================================
-- Data: 2025-10-12
-- Cel: Konfiguracja Row Level Security dla wszystkich nowych tabel
-- ============================================================================

-- ============================================================================
-- WŁĄCZ RLS NA WSZYSTKICH TABELACH
-- ============================================================================

ALTER TABLE public.worker_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. WORKER_CERTIFICATES POLICIES
-- ============================================================================

-- Pracownicy mogą przeglądać swoje certyfikaty
CREATE POLICY "Workers can view own certificates"
ON public.worker_certificates FOR SELECT
USING (auth.uid() = worker_id);

-- Pracownicy mogą dodawać swoje certyfikaty
CREATE POLICY "Workers can insert own certificates"
ON public.worker_certificates FOR INSERT
WITH CHECK (auth.uid() = worker_id);

-- Pracownicy mogą aktualizować swoje certyfikaty
CREATE POLICY "Workers can update own certificates"
ON public.worker_certificates FOR UPDATE
USING (auth.uid() = worker_id);

-- Pracownicy mogą usuwać swoje certyfikaty
CREATE POLICY "Workers can delete own certificates"
ON public.worker_certificates FOR DELETE
USING (auth.uid() = worker_id);

-- Admini mogą wszystko
CREATE POLICY "Admins can manage all certificates"
ON public.worker_certificates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 2. PORTFOLIO_PROJECTS POLICIES
-- ============================================================================

-- Pracownicy mogą przeglądać swoje projekty
CREATE POLICY "Workers can view own projects"
ON public.portfolio_projects FOR SELECT
USING (auth.uid() = worker_id);

-- Publiczność może przeglądać widoczne projekty
CREATE POLICY "Public can view visible projects"
ON public.portfolio_projects FOR SELECT
USING (visible = true);

-- Pracownicy mogą dodawać swoje projekty
CREATE POLICY "Workers can insert own projects"
ON public.portfolio_projects FOR INSERT
WITH CHECK (auth.uid() = worker_id);

-- Pracownicy mogą aktualizować swoje projekty
CREATE POLICY "Workers can update own projects"
ON public.portfolio_projects FOR UPDATE
USING (auth.uid() = worker_id);

-- Pracownicy mogą usuwać swoje projekty
CREATE POLICY "Workers can delete own projects"
ON public.portfolio_projects FOR DELETE
USING (auth.uid() = worker_id);

-- ============================================================================
-- 3. JOB_APPLICATIONS POLICIES
-- ============================================================================

-- Pracownicy mogą przeglądać swoje aplikacje
CREATE POLICY "Workers can view own applications"
ON public.job_applications FOR SELECT
USING (auth.uid() = worker_id);

-- Pracodawcy mogą przeglądać aplikacje do swoich ofert
CREATE POLICY "Employers can view applications to their jobs"
ON public.job_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_applications.job_id
    AND employer_id = auth.uid()
  )
);

-- Pracownicy mogą dodawać aplikacje
CREATE POLICY "Workers can insert applications"
ON public.job_applications FOR INSERT
WITH CHECK (auth.uid() = worker_id);

-- Pracownicy mogą aktualizować swoje aplikacje (np. wycofać)
CREATE POLICY "Workers can update own applications"
ON public.job_applications FOR UPDATE
USING (auth.uid() = worker_id);

-- Pracodawcy mogą aktualizować status aplikacji do swoich ofert
CREATE POLICY "Employers can update application status"
ON public.job_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_applications.job_id
    AND employer_id = auth.uid()
  )
);

-- ============================================================================
-- 4. EARNINGS POLICIES
-- ============================================================================

-- Pracownicy mogą przeglądać swoje zarobki
CREATE POLICY "Workers can view own earnings"
ON public.earnings FOR SELECT
USING (auth.uid() = worker_id);

-- Pracownicy mogą dodawać swoje zarobki
CREATE POLICY "Workers can insert own earnings"
ON public.earnings FOR INSERT
WITH CHECK (auth.uid() = worker_id);

-- Pracownicy mogą aktualizować swoje zarobki
CREATE POLICY "Workers can update own earnings"
ON public.earnings FOR UPDATE
USING (auth.uid() = worker_id);

-- Admini mogą wszystko
CREATE POLICY "Admins can manage all earnings"
ON public.earnings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 5. WORKER_SKILLS POLICIES
-- ============================================================================

-- Pracownicy mogą przeglądać swoje umiejętności
CREATE POLICY "Workers can view own skills"
ON public.worker_skills FOR SELECT
USING (auth.uid() = worker_id);

-- Publiczność może przeglądać umiejętności
CREATE POLICY "Public can view skills"
ON public.worker_skills FOR SELECT
USING (true);

-- Pracownicy mogą dodawać swoje umiejętności
CREATE POLICY "Workers can insert own skills"
ON public.worker_skills FOR INSERT
WITH CHECK (auth.uid() = worker_id);

-- Pracownicy mogą aktualizować swoje umiejętności
CREATE POLICY "Workers can update own skills"
ON public.worker_skills FOR UPDATE
USING (auth.uid() = worker_id);

-- Pracownicy mogą usuwać swoje umiejętności
CREATE POLICY "Workers can delete own skills"
ON public.worker_skills FOR DELETE
USING (auth.uid() = worker_id);

-- ============================================================================
-- 6. WORKER_REVIEWS POLICIES
-- ============================================================================

-- Pracownicy mogą przeglądać swoje opinie
CREATE POLICY "Workers can view own reviews"
ON public.worker_reviews FOR SELECT
USING (auth.uid() = worker_id);

-- Publiczność może przeglądać widoczne opinie
CREATE POLICY "Public can view visible reviews"
ON public.worker_reviews FOR SELECT
USING (visible = true AND flagged = false);

-- Pracodawcy mogą dodawać opinie
CREATE POLICY "Employers can insert reviews"
ON public.worker_reviews FOR INSERT
WITH CHECK (auth.uid() = employer_id);

-- Pracodawcy mogą aktualizować swoje opinie
CREATE POLICY "Employers can update own reviews"
ON public.worker_reviews FOR UPDATE
USING (auth.uid() = employer_id);

-- Admini mogą zarządzać opiniami (moderacja)
CREATE POLICY "Admins can manage reviews"
ON public.worker_reviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 7. WORKER_EXPERIENCES POLICIES
-- ============================================================================

-- Pracownicy mogą przeglądać swoje doświadczenie
CREATE POLICY "Workers can view own experiences"
ON public.worker_experiences FOR SELECT
USING (auth.uid() = worker_id);

-- Publiczność może przeglądać doświadczenie
CREATE POLICY "Public can view experiences"
ON public.worker_experiences FOR SELECT
USING (true);

-- Pracownicy mogą dodawać swoje doświadczenie
CREATE POLICY "Workers can insert own experiences"
ON public.worker_experiences FOR INSERT
WITH CHECK (auth.uid() = worker_id);

-- Pracownicy mogą aktualizować swoje doświadczenie
CREATE POLICY "Workers can update own experiences"
ON public.worker_experiences FOR UPDATE
USING (auth.uid() = worker_id);

-- Pracownicy mogą usuwać swoje doświadczenie
CREATE POLICY "Workers can delete own experiences"
ON public.worker_experiences FOR DELETE
USING (auth.uid() = worker_id);

-- ============================================================================
-- 8. WORKER_AVAILABILITY POLICIES
-- ============================================================================

-- Pracownicy mogą przeglądać swoją dostępność
CREATE POLICY "Workers can view own availability"
ON public.worker_availability FOR SELECT
USING (auth.uid() = worker_id);

-- Pracodawcy mogą przeglądać dostępność pracowników
CREATE POLICY "Employers can view worker availability"
ON public.worker_availability FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'employer'
  )
);

-- Pracownicy mogą zarządzać swoją dostępnością
CREATE POLICY "Workers can manage own availability"
ON public.worker_availability FOR ALL
USING (auth.uid() = worker_id);

-- ============================================================================
-- 9. EMPLOYER_SEARCHES POLICIES
-- ============================================================================

-- Pracodawcy mogą przeglądać swoje wyszukiwania
CREATE POLICY "Employers can view own searches"
ON public.employer_searches FOR SELECT
USING (auth.uid() = employer_id);

-- Pracodawcy mogą dodawać wyszukiwania
CREATE POLICY "Employers can insert searches"
ON public.employer_searches FOR INSERT
WITH CHECK (auth.uid() = employer_id);

-- Admini mogą przeglądać wszystkie wyszukiwania (analityka)
CREATE POLICY "Admins can view all searches"
ON public.employer_searches FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 10. SAVED_WORKERS POLICIES
-- ============================================================================

-- Pracodawcy mogą przeglądać swoich zapisanych pracowników
CREATE POLICY "Employers can view saved workers"
ON public.saved_workers FOR SELECT
USING (auth.uid() = employer_id);

-- Pracodawcy mogą zapisywać pracowników
CREATE POLICY "Employers can save workers"
ON public.saved_workers FOR INSERT
WITH CHECK (auth.uid() = employer_id);

-- Pracodawcy mogą aktualizować zapisanych pracowników
CREATE POLICY "Employers can update saved workers"
ON public.saved_workers FOR UPDATE
USING (auth.uid() = employer_id);

-- Pracodawcy mogą usuwać zapisanych pracowników
CREATE POLICY "Employers can delete saved workers"
ON public.saved_workers FOR DELETE
USING (auth.uid() = employer_id);

-- ============================================================================
-- 11. WORKER_VIEWS POLICIES
-- ============================================================================

-- Pracownicy mogą przeglądać wyświetlenia swojego profilu
CREATE POLICY "Workers can view profile views"
ON public.worker_views FOR SELECT
USING (auth.uid() = worker_id);

-- System może dodawać wyświetlenia (przez backend)
CREATE POLICY "System can insert views"
ON public.worker_views FOR INSERT
WITH CHECK (true);

-- Admini mogą przeglądać wszystkie wyświetlenia
CREATE POLICY "Admins can view all views"
ON public.worker_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 12. CONVERSATIONS POLICIES
-- ============================================================================

-- Użytkownicy mogą przeglądać swoje konwersacje
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
USING (
  auth.uid() = participant_1_id OR
  auth.uid() = participant_2_id
);

-- Użytkownicy mogą tworzyć konwersacje
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (
  auth.uid() = participant_1_id OR
  auth.uid() = participant_2_id
);

-- Użytkownicy mogą aktualizować swoje konwersacje
CREATE POLICY "Users can update own conversations"
ON public.conversations FOR UPDATE
USING (
  auth.uid() = participant_1_id OR
  auth.uid() = participant_2_id
);

-- ============================================================================
-- 13. MESSAGES POLICIES
-- ============================================================================

-- Użytkownicy mogą przeglądać wiadomości w swoich konwersacjach
CREATE POLICY "Users can view own messages"
ON public.messages FOR SELECT
USING (
  auth.uid() = sender_id OR
  auth.uid() = recipient_id
);

-- Użytkownicy mogą wysyłać wiadomości
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Użytkownicy mogą aktualizować swoje wiadomości (oznaczanie jako przeczytane)
CREATE POLICY "Users can update messages"
ON public.messages FOR UPDATE
USING (
  auth.uid() = sender_id OR
  auth.uid() = recipient_id
);

-- Użytkownicy mogą usuwać swoje wiadomości
CREATE POLICY "Users can delete own messages"
ON public.messages FOR DELETE
USING (auth.uid() = sender_id);

-- ============================================================================
-- 14. ADMIN_ACTIONS POLICIES
-- ============================================================================

-- Tylko admini mogą przeglądać logi akcji
CREATE POLICY "Admins can view admin actions"
ON public.admin_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- System może dodawać logi (przez backend)
CREATE POLICY "System can insert admin actions"
ON public.admin_actions FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 15. SYSTEM_METRICS POLICIES
-- ============================================================================

-- Admini mogą przeglądać metryki
CREATE POLICY "Admins can view metrics"
ON public.system_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- System może dodawać metryki
CREATE POLICY "System can insert metrics"
ON public.system_metrics FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 16. FEATURE_FLAGS POLICIES
-- ============================================================================

-- Wszyscy mogą przeglądać flagi funkcjonalności
CREATE POLICY "All can view feature flags"
ON public.feature_flags FOR SELECT
USING (true);

-- Tylko admini mogą zarządzać flagami
CREATE POLICY "Admins can manage feature flags"
ON public.feature_flags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- NADANIE UPRAWNIEŃ
-- ============================================================================

-- Uprawnienia dla authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.earnings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_skills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_experiences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_availability TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employer_searches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_workers TO authenticated;
GRANT SELECT, INSERT ON public.worker_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;

-- Uprawnienia dla anonymous (publiczne dane)
GRANT SELECT ON public.portfolio_projects TO anon;
GRANT SELECT ON public.worker_skills TO anon;
GRANT SELECT ON public.worker_reviews TO anon;
GRANT SELECT ON public.worker_experiences TO anon;
GRANT SELECT ON public.feature_flags TO anon;

-- Uprawnienia dla admina
GRANT ALL ON public.admin_actions TO authenticated;
GRANT ALL ON public.system_metrics TO authenticated;
GRANT ALL ON public.feature_flags TO authenticated;

-- ============================================================================
-- ZAKOŃCZENIE
-- ============================================================================

SELECT 'RLS Policies configured successfully for all 16 tables! ✅' as status;
