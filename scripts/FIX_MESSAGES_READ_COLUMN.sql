-- ============================================
-- FIX MESSAGES & NOTIFICATIONS - Rename 'read' to 'is_read'
-- ============================================
-- Problem: Kolumny nazywają się 'read' ale kod i triggery używają 'is_read'
-- Rozwiązanie: Zmień nazwę kolumn na 'is_read'

-- 1. FIX MESSAGES TABLE
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'read'
    ) THEN
        -- Zmień nazwę kolumny z 'read' na 'is_read'
        ALTER TABLE messages RENAME COLUMN read TO is_read;
        RAISE NOTICE '✅ Messages: Zmieniono read → is_read';
    ELSE
        RAISE NOTICE '⚠️ Messages: Kolumna read nie istnieje lub już jest is_read';
    END IF;
END $$;

-- 2. FIX NOTIFICATIONS TABLE  
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read'
    ) THEN
        -- Zmień nazwę kolumny z 'read' na 'is_read'
        ALTER TABLE notifications RENAME COLUMN read TO is_read;
        RAISE NOTICE '✅ Notifications: Zmieniono read → is_read';
    ELSE
        RAISE NOTICE '⚠️ Notifications: Kolumna read nie istnieje lub już jest is_read';
    END IF;
END $$;

-- Sprawdź wynik
SELECT 'messages' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'messages'
AND column_name IN ('read', 'is_read')

UNION ALL

SELECT 'notifications' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
AND column_name IN ('read', 'is_read')

ORDER BY table_name, column_name;
