-- ============================================
-- FIX: Convert task_templates table to view
-- Date: 2025-10-30
-- ============================================

-- Drop existing task_templates (table or view)
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

-- Verify view created
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name = 'task_templates';
