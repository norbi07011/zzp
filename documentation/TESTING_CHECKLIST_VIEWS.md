# 🎯 TESTING CHECKLIST - Worker Dashboard po migracji na widoki

**Port:** http://localhost:8080  
**Status:** ✅ Serwer działa (Vite v6.3.6)  
**Migracja:** ✅ 43 zmiany na widoki - COMPLETE

---

## ⚡ **NATYCHMIAST PRZED TESTOWANIEM:**

### **1. HARD REFRESH przeglądarki:**
```
Ctrl + Shift + R
```

**POWÓD:** Przeglądarka cache'uje stary kod. Musisz wymusić reload!

---

## 🔐 **LOGIN:**

### **Dane testowe Worker:**
```
Email: worker@test.nl
Hasło: (Twoje hasło demo)
```

### **Gdzie:** 
```
http://localhost:8080/login
```

---

## ✅ **CHECKLIST - WORKER DASHBOARD:**

### **🏠 TAB 1: PRZEGLĄD (Overview)**
- [ ] Kliknij "Przegląd"
- [ ] **Console:** BRAK błędów 404 ❌
- [ ] **Ekran:** Dane się wyświetlają (statystyki, aktywność)
- [ ] **Ładowanie:** Krótkie, nie wieczne

**Co sprawdzamy:** Czy widok `v_workers` i `v_profiles` zwraca dane

---

### **👤 TAB 2: MÓJ PROFIL (Profile)**
- [ ] Kliknij "Mój profil"
- [ ] **Console:** BRAK `Error fetching worker profile` ❌
- [ ] **Ekran:** Pełny profil widoczny (imię, email, avatar, bio)
- [ ] **Edycja:** Przycisk "Edytuj profil" działa

**Co sprawdzamy:** Czy `getWorkerProfile()` działa z widokiem

---

### **💼 TAB 3: PORTFOLIO (Portfolio)**
- [ ] Kliknij "Portfolio"
- [ ] **Console:** BRAK `Error fetching portfolio: 404` ❌
- [ ] **Ekran:** 
  - Jeśli masz projekty → lista widoczna
  - Jeśli nie masz → "Brak projektów" (NIE wieczne ładowanie!)
- [ ] **Dodaj projekt:** Przycisk "Dodaj projekt" działa

**Co sprawdzamy:** Czy tabela `portfolio_projects` istnieje i `getPortfolioProjects()` działa

---

### **📝 TAB 4: APLIKACJE (Applications)**
- [ ] Kliknij "Aplikacje"
- [ ] **Console:** BRAK `Error fetching applications: 404` ❌
- [ ] **Ekran:** 
  - Jeśli masz aplikacje → lista widoczna
  - Jeśli nie masz → "Brak aplikacji" (NIE wieczne ładowanie!)
- [ ] **Status:** Pending/Accepted/Rejected oznaczenia widoczne

**Co sprawdzamy:** Czy tabela `job_applications` istnieje i `getApplications()` działa

---

### **💰 TAB 5: ZAROBKI (Earnings)**
- [ ] Kliknij "Zarobki"
- [ ] **Console:** BRAK `Error fetching earnings: 404` ❌
- [ ] **Ekran:** 
  - Jeśli masz zarobki → kwoty widoczne
  - Jeśli nie masz → "Brak zarobków" (NIE wieczne ładowanie!)
- [ ] **Statystyki:** Suma zarobków wyświetla się

**Co sprawdzamy:** Czy tabela `earnings` istnieje i `getEarnings()` działa

---

### **⭐ TAB 6: RECENZJE (Reviews)**
- [ ] Kliknij "Recenzje"
- [ ] **Console:** BRAK `Error fetching reviews: 404` ❌
- [ ] **Ekran:** 
  - Jeśli masz recenzje → lista widoczna + rating
  - Jeśli nie masz → "Brak recenzji" (NIE wieczne ładowanie!)
- [ ] **Średnia:** Ocena średnia się wyświetla

**Co sprawdzamy:** Czy tabela `reviews` istnieje i `getReviews()` działa

---

### **🔍 TAB 7: WERYFIKACJA (Verification)**
- [ ] Kliknij "Weryfikacja"
- [ ] **Console:** BRAK błędów 404 ❌
- [ ] **Ekran:** Status weryfikacji widoczny
- [ ] **Certyfikaty:** Lista certyfikatów ładuje się

**Co sprawdzamy:** Czy widok `v_certificates` działa

---

### **📚 TAB 8: KURSY (Courses)**
- [ ] Kliknij "Kursy"
- [ ] **Console:** BRAK błędów ❌
- [ ] **Ekran:** Kursy/certyfikaty widoczne

---

## 🔴 **JEŚLI DALEJ WIDZISZ 404:**

### **Scenariusz A: Widoki nie istnieją**

**Symptom:**
```
❌ Error: relation "public.v_profiles" does not exist
```

**Rozwiązanie:**
Uruchom SQL w Supabase Dashboard → SQL Editor:

```sql
-- Sprawdź czy widoki istnieją
SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname LIKE 'v_%';
```

**Jeśli puste** → Widoki NIE ZOSTAŁY UTWORZONE! Poproś o skrypt SQL tworzący widoki.

---

### **Scenariusz B: Brak uprawnień SELECT**

**Symptom:**
```
❌ Error: permission denied for view v_profiles
```

**Rozwiązanie:**
Uruchom SQL w Supabase:

```sql
GRANT SELECT ON public.v_profiles TO anon, authenticated;
GRANT SELECT ON public.v_workers TO anon, authenticated;
GRANT SELECT ON public.v_employers TO anon, authenticated;
GRANT SELECT ON public.v_certificates TO anon, authenticated;
```

---

### **Scenariusz C: Tabele portfolio/applications/earnings/reviews nie istnieją**

**Symptom:**
```
❌ Error: relation "public.portfolio_projects" does not exist
```

**Rozwiązanie:**
Uruchom **QUICK_SQL_MIGRATION.sql** ponownie! (Tabele nie zostały utworzone)

---

### **Scenariusz D: Cache przeglądarki**

**Symptom:** Dalej widzę 404, ale serwer pokazuje nowy kod

**Rozwiązanie:**
1. Otwórz DevTools (F12)
2. Kliknij prawym na refresh → "Empty Cache and Hard Reload"
3. Lub: Ctrl+Shift+Delete → Wyczyść cache

---

## 📊 **SPODZIEWANE WYNIKI:**

### **✅ SUKCES - Console:**
```javascript
✅ Tab clicked: overview
✅ Tab clicked: profile
✅ Tab clicked: portfolio
✅ Tab clicked: applications
✅ Tab clicked: earnings
✅ Tab clicked: reviews

// BRAK tych błędów:
❌ Error fetching applications: Object
❌ Failed to load resource: 404
❌ Error fetching earnings: Object
❌ Error fetching reviews: Object
```

### **✅ SUKCES - Ekran:**
- Zakładki przełączają się <1s
- Dane widoczne (lub "Brak danych" jeśli puste)
- NIE MA wiecznego "Ładowanie..."
- Przyciski działają (Edytuj, Dodaj, etc.)

---

## 🎯 **CO ZROBIĆ PO TESTACH?**

### **A. WSZYSTKO DZIAŁA ✅**
Napisz: "Wszystko działa! Dane się ładują, brak 404!"

**Wtedy dodamy:**
- Seed danych testowych (portfolio, aplikacje, zarobki)
- Funkcje CRUD (dodaj/edytuj projekt)
- Upload zdjęć portfolio
- Filtrowanie i sortowanie

---

### **B. NADAL 404 ❌**
Zrób screenshot Console (F12 → Console) i prześlij.

**Potrzebuję:**
1. Screenshot Console z błędami
2. Screenshot Network tab (F12 → Network → filtruj "404")
3. Który tab konkretnie nie działa?

**Dam skrypt SQL** do naprawy widoków/uprawnień.

---

### **C. INNE BŁĘDY ⚠️**
Opisz co się dzieje:
- Który tab?
- Jaki błąd w Console?
- Co widzisz na ekranie?

---

## 🚀 **READY TO TEST?**

1. ✅ Serwer działa: http://localhost:8080
2. ✅ Kod zmieniony: 43 zmiany na widoki
3. ✅ Hard refresh: Ctrl+Shift+R
4. ✅ Login: worker@test.nl
5. ✅ Testuj wszystkie 8 tabów
6. ✅ Sprawdź Console (F12)

---

**POWODZENIA! 🎉**

Daj znać jak poszło!
