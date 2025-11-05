-- ============================================
-- MIGRATION: Podstawowa tabela projects + system team management
-- Date: 2025-10-29
-- Author: AI Copilot  
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE project_permissions CASCADE;
-- DROP TABLE project_invitations CASCADE;
-- DROP TABLE projects CASCADE;
-- DROP TYPE invitation_status CASCADE;
-- DROP TYPE permission_scope CASCADE;
-- DROP TYPE project_status CASCADE;

-- ===========================================
-- CZĘŚĆ 1: PODSTAWOWA TABELA PROJECTS
-- ===========================================

-- Status projektów
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM (
    'planning',     -- planowanie
    'active',       -- aktywny
    'on_hold',      -- wstrzymany
    'completed',    -- ukończony  
    'cancelled'     -- anulowany
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type project_status already exists, skipping...';
END $$;

-- Główna tabela projektów
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Podstawowe informacje
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_address TEXT, -- adres budowy
  
  -- Właściciel i status
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status project_status NOT NULL DEFAULT 'planning',
  
  -- Daty
  start_date DATE,
  end_date DATE,
  deadline DATE,
  
  -- Budżet i finanse
  budget_total DECIMAL(12,2), -- całkowity budżet
  budget_used DECIMAL(12,2) DEFAULT 0, -- wykorzystany budżet
  
  -- Metadata
  client_name VARCHAR(255), -- nazwa klienta
  client_contact TEXT, -- kontakt do klienta
  project_manager_id UUID REFERENCES auth.users(id), -- kierownik projektu
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (
    (start_date IS NULL OR end_date IS NULL OR start_date <= end_date) AND
    (start_date IS NULL OR deadline IS NULL OR start_date <= deadline)
  ),
  CONSTRAINT valid_budget CHECK (
    budget_total IS NULL OR budget_total >= 0
  ),
  CONSTRAINT valid_budget_used CHECK (
    budget_used >= 0 AND (budget_total IS NULL OR budget_used <= budget_total)
  )
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);

-- ===========================================
-- CZĘŚĆ 2: SYSTEM ZAPROSZEŃ I UPRAWNIEŃ
-- ===========================================

-- Status zaproszeń
DO $$ BEGIN
  CREATE TYPE invitation_status AS ENUM (
    'pending',     -- oczekuje na odpowiedź
    'accepted',    -- zaakceptowane
    'declined',    -- odrzucone  
    'expired',     -- wygasłe
    'cancelled'    -- anulowane przez wysyłającego
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type invitation_status already exists, skipping...';
END $$;

-- Zakresy uprawnień (granular permissions)
DO $$ BEGIN
  CREATE TYPE permission_scope AS ENUM (
    'view_tasks',           -- oglądanie zadań
    'create_tasks',         -- tworzenie zadań
    'edit_tasks',           -- edycja zadań
    'delete_tasks',         -- usuwanie zadań
    'assign_tasks',         -- przypisywanie zadań
    'view_events',          -- oglądanie wydarzeń
    'create_events',        -- tworzenie wydarzeń
    'edit_events',          -- edycja wydarzeń
    'delete_events',        -- usuwanie wydarzeń
    'view_team',            -- oglądanie zespołu
    'manage_team',          -- zarządzanie zespołem
    'invite_members',       -- zapraszanie członków
    'remove_members',       -- usuwanie członków
    'view_financials',      -- oglądanie finansów
    'edit_financials',      -- edycja finansów
    'view_reports',         -- oglądanie raportów
    'export_data',          -- eksport danych
    'project_settings',     -- ustawienia projektu
    'full_admin'            -- pełne uprawnienia administratora
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type permission_scope already exists, skipping...';
END $$;

-- Tabela zaproszeń do projektów
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Podstawowe dane
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Token i bezpieczeństwo
  invitation_token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  -- Uprawnienia które otrzyma zaproszony
  granted_permissions permission_scope[] NOT NULL DEFAULT '{}',
  role_title VARCHAR(100) DEFAULT 'Członek zespołu',
  
  -- Metadata
  personal_message TEXT,
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Status
  status invitation_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (invited_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Tabela uprawnień członków projektów
CREATE TABLE IF NOT EXISTS project_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Podstawowe relacje
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Uprawnienia
  permissions permission_scope[] NOT NULL DEFAULT '{}',
  role_title VARCHAR(100) NOT NULL DEFAULT 'Członek zespołu',
  
  -- Metadata
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_modified_by UUID REFERENCES auth.users(id),
  last_modified_at TIMESTAMP,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_project UNIQUE (project_id, user_id),
  CONSTRAINT non_empty_permissions CHECK (array_length(permissions, 1) > 0)
);

-- ===========================================
-- CZĘŚĆ 3: INDEKSY I TRIGGERY
-- ===========================================

-- Indeksy dla project_invitations
CREATE INDEX IF NOT EXISTS idx_project_invitations_project ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON project_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_status ON project_invitations(status);

-- Indeksy dla project_permissions  
CREATE INDEX IF NOT EXISTS idx_project_permissions_project ON project_permissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_user ON project_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_active ON project_permissions(is_active);

-- Trigger: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery dla projektów
DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggery dla zaproszeń
DROP TRIGGER IF EXISTS trigger_invitations_updated_at ON project_invitations;
CREATE TRIGGER trigger_invitations_updated_at
  BEFORE UPDATE ON project_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggery dla uprawnień
DROP TRIGGER IF EXISTS trigger_permissions_updated_at ON project_permissions;
CREATE TRIGGER trigger_permissions_updated_at
  BEFORE UPDATE ON project_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-create owner permissions on project creation
CREATE OR REPLACE FUNCTION create_owner_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Właściciel projektu automatycznie otrzymuje pełne uprawnienia
  INSERT INTO project_permissions (
    project_id,
    user_id,
    permissions,
    role_title,
    granted_by
  ) VALUES (
    NEW.id,
    NEW.owner_id,
    ARRAY['full_admin']::permission_scope[],
    'Właściciel projektu',
    NEW.owner_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_owner_permissions ON projects;
CREATE TRIGGER trigger_create_owner_permissions
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_owner_permissions();

-- ===========================================
-- CZĘŚĆ 4: RLS POLICIES
-- ===========================================

-- Włącz RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_permissions ENABLE ROW LEVEL SECURITY;

-- Polityki dla projects
DROP POLICY IF EXISTS "Users can view projects they have access to" ON projects;
CREATE POLICY "Users can view projects they have access to" ON projects
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT project_id FROM project_permissions 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Project owners can update their projects" ON projects;
CREATE POLICY "Project owners can update their projects" ON projects
  FOR UPDATE USING (owner_id = auth.uid());

-- Polityki dla project_invitations
DROP POLICY IF EXISTS "Project members can manage invitations" ON project_invitations;
CREATE POLICY "Project members can manage invitations" ON project_invitations
  FOR ALL USING (
    project_id IN (
      SELECT project_id FROM project_permissions 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND ('invite_members' = ANY(permissions) OR 'full_admin' = ANY(permissions))
    )
  );

-- Polityki dla project_permissions
DROP POLICY IF EXISTS "Users can view team permissions" ON project_permissions;
CREATE POLICY "Users can view team permissions" ON project_permissions
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_permissions 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND ('view_team' = ANY(permissions) OR 'full_admin' = ANY(permissions))
    )
  );

-- ===========================================
-- CZĘŚĆ 5: DANE TESTOWE
-- ===========================================

-- Sprawdź czy użytkownik testowy istnieje
DO $$
DECLARE
  test_user_id UUID;
  test_project_id UUID;
BEGIN
  -- Znajdź użytkownika testowego
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'test-employer@example.com'
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    RAISE NOTICE 'Znaleziono użytkownika testowego: %', test_user_id;
    
    -- Utwórz projekt testowy
    INSERT INTO projects (
      title,
      description,
      project_address,
      owner_id,
      status,
      start_date,
      deadline,
      budget_total,
      client_name
    ) VALUES (
      'Demo Building Project - Amsterdam',
      'Kompleksowy projekt budowy domu jednorodzinnego w Amsterdamie. Projekt obejmuje prace wykończeniowe, instalacje elektryczne i hydrauliczne.',
      'Prinsengracht 123, 1015 DX Amsterdam',
      test_user_id,
      'active',
      '2025-01-15',
      '2025-06-30',
      250000.00,
      'Van der Berg Familie'
    )
    RETURNING id INTO test_project_id;
    
    RAISE NOTICE 'Utworzono projekt testowy: %', test_project_id;
    
    -- Utwórz testowe zaproszenie
    INSERT INTO project_invitations (
      project_id,
      invited_by,
      invited_email,
      granted_permissions,
      role_title,
      personal_message
    ) VALUES (
      test_project_id,
      test_user_id,
      'worker@example.com',
      ARRAY['view_tasks', 'create_tasks', 'view_events']::permission_scope[],
      'Pracownik budowlany',
      'Zapraszam Cię do współpracy przy projekcie budowy domu w Amsterdamie. Będziesz odpowiedzialny za prace wykończeniowe.'
    );
    
    RAISE NOTICE 'Utworzono testowe zaproszenie';
    
  ELSE
    RAISE NOTICE 'Brak użytkownika testowego, pomijam tworzenie danych testowych';
  END IF;
END $$;

-- ===========================================
-- CZĘŚĆ 6: VERIFICATION
-- ===========================================

-- Sprawdź utworzone tabele
SELECT 
  'projects' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') 
    THEN '✅ CREATED' ELSE '❌ FAILED' END as status
UNION ALL
SELECT 'project_invitations', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_invitations') 
    THEN '✅ CREATED' ELSE '❌ FAILED' END
UNION ALL
SELECT 'project_permissions', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_permissions') 
    THEN '✅ CREATED' ELSE '❌ FAILED' END;

-- Sprawdź ENUM types
SELECT 
  t.typname as enum_type,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as possible_values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname IN ('project_status', 'invitation_status', 'permission_scope')
GROUP BY t.typname
ORDER BY t.typname;