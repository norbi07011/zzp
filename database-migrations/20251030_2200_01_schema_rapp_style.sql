-- ============================================
-- MIGRATION PART 1: Schema Changes (SAFE)
-- Enhanced Tasks System - RAPP.NL Style
-- Date: 2025-10-30
-- Author: AI Copilot
-- ============================================

-- ROLLBACK PLAN:
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS photos;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS materials;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS checklist;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS calculated_cost;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS hourly_rate;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS is_template;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS template_name;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS template_category;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS before_photos;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS after_photos;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS client_signature_url;
-- ALTER TABLE project_tasks DROP COLUMN IF EXISTS client_signed_at;

-- ============================================
-- STEP 1: Add new columns to project_tasks
-- ============================================

-- Photo gallery (array of photo objects)
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN project_tasks.photos IS 'Array of photos: [{url, caption, annotations, timestamp, uploaded_by}]';

-- Materials list (array of material objects)
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN project_tasks.materials IS 'Array of materials: [{name, quantity, unit, price, supplier, supplier_url, notes}]';

-- Checklist (array of checklist items)
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN project_tasks.checklist IS 'Array of steps: [{id, text, completed, completed_at, completed_by}]';

-- Cost calculation
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS calculated_cost DECIMAL(12,2) DEFAULT 0;

COMMENT ON COLUMN project_tasks.calculated_cost IS 'Auto-calculated cost: materials + (hourly_rate * estimated_hours)';

-- Hourly rate for this task
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(8,2) DEFAULT 0;

COMMENT ON COLUMN project_tasks.hourly_rate IS 'Hourly rate in EUR for labor calculation';

-- Template system
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS template_name TEXT;

ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS template_category TEXT;

COMMENT ON COLUMN project_tasks.is_template IS 'Is this task a reusable template?';
COMMENT ON COLUMN project_tasks.template_name IS 'Template display name (e.g. "Malowanie pokoju")';
COMMENT ON COLUMN project_tasks.template_category IS 'Category: painting, renovation, plumbing, electrical, etc.';

-- Before/After tracking
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS before_photos JSONB DEFAULT '[]'::jsonb;

ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS after_photos JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN project_tasks.before_photos IS 'Photos taken before work started';
COMMENT ON COLUMN project_tasks.after_photos IS 'Photos taken after work completed';

-- Client signature
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS client_signature_url TEXT;

ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS client_signed_at TIMESTAMPTZ;

COMMENT ON COLUMN project_tasks.client_signature_url IS 'URL to client signature image (Supabase Storage)';

-- ============================================
-- STEP 2: Create indexes for new columns
-- ============================================

CREATE INDEX IF NOT EXISTS idx_project_tasks_is_template 
ON project_tasks(is_template) WHERE is_template = true;

CREATE INDEX IF NOT EXISTS idx_project_tasks_template_category 
ON project_tasks(template_category) WHERE template_category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_project_tasks_calculated_cost 
ON project_tasks(calculated_cost);

-- GIN index for JSONB searching
CREATE INDEX IF NOT EXISTS idx_project_tasks_materials_gin 
ON project_tasks USING GIN (materials);

CREATE INDEX IF NOT EXISTS idx_project_tasks_photos_gin 
ON project_tasks USING GIN (photos);

CREATE INDEX IF NOT EXISTS idx_project_tasks_materials_name 
ON project_tasks USING GIN ((materials::jsonb));

-- ============================================
-- STEP 3: Create helper functions
-- ============================================

-- Function: Calculate total materials cost
CREATE OR REPLACE FUNCTION calculate_materials_cost(materials_json JSONB)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL := 0;
    material JSONB;
BEGIN
    -- Loop through materials array
    FOR material IN SELECT * FROM jsonb_array_elements(materials_json)
    LOOP
        -- Add (quantity * price) to total
        total := total + 
            COALESCE((material->>'quantity')::DECIMAL, 0) * 
            COALESCE((material->>'price')::DECIMAL, 0);
    END LOOP;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate total task cost (materials + labor)
CREATE OR REPLACE FUNCTION calculate_total_task_cost(
    materials_json JSONB,
    hourly_rate_val DECIMAL,
    estimated_hours_val DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    materials_cost DECIMAL;
    labor_cost DECIMAL;
BEGIN
    -- Calculate materials cost
    materials_cost := calculate_materials_cost(materials_json);
    
    -- Calculate labor cost
    labor_cost := COALESCE(hourly_rate_val, 0) * COALESCE(estimated_hours_val, 0);
    
    -- Return total
    RETURN materials_cost + labor_cost;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Auto-update calculated_cost
CREATE OR REPLACE FUNCTION update_task_calculated_cost()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate cost whenever materials, hourly_rate, or estimated_hours change
    NEW.calculated_cost := calculate_total_task_cost(
        NEW.materials,
        NEW.hourly_rate,
        NEW.estimated_hours
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-calculation
DROP TRIGGER IF EXISTS trigger_update_task_cost ON project_tasks;

CREATE TRIGGER trigger_update_task_cost
    BEFORE INSERT OR UPDATE OF materials, hourly_rate, estimated_hours
    ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_calculated_cost();

-- Function: Count completed checklist items
CREATE OR REPLACE FUNCTION count_completed_checklist_items(checklist_json JSONB)
RETURNS INTEGER AS $$
DECLARE
    completed_count INTEGER := 0;
    item JSONB;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(checklist_json)
    LOOP
        IF (item->>'completed')::BOOLEAN = true THEN
            completed_count := completed_count + 1;
        END IF;
    END LOOP;
    
    RETURN completed_count;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get checklist completion percentage
CREATE OR REPLACE FUNCTION get_checklist_completion_percentage(checklist_json JSONB)
RETURNS DECIMAL AS $$
DECLARE
    total_items INTEGER;
    completed_items INTEGER;
BEGIN
    total_items := jsonb_array_length(checklist_json);
    
    IF total_items = 0 THEN
        RETURN 0;
    END IF;
    
    completed_items := count_completed_checklist_items(checklist_json);
    
    RETURN ROUND((completed_items::DECIMAL / total_items::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- STEP 4: Create view for task templates
-- ============================================

-- Drop existing task_templates if it exists (table or view)
DROP TABLE IF EXISTS task_templates CASCADE;
DROP VIEW IF EXISTS task_templates CASCADE;

-- Create view for task templates
CREATE VIEW task_templates AS
SELECT 
    id,
    template_name,
    template_category,
    description,
    priority,
    estimated_hours,
    hourly_rate,
    materials,
    checklist,
    calculated_cost,
    created_at,
    updated_at
FROM project_tasks
WHERE is_template = true
ORDER BY template_category, template_name;

COMMENT ON VIEW task_templates IS 'All task templates for quick reuse';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check new columns exist
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'project_tasks'
AND column_name IN ('photos', 'materials', 'checklist', 'calculated_cost', 'hourly_rate', 
                    'is_template', 'template_name', 'template_category', 
                    'before_photos', 'after_photos', 'client_signature_url', 'client_signed_at')
ORDER BY ordinal_position;

-- Check indexes created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'project_tasks'
AND (indexname LIKE '%template%' OR indexname LIKE '%materials%' OR indexname LIKE '%photos%');

-- Check functions created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%task%' OR routine_name LIKE '%checklist%'
ORDER BY routine_name;

-- Check triggers created
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'project_tasks'
AND trigger_name = 'trigger_update_task_cost';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ SCHEMA MIGRATION COMPLETE!';
    RAISE NOTICE '📋 Added 12 new columns to project_tasks';
    RAISE NOTICE '🔍 Created 6 indexes for performance';
    RAISE NOTICE '⚙️  Created 5 helper functions';
    RAISE NOTICE '🔄 Created 1 trigger for auto-cost calculation';
    RAISE NOTICE '👁️  Created task_templates view';
    RAISE NOTICE '';
    RAISE NOTICE '▶️  NEXT STEP: Run 20251030_2200_02_templates.sql to add default templates';
END $$;
