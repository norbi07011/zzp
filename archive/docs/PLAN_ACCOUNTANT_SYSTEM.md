# 🧾 PLAN: SYSTEM PANELU KSIĘGOWEGO (ACCOUNTANT)

## 📋 WYMAGANIA - ANALIZA

### Co chcesz osiągnąć:
1. ✅ **Nowy panel dla księgowych** (AccountantDashboard)
2. ✅ **Księgowi mogą publikować na FEED** (oferty, ogłoszenia, porady)
3. ✅ **Feed widoczny dla:** Worker + Employer + Accountant
4. ✅ **Profil księgowego z:**
   - Formularzami zgłoszeniowymi (BTW-aangifte, Jaarrekening, Salarisadministratie, etc.)
   - Cennikami usług
   - Zdjęciami/portfolio
   - Systemem wiadomości
5. ✅ **Księgowi widoczni w wyszukiwarce** dla wszystkich użytkowników

---

## 🗄️ CZĘŚĆ 1: STRUKTURA BAZY DANYCH

### 1.1 Tabela `accountants` (Księgowi)
```sql
CREATE TABLE accountants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dane podstawowe
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  
  -- Licencje i certyfikaty
  kvk_number VARCHAR(50),
  btw_number VARCHAR(50),
  license_number VARCHAR(100),
  
  -- Lokalizacja
  city VARCHAR(100),
  address VARCHAR(255),
  postal_code VARCHAR(20),
  
  -- Profil publiczny
  bio TEXT,
  specializations TEXT[], -- ['BTW', 'Salarisadministratie', 'Jaarrekening']
  languages TEXT[], -- ['Nederlands', 'English', 'Polski']
  avatar_url TEXT,
  cover_image_url TEXT,
  
  -- Portfolio/zdjęcia
  portfolio_images TEXT[],
  
  -- Statystyki
  rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  years_experience INTEGER DEFAULT 0,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  subscription_tier VARCHAR(50) DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_accountants_user ON accountants(user_id);
CREATE INDEX idx_accountants_city ON accountants(city);
CREATE INDEX idx_accountants_specializations ON accountants USING GIN(specializations);
CREATE INDEX idx_accountants_active ON accountants(is_active);
```

### 1.2 Tabela `accountant_services` (Usługi księgowe)
```sql
CREATE TABLE accountant_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Typ usługi
  service_type VARCHAR(100) NOT NULL, -- 'btw-aangifte', 'jaarrekening', 'salarisadministratie', etc.
  
  -- Opis
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Cennik
  price_type VARCHAR(50), -- 'fixed', 'hourly', 'monthly', 'custom'
  price_amount DECIMAL(10,2),
  price_currency VARCHAR(10) DEFAULT 'EUR',
  
  -- Dodatkowe info
  delivery_time VARCHAR(100), -- np. '24 uur', '3-5 dagen'
  includes TEXT[], -- Co zawiera usługa
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_accountant ON accountant_services(accountant_id);
CREATE INDEX idx_services_type ON accountant_services(service_type);
```

### 1.3 Tabela `accountant_forms` (Formularze zgłoszeniowe)
```sql
CREATE TABLE accountant_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Typ formularza
  form_type VARCHAR(100) NOT NULL, -- 'btw-aangifte', 'jaarrekening', 'salarisadministratie'
  form_name VARCHAR(255) NOT NULL,
  
  -- Konfiguracja formularza (JSON schema)
  form_fields JSONB NOT NULL,
  /*
  Przykład form_fields:
  [
    {
      "name": "btw_number",
      "label": "BTW-nummer",
      "type": "text",
      "required": true,
      "placeholder": "bijv. NL123456789B01"
    },
    {
      "name": "belastingjaar",
      "label": "Belastingjaar",
      "type": "number",
      "required": true
    }
  ]
  */
  
  -- Ustawienia
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forms_accountant ON accountant_forms(accountant_id);
CREATE INDEX idx_forms_type ON accountant_forms(form_type);
```

### 1.4 Tabela `form_submissions` (Zgłoszenia klientów)
```sql
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES accountant_forms(id) ON DELETE CASCADE,
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Kto wysłał
  user_id UUID NOT NULL, -- może być worker lub employer
  user_type VARCHAR(20) NOT NULL, -- 'worker' lub 'employer'
  
  -- Dane z formularza
  form_data JSONB NOT NULL,
  
  -- Załączniki
  attachments TEXT[], -- URLe do plików w storage
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'
  
  -- Odpowiedź księgowego
  accountant_response TEXT,
  accountant_files TEXT[], -- Pliki zwrotne od księgowego
  
  -- Timestamps
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_submissions_accountant ON form_submissions(accountant_id);
CREATE INDEX idx_submissions_user ON form_submissions(user_id);
CREATE INDEX idx_submissions_status ON form_submissions(status);
```

### 1.5 Tabela `accountant_reviews` (Opinie o księgowych)
```sql
CREATE TABLE accountant_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Kto wystawił
  reviewer_id UUID NOT NULL,
  reviewer_type VARCHAR(20) NOT NULL, -- 'worker' lub 'employer'
  
  -- Ocena
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Szczegółowe oceny
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  
  -- Komentarz
  comment TEXT,
  would_recommend BOOLEAN DEFAULT true,
  
  -- Status
  status VARCHAR(50) DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_review UNIQUE (accountant_id, reviewer_id)
);

CREATE INDEX idx_accountant_reviews_accountant ON accountant_reviews(accountant_id);
CREATE INDEX idx_accountant_reviews_status ON accountant_reviews(status);
```

### 1.6 Rozszerzenie tabeli `posts` (dla feedu)
```sql
-- Modyfikacja istniejącej tabeli posts
ALTER TABLE posts 
  ADD COLUMN accountant_id UUID REFERENCES accountants(id) ON DELETE CASCADE;

-- Constraint: post musi mieć JEDNO źródło (employer LUB accountant)
ALTER TABLE posts
  ADD CONSTRAINT posts_one_author CHECK (
    (employer_id IS NOT NULL AND accountant_id IS NULL) OR
    (employer_id IS NULL AND accountant_id IS NOT NULL)
  );

CREATE INDEX idx_posts_accountant ON posts(accountant_id);
```

---

## 🎨 CZĘŚĆ 2: PANEL KSIĘGOWEGO - KOMPONENTY UI

### 2.1 Struktura katalogów
```
src/
├── pages/
│   └── accountant/
│       ├── AccountantDashboard.tsx      # Główny panel księgowego
│       ├── AccountantProfile.tsx        # Profil publiczny księgowego
│       ├── ServiceManagement.tsx        # Zarządzanie usługami
│       ├── FormManagement.tsx           # Zarządzanie formularzami
│       ├── ClientSubmissions.tsx        # Zgłoszenia od klientów
│       └── AccountantSettings.tsx       # Ustawienia konta
│
├── components/
│   ├── accountant/
│   │   ├── ServiceCard.tsx              # Karta usługi
│   │   ├── ServiceEditor.tsx            # Edytor usługi
│   │   ├── FormBuilder.tsx              # Kreator formularzy
│   │   ├── FormPreview.tsx              # Podgląd formularza
│   │   ├── SubmissionCard.tsx           # Karta zgłoszenia
│   │   ├── SubmissionDetail.tsx         # Szczegóły zgłoszenia
│   │   ├── PriceListTable.tsx           # Tabela cennikowa
│   │   └── AccountantStats.tsx          # Statystyki księgowego
│   │
│   ├── feed/
│   │   └── Feed.tsx                     # UNIWERSALNY feed (dla wszystkich)
│   │
│   └── search/
│       └── AccountantSearch.tsx         # Wyszukiwarka księgowych
│
└── services/
    └── accountantService.ts             # API dla księgowych
```

### 2.2 AccountantDashboard.tsx - Zakładki
```typescript
tabs = [
  { id: 'feed', label: '🌟 Tablica', icon: '🌟' },           // Feed społecznościowy
  { id: 'overview', label: '📊 Przegląd', icon: '📊' },      // Dashboard stats
  { id: 'services', label: '💼 Usługi', icon: '💼' },        // Lista usług + cenniki
  { id: 'forms', label: '📝 Formularze', icon: '📝' },       // Zarządzanie formularzami
  { id: 'submissions', label: '📥 Zgłoszenia', icon: '📥' }, // Zgłoszenia od klientów
  { id: 'clients', label: '👥 Klienci', icon: '👥' },        // Lista klientów
  { id: 'messages', label: '💬 Wiadomości', icon: '💬' },    // Czat z klientami
  { id: 'reviews', label: '⭐ Opinie', icon: '⭐' },          // Opinie klientów
  { id: 'analytics', label: '📈 Analityka', icon: '📈' },    // Statystyki
  { id: 'settings', label: '⚙️ Ustawienia', icon: '⚙️' }     // Profil, płatności
]
```

### 2.3 Profil Publiczny Księgowego
```typescript
AccountantProfile.tsx - Widoczny dla Workers i Employers:

Sekcje:
1. Header:
   - Avatar + Cover image
   - Nazwa + Firma
   - Rating (⭐ 4.8/5 - 127 opinii)
   - Lokalizacja
   - Badge weryfikacji
   - Przyciski: "📞 Kontakt" | "⭐ Wystaw opinię"

2. O mnie:
   - Bio
   - Specjalizacje (badges)
   - Lata doświadczenia
   - Języki obsługi

3. Usługi i Cennik:
   - Lista usług z cenami
   - Przycisk "Wybierz usługę"

4. Formularze:
   - BTW-aangifte
   - Jaarrekening
   - Salarisadministratie
   - Bedrijfsregistratie
   - Maandelijkse Administratie
   - Fiscale Consultatie
   Każdy formularz → Modal z polami do wypełnienia

5. Portfolio:
   - Galeria zdjęć biura/certyfikatów

6. Opinie klientów:
   - Lista opinii z ocenami
```

---

## 🔄 CZĘŚĆ 3: FLOW UŻYTKOWNIKA

### 3.1 Rejestracja Księgowego
```
1. Strona główna → "Zostań księgowym"
2. Formularz rejestracji:
   - Email + Hasło
   - Imię i nazwisko
   - Nazwa firmy
   - KVK-nummer
   - BTW-nummer
   - Lokalizacja
3. Weryfikacja email
4. Utworzenie profilu księgowego
5. Przekierowanie do AccountantDashboard
```

### 3.2 Worker/Employer szuka księgowego
```
1. Dashboard → "Wyszukaj księgowego"
2. Filtrowanie:
   - Lokalizacja
   - Specjalizacja (BTW, Jaarrekening, etc.)
   - Cena (od-do)
   - Rating
3. Lista wyników → Karta księgowego
4. Klik → AccountantProfile
5. "Wybierz usługę" → FormModal
6. Wypełnienie formularza
7. Submit → Zgłoszenie zapisane
8. Księgowy dostaje powiadomienie
```

### 3.3 Księgowy obsługuje zgłoszenie
```
1. AccountantDashboard → Zakładka "Zgłoszenia"
2. Lista zgłoszeń (pending)
3. Klik → SubmissionDetail
4. Przegląd danych z formularza
5. Zmiana statusu: "In Progress"
6. Upload plików (faktury, dokumenty)
7. Dodanie odpowiedzi
8. Zmiana statusu: "Completed"
9. Klient dostaje powiadomienie
```

---

## 📝 CZĘŚĆ 4: FORMULARZE KSIĘGOWE

### 4.1 Predefiniowane typy formularzy

#### BTW-aangifte
```typescript
fields: [
  { name: 'btw_number', label: 'BTW-nummer', type: 'text', required: true },
  { name: 'belastingjaar', label: 'Belastingjaar', type: 'number', required: true },
  { name: 'aangiftetijdvak', label: 'Aangiftetijdvak', type: 'select', options: ['Q1', 'Q2', 'Q3', 'Q4'] },
  { name: 'datum', label: 'Datum', type: 'date' },
  { name: 'tijd', label: 'Tijd', type: 'time' },
  { name: 'extra_info', label: 'Dodatkowe informacje', type: 'textarea' }
]
```

#### Jaarrekening
```typescript
fields: [
  { name: 'kvk_number', label: 'KVK-nummer', type: 'text', required: true },
  { name: 'bsn', label: 'BSN (Burgerservicenummer)', type: 'text' },
  { name: 'rsin', label: 'RSIN', type: 'text' },
  { name: 'belastingjaar', label: 'Belastingjaar', type: 'number', required: true },
  { name: 'datum', label: 'Datum', type: 'date' },
  { name: 'tijd', label: 'Tijd', type: 'time' }
]
```

#### Salarisadministratie
```typescript
fields: [
  { name: 'kvk_number', label: 'KVK-nummer', type: 'text', required: true },
  { name: 'loonheffingennummer', label: 'Loonheffingennummer', type: 'text' },
  { name: 'aantal_werknemers', label: 'Aantal werknemers', type: 'number', required: true },
  { name: 'datum', label: 'Datum', type: 'date' },
  { name: 'tijd', label: 'Tijd', type: 'time' }
]
```

#### Bedrijfsregistratie
```typescript
fields: [
  { name: 'full_name', label: 'Volledige naam', type: 'text', required: true },
  { name: 'phone', label: 'Telefoonnummer', type: 'tel', required: true },
  { name: 'email', label: 'E-mailadres', type: 'email', required: true },
  { name: 'company_name', label: 'Bedrijfsnaam (optioneel)', type: 'text' },
  { name: 'rechtsvorm', label: 'Rechtsvorm', type: 'select', options: ['Eenmanszaak', 'VOF', 'BV', 'NV'] },
  { name: 'datum', label: 'Datum', type: 'date' },
  { name: 'tijd', label: 'Tijd', type: 'time' }
]
```

### 4.2 Form Builder (dla księgowego)
```typescript
FormBuilder.tsx:
- Drag & drop pól
- Predefiniowane typy: text, email, tel, number, date, time, select, textarea, checkbox
- Walidacja (required, min, max, pattern)
- Podgląd na żywo
- Export/Import JSON schema
```

---

## 🌟 CZĘŚĆ 5: FEED - UNIWERSALNY SYSTEM

### 5.1 Rozszerzenie tabeli `posts`
```typescript
Typy postów:
- 'job_offer' (pracodawca)
- 'ad' (pracodawca)
- 'announcement' (pracodawca)
- 'accountant_service' (księgowy) ← NOWY
- 'accountant_tip' (księgowy) ← NOWY
- 'accountant_promo' (księgowy) ← NOWY
```

### 5.2 Feed - dostęp
```typescript
WorkerDashboard → Feed (widzi posty: employers + accountants)
EmployerDashboard → Feed (widzi posty: employers + accountants)
AccountantDashboard → Feed (widzi wszystko + może publikować)
```

### 5.3 CreatePostModal - rozszerzenie
```typescript
Jeśli userType === 'accountant':
  Dodatkowe opcje typu posta:
  - 📢 Usługa księgowa
  - 💡 Porada podatkowa
  - 🎁 Promocja
```

---

## 🔍 CZĘŚĆ 6: WYSZUKIWARKA

### 6.1 AccountantSearch.tsx
```typescript
Dostępna z:
- WorkerDashboard → "🔍 Księgowi"
- EmployerDashboard → "🔍 Księgowi"
- HomePage → "Znajdź księgowego"

Filtry:
- Lokalizacja (miasto)
- Specjalizacja (BTW, Jaarrekening, Salarisadministratie)
- Cena (od-do)
- Rating (min)
- Języki obsługi
- Weryfikacja (tylko zweryfikowani)

Sortowanie:
- Najwyżej ocenieni
- Najtańsi
- Najbliżej mnie
- Najnowsi
```

---

## 📊 CZĘŚĆ 7: STATYSTYKI KSIĘGOWEGO

### 7.1 AccountantStats.tsx (Dashboard Overview)
```typescript
Karty:
1. 📥 Nowe zgłoszenia (dziś/ten tydzień)
2. 👥 Aktywni klienci
3. ⭐ Średnia ocena
4. 💰 Przychód (ten miesiąc)
5. 📊 Top usługi (wykres)
6. 📈 Trend zgłoszeń (wykres liniowy)
```

---

## 🔐 CZĘŚĆ 8: UPRAWNIENIA (RLS)

### 8.1 Row Level Security
```sql
-- Księgowi widzą tylko swoje dane
CREATE POLICY "Accountants can view own data"
  ON accountants FOR SELECT
  USING (auth.uid() = user_id);

-- Wszyscy widzą aktywne profile księgowych
CREATE POLICY "Everyone can view active accountants"
  ON accountants FOR SELECT
  USING (is_active = true);

-- Księgowy widzi swoje zgłoszenia
CREATE POLICY "Accountants can view own submissions"
  ON form_submissions FOR SELECT
  USING (accountant_id IN (
    SELECT id FROM accountants WHERE user_id = auth.uid()
  ));

-- User widzi swoje wysłane zgłoszenia
CREATE POLICY "Users can view own submissions"
  ON form_submissions FOR SELECT
  USING (user_id = auth.uid());
```

---

## ⚡ CZĘŚĆ 9: PLAN IMPLEMENTACJI

### FAZA 1: Baza danych (2-3 godziny)
- [ ] Tabele: accountants, accountant_services, accountant_forms, form_submissions, accountant_reviews
- [ ] Rozszerzenie posts o accountant_id
- [ ] RLS policies
- [ ] Triggery auto-update ratingów

### FAZA 2: Services/API (2-3 godziny)
- [ ] accountantService.ts (CRUD)
- [ ] Rejestracja księgowego
- [ ] Zarządzanie usługami
- [ ] Zarządzanie formularzami
- [ ] Obsługa zgłoszeń

### FAZA 3: AccountantDashboard (4-5 godzin)
- [ ] Layout główny
- [ ] Zakładki (Feed, Overview, Services, Forms, Submissions)
- [ ] ServiceManagement.tsx
- [ ] FormManagement.tsx
- [ ] ClientSubmissions.tsx

### FAZA 4: Profil Publiczny (3-4 godziny)
- [ ] AccountantProfile.tsx
- [ ] ServiceCard.tsx
- [ ] FormModal.tsx (dla klientów)
- [ ] ReviewSection.tsx

### FAZA 5: Wyszukiwarka (2-3 godziny)
- [ ] AccountantSearch.tsx
- [ ] Filtry i sortowanie
- [ ] Integracja z Dashboard

### FAZA 6: Feed System (rozszerzenie) (2-3 godziny)
- [ ] Aktualizacja Feed.tsx (obsługa accountant_id)
- [ ] CreatePostModal (opcje dla księgowego)
- [ ] PostCard (wyświetlanie postów księgowych)

### FAZA 7: Formularze dynamiczne (3-4 godziny)
- [ ] FormBuilder.tsx (dla księgowego)
- [ ] Predefiniowane szablony (BTW, Jaarrekening, etc.)
- [ ] DynamicForm.tsx (renderer formularzy)
- [ ] File upload dla załączników

### FAZA 8: Testy i optymalizacja (2-3 godziny)
- [ ] Testy flow użytkownika
- [ ] Responsywność
- [ ] Optymalizacja wydajności

**Szacowany czas: 20-28 godzin**

---

## 🎯 PODSUMOWANIE ZMIAN

### Nowe tabele (5):
1. accountants
2. accountant_services
3. accountant_forms
4. form_submissions
5. accountant_reviews

### Nowe komponenty (~15):
- AccountantDashboard + subkomponenty
- AccountantProfile
- AccountantSearch
- FormBuilder + DynamicForm
- ServiceManager

### Modyfikacje istniejących:
- Feed.tsx (obsługa accountant_id)
- CreatePostModal.tsx (opcje dla księgowych)
- WorkerDashboard.tsx (link do księgowych)
- EmployerDashboard.tsx (link do księgowych)

---

## 🚀 NASTĘPNE KROKI

**Gotowy do startu!** Powiedz od czego zaczynamy:

1. **SQL - Baza danych** (accountants + feed rozszerzenie)?
2. **accountantService.ts** (API)?
3. **AccountantDashboard** (główny panel)?
4. **Wszystko po kolei** (najpierw DB → API → UI)?

Czekam na decyzję! 🎯
