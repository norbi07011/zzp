-- ============================================
-- MIGRATION: Communication Projects System
-- Date: 2025-10-29  
-- Author: AI Copilot
-- Purpose: Dodanie tabel do zarządzania projektami komunikacyjnymi
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE IF EXISTS public.communication_projects CASCADE;
-- DROP FUNCTION IF EXISTS public.add_project_member CASCADE;

-- STEP 1: Analyze current state
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('employers', 'profiles', 'project_messages')
ORDER BY table_name, ordinal_position;

-- STEP 2: Create communication projects table
BEGIN;

-- ============================================
-- 1. COMMUNICATION PROJECTS (Projekty komunikacyjne)
-- ============================================
CREATE TABLE IF NOT EXISTS public.communication_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  employer_id UUID REFERENCES public.employers(id) ON DELETE CASCADE,
  employer_name VARCHAR(255), -- Denormalized for performance
  status VARCHAR(20) DEFAULT 'active' CHECK (
    status IN ('active', 'completed', 'paused', 'cancelled')
  ),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Project members and roles
  project_members JSONB DEFAULT '[]'::jsonb, -- Array of user IDs
  assigned_accountants JSONB DEFAULT '[]'::jsonb, -- Array of accountant user IDs
  assigned_workers JSONB DEFAULT '[]'::jsonb, -- Array of worker user IDs
  
  -- Project metadata
  project_type VARCHAR(50) DEFAULT 'construction',
  location_address TEXT,
  location_coordinates JSONB,
  start_date DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  
  -- Statistics (denormalized for performance)
  members_count INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_communication_projects_employer_id ON public.communication_projects(employer_id);
CREATE INDEX IF NOT EXISTS idx_communication_projects_status ON public.communication_projects(status);
CREATE INDEX IF NOT EXISTS idx_communication_projects_created_by ON public.communication_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_communication_projects_members ON public.communication_projects USING GIN(project_members);
CREATE INDEX IF NOT EXISTS idx_communication_projects_accountants ON public.communication_projects USING GIN(assigned_accountants);

-- ============================================
-- 2. PROJECT MEMBERS (Relacja członków projektów)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.communication_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role VARCHAR(20) NOT NULL CHECK (
    user_role IN ('employer', 'accountant', 'worker', 'supervisor')
  ),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB DEFAULT '{}'::jsonb,
  
  -- Unique constraint - user can be in project only once
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_role ON public.project_members(user_role);

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Function to add member to project
CREATE OR REPLACE FUNCTION public.add_project_member(
  project_id UUID,
  user_id UUID,
  user_role TEXT DEFAULT 'worker'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert member
  INSERT INTO public.project_members (project_id, user_id, user_role)
  VALUES (project_id, user_id, user_role)
  ON CONFLICT (project_id, user_id) 
  DO UPDATE SET is_active = TRUE, user_role = EXCLUDED.user_role;
  
  -- Update project members count
  UPDATE public.communication_projects 
  SET 
    members_count = (
      SELECT COUNT(*) 
      FROM public.project_members 
      WHERE project_members.project_id = communication_projects.id 
        AND is_active = TRUE
    ),
    updated_at = NOW()
  WHERE id = project_id;
  
  RETURN TRUE;
END;
$$;

-- Function to remove member from project
CREATE OR REPLACE FUNCTION public.remove_project_member(
  project_id UUID,
  user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark member as inactive
  UPDATE public.project_members 
  SET is_active = FALSE
  WHERE project_members.project_id = remove_project_member.project_id 
    AND project_members.user_id = remove_project_member.user_id;
  
  -- Update project members count
  UPDATE public.communication_projects 
  SET 
    members_count = (
      SELECT COUNT(*) 
      FROM public.project_members 
      WHERE project_members.project_id = communication_projects.id 
        AND is_active = TRUE
    ),
    updated_at = NOW()
  WHERE id = project_id;
  
  RETURN TRUE;
END;
$$;

-- ============================================
-- 4. UPDATE EXISTING TABLES
-- ============================================

-- Update project_messages to reference communication_projects
ALTER TABLE public.project_messages 
ADD CONSTRAINT fk_project_messages_project_id 
FOREIGN KEY (project_id) REFERENCES public.communication_projects(id) ON DELETE CASCADE;

-- Update project_chat_groups to reference communication_projects  
ALTER TABLE public.project_chat_groups
ADD CONSTRAINT fk_project_chat_groups_project_id
FOREIGN KEY (project_id) REFERENCES public.communication_projects(id) ON DELETE CASCADE;

-- Update progress_reports to reference communication_projects
ALTER TABLE public.progress_reports
ADD CONSTRAINT fk_progress_reports_project_id
FOREIGN KEY (project_id) REFERENCES public.communication_projects(id) ON DELETE CASCADE;

-- Update safety_alerts to reference communication_projects
ALTER TABLE public.safety_alerts
ADD CONSTRAINT fk_safety_alerts_project_id  
FOREIGN KEY (project_id) REFERENCES public.communication_projects(id) ON DELETE CASCADE;

-- Update building_notifications to reference communication_projects
ALTER TABLE public.building_notifications
ADD CONSTRAINT fk_building_notifications_project_id
FOREIGN KEY (project_id) REFERENCES public.communication_projects(id) ON DELETE CASCADE;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on communication_projects
ALTER TABLE public.communication_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see projects they are members of
CREATE POLICY "Users can view their projects" ON public.communication_projects
  FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(project_members)) OR
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(assigned_accountants))
  );

-- Policy: Only employers can create projects
CREATE POLICY "Employers can create projects" ON public.communication_projects
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.employers 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Project creators and members can update
CREATE POLICY "Project members can update" ON public.communication_projects
  FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(project_members))
  );

-- Enable RLS on project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of projects they belong to
CREATE POLICY "View project members" ON public.project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.communication_projects cp
      WHERE cp.id = project_members.project_id
        AND (
          auth.uid() = cp.created_by OR
          auth.uid()::text = ANY(SELECT jsonb_array_elements_text(cp.project_members)) OR
          auth.uid()::text = ANY(SELECT jsonb_array_elements_text(cp.assigned_accountants))
        )
    )
  );

-- ============================================
-- 6. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Trigger to update employer_name when employer changes
CREATE OR REPLACE FUNCTION update_communication_project_employer_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.communication_projects 
  SET employer_name = NEW.company_name
  WHERE employer_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if employers table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employers') THEN
    DROP TRIGGER IF EXISTS trigger_update_project_employer_name ON public.employers;
    CREATE TRIGGER trigger_update_project_employer_name
      AFTER UPDATE OF company_name ON public.employers
      FOR EACH ROW
      EXECUTE FUNCTION update_communication_project_employer_name();
  END IF;
END $$;

COMMIT;

-- STEP 3: Verify results
SELECT 
  'communication_projects' as table_name, 
  COUNT(*) as record_count 
FROM public.communication_projects
UNION ALL
SELECT 
  'project_members' as table_name, 
  COUNT(*) as record_count 
FROM public.project_members;

-- Check constraints
SELECT 
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name IN ('communication_projects', 'project_members')
ORDER BY table_name, constraint_type;