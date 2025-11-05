-- ============================================
-- MIGRATION: Enhanced Tasks System (RAPP.NL Style)
-- Date: 2025-10-30
-- Author: AI Copilot
-- Description: Rozbudowa systemu zadań o:
--   - Foto-galerię (zdjęcia z adnotacjami)
--   - Listę materiałów (z auto-kalkulacją)
--   - Checklist kroków
--   - System szablonów zadań
--   - Auto-kalkulację kosztów
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
-- STEP 5: Insert default task templates
-- ============================================

-- First, create a dummy project for templates (if not exists)
INSERT INTO communication_projects (
    id,
    name,
    description,
    created_by,
    status
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '🔧 System Templates',
    'Internal project for storing reusable task templates',
    '00000000-0000-0000-0000-000000000001',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Template 1: Malowanie pokoju
INSERT INTO project_tasks (
    project_id,
    created_by,
    title,
    description,
    is_template,
    template_name,
    template_category,
    priority,
    estimated_hours,
    hourly_rate,
    materials,
    checklist,
    status
)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Dummy UUID for templates
    '00000000-0000-0000-0000-000000000001', -- Dummy UUID for system templates
    'Malowanie pokoju - szablon',
    'Standardowe malowanie pokoju (ściany + sufit)',
    true,
    'Malowanie pokoju',
    'painting',
    'medium', -- priority as text
    8, -- 8 hours
    35.00, -- 35 EUR/hour
    '[
        {"name": "Farba ścienna biała", "quantity": 10, "unit": "litr", "price": 8.50, "supplier": "Bouwmaat"},
        {"name": "Farba sufitowa", "quantity": 5, "unit": "litr", "price": 9.00, "supplier": "Bouwmaat"},
        {"name": "Wałek malarski", "quantity": 2, "unit": "szt", "price": 4.50, "supplier": "Gamma"},
        {"name": "Pędzel 5cm", "quantity": 2, "unit": "szt", "price": 3.00, "supplier": "Gamma"},
        {"name": "Taśma malarska", "quantity": 3, "unit": "rolka", "price": 2.50, "supplier": "Gamma"},
        {"name": "Folia ochronna", "quantity": 1, "unit": "rolka", "price": 8.00, "supplier": "Gamma"}
    ]'::jsonb,
    '[
        {"id": 1, "text": "Zabezpieczyć meble folią", "completed": false},
        {"id": 2, "text": "Wykleić listwy taśmą", "completed": false},
        {"id": 3, "text": "Zagruntować ściany", "completed": false},
        {"id": 4, "text": "Malować sufit (1 warstwa)", "completed": false},
        {"id": 5, "text": "Malować ściany (1 warstwa)", "completed": false},
        {"id": 6, "text": "Malować sufit (2 warstwa)", "completed": false},
        {"id": 7, "text": "Malować ściany (2 warstwa)", "completed": false},
        {"id": 8, "text": "Usunąć taśmę i zabezpieczenia", "completed": false}
    ]'::jsonb,
    'not_started' -- status as text
)
ON CONFLICT (id) DO NOTHING;

-- Template 2: Naprawa dachu
INSERT INTO project_tasks (
    project_id,
    created_by,
    title,
    description,
    is_template,
    template_name,
    template_category,
    priority,
    estimated_hours,
    hourly_rate,
    materials,
    checklist,
    status
)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Dummy UUID for templates
    '00000000-0000-0000-0000-000000000001', -- Dummy UUID for system templates
    'Naprawa dachu - szablon',
    'Standardowa naprawa przeciekającego dachu',
    true,
    'Naprawa dachu',
    'renovation',
    'high', -- priority as text
    12, -- 12 hours
    45.00, -- 45 EUR/hour
    '[
        {"name": "Dachówki ceramiczne", "quantity": 20, "unit": "szt", "price": 3.50, "supplier": "Wienerberger"},
        {"name": "Membrana dachowa", "quantity": 5, "unit": "m2", "price": 12.00, "supplier": "Bouwmaat"},
        {"name": "Łaty drewniane", "quantity": 10, "unit": "mb", "price": 2.80, "supplier": "Houthandel"},
        {"name": "Wkręty dachowe", "quantity": 100, "unit": "szt", "price": 0.15, "supplier": "Gamma"},
        {"name": "Silikon dachowy", "quantity": 2, "unit": "tuba", "price": 8.50, "supplier": "Bouwmaat"}
    ]'::jsonb,
    '[
        {"id": 1, "text": "Inspekcja dachu - zlokalizować uszkodzenia", "completed": false},
        {"id": 2, "text": "Usunąć uszkodzone dachówki", "completed": false},
        {"id": 3, "text": "Sprawdzić stan membrany", "completed": false},
        {"id": 4, "text": "Wymienić uszkodzone łaty", "completed": false},
        {"id": 5, "text": "Zainstalować nową membranę", "completed": false},
        {"id": 6, "text": "Zamontować nowe dachówki", "completed": false},
        {"id": 7, "text": "Uszczelnić silikonen", "completed": false},
        {"id": 8, "text": "Test wodny - sprawdzić szczelność", "completed": false}
    ]'::jsonb,
    'not_started' -- status as text
)
ON CONFLICT (id) DO NOTHING;

-- Template 3: Instalacja elektryczna
INSERT INTO project_tasks (
    project_id,
    created_by,
    title,
    description,
    is_template,
    template_name,
    template_category,
    priority,
    estimated_hours,
    hourly_rate,
    materials,
    checklist,
    status
)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Dummy UUID for templates
    '00000000-0000-0000-0000-000000000001', -- Dummy UUID for system templates
    'Instalacja elektryczna - szablon',
    'Podstawowa instalacja elektryczna w pomieszczeniu',
    true,
    'Instalacja elektryczna',
    'electrical',
    'urgent', -- priority as text
    6, -- 6 hours
    50.00, -- 50 EUR/hour
    '[
        {"name": "Kabel YDYp 3x2.5", "quantity": 50, "unit": "mb", "price": 1.80, "supplier": "Technische Unie"},
        {"name": "Gniazdka podtynkowe", "quantity": 6, "unit": "szt", "price": 4.50, "supplier": "Technische Unie"},
        {"name": "Włączniki", "quantity": 3, "unit": "szt", "price": 5.00, "supplier": "Technische Unie"},
        {"name": "Puszki podtynkowe", "quantity": 9, "unit": "szt", "price": 0.80, "supplier": "Gamma"},
        {"name": "Rozdzielnia 12-modułowa", "quantity": 1, "unit": "szt", "price": 35.00, "supplier": "Technische Unie"},
        {"name": "Wyłączniki automatyczne B16", "quantity": 3, "unit": "szt", "price": 12.00, "supplier": "Technische Unie"}
    ]'::jsonb,
    '[
        {"id": 1, "text": "Wyłączyć główny bezpiecznik", "completed": false},
        {"id": 2, "text": "Wykuć bruzdy pod przewody", "completed": false},
        {"id": 3, "text": "Zamontować puszki podtynkowe", "completed": false},
        {"id": 4, "text": "Poprowadzić kable", "completed": false},
        {"id": 5, "text": "Podłączyć gniazdka i włączniki", "completed": false},
        {"id": 6, "text": "Podłączyć do rozdzielnicy", "completed": false},
        {"id": 7, "text": "Test instalacji - pomiar rezystancji", "completed": false},
        {"id": 8, "text": "Włączyć bezpieczniki i przetestować", "completed": false}
    ]'::jsonb,
    'not_started' -- status as text
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 6: Create indexes for better performance
-- ============================================

-- Index for searching materials by name
CREATE INDEX IF NOT EXISTS idx_project_tasks_materials_name 
ON project_tasks USING GIN ((materials::jsonb));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check new columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'project_tasks'
AND column_name IN ('photos', 'materials', 'checklist', 'calculated_cost', 'hourly_rate', 
                    'is_template', 'template_name', 'template_category', 
                    'before_photos', 'after_photos', 'client_signature_url')
ORDER BY ordinal_position;

-- Check indexes created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'project_tasks'
AND indexname LIKE '%template%' OR indexname LIKE '%materials%' OR indexname LIKE '%photos%';

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

-- Check templates created
SELECT template_name, template_category, calculated_cost, 
       jsonb_array_length(materials) as materials_count,
       jsonb_array_length(checklist) as checklist_items_count
FROM task_templates;

-- ============================================
-- EXAMPLE USAGE
-- ============================================

-- Example 1: Create task from template
-- INSERT INTO project_tasks (project_id, title, description, materials, checklist, hourly_rate, estimated_hours)
-- SELECT 
--     'your-project-id-here',
--     'Malowanie salonu',
--     description,
--     materials,
--     checklist,
--     hourly_rate,
--     estimated_hours
-- FROM task_templates
-- WHERE template_name = 'Malowanie pokoju';

-- Example 2: Add photos to task
-- UPDATE project_tasks
-- SET photos = photos || '[{"url": "https://storage.url/photo.jpg", "caption": "Przed rozpoczęciem", "timestamp": "2025-10-30T10:00:00Z"}]'::jsonb
-- WHERE id = 'task-id-here';

-- Example 3: Update checklist item
-- UPDATE project_tasks
-- SET checklist = jsonb_set(
--     checklist,
--     '{0,completed}',
--     'true'::jsonb
-- )
-- WHERE id = 'task-id-here';

-- Example 4: Calculate cost for existing tasks
-- UPDATE project_tasks
-- SET calculated_cost = calculate_total_task_cost(materials, hourly_rate, estimated_hours)
-- WHERE calculated_cost IS NULL OR calculated_cost = 0;

-- Example 5: Get tasks with materials containing specific item
-- SELECT title, materials
-- FROM project_tasks
-- WHERE materials @> '[{"name": "Farba ścienna biała"}]'::jsonb;

-- Example 6: Get checklist completion percentage
-- SELECT 
--     title,
--     get_checklist_completion_percentage(checklist) as completion_pct
-- FROM project_tasks
-- WHERE jsonb_array_length(checklist) > 0;
