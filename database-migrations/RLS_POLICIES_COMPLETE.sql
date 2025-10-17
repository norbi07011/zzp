-- ============================================================================
-- RLS POLICIES - KOMPLETNE (WSZYSTKIE 29 TABEL)
-- ============================================================================
-- Data: 2025-10-13
-- Autor: GitHub Copilot
-- Cel: Konfiguracja Row Level Security dla WSZYSTKICH tabel w bazie
-- ============================================================================

-- ============================================================================
-- WŁĄCZ RLS NA WSZYSTKICH TABELACH
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zzp_exam_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
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
-- 1. PROFILES POLICIES (KRYTYCZNA)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 2. WORKERS POLICIES (KRYTYCZNA)
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own worker profile" ON public.workers;
CREATE POLICY "Workers can view own worker profile"
ON public.workers FOR SELECT
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Workers can update own worker profile" ON public.workers;
CREATE POLICY "Workers can update own worker profile"
ON public.workers FOR UPDATE
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Employers can view workers" ON public.workers;
CREATE POLICY "Employers can view workers"
ON public.workers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'employer'
  )
);

DROP POLICY IF EXISTS "Public can view verified workers" ON public.workers;
CREATE POLICY "Public can view verified workers"
ON public.workers FOR SELECT
USING (verified = true);

DROP POLICY IF EXISTS "Admins can manage all workers" ON public.workers;
CREATE POLICY "Admins can manage all workers"
ON public.workers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 3. EMPLOYERS POLICIES (KRYTYCZNA)
-- ============================================================================

DROP POLICY IF EXISTS "Employers can view own employer profile" ON public.employers;
CREATE POLICY "Employers can view own employer profile"
ON public.employers FOR SELECT
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Employers can update own employer profile" ON public.employers;
CREATE POLICY "Employers can update own employer profile"
ON public.employers FOR UPDATE
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Workers can view employers" ON public.employers;
CREATE POLICY "Workers can view employers"
ON public.employers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'worker'
  )
);

DROP POLICY IF EXISTS "Admins can manage all employers" ON public.employers;
CREATE POLICY "Admins can manage all employers"
ON public.employers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 4. JOBS POLICIES (KRYTYCZNA - NOWA)
-- ============================================================================

DROP POLICY IF EXISTS "Public can view active jobs" ON public.jobs;
CREATE POLICY "Public can view active jobs"
ON public.jobs FOR SELECT
USING (status = 'active' AND published_at IS NOT NULL AND (expires_at IS NULL OR expires_at > NOW()));

DROP POLICY IF EXISTS "Employers can view own jobs" ON public.jobs;
CREATE POLICY "Employers can view own jobs"
ON public.jobs FOR SELECT
USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can create jobs" ON public.jobs;
CREATE POLICY "Employers can create jobs"
ON public.jobs FOR INSERT
WITH CHECK (
  auth.uid() = employer_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'employer'
  )
);

DROP POLICY IF EXISTS "Employers can update own jobs" ON public.jobs;
CREATE POLICY "Employers can update own jobs"
ON public.jobs FOR UPDATE
USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can delete own jobs" ON public.jobs;
CREATE POLICY "Employers can delete own jobs"
ON public.jobs FOR DELETE
USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.jobs;
CREATE POLICY "Admins can manage all jobs"
ON public.jobs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 5. JOB_APPLICATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own applications" ON public.job_applications;
CREATE POLICY "Workers can view own applications"
ON public.job_applications FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Employers can view applications to their jobs" ON public.job_applications;
CREATE POLICY "Employers can view applications to their jobs"
ON public.job_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_applications.job_id
    AND employer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Workers can insert applications" ON public.job_applications;
CREATE POLICY "Workers can insert applications"
ON public.job_applications FOR INSERT
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can update own applications" ON public.job_applications;
CREATE POLICY "Workers can update own applications"
ON public.job_applications FOR UPDATE
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Employers can update application status" ON public.job_applications;
CREATE POLICY "Employers can update application status"
ON public.job_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_applications.job_id
    AND employer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage applications" ON public.job_applications;
CREATE POLICY "Admins can manage applications"
ON public.job_applications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 6. TRANSACTIONS POLICIES (NOWA)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert transactions" ON public.transactions;
CREATE POLICY "System can insert transactions"
ON public.transactions FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can manage transactions" ON public.transactions;
CREATE POLICY "Admins can manage transactions"
ON public.transactions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 7. NOTIFICATIONS POLICIES (NOWA)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 8. TAGS POLICIES (NOWA)
-- ============================================================================

DROP POLICY IF EXISTS "All can view tags" ON public.tags;
CREATE POLICY "All can view tags"
ON public.tags FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;
CREATE POLICY "Admins can manage tags"
ON public.tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 9. USER_ACTIVITY_LOGS POLICIES (NOWA)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can view own activity logs"
ON public.user_activity_logs FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_logs;
CREATE POLICY "System can insert activity logs"
ON public.user_activity_logs FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.user_activity_logs;
CREATE POLICY "Admins can view all activity logs"
ON public.user_activity_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 10. CERTIFICATES POLICIES (STARA TABELA)
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own certificates old" ON public.certificates;
CREATE POLICY "Workers can view own certificates old"
ON public.certificates FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can insert own certificates old" ON public.certificates;
CREATE POLICY "Workers can insert own certificates old"
ON public.certificates FOR INSERT
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can update own certificates old" ON public.certificates;
CREATE POLICY "Workers can update own certificates old"
ON public.certificates FOR UPDATE
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Admins can manage all certificates old" ON public.certificates;
CREATE POLICY "Admins can manage all certificates old"
ON public.certificates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 11. CERTIFICATE_APPLICATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own certificate applications" ON public.certificate_applications;
CREATE POLICY "Workers can view own certificate applications"
ON public.certificate_applications FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can create certificate applications" ON public.certificate_applications;
CREATE POLICY "Workers can create certificate applications"
ON public.certificate_applications FOR INSERT
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can update own certificate applications" ON public.certificate_applications;
CREATE POLICY "Workers can update own certificate applications"
ON public.certificate_applications FOR UPDATE
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Admins can manage certificate applications" ON public.certificate_applications;
CREATE POLICY "Admins can manage certificate applications"
ON public.certificate_applications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 12. ZZP_EXAM_APPLICATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own zzp applications" ON public.zzp_exam_applications;
CREATE POLICY "Workers can view own zzp applications"
ON public.zzp_exam_applications FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can create zzp applications" ON public.zzp_exam_applications;
CREATE POLICY "Workers can create zzp applications"
ON public.zzp_exam_applications FOR INSERT
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can update own zzp applications" ON public.zzp_exam_applications;
CREATE POLICY "Workers can update own zzp applications"
ON public.zzp_exam_applications FOR UPDATE
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Admins can manage zzp applications" ON public.zzp_exam_applications;
CREATE POLICY "Admins can manage zzp applications"
ON public.zzp_exam_applications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 13. SUBSCRIPTION_EVENTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own subscription events" ON public.subscription_events;
CREATE POLICY "Workers can view own subscription events"
ON public.subscription_events FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "System can insert subscription events" ON public.subscription_events;
CREATE POLICY "System can insert subscription events"
ON public.subscription_events FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all subscription events" ON public.subscription_events;
CREATE POLICY "Admins can view all subscription events"
ON public.subscription_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 14. SUBSCRIPTION_PAYMENTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own subscription payments" ON public.subscription_payments;
CREATE POLICY "Workers can view own subscription payments"
ON public.subscription_payments FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "System can insert subscription payments" ON public.subscription_payments;
CREATE POLICY "System can insert subscription payments"
ON public.subscription_payments FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all subscription payments" ON public.subscription_payments;
CREATE POLICY "Admins can view all subscription payments"
ON public.subscription_payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can manage subscription payments" ON public.subscription_payments;
CREATE POLICY "Admins can manage subscription payments"
ON public.subscription_payments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 15. WORKER_CERTIFICATES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own certificates" ON public.worker_certificates;
CREATE POLICY "Workers can view own certificates"
ON public.worker_certificates FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can insert own certificates" ON public.worker_certificates;
CREATE POLICY "Workers can insert own certificates"
ON public.worker_certificates FOR INSERT
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can update own certificates" ON public.worker_certificates;
CREATE POLICY "Workers can update own certificates"
ON public.worker_certificates FOR UPDATE
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can delete own certificates" ON public.worker_certificates;
CREATE POLICY "Workers can delete own certificates"
ON public.worker_certificates FOR DELETE
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Admins can manage all certificates" ON public.worker_certificates;
CREATE POLICY "Admins can manage all certificates"
ON public.worker_certificates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 16. PORTFOLIO_PROJECTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own projects" ON public.portfolio_projects;
CREATE POLICY "Workers can view own projects"
ON public.portfolio_projects FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Public can view visible projects" ON public.portfolio_projects;
CREATE POLICY "Public can view visible projects"
ON public.portfolio_projects FOR SELECT
USING (visible = true);

DROP POLICY IF EXISTS "Workers can insert own projects" ON public.portfolio_projects;
CREATE POLICY "Workers can insert own projects"
ON public.portfolio_projects FOR INSERT
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can update own projects" ON public.portfolio_projects;
CREATE POLICY "Workers can update own projects"
ON public.portfolio_projects FOR UPDATE
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can delete own projects" ON public.portfolio_projects;
CREATE POLICY "Workers can delete own projects"
ON public.portfolio_projects FOR DELETE
USING (auth.uid() = worker_id);

-- ============================================================================
-- 17. EARNINGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own earnings" ON public.earnings;
CREATE POLICY "Workers can view own earnings"
ON public.earnings FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can insert own earnings" ON public.earnings;
CREATE POLICY "Workers can insert own earnings"
ON public.earnings FOR INSERT
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can update own earnings" ON public.earnings;
CREATE POLICY "Workers can update own earnings"
ON public.earnings FOR UPDATE
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Admins can manage all earnings" ON public.earnings;
CREATE POLICY "Admins can manage all earnings"
ON public.earnings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 18. WORKER_SKILLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own skills" ON public.worker_skills;
CREATE POLICY "Workers can view own skills"
ON public.worker_skills FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Public can view skills" ON public.worker_skills;
CREATE POLICY "Public can view skills"
ON public.worker_skills FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Workers can insert own skills" ON public.worker_skills;
CREATE POLICY "Workers can insert own skills"
ON public.worker_skills FOR INSERT
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can update own skills" ON public.worker_skills;
CREATE POLICY "Workers can update own skills"
ON public.worker_skills FOR UPDATE
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can delete own skills" ON public.worker_skills;
CREATE POLICY "Workers can delete own skills"
ON public.worker_skills FOR DELETE
USING (auth.uid() = worker_id);

-- ============================================================================
-- 19. WORKER_REVIEWS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own reviews" ON public.worker_reviews;
CREATE POLICY "Workers can view own reviews"
ON public.worker_reviews FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Public can view visible reviews" ON public.worker_reviews;
CREATE POLICY "Public can view visible reviews"
ON public.worker_reviews FOR SELECT
USING (visible = true AND flagged = false);

DROP POLICY IF EXISTS "Employers can insert reviews" ON public.worker_reviews;
CREATE POLICY "Employers can insert reviews"
ON public.worker_reviews FOR INSERT
WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can update own reviews" ON public.worker_reviews;
CREATE POLICY "Employers can update own reviews"
ON public.worker_reviews FOR UPDATE
USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Admins can manage reviews" ON public.worker_reviews;
CREATE POLICY "Admins can manage reviews"
ON public.worker_reviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 20. WORKER_EXPERIENCES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own experiences" ON public.worker_experiences;
CREATE POLICY "Workers can view own experiences"
ON public.worker_experiences FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Public can view experiences" ON public.worker_experiences;
CREATE POLICY "Public can view experiences"
ON public.worker_experiences FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Workers can insert own experiences" ON public.worker_experiences;
CREATE POLICY "Workers can insert own experiences"
ON public.worker_experiences FOR INSERT
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can update own experiences" ON public.worker_experiences;
CREATE POLICY "Workers can update own experiences"
ON public.worker_experiences FOR UPDATE
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers can delete own experiences" ON public.worker_experiences;
CREATE POLICY "Workers can delete own experiences"
ON public.worker_experiences FOR DELETE
USING (auth.uid() = worker_id);

-- ============================================================================
-- 21. WORKER_AVAILABILITY POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view own availability" ON public.worker_availability;
CREATE POLICY "Workers can view own availability"
ON public.worker_availability FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Employers can view worker availability" ON public.worker_availability;
CREATE POLICY "Employers can view worker availability"
ON public.worker_availability FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'employer'
  )
);

DROP POLICY IF EXISTS "Workers can manage own availability" ON public.worker_availability;
CREATE POLICY "Workers can manage own availability"
ON public.worker_availability FOR ALL
USING (auth.uid() = worker_id);

-- ============================================================================
-- 22. EMPLOYER_SEARCHES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Employers can view own searches" ON public.employer_searches;
CREATE POLICY "Employers can view own searches"
ON public.employer_searches FOR SELECT
USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can insert searches" ON public.employer_searches;
CREATE POLICY "Employers can insert searches"
ON public.employer_searches FOR INSERT
WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Admins can view all searches" ON public.employer_searches;
CREATE POLICY "Admins can view all searches"
ON public.employer_searches FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 23. SAVED_WORKERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Employers can view saved workers" ON public.saved_workers;
CREATE POLICY "Employers can view saved workers"
ON public.saved_workers FOR SELECT
USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can save workers" ON public.saved_workers;
CREATE POLICY "Employers can save workers"
ON public.saved_workers FOR INSERT
WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can update saved workers" ON public.saved_workers;
CREATE POLICY "Employers can update saved workers"
ON public.saved_workers FOR UPDATE
USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can delete saved workers" ON public.saved_workers;
CREATE POLICY "Employers can delete saved workers"
ON public.saved_workers FOR DELETE
USING (auth.uid() = employer_id);

-- ============================================================================
-- 24. WORKER_VIEWS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Workers can view profile views" ON public.worker_views;
CREATE POLICY "Workers can view profile views"
ON public.worker_views FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "System can insert views" ON public.worker_views;
CREATE POLICY "System can insert views"
ON public.worker_views FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all views" ON public.worker_views;
CREATE POLICY "Admins can view all views"
ON public.worker_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- 25. CONVERSATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
USING (
  auth.uid() = participant_1_id OR
  auth.uid() = participant_2_id
);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (
  auth.uid() = participant_1_id OR
  auth.uid() = participant_2_id
);

DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations"
ON public.conversations FOR UPDATE
USING (
  auth.uid() = participant_1_id OR
  auth.uid() = participant_2_id
);

-- ============================================================================
-- 26. MESSAGES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages"
ON public.messages FOR SELECT
USING (
  auth.uid() = sender_id OR
  auth.uid() = recipient_id
);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update messages" ON public.messages;
CREATE POLICY "Users can update messages"
ON public.messages FOR UPDATE
USING (
  auth.uid() = sender_id OR
  auth.uid() = recipient_id
);

DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can delete own messages"
ON public.messages FOR DELETE
USING (auth.uid() = sender_id);

-- ============================================================================
-- 27. ADMIN_ACTIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view admin actions" ON public.admin_actions;
CREATE POLICY "Admins can view admin actions"
ON public.admin_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "System can insert admin actions" ON public.admin_actions;
CREATE POLICY "System can insert admin actions"
ON public.admin_actions FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 28. SYSTEM_METRICS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view metrics" ON public.system_metrics;
CREATE POLICY "Admins can view metrics"
ON public.system_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "System can insert metrics" ON public.system_metrics;
CREATE POLICY "System can insert metrics"
ON public.system_metrics FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 29. FEATURE_FLAGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "All can view feature flags" ON public.feature_flags;
CREATE POLICY "All can view feature flags"
ON public.feature_flags FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature flags"
ON public.feature_flags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- NADANIE UPRAWNIEŃ (GRANTS)
-- ============================================================================

-- Uprawnienia dla authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.workers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.employers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT SELECT ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.tags TO authenticated;
GRANT SELECT ON public.user_activity_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificate_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.zzp_exam_applications TO authenticated;
GRANT SELECT ON public.subscription_events TO authenticated;
GRANT SELECT ON public.subscription_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.worker_certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
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
GRANT SELECT, INSERT ON public.admin_actions TO authenticated;
GRANT SELECT, INSERT ON public.system_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;

-- Uprawnienia dla anonymous (publiczne dane)
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT ON public.portfolio_projects TO anon;
GRANT SELECT ON public.worker_skills TO anon;
GRANT SELECT ON public.worker_reviews TO anon;
GRANT SELECT ON public.worker_experiences TO anon;
GRANT SELECT ON public.feature_flags TO anon;
GRANT SELECT ON public.tags TO anon;
GRANT SELECT ON public.workers TO anon;

-- ============================================================================
-- PODSUMOWANIE
-- ============================================================================

DO $$
DECLARE
  v_policies_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_policies_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 RLS POLICIES SKONFIGUROWANE POMYŚLNIE! 🎉';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 STATYSTYKI:';
  RAISE NOTICE '  • Tabel z RLS: 29';
  RAISE NOTICE '  • Łącznie policies: %', v_policies_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ SKONFIGUROWANE TABELE:';
  RAISE NOTICE '  1. profiles (KRYTYCZNA)';
  RAISE NOTICE '  2. workers (KRYTYCZNA)';
  RAISE NOTICE '  3. employers (KRYTYCZNA)';
  RAISE NOTICE '  4. jobs (NOWA - KRYTYCZNA)';
  RAISE NOTICE '  5. job_applications';
  RAISE NOTICE '  6. transactions (NOWA)';
  RAISE NOTICE '  7. notifications (NOWA)';
  RAISE NOTICE '  8. tags (NOWA)';
  RAISE NOTICE '  9. user_activity_logs (NOWA)';
  RAISE NOTICE '  10. certificates';
  RAISE NOTICE '  11. certificate_applications';
  RAISE NOTICE '  12. zzp_exam_applications';
  RAISE NOTICE '  13. subscription_events';
  RAISE NOTICE '  14. subscription_payments';
  RAISE NOTICE '  15. worker_certificates';
  RAISE NOTICE '  16. portfolio_projects';
  RAISE NOTICE '  17. earnings';
  RAISE NOTICE '  18. worker_skills';
  RAISE NOTICE '  19. worker_reviews';
  RAISE NOTICE '  20. worker_experiences';
  RAISE NOTICE '  21. worker_availability';
  RAISE NOTICE '  22. employer_searches';
  RAISE NOTICE '  23. saved_workers';
  RAISE NOTICE '  24. worker_views';
  RAISE NOTICE '  25. conversations';
  RAISE NOTICE '  26. messages';
  RAISE NOTICE '  27. admin_actions';
  RAISE NOTICE '  28. system_metrics';
  RAISE NOTICE '  29. feature_flags';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 BEZPIECZEŃSTWO:';
  RAISE NOTICE '  ✅ RLS włączone na wszystkich tabelach';
  RAISE NOTICE '  ✅ Policies dla admin, employer, worker';
  RAISE NOTICE '  ✅ Publiczny dostęp tylko do widocznych danych';
  RAISE NOTICE '  ✅ DROP POLICY IF EXISTS - bezpieczne wielokrotne uruchomienie';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 NASTĘPNE KROKI:';
  RAISE NOTICE '  1. Przetestuj routing dla wszystkich ról';
  RAISE NOTICE '  2. Przetestuj tworzenie ofert pracy (employer panel)';
  RAISE NOTICE '  3. Przetestuj aplikacje na oferty (worker panel)';
  RAISE NOTICE '  4. Przetestuj admin panel';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
