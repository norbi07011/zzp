# 🧹 SYSTEM FIRM SPRZĄTAJĄCYCH - KOMPLETNA DOKUMENTACJA

## 📋 SPIS TREŚCI
1. [Przegląd systemu](#przegląd-systemu)
2. [Jak to działa dla pracodawcy](#jak-to-działa-dla-pracodawcy)
3. [Jak to działa dla firmy sprzątającej](#jak-to-działa-dla-firmy-sprzątającej)
4. [Konfiguracja techniczna](#konfiguracja-techniczna)
5. [Integracja z Supabase](#integracja-z-supabase)

---

## 🎯 PRZEGLĄD SYSTEMU

System umożliwia **firmom sprzątającym** (głównie prowadzonym przez kobiety) oferowanie usług sprzątania po budowach na zasadzie **pracy dorywczej** (zwykle 2 dni w tygodniu).

### **KLUCZOWA FUNKCJONALNOŚĆ:**
- 📅 **Kalendarz dostępności** - sprzątaczki zaznaczają które dni mogą pracować
- 🔍 **Filtrowanie po dniach** - pracodawcy wybierają dni których potrzebują
- ⭐ **Oceny i opinie** - system rekomendacji
- 💰 **Stawki godzinowe** - przejrzyste informacje o cenach

---

## 👨‍💼 JAK TO DZIAŁA DLA PRACODAWCY

### **KROK 1: Znajdź "Sprzątanie" w wyszukiwarce**

1. Zaloguj się jako **pracodawca**
2. Wejdź na `/workers` (Wyszukiwarka pracowników)
3. W dropdownie **"Kategoria"** wybierz **"Sprzątanie"**

**CO SIĘ DZIEJE:**
- System automatycznie przekierowuje na `/employer/cleaning-companies`
- To dedykowana strona TYLKO dla firm sprzątających

---

### **KROK 2: Wybierz dni których potrzebujesz**

Na stronie wyszukiwania zobaczysz:

```
┌─────────────────────────────────┐
│ FILTRY                          │
├─────────────────────────────────┤
│ Miasto: [Amsterdam      ]       │
│                                 │
│ Potrzebuję firmy w te dni:     │
│ ┌───┬───┬───┬───┬───┬───┬───┐ │
│ │Pn │Wt │Śr │Cz │Pt │So │Nd │ │
│ └───┴───┴───┴───┴───┴───┴───┘ │
│                                 │
│ Minimalna ocena: [4.0+ ⭐⭐]    │
│ ☑ Własny sprzęt                │
└─────────────────────────────────┘
```

**PRZYKŁAD:**
- Klikniesz **Pn** i **Śr**
- System pokaże TYLKO firmy dostępne W OBA te dni
- Firmy które mają tylko Pn (bez Śr) NIE będą wyświetlone

---

### **KROK 3: Przejrzyj profile firm**

Każda karta firmy zawiera:

```
┌──────────────────────────────────────────────┐
│ Clean & Shine BV                             │
│ Anna Kowalska                                │
│ 📍 Amsterdam (zasięg: 25km)        4.8 ⭐    │
│                                     (23 opinii)│
├──────────────────────────────────────────────┤
│ €25 - €35 / godz  [Do negocjacji]           │
│                                              │
│ 🏷️ Sprzątanie po budowach | Gruntowne        │
│ ✓ Własny sprzęt ✓ Eko produkty              │
│                                              │
│ Dostępność (2 dni/tydzień)                  │
│ ┌───┬───┬───┬───┬───┬───┬───┐             │
│ │ ✓ │   │ ✓ │   │   │   │   │             │
│ │Pn │Wt │Śr │Cz │Pt │So │Nd │             │
│ └───┴───┴───┴───┴───┴───┴───┘             │
│                                              │
│ Profesjonalne sprzątanie po budowach...     │
│ 👷 2 osoby | 📅 5 lat doświadczenia          │
│                                              │
│ [Wyślij wiadomość] [📞 Zadzwoń] [⭐ Zapisz] │
└──────────────────────────────────────────────┘
```

---

## 👩‍💼 JAK TO DZIAŁA DLA FIRMY SPRZĄTAJĄCEJ

### **KROK 1: Załóż profil**

1. Zaloguj się (jako pracownik lub pracodawca)
2. Wejdź na `/cleaning/profile`
3. Wypełnij formularz

---

### **KROK 2: Wypełnij podstawowe dane**

```
PODSTAWOWE INFORMACJE
┌─────────────────────────────────────┐
│ Nazwa firmy: [Clean & Shine BV    ] │
│ Imię i nazwisko: [Anna Kowalska   ] │
│ Telefon: [+31 6 12345678          ] │
│ Email: [anna@cleanshine.nl        ] │
└─────────────────────────────────────┘

LOKALIZACJA I ZASIĘG
┌─────────────────────────────────────┐
│ Miasto: [Amsterdam                ] │
│ Prowincja: [Noord-Holland         ] │
│ Promień działania: [20] km         │
└─────────────────────────────────────┘
```

---

### **KROK 3: ZAZNACZ DOSTĘPNOŚĆ (NAJWAŻNIEJSZE!)**

```
📅 TWOJA DOSTĘPNOŚĆ (kluczowe!)
┌──────────────────────────────────────────┐
│ Zaznacz dni, w które możesz przyjść      │
│ do pracy. Pracodawcy będą mogli          │
│ filtrować firmy według dostępności.      │
│                                          │
│ ┌───┬───┬───┬───┬───┬───┬───┐         │
│ │ ✓ │   │ ✓ │   │   │   │   │  ← KLIKNIJ│
│ │Pn │Wt │Śr │Cz │Pt │So │Nd │         │
│ └───┴───┴───┴───┴───┴───┴───┘         │
│                                          │
│ Preferowana liczba dni: [2 dni (dorywczo)] │
└──────────────────────────────────────────┘

✅ Dostępny
⬜ Niedostępny
```

**PRZYKŁAD:**
- Klikniesz **Pn** (poniedziałek) - zmieni się na niebieski ✓
- Klikniesz **Śr** (środa) - zmieni się na niebieski ✓
- Pozostałe dni: szare (niedostępne)

---

### **KROK 4: Wybierz specjalizację**

```
☑ Sprzątanie po budowach  ← GŁÓWNE
☐ Gruntowne sprzątanie
☑ Sprzątanie biur
☐ Mycie okien
☐ Utrzymanie czystości
```

---

### **KROK 5: Dodatkowe usługi**

```
☑ Własny sprzęt
☑ Produkty ekologiczne
☐ Usługa tego samego dnia
☐ Dostępność w weekendy
☑ Ubezpieczenie OC
☑ Faktura VAT
```

---

### **KROK 6: Ustaw stawkę**

```
STAWKA GODZINOWA
┌─────────────────────────────────┐
│ Od: [25.00] €                   │
│ Do: [35.00] €                   │
│ ☑ Do negocjacji                 │
└─────────────────────────────────┘
```

---

### **KROK 7: Zapisz profil**

```
[  Zapisz profil  ]  [👁️ Profil publiczny]
```

**GOTOWE!** Twój profil jest teraz widoczny dla pracodawców.

---

## 🔧 KONFIGURACJA TECHNICZNA

### **PLIKI UTWORZONE:**

#### **1. Baza danych:**
```
CREATE_CLEANING_COMPANIES_TABLE.sql
```
- Tabela `cleaning_companies`
- Kolumny: company_name, owner_name, availability (JSONB), specialization, hourly_rate, etc.
- Triggery: auto-update `last_active`, `updated_at`
- Indeksy na: location_city, availability, specialization

#### **2. TypeScript Types:**
```typescript
types.ts (rozszerzony)
```
- Interface `CleaningCompany`
- Interface `WeeklyAvailability`
- Type `CleaningSpecialization`
- Helper functions: `getDayLabel()`, `countAvailableDays()`, etc.

#### **3. Komponenty React:**

**AvailabilityCalendar.tsx**
```
src/components/cleaning/AvailabilityCalendar.tsx
```
- Props: `availability`, `onChange`, `editable`, `compact`
- Tryby: editable (dla profilu) vs read-only (dla listy)

**CleaningCompanyProfile.tsx**
```
src/pages/cleaning/CleaningCompanyProfile.tsx
```
- Formularz tworzenia/edycji profilu
- Integracja z kalendarzem dostępności

**CleaningCompanySearch.tsx**
```
src/pages/employer/CleaningCompanySearch.tsx
```
- Wyszukiwarka z filtrami
- Filtr po dniach (kluczowe!)
- Mock data (2 przykładowe firmy)

#### **4. Routing:**

**App.tsx** (zmodyfikowany)
```tsx
// Lazy loaded components
const CleaningCompanySearch = lazy(...)
const CleaningCompanyProfile = lazy(...)

// Routes
<Route path="/employer/cleaning-companies" element={<CleaningCompanySearch />} />
<Route path="/cleaning/profile" element={<CleaningCompanyProfile />} />
```

**WorkerSearch.tsx** (zmodyfikowany)
```tsx
// Dropdown z "Sprzątanie"
BUILDING_CATEGORIES = [..., { value: 'sprzatanie', label: 'Sprzątanie' }]

// Redirect przy wyborze "Sprzątanie"
if (selectedCategory === 'sprzatanie') {
  navigate('/employer/cleaning-companies');
}
```

---

## 💾 INTEGRACJA Z SUPABASE

### **KROK 1: Uruchom migrację SQL**

1. Otwórz **Supabase Dashboard**
2. Wejdź w **SQL Editor**
3. Skopiuj całą zawartość `CREATE_CLEANING_COMPANIES_TABLE.sql`
4. Wykonaj query (Execute)

**RESULT:**
```sql
✅ Table cleaning_companies created
✅ Indexes created
✅ Triggers created
```

---

### **KROK 2: Dodaj integrację w CleaningCompanyProfile.tsx**

Znajdź linię:
```typescript
// TODO: Wywołanie API do zapisania profilu
console.log('Saving cleaning company profile:', formData);
```

Zamień na:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const { data, error } = await supabase
    .from('cleaning_companies')
    .insert({
      user_id: user.id,
      profile_id: user.profileId,
      ...formData
    });
  
  if (error) {
    console.error('Error saving profile:', error);
    alert('Błąd zapisywania profilu: ' + error.message);
  } else {
    alert('Profil zapisany pomyślnie!');
    // Opcjonalnie: navigate('/employer/cleaning-companies')
  }
};
```

---

### **KROK 3: Dodaj integrację w CleaningCompanySearch.tsx**

Znajdź funkcję:
```typescript
const fetchCleaningCompanies = async () => {
  // Mock data na razie
  const mockData: CleaningCompany[] = [...]
```

Zamień na:
```typescript
const fetchCleaningCompanies = async () => {
  setLoading(true);
  
  let query = supabase
    .from('cleaning_companies')
    .select('*')
    .eq('profile_visibility', 'public')
    .eq('accepting_new_clients', true);
  
  // Filtr po mieście
  if (filters.city) {
    query = query.eq('location_city', filters.city);
  }
  
  // Filtr po wymaganych dniach
  if (filters.requiredDays.length > 0) {
    filters.requiredDays.forEach(day => {
      query = query.eq(`availability->${day}`, true);
    });
  }
  
  // Filtr po ocenie
  if (filters.minRating > 0) {
    query = query.gte('average_rating', filters.minRating);
  }
  
  // Filtr po własnym sprzęcie
  if (filters.hasOwnEquipment) {
    query = query.contains('additional_services', ['own_equipment']);
  }
  
  const { data, error } = await query.order('last_active', { ascending: false });
  
  if (error) {
    console.error('Error fetching companies:', error);
    setCompanies([]);
  } else {
    setCompanies(data || []);
  }
  
  setLoading(false);
};
```

---

### **KROK 4: Testowanie**

#### **TEST 1: Tworzenie profilu**
1. Wejdź na `/cleaning/profile`
2. Wypełnij formularz
3. Zaznacz dostępność: Pn + Śr
4. Kliknij "Zapisz profil"
5. Sprawdź w Supabase czy pojawił się rekord

#### **TEST 2: Wyszukiwanie**
1. Wejdź na `/workers` (jako pracodawca)
2. Wybierz kategorię "Sprzątanie"
3. Powinieneś zostać przekierowany na `/employer/cleaning-companies`
4. Wybierz filtry: Miasto + dni (np. Pn + Śr)
5. Sprawdź czy wyświetla się firma z kroku 1

#### **TEST 3: Filtrowanie po dniach**
1. Na stronie wyszukiwania kliknij **Pn** i **Śr**
2. Powinny być widoczne TYLKO firmy dostępne W OBA te dni
3. Kliknij **Pt** (dodatkowo)
4. Lista powinna się zaktualizować (mniej firm)

---

## 📊 PRZYKŁADOWE QUERIES

### **Znajdź firmy dostępne w poniedziałek I środę:**
```sql
SELECT * FROM cleaning_companies
WHERE profile_visibility = 'public'
  AND (availability->>'monday')::boolean = true
  AND (availability->>'wednesday')::boolean = true
ORDER BY last_active DESC;
```

### **Znajdź firmy w Amsterdamie z oceną min 4.5:**
```sql
SELECT * FROM cleaning_companies
WHERE profile_visibility = 'public'
  AND location_city = 'Amsterdam'
  AND average_rating >= 4.5
ORDER BY average_rating DESC;
```

### **Znajdź firmy z własnym sprzętem:**
```sql
SELECT * FROM cleaning_companies
WHERE profile_visibility = 'public'
  AND 'own_equipment' = ANY(additional_services)
ORDER BY years_experience DESC;
```

### **Policz dni dostępności dla każdej firmy:**
```sql
SELECT 
  company_name,
  (
    (CASE WHEN (availability->>'monday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'tuesday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'wednesday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'thursday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'friday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'saturday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'sunday')::boolean THEN 1 ELSE 0 END)
  ) as available_days_count
FROM cleaning_companies
WHERE profile_visibility = 'public'
ORDER BY available_days_count DESC;
```

---

## 🎨 CUSTOMIZACJA

### **Zmiana kolorów kalendarza:**

W `AvailabilityCalendar.tsx` znajdź:
```tsx
${isAvailable 
  ? 'bg-blue-500 border-blue-600 text-white'  // ← TUTAJ
  : 'bg-white border-gray-200 text-gray-400'
}
```

Możesz zmienić na:
- `bg-green-500 border-green-600` - zielony
- `bg-orange-500 border-orange-600` - pomarańczowy
- `bg-purple-500 border-purple-600` - fioletowy

### **Dodanie nowej specjalizacji:**

W `types.ts` znajdź:
```typescript
export type CleaningSpecialization = 
  | 'cleaning_after_construction'
  | 'deep_cleaning'
  | 'office_cleaning'
  | 'window_cleaning'
  | 'maintenance_cleaning'
  | 'TWOJA_NOWA_SPECJALIZACJA'; // ← DODAJ TUTAJ
```

Następnie w `getCleaningSpecializationLabel()`:
```typescript
export const getCleaningSpecializationLabel = (spec: CleaningSpecialization): string => {
  const labels: Record<CleaningSpecialization, string> = {
    // ... existing
    TWOJA_NOWA_SPECJALIZACJA: 'Twoja Nazwa Specjalizacji'
  };
  return labels[spec];
};
```

---

## ✅ CHECKLIST IMPLEMENTACJI

- [x] Utworzono tabelę SQL `cleaning_companies`
- [x] Dodano TypeScript types
- [x] Utworzono komponent `AvailabilityCalendar`
- [x] Utworzono stronę `CleaningCompanyProfile`
- [x] Utworzono stronę `CleaningCompanySearch`
- [x] Dodano "Sprzątanie" do kategorii w WorkerSearch
- [x] Dodano routing w App.tsx
- [ ] **TODO:** Uruchomić migrację SQL w Supabase
- [ ] **TODO:** Dodać integrację Supabase w profile
- [ ] **TODO:** Dodać integrację Supabase w search
- [ ] **TODO:** Przetestować cały flow

---

## 🚀 NASTĘPNE KROKI

1. **Uruchom SQL migration** w Supabase
2. **Dodaj integrację** z Supabase (zamiast mock data)
3. **Przetestuj** jako pracodawca i jako firma sprzątająca
4. **Dodaj zdjęcia** (upload portfolio_images)
5. **Dodaj system opinii** (reviews dla cleaning companies)
6. **Dodaj messaging** (wiadomości między pracodawcą a firmą)

---

## 📞 WSPARCIE

Jeśli coś nie działa:
1. Sprawdź konsole przeglądarki (F12)
2. Sprawdź czy SQL migration wykonała się poprawnie
3. Sprawdź czy routing jest poprawnie skonfigurowany
4. Sprawdź czy wszystkie pliki zostały utworzone

---

**SUKCES!** System firm sprzątających jest gotowy do użycia! 🎉
