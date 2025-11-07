# INSPIRACJE Z SITLY.DE - PLAN IMPLEMENTACJI

## 🎯 FUNKCJONALNOŚCI DO DODANIA

### 1. KALENDARZ DOSTĘPNOŚCI (PRIORYTET: WYSOKI)
```typescript
interface Availability {
  monday: { morning: boolean; afternoon: boolean; evening: boolean };
  tuesday: { morning: boolean; afternoon: boolean; evening: boolean };
  // ... etc dla wszystkich dni
}

// Komponent:
<AvailabilityCalendar 
  availability={worker.availability}
  editable={isOwnProfile}
/>
```

**SQL - dodaj do tabeli workers:**
```sql
ALTER TABLE workers 
ADD COLUMN availability JSONB DEFAULT '{
  "monday": {"morning": false, "afternoon": false, "evening": false},
  "tuesday": {"morning": false, "afternoon": false, "evening": false},
  "wednesday": {"morning": false, "afternoon": false, "evening": false},
  "thursday": {"morning": false, "afternoon": false, "evening": false},
  "friday": {"morning": false, "afternoon": false, "evening": false},
  "saturday": {"morning": false, "afternoon": false, "evening": false},
  "sunday": {"morning": false, "afternoon": false, "evening": false}
}'::jsonb;
```

---

### 2. CECHY CHARAKTERU / TAGI (PRIORYTET: ŚREDNI)
```typescript
const PERSONALITY_TRAITS = [
  'Niezawodny', 'Punktualny', 'Komunikatywny',
  'Doświadczony', 'Elastyczny', 'Profesjonalny'
];

// Dodaj do profilu pracownika
<PersonalityTags tags={worker.personality_traits} />
```

**SQL:**
```sql
ALTER TABLE workers 
ADD COLUMN personality_traits TEXT[] DEFAULT ARRAY[]::TEXT[];
```

---

### 3. OSTATNIA AKTYWNOŚĆ (PRIORYTET: WYSOKI)
```typescript
// Dodaj do każdego rekordu
last_active: timestamp

// Wyświetl jako:
"1 week ago" | "2 days ago" | "Online now"
```

**SQL:**
```sql
ALTER TABLE workers 
ADD COLUMN last_active TIMESTAMP DEFAULT NOW();

-- Trigger aby auto-update przy każdym UPDATE
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workers_last_active
  BEFORE UPDATE ON workers
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();
```

---

### 4. SIDEBAR - PODOBNI PRACOWNICY (PRIORYTET: WYSOKI)
```typescript
// Komponent dla strony profilu
<SimilarWorkers 
  currentWorkerId={worker.id}
  location={worker.location_city}
  specialization={worker.specialization}
  limit={10}
/>

// Query:
SELECT w.*, p.full_name, p.avatar_url
FROM workers w
JOIN profiles p ON p.id = w.profile_id
WHERE w.id != $1
  AND w.location_city = $2
  AND w.specialization = $3
  AND w.profile_visibility = 'public'
ORDER BY w.last_active DESC
LIMIT 10;
```

---

### 5. FREEMIUM MODEL (PRIORYTET: ŚREDNI)

**Ukryj dla niezalogowanych:**
- Dokładne doświadczenie (tylko "1-3 lata" zamiast szczegółów)
- Pełna lista umiejętności (tylko top 3)
- Kontakt bezpośredni (email/telefon)

```typescript
{!isAuthenticated && (
  <div className="blur-sm">
    <p>Szczegółowe informacje dostępne po zalogowaniu</p>
  </div>
)}

{!isAuthenticated && (
  <button onClick={openRegisterModal}>
    Zarejestruj się za darmo
  </button>
)}
```

---

### 6. FAQ SEKCJA NA DOLE PROFILU (PRIORYTET: NISKI)

```typescript
const FAQ_ITEMS = [
  {
    question: 'Czy członkostwo jest darmowe?',
    answer: 'Tak, rejestracja i przeglądanie profili jest całkowicie bezpłatne...'
  },
  {
    question: 'Jak znaleźć budowlańca w mojej okolicy?',
    answer: 'Użyj wyszukiwarki z filtrem lokalizacji...'
  },
  // ... etc
];

<FAQSection items={FAQ_ITEMS} />
```

---

## 📊 STRUKTURA BAZY DANYCH - NOWE KOLUMNY

```sql
-- WORKERS TABLE - DODATKOWE KOLUMNY

-- 1. Kalendarz dostępności
ALTER TABLE workers ADD COLUMN IF NOT EXISTS 
  availability JSONB DEFAULT '{...}'::jsonb;

-- 2. Cechy charakteru
ALTER TABLE workers ADD COLUMN IF NOT EXISTS 
  personality_traits TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Ostatnia aktywność
ALTER TABLE workers ADD COLUMN IF NOT EXISTS 
  last_active TIMESTAMP DEFAULT NOW();

-- 4. Typ usług (analogia do Sitly)
ALTER TABLE workers ADD COLUMN IF NOT EXISTS 
  service_types TEXT[] DEFAULT ARRAY['regular', 'occasional', 'emergency']::TEXT[];

-- 5. Dodatkowe usługi (np. "mogę kupić materiały", "mam własne narzędzia")
ALTER TABLE workers ADD COLUMN IF NOT EXISTS 
  additional_services TEXT[] DEFAULT ARRAY[]::TEXT[];
```

---

## 🎨 KOMPONENTY DO UTWORZENIA

### 1. `AvailabilityCalendar.tsx`
```tsx
interface Props {
  availability: Availability;
  editable?: boolean;
  onChange?: (newAvailability: Availability) => void;
}

export const AvailabilityCalendar: React.FC<Props> = ({...}) => {
  return (
    <div className="grid grid-cols-8 gap-2">
      <div></div> {/* pusty róg */}
      {DAYS.map(day => <div key={day}>{day}</div>)}
      
      {TIME_SLOTS.map(slot => (
        <>
          <div>{slot}</div>
          {DAYS.map(day => (
            <Checkbox 
              checked={availability[day][slot]}
              onChange={() => handleToggle(day, slot)}
            />
          ))}
        </>
      ))}
    </div>
  );
};
```

### 2. `PersonalityTags.tsx`
```tsx
export const PersonalityTags: React.FC<{tags: string[]}> = ({tags}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <span key={tag} className="badge badge-primary">
          {tag}
        </span>
      ))}
    </div>
  );
};
```

### 3. `SimilarWorkers.tsx`
```tsx
export const SimilarWorkers: React.FC<Props> = ({...}) => {
  const { data: workers } = useSimilarWorkers(currentWorkerId, location);
  
  return (
    <aside className="bg-white rounded-lg p-4">
      <h3>Podobni pracownicy</h3>
      {workers.map(worker => (
        <WorkerCard key={worker.id} worker={worker} compact />
      ))}
      <Link to="/workers">Pokaż więcej →</Link>
    </aside>
  );
};
```

---

## 🚀 ROADMAP IMPLEMENTACJI

### FAZA 1 - CORE (1 tydzień)
- [x] Ostatnia aktywność (last_active)
- [ ] Kalendarz dostępności (availability)
- [ ] Sidebar z podobnymi pracownikami

### FAZA 2 - ENHANCEMENT (3 dni)
- [ ] Cechy charakteru (personality_traits)
- [ ] Dodatkowe usługi (additional_services)
- [ ] Freemium blur na szczegóły

### FAZA 3 - POLISH (2 dni)
- [ ] FAQ sekcja
- [ ] Trust signals (weryfikacja, badge)
- [ ] Mobile responsywność kalendarza

---

## 💬 NOTATKI

**CO SIĘ SPRAWDZA W SITLY:**
1. ✅ Stawka WIDOCZNA na pierwszy rzut oka
2. ✅ Kalendarz dostępności - BARDZO CZYTELNY
3. ✅ Freemium działa - ludzie chcą zobaczyć więcej
4. ✅ Sidebar z alternatywami - zwiększa conversion
5. ✅ FAQ buduje zaufanie

**CO MOŻNA POPRAWIĆ:**
1. ⚠️ Zbyt dużo ukrytych informacji (może frustrować)
2. ⚠️ Brak ocen/opinii wyraźnie widocznych
3. ⚠️ Brak szybkiego kontaktu (chat/message)

**ADAPTACJA DLA ZZP:**
- Dodaj **OCENY** bardziej prominentnie
- Dodaj **ZREALIZOWANE PROJEKTY** (portfolio)
- Dodaj **SZYBKI KONTAKT** (message button)
- Kalendarz: zamiast rano/popołudnie/wieczór → GODZINY (8-16, 16-24)
