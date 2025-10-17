# 🚀 Quick Start - Logowanie w 2 Minuty

## ❌ Częsty Błąd

Jeśli widzisz błąd:
- `duplicate key value violates unique constraint "profiles_pkey"`
- `violates foreign key constraint "profiles_id_fkey"`

**To znaczy, że próbujesz utworzyć profil BEZ użytkownika!**

---

## ✅ POPRAWNA Kolejność

1. **NAJPIERW:** Utwórz użytkownika w Supabase Dashboard
2. **POTEM:** Trigger automatycznie utworzy profil
3. **NIE:** Nie twórz profilu ręcznie przez SQL!

---

## Krok 1: Usuń Starego Użytkownika (jeśli istnieje)

1. Otwórz: https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/auth/users
2. Znajdź `admin@zzpwerkplaats.nl`
3. Kliknij "..." → **"Delete user"**
4. Potwierdź

## Krok 2: Utwórz Nowego Użytkownika

1. **W tym samym oknie** kliknij **"Add user"**
2. Wypełnij:
   - Email: `admin@zzpwerkplaats.nl`
   - Password: `Admin123!@#`
   - ✅ **ZAZNACZ "Auto Confirm User"**
3. Kliknij **"Create user"**
4. **Poczekaj 2-3 sekundy** (trigger tworzy profil)

## Krok 3: Sprawdź czy Profil Powstał

Otwórz: https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/sql/new

```sql
SELECT * FROM profiles WHERE email = 'admin@zzpwerkplaats.nl';
```

**Jeśli zwraca 0 wierszy**, utwórz profil:

```sql
-- To zadziała, bo użytkownik już istnieje w auth.users
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'Admin Test', 'admin'
FROM auth.users
WHERE email = 'admin@zzpwerkplaats.nl';
```

## Krok 4: Upewnij się że Role = Admin

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@zzpwerkplaats.nl';
```

## Krok 5: Zaloguj Się

1. Wyczyść cache (Ctrl+Shift+Delete)
2. Zamknij przeglądarkę
3. Otwórz: `npm run dev`
4. Idź do: http://localhost:5173/login
5. Zaloguj się:
   - Email: `admin@zzpwerkplaats.nl`
   - Hasło: `Admin123!@#`

---

## ✅ Baza Danych - Gotowa!

Wszystkie tabele zostały utworzone:
- ✅ profiles (użytkownicy)
- ✅ workers (pracownicy)
- ✅ employers (pracodawcy)
- ✅ certificates (certyfikaty)
- ✅ jobs (oferty pracy)
- ✅ applications (aplikacje)
- ✅ reviews (opinie)
- ✅ zzp_exam_applications (egzaminy)

## 🔐 Bezpieczeństwo (RLS)

- ✅ Każdy użytkownik widzi tylko swoje dane
- ✅ Admini mają dostęp do wszystkiego
- ✅ Pracodawcy mogą przeglądać pracowników
- ✅ Pracownicy mogą przeglądać oferty pracy

## 🎯 Testowanie

### Panel Admina
http://localhost:5173/login
- Email: admin@zzpwerkplaats.nl
- Hasło: Admin123!@#
- Redirect: `/admin`

### Rejestracja Pracownika
http://localhost:5173/register/worker
- Redirect po rejestracji: `/worker`

### Rejestracja Pracodawcy
http://localhost:5173/register/employer
- Redirect po rejestracji: `/employer/subscription`
- Po opłaceniu subskrypcji: `/employer`

---

## 📚 Więcej Informacji

Pełna dokumentacja: `KONFIGURACJA_BAZY_DANYCH.md`
