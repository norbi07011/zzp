-- ===================================================================
-- TEST DATA - Sample data for testing all three dashboards
-- ===================================================================

-- First, let's check what we have
SELECT 'Existing profiles:' as info, COUNT(*) as count FROM profiles;
SELECT 'Existing workers:' as info, COUNT(*) as count FROM workers;
SELECT 'Existing employers:' as info, COUNT(*) as count FROM employers;

-- We should have 1 admin profile already
-- Let's add it to our test if it exists
DO $$
DECLARE
    admin_profile_id UUID;
    test_worker_id UUID;
    test_employer_id UUID;
BEGIN
    -- Get admin profile
    SELECT id INTO admin_profile_id FROM profiles WHERE role = 'admin' LIMIT 1;
    
    IF admin_profile_id IS NULL THEN
        RAISE NOTICE 'No admin profile found!';
    ELSE
        RAISE NOTICE 'Admin profile found: %', admin_profile_id;
    END IF;
    
    -- Create a test worker profile if not exists
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        gen_random_uuid(),
        'testworker@zzp.nl',
        'Jan de Tester',
        'worker'
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Create a test employer profile if not exists
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        gen_random_uuid(),
        'testemployer@zzp.nl',
        'Test BV',
        'employer'
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Get the worker profile ID
    SELECT id INTO test_worker_id FROM profiles WHERE email = 'testworker@zzp.nl';
    
    -- Create worker record
    INSERT INTO workers (
        profile_id,
        specialization,
        experience_years,
        hourly_rate,
        location_city,
        bio,
        rating,
        rating_count
    )
    VALUES (
        test_worker_id,
        'Electrician',
        5,
        45.00,
        'Amsterdam',
        'Experienced electrician specializing in residential and commercial projects.',
        4.5,
        12
    )
    ON CONFLICT (profile_id) DO NOTHING;
    
    -- Add worker skills
    INSERT INTO worker_skills (worker_id, skill_name, proficiency, years_experience)
    SELECT w.id, 'Electrical Installation', 5, 5
    FROM workers w WHERE w.profile_id = test_worker_id
    ON CONFLICT (worker_id, skill_name) DO NOTHING;
    
    INSERT INTO worker_skills (worker_id, skill_name, proficiency, years_experience)
    SELECT w.id, 'Safety Compliance', 4, 5
    FROM workers w WHERE w.profile_id = test_worker_id
    ON CONFLICT (worker_id, skill_name) DO NOTHING;
    
    -- Add a portfolio project
    INSERT INTO worker_portfolio (
        worker_id,
        title,
        description,
        tags,
        start_date,
        end_date,
        is_featured
    )
    SELECT 
        w.id,
        'Office Building Electrical Installation',
        'Complete electrical installation for a 3-story office building in Amsterdam.',
        ARRAY['commercial', 'office', 'installation'],
        '2024-01-01'::DATE,
        '2024-03-15'::DATE,
        true
    FROM workers w WHERE w.profile_id = test_worker_id
    ON CONFLICT DO NOTHING;
    
    -- Get the employer profile ID
    SELECT id INTO test_employer_id FROM profiles WHERE email = 'testemployer@zzp.nl';
    
    -- Create employer record
    INSERT INTO employers (
        profile_id,
        company_name,
        kvk_number,
        city,
        industry,
        company_size
    )
    VALUES (
        test_employer_id,
        'Test Construction BV',
        '12345678',
        'Amsterdam',
        'Construction',
        '11-50'
    )
    ON CONFLICT (profile_id) DO NOTHING;
    
    RAISE NOTICE 'Test data created successfully!';
END $$;

-- Verify what we have now
SELECT 'Final count - Profiles:' as info, COUNT(*) as count FROM profiles;
SELECT 'Final count - Workers:' as info, COUNT(*) as count FROM workers;
SELECT 'Final count - Employers:' as info, COUNT(*) as count FROM employers;
SELECT 'Final count - Worker Skills:' as info, COUNT(*) as count FROM worker_skills;
SELECT 'Final count - Portfolio:' as info, COUNT(*) as count FROM worker_portfolio;

-- Show the test accounts
SELECT 
    p.email,
    p.full_name,
    p.role,
    CASE 
        WHEN p.role = 'worker' THEN w.specialization
        WHEN p.role = 'employer' THEN e.company_name
        ELSE NULL
    END as details
FROM profiles p
LEFT JOIN workers w ON w.profile_id = p.id
LEFT JOIN employers e ON e.profile_id = p.id
ORDER BY p.role, p.email;
