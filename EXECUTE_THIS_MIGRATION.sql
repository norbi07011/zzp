-- =====================================================
-- 🔧 MIGRACJA: Dodanie kolumny 'capacity' do test_appointments
-- =====================================================
-- 
-- 🎯 CEL: Naprawienie błędu PGRST204
-- 🐛 BŁĄD: "Could not find the 'capacity' column of 'test_appointments'"
-- 📅 DATA: 12 listopada 2025
-- 
-- =====================================================
-- 📋 KROK 1: WERYFIKACJA (przed zmianami)
-- =====================================================

-- Sprawdź aktualną strukturę tabeli (EXECUTE THIS FIRST!)
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'test_appointments' 
ORDER BY ordinal_position;

-- Sprawdź istniejące dane (2 wiersze według raportu)
SELECT COUNT(*) as total_rows FROM test_appointments;

-- =====================================================
-- 📋 KROK 2: DODANIE KOLUMNY
-- =====================================================

-- Dodaj kolumnę 'capacity' z walidacją (1-100)
ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 10 
CHECK (capacity > 0 AND capacity <= 100);

-- Dodaj komentarz opisujący przeznaczenie kolumny
COMMENT ON COLUMN test_appointments.capacity IS 
'Maksymalna liczba pracowników na slot testowy (domyślnie: 10, max: 100)';

-- =====================================================
-- 📋 KROK 3: INDEKS (dla wydajności)
-- =====================================================

-- Utwórz partial index (tylko dla capacity > 0)
CREATE INDEX IF NOT EXISTS idx_test_appointments_capacity 
ON test_appointments(capacity) 
WHERE capacity > 0;

-- =====================================================
-- 📋 KROK 4: AKTUALIZACJA DANYCH
-- =====================================================

-- Ustaw domyślną wartość dla istniejących wierszy (2 rows)
UPDATE test_appointments 
SET capacity = 10 
WHERE capacity IS NULL;

-- =====================================================
-- ✅ KROK 5: WERYFIKACJA (po zmianach)
-- =====================================================

-- Sprawdź czy kolumna została dodana
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable,
  (SELECT COUNT(*) FROM test_appointments WHERE capacity IS NOT NULL) as rows_with_capacity
FROM information_schema.columns 
WHERE table_name = 'test_appointments' 
AND column_name = 'capacity';

-- Sprawdź dane w tabeli
SELECT id, test_date, capacity, location, status, appointment_type
FROM test_appointments
ORDER BY test_date DESC;

-- =====================================================
-- 📊 OCZEKIWANE WYNIKI
-- =====================================================
-- 
-- Krok 1 (verification query):
-- ✅ Lista 28 kolumn (bez 'capacity')
-- 
-- Krok 5 (post-migration check):
-- ✅ column_name = 'capacity'
-- ✅ data_type = 'integer'  
-- ✅ column_default = '10'
-- ✅ is_nullable = 'YES'
-- ✅ rows_with_capacity = 2
-- 
-- Po odświeżeniu aplikacji (Ctrl+R):
-- ✅ Błąd PGRST204 znika
-- ✅ Możesz tworzyć sloty testowe
-- 
-- =====================================================
-- 🔄 ROLLBACK (tylko jeśli coś pójdzie nie tak)
-- =====================================================

-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS capacity CASCADE;
-- DROP INDEX IF EXISTS idx_test_appointments_capacity;

-- =====================================================
-- 💸 DEBUG LOG
-- =====================================================
-- console.log('💸 DEBUG: Migration 20251112_capacity executed');
-- console.log('💸 DEBUG: Capacity column added to test_appointments');
-- console.log('💸 DEBUG: All 2 existing rows updated with capacity=10');
