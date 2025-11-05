# 🏢 EMPLOYER PROFILE - DUTCH COMPANY VERIFICATION & GOOGLE INTEGRATION

## ✅ CO ZOSTAŁO ZROBIONE

### 1. Frontend - EmployerPublicProfilePage.tsx (Kompletne)

#### **Zaktualizowany interfejs Employer**
Dodano 9 nowych pól:
```typescript
interface Employer {
  // ... istniejące pola ...
  
  // Dutch company verification
  company_type: string | null;      // B.V., Uitzendbureau, ZZP, etc.
  btw_number: string | null;        // NL123456789B01
  rsin_number: string | null;       // 9-digit legal entity ID
  
  // Google integration
  google_place_id: string | null;   // ChIJxxxxxx
  google_rating: number | null;     // 0-5 stars
  google_review_count: number | null;
  google_maps_url: string | null;   // https://maps.google.com/...
  latitude: number | null;          // 52.3676
  longitude: number | null;         // 4.9041
}
```

#### **Nowe komponenty**

**GoogleReviewsCard** (lines 557-602)
- Wyświetla ocenę Google (0-5 gwiazdek)
- Pokazuje liczbę opinii
- Link do Google Reviews
- Automatycznie ukrywa się gdy brak danych

**LocationCard** - rozbudowany (lines 432-482)
- Wyświetla adres tekstowo
- Osadza Google Maps iframe z lat/lng
- Link "Zobacz na mapie Google"
- Responsywna mapa (h-48)

**CompanyDetailsCard** - rozbudowany (lines 487-555)
- Badge z formą prawną:
  - `B.V.` → zielony badge
  - `Uitzendbureau` → niebieski badge
  - Inne → szary badge
- Wyświetla KVK, BTW, RSIN (jeśli dostępne)
- Branża, wielkość firmy
- Data dołączenia

#### **Kolejność w sidebarze**
```tsx
<ContactCard />          // Email, phone, website
<GoogleReviewsCard />    // ⭐ Ocena Google (jeśli dostępna)
<LocationCard />         // 🗺️ Adres + mapa
<CompanyDetailsCard />   // 🏢 Szczegóły firmy
```

### 2. Database - Migration SQL (Gotowa do wykonania)

**Plik**: `database-migrations/20251029_add_employer_extended_info.sql`

**Dodaje 9 kolumn**:
| Kolumna | Typ | Opis |
|---------|-----|------|
| company_type | TEXT | B.V., Uitzendbureau, ZZP, Eenmanszaak |
| btw_number | TEXT | NL123456789B01 |
| rsin_number | TEXT | 9-cyfrowy ID |
| google_place_id | TEXT | ChIJxxxxxx |
| google_rating | DECIMAL(2,1) | 0.0 - 5.0 |
| google_review_count | INTEGER | Liczba opinii |
| google_maps_url | TEXT | Link do Google Maps |
| latitude | DECIMAL(10,8) | GPS szerokość |
| longitude | DECIMAL(11,8) | GPS długość |

**Dodaje 4 indeksy**:
- `idx_employers_company_type` - filtrowanie po typie firmy
- `idx_employers_btw_number` - wyszukiwanie po BTW
- `idx_employers_google_place_id` - integracja Google
- `idx_employers_location` - zapytania geograficzne (lat, lng)

**Bezpieczeństwo**:
- Wszystkie kolumny nullable (zachowuje istniejące dane)
- CHECK constraint dla google_rating (0-5)
- Transakcja BEGIN/COMMIT
- Plan rollback w komentarzach

### 3. UI/UX Features

#### **Company Type Badges**
```tsx
{employer.company_type === 'B.V.' ? 
  'bg-green-100 text-green-800' :     // Zielony dla B.V.
  'bg-blue-100 text-blue-800'          // Niebieski dla Uitzendbureau
}
```

#### **Google Maps Integration**
```tsx
<iframe
  src={`https://www.google.com/maps/embed/v1/place?q=${lat},${lng}&key=API_KEY`}
  width="100%"
  height="192px"
  loading="lazy"
/>
```

**Uwaga**: Wymaga klucza Google Maps API
- Wymień `YOUR_GOOGLE_MAPS_API_KEY` w `EmployerPublicProfilePage.tsx` (line 455)
- Lub usuń iframe i zostaw tylko link do Google Maps

#### **Google Reviews Display**
```tsx
<div className="flex items-center gap-4">
  <div className="text-4xl font-bold text-amber-600">
    {employer.google_rating.toFixed(1)}  // 4.8
  </div>
  <div>
    <Star /> <Star /> <Star /> <Star /> <Star />  // 5 gwiazdek
    <div>{employer.google_review_count} opinii</div>
  </div>
</div>
```

---

## 📋 CO MUSISZ TERAZ ZROBIĆ

### KROK 1: Wykonaj migrację bazy danych

#### Opcja A: Manualna (ZALECANA)

1. Otwórz Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql
   ```

2. Otwórz plik:
   ```
   database-migrations/20251029_add_employer_extended_info.sql
   ```

3. Skopiuj i wykonaj **linie 28-164**:
   ```sql
   BEGIN;

   DO $$
   BEGIN
     IF NOT EXISTS (...) THEN
       ALTER TABLE public.employers ADD COLUMN company_type TEXT;
       ...
     END IF;
   END $$;

   ...

   COMMIT;

   CREATE INDEX IF NOT EXISTS idx_employers_company_type ...;
   ...
   ```

4. Zweryfikuj (wykonaj **linie 167-179**):
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'employers'
     AND column_name IN (
       'company_type', 'btw_number', 'rsin_number',
       'google_place_id', 'google_rating', 'google_review_count',
       'google_maps_url', 'latitude', 'longitude'
     );
   ```

5. Oczekiwany wynik: **9 kolumn z is_nullable = YES**

#### Opcja B: Automatyczna (wymaga testowania)
```bash
npm run db:migrate
```

### KROK 2: Zaktualizuj formularz rejestracji pracodawcy

**Plik do edycji**: `pages/auth/RegisterEmployerPage.tsx` (lub podobny)

Dodaj pola:
- ✅ **company_type** (dropdown) - WYMAGANE
  - Opcje: B.V., Uitzendbureau, ZZP, Eenmanszaak, V.O.F., N.V.
  - **Validacja**: Tylko B.V. i Uitzendbureau mogą się rejestrować
  
- ✅ **btw_number** (input text) - WYMAGANE dla B.V./Uitzendbureau
  - Format: NL123456789B01
  - Walidacja: regex `/^NL\d{9}B\d{2}$/`
  
- 🔧 **rsin_number** (input text) - OPCJONALNE
  - Format: 9 cyfr
  - Walidacja: regex `/^\d{9}$/`

### KROK 3: Dodaj Google Maps API Key

**Plik**: `.env`

Dodaj:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Plik**: `pages/public/EmployerPublicProfilePage.tsx` (line 455)

Wymień:
```tsx
src={`https://www.google.com/maps/embed/v1/place?q=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
```

**Opcja bez API key** (tylko link):
Usuń iframe i zostaw tylko button:
```tsx
<a href={employer.google_maps_url || `https://www.google.com/maps?q=${lat},${lng}`}>
  Zobacz na mapie Google
</a>
```

### KROK 4: Integracja z Google Places API (OPCJONALNE)

Jeśli chcesz automatycznie pobierać dane z Google:

1. Utwórz serwis `services/googlePlaces.ts`:
```typescript
export async function fetchGooglePlaceData(placeId: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`
  );
  const data = await response.json();
  
  return {
    google_rating: data.result.rating,
    google_review_count: data.result.user_ratings_total,
    google_maps_url: data.result.url,
    latitude: data.result.geometry.location.lat,
    longitude: data.result.geometry.location.lng,
  };
}
```

2. Wywołaj przy rejestracji/edycji pracodawcy
3. Zapisz dane w `employers` table

### KROK 5: Testowanie

1. Utwórz testowego pracodawcę z pełnymi danymi:
   ```sql
   UPDATE employers
   SET 
     company_type = 'B.V.',
     btw_number = 'NL123456789B01',
     rsin_number = '123456789',
     google_rating = 4.8,
     google_review_count = 127,
     google_maps_url = 'https://maps.google.com/...',
     latitude = 52.3676,
     longitude = 4.9041
   WHERE id = 'test-employer-id';
   ```

2. Odwiedź profil: `/employer/test-employer-id`

3. Sprawdź czy wyświetla się:
   - ✅ Badge "B.V." (zielony)
   - ✅ Numery: KVK, BTW, RSIN
   - ✅ Mapa Google (lub link)
   - ✅ Ocena Google: 4.8 ⭐ (127 opinii)

---

## 🎨 WYGLĄD PROFILU PRACODAWCY

### Header
```
┌─────────────────────────────────────────────────────────────┐
│ Gradient: green-600 → emerald-700 (unique employer color)  │
│                                                             │
│  🏢 Logo      NAZWA FIRMY                                   │
│               Branża • Amsterdam, Netherlands               │
│               50-100 pracowników                            │
│                                                             │
│  [O firmie] [Oferty pracy (5)]                             │
└─────────────────────────────────────────────────────────────┘
```

### Sidebar (prawa strona)

```
┌─────────────────────────┐
│ 📧 Kontakt              │
│ email@company.nl        │
│ +31 20 123 4567         │
│ www.company.nl          │
└─────────────────────────┘

┌─────────────────────────┐
│ ⭐ Opinie Google        │
│                         │
│   4.8  ⭐⭐⭐⭐⭐         │
│        127 opinii       │
│                         │
│ [Czytaj opinie]         │
└─────────────────────────┘

┌─────────────────────────┐
│ 🗺️ Lokalizacja         │
│ Hoofdstraat 123         │
│ 1000 AB Amsterdam       │
│ Netherlands             │
│                         │
│ [GOOGLE MAP IFRAME]     │
│                         │
│ Zobacz na mapie →       │
└─────────────────────────┘

┌─────────────────────────┐
│ 🏢 Szczegóły firmy      │
│                         │
│ Forma prawna            │
│ [B.V.] (green badge)    │
│                         │
│ Branża                  │
│ IT & Software           │
│                         │
│ Wielkość firmy          │
│ 50-100 pracowników      │
│                         │
│ Numer KVK               │
│ 12345678                │
│                         │
│ Numer BTW/VAT           │
│ NL123456789B01          │
│                         │
│ Numer RSIN              │
│ 123456789               │
│                         │
│ Data dołączenia         │
│ styczeń 2024            │
└─────────────────────────┘
```

---

## 🔒 VALIDACJA TYPU FIRMY (DO ZROBIENIA)

### RegisterEmployerPage.tsx

```typescript
const [formData, setFormData] = useState({
  company_name: '',
  company_type: '',  // NOWE
  btw_number: '',    // NOWE
  kvk_number: '',
  // ...
});

// Validacja
const validateForm = () => {
  // Tylko B.V. i Uitzendbureau mogą się rejestrować
  if (!['B.V.', 'Uitzendbureau'].includes(formData.company_type)) {
    setError('Tylko firmy B.V. i Uitzendbureau mogą założyć konto pracodawcy');
    return false;
  }
  
  // BTW wymagany dla B.V./Uitzendbureau
  if (!formData.btw_number || !/^NL\d{9}B\d{2}$/.test(formData.btw_number)) {
    setError('Podaj prawidłowy numer BTW (format: NL123456789B01)');
    return false;
  }
  
  return true;
};

// Formularz
<select 
  name="company_type" 
  value={formData.company_type}
  onChange={handleChange}
  required
>
  <option value="">Wybierz formę prawną</option>
  <option value="B.V.">B.V.</option>
  <option value="Uitzendbureau">Uitzendbureau</option>
  <option value="ZZP" disabled>ZZP (niedostępne)</option>
</select>

<input
  type="text"
  name="btw_number"
  placeholder="NL123456789B01"
  value={formData.btw_number}
  onChange={handleChange}
  required
  pattern="^NL\d{9}B\d{2}$"
/>
```

---

## 📊 DANE DO TESTÓW

### Przykładowy pracodawca z pełnymi danymi:

```sql
INSERT INTO employers (
  profile_id, company_name, company_type, kvk_number, btw_number, rsin_number,
  industry, company_size, city, country, address, postal_code,
  contact_email, contact_phone, website,
  google_rating, google_review_count, google_maps_url, 
  latitude, longitude
) VALUES (
  'uuid-profile-id',
  'TechHub Amsterdam B.V.',
  'B.V.',
  '12345678',
  'NL123456789B01',
  '987654321',
  'IT & Software Development',
  '50-100',
  'Amsterdam',
  'Netherlands',
  'Prins Hendrikkade 21',
  '1012 TL',
  'info@techhub.nl',
  '+31 20 123 4567',
  'https://techhub.nl',
  4.8,
  127,
  'https://maps.google.com/?cid=12345',
  52.3747158,
  4.8986142
);
```

---

## 🚀 PODSUMOWANIE

### ✅ Gotowe (0 błędów TypeScript)
- [x] Frontend: EmployerPublicProfilePage.tsx (618 linii)
- [x] Interface z 9 nowymi polami
- [x] GoogleReviewsCard komponent
- [x] LocationCard z Google Maps iframe
- [x] CompanyDetailsCard z KVK/BTW/RSIN
- [x] Company type badges (zielony B.V., niebieski Uitzendbureau)
- [x] Migration SQL (202 linie)
- [x] Instrukcje migracji (run-migration.mjs)

### 🔧 Do zrobienia
- [ ] **WYKONAJ MIGRACJĘ w Supabase** (5 min)
- [ ] Dodaj Google Maps API key do .env
- [ ] Zaktualizuj RegisterEmployerPage.tsx:
  - Dropdown company_type
  - Input btw_number (z walidacją)
  - Validacja: tylko B.V./Uitzendbureau
- [ ] Testuj z danymi testowymi

### 🎯 Rezultat po migracji
Pracodawcy będą mieli:
- ✅ Professional full-page profil (jak worker/accountant)
- ✅ Walidacja holenderskiej firmy (B.V./Uitzendbureau only)
- ✅ Wyświetlanie wszystkich numerów (KVK, BTW, RSIN)
- ✅ Mapa Google z siedzibą firmy
- ✅ Licznik opinii Google z linkiem
