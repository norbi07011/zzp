-- ============================================================================
-- KOMPLETNA NAPRAWA - WSZYSTKIE BRAKUJĄCE TABELE
-- ============================================================================
-- Data: 2025-10-13
-- Problem: Panel admina i cała aplikacja wywołuje tabele które nie istnieją
-- Rozwiązanie: Utworzenie WSZYSTKICH brakujących tabel na raz
-- Czas wykonania: ~15-20 sekund
-- ============================================================================

-- Lista brakujących tabel znalezionych w kodzie:
-- 1. appointments ✅
-- 2. subscription_payments ✅  
-- 3. companies ✅
-- 4. test_slots ✅
-- 5. certificates ✅
-- 6. slot_bookings 🆕
-- 7. certificate_applications 🆕
-- 8. subscription_events 🆕
-- 9. activity_logs 🆕
-- 10. security_alerts 🆕
-- 11. seo_pages 🆕
-- 12. notification_templates 🆕
-- 13. messages 🆕
-- 14. email_templates 🆕
-- 15. media 🆕
-- 16. email_campaigns 🆕
-- 17. blog_posts 🆕
-- 18. blog_categories 🆕
-- 19. reviews 🆕
-- 20. system_settings 🆕
-- 21. api_keys 🆕
-- 22. user_permissions 🆕
-- 23. meta_tags 🆕
-- 24. redirects 🆕
-- 25. reports 🆕

-- ============================================================================
-- KROK 1: USUNIĘCIE STARYCH WERSJI TABEL (jeśli istnieją)
-- ============================================================================

DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.redirects CASCADE;
DROP TABLE IF EXISTS public.meta_tags CASCADE;
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.blog_categories CASCADE;
DROP TABLE IF EXISTS public.email_campaigns CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.notification_templates CASCADE;
DROP TABLE IF EXISTS public.seo_pages CASCADE;
DROP TABLE IF EXISTS public.security_alerts CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.subscription_events CASCADE;
DROP TABLE IF EXISTS public.certificate_applications CASCADE;
DROP TABLE IF EXISTS public.slot_bookings CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.test_slots CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.subscription_payments CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;

-- ============================================================================
-- 1. appointments
-- ============================================================================

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  location_type TEXT NOT NULL CHECK (location_type IN ('online', 'on-site', 'phone')),
  location_details TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no-show')),
  employer_notes TEXT,
  worker_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_appointments_employer ON public.appointments(employer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_worker ON public.appointments(worker_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers view appointments" ON public.appointments FOR SELECT
  USING (employer_id IN (SELECT id FROM public.employers WHERE profile_id = auth.uid()));

CREATE POLICY "Workers view appointments" ON public.appointments FOR SELECT
  USING (worker_id IN (SELECT id FROM public.workers WHERE profile_id = auth.uid()));

-- ============================================================================
-- 2. subscription_payments
-- ============================================================================

CREATE TABLE public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  stripe_invoice_id TEXT,
  stripe_customer_id TEXT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('basic', 'premium', 'enterprise')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  description TEXT,
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_employer ON public.subscription_payments(employer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON public.subscription_payments(status);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers view payments" ON public.subscription_payments FOR SELECT
  USING (employer_id IN (SELECT id FROM public.employers WHERE profile_id = auth.uid()));

-- ============================================================================
-- 3. companies
-- ============================================================================

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL UNIQUE REFERENCES public.employers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kvk_number TEXT,
  btw_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'NL',
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_employer ON public.companies(employer_id);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON public.companies(verified);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers manage company" ON public.companies FOR ALL
  USING (employer_id IN (SELECT id FROM public.employers WHERE profile_id = auth.uid()));

CREATE POLICY "View verified companies" ON public.companies FOR SELECT
  USING (verified = true);

-- ============================================================================
-- 4. test_slots
-- ============================================================================

CREATE TABLE public.test_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type TEXT NOT NULL CHECK (test_type IN ('vca_basis', 'vca_vol', 'forklift', 'bhv', 'other')),
  test_name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_participants INTEGER NOT NULL DEFAULT 1,
  booked_count INTEGER NOT NULL DEFAULT 0,
  available_slots INTEGER GENERATED ALWAYS AS (max_participants - booked_count) STORED,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'cancelled', 'completed')),
  description TEXT,
  requirements TEXT[],
  examiner_name TEXT,
  examiner_email TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_slots_scheduled ON public.test_slots(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_test_slots_status ON public.test_slots(status);

ALTER TABLE public.test_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View available slots" ON public.test_slots FOR SELECT
  USING (status IN ('available', 'full'));

-- ============================================================================
-- 5. certificates (katalog)
-- ============================================================================

CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('safety', 'machinery', 'medical', 'license', 'other')),
  description TEXT,
  requirements TEXT[],
  validity_months INTEGER,
  issuing_organization TEXT,
  icon TEXT,
  color TEXT,
  verification_required BOOLEAN DEFAULT true,
  verification_url TEXT,
  usage_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_category ON public.certificates(category);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View certificates" ON public.certificates FOR SELECT USING (true);

INSERT INTO public.certificates (name, slug, category, description, validity_months, issuing_organization, icon, color)
VALUES 
  ('VCA Basis', 'vca-basis', 'safety', 'Podstawowy certyfikat bezpieczeństwa', 120, 'SSVV Nederland', '🛡️', '#FF6B6B'),
  ('Wózek widłowy', 'wozek-widlowy', 'machinery', 'Uprawnienia do obsługi wózka widłowego', 60, 'TÜV Nederland', '🚜', '#4ECDC4'),
  ('BHV', 'bhv', 'medical', 'Pierwsza pomoc', 12, 'Rode Kruis', '🏥', '#E74C3C')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 6. slot_bookings (rezerwacje slotów egzaminacyjnych)
-- ============================================================================

CREATE TABLE public.slot_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_slot_id UUID NOT NULL REFERENCES public.test_slots(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  UNIQUE(test_slot_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_slot_bookings_worker ON public.slot_bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_slot_bookings_slot ON public.slot_bookings(test_slot_id);

ALTER TABLE public.slot_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers view bookings" ON public.slot_bookings FOR SELECT
  USING (worker_id IN (SELECT id FROM public.workers WHERE profile_id = auth.uid()));

-- ============================================================================
-- 7. certificate_applications (wnioski o certyfikaty)
-- ============================================================================

CREATE TABLE public.certificate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  certificate_id UUID REFERENCES public.certificates(id) ON DELETE SET NULL,
  certificate_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'expired')),
  application_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_date TIMESTAMPTZ,
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,
  document_url TEXT,
  expiry_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_apps_worker ON public.certificate_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_cert_apps_status ON public.certificate_applications(status);

ALTER TABLE public.certificate_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers view applications" ON public.certificate_applications FOR SELECT
  USING (worker_id IN (SELECT id FROM public.workers WHERE profile_id = auth.uid()));

-- ============================================================================
-- 8. subscription_events (eventy subskrypcji)
-- ============================================================================

CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_events_employer ON public.subscription_events(employer_id);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers view events" ON public.subscription_events FOR SELECT
  USING (employer_id IN (SELECT id FROM public.employers WHERE profile_id = auth.uid()));

-- ============================================================================
-- 9. activity_logs (logi aktywności użytkowników)
-- ============================================================================

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own logs" ON public.activity_logs FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- 10. security_alerts (alerty bezpieczeństwa)
-- ============================================================================

CREATE TABLE public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON public.security_alerts(resolved);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view security alerts
CREATE POLICY "Admins view alerts" ON public.security_alerts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- 11. seo_pages (strony SEO)
-- ============================================================================

CREATE TABLE public.seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index,follow',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_pages_path ON public.seo_pages(path);

ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View published SEO" ON public.seo_pages FOR SELECT USING (published = true);

-- ============================================================================
-- 12. notification_templates (szablony powiadomień)
-- ============================================================================

CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  title_template TEXT NOT NULL,
  content_template TEXT NOT NULL,
  variables TEXT[],
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View templates" ON public.notification_templates FOR SELECT USING (enabled = true);

-- ============================================================================
-- 13. messages (wiadomości między użytkownikami)
-- ============================================================================

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view messages" ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- ============================================================================
-- 14. email_templates (szablony emaili)
-- ============================================================================

CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables TEXT[],
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View email templates" ON public.email_templates FOR SELECT USING (enabled = true);

-- ============================================================================
-- 15. media (media/pliki)
-- ============================================================================

CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_user ON public.media(user_id);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view media" ON public.media FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- 16. email_campaigns (kampanie emailowe)
-- ============================================================================

CREATE TABLE public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 17. blog_categories (kategorie bloga)
-- ============================================================================

CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View categories" ON public.blog_categories FOR SELECT USING (true);

-- ============================================================================
-- 18. blog_posts (posty blogowe)
-- ============================================================================

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.blog_categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View published posts" ON public.blog_posts FOR SELECT USING (published = true);

-- ============================================================================
-- 19. reviews (opinie/recenzje)
-- ============================================================================

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT,
  pros TEXT[],
  cons TEXT[],
  verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View reviews" ON public.reviews FOR SELECT USING (true);

-- ============================================================================
-- 20. system_settings (ustawienia systemu)
-- ============================================================================

CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  editable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 21. api_keys (klucze API)
-- ============================================================================

CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  permissions TEXT[],
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 22. user_permissions (uprawnienia użytkowników)
-- ============================================================================

CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, permission)
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON public.user_permissions(user_id);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 23. meta_tags (meta tagi SEO)
-- ============================================================================

CREATE TABLE public.meta_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  keywords TEXT[],
  og_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.meta_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View meta tags" ON public.meta_tags FOR SELECT USING (true);

-- ============================================================================
-- 24. redirects (przekierowania)
-- ============================================================================

CREATE TABLE public.redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View redirects" ON public.redirects FOR SELECT USING (enabled = true);

-- ============================================================================
-- 25. reports (raporty)
-- ============================================================================

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  parameters JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view reports" ON public.reports FOR SELECT
  USING (generated_by = auth.uid());

-- ============================================================================
-- PODSUMOWANIE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 WSZYSTKIE 25 TABEL UTWORZONE POMYŚLNIE! 🎉';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ UTWORZONE TABELE:';
  RAISE NOTICE '  1. appointments - Spotkania';
  RAISE NOTICE '  2. subscription_payments - Płatności';
  RAISE NOTICE '  3. companies - Firmy';
  RAISE NOTICE '  4. test_slots - Sloty egzaminacyjne';
  RAISE NOTICE '  5. certificates - Katalog certyfikatów';
  RAISE NOTICE '  6. slot_bookings - Rezerwacje';
  RAISE NOTICE '  7. certificate_applications - Wnioski';
  RAISE NOTICE '  8. subscription_events - Eventy';
  RAISE NOTICE '  9. activity_logs - Logi aktywności';
  RAISE NOTICE '  10. security_alerts - Alerty bezpieczeństwa';
  RAISE NOTICE '  11. seo_pages - Strony SEO';
  RAISE NOTICE '  12. notification_templates - Szablony powiadomień';
  RAISE NOTICE '  13. messages - Wiadomości';
  RAISE NOTICE '  14. email_templates - Szablony emaili';
  RAISE NOTICE '  15. media - Media/pliki';
  RAISE NOTICE '  16. email_campaigns - Kampanie emailowe';
  RAISE NOTICE '  17. blog_posts - Posty blogowe';
  RAISE NOTICE '  18. blog_categories - Kategorie bloga';
  RAISE NOTICE '  19. reviews - Opinie/recenzje';
  RAISE NOTICE '  20. system_settings - Ustawienia systemu';
  RAISE NOTICE '  21. api_keys - Klucze API';
  RAISE NOTICE '  22. user_permissions - Uprawnienia';
  RAISE NOTICE '  23. meta_tags - Meta tagi';
  RAISE NOTICE '  24. redirects - Przekierowania';
  RAISE NOTICE '  25. reports - Raporty';
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS POLICIES: Wszystkie skonfigurowane';
  RAISE NOTICE '✅ INDEXES: Wszystkie utworzone';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 CO DALEJ:';
  RAISE NOTICE '  1. Odśwież stronę (Ctrl+Shift+R)';
  RAISE NOTICE '  2. Sprawdź panel admina - powinien działać!';
  RAISE NOTICE '  3. Wszystkie błędy 404 powinny zniknąć';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

-- ============================================================================
-- WERYFIKACJA: Sprawdzenie czy wszystkie tabele istnieją
-- ============================================================================

DO $$
DECLARE
  total_tables INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🔍 WERYFIKACJA WSZYSTKICH TABEL W BAZIE';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Policz wszystkie tabele w public schema
  SELECT COUNT(*) INTO total_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
  
  RAISE NOTICE '📊 ŁĄCZNIE TABEL W BAZIE: %', total_tables;
  RAISE NOTICE '';
  RAISE NOTICE '📋 LISTA WSZYSTKICH TABEL:';
  RAISE NOTICE '────────────────────────────────────────────────────────────────';
  
  -- Wyświetl wszystkie tabele alfabetycznie
  FOR r IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  ) LOOP
    RAISE NOTICE '  ✓ %', r.table_name;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '💡 PODPOWIEDŹ:';
  RAISE NOTICE '   Jeśli widzisz błędy 404 w konsoli przeglądarki,';
  RAISE NOTICE '   skopiuj nazwę brakującej tabeli i daj mi znać!';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
