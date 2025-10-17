# 🔧 NAPRAWA PROBLEMU Z LOGOWANIEM

## Problem
❌ "Invalid login credentials" - użytkownik został usunięty z auth.users i profiles

## Rozwiązanie (KROK PO KROKU)

### KROK 1: Utwórz Użytkownika Admina w Supabase Dashboard

1. **Otwórz Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/auth/users
   ```

2. **Kliknij "Add user" (zielony przycisk w prawym górnym rogu)**

3. **Wypełnij formularz DOKŁADNIE:**
   - **Email:** `admin@zzpwerkplaats.nl`
   - **Password:** `Admin123!@#`
   - **✅ WAŻNE: Zaznacz "Auto Confirm User"**

4. **Kliknij "Create user"**

5. **Po utworzeniu:**
   - Znajdź użytkownika na liście
   - **SKOPIUJ User ID (UID)** - to jest UUID, np. `17f34dc8-dd95-4f7c-93db-325fd1225eab`

---

### KROK 2: Utwórz Profil w Bazie Danych

1. **Otwórz SQL Editor:**
   ```
   https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/sql/new
   ```

2. **Wykonaj to SQL (ZAMIEŃ UUID!):**
   ```sql
   -- Zamień 'WKLEJ_UUID_TUTAJ' na UUID skopiowane w kroku 1
   INSERT INTO profiles (id, email, full_name, role)
   VALUES (
     'WKLEJ_UUID_TUTAJ'::uuid,
     'admin@zzpwerkplaats.nl',
     'Admin Test',
     'admin'
   );

   -- Sprawdź czy zostało utworzone
   SELECT * FROM profiles WHERE email = 'admin@zzpwerkplaats.nl';
   ```

3. **Powinno zwrócić 1 wiersz** z role = 'admin'

---

### KROK 3: Zresetuj Cache Aplikacji

1. **Otwórz aplikację w przeglądarce:**
   ```
   http://localhost:5173
   ```

2. **Otwórz DevTools (F12)**

3. **Wyczyść wszystko:**
   - Application → Storage → Clear site data
   - LUB Ctrl+Shift+Delete → Wyczyść wszystko

4. **Zamknij przeglądarkę całkowicie i otwórz ponownie**

---

### KROK 4: Zaloguj się

1. **Przejdź do:**
   ```
   http://localhost:5173/login
   ```

2. **Wpisz:**
   - Email: `admin@zzpwerkplaats.nl`
   - Hasło: `Admin123!@#`

3. **Kliknij "Inloggen"**

4. **Powinno działać!** ✅

---

## Jeśli Nadal Nie Działa

### Test 1: Sprawdź Hasło w Supabase
```sql
SELECT
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as is_confirmed
FROM auth.users
WHERE email = 'admin@zzpwerkplaats.nl';
```

Powinno zwrócić:
- has_password: `true`
- is_confirmed: `true`

### Test 2: Zresetuj Hasło
Jeśli nie działa, zresetuj hasło:

1. Otwórz: https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/auth/users
2. Kliknij na użytkownika admin
3. Kliknij "..." (trzy kropki)
4. Wybierz "Reset Password"
5. Wpisz nowe hasło: `Admin123!@#`
6. Zapisz
7. Spróbuj zalogować się ponownie

### Test 3: Sprawdź Console w Przeglądarce
1. Otwórz DevTools (F12)
2. Przejdź do zakładki Console
3. Spróbuj się zalogować
4. Zobacz co jest w błędach
5. Skopiuj błędy i pokaż mi

---

## Alternatywna Metoda: Użyj Formularza Rejestracji

Jeśli powyższe nie działa:

1. **Zarejestruj nowe konto przez formularz:**
   ```
   http://localhost:5173/register/worker
   ```

2. **Wypełnij dowolnymi danymi:**
   - Email: `test@test.com`
   - Hasło: `Test123!@#`
   - ... (reszta pól)

3. **Po rejestracji zmień rolę na admina:**
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'test@test.com';
   ```

4. **Zaloguj się jako test@test.com**

---

## Dlaczego To Się Dzieje?

Supabase Auth wymaga:
1. ✅ Użytkownik w `auth.users` z hasłem
2. ✅ Email musi być potwierdzony (`email_confirmed_at`)
3. ✅ Profil w tabeli `profiles` z odpowiednią rolą
4. ✅ Hasło musi być poprawnie zahashowane przez Supabase

Kiedy usunąłeś użytkowników, zostały usunięte też ich profile i hasła.

---

## Sprawdź Status

```sql
-- Użytkownik w auth.users
SELECT email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'admin@zzpwerkplaats.nl';

-- Profil w profiles
SELECT email, role, created_at
FROM profiles
WHERE email = 'admin@zzpwerkplaats.nl';
```

Oba powinny zwrócić 1 wiersz.

---

## ✅ Po Naprawie

Gdy zalogowanie zadziała:
1. Zostaniesz przekierowany do `/admin`
2. Zobaczysz panel admina
3. Możesz zacząć dodawać użytkowników

**Powodzenia!** 🚀
