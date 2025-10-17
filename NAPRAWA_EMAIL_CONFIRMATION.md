# ✅ NAPRAWA - EMAIL NIE POTWIERDZONY

## ❌ BŁĄD
```
Login failed: Error: Email not confirmed
```

**Konto:** servicenorbs@gmail.com  
**Hasło:** Legiamistrz1916(L)  
**Problem:** Email nie został potwierdzony po rejestracji

---

## 🔧 ROZWIĄZANIA

### **OPCJA 1: Potwierdź przez email (ZALECANE)** ⭐

1. **Otwórz skrzynkę:** servicenorbs@gmail.com
2. **Szukaj emaila od Supabase**
   - Temat może zawierać: "Confirm your email" lub "Potwierdź email"
   - **Sprawdź folder SPAM/JUNK!** 📧
3. **Kliknij link w emailu**
4. **Wróć na stronę i zaloguj się**

---

### **OPCJA 2: Potwierdź ręcznie w Supabase (SZYBKIE)** ⚡

**Dla:** Gdy nie ma emaila lub chcesz od razu działać.

#### Krok 1: Otwórz Supabase SQL Editor

#### Krok 2: Uruchom to SQL:
```sql
-- Potwierdź email
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'servicenorbs@gmail.com';
```

#### Krok 3: Sprawdź czy zadziałało:
```sql
SELECT 
  email,
  email_confirmed_at,
  confirmed_at
FROM auth.users 
WHERE email = 'servicenorbs@gmail.com';
```

Powinno pokazać:
- ✅ `email_confirmed_at`: dzisiejsza data
- ✅ `confirmed_at`: dzisiejsza data

#### Krok 4: Zaloguj się
```
http://localhost:3003/login
Email: servicenorbs@gmail.com
Hasło: Legiamistrz1916(L)
→ Panel pracodawcy ✅
```

---

### **OPCJA 3: Wyłącz weryfikację emaili (dla testów)**

Aby więcej nie mieć tego problemu:

1. **Supabase Dashboard** → **Settings** → **Authentication**
2. Znajdź: **"Enable email confirmations"**
3. **Wyłącz** (toggle na OFF)
4. **Save changes**

**Efekt:** Nowe konta będą od razu potwierdzone! ✅

---

## 🧪 WERYFIKACJA PO NAPRAWIE

### Sprawdź w SQL Editor:
```sql
-- Profil użytkownika
SELECT 
  p.email,
  p.full_name,
  p.role
FROM profiles p
WHERE p.email = 'servicenorbs@gmail.com';

-- Dane firmy
SELECT 
  e.company_name,
  e.subscription_status,
  e.subscription_tier,
  e.subscription_expires_at
FROM employers e
JOIN profiles p ON e.profile_id = p.id
WHERE p.email = 'servicenorbs@gmail.com';
```

Powinno pokazać:
- ✅ Role: `employer`
- ✅ Subscription status: `active`
- ✅ Subscription expires: data za 30 dni

---

## 📋 DANE LOGOWANIA

Po potwierdzeniu emaila:

```
URL: http://localhost:3003/login
Email: servicenorbs@gmail.com
Hasło: Legiamistrz1916(L)
→ Panel pracodawcy + 30 dni subskrypcji ✅
```

---

## ❓ TROUBLESHOOTING

### Problem: "Nie widzę emaila od Supabase"
**Rozwiązanie:**
1. Sprawdź folder SPAM/Junk
2. Poczekaj 5-10 minut (może być opóźnienie)
3. Użyj Opcji 2 (potwierdź ręcznie w SQL)

### Problem: "Nadal błąd po potwierdzeniu"
**Rozwiązanie:**
1. Wyloguj się ze strony
2. Wyczyść cache (Ctrl+Shift+Del)
3. Odśwież stronę (Ctrl+F5)
4. Zaloguj się ponownie

### Problem: "SQL nie działa"
**Rozwiązanie:**
1. Sprawdź czy masz uprawnienia do `auth.users`
2. Spróbuj przez Supabase Dashboard:
   - Authentication → Users
   - Znajdź servicenorbs@gmail.com
   - Kliknij menu (...)
   - "Confirm email"

---

## 🎯 SZYBKI START

**Najszybsza metoda (1 minuta):**

1. Otwórz Supabase SQL Editor
2. Wklej i uruchom:
   ```sql
   UPDATE auth.users 
   SET email_confirmed_at = NOW(), confirmed_at = NOW()
   WHERE email = 'servicenorbs@gmail.com';
   ```
3. Wróć na http://localhost:3003/login
4. Zaloguj się: servicenorbs@gmail.com / Legiamistrz1916(L)
5. ✅ Działa!

---

## 🔄 NASTĘPNE KONTA

Gdy będziesz tworzyć więcej kont, pamiętaj:
- ✅ Użyj Opcji 3 (wyłącz email confirmation w Supabase)
- ✅ Lub zawsze potwierdź email ręcznie SQL
- ✅ Lub sprawdzaj skrzynkę email (także SPAM!)

---

**Status:** ✅ Gotowe do naprawy  
**Czas:** ~2 minuty  
**Priorytet:** 🔥 KRYTYCZNY (nie można się zalogować)
