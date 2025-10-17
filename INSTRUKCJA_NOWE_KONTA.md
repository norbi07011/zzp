# 🔄 INSTRUKCJA: USUWANIE TESTOWYCH KONT I TWORZENIE PRAWDZIWYCH

## 📋 PRZEGLĄD

Usuniemy stare testowe konta i utworzymy 3 nowe PRAWDZIWE konta:
1. ✅ **Admin** - przez Supabase Dashboard
2. ✅ **Pracodawca (Employer)** - przez formularz rejestracji
3. ✅ **Pracownik (Worker)** - przez formularz rejestracji

---

## 🗑️ KROK 1: USUWANIE TESTOWYCH KONT

### W Supabase Dashboard:

1. **Otwórz Supabase Dashboard**
   - Przejdź do swojego projektu

2. **Przejdź do SQL Editor**
   - Kliknij "SQL Editor" w menu po lewej

3. **Wklej i uruchom skrypt**
   - Otwórz plik: `supabase/migrations/20250113_remove_test_accounts.sql`
   - Skopiuj **TYLKO sekcję "KROK 1: USUWANIE TESTOWYCH KONT"** (pierwsze 30 linii)
   - Wklej do SQL Editor
   - Kliknij **RUN**

### Co zostanie usunięte:
- ❌ `employer@test.nl`
- ❌ `worker@test.nl`
- ❌ `admin@zzp.nl`

### Weryfikacja:
```sql
SELECT email, role FROM profiles;
```
Powinno pokazać pustą listę lub inne konta (nie testowe).

---

## 👨‍💼 KROK 2: TWORZENIE KONTA ADMINA

Admin **NIE MA** formularza rejestracji (bezpieczeństwo!).
Musi być utworzony ręcznie w Supabase Dashboard.

### Sposób A: Przez Supabase Dashboard (ZALECANE) ⭐

1. **Otwórz Authentication**
   - W Supabase Dashboard → kliknij "Authentication"
   - Zakładka "Users"

2. **Dodaj nowego użytkownika**
   - Kliknij przycisk **"Add user"** (lub "Invite")
   - Wybierz **"Create new user"**

3. **Wypełnij formularz:**
   ```
   Email: admin@zzpwerkplaats.nl
   Password: [SILNE HASŁO - zapisz je!]
   ☑️ Auto Confirm User (zaznacz!)
   ```

4. **Utwórz użytkownika**
   - Kliknij "Create user" lub "Send invitation"
   - **SKOPIUJ UUID** nowego użytkownika (np. `a1b2c3d4-...`)

5. **Dodaj profil admina w SQL Editor:**
   - Wróć do SQL Editor
   - Uruchom (zamień UUID!):
   ```sql
   INSERT INTO profiles (id, email, full_name, role, created_at)
   VALUES (
     'a1b2c3d4-TWOJ-UUID-TUTAJ'::uuid,
     'admin@zzpwerkplaats.nl',
     'Administrator',
     'admin',
     NOW()
   );
   ```

6. **Weryfikacja:**
   ```sql
   SELECT email, role FROM profiles WHERE role = 'admin';
   ```
   Powinno pokazać nowego admina!

### Sposób B: Przez SQL (jeśli Sposób A nie działa)

Jeśli masz uprawnienia do `auth` schema:
```sql
-- W SQL Editor uruchom funkcję (zmień dane!):
SELECT create_admin_account(
  'admin@zzpwerkplaats.nl',
  'TwojeHasło123!',
  'Administrator'
);
```

---

## 🏢 KROK 3: REJESTRACJA PRACODAWCY

### Przez formularz na stronie:

1. **Otwórz stronę rejestracji:**
   ```
   http://localhost:3003/register/employer
   ```

2. **KROK 1/3 - Dane Firmy:**
   ```
   Nazwa firmy: TestBedrijf BV
   Nr KVK: 12345678
   ```
   → Kliknij **"Volgende"** (Dalej)

3. **KROK 2/3 - Kontakt:**
   ```
   Osoba kontaktowa: Jan Kowalski
   Email: pracodawca@zzpwerkplaats.nl
   Telefon: +31612345678
   ```
   → Kliknij **"Volgende"**

4. **KROK 3/3 - Hasło:**
   ```
   Hasło: [SILNE HASŁO - min 8 znaków]
   Powtórz hasło: [to samo hasło]
   ☑️ Akceptuję regulamin
   ```
   → Kliknij **"Registreren"** (Zarejestruj)

5. **Potwierdzenie email (jeśli wymagane):**
   - Sprawdź skrzynkę email
   - Kliknij link potwierdzający
   - Wróć na stronę i zaloguj się

### Co się stworzy automatycznie:
- ✅ Konto w `auth.users`
- ✅ Profil w `profiles` (role='employer')
- ✅ Rekord w `employers` z danymi firmy
- ✅ Aktywna subskrypcja basic (30 dni) 🎉

---

## 👷 KROK 4: REJESTRACJA PRACOWNIKA

### Przez formularz na stronie:

1. **Otwórz stronę rejestracji:**
   ```
   http://localhost:3003/register/worker
   ```

2. **Wypełnij formularz:**
   ```
   Imię i nazwisko: Piet van der Berg
   Email: pracownik@zzpwerkplaats.nl
   Telefon: +31687654321
   Miejscowość: Amsterdam
   Kod pocztowy: 1012AB
   
   Kategoria: Magazijn medewerker (lub inna)
   Doświadczenie: 5 lat
   
   Hasło: [SILNE HASŁO]
   Powtórz hasło: [to samo hasło]
   ☑️ Akceptuję regulamin
   ```
   → Kliknij **"Registreren"**

3. **Potwierdzenie email (jeśli wymagane):**
   - Sprawdź skrzynkę
   - Potwierdź email
   - Zaloguj się

### Co się stworzy automatycznie:
- ✅ Konto w `auth.users`
- ✅ Profil w `profiles` (role='worker')
- ✅ Rekord w `workers` z danymi pracownika
- ✅ Domyślna subskrypcja basic 🎉

---

## ✅ KROK 5: WERYFIKACJA

### Sprawdź w Supabase:

1. **Table Editor → profiles:**
   ```sql
   SELECT email, full_name, role, created_at 
   FROM profiles 
   ORDER BY created_at DESC;
   ```
   
   Powinno być **3 konta**:
   - ✅ admin@zzpwerkplaats.nl (role: admin)
   - ✅ pracodawca@zzpwerkplaats.nl (role: employer)
   - ✅ pracownik@zzpwerkplaats.nl (role: worker)

2. **Table Editor → employers:**
   ```sql
   SELECT company_name, subscription_status 
   FROM employers;
   ```
   
   Powinien być **1 rekord**:
   - ✅ TestBedrijf BV (subscription_status: active)

3. **Table Editor → workers:**
   ```sql
   SELECT full_name, category 
   FROM workers;
   ```
   
   Powinien być **1 rekord**:
   - ✅ Piet van der Berg

---

## 🧪 KROK 6: TESTOWANIE LOGOWANIA

### Test 1: Admin
```
1. Przejdź do: http://localhost:3003/login
2. Zaloguj się:
   Email: admin@zzpwerkplaats.nl
   Hasło: [hasło które ustawiłeś]
3. ✅ Powinieneś trafić do /admin
4. ✅ Panel admina się wyświetla
```

### Test 2: Pracodawca
```
1. Przejdź do: http://localhost:3003/login
2. Zaloguj się:
   Email: pracodawca@zzpwerkplaats.nl
   Hasło: [hasło z rejestracji]
3. ✅ Powinieneś trafić do /employer
4. ✅ Dashboard pracodawcy się wyświetla
5. ✅ Widoczna karta: "Dni do końca subskrypcji: 30"
```

### Test 3: Pracownik
```
1. Przejdź do: http://localhost:3003/login
2. Zaloguj się:
   Email: pracownik@zzpwerkplaats.nl
   Hasło: [hasło z rejestracji]
3. ✅ Powinieneś trafić do /worker
4. ✅ Dashboard pracownika się wyświetla
```

---

## 🎯 PODSUMOWANIE NOWYCH KONT

| Rola | Email | Hasło | Utworzone przez |
|------|-------|-------|-----------------|
| Admin | admin@zzpwerkplaats.nl | [Twoje silne hasło] | Supabase Dashboard |
| Pracodawca | pracodawca@zzpwerkplaats.nl | [Hasło z formularza] | Formularz rejestracji |
| Pracownik | pracownik@zzpwerkplaats.nl | [Hasło z formularza] | Formularz rejestracji |

---

## 🔐 BEZPIECZEŃSTWO

### Wymagania haseł:
- ✅ Minimum 8 znaków
- ✅ Duże i małe litery
- ✅ Cyfry
- ✅ Znaki specjalne (!, @, #, $, etc.)

### Przykłady DOBRYCH haseł:
- `Admin2025!Secure`
- `Test@Employer#2025`
- `Worker$Pass123!`

### ⚠️ NIE UŻYWAJ:
- ❌ `test123`
- ❌ `admin`
- ❌ `password`

---

## ❓ TROUBLESHOOTING

### Problem: "Email already exists"
- Stare konto nie zostało usunięte
- Uruchom ponownie skrypt usuwania (KROK 1)

### Problem: "Cannot insert into auth.users"
- Brak uprawnień do auth schema
- Użyj Supabase Dashboard zamiast SQL (Sposób A)

### Problem: Formularz rejestracji nie działa
1. Sprawdź Console (F12) na błędy
2. Sprawdź czy serwer dev działa (npm run dev)
3. Sprawdź Supabase connection

### Problem: Po rejestracji nie ma subskrypcji
- Uruchom ponownie migrację: `20250113_add_employer_subscription_columns.sql`
- Sprawdź czy kolumny `subscription_*` istnieją w tabeli `employers`

---

## 📝 CHECKLIST

Zaznacz po wykonaniu:

**Usuwanie:**
- [ ] Uruchomiono SQL usuwający testowe konta
- [ ] Zweryfikowano że stare konta zniknęły

**Admin:**
- [ ] Utworzono użytkownika w Supabase Dashboard
- [ ] Dodano profil w tabeli `profiles`
- [ ] Przetestowano logowanie

**Pracodawca:**
- [ ] Zarejestrowano przez formularz
- [ ] Potwierdzono email (jeśli wymagane)
- [ ] Sprawdzono subskrypcję w bazie
- [ ] Przetestowano logowanie

**Pracownik:**
- [ ] Zarejestrowano przez formularz
- [ ] Potwierdzono email (jeśli wymagane)
- [ ] Sprawdzono profil w bazie
- [ ] Przetestowano logowanie

---

## 🎉 GOTOWE!

Po wykonaniu wszystkich kroków masz:
- ✅ 3 prawdziwe konta w bazie
- ✅ Wszystkie role działają
- ✅ Subskrypcje są aktywne
- ✅ Brak testowych danych

**Możesz teraz normalnie korzystać z aplikacji!** 🚀

---

**Utworzono:** 2025-01-13  
**Serwer:** http://localhost:3003  
**Status:** ✅ Gotowe do wykonania
