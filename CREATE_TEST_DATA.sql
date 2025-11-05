-- ============================================
-- CREATE MISSING TEST DATA
-- Run if you need more test data for debugging
-- ============================================

-- Insert test projects for current user
INSERT INTO projects (
    id,
    title,
    description,
    project_address,
    owner_id,
    status,
    start_date,
    deadline,
    budget_total,
    budget_used,
    client_name,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'Team Dashboard Test Project',
    'Projekt testowy dla sprawdzenia dashboardu zespołowego',
    'Test Address 123, Amsterdam',
    '8a17942f-7209-469a-bafc-1a748d195eef',
    'active',
    '2025-10-29',
    '2025-12-31',
    100000,
    15000,
    'Test Client',
    now(),
    now()
),
(
    gen_random_uuid(),
    'Second Test Project',
    'Drugi projekt testowy',
    'Another Address 456, Rotterdam',
    '8a17942f-7209-469a-bafc-1a748d195eef',
    'planning',
    '2025-11-01',
    '2026-01-31',
    200000,
    0,
    'Another Client',
    now(),
    now()
);

-- Insert test notifications for current user
INSERT INTO project_notifications (
    id,
    user_id,
    project_id,
    title,
    message,
    read,
    created_at
) VALUES 
(
    gen_random_uuid(),
    '8a17942f-7209-469a-bafc-1a748d195eef',
    (SELECT id FROM projects WHERE owner_id = '8a17942f-7209-469a-bafc-1a748d195eef' LIMIT 1),
    'Projekt został utworzony',
    'Twój nowy projekt jest gotowy do zarządzania.',
    false,
    now()
),
(
    gen_random_uuid(),
    '8a17942f-7209-469a-bafc-1a748d195eef',
    (SELECT id FROM projects WHERE owner_id = '8a17942f-7209-469a-bafc-1a748d195eef' LIMIT 1),
    'System zespołowy aktywny',
    'Możesz teraz zarządzać zespołem i plikami projektu.',
    false,
    now() - interval '1 hour'
);

-- Insert test task attachments
INSERT INTO task_attachments (
    id,
    task_id,
    file_name,
    file_type,
    file_size,
    file_path,
    uploaded_by,
    created_at
) VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM projects WHERE owner_id = '8a17942f-7209-469a-bafc-1a748d195eef' LIMIT 1),
    'test_document.pdf',
    'application/pdf',
    1024000,
    'project-files/test_document.pdf',
    '8a17942f-7209-469a-bafc-1a748d195eef',
    now()
),
(
    gen_random_uuid(),
    (SELECT id FROM projects WHERE owner_id = '8a17942f-7209-469a-bafc-1a748d195eef' LIMIT 1),
    'project_image.jpg',
    'image/jpeg',
    512000,
    'project-files/project_image.jpg',
    '8a17942f-7209-469a-bafc-1a748d195eef',
    now()
);

-- Verify data was created
SELECT 'Test data summary:' as info;
SELECT 'Projects created: ' || count(*) as result FROM projects WHERE owner_id = '8a17942f-7209-469a-bafc-1a748d195eef';
SELECT 'Notifications created: ' || count(*) as result FROM project_notifications WHERE user_id = '8a17942f-7209-469a-bafc-1a748d195eef';
SELECT 'Files created: ' || count(*) as result FROM task_attachments WHERE uploaded_by = '8a17942f-7209-469a-bafc-1a748d195eef';