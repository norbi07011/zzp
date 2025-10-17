# 🚨 KRYTYCZNA NAPRAWA - Infinite Recursion + Certificates

## Problem

- ❌ **HTTP 500** przy GET `/rest/v1/profiles` - "infinite recursion detected"
- ❌ **Błąd kolumny** `certificates.worker_id` - tabela nie istnieje w tym kształcie
- ❌ **Multiple GoTrueClient instances** - ostrzeżenie w konsoli
- ❌ **Worker/Employer dashboard** - błędy przy ładowaniu

## Przyczyna

1. **RLS Policies na `profiles`** odwoływały się do `profiles` (SELECT FROM profiles WHERE...) → **nieskończona rekurencja**
2. **Frontend** pytał o `/rest/v1/certificates` z kolumną `worker_id`, ale dane są w `certificate_applications` i `zzp_exam_applications`
3. Policies admina sprawdzały rolę przez `profiles`, powodując kolejne rekursje

## Rozwiązanie

### ✅ Wykonane zmiany:

1. **Utworzono tabelę `user_roles`** (bez rekurencji)
   - Przechowuje role: `admin`, `employer`, `worker`
   - Polityki admina sprawdzają rolę przez `user_roles` zamiast `profiles`
   - Trigger synchronizuje `profiles.role` ↔ `user_roles.role`

2. **Naprawiono policies na `profiles`** (BEZ rekurencji!)
   - Usunięto wszystkie polityki z `SELECT FROM profiles`
   - Dodano proste polityki: `auth.uid() = id`
   - Admin policies używają `user_roles`

3. **Utworzono widok `certificates`** (kompatybilność z frontem)
   - Łączy `certificate_applications` + `zzp_exam_applications`
   - Posiada kolumnę `worker_id` zgodnie z oczekiwaniami frontu
   - RLS przez polityki bazowych tabel

4. **Klient Supabase** - już był singleton (OK)

## Instalacja Naprawy

### Krok 1: Wykonaj SQL

```bash
# Otwórz: Supabase Dashboard → SQL Editor
# Wklej plik: database-migrations/20251013_fix_rls_profiles_and_certificates_view.sql
# Kliknij "Run"
```

### Krok 2: Dodaj admina

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'TWOJ-ADMIN@EMAIL.COM'  -- ZMIEŃ NA SWÓJ EMAIL!
ON CONFLICT (user_id) DO NOTHING;
```

### Krok 3: Wyloguj się i zaloguj ponownie

```javascript
// Konsola przeglądarki (F12):
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Weryfikacja

### ✅ Sprawdź czy działa:

```bash
# Test 1: Profiles API (200 zamiast 500)
GET /rest/v1/profiles?select=id,full_name,role

# Test 2: Certificates API (200 zamiast 400)
GET /rest/v1/certificates?select=worker_id,name,status

# Test 3: Worker Dashboard
http://localhost:3003/dashboard/worker

# Test 4: Admin Panel
http://localhost:3003/admin
```

**Oczekiwane wyniki:**
- ✅ Brak błędów 500 w konsoli
- ✅ Brak "infinite recursion"
- ✅ Brak "Multiple GoTrueClient"
- ✅ Worker widzi swoje certyfikaty
- ✅ Admin widzi wszystkie dane

## Szczegółowe Testy

Zobacz pełną dokumentację testów:
👉 **[documentation/TESTING_RLS_FIX.md](documentation/TESTING_RLS_FIX.md)**

## Pliki Zmienione

- ✅ **NEW:** `database-migrations/20251013_fix_rls_profiles_and_certificates_view.sql` - główna migracja
- ✅ **NEW:** `documentation/TESTING_RLS_FIX.md` - testy akceptacyjne
- ✅ **UPDATED:** `src/pages/PaymentSuccess.tsx` - fix przekierowania po płatności
- ℹ️ **NO CHANGE:** `src/lib/supabase.ts` - już był OK (singleton)
- ℹ️ **NO CHANGE:** `src/hooks/useSupabaseCertificates.ts` - będzie działał z widokiem

## Architektura Rozwiązania

```
┌─────────────────────────────────────────────────┐
│ PROBLEM: Infinite Recursion                     │
│                                                  │
│ profiles policies:                               │
│   ❌ USING (SELECT 1 FROM profiles              │
│              WHERE role='admin')                 │
│                                                  │
│ To powodowało nieskończoną pętlę!               │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ ROZWIĄZANIE: user_roles                         │
│                                                  │
│ user_roles (nowa tabela):                       │
│   user_id | role    | created_at               │
│   --------|---------|----------                │
│   xxx-... | admin   | 2025-01-13               │
│   yyy-... | worker  | 2025-01-13               │
│                                                  │
│ profiles policies:                               │
│   ✅ USING (SELECT 1 FROM user_roles            │
│              WHERE user_id=auth.uid()            │
│              AND role='admin')                   │
│                                                  │
│ Trigger sync: profiles.role ↔ user_roles.role  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ PROBLEM: Certificates nie istnieją              │
│                                                  │
│ Frontend:                                        │
│   GET /rest/v1/certificates?worker_id=xxx       │
│                                                  │
│ Backend:                                         │
│   ❌ Tabela "certificates" nie istnieje          │
│   ✅ Są: certificate_applications,              │
│         zzp_exam_applications                   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ ROZWIĄZANIE: Widok certificates                 │
│                                                  │
│ CREATE VIEW certificates AS                     │
│   SELECT worker_id, name, status, ...           │
│   FROM certificate_applications                 │
│   UNION ALL                                      │
│   SELECT worker_id, name, status, ...           │
│   FROM zzp_exam_applications;                   │
│                                                  │
│ Frontend: Nie wymaga zmian! ✅                   │
│ RLS: Polityki na bazowych tabelach              │
└─────────────────────────────────────────────────┘
```

## Troubleshooting

### Nadal widzę "infinite recursion"

```sql
-- Sprawdź czy są stare polityki:
SELECT policyname, qual
FROM pg_policies
WHERE tablename = 'profiles'
AND qual LIKE '%FROM profiles%';

-- Usuń ręcznie jeśli są:
DROP POLICY IF EXISTS "nazwa_policy" ON public.profiles;
```

### Admin nie widzi wszystkich danych

```sql
-- Sprawdź user_roles:
SELECT * FROM user_roles WHERE role = 'admin';

-- Dodaj jeśli brak:
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'twoj@email.com';
```

### Worker nie widzi certyfikatów

```sql
-- Sprawdź worker_id:
SELECT w.id, w.profile_id, p.email
FROM workers w
JOIN profiles p ON p.id = w.profile_id
WHERE p.email = 'worker@email.com';

-- Sprawdź dane w widoku:
SELECT * FROM certificates WHERE worker_id = 'WORKER-ID-POWYŻEJ';
```

## Status

🎯 **DO WYKONANIA:**
1. [ ] Wykonaj SQL migration w Supabase
2. [ ] Dodaj admina do user_roles
3. [ ] Wyloguj się i zaloguj ponownie
4. [ ] Przetestuj wszystkie dashboardy
5. [ ] Sprawdź konsole (brak błędów 500)

✅ **PO WYKONANIU:**
- Profile API: 200 ✅
- Certificates API: 200 ✅
- Worker Dashboard: działa ✅
- Employer Dashboard: działa ✅
- Admin Panel: pełen dostęp ✅
- Konsola: czysta ✅
