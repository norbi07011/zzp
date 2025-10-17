-- Sprawdzenie czy konkretne tabele istnieją
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media') 
    THEN '✅ media - ISTNIEJE'
    ELSE '❌ media - BRAK'
  END as status_media,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_permissions') 
    THEN '✅ user_permissions - ISTNIEJE'
    ELSE '❌ user_permissions - BRAK'
  END as status_user_permissions,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_events') 
    THEN '✅ subscription_events - ISTNIEJE'
    ELSE '❌ subscription_events - BRAK'
  END as status_subscription_events;
