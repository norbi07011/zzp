/*
  # FIX: Auto-tworzenie Worker i Employer Profili

  ## Problem
  Trigger tworzy tylko profil w tabeli `profiles`, ale NIE tworzy wpisu w `workers` lub `employers`.
  To powoduje błędy w aplikacji, bo panele wymagają tych danych.

  ## Rozwiązanie
  Ulepszony trigger, który:
  1. Tworzy profil w `profiles`
  2. Automatycznie tworzy wpis w `workers` dla role='worker'
  3. Automatycznie tworzy wpis w `employers` dla role='employer'

  ## Bezpieczeństwo
  - Trigger działa tylko dla nowych użytkowników
  - Używa SECURITY DEFINER dla pełnych uprawnień
  - Nie nadpisuje istniejących danych
*/

-- Usuń stary trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Nowa funkcja z auto-tworzeniem worker/employer
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_full_name text;
  new_profile_id uuid;
BEGIN
  -- Wyciągnij dane z metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'worker');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User');

  -- Krok 1: Utwórz profil
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, user_full_name, user_role)
  RETURNING id INTO new_profile_id;

  -- Krok 2: Utwórz wpis w workers lub employers
  IF user_role = 'worker' THEN
    INSERT INTO public.workers (
      profile_id,
      kvk_number,
      specialization,
      hourly_rate,
      years_experience,
      location_city,
      subscription_tier,
      subscription_status
    )
    VALUES (
      new_profile_id,
      '',
      '',
      0,
      0,
      '',
      'basic',
      'active'
    );
  ELSIF user_role = 'employer' THEN
    INSERT INTO public.employers (
      profile_id,
      company_name,
      kvk_number,
      subscription_tier,
      subscription_status
    )
    VALUES (
      new_profile_id,
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'New Company'),
      COALESCE(NEW.raw_user_meta_data->>'kvk_number', ''),
      'basic',
      'inactive'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dodaj trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Napraw istniejących użytkowników (dla tych co już się zarejestrowali)
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Dla każdego profilu typu 'worker' bez wpisu w workers
  FOR profile_record IN 
    SELECT p.id, p.role 
    FROM profiles p
    LEFT JOIN workers w ON p.id = w.profile_id
    WHERE p.role = 'worker' AND w.id IS NULL
  LOOP
    INSERT INTO workers (
      profile_id,
      kvk_number,
      specialization,
      hourly_rate,
      years_experience,
      location_city,
      subscription_tier,
      subscription_status
    )
    VALUES (
      profile_record.id,
      '',
      '',
      0,
      0,
      '',
      'basic',
      'active'
    );
  END LOOP;

  -- Dla każdego profilu typu 'employer' bez wpisu w employers
  FOR profile_record IN 
    SELECT p.id, p.role, p.full_name
    FROM profiles p
    LEFT JOIN employers e ON p.id = e.profile_id
    WHERE p.role = 'employer' AND e.id IS NULL
  LOOP
    INSERT INTO employers (
      profile_id,
      company_name,
      kvk_number,
      subscription_tier,
      subscription_status
    )
    VALUES (
      profile_record.id,
      profile_record.full_name,
      '',
      'basic',
      'inactive'
    );
  END LOOP;
END $$;
