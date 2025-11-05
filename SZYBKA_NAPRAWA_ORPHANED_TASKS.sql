-- ============================================
-- SZYBKA DIAGNOZA - 3 NAJWAŻNIEJSZE QUERY
-- ============================================

-- 1️⃣ SPRAWDŹ CZY ORPHANED TASKS ISTNIEJĄ
SELECT 
    pt.id,
    pt.title,
    pt.project_id,
    pt.assigned_to,
    pt.status,
    pt.created_at
FROM project_tasks pt
LEFT JOIN projects p ON pt.project_id = p.id
WHERE p.id IS NULL
ORDER BY pt.created_at DESC;

-- Jeśli wyświetli zadania = PROBLEM! Przejdź do naprawy poniżej ⬇️

-- ============================================

-- 2️⃣ SPRAWDŹ PRAWDZIWE PROJEKTY
SELECT 
    id,
    created_at
FROM projects
ORDER BY created_at DESC;

-- Skopiuj jedno z ID projektów do użycia w naprawie ⬇️

-- ============================================

-- 3️⃣ NAPRAWA - PRZYPISZ ZADANIA DO ISTNIEJĄCEGO PROJEKTU
-- ⚠️ ZAMIEŃ 'TUTAJ_ID_PROJEKTU' na prawdziwe ID z query #2

UPDATE project_tasks 
SET project_id = 'TUTAJ_ID_PROJEKTU'  -- ⬅️ WKLEJ ID Z QUERY #2
WHERE project_id NOT IN (SELECT id FROM projects);

-- Po wykonaniu, ponownie uruchom query #1 aby zweryfikować
-- Powinno pokazać 0 wyników ✅

-- ============================================
-- GOTOWE! Zadania naprawione 🎉
-- ============================================
