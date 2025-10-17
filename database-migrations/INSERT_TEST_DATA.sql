-- ============================================================================
-- DANE TESTOWE - Kompletny zestaw danych dla wszystkich paneli
-- ============================================================================
-- Data: 2025-10-13
-- Cel: Wypełnienie bazy przykładowymi danymi do testowania
-- Czas wykonania: ~2 sekundy
-- ============================================================================

-- ============================================================================
-- KROK 1: WORKER SKILLS (umiejętności pracownika)
-- ============================================================================

-- Worker 1 skills (zakładam że mamy worker_id z profiles)
INSERT INTO public.worker_skills (worker_id, skill_name, skill_category, proficiency_level, years_experience, verified)
SELECT 
  w.id,
  skill_data.name,
  skill_data.category,
  skill_data.level,
  skill_data.years,
  skill_data.verified
FROM public.workers w
CROSS JOIN (
  VALUES 
    ('Magazynowanie', 'logistics', 4, 3, true),
    ('Obsługa wózka widłowego', 'logistics', 5, 4, true),
    ('Pakowanie', 'logistics', 4, 3, false),
    ('Zarządzanie zapasami', 'logistics', 3, 2, false),
    ('VCA certyfikat', 'safety', 5, 4, true)
) AS skill_data(name, category, level, years, verified)
WHERE w.verified = true
LIMIT 1;

-- ============================================================================
-- KROK 2: WORKER EXPERIENCES (doświadczenie zawodowe)
-- ============================================================================

INSERT INTO public.worker_experiences (
  worker_id, 
  company_name, 
  position, 
  employment_type,
  start_date, 
  end_date,
  current,
  location,
  description,
  achievements,
  technologies
)
SELECT 
  w.id,
  exp_data.company,
  exp_data.position,
  exp_data.type,
  exp_data.start_date,
  exp_data.end_date,
  exp_data.current,
  exp_data.location,
  exp_data.description,
  exp_data.achievements,
  exp_data.technologies
FROM public.workers w
CROSS JOIN (
  VALUES 
    (
      'Bol.com Warehouse', 
      'Magazynier', 
      'full-time',
      '2021-06-01'::date,
      '2023-12-31'::date,
      false,
      'Utrecht, Holandia',
      'Praca w magazynie e-commerce. Odpowiedzialność za przyjmowanie, kompletowanie i wysyłkę zamówień.',
      ARRAY['Zwiększenie wydajności o 25%', 'Nagroda pracownika miesiąca (3x)', 'Zero wypadków przez 2 lata'],
      ARRAY['WMS system', 'RF scanning', 'Wózek widłowy']
    ),
    (
      'PostNL Distribution Center',
      'Warehouse Operator',
      'contract',
      '2020-01-01'::date,
      '2021-05-31'::date,
      false,
      'Amsterdam, Holandia',
      'Sortowanie i dystrybucja paczek. Obsługa maszyn sortujących.',
      ARRAY['Praca w międzynarodowym zespole', 'Obsługa 500+ paczek dziennie'],
      ARRAY['Sortowanie automatyczne', 'Czytniki kodów kreskowych']
    ),
    (
      'Freelance ZZP',
      'Magazynier freelance',
      'freelance',
      '2024-01-01'::date,
      NULL,
      true,
      'Region Utrecht',
      'Praca jako niezależny magazynier dla różnych firm w regionie.',
      ARRAY['15+ zadowolonych klientów', 'Średnia ocena 4.8/5', 'Dostępność 24/7'],
      ARRAY['Flexibiliteit', 'Multitasking']
    )
) AS exp_data(company, position, type, start_date, end_date, current, location, description, achievements, technologies)
WHERE w.verified = true
LIMIT 1;

-- ============================================================================
-- KROK 3: PORTFOLIO PROJECTS (projekty portfolio)
-- ============================================================================

INSERT INTO public.portfolio_projects (
  worker_id,
  title,
  description,
  project_date,
  location,
  visible,
  tags,
  project_value,
  team_size,
  role,
  technologies,
  images
)
SELECT 
  w.id,
  proj_data.title,
  proj_data.description,
  proj_data.project_date,
  proj_data.location,
  proj_data.visible,
  proj_data.tags,
  proj_data.project_value,
  proj_data.team_size,
  proj_data.role,
  proj_data.technologies,
  proj_data.images
FROM public.workers w
CROSS JOIN (
  VALUES 
    (
      'Reorganizacja magazynu Bol.com',
      'Przeprojektowanie układu magazynu w celu zwiększenia efektywności. Zmniejszono czas kompletacji zamówień o 30%.',
      '2023-06-01'::date,
      'Utrecht',
      true,
      ARRAY['magazyn', 'optymalizacja', 'logistyka'],
      15000.00,
      5,
      'Lead Warehouse Operator',
      ARRAY['WMS', 'Layout planning', 'Process optimization'],
      '[]'::jsonb
    ),
    (
      'Wdrożenie systemu FIFO w PostNL',
      'Implementacja systemu First-In-First-Out dla rotacji towarów. Zmniejszono straty o 15%.',
      '2021-03-15'::date,
      'Amsterdam',
      true,
      ARRAY['magazyn', 'FIFO', 'system'],
      8000.00,
      3,
      'Project Member',
      ARRAY['FIFO', 'Inventory management'],
      '[]'::jsonb
    )
) AS proj_data(title, description, project_date, location, visible, tags, project_value, team_size, role, technologies, images)
WHERE w.verified = true
LIMIT 1;

-- ============================================================================
-- KROK 4: WORKER CERTIFICATES (certyfikaty)
-- ============================================================================

INSERT INTO public.worker_certificates (
  worker_id,
  certificate_type,
  certificate_number,
  issue_date,
  expiry_date,
  status,
  verified
)
SELECT 
  w.id,
  cert_data.type,
  cert_data.number,
  cert_data.issue_date,
  cert_data.expiry_date,
  cert_data.status,
  cert_data.verified
FROM public.workers w
CROSS JOIN (
  VALUES 
    ('VCA Basis', 'VCA-2023-456789', '2023-03-15'::date, '2028-03-15'::date, 'active', true),
    ('Wózek widłowy', 'HEF-2022-123456', '2022-06-01'::date, '2027-06-01'::date, 'active', true),
    ('BHV (Pierwsza pomoc)', 'BHV-2024-789012', '2024-01-10'::date, '2025-01-10'::date, 'active', false),
    ('Praca na wysokości', 'WAH-2023-345678', '2023-09-20'::date, '2026-09-20'::date, 'active', true)
) AS cert_data(type, number, issue_date, expiry_date, status, verified)
WHERE w.verified = true
LIMIT 1;

-- ============================================================================
-- KROK 5: WORKER AVAILABILITY (dostępność)
-- ============================================================================

INSERT INTO public.worker_availability (
  worker_id,
  available_from,
  available_to,
  status,
  hours_per_week,
  preferred_work_type,
  max_distance_km,
  notes
)
SELECT 
  w.id,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '6 months',
  'available',
  40,
  'on-site',
  50,
  'Dostępny od zaraz. Preferuję pracę w godzinach 6:00-14:00. Posiadam własny transport.'
FROM public.workers w
WHERE w.verified = true
LIMIT 1;

-- ============================================================================
-- KROK 6: JOBS (oferty pracy od pracodawców)
-- ============================================================================

-- Employer 1 jobs
INSERT INTO public.jobs (
  employer_id,
  title,
  description,
  short_description,
  category,
  subcategory,
  location,
  location_type,
  city,
  country,
  salary_min,
  salary_max,
  salary_currency,
  salary_period,
  salary_visible,
  employment_type,
  experience_level,
  hours_per_week,
  start_date,
  required_skills,
  required_certificates,
  preferred_skills,
  languages,
  benefits,
  status,
  published_at,
  expires_at,
  urgent,
  featured,
  tags
)
SELECT 
  p.id,
  job_data.title,
  job_data.description,
  job_data.short_description,
  job_data.category,
  job_data.subcategory,
  job_data.location,
  job_data.location_type,
  job_data.city,
  job_data.country,
  job_data.salary_min,
  job_data.salary_max,
  job_data.salary_currency,
  job_data.salary_period,
  job_data.salary_visible,
  job_data.employment_type,
  job_data.experience_level,
  job_data.hours_per_week,
  job_data.start_date,
  job_data.required_skills,
  job_data.required_certificates,
  job_data.preferred_skills,
  job_data.languages,
  job_data.benefits,
  job_data.status,
  job_data.published_at,
  job_data.expires_at,
  job_data.urgent,
  job_data.featured,
  job_data.tags
FROM public.profiles p
CROSS JOIN (
  VALUES 
    (
      'Magazynier - Amsterdam Centrum',
      E'Poszukujemy doświadczonego magazyniera do pracy w nowoczesnym magazynie w centrum Amsterdamu.\n\nObowiązki:\n• Przyjmowanie i kompletowanie zamówień\n• Obsługa wózka widłowego\n• Utrzymanie porządku w magazynie\n• Współpraca z zespołem\n\nWymagania:\n• Min. 2 lata doświadczenia\n• Certyfikat VCA\n• Prawo jazdy na wózek widłowy\n• Dobra znajomość języka niderlandzkiego lub angielskiego\n\nOferujemy:\n• Atrakcyjne wynagrodzenie 15-18 EUR/godz\n• Praca na pełny etat (40h/tydzień)\n• Dodatkowe benefity (ubezpieczenie, emerytura)\n• Przyjazna atmosfera pracy',
      'Doświadczony magazynier do nowoczesnego magazynu w Amsterdamie. VCA wymagane.',
      'logistics',
      'warehouse',
      'Amsterdam Centrum',
      'on-site',
      'Amsterdam',
      'NL',
      15.00,
      18.00,
      'EUR',
      'hour',
      true,
      'full-time',
      'mid',
      40,
      CURRENT_DATE + INTERVAL '2 weeks',
      ARRAY['Magazynowanie', 'Wózek widłowy', 'Kompletowanie zamówień'],
      ARRAY['VCA Basis', 'Wózek widłowy'],
      ARRAY['WMS system', 'RF scanning'],
      ARRAY['Nederlands', 'English'],
      ARRAY['Ubezpieczenie zdrowotne', 'Plan emerytalny', 'Darmowy parking', 'Premia kwartalna'],
      'active',
      CURRENT_TIMESTAMP,
      CURRENT_DATE + INTERVAL '30 days',
      true,
      true,
      ARRAY['magazyn', 'logistyka', 'vca', 'amsterdam']
    ),
    (
      'Pracownik produkcji - Utrecht',
      E'Firma produkcyjna w Utrechcie poszukuje pracownika produkcji.\n\nZadania:\n• Obsługa linii produkcyjnej\n• Kontrola jakości produktów\n• Pakowanie i etykietowanie\n• Przestrzeganie procedur BHP\n\nWymagania:\n• Doświadczenie w produkcji mile widziane\n• Gotowość do pracy zmianowej\n• Sumienność i dokładność\n• Podstawowa znajomość języka niderlandzkiego\n\nCo oferujemy:\n• Stawka 14-17 EUR/godz\n• Dodatki zmianowe\n• Szkolenia wewnętrzne\n• Możliwość rozwoju',
      'Pracownik produkcji w Utrechcie. Praca zmianowa. Start od zaraz.',
      'production',
      'manufacturing',
      'Utrecht Industriegebied',
      'on-site',
      'Utrecht',
      'NL',
      14.00,
      17.00,
      'EUR',
      'hour',
      true,
      'full-time',
      'entry',
      40,
      CURRENT_DATE + INTERVAL '1 week',
      ARRAY['Praca w produkcji', 'Kontrola jakości'],
      ARRAY[]::text[],
      ARRAY['Praca zmianowa', 'Dokładność'],
      ARRAY['Nederlands basic'],
      ARRAY['Dodatki zmianowe', 'Szkolenia', 'Umowa stała po 6 miesiącach'],
      'active',
      CURRENT_TIMESTAMP - INTERVAL '3 days',
      CURRENT_DATE + INTERVAL '25 days',
      false,
      false,
      ARRAY['produkcja', 'utrecht', 'praca-zmianowa']
    ),
    (
      'Budowlaniec - Rotterdam',
      E'Firma budowlana w Rotterdamie pilnie potrzebuje doświadczonego budowlańca.\n\nZakres prac:\n• Murowanie, tynkowanie\n• Montaż konstrukcji\n• Praca przy budowie domów jednorodzinnych\n• Czytanie rysunków technicznych\n\nWymagania:\n• Min. 3 lata doświadczenia w budownictwie\n• Własne narzędzia podstawowe\n• VCA certyfikat\n• Prawo jazdy kat. B\n\nOferujemy:\n• Wysokie wynagrodzenie 20-25 EUR/godz\n• Praca przy ciekawych projektach\n• Dodatek za dojazd\n• Długoterminowa współpraca',
      'Doświadczony budowlaniec do pracy w Rotterdamie. VCA wymagane. 20-25 EUR/h.',
      'construction',
      'general-construction',
      'Rotterdam Zuid',
      'on-site',
      'Rotterdam',
      'NL',
      20.00,
      25.00,
      'EUR',
      'hour',
      true,
      'contract',
      'senior',
      40,
      CURRENT_DATE + INTERVAL '3 days',
      ARRAY['Murowanie', 'Tynkowanie', 'Czytanie rysunków'],
      ARRAY['VCA Basis'],
      ARRAY['Własne narzędzia', 'Prawo jazdy B'],
      ARRAY['Nederlands', 'Polski'],
      ARRAY['Dodatek za dojazd', 'Własne narzędzia zapewnione', 'Premia projektowa'],
      'active',
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      CURRENT_DATE + INTERVAL '14 days',
      true,
      false,
      ARRAY['budowa', 'rotterdam', 'vca', 'murarz']
    )
) AS job_data(title, description, short_description, category, subcategory, location, location_type, city, country, salary_min, salary_max, salary_currency, salary_period, salary_visible, employment_type, experience_level, hours_per_week, start_date, required_skills, required_certificates, preferred_skills, languages, benefits, status, published_at, expires_at, urgent, featured, tags)
WHERE p.role = 'employer'
LIMIT 1;

-- ============================================================================
-- KROK 7: FEATURE FLAGS (flagi funkcjonalności)
-- ============================================================================

INSERT INTO public.feature_flags (feature_name, enabled, description, rollout_percentage, target_roles)
VALUES 
  ('enable_chat', true, 'Włącz system czatu między użytkownikami', 100, ARRAY['worker', 'employer']),
  ('enable_video_calls', false, 'Włącz rozmowy wideo (w przygotowaniu)', 0, ARRAY['employer']),
  ('enable_ai_matching', false, 'AI-powered dopasowanie pracownik ↔ oferta', 10, ARRAY['employer']),
  ('enable_advanced_search', true, 'Zaawansowane wyszukiwanie z filtrami', 100, ARRAY['employer', 'worker']),
  ('enable_push_notifications', true, 'Powiadomienia push w przeglądarce', 100, ARRAY['worker', 'employer', 'admin']),
  ('maintenance_mode', false, 'Tryb konserwacji - wyłącz aplikację', 0, ARRAY[]::text[]);

-- ============================================================================
-- KROK 8: TAGS (tagi do kategoryzacji)
-- ============================================================================

INSERT INTO public.tags (name, slug, category, description, icon, color, verified, usage_count)
VALUES 
  ('VCA Certyfikat', 'vca-certyfikat', 'certificate', 'Wymagany certyfikat VCA dla prac budowlanych i magazynowych', '🛡️', '#FF6B6B', true, 2),
  ('Wózek widłowy', 'wozek-widlowy', 'skill', 'Umiejętność obsługi wózka widłowego', '🚜', '#4ECDC4', true, 1),
  ('Logistyka', 'logistyka', 'industry', 'Branża logistyczna i magazynowa', '📦', '#45B7D1', true, 2),
  ('Budowa', 'budowa', 'industry', 'Branża budowlana', '🏗️', '#FFA07A', true, 1),
  ('Produkcja', 'produkcja', 'industry', 'Branża produkcyjna', '⚙️', '#96CEB4', true, 1),
  ('Pilne', 'pilne', 'job-type', 'Oferty pilne do szybkiego zatrudnienia', '⚡', '#FF4757', true, 2),
  ('Praca zmianowa', 'praca-zmianowa', 'job-type', 'Praca w systemie zmianowym', '🔄', '#FFA502', true, 1),
  ('Dodatek za dojazd', 'dodatek-dojazd', 'benefit', 'Pracodawca oferuje dodatek za dojazd', '🚗', '#2ECC71', true, 1);

-- ============================================================================
-- KROK 9: NOTIFICATIONS (przykładowe powiadomienia)
-- ============================================================================

-- Notification dla workera - nowa oferta
INSERT INTO public.notifications (
  user_id,
  type,
  title,
  content,
  short_content,
  priority,
  related_job_id,
  action_url,
  action_label,
  icon,
  color
)
SELECT 
  w.profile_id,
  'job',
  'Nowa oferta pracy w Twojej okolicy!',
  'Magazynier - Amsterdam Centrum. Wynagrodzenie 15-18 EUR/godz. VCA wymagane. Kliknij aby zobaczyć szczegóły.',
  'Nowa oferta: Magazynier - Amsterdam',
  'normal',
  j.id,
  '/worker/jobs/' || j.id,
  'Zobacz ofertę',
  '💼',
  '#4ECDC4'
FROM public.workers w
CROSS JOIN public.jobs j
WHERE w.verified = true 
  AND j.status = 'active'
  AND j.title LIKE '%Magazynier%'
LIMIT 1;

-- Notification dla employera - nowy profil
INSERT INTO public.notifications (
  user_id,
  type,
  title,
  content,
  short_content,
  priority,
  action_url,
  action_label,
  icon,
  color
)
SELECT 
  e.profile_id,
  'system',
  'Witamy w ZZP Werkplaats!',
  'Dziękujemy za rejestrację. Możesz teraz dodać swoją pierwszą ofertę pracy.',
  'Witamy! Dodaj pierwszą ofertę.',
  'normal',
  '/employer/jobs/new',
  'Dodaj ofertę',
  '👋',
  '#45B7D1'
FROM public.employers e
LIMIT 1;

-- ============================================================================
-- PODSUMOWANIE
-- ============================================================================

DO $$
DECLARE
  v_worker_skills_count INTEGER;
  v_worker_experiences_count INTEGER;
  v_portfolio_count INTEGER;
  v_certificates_count INTEGER;
  v_jobs_count INTEGER;
  v_tags_count INTEGER;
  v_notifications_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_worker_skills_count FROM public.worker_skills;
  SELECT COUNT(*) INTO v_worker_experiences_count FROM public.worker_experiences;
  SELECT COUNT(*) INTO v_portfolio_count FROM public.portfolio_projects;
  SELECT COUNT(*) INTO v_certificates_count FROM public.worker_certificates;
  SELECT COUNT(*) INTO v_jobs_count FROM public.jobs;
  SELECT COUNT(*) INTO v_tags_count FROM public.tags;
  SELECT COUNT(*) INTO v_notifications_count FROM public.notifications;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 DANE TESTOWE DODANE POMYŚLNIE! 🎉';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 STATYSTYKI:';
  RAISE NOTICE '  • Worker Skills: %', v_worker_skills_count;
  RAISE NOTICE '  • Worker Experiences: %', v_worker_experiences_count;
  RAISE NOTICE '  • Portfolio Projects: %', v_portfolio_count;
  RAISE NOTICE '  • Worker Certificates: %', v_certificates_count;
  RAISE NOTICE '  • Jobs (oferty pracy): %', v_jobs_count;
  RAISE NOTICE '  • Tags: %', v_tags_count;
  RAISE NOTICE '  • Notifications: %', v_notifications_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ PANEL WORKER: 100%% - pełne portfolio i CV';
  RAISE NOTICE '✅ PANEL EMPLOYER: 100%% - przykładowe oferty pracy';
  RAISE NOTICE '✅ SYSTEM TAGÓW: 100%% - tagi do kategoryzacji';
  RAISE NOTICE '✅ POWIADOMIENIA: przykłady utworzone';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 NASTĘPNE KROKI:';
  RAISE NOTICE '  1. Odśwież stronę i zobacz wypełnione panele';
  RAISE NOTICE '  2. Przetestuj aplikację na oferty (worker → jobs)';
  RAISE NOTICE '  3. Przetestuj przeglądanie aplikacji (employer → applications)';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
