-- =====================================================
-- ZZP WERKPLAATS - Supabase Test Users Seed Data
-- =====================================================
-- Run this SQL in Supabase SQL Editor to create test users

-- 1. Create admin user profile
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@zzp.nl',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"fullName":"Admin User","role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- 2. Get the admin user ID (replace with actual ID after creating user)
-- You'll need to run this query first to get the user ID:
-- SELECT id, email FROM auth.users WHERE email = 'admin@zzp.nl';

-- 3. Create profile for admin user (replace UUID with actual user ID)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  is_premium,
  language,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@zzp.nl'),
  'admin@zzp.nl',
  'Admin User',
  'admin',
  true,
  'nl',
  now(),
  now()
);

-- 4. Create test employer
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'employer@test.nl',
  crypt('test123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"fullName":"Maria van Dijk","role":"employer"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create employer profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  is_premium,
  language,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'employer@test.nl'),
  'employer@test.nl',
  'Maria van Dijk',
  'employer',
  false,
  'nl',
  now(),
  now()
);

-- Create employer company record
INSERT INTO public.employers (
  profile_id,
  company_name,
  kvk_number,
  industry,
  location_city,
  verified,
  rating,
  rating_count,
  description,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'employer@test.nl'),
  'Bouwbedrijf Amsterdam B.V.',
  '12345678',
  'Bouw & Constructie',
  'Amsterdam',
  true,
  4.5,
  23,
  'Professioneel bouwbedrijf gespecialiseerd in woningbouw en renovatie.',
  now(),
  now()
);

-- 5. Create test worker
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'worker@test.nl',
  crypt('test123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"fullName":"Jan Kowalski","role":"worker"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create worker profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  is_premium,
  language,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'worker@test.nl'),
  'worker@test.nl',
  'Jan Kowalski',
  'worker',
  false,
  'pl',
  now(),
  now()
);

-- Create worker record
INSERT INTO public.workers (
  profile_id,
  kvk_number,
  specialization,
  hourly_rate,
  years_experience,
  location_city,
  radius_km,
  rating,
  rating_count,
  verified,
  bio,
  skills,
  certifications,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'worker@test.nl'),
  '87654321',
  'Elektrische Installaties',
  55.00,
  8,
  'Rotterdam',
  25,
  4.7,
  45,
  true,
  'Ervaren elektricien met specialisatie in industriële installaties en domotica.',
  ARRAY['Elektrische installaties', 'Domotica', 'Industriële automation', 'PV installaties'],
  ARRAY['NEN 3140', 'VOP B', 'VCA'],
  now(),
  now()
);

-- Create test certificate for worker
INSERT INTO public.certificates (
  worker_id,
  certificate_type,
  certificate_number,
  issuer,
  issue_date,
  expiry_date,
  file_url,
  verified,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM public.workers WHERE profile_id = (SELECT id FROM auth.users WHERE email = 'worker@test.nl')),
  'NEN 3140',
  'CERT-2025-002',
  'NSCP Certificatie',
  '2023-01-15',
  '2028-01-15',
  'https://example.com/cert-placeholder.pdf',
  true,
  now(),
  now()
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if users were created successfully
SELECT 
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.is_premium
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('admin@zzp.nl', 'employer@test.nl', 'worker@test.nl')
ORDER BY u.email;

-- Check employer data
SELECT 
  p.email,
  e.company_name,
  e.kvk_number,
  e.industry,
  e.location_city,
  e.verified
FROM public.profiles p
JOIN public.employers e ON p.id = e.profile_id
WHERE p.role = 'employer';

-- Check worker data
SELECT 
  p.email,
  w.specialization,
  w.hourly_rate,
  w.years_experience,
  w.location_city,
  w.verified,
  array_length(w.skills, 1) as skills_count
FROM public.profiles p
JOIN public.workers w ON p.id = w.profile_id
WHERE p.role = 'worker';

-- Check certificates
SELECT 
  p.email,
  c.certificate_type,
  c.certificate_number,
  c.issuer,
  c.verified
FROM public.profiles p
JOIN public.workers w ON p.id = w.profile_id
JOIN public.certificates c ON w.id = c.worker_id
WHERE p.role = 'worker';