-- ============================================
-- MIGRATION PART 2: Default Templates (OPTIONAL)
-- Enhanced Tasks System - RAPP.NL Style
-- Date: 2025-10-30
-- Author: AI Copilot
-- ============================================

-- ⚠️  UWAGA: Ten plik wymaga istniejącego użytkownika i projektu!
-- Możesz:
-- 1. Użyć swojego prawdziwego user ID i project ID
-- 2. Pominąć ten plik i stworzyć szablony ręcznie w aplikacji
-- 3. Uruchomić to po zalogowaniu pierwszego użytkownika

-- ============================================
-- ROLLBACK PLAN:
-- ============================================
-- DELETE FROM project_tasks WHERE is_template = true AND template_name IN ('Malowanie pokoju', 'Naprawa dachu', 'Instalacja elektryczna');

-- ============================================
-- INSTRUKCJE:
-- ============================================
-- 1. Znajdź swoje user_id:
--    SELECT id, email FROM auth.users LIMIT 1;
--
-- 2. Znajdź swoje project_id:
--    SELECT id, name FROM communication_projects LIMIT 1;
--
-- 3. Zamień poniższe wartości:
--    'YOUR_USER_ID_HERE' → prawdziwy UUID użytkownika
--    'YOUR_PROJECT_ID_HERE' → prawdziwy UUID projektu

-- ============================================
-- TEMPLATE 1: Malowanie pokoju
-- ============================================

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
    'YOUR_PROJECT_ID_HERE', -- ⬅️ ZAMIEŃ NA PRAWDZIWY PROJECT ID
    'YOUR_USER_ID_HERE',    -- ⬅️ ZAMIEŃ NA PRAWDZIWY USER ID
    'Malowanie pokoju - szablon',
    'Standardowe malowanie pokoju (ściany + sufit)',
    true,
    'Malowanie pokoju',
    'painting',
    'medium',
    8,
    35.00,
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
    'not_started'
);

-- ============================================
-- TEMPLATE 2: Naprawa dachu
-- ============================================

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
    'YOUR_PROJECT_ID_HERE', -- ⬅️ ZAMIEŃ NA PRAWDZIWY PROJECT ID
    'YOUR_USER_ID_HERE',    -- ⬅️ ZAMIEŃ NA PRAWDZIWY USER ID
    'Naprawa dachu - szablon',
    'Standardowa naprawa przeciekającego dachu',
    true,
    'Naprawa dachu',
    'renovation',
    'high',
    12,
    45.00,
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
    'not_started'
);

-- ============================================
-- TEMPLATE 3: Instalacja elektryczna
-- ============================================

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
    'YOUR_PROJECT_ID_HERE', -- ⬅️ ZAMIEŃ NA PRAWDZIWY PROJECT ID
    'YOUR_USER_ID_HERE',    -- ⬅️ ZAMIEŃ NA PRAWDZIWY USER ID
    'Instalacja elektryczna - szablon',
    'Podstawowa instalacja elektryczna w pomieszczeniu',
    true,
    'Instalacja elektryczna',
    'electrical',
    'urgent',
    6,
    50.00,
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
    'not_started'
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check templates created
SELECT 
    template_name, 
    template_category, 
    calculated_cost, 
    jsonb_array_length(materials) as materials_count,
    jsonb_array_length(checklist) as checklist_items_count
FROM task_templates;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ TEMPLATES CREATED!';
    RAISE NOTICE '📋 Created 3 task templates:';
    RAISE NOTICE '   1. Malowanie pokoju (painting)';
    RAISE NOTICE '   2. Naprawa dachu (renovation)';
    RAISE NOTICE '   3. Instalacja elektryczna (electrical)';
    RAISE NOTICE '';
    RAISE NOTICE '▶️  Templates are now available in task_templates view!';
END $$;
