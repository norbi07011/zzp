# 🚀 QUICK START: Testowanie Subscription Filtering (FAZA 2)

## ⚡ Start Serwera (jeśli nie działa)

```powershell
# W terminalu:
cd "c:\AI PROJEKT\zzp-werkplaats (3)"
npm run dev
```

**Oczekiwane**: Serwer na http://localhost:3001

---

## 🧪 Test Scenarios

### 1️⃣ Otwórz Employer Dashboard - Worker Search
**URL**: http://localhost:3001/employer/search

**Logowanie**:
- Email: `employer@test.nl`
- Hasło: `test123`

---

### 2️⃣ Test Filtra "Wszyscy pracownicy" (DEFAULT)

**Akcje**:
1. Sprawdź dropdown "Typ subskrypcji" w bocznym menu (LEWO)
2. Domyślnie wybrane: "Wszyscy pracownicy"

**Oczekiwane wyniki**:
- ✅ Widzisz **4 pracowników**
- ✅ **Premium workers na górze** (Maria, Ahmed, Peter)
- ✅ **Basic worker na dole** (Jan Kowalski)
- ✅ **Badge widoczny** na każdej karcie:
  - 🏆 **Złoty badge**: "Premium Verified #ZZP-2025-XXX" (Maria, Ahmed, Peter)
  - 🔵 **Niebieski badge**: "Basic Member" (Jan)

**Screenshot**: `test1_wszyscy.png`

---

### 3️⃣ Test Filtra "Premium - Zweryfikowani"

**Akcje**:
1. Kliknij dropdown "Typ subskrypcji"
2. Wybierz: **"🏆 Premium - Zweryfikowani"**

**Oczekiwane wyniki**:
- ✅ Widzisz **3 pracowników**: Maria Silva, Ahmed Hassan, Peter van Dam
- ✅ Jan Kowalski **NIE WIDOCZNY**
- ✅ Wszystkie karty mają **złoty badge "Premium Verified"**
- ✅ Numery certyfikatów widoczne:
  - Maria: `#ZZP-2025-001`
  - Ahmed: `#ZZP-20250002`
  - Peter: `#ZZP-2025-003`

**Screenshot**: `test2_premium.png`

---

### 4️⃣ Test Filtra "Basic Members"

**Akcje**:
1. Kliknij dropdown "Typ subskrypcji"
2. Wybierz: **"🔵 Basic Members"**

**Oczekiwane wyniki**:
- ✅ Widzisz **1 pracownika**: Jan Kowalski
- ✅ Premium workers **NIE WIDOCZNE**
- ✅ **Niebieski badge** "Basic Member" widoczny
- ✅ **BRAK numeru certyfikatu** (bo Basic)

**Screenshot**: `test3_basic.png`

---

### 5️⃣ Test Kombinacji Filtrów

**Akcje**:
1. Dropdown "Typ subskrypcji": **"Premium"**
2. Dropdown "Kategoria": **"Elektryk SEP"**

**Oczekiwane wyniki**:
- ✅ Widzisz **1 pracownika**: Ahmed Hassan
  - Premium ✅
  - Elektryk ✅
- ✅ Pozostali nie spełniają **obu warunków**:
  - Maria: Premium ✅, ale **NIE Elektryk** ❌
  - Peter: Premium ✅, ale **Hydraulik** ❌
  - Jan: Elektryk? (nie, jest Murarz) ❌

**Screenshot**: `test4_kombinacja.png`

---

### 6️⃣ Test "Wyczyść filtry"

**Akcje**:
1. Ustaw filtry:
   - Typ subskrypcji: "Premium"
   - Kategoria: "Elektryk"
   - Miasto: "Amsterdam"
2. Kliknij **"Wyczyść filtry"** (przycisk na dole filtrów)

**Oczekiwane wyniki**:
- ✅ Dropdown "Typ subskrypcji" wraca do **"Wszyscy pracownicy"**
- ✅ Dropdown "Kategoria" wraca do **"Wszystkie kategorie"**
- ✅ Input "Miasto" jest **pusty**
- ✅ Widzisz ponownie **wszystkich 4 pracowników**
- ✅ Premium workers nadal **na górze** (sorting aktywny)

**Screenshot**: `test5_reset.png`

---

### 7️⃣ Test Premium-First Sorting

**Akcje**:
1. Ustaw filtr: "Wszyscy pracownicy"
2. Sprawdź **kolejność** wyświetlanych pracowników

**Oczekiwane wyniki**:
- ✅ **Pozycja 1-3**: Premium workers (Maria, Ahmed, Peter)
  - Sortowane wewnętrznie po **rating** (najwyższy rating → wyżej)
- ✅ **Pozycja 4**: Basic worker (Jan Kowalski)
  - Nawet jeśli ma **wyższy rating** niż niektórzy Premium

**Przykładowa kolejność** (zakładając rating):
1. Ahmed Hassan - Premium (rating: 4.9) 🏆
2. Maria Silva - Premium (rating: 4.8) 🏆
3. Peter van Dam - Premium (rating: 4.7) 🏆
4. Jan Kowalski - Basic (rating: 4.6) 🔵

**Screenshot**: `test6_sorting.png`

---

## 🐛 Znane Problemy (do zgłoszenia)

### ❌ Problem 1: Brak certyfikatu nie blokuje sortowania
**Opis**: Worker z `subscription_tier: 'premium'` ale `zzp_certificate_issued: false` nadal jest na górze.

**Oczekiwane**: Tylko Premium workers z `zzp_certificate_issued: true` powinni być na górze.

**Fix** (opcjonalny):
```typescript
// W WorkerSearch.tsx, zmień sorting:
const sortedWorkers = filterSubscriptionTier === 'all'
  ? [...filteredWorkers].sort((a, b) => {
      const aIsPremiumVerified = a.subscription_tier === 'premium' && a.zzp_certificate_issued;
      const bIsPremiumVerified = b.subscription_tier === 'premium' && b.zzp_certificate_issued;
      
      if (aIsPremiumVerified && !bIsPremiumVerified) return -1;
      if (!aIsPremiumVerified && bIsPremiumVerified) return 1;
      return b.rating - a.rating;
    })
  : filteredWorkers;
```

---

## ✅ Checklist Testowania

**Przed zakończeniem testów, sprawdź:**

- [ ] Serwer działa na http://localhost:3001
- [ ] Zalogowano jako `employer@test.nl`
- [ ] Test 1: "Wszyscy" - 4 workers, Premium na górze ✅
- [ ] Test 2: "Premium" - 3 workers (Maria, Ahmed, Peter) ✅
- [ ] Test 3: "Basic" - 1 worker (Jan) ✅
- [ ] Test 4: Kombinacja filtrów działa ✅
- [ ] Test 5: "Wyczyść filtry" resetuje wszystko ✅
- [ ] Test 6: Premium-first sorting działa ✅
- [ ] **Badge kolory** poprawne (złoty/niebieski) ✅
- [ ] **Numery certyfikatów** widoczne dla Premium ✅
- [ ] **Brak błędów** w konsoli przeglądarki ✅
- [ ] Screenshots zrobione (6 sztuk) ✅

---

## 📸 Screenshots Do Zrobienia

1. `test1_wszyscy.png` - Widok wszystkich 4 workers z badgami
2. `test2_premium.png` - Tylko Premium workers (3)
3. `test3_basic.png` - Tylko Jan Kowalski (Basic)
4. `test4_kombinacja.png` - Premium + Elektryk = Ahmed
5. `test5_reset.png` - Po kliknięciu "Wyczyść filtry"
6. `test6_sorting.png` - Premium workers na górze listy

**Gdzie zapisać**: `c:\AI PROJEKT\zzp-werkplaats (3)\screenshots\faza2\`

---

## 🚨 Troubleshooting

### Problem: "Cannot read property 'subscription_tier' of undefined"
**Rozwiązanie**: Worker nie ma pola `subscription_tier` → Sprawdź MOCK_WORKERS (linie 30-125)

### Problem: Badge nie wyświetla się
**Rozwiązanie**: 
1. Sprawdź import: `import { SubscriptionBadge } from '../../components/SubscriptionBadge';`
2. Sprawdź czy component renderuje: Linia ~470 w WorkerSearch.tsx

### Problem: Filtr nie działa
**Rozwiązanie**: Sprawdź state `filterSubscriptionTier` (linia ~161) i filtering logic (linia ~202)

### Problem: Numer certyfikatu nie wyświetla się
**Rozwiązanie**: 
1. Sprawdź worker: `zzp_certificate_number: 'ZZP-2025-XXX'`
2. Sprawdź SubscriptionBadge.tsx: `certificateNumber` prop przekazany (linia ~42)

---

## ✅ Success Criteria

**FAZA 2 uznana za COMPLETE jeśli:**
1. ✅ Wszystkie 6 testów przechodzą bez błędów
2. ✅ 0 TypeScript errors w terminalu
3. ✅ 0 errors w konsoli przeglądarki
4. ✅ Screenshots pokazują poprawne działanie
5. ✅ User (Ty) potwierdza: "Wygląda dobrze, przejdź do FAZA 3"

---

**Po zakończeniu testów napisz**:
- ✅ **"wszystko działa, przejdź do FAZA 3"** → Zacznę Worker Dashboard
- ⚠️ **"jest problem z..."** → Naprawię konkretny bug
- ❓ **"jak mogę..."** → Wyjaśnię / pokażę przykład

**Good luck!** 🚀
