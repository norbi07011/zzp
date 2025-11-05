# 📊 ANALIZA PANELU PRACODAWCY - AKTUALNY vs DOCELOWY

## 🔴 PROBLEM - CO MAMY TERAZ

### Dashboard pokazuje tylko statystyki, BRAK edycji profilu!

**Obecna struktura EmployerDashboard.tsx:**
```
1. Stats Cards (4 karty)
   - Wyszukiwania w tym miesiącu
   - Zapisani pracownicy  
   - Kontakty w tym miesiącu
   - Dni do końca subskrypcji

2. Ostatnie wyszukiwania (historia)
   - Lista search history
   - Przycisk "Nowe wyszukiwanie"

3. Zapisani pracownicy (lista)
   - Karty pracowników z avatarem
   - Rating, stawka godzinowa
   - Przycisk "Kontakt"

4. Sidebar:
   - Wiadomości (preview)
   - Szybkie akcje:
     * Nowe wyszukiwanie
     * Subskrypcja
     * Wsparcie
```

### ❌ CZEGO BRAKUJE:

1. **BRAK sekcji "Profil Firmy"** 
   - Nie można zobaczyć/edytować:
     - ✗ Logo firmy
     - ✗ Nazwa firmy
     - ✗ KVK nummer
     - ✗ Website
     - ✗ Description
     - ✗ Industry
     - ✗ Location
     - ✗ Phone/Email

2. **BRAK przycisku "Ustawienia"** w nawigacji

3. **BRAK możliwości zmiany logo** po rejestracji

4. **Profil employer w bazie jest pusty:**
   ```sql
   logo_url: NULL
   website: NULL
   description: NULL
   kvk_number: ''
   industry: 'other'
   location_city: ''
   ```

---

## ✅ ROZWIĄZANIE - JAK POWINNO BYĆ

### 🎯 Opcja 1: Dodać sekcję "Profil Firmy" DO dashboardu

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Panel pracodawcy                             │
├─────────────────────────────────────────────┤
│                                              │
│  📊 SEKCJA: PROFIL FIRMY                    │
│  ┌────────────────────────────────────────┐ │
│  │  [LOGO]  Company Name BV               │ │
│  │          Amsterdam, Netherlands        │ │
│  │          construction                  │ │
│  │          www.example.com               │ │
│  │          KVK: 12345678                 │ │
│  │                                        │ │
│  │  [Edytuj Profil] button               │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  📊 Stats Cards (4)                         │
│  ┌──────┬──────┬──────┬──────┐            │
│  │ 12   │  5   │  3   │ 27   │            │
│  │search│saved │msgs  │days  │            │
│  └──────┴──────┴──────┴──────┘            │
│                                              │
│  📋 Ostatnie wyszukiwania                   │
│  📌 Zapisani pracownicy                     │
│  ✉️  Wiadomości                             │
└─────────────────────────────────────────────┘
```

---

### 🎯 Opcja 2: Stworzyć OSOBNĄ stronę "Ustawienia"

**Struktura:**
```
/employer/settings

TABS:
┌──────────────────────────────────────┐
│ [Profil] [Bezpieczeństwo] [Płatności]│
├──────────────────────────────────────┤
│                                       │
│  TAB 1: PROFIL FIRMY                 │
│  ┌─────────────────────────────────┐ │
│  │ Logo Upload                      │ │
│  │ [___drag_drop_area___]          │ │
│  │                                  │ │
│  │ Company Name: [____________]    │ │
│  │ KVK Number:   [____________]    │ │
│  │ Industry:     [▼ Dropdown   ]   │ │
│  │ Location:     [____________]    │ │
│  │ Website:      [____________]    │ │
│  │ Phone:        [____________]    │ │
│  │ Email:        [____________]    │ │
│  │                                  │ │
│  │ Description:                     │ │
│  │ [___________________________]   │ │
│  │ [___________________________]   │ │
│  │                                  │ │
│  │ [Zapisz Zmiany] [Anuluj]        │ │
│  └─────────────────────────────────┘ │
│                                       │
│  TAB 2: BEZPIECZEŃSTWO               │
│  - Zmiana hasła                      │
│  - 2FA                               │
│                                       │
│  TAB 3: PŁATNOŚCI                    │
│  - Subskrypcja                       │
│  - Metody płatności                  │
└──────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTACJA - CO ZROBIMY

### ✅ NAJLEPSZE ROZWIĄZANIE: **Opcja 2** (Osobna strona Settings)

**Dlaczego?**
- ✅ Czystsza separacja (dashboard = overview, settings = edit)
- ✅ Więcej przestrzeni na formularze
- ✅ Łatwiejsze dodanie zakładek (Profil, Security, Billing)
- ✅ Standard UX (jak Gmail, Facebook, LinkedIn)

---

## 📝 PLAN IMPLEMENTACJI

### 1. Stworzyć `pages/employer/EmployerSettings.tsx`

```typescript
// TAB STRUCTURE:
- Tab 1: Company Profile
  * Logo upload (drag-drop + file input)
  * Company info form (all fields editable)
  * Save button

- Tab 2: Account Security  
  * Change password
  * 2FA toggle
  
- Tab 3: Subscription & Billing
  * Current plan
  * Upgrade/Downgrade
  * Payment methods
```

### 2. Dodać przycisk "Ustawienia" w EmployerDashboard

**Gdzie:**
- W sekcji "Szybkie akcje" (sidebar)
- LUB w top navigation bar

```tsx
<Link 
  to="/employer/settings"
  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
>
  <svg>settings icon</svg>
  Ustawienia Profilu
</Link>
```

### 3. Dodać Logo + Company Info na górze dashboardu

```tsx
<div className="bg-white shadow p-6 mb-8 rounded-lg">
  <div className="flex items-center gap-4">
    <img src={employer.logo_url} className="w-20 h-20 rounded-lg" />
    <div>
      <h2>{employer.company_name}</h2>
      <p>{employer.location_city}, {employer.industry}</p>
      <p>{employer.website}</p>
    </div>
    <Link to="/employer/settings">
      [Edytuj Profil]
    </Link>
  </div>
</div>
```

### 4. Zaimplementować Logo Upload w Settings

```typescript
// Jak w EmployerProfileSetup.tsx:
- Drag-drop area
- File input
- Image preview
- Upload to Supabase Storage bucket 'company-logos'
- Save logo_url to employers table
```

### 5. Form do edycji wszystkich pól:

**Edytowalne pola:**
```typescript
- company_name
- kvk_number
- industry (dropdown)
- location_city
- location_country
- phone
- email (readonly - linked to auth)
- website
- description
- logo_url (upload)
```

**Validation:**
- company_name: required
- location_city: required  
- kvk_number: regex NL format (8 digits)
- website: URL format
- phone: phone format

---

## 📊 DATABASE STRUCTURE

### Sprawdź co jest w bazie:

**Wykonaj SQL:**
```sql
SELECT 
  e.company_name,
  e.logo_url,
  e.website,
  e.description,
  e.kvk_number,
  e.industry,
  e.location_city,
  e.profile_completed
FROM employers e
WHERE e.profile_id = 'YOUR_USER_ID';
```

**Oczekiwane dane PO Setup:**
```json
{
  "company_name": "Test Bouwbedrijf BV",
  "logo_url": "https://supabase.co/storage/company-logos/xxx.png",
  "website": "https://testbedrijf.nl",
  "description": "Wij zijn een bouwbedrijf...",
  "kvk_number": "12345678",
  "industry": "construction",
  "location_city": "Amsterdam",
  "profile_completed": true
}
```

---

## 🎨 UI/UX IMPROVEMENTS

### Dashboard Header - DODAĆ:

```tsx
{/* Company Profile Card - NA GÓRZE DASHBOARDU */}
<div className="bg-white rounded-lg shadow-sm p-6 mb-8">
  <div className="flex items-start gap-6">
    {/* Logo */}
    <div className="flex-shrink-0">
      {employer?.logo_url ? (
        <img 
          src={employer.logo_url} 
          alt={employer.company_name}
          className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
        />
      ) : (
        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <span className="text-white text-3xl font-bold">
            {employer?.company_name?.charAt(0) || 'C'}
          </span>
        </div>
      )}
    </div>

    {/* Company Info */}
    <div className="flex-1">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {employer?.company_name || 'Twoja Firma'}
          </h2>
          <div className="space-y-1 text-gray-600">
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4">📍</svg>
              {employer?.location_city || 'Lokalizacja nieznana'}
            </p>
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4">🏢</svg>
              {employer?.industry || 'Branża nieznana'}
            </p>
            {employer?.website && (
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4">🌐</svg>
                <a href={employer.website} target="_blank" className="text-orange-600 hover:underline">
                  {employer.website}
                </a>
              </p>
            )}
            {employer?.kvk_number && (
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4">📋</svg>
                KVK: {employer.kvk_number}
              </p>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <Link
          to="/employer/settings"
          className="px-4 py-2 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4">✏️</svg>
          Edytuj Profil
        </Link>
      </div>

      {/* Description */}
      {employer?.description && (
        <p className="mt-4 text-gray-700 text-sm leading-relaxed">
          {employer.description}
        </p>
      )}

      {/* Warning if profile incomplete */}
      {!employer?.profile_completed && (
        <div className="mt-4 px-4 py-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ Uzupełnij profil firmy aby zwiększyć wiarygodność
          </p>
        </div>
      )}
    </div>
  </div>
</div>
```

---

## 📁 PLIKI DO STWORZENIA

### 1. `pages/employer/EmployerSettings.tsx`
**Features:**
- Tabs (Profile, Security, Billing)
- Logo upload
- Form validation
- employerService.updateEmployer()

### 2. `pages/employer/EmployerDashboard.tsx` (MODIFY)
**Dodać:**
- Company Profile Card na górze
- Link "Edytuj Profil" → /employer/settings

### 3. `App.tsx` (MODIFY)
**Dodać route:**
```tsx
<Route path="/employer/settings" element={<EmployerSettings />} />
```

---

## ✅ SUCCESS CRITERIA

Dashboard jest kompletny gdy:

- [x] Logo firmy wyświetla się na dashboardzie
- [x] Wszystkie dane firmy widoczne (nazwa, lokalizacja, KVK, website)
- [x] Przycisk "Edytuj Profil" → przekierowuje do /employer/settings
- [x] Settings page z 3 tabami
- [x] Logo upload działa (Supabase Storage)
- [x] Wszystkie pola można edytować
- [x] Validation działa
- [x] Zmiany zapisują się do bazy
- [x] Po zapisie → redirect do dashboardu + success toast
- [x] Dashboard pokazuje zaktualizowane dane

---

## 🚀 WYKONANIE

**Najpierw wykonaj SQL:**
```bash
sql/check-employer-profile-data.sql
```

Pokaż mi rezultat, żebym wiedział jakie dane masz w bazie!

Potem stworzę:
1. EmployerSettings.tsx (pełny formularz edycji)
2. Zmodufikuję EmployerDashboard.tsx (dodać Company Profile Card)
3. Dodam route do App.tsx
