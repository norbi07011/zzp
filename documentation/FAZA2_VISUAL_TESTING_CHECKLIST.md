# ✅ FAZA 2 - VISUAL TESTING CHECKLIST

**URL:** http://localhost:3001/employer/search  
**Login:** employer@test.nl / test123

---

## 🎯 QUICK VISUAL TESTS (5 minut)

### ☑️ TEST 1: Dropdown "Typ subskrypcji" Widoczny
**Gdzie:** Boczne menu filtrów (LEWO), pod "Stawka godzinowa"

**Sprawdź:**
- [ ] Label: "Typ subskrypcji" ✅
- [ ] Dropdown z 3 opcjami ✅
- [ ] Domyślnie: "Wszyscy pracownicy" ✅

**Screenshot:** `test1_dropdown.png`

---

### ☑️ TEST 2: Filtr "Wszyscy pracownicy" (DEFAULT)
**Akcja:** Pozostaw dropdown na "Wszyscy pracownicy"

**Oczekiwane:**
- [ ] **4 karty pracowników** widoczne ✅
- [ ] Kolejność (od góry):
  1. Ahmed Hassan 🏆 (Premium, rating 4.9)
  2. Maria Silva 🏆 (Premium, rating 4.8)
  3. Peter van Dam 🏆 (Premium, rating 4.7)
  4. Jan Kowalski 🔵 (Basic, rating 4.6)

**Screenshot:** `test2_wszyscy.png`

---

### ☑️ TEST 3: Badge Premium - Maria Silva
**Gdzie:** Pierwsza lub druga karta pracownika

**Sprawdź badge:**
- [ ] **Kolor:** Złoty gradient ✨
- [ ] **Ikona:** 🏆 Crown
- [ ] **Text:** "Premium Verified"
- [ ] **Numer certyfikatu:** #ZZP-2025-001 ✅

**Screenshot:** `test3_premium_badge.png`

---

### ☑️ TEST 4: Badge Basic - Jan Kowalski
**Gdzie:** Ostatnia (4.) karta pracownika

**Sprawdź badge:**
- [ ] **Kolor:** Niebieski 🔵
- [ ] **Ikona:** User (osoba)
- [ ] **Text:** "Basic Member"
- [ ] **BRAK numeru certyfikatu** ✅

**Screenshot:** `test4_basic_badge.png`

---

### ☑️ TEST 5: Filtr "Premium - Zweryfikowani"
**Akcja:** 
1. Kliknij dropdown "Typ subskrypcji"
2. Wybierz: **"🏆 Premium - Zweryfikowani"**

**Oczekiwane:**
- [ ] **3 karty** widoczne (Maria, Ahmed, Peter) ✅
- [ ] **Jan Kowalski NIE widoczny** ✅
- [ ] Wszystkie karty mają **złoty badge** ✅
- [ ] Numery certyfikatów widoczne:
  - Maria: #ZZP-2025-001
  - Ahmed: #ZZP-20250002
  - Peter: #ZZP-2025-003

**Screenshot:** `test5_premium_filter.png`

---

### ☑️ TEST 6: Filtr "Basic Members"
**Akcja:**
1. Kliknij dropdown "Typ subskrypcji"
2. Wybierz: **"🔵 Basic Members"**

**Oczekiwane:**
- [ ] **1 karta** widoczna (Jan Kowalski) ✅
- [ ] **Premium workers NIE widoczni** ✅
- [ ] Niebieski badge "Basic Member" ✅

**Screenshot:** `test6_basic_filter.png`

---

### ☑️ TEST 7: Wyczyść Filtry
**Akcja:**
1. Ustaw filtr: "Premium - Zweryfikowani"
2. Kliknij: **"Wyczyść filtry"** (przycisk na dole filtrów)

**Oczekiwane:**
- [ ] Dropdown wraca do **"Wszyscy pracownicy"** ✅
- [ ] **4 karty** ponownie widoczne ✅
- [ ] Premium workers na górze ✅

---

## 🎨 VISUAL QUALITY CHECKS

### Colors Correct:
- [ ] Premium badge: Złoty gradient (yellow-400 to yellow-600) ✅
- [ ] Basic badge: Niebieski (blue-100 background, blue-700 text) ✅
- [ ] Dropdown: Standardowy border-gray-300 ✅

### Typography:
- [ ] Label "Typ subskrypcji": font-medium, text-gray-700 ✅
- [ ] Dropdown text: text-sm ✅
- [ ] Badge text: Czytelny, font-semibold ✅

### Layout:
- [ ] Dropdown dopasowany do szerokości sidebara ✅
- [ ] Badge wyświetlany nad "Availability Status" ✅
- [ ] Wszystko wyrównane i spójne ✅

---

## 🐛 BUG REPORTING

**Jeśli coś NIE działa, zgłoś:**

### Format zgłoszenia:
```
TEST #: [numer testu 1-7]
PROBLEM: [co nie działa]
OCZEKIWANE: [co powinno być]
RZECZYWISTE: [co widzisz]
SCREENSHOT: [nazwa pliku]
```

**Przykład:**
```
TEST #5: Filtr Premium
PROBLEM: Pokazuje 4 pracowników zamiast 3
OCZEKIWANE: Tylko Premium workers (Maria, Ahmed, Peter)
RZECZYWISTE: Wszyscy 4 workers widoczni
SCREENSHOT: bug_premium_filter.png
```

---

## ✅ ACCEPTANCE CRITERIA

**FAZA 2 uznana za COMPLETE jeśli:**

- [x] Wszystkie 7 testów PASSED ✅
- [x] Badges wyświetlają się poprawnie (kolor, tekst, ikony) ✅
- [x] Filtering działa dla wszystkich 3 opcji ✅
- [x] Premium-first sorting widoczny ✅
- [x] "Wyczyść filtry" resetuje subscription tier ✅
- [x] Brak błędów w konsoli przeglądarki ✅

---

## 🚀 PO ZAKOŃCZENIU TESTÓW

**Jeśli wszystko działa:**
```
✅ "wszystko działa, przejdź do FAZA 3"
```

**Jeśli są problemy:**
```
⚠️ "problem z [opisz]" + screenshot
```

**Jeśli pytania:**
```
❓ "jak mogę [pytanie]"
```

---

**Simple Browser otworzony:** http://localhost:3001/employer/search  
**Gotowy do testów!** 🎯

**Czas testowania:** ~5-7 minut  
**Powodzenia!** 🚀
