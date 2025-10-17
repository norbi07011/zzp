# 🔧 Instrukcja Utworzenia Konta Admina

## Metoda 1: Przez Supabase Dashboard (NAJŁATWIEJSZA) ⭐

1. **Otwórz Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/auth/users
   ```

2. **Kliknij "Add User" (zielony przycisk)**

3. **Wypełnij formularz:**
   - **Email:** `admin@zzpwerkplaats.nl`
   - **Password:** `Admin123!@#`
   - **Auto Confirm User:** ✅ ZAZNACZ (ważne!)

4. **Kliknij "Create user"**

5. **Skopiuj User ID** (UUID, np. `123e4567-e89b-12d3-a456-426614174000`)

6. **Przejdź do SQL Editor:**
   ```
   https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/sql/new
   ```

7. **Wykonaj SQL** (zastąp `USER_ID_TUTAJ` skopiowanym ID):
   ```sql
   -- 1. Upewnij się że profil istnieje
   INSERT INTO profiles (id, email, full_name, role)
   VALUES (
     'USER_ID_TUTAJ'::uuid,
     'admin@zzpwerkplaats.nl',
     'Admin Test',
     'admin'
   )
   ON CONFLICT (id) DO UPDATE
   SET role = 'admin';

   -- 2. Sprawdź czy został utworzony
   SELECT * FROM profiles WHERE role = 'admin';
   ```

8. **Gotowe!** Możesz się teraz zalogować:
   - Email: `admin@zzpwerkplaats.nl`
   - Hasło: `Admin123!@#`

---

## Metoda 2: Przez SQL (SZYBKA)

1. **Otwórz SQL Editor:**
   ```
   https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/sql/new
   ```

2. **Wykonaj to SQL:**
   ```sql
   -- Tworzy użytkownika admina z hasłem Admin123!@#
   -- Wymaga Supabase CLI lub dostępu do auth.users

   DO $$
   DECLARE
     admin_id uuid;
   BEGIN
     -- Sprawdź czy admin już istnieje
     SELECT id INTO admin_id
     FROM auth.users
     WHERE email = 'admin@zzpwerkplaats.nl';

     -- Jeśli nie istnieje, musisz go utworzyć przez Dashboard (Metoda 1)
     IF admin_id IS NULL THEN
       RAISE NOTICE 'Użytkownik nie istnieje. Utwórz go przez Dashboard (Metoda 1).';
     ELSE
       -- Utwórz/zaktualizuj profil
       INSERT INTO profiles (id, email, full_name, role)
       VALUES (admin_id, 'admin@zzpwerkplaats.nl', 'Admin Test', 'admin')
       ON CONFLICT (id) DO UPDATE SET role = 'admin';

       RAISE NOTICE 'Profil admina został utworzony/zaktualizowany!';
     END IF;
   END $$;
   ```

---

## Metoda 3: Przez Formularz Rejestracji (DLA TESTÓW)

1. **Otwórz stronę rejestracji pracownika:**
   ```
   http://localhost:5173/register/worker
   ```

2. **Wypełnij formularz:**
   - Email: `test@example.com`
   - Hasło: `Test123!@#`
   - Imię i nazwisko: `Test User`
   - ... (reszta pól)

3. **Po rejestracji:**
   - Zaloguj się jako nowy użytkownik
   - Możesz zmienić jego rolę na admina przez SQL:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'test@example.com';
   ```

---

## Weryfikacja

Po utworzeniu konta, sprawdź czy działa:

```sql
-- Sprawdź użytkownika w auth.users
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email = 'admin@zzpwerkplaats.nl';

-- Sprawdź profil
SELECT * FROM profiles
WHERE email = 'admin@zzpwerkplaats.nl';
```

Powinny być **oba rekordy** (w auth.users i profiles).

---

## Logowanie

1. **Otwórz aplikację:**
   ```bash
   npm run dev
   ```

2. **Przejdź do:**
   ```
   http://localhost:5173/login
   ```

3. **Zaloguj się:**
   - Email: `admin@zzpwerkplaats.nl`
   - Hasło: `Admin123!@#`

4. **Zostaniesz przekierowany do:**
   ```
   http://localhost:5173/admin
   ```

---

## Troubleshooting

### Problem: "Invalid login credentials"
**Rozwiązanie:**
- Sprawdź czy użytkownik istnieje w auth.users
- Sprawdź czy "Auto Confirm User" było zaznaczone
- Spróbuj zresetować hasło przez Dashboard

### Problem: "You don't have permission"
**Rozwiązanie:**
- Sprawdź czy profil ma role = 'admin'
- Sprawdź RLS policies (powinny być włączone)

### Problem: "Profile not found"
**Rozwiązanie:**
```sql
-- Utwórz profil ręcznie
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'Admin Test', 'admin'
FROM auth.users
WHERE email = 'admin@zzpwerkplaats.nl'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Problem: Redirect loop
**Rozwiązanie:**
- Wyczyść cache przeglądarki
- Wyczyść localStorage (F12 -> Application -> Local Storage -> Clear)
- Przeładuj stronę (Ctrl+Shift+R)

---

## ✅ Sukces!

Jeśli wszystko działa:
- ✅ Możesz się zalogować jako admin
- ✅ Jesteś przekierowany do `/admin`
- ✅ Widzisz panel admina
- ✅ Możesz zarządzać użytkownikami

**Gratulacje! Twój system jest gotowy!** 🎉
