-- =====================================================
-- 🔧 MIGRACJA: Dodanie kolumny 'capacity' do test_appointments
-- =====================================================
-- 
-- 🎯 CEL: Naprawienie błędu PGRST204
-- 🐛 BŁĄD: "Could not find the 'capacity' column of 'test_appointments'"
-- 📅 DATA: 12 listopada 2025, 23:30
-- 
-- =====================================================
-- 📋 DODANIE KOLUMNY
-- =====================================================

-- Dodaj kolumnę 'capacity' z walidacją (1-100)
ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 10 
CHECK (capacity > 0 AND capacity <= 100);

-- Dodaj komentarz opisujący przeznaczenie kolumny
COMMENT ON COLUMN test_appointments.capacity IS 
'Maksymalna liczba pracowników na slot testowy (domyślnie: 10, max: 100)';

-- =====================================================
-- 📋 INDEKS (dla wydajności)
-- =====================================================

-- Utwórz partial index (tylko dla capacity > 0)
CREATE INDEX IF NOT EXISTS idx_test_appointments_capacity 
ON test_appointments(capacity) 
WHERE capacity > 0;

-- =====================================================
-- 📋 AKTUALIZACJA ISTNIEJĄCYCH DANYCH
-- =====================================================

-- Ustaw domyślną wartość dla istniejących wierszy
UPDATE test_appointments 
SET capacity = 10 
WHERE capacity IS NULL;
