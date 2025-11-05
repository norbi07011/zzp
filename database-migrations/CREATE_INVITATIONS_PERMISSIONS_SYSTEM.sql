-- ============================================
-- MIGRATION: System zaproszeń i uprawnień dla projektów
-- Date: 2025-10-29
-- Author: AI Copilot
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE project_permissions CASCADE;
-- DROP TABLE project_invitations CASCADE;
-- DROP TYPE invitation_status CASCADE;
-- DROP TYPE permission_scope CASCADE;

-- STEP 1: Tworzenie ENUM typów
DO $$ BEGIN

-- Status zaproszeń
CREATE TYPE invitation_status AS ENUM (
  'pending',     -- oczekuje na odpowiedź
  'accepted',    -- zaakceptowane
  'declined',    -- odrzucone  
  'expired',     -- wygasłe
  'cancelled'    -- anulowane przez wysyłającego
);

-- Zakresy uprawnień (granular permissions)
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
    RAISE NOTICE 'ENUM types already exist, skipping...';
END $$;

-- STEP 2: Tabela zaproszeń do projektów
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Podstawowe dane
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- jeśli użytkownik już istnieje
  
  -- Token i bezpieczeństwo
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  
  -- Uprawnienia które otrzyma zaproszony
  granted_permissions permission_scope[] NOT NULL DEFAULT '{}',
  role_title VARCHAR(100) DEFAULT 'Członek zespołu', -- np. "Kierownik budowy", "Elektryk"
  
  -- Metadata
  personal_message TEXT, -- osobista wiadomość od zapraszającego
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Status
  status invitation_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (invited_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at),
  CONSTRAINT status_timestamp CHECK (
    (status = 'pending' AND responded_at IS NULL) OR 
    (status != 'pending' AND responded_at IS NOT NULL)
  )
);

-- STEP 3: Tabela uprawnień członków projektów
CREATE TABLE IF NOT EXISTS project_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Podstawowe relacje
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Uprawnienia
  permissions permission_scope[] NOT NULL DEFAULT '{}',
  role_title VARCHAR(100) NOT NULL DEFAULT 'Członek zespołu',
  
  -- Metadata
  granted_by UUID NOT NULL REFERENCES auth.users(id), -- kto nadał uprawnienia
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
  CONSTRAINT non_empty_permissions CHECK (array_length(permissions, 1) > 0),
  CONSTRAINT modification_timestamp CHECK (
    (last_modified_by IS NULL AND last_modified_at IS NULL) OR
    (last_modified_by IS NOT NULL AND last_modified_at IS NOT NULL)
  )
);

-- STEP 4: Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_project_invitations_project ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON project_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_status ON project_invitations(status);
CREATE INDEX IF NOT EXISTS idx_project_invitations_expires ON project_invitations(expires_at);

CREATE INDEX IF NOT EXISTS idx_project_permissions_project ON project_permissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_user ON project_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_active ON project_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_project_permissions_role ON project_permissions(role_title);

-- STEP 5: Triggery dla automatycznych operacji

-- Trigger: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invitations_updated_at
  BEFORE UPDATE ON project_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_permissions_updated_at
  BEFORE UPDATE ON project_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invitation_token IS NULL OR NEW.invitation_token = '' THEN
    NEW.invitation_token = encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_invitation_token
  BEFORE INSERT ON project_invitations
  FOR EACH ROW
  EXECUTE FUNCTION generate_invitation_token();

-- Trigger: Auto-create permissions on invitation acceptance
CREATE OR REPLACE FUNCTION create_permissions_on_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- Jeśli zaproszenie zostało zaakceptowane i użytkownik jest znany
  IF NEW.status = 'accepted' AND OLD.status = 'pending' AND NEW.invited_user_id IS NOT NULL THEN
    
    -- Sprawdź czy już nie ma uprawnień
    IF NOT EXISTS (
      SELECT 1 FROM project_permissions 
      WHERE project_id = NEW.project_id AND user_id = NEW.invited_user_id
    ) THEN
      
      -- Utwórz wpis w project_permissions
      INSERT INTO project_permissions (
        project_id,
        user_id,
        permissions,
        role_title,
        granted_by
      ) VALUES (
        NEW.project_id,
        NEW.invited_user_id,
        NEW.granted_permissions,
        NEW.role_title,
        NEW.invited_by
      );
      
    END IF;
    
    -- Ustaw timestamp odpowiedzi
    NEW.responded_at = NOW();
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_permissions_on_acceptance
  BEFORE UPDATE ON project_invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_permissions_on_acceptance();

-- STEP 6: RLS Policies

-- Polityki dla project_invitations
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Twórcy projektów mogą zarządzać zaproszeniami swoich projektów
CREATE POLICY "Owners can manage project invitations" ON project_invitations
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Osoby z uprawnieniami invite_members mogą zapraszać
CREATE POLICY "Users with invite_members can create invitations" ON project_invitations
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_permissions 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND 'invite_members' = ANY(permissions)
    )
  );

-- Zaproszeni mogą oglądać swoje zaproszenia
CREATE POLICY "Invited users can view their invitations" ON project_invitations
  FOR SELECT USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    invited_user_id = auth.uid()
  );

-- Polityki dla project_permissions
ALTER TABLE project_permissions ENABLE ROW LEVEL SECURITY;

-- Właściciele projektów mogą zarządzać wszystkimi uprawnieniami
CREATE POLICY "Project owners can manage all permissions" ON project_permissions
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Użytkownicy mogą oglądać swoje uprawnienia
CREATE POLICY "Users can view their own permissions" ON project_permissions
  FOR SELECT USING (user_id = auth.uid());

-- Użytkownicy z manage_team mogą zarządzać uprawnieniami innych
CREATE POLICY "Users with manage_team can manage permissions" ON project_permissions
  FOR ALL USING (
    project_id IN (
      SELECT project_id FROM project_permissions 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND 'manage_team' = ANY(permissions)
    )
  );

-- STEP 7: Funkcje RPC dla zarządzania uprawnieniami

-- Funkcja sprawdzania uprawnień
CREATE OR REPLACE FUNCTION check_user_permission(
  p_project_id UUID,
  p_user_id UUID,
  p_permission permission_scope
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_permissions
    WHERE project_id = p_project_id
    AND user_id = p_user_id
    AND is_active = true
    AND (p_permission = ANY(permissions) OR 'full_admin' = ANY(permissions))
  );
END;
$$ LANGUAGE plpgsql;

-- Funkcja akceptacji zaproszenia
CREATE OR REPLACE FUNCTION accept_invitation(p_invitation_token VARCHAR)
RETURNS JSON AS $$
DECLARE
  invitation_record project_invitations%ROWTYPE;
  result JSON;
BEGIN
  -- Znajdź zaproszenie
  SELECT * INTO invitation_record
  FROM project_invitations
  WHERE invitation_token = p_invitation_token
  AND status = 'pending'
  AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Zaproszenie nie zostało znalezione lub wygasło'
    );
  END IF;
  
  -- Aktualizuj zaproszenie
  UPDATE project_invitations
  SET status = 'accepted',
      invited_user_id = auth.uid(),
      responded_at = NOW()
  WHERE id = invitation_record.id;
  
  RETURN json_build_object(
    'success', true,
    'project_id', invitation_record.project_id,
    'role_title', invitation_record.role_title,
    'permissions', invitation_record.granted_permissions
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 8: Verify tables creation
SELECT 
  'project_invitations' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_invitations') 
    THEN '✅ CREATED' ELSE '❌ FAILED' END as status
UNION ALL
SELECT 'project_permissions', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_permissions') 
    THEN '✅ CREATED' ELSE '❌ FAILED' END;

-- Sprawdź ENUM types
SELECT enumname as enum_name, 
       array_agg(enumlabel ORDER BY enumsortorder) as values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE enumname IN ('invitation_status', 'permission_scope')
GROUP BY enumname
ORDER BY enumname;