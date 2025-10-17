# 🚀 WORKER PROFILE - QUICK START & TESTING GUIDE

## ✅ **SZYBKI TEST WSZYSTKICH FUNKCJI**

### **Przygotowanie:**
1. Serwer działa na: http://localhost:5173
2. Zaloguj się jako worker
3. Przejdź do: /worker

---

## 📋 **CHECKLIST TESTOWANIA**

### **TAB 1: 📊 Przegląd**

#### Avatar Upload:
- [ ] Hover nad avatarem → pojawia się "📷 Zmień"
- [ ] Kliknij → wybierz obraz (max 5MB)
- [ ] Sprawdź success message: "✅ Avatar zaktualizowany!"
- [ ] Avatar się zmienia w UI
- [ ] Odśwież stronę → avatar zachowany

#### Quick Actions:
- [ ] Kliknij "Edytuj Profil" → przechodzi do tab "👤 Mój Profil"
- [ ] Kliknij "Certyfikaty" → przechodzi do tab "🏆 Weryfikacja"
- [ ] Kliknij "Szukaj Pracy" → przechodzi do tab "💼 Oferty"

---

### **TAB 2: 👤 Mój Profil**

#### Pod-tab: 📊 Przegląd
- [ ] 4 stats cards pokazują poprawne liczby
- [ ] Bio wyświetla się poprawnie (lub placeholder)
- [ ] Recent certificates (top 3) pokazują się

#### Pod-tab: 👤 Dane podstawowe
**TEST FORMULARZA:**
1. [ ] Zmień "Imię i nazwisko" → wpisz nową wartość
2. [ ] Zmień "Telefon" → wpisz +31...
3. [ ] Zmień "Miasto" → wpisz "Amsterdam"
4. [ ] Zmień "Specjalizacja" → wpisz "Elektryk"
5. [ ] Zmień "O mnie" → wpisz bio (4 linie)
6. [ ] Zmień "Stawka godzinowa" → wpisz 45
7. [ ] Zmień "Lata doświadczenia" → wpisz 5
8. [ ] Kliknij **"💾 Zapisz zmiany"**
9. [ ] Sprawdź message: "✅ Profil zapisany pomyślnie!"
10. [ ] Odśwież stronę → zmiany zachowane ✅

**TEST CANCEL:**
- [ ] Zmień coś → kliknij "Anuluj" → wraca do Overview bez zapisu

#### Pod-tab: ⚡ Umiejętności
**TEST ADD SKILL:**
1. [ ] Wpisz "React" w input
2. [ ] Naciśnij Enter (lub kliknij "+ Dodaj")
3. [ ] Sprawdź message: "✅ Umiejętność dodana!"
4. [ ] Skill pojawia się jako pill z gradient
5. [ ] Licznik "(X)" się aktualizuje
6. [ ] Odśwież → skill zachowany ✅

**TEST REMOVE SKILL:**
1. [ ] Hover nad skillem
2. [ ] Pojawia się "×" button
3. [ ] Kliknij "×"
4. [ ] Sprawdź message: "✅ Umiejętność usunięta!"
5. [ ] Skill znika z listy
6. [ ] Odśwież → skill usunięty ✅

**TEST POPULAR SKILLS:**
- [ ] Kliknij "Spawanie" → auto-dodaje się
- [ ] Button staje się disabled (już dodane)
- [ ] Kliknij "Montaż" → dodaje kolejny

#### Pod-tab: 🏆 Certyfikaty
**TEST UPLOAD:**
1. [ ] Kliknij "+ Dodaj certyfikat"
2. [ ] Wybierz plik (.pdf, .jpg, .png)
3. [ ] Czekaj na upload...
4. [ ] Sprawdź message: "✅ Certyfikat dodany!"
5. [ ] Certyfikat pojawia się w liście
6. [ ] Ma status: "⏳ W weryfikacji" (yellow)
7. [ ] Odśwież → certyfikat zachowany ✅

**TEST VIEW FILE:**
- [ ] Kliknij "📄 Zobacz plik"
- [ ] Otwiera się w nowej karcie
- [ ] Plik wyświetla się poprawnie

**EMPTY STATE:**
- [ ] Jeśli brak certyfikatów → pokazuje "Brak certyfikatów" + button

#### Pod-tab: 💼 Portfolio
- [ ] Pokazuje "Portfolio w przygotowaniu"
- [ ] Button "+ Dodaj projekt" (disabled)

#### Pod-tab: ⚙️ Ustawienia
**TEST NOTIFICATIONS:**
1. [ ] Zaznacz/odznacz 3 checkboxes
2. [ ] Kliknij "💾 Zapisz ustawienia powiadomień"
3. [ ] Sprawdź message: "✅ Ustawienia powiadomień zapisane!"
4. [ ] Odśwież → checkbox states zachowane ✅

**TEST PRIVACY:**
1. [ ] Zmień "Widoczność profilu" dropdown
2. [ ] Zaznacz/odznacz checkboxes
3. [ ] Kliknij "💾 Zapisz ustawienia prywatności"
4. [ ] Sprawdź message: "✅ Ustawienia prywatności zapisane!"
5. [ ] Odśwież → settings zachowane ✅

**TEST LANGUAGE:**
- [ ] Zmień język na "🇵🇱 Polski"
- [ ] (Auto-save TODO - wymaga full form submit)

---

### **TAB 3: 💼 Oferty**
- [ ] Grid 3 kolumny
- [ ] Pokazuje 6 job cards
- [ ] Każda karta ma title, company, location, salary

---

### **TAB 4: 📝 Aplikacje**
- [ ] Pokazuje empty state: "📭 Brak aplikacji"

---

### **TAB 5: 🏆 Weryfikacja**
**STATUS:**
- [ ] Jeśli verified → pokazuje "✅ Zweryfikowany"
- [ ] Jeśli nie → pokazuje "⏳ Weryfikacja w toku"

**CERTIFICATES:**
- [ ] Lista certyfikatów taka sama jak w tab "Mój Profil"
- [ ] Wszystkie akcje działają (upload, view, delete)

---

### **TAB 6: 📚 Kursy VCA**
**STATS:**
- [ ] 3 karty: Ukończone (0), W trakcie (0), Dostępne (12)

**COURSES GRID:**
- [ ] 4 kursy w grid 2 kolumny
- [ ] Każdy ma: name, price, duration, level
- [ ] Button "Zapisz się" (TODO)

---

## 🔍 **DATABASE VERIFICATION**

### **Sprawdź w Supabase Dashboard:**

#### 1. **Table: profiles**
```sql
SELECT id, full_name, phone, avatar_url, language 
FROM profiles 
WHERE role = 'worker'
ORDER BY updated_at DESC
LIMIT 1;
```
- [ ] full_name zmienione ✅
- [ ] phone zapisany ✅
- [ ] avatar_url ma nowy URL ✅
- [ ] language zaktualizowany ✅

#### 2. **Table: workers**
```sql
SELECT 
  profile_id, 
  specialization, 
  hourly_rate, 
  years_experience, 
  location_city, 
  bio, 
  skills
FROM workers
WHERE profile_id = '[your-user-id]';
```
- [ ] specialization zmieniona ✅
- [ ] hourly_rate zaktualizowana ✅
- [ ] years_experience zapisane ✅
- [ ] location_city ustawione ✅
- [ ] bio zapisane ✅
- [ ] skills array ma dodane umiejętności ✅

#### 3. **Table: certificates**
```sql
SELECT 
  worker_id, 
  certificate_type, 
  issuer, 
  issue_date, 
  file_url, 
  verified
FROM certificates
WHERE worker_id = '[your-user-id]'
ORDER BY created_at DESC;
```
- [ ] Nowy certyfikat istnieje ✅
- [ ] file_url poprawny ✅
- [ ] verified = false ✅

#### 4. **Storage: avatars bucket**
```
Ścieżka: [user-id]/avatar/[timestamp].[ext]
```
- [ ] Plik istnieje ✅
- [ ] Jest publicznie dostępny ✅

#### 5. **Storage: certificates bucket**
```
Ścieżka: [worker-id]/certificates/[timestamp].[ext]
```
- [ ] Plik certyfikatu istnieje ✅
- [ ] Jest publicznie dostępny ✅

---

## ⚠️ **ERROR SCENARIOS**

### **Test Error Handling:**

#### 1. **Avatar upload - file too large**
- [ ] Wybierz plik > 5MB
- [ ] Sprawdź error: "File size exceeds 5MB limit"
- [ ] Error message czerwony

#### 2. **Avatar upload - wrong type**
- [ ] Wybierz .exe lub .txt file
- [ ] Sprawdź error: "Invalid file type"

#### 3. **Form submit - network error**
- [ ] Wyłącz internet
- [ ] Spróbuj zapisać profil
- [ ] Sprawdź error: "❌ Nie udało się zapisać profilu"

#### 4. **Skill already exists**
- [ ] Dodaj "React"
- [ ] Spróbuj dodać "React" ponownie
- [ ] Nic się nie dzieje (validation prevents duplicate)

---

## 📊 **PERFORMANCE TEST**

### **Loading Times:**
- [ ] Initial load: < 1s
- [ ] Tab switch: < 100ms
- [ ] Form submit: < 500ms
- [ ] Avatar upload: < 2s (depends on file size)
- [ ] Certificate upload: < 2s

### **UI Responsiveness:**
- [ ] Buttons mają hover effects
- [ ] Loading states pokazują się
- [ ] Success messages auto-hide po 2-3s
- [ ] No lag podczas typowania
- [ ] Smooth transitions między tabami

---

## ✅ **PASS CRITERIA**

### **Minimum dla PASS:**
- [ ] 80% testów zielonych
- [ ] Wszystkie formularze zapisują do bazy
- [ ] Wszystkie uploads działają
- [ ] Error handling działa poprawnie
- [ ] UI jest responsywny

### **Excellent (100%):**
- [ ] 100% testów zielonych
- [ ] Wszystkie success messages pokazują się
- [ ] Database verification passes
- [ ] No console errors
- [ ] Performance < benchmarks

---

## 🚨 **KNOWN ISSUES / TODO**

### **Obecnie brak:**
- [ ] Portfolio projects (UI gotowe, backend TODO)
- [ ] Job applications workflow
- [ ] Certificate delete functionality
- [ ] Real-time sync (Supabase Realtime)
- [ ] Advanced validation (phone format, email verification)

### **Nice to have:**
- [ ] Avatar crop przed upload
- [ ] Skill autocomplete z API
- [ ] Profile analytics dashboard
- [ ] Export profile to PDF

---

## 📝 **RAPORTOWANIE BŁĘDÓW**

### **Jeśli znajdziesz błąd:**
1. Sprawdź console w DevTools (F12)
2. Zrób screenshot error message
3. Sprawdź Network tab → failed requests
4. Sprawdź Supabase logs
5. Zgłoś z opisem kroków do reprodukcji

### **Format raportu:**
```
Błąd: [krótki opis]
Kroki:
1. ...
2. ...
Oczekiwane: ...
Otrzymane: ...
Console log: [paste error]
```

---

## 🎉 **SUKCES!**

### **Jeśli wszystkie testy pass:**
✅ Worker Profile 1000% Functional - CONFIRMED!
✅ Ready for production deployment
✅ All features working as expected

---

*Testing Guide v1.0 - October 9, 2025*
*Test every feature, report bugs, celebrate success! 🚀*
