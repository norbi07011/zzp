-- ==========================================
-- STEP 3: SPRAWDŹ DANE
-- ==========================================

-- Uruchom to DOPIERO jak zobaczysz wynik STEP 2

-- A) Ile jest zadań?
SELECT COUNT(*) as total_tasks FROM project_tasks;

-- B) Ile jest projektów?
SELECT COUNT(*) as total_projects FROM projects;

-- C) Pokaż przykładowe zadanie
SELECT * FROM project_tasks LIMIT 1;

-- D) Pokaż przykładowy projekt
SELECT * FROM projects LIMIT 1;
