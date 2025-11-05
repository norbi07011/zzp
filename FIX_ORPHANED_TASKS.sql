-- ==========================================
-- FIX ORPHANED TASKS - NATYCHMIASTOWA NAPRAWA
-- ==========================================
-- Problem: Wszystkie zadania wskazują na nieistniejący projekt
-- Data: 2025-10-30
-- ==========================================

-- KROK 1: Diagnoza - sprawdź problem
SELECT 
  pt.id,
  pt.title,
  pt.project_id as nieistniejacy_projekt_id,
  pt.assigned_to,
  pt.status,
  pt.created_at
FROM project_tasks pt
WHERE pt.project_id = '64f10ee1-dbc4-42ec-aa50-d4428adf3dab';

-- Powinno pokazać 5 zadań ❌

-- KROK 2: Sprawdź prawdziwe projekty
SELECT 
  p.id,
  p.created_at
FROM projects p
ORDER BY p.created_at DESC;

-- Powinno pokazać 2 projekty ✅

-- ==========================================
-- 🔧 NAPRAWA - PRZYPISZ ZADANIA DO PIERWSZEGO PROJEKTU
-- ==========================================

-- Aktualizuj wszystkie orphaned tasks do pierwszego istniejącego projektu
UPDATE project_tasks 
SET project_id = 'cce21528-6d03-4f49-bd50-bbdd385e3765'
WHERE project_id = '64f10ee1-dbc4-42ec-aa50-d4428adf3dab';

-- Sprawdź wynik
SELECT 
  pt.id,
  pt.title,
  pt.project_id as naprawiony_projekt_id,
  pt.status
FROM project_tasks pt
ORDER BY pt.created_at DESC;

-- ==========================================
-- OPCJONALNIE: Jeśli chcesz rozdzielić zadania
-- ==========================================

-- Przykład: Przypisz różne zadania do różnych projektów
-- UPDATE project_tasks 
-- SET project_id = '8e26765d-3fca-45c5-b51f-79df1411c19f'
-- WHERE title LIKE '%Design%' OR title LIKE '%UI%';

-- ==========================================
-- WERYFIKACJA KOŃCOWA
-- ==========================================

-- 1. Sprawdź czy są jeszcze orphaned tasks
SELECT COUNT(*) as orphaned_tasks_count
FROM project_tasks pt
LEFT JOIN projects p ON pt.project_id = p.id
WHERE p.id IS NULL;

-- Powinno być 0 ✅

-- 2. Sprawdź rozkład zadań po projektach
SELECT 
  p.id as projekt_id,
  COUNT(pt.id) as liczba_zadan,
  COUNT(CASE WHEN pt.status = 'todo' THEN 1 END) as todo,
  COUNT(CASE WHEN pt.status = 'in-progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN pt.status = 'done' THEN 1 END) as done
FROM projects p
LEFT JOIN project_tasks pt ON p.id = pt.project_id
GROUP BY p.id
ORDER BY p.created_at DESC;

-- ==========================================
-- 📝 NOTATKI
-- ==========================================
-- Po wykonaniu tej naprawy:
-- ✅ Wszystkie zadania będą widoczne w aplikacji
-- ✅ Nie będzie błędów przy wyświetlaniu TaskBoard
-- ✅ Można normalnie pracować z zadaniami
-- 
-- Następne kroki (automatyczne zabezpieczenie):
-- - Dodać walidację projectId w TaskFormModal
-- - Dodać foreign key constraint z CASCADE
-- - Dodać fallback do pierwszego projektu użytkownika
