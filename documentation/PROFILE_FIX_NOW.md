# 🔧 PROFILE NOT SHOWING - QUICK FIX (2025-10-12)

## ✅ PŁATNOŚCI DZIAŁAJĄ!
- Stripe Checkout ✅
- Payment Success ✅ ("Betaling Geslaagd!")
- Edge Functions z STRIPE_SECRET_KEY ✅

## ❌ PROBLEM: Profile się nie pokazuje

### **Błędy z konsoli:**
```
❌ PGRST116: The result contains 0 rows (profiles)
❌ PGRST116: The result contains 0 rows (workers)  
❌ Could not find table 'public.certificates'
❌ Auth timeout (5s)
```

### **Przyczyna:**
Użytkownik istnieje w `auth.users`, ale **NIE MA** rekordów w:
- `profiles` tabela
- `workers` tabela
- `certificates` tabela (nie istnieje!)

---

## 🚀 NATYCHMIASTOWA NAPRAWA (3 kroki):

### **KROK 1: Utwórz tabelę certificates**

1. Otwórz: https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql/new
2. Skopiuj **cały** plik: `FIX_MISSING_TABLES.sql`
3. Wklej i kliknij **RUN**
4. Poczekaj na: `Success. No rows returned`

---

### **KROK 2: Dodaj profile + worker dla zalogowanego użytkownika**

**W tym samym SQL Editor**, uruchom ten kod:

```sql
DO $$
DECLARE
  last_user_id UUID;
  last_user_email TEXT;
BEGIN
  -- Pobierz ostatnio zalogowanego użytkownika
  SELECT id, email INTO last_user_id, last_user_email
  FROM auth.users
  ORDER BY last_sign_in_at DESC NULLS LAST
  LIMIT 1;

  RAISE NOTICE 'Naprawiam profil dla: % (%)', last_user_email, last_user_id;

  -- Utwórz profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (last_user_id, last_user_email, last_user_email, 'worker')
  ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

  -- Utwórz worker z PREMIUM (bo payment się udał!)
  INSERT INTO public.workers (profile_id, subscription_tier, subscription_status)
  VALUES (last_user_id, 'premium', 'active')
  ON CONFLICT (profile_id) DO UPDATE 
  SET subscription_tier = 'premium', subscription_status = 'active';

  RAISE NOTICE 'Gotowe! Profile i Worker utworzone dla %', last_user_email;
END $$;
```

**Oczekiwany output:**
```
NOTICE: Naprawiam profil dla: email@example.com (uuid)
NOTICE: Gotowe! Profile i Worker utworzone dla email@example.com
```

---

### **KROK 3: Wyczyść cache i test**

1. **W przeglądarce (F12 Console):**
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   location.reload()
   ```

2. **Zaloguj się ponownie**

3. **Oczekiwane:** ✅ Dashboard z Premium badge

---

## 📊 WERYFIKACJA (opcjonalna):

Sprawdź czy dane są OK:

```sql
SELECT 
  u.email,
  p.role,
  w.subscription_tier,
  w.subscription_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN workers w ON u.id = w.profile_id
ORDER BY u.last_sign_in_at DESC NULLS LAST
LIMIT 5;
```

**Powinno pokazać:**
```
email           | role   | tier    | status
----------------|--------|---------|--------
twoj@email.com  | worker | premium | active
```

---

## 📁 Pliki z fix'ami:

1. **FIX_MISSING_TABLES.sql** - Tworzy certificates + RLS
2. **FIX_USER_PROFILES.sql** - Naprawia profile/workers

**Wykonaj KROK 1 i KROK 2, potem odśwież stronę!** 🚀
