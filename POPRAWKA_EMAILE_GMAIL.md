# 🔧 POPRAWKA - DANE DO REJESTRACJI (PRAWDZIWE EMAILE)

## ❌ PROBLEM

Błąd podczas rejestracji:
```
Email address "pracodawca@zzpwerkplaats.nl" is invalid
Status: 400
```

**Przyczyna:**
Supabase waliduje format emaila i odrzuca domeny które nie istnieją lub nie mają prawidłowych rekordów MX.
Domena `zzpwerkplaats.nl` nie istnieje → email jest odrzucany.

---

## ✅ ROZWIĄZANIE: UŻYJ PRAWDZIWYCH EMAILI

Zamiast `@zzpwerkplaats.nl` użyj:
- ✅ Gmail: `@gmail.com`
- ✅ Outlook: `@outlook.com` / `@hotmail.com`
- ✅ Yahoo: `@yahoo.com`
- ✅ Własna domena (jeśli masz)

---

## 📧 NOWE DANE DO REJESTRACJI

### 🏢 PRACODAWCA (Employer)

**URL:** http://localhost:3003/register/employer

**KROK 1/3 - Firma:**
```
Nazwa firmy: TestBedrijf BV
Nr KVK: 12345678
```

**KROK 2/3 - Kontakt:**
```
Osoba kontaktowa: Jan Kowalski
Email: pracodawca.test@gmail.com          ← ZMIENIONE!
Telefon: +31612345678
```

**KROK 3/3 - Hasło:**
```
Hasło: TestEmployer2025!
Powtórz: TestEmployer2025!
☑️ Akceptuję regulamin
```

---

### 👷 PRACOWNIK (Worker)

**URL:** http://localhost:3003/register/worker

**Dane:**
```
Imię i nazwisko: Piet van der Berg
Email: pracownik.test@gmail.com           ← ZMIENIONE!
Telefon: +31687654321
Miejscowość: Amsterdam
Kod pocztowy: 1012AB

Kategoria: Magazijn medewerker
Doświadczenie: 5 lat

Hasło: TestWorker2025!
Powtórz: TestWorker2025!
☑️ Akceptuję regulamin
```

---

### 👨‍💼 ADMINISTRATOR

**W Supabase Dashboard (Authentication → Add User):**
```
Email: admin.test@gmail.com               ← ZMIENIONE!
Password: TestAdmin2025!
☑️ Auto Confirm User
```

**Po utworzeniu - dodaj profil w SQL Editor:**
```sql
-- Zamień UUID na ten z Supabase Dashboard
INSERT INTO profiles (id, email, full_name, role, created_at)
VALUES (
  'UUID-Z-SUPABASE'::uuid,
  'admin.test@gmail.com',
  'Administrator',
  'admin',
  NOW()
);
```

---

## 🎯 PODSUMOWANIE NOWYCH KONT

| Rola | Email | Hasło | Status |
|------|-------|-------|--------|
| Admin | admin.test@gmail.com | TestAdmin2025! | Przez Supabase Dashboard |
| Pracodawca | pracodawca.test@gmail.com | TestEmployer2025! | Formularz rejestracji |
| Pracownik | pracownik.test@gmail.com | TestWorker2025! | Formularz rejestracji |

---

## ⚠️ WAŻNE UWAGI

### 1. Email confirmation (potwierdzenie email)
Jeśli Supabase ma włączone **Email Confirmation**:
- 📧 Dostaniesz email potwierdzający na podany Gmail
- 🔗 Kliknij link w emailu
- ✅ Konto zostanie aktywowane

**Aby wyłączyć potwierdzenie emaila (dla testów):**
1. Supabase Dashboard → Settings → Authentication
2. Znajdź: "Enable email confirmations"
3. Wyłącz (Disable)
4. Save

### 2. Użyj PRAWDZIWYCH Gmail accounts
- ✅ Możesz użyć swoich prawdziwych emaili Gmail
- ✅ Lub stwórz nowe konta Gmail tylko do testów
- ✅ Możesz też użyć aliasów: `twojmail+admin@gmail.com`, `twojmail+employer@gmail.com`

### 3. Gmail aliasy (super sztuczka!)
Gmail ignoruje wszystko po `+`:
```
jan.kowalski@gmail.com
jan.kowalski+admin@gmail.com      → trafia do tej samej skrzynki!
jan.kowalski+employer@gmail.com   → trafia do tej samej skrzynki!
jan.kowalski+worker@gmail.com     → trafia do tej samej skrzynki!
```

**Zaleta:** Wszystkie emaile trafią do jednej skrzynki, ale Supabase traktuje je jako różne konta!

---

## 🔄 INSTRUKCJA KROK PO KROKU

### KROK 1: Usuń stare testowe konta (jeśli istnieją)

W Supabase SQL Editor:
```sql
DELETE FROM employers WHERE profile_id IN (
  SELECT id FROM profiles WHERE email IN (
    'employer@test.nl',
    'admin@zzp.nl',
    'worker@test.nl',
    'pracodawca@zzpwerkplaats.nl',
    'pracownik@zzpwerkplaats.nl'
  )
);

DELETE FROM workers WHERE profile_id IN (
  SELECT id FROM profiles WHERE email IN (
    'employer@test.nl',
    'admin@zzp.nl',
    'worker@test.nl',
    'pracodawca@zzpwerkplaats.nl',
    'pracownik@zzpwerkplaats.nl'
  )
);

DELETE FROM profiles WHERE email IN (
  'employer@test.nl',
  'admin@zzp.nl',
  'worker@test.nl',
  'pracodawca@zzpwerkplaats.nl',
  'pracownik@zzpwerkplaats.nl'
);

DELETE FROM auth.users WHERE email IN (
  'employer@test.nl',
  'admin@zzp.nl',
  'worker@test.nl',
  'pracodawca@zzpwerkplaats.nl',
  'pracownik@zzpwerkplaats.nl'
);
```

### KROK 2: Utwórz konto ADMINA

**Supabase Dashboard → Authentication → Add User:**
```
Email: admin.test@gmail.com
Password: TestAdmin2025!
☑️ Auto Confirm User
→ Create user
```

**Skopiuj UUID, potem SQL Editor:**
```sql
INSERT INTO profiles (id, email, full_name, role, created_at)
VALUES (
  'UUID-Z-SUPABASE'::uuid,
  'admin.test@gmail.com',
  'Administrator',
  'admin',
  NOW()
);
```

### KROK 3: Zarejestruj PRACODAWCĘ

http://localhost:3003/register/employer

```
Firma: TestBedrijf BV
KVK: 12345678

Kontakt: Jan Kowalski
Email: pracodawca.test@gmail.com     ← NOWY!
Tel: +31612345678

Hasło: TestEmployer2025!
→ Registreren
```

### KROK 4: Zarejestruj PRACOWNIKA

http://localhost:3003/register/worker

```
Nazwa: Piet van der Berg
Email: pracownik.test@gmail.com      ← NOWY!
Tel: +31687654321
Miasto: Amsterdam
Kod: 1012AB
Kategoria: Magazijn medewerker
Lata: 5

Hasło: TestWorker2025!
→ Registreren
```

### KROK 5: Potwierdź emaile (jeśli wymagane)

- 📧 Sprawdź skrzynkę Gmail
- 🔗 Kliknij linki potwierdzające w emailach
- ✅ Konta aktywowane!

### KROK 6: Testuj logowanie

**Admin:**
```
http://localhost:3003/login
Email: admin.test@gmail.com
Hasło: TestAdmin2025!
→ Panel admina ✅
```

**Pracodawca:**
```
http://localhost:3003/login
Email: pracodawca.test@gmail.com
Hasło: TestEmployer2025!
→ Dashboard pracodawcy + 30 dni subskrypcji ✅
```

**Pracownik:**
```
http://localhost:3003/login
Email: pracownik.test@gmail.com
Hasło: TestWorker2025!
→ Dashboard pracownika ✅
```

---

## 🎯 ALTERNATYWNE OPCJE EMAILI

### Opcja 1: Twoje prawdziwe emaile
```
admin.test@gmail.com      → twój email
employer.test@gmail.com   → inny twój email
worker.test@gmail.com     → jeszcze inny
```

### Opcja 2: Jeden email z aliasami (ZALECANE!)
```
jankowalski+admin@gmail.com
jankowalski+employer@gmail.com
jankowalski+worker@gmail.com
```
Wszystkie trafią do `jankowalski@gmail.com`!

### Opcja 3: Temp-mail (tylko do testów!)
Użyj tymczasowych emaili z:
- https://temp-mail.org
- https://10minutemail.com
**Uwaga:** Nie używaj do produkcji!

---

## ❓ TROUBLESHOOTING

### Błąd: "Email already exists"
- Email już istnieje w bazie
- Uruchom SQL usuwający stare konta (KROK 1)
- Użyj innego emaila

### Błąd: "Invalid email"
- Upewnij się że używasz `@gmail.com`, `@outlook.com` itp.
- NIE używaj `@zzpwerkplaats.nl` (nie istnieje!)
- Sprawdź czy nie ma literówek

### Błąd: "Email not confirmed"
- Sprawdź skrzynkę email (także SPAM!)
- Kliknij link potwierdzający
- Lub wyłącz email confirmation w Supabase Settings

### Błąd: 400 Bad Request
- Prawdopodobnie nieprawidłowy format danych
- Sprawdź Console (F12) na szczegóły błędu
- Upewnij się że wypełniłeś wszystkie wymagane pola

---

## ✅ GOTOWE!

Po wykonaniu tych kroków będziesz mieć:
- ✅ 3 prawdziwe konta z Gmail
- ✅ Wszystkie role działają poprawnie
- ✅ Brak błędów walidacji emaila
- ✅ Gotowe do testowania

---

**Utworzono:** 2025-01-13  
**Status:** ✅ Gotowe do użycia  
**Priorytet:** 🔥 KRYTYCZNE (fix dla błędu rejestracji)
