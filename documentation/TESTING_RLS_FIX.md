# 🧪 Testy Akceptacyjne - Naprawa RLS i Certificates

## 📋 Przygotowanie

### 1. Wykonaj migrację SQL

```bash
# Otwórz Supabase Dashboard
https://supabase.com/dashboard

# Przejdź do: SQL Editor → New query
# Skopiuj zawartość pliku:
database-migrations/20251013_fix_rls_profiles_and_certificates_view.sql

# Wklej do edytora i kliknij "Run" (Ctrl+Enter)
```

**Oczekiwany wynik:**
```
✅ user_roles: Utworzona i wypełniona
✅ profiles policies: Naprawione (bez rekurencji)
✅ certificates view: Utworzony dla kompatybilności
```

### 2. Dodaj admina (JEŚLI POTRZEBA)

Jeśli nie masz jeszcze roli admin w `user_roles`, wykonaj:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'TWOJ-ADMIN@EMAIL.COM'
ON CONFLICT (user_id) DO NOTHING;
```

**Zamień `TWOJ-ADMIN@EMAIL.COM` na swój email!**

### 3. Wyloguj się i zaloguj ponownie

**KRYTYCZNE:** JWT token musi być odświeżony!

```javascript
// W konsoli przeglądarki (F12):
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Lub po prostu wyloguj się z aplikacji i zaloguj ponownie.

---

## ✅ Test 1: Profiles API (bez infinite recursion)

### Przed naprawą:
```
GET /rest/v1/profiles?select=id,full_name,role&id=eq.xxx
❌ HTTP 500 - infinite recursion detected in policy for relation "profiles"
```

### Po naprawie:
```bash
# Test w przeglądarce lub Postman
GET https://dtnotuyagygexmkyqtgb.supabase.co/rest/v1/profiles?select=id,full_name,role,email

# Nagłówki:
apikey: YOUR_ANON_KEY
Authorization: Bearer YOUR_JWT_TOKEN
```

**Oczekiwany wynik:**
```json
✅ HTTP 200
[
  {
    "id": "xxx-xxx-xxx",
    "full_name": "Jan Kowalski",
    "role": "worker",
    "email": "jan@example.com"
  }
]
```

**Weryfikacja w konsoli przeglądarki:**
```javascript
// Nie powinno być:
❌ "infinite recursion detected"
❌ "Error fetching user profile"
```

---

## ✅ Test 2: Certificates View (kompatybilność)

### Przed naprawą:
```
GET /rest/v1/certificates?select=worker_id,certificate_number
❌ HTTP 400/500 - column certificates.worker_id does not exist
```

### Po naprawie:
```bash
# Test zapytania
GET https://dtnotuyagygexmkyqtgb.supabase.co/rest/v1/certificates?select=worker_id,name,status,issued_at

# Nagłówki:
apikey: YOUR_ANON_KEY
Authorization: Bearer YOUR_JWT_TOKEN
```

**Oczekiwany wynik:**
```json
✅ HTTP 200
[
  {
    "worker_id": "xxx-xxx-xxx",
    "name": "VCA Basis",
    "status": "approved",
    "issued_at": "2025-01-10T10:00:00Z"
  }
]
```

**Weryfikacja:**
- Worker widzi TYLKO swoje certyfikaty
- Admin widzi WSZYSTKIE certyfikaty
- Widok łączy dane z `certificate_applications` + `zzp_exam_applications`

---

## ✅ Test 3: Worker Dashboard

### Krok po kroku:

1. **Zaloguj się jako worker**
   ```
   Email: test+worker@example.com
   Hasło: test1234 (lub twoje)
   ```

2. **Otwórz Worker Dashboard**
   ```
   URL: http://localhost:3003/dashboard/worker
   ```

3. **Sprawdź konsolę przeglądarki (F12)**

**Oczekiwany wynik:**
```
✅ Brak błędów 500
✅ Brak "infinite recursion"
✅ Brak "Error fetching user profile"
✅ Brak "Multiple GoTrueClient instances"
```

4. **Sprawdź czy widoczne są:**
   - ✅ Profil pracownika (imię, nazwisko)
   - ✅ Lista certyfikatów (jeśli są)
   - ✅ Statystyki (wyświetlenia, aplikacje)

---

## ✅ Test 4: Employer Dashboard

1. **Zaloguj się jako employer**
   ```
   Email: test+employer@example.com
   Hasło: test1234
   ```

2. **Otwórz Employer Dashboard**
   ```
   URL: http://localhost:3003/dashboard/employer
   ```

3. **Sprawdź konsolę**

**Oczekiwany wynik:**
```
✅ Dashboard się ładuje
✅ Brak błędów 500
✅ Widoczne: oferty pracy, wyszukiwania, statystyki
```

---

## ✅ Test 5: Admin Panel

1. **Zaloguj się jako admin**
   ```
   Email: TWOJ-ADMIN@EMAIL.COM
   Hasło: twoje-hasło
   ```

2. **Otwórz Admin Panel**
   ```
   URL: http://localhost:3003/admin
   ```

3. **Sprawdź dostęp do:**
   - ✅ Lista wszystkich użytkowników (profiles)
   - ✅ Lista wszystkich certyfikatów (certificates view)
   - ✅ Statystyki systemu
   - ✅ Zarządzanie rolami

**Oczekiwany wynik:**
```
✅ Admin widzi WSZYSTKO (przez user_roles)
✅ Brak błędów uprawnień
✅ RLS policies działają poprawnie
```

---

## ✅ Test 6: User Roles Sync

### Testowanie synchronizacji role:

```sql
-- 1. Zmień rolę w profiles
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'test@example.com';

-- 2. Sprawdź czy user_roles została zaktualizowana
SELECT 
  ur.user_id,
  u.email,
  p.role AS profile_role,
  ur.role AS user_roles_role,
  ur.updated_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
JOIN public.profiles p ON p.id = ur.user_id
WHERE u.email = 'test@example.com';
```

**Oczekiwany wynik:**
```
✅ profile_role = 'admin'
✅ user_roles_role = 'admin'
✅ updated_at = timestamp zmian
```

---

## ❌ Troubleshooting

### Problem: Nadal widzę "infinite recursion"

**Rozwiązanie:**
1. Sprawdź czy wszystkie polityki zostały usunięte:
   ```sql
   SELECT policyname, qual
   FROM pg_policies
   WHERE tablename = 'profiles'
   AND qual LIKE '%FROM profiles%';
   ```
   
2. Jeśli są jakieś wyniki - usuń je ręcznie:
   ```sql
   DROP POLICY IF EXISTS "nazwa_policy" ON public.profiles;
   ```

### Problem: "Multiple GoTrueClient instances"

**Rozwiązanie:**
```javascript
// Sprawdź czy importujesz supabase TYLKO z:
import { supabase } from '@/lib/supabase';

// NIE twórz nowych instancji:
// ❌ const client = createClient(url, key);
```

### Problem: Worker nie widzi swoich certyfikatów

**Rozwiązanie:**
1. Sprawdź czy worker_id jest poprawne:
   ```sql
   SELECT w.id, w.profile_id, p.email
   FROM workers w
   JOIN profiles p ON p.id = w.profile_id
   WHERE p.email = 'WORKER-EMAIL';
   ```

2. Sprawdź dane w widoku:
   ```sql
   SELECT * FROM certificates
   WHERE worker_id = 'WORKER-ID-Z-KROKU-1';
   ```

### Problem: Admin nie widzi wszystkich danych

**Rozwiązanie:**
1. Sprawdź czy admin jest w user_roles:
   ```sql
   SELECT * FROM user_roles
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ADMIN-EMAIL');
   ```

2. Jeśli brak - dodaj:
   ```sql
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'ADMIN-EMAIL';
   ```

---

## 📊 Checklist Finalny

Po wykonaniu wszystkich testów, zaznacz:

- [ ] ✅ Wykonano migrację SQL
- [ ] ✅ Dodano admina do user_roles
- [ ] ✅ Wylogowano się i zalogowano ponownie
- [ ] ✅ GET /rest/v1/profiles zwraca 200 (nie 500)
- [ ] ✅ GET /rest/v1/certificates zwraca 200
- [ ] ✅ Worker dashboard działa bez błędów 500
- [ ] ✅ Employer dashboard działa
- [ ] ✅ Admin panel ma pełen dostęp
- [ ] ✅ Konsola bez "infinite recursion"
- [ ] ✅ Konsola bez "Multiple GoTrueClient"
- [ ] ✅ Certificates widoczne dla workera
- [ ] ✅ Admin widzi wszystkie profile/certyfikaty
- [ ] ✅ Synchronizacja role działa (trigger)

**Jeśli wszystkie checkboxy zaznaczone:** 🎉 **NAPRAWA ZAKOŃCZONA SUKCESEM!**

---

## 🔗 Dodatkowe Zasoby

- **SQL Migration:** `database-migrations/20251013_fix_rls_profiles_and_certificates_view.sql`
- **Supabase Dashboard:** https://supabase.com/dashboard
- **API Docs:** https://supabase.com/docs/guides/api

**W razie problemów:**
1. Sprawdź logi Supabase (Dashboard → Logs)
2. Sprawdź konsole przeglądarki (F12 → Console)
3. Sprawdź polityki RLS (Dashboard → Authentication → Policies)
