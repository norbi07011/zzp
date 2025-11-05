-- ============================================
-- MIGRATION: System zadań - pełna implementacja
-- Date: 2025-10-29
-- Purpose: Utworzenie kompletnego systemu task management
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE IF EXISTS task_attachments CASCADE;
-- DROP TABLE IF EXISTS task_comments CASCADE;
-- DROP TABLE IF EXISTS project_tasks CASCADE;
-- DROP TYPE IF EXISTS task_status CASCADE;
-- DROP TYPE IF EXISTS task_priority CASCADE;

-- ============================================
-- STEP 1: Create ENUMS for task system
-- ============================================

-- Task status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM (
            'not_started',      -- nie rozpoczęte
            'in_progress',      -- w trakcie
            'review',           -- do przeglądu
            'completed',        -- zakończone
            'blocked',          -- zablokowane
            'cancelled'         -- anulowane
        );
    END IF;
END $$;

-- Task priority enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM (
            'low',              -- niski
            'medium',           -- średni
            'high',             -- wysoki
            'urgent'            -- pilny
        );
    END IF;
END $$;

-- ============================================
-- STEP 2: Create main tasks table
-- ============================================

CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Project reference
    project_id UUID NOT NULL REFERENCES communication_projects(id) ON DELETE CASCADE,
    
    -- Task basic info
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Task status and priority
    status task_status DEFAULT 'not_started',
    priority task_priority DEFAULT 'medium',
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Timing
    due_date TIMESTAMPTZ,
    estimated_hours INTEGER, -- szacowane godziny pracy
    actual_hours INTEGER,    -- faktyczne godziny
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Dependencies
    depends_on UUID[], -- array of task IDs that must be completed first
    
    -- Metadata
    tags TEXT[], -- array of tags for categorization
    position INTEGER DEFAULT 0, -- for ordering in Kanban
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- STEP 3: Create task comments table
-- ============================================

CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Comment content
    content TEXT NOT NULL,
    
    -- Reply threading
    parent_comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- STEP 4: Create task attachments table
-- ============================================

CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- File info
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    storage_path TEXT NOT NULL, -- path in Supabase Storage
    
    -- Metadata
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- STEP 5: Create indexes for performance
-- ============================================

-- Project tasks indexes
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_tasks_created_by ON project_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_project_tasks_active ON project_tasks(project_id, status) WHERE deleted_at IS NULL;

-- Task comments indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_author_id ON task_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_parent ON task_comments(parent_comment_id);

-- Task attachments indexes
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_uploaded_by ON task_attachments(uploaded_by);

-- ============================================
-- STEP 6: Create RLS policies
-- ============================================

-- Enable RLS
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- Project tasks policies
CREATE POLICY "Users can view tasks in their projects" ON project_tasks
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks in their projects" ON project_tasks
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid()
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Users can update tasks in their projects" ON project_tasks
    FOR UPDATE USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own tasks" ON project_tasks
    FOR DELETE USING (
        created_by = auth.uid() 
        OR project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() 
            AND role IN ('supervisor', 'employer')
        )
    );

-- Task comments policies
CREATE POLICY "Users can view comments on accessible tasks" ON task_comments
    FOR SELECT USING (
        task_id IN (
            SELECT id FROM project_tasks 
            WHERE project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create comments on accessible tasks" ON task_comments
    FOR INSERT WITH CHECK (
        task_id IN (
            SELECT id FROM project_tasks 
            WHERE project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
        AND author_id = auth.uid()
    );

CREATE POLICY "Users can update their own comments" ON task_comments
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON task_comments
    FOR DELETE USING (author_id = auth.uid());

-- Task attachments policies  
CREATE POLICY "Users can view attachments on accessible tasks" ON task_attachments
    FOR SELECT USING (
        task_id IN (
            SELECT id FROM project_tasks 
            WHERE project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can upload attachments to accessible tasks" ON task_attachments
    FOR INSERT WITH CHECK (
        task_id IN (
            SELECT id FROM project_tasks 
            WHERE project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
        AND uploaded_by = auth.uid()
    );

CREATE POLICY "Users can delete their own attachments" ON task_attachments
    FOR DELETE USING (uploaded_by = auth.uid());

-- ============================================
-- STEP 7: Create updated_at triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at 
    BEFORE UPDATE ON project_tasks 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_comments_updated_at ON task_comments;
CREATE TRIGGER update_task_comments_updated_at 
    BEFORE UPDATE ON task_comments 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- STEP 7b: Create validation trigger for task assignment
-- ============================================

-- Function to validate task assignment
CREATE OR REPLACE FUNCTION validate_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if assigned_to is a member of the project
    IF NEW.assigned_to IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = NEW.project_id 
            AND user_id = NEW.assigned_to
        ) THEN
            RAISE EXCEPTION 'User % is not a member of project %', NEW.assigned_to, NEW.project_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for task assignment validation
DROP TRIGGER IF EXISTS validate_project_task_assignment ON project_tasks;
CREATE TRIGGER validate_project_task_assignment 
    BEFORE INSERT OR UPDATE ON project_tasks 
    FOR EACH ROW EXECUTE PROCEDURE validate_task_assignment();

-- ============================================
-- STEP 8: Insert sample data for testing
-- ============================================

-- Get first project and users for testing
DO $$
DECLARE
    test_project_id UUID;
    test_employer_id UUID;
    test_worker_id UUID;
BEGIN
    -- Get first project
    SELECT id INTO test_project_id FROM communication_projects LIMIT 1;
    
    -- Get test users
    SELECT id INTO test_employer_id FROM auth.users WHERE email = 'test-employer@example.com';
    SELECT id INTO test_worker_id FROM auth.users WHERE email = 'test-worker@example.com';
    
    -- Only insert if we have a project
    IF test_project_id IS NOT NULL AND test_employer_id IS NOT NULL THEN
        -- Create sample project if none exists
        IF test_project_id IS NULL THEN
            INSERT INTO communication_projects (
                name, 
                description, 
                created_by,
                building_address
            ) VALUES (
                'Test Building Project',
                'Sample project for system testing',
                test_employer_id,
                'Test Address 123, Amsterdam'
            ) RETURNING id INTO test_project_id;
            
            -- Add project members
            INSERT INTO project_members (project_id, user_id, role) VALUES
                (test_project_id, test_employer_id, 'employer'),
                (test_project_id, test_worker_id, 'worker');
        END IF;
        
        -- Insert sample tasks
        INSERT INTO project_tasks (
            project_id,
            title,
            description,
            status,
            priority,
            assigned_to,
            created_by,
            due_date,
            estimated_hours,
            tags
        ) VALUES
            (
                test_project_id,
                'Setup building site safety measures',
                'Install safety barriers, warning signs and first aid station',
                'not_started',
                'high',
                test_worker_id,
                test_employer_id,
                NOW() + INTERVAL '3 days',
                8,
                ARRAY['safety', 'setup', 'urgent']
            ),
            (
                test_project_id,
                'Foundation excavation',
                'Excavate foundation according to architectural plans',
                'not_started',
                'medium',
                test_worker_id,
                test_employer_id,
                NOW() + INTERVAL '1 week',
                16,
                ARRAY['excavation', 'foundation']
            ),
            (
                test_project_id,
                'Material delivery coordination',
                'Coordinate with suppliers for concrete and steel delivery',
                'in_progress',
                'high',
                test_employer_id,
                test_employer_id,
                NOW() + INTERVAL '2 days',
                4,
                ARRAY['logistics', 'materials']
            );
            
        RAISE NOTICE 'Sample tasks created successfully for project %', test_project_id;
    ELSE
        RAISE NOTICE 'No test project or users found - skipping sample data';
    END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created
SELECT 'TABLES CREATED' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('project_tasks', 'task_comments', 'task_attachments')
ORDER BY table_name;

-- Check enums
SELECT 'ENUMS CREATED' as status;
SELECT typname as enum_name, 
       array_agg(enumlabel ORDER BY enumsortorder) as values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname IN ('task_status', 'task_priority')
GROUP BY typname;

-- Check sample data
SELECT 'SAMPLE TASKS' as status;
SELECT 
    t.title,
    t.status,
    t.priority,
    p.name as project_name,
    u.email as assigned_to_email
FROM project_tasks t
JOIN communication_projects p ON t.project_id = p.id
LEFT JOIN auth.users u ON t.assigned_to = u.id
WHERE t.deleted_at IS NULL;

COMMIT;