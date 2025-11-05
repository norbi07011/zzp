# 🚀 INSTRUKCJE MIGRACJI BAZY DANYCH

## 📋 KOLEJNOŚĆ WYKONANIA

### KROK 1: Podstawowy system projektów
**Plik:** `database-migrations/CREATE_COMPLETE_PROJECTS_SYSTEM.sql`
**Zawiera:**
- Tabela `projects` (podstawa)
- Tabela `project_invitations` (zaproszenia)  
- Tabela `project_permissions` (uprawnienia)
- 3 ENUM types: `project_status`, `invitation_status`, `permission_scope`
- RLS policies + triggery + dane testowe

### KROK 2: Activity Log i Powiadomienia  
**Plik:** `database-migrations/CREATE_ACTIVITY_LOG_NOTIFICATIONS.sql`
**Zawiera:**
- Tabela `project_activity_log` (log aktywności)
- Tabela `project_notifications` (powiadomienia)
- 3 ENUM types: `activity_type`, `notification_type`, `notification_status`
- Automatyczne triggery + RPC functions

## 🛠️ JAK URUCHOMIĆ?

### OPCJA A: Supabase Dashboard (ZALECANE)
1. Otwórz [Supabase Dashboard](https://supabase.com/dashboard)
2. Wybierz projekt: `dtnotuyagygexmkyqtgb`
3. Przejdź do **SQL Editor**
4. Skopiuj całą zawartość `CREATE_COMPLETE_PROJECTS_SYSTEM.sql`
5. Wklej i kliknij **RUN**
6. Sprawdź wyniki
7. Powtórz dla `CREATE_ACTIVITY_LOG_NOTIFICATIONS.sql`

### OPCJA B: Supabase CLI (jeśli masz)
```bash
supabase db reset
supabase db push
```

### OPCJA C: Przez skrypt (spróbuję teraz)
Mogę spróbować uruchomić przez prostsze API calls.

## ✅ WERYFIKACJA
Po każdej migracji sprawdź czy tabele zostały utworzone:
- `projects` ✅
- `project_invitations` ✅  
- `project_permissions` ✅
- `project_activity_log` ✅
- `project_notifications` ✅

## 🎯 CO DALEJ?
Po uruchomieniu migracji kontynuujemy:
- Prawdziwa integracja TeamDashboard z bazą danych
- System plików i załączników
- Automatyzacje i powiadomienia