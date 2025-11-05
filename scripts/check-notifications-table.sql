-- Sprawdź strukturę tabeli notifications
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Sprawdź ile powiadomień jest w bazie
SELECT COUNT(*) as total_notifications FROM notifications;

-- Sprawdź przykładowe powiadomienia
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
