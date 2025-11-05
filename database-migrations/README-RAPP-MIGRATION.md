# 🎯 RAPP.NL Enhanced Tasks - Migration Guide

## 📋 Kolejność wykonywania migracji

### ✅ KROK 1: Schema Changes (WYMAGANE)

**Plik:** `20251030_2200_01_schema_rapp_style.sql`

**Co robi:**
- Dodaje 12 nowych kolumn do `project_tasks`
- Tworzy 6 indexów dla performance
- Tworzy 5 funkcji pomocniczych (kalkulacja kosztów, checklist)
- Tworzy trigger do auto-kalkulacji kosztów
- Tworzy widok `task_templates`

**Bezpieczeństwo:** ✅ Całkowicie bezpieczne - tylko ALTER TABLE + CREATE FUNCTION

**Jak uruchomić:**
1. Otwórz: https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql
2. Skopiuj **CAŁY** plik `20251030_2200_01_schema_rapp_style.sql`
3. Wklej w SQL Editor
4. Kliknij **RUN**
5. Sprawdź w logach: "✅ SCHEMA MIGRATION COMPLETE!"

**Weryfikacja:**
```sql
-- Sprawdź czy kolumny istnieją
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'project_tasks' 
AND column_name IN ('photos', 'materials', 'checklist', 'is_template');

-- Sprawdź czy widok działa
SELECT * FROM task_templates LIMIT 1;
```

---

### 🔄 KROK 2: Default Templates (OPCJONALNE)

**Plik:** `20251030_2200_02_templates.sql`

**Co robi:**
- Dodaje 3 gotowe szablony zadań:
  1. **Malowanie pokoju** (8h, €280 labor + €154 materials)
  2. **Naprawa dachu** (12h, €540 labor + €204 materials)  
  3. **Instalacja elektryczna** (6h, €300 labor + €141 materials)

**Wymagania:** ⚠️ Musisz mieć:
- Prawdziwy user ID (z tabeli `auth.users`)
- Prawdziwy project ID (z tabeli `communication_projects`)

**Jak uruchomić:**

#### Opcja A: Najpierw znajdź swoje ID

```sql
-- 1. Znajdź swój user ID
SELECT id, email FROM auth.users LIMIT 1;
-- Skopiuj UUID np: e15f1bef-4268-49c4-ad4f-788494342b9d

-- 2. Znajdź swój project ID
SELECT id, name FROM communication_projects LIMIT 1;
-- Skopiuj UUID np: a7f3c6d8-1234-5678-90ab-cdef12345678
```

#### Opcja B: Edytuj plik przed uruchomieniem

1. Otwórz `20251030_2200_02_templates.sql`
2. Znajdź wszystkie wystąpienia:
   - `'YOUR_PROJECT_ID_HERE'` → zamień na prawdziwy project UUID
   - `'YOUR_USER_ID_HERE'` → zamień na prawdziwy user UUID
3. Zapisz plik
4. Skopiuj do Supabase SQL Editor
5. Kliknij **RUN**

#### Opcja C: Pomiń szablony (stwórz w UI)

Jeśli nie chcesz bawić się w UUID, po prostu **pomiń ten plik**.

Szablony możesz stworzyć później ręcznie w aplikacji:
1. Stwórz zadanie normalnie
2. Ustaw `is_template = true`
3. Wypełnij `template_name` i `template_category`
4. Gotowe - widok `task_templates` go pokaże!

---

## 🎨 Co masz po migracji (Krok 1)

### Nowe kolumny w `project_tasks`:

| Kolumna | Typ | Opis |
|---------|-----|------|
| `photos` | JSONB | Zdjęcia zadania (galeria) |
| `materials` | JSONB | Lista materiałów z cenami |
| `checklist` | JSONB | Kroki do wykonania |
| `calculated_cost` | DECIMAL | Auto-kalkulowany koszt (materials + labor) |
| `hourly_rate` | DECIMAL | Stawka godzinowa (EUR) |
| `is_template` | BOOLEAN | Czy to szablon? |
| `template_name` | TEXT | Nazwa szablonu |
| `template_category` | TEXT | Kategoria (painting, electrical, etc.) |
| `before_photos` | JSONB | Zdjęcia "przed" |
| `after_photos` | JSONB | Zdjęcia "po" |
| `client_signature_url` | TEXT | URL podpisu klienta |
| `client_signed_at` | TIMESTAMPTZ | Data podpisania |

### Nowe funkcje:

```sql
-- Kalkulacja kosztów materiałów
SELECT calculate_materials_cost('[
  {"name": "Farba", "quantity": 10, "price": 8.50}
]'::jsonb);
-- Zwraca: 85.00

-- Kalkulacja całkowitych kosztów
SELECT calculate_total_task_cost(
  '[{"name": "Farba", "quantity": 10, "price": 8.50}]'::jsonb,
  35.00, -- hourly_rate
  8      -- estimated_hours
);
-- Zwraca: 365.00 (85 materials + 280 labor)

-- Progress checklisty
SELECT get_checklist_completion_percentage('[
  {"id": 1, "completed": true},
  {"id": 2, "completed": true},
  {"id": 3, "completed": false}
]'::jsonb);
-- Zwraca: 66.67
```

### Trigger auto-kalkulacji:

```sql
-- Gdy update'ujesz materials lub hourly_rate,
-- calculated_cost aktualizuje się automatycznie!

UPDATE project_tasks 
SET materials = '[{"name": "Test", "quantity": 5, "price": 10}]'::jsonb
WHERE id = 'some-task-id';

-- calculated_cost zmieni się na 50.00 + (hourly_rate * estimated_hours)
```

---

## 🚀 Quick Start po migracji

### 1. Dodaj zdjęcie do zadania:

```sql
UPDATE project_tasks
SET photos = photos || '[{
  "url": "https://storage.supabase.co/...",
  "caption": "Ściana przed malowaniem",
  "timestamp": "2025-10-30T10:00:00Z"
}]'::jsonb
WHERE id = 'task-id';
```

### 2. Dodaj materiały:

```sql
UPDATE project_tasks
SET materials = '[
  {"name": "Farba biała", "quantity": 10, "unit": "L", "price": 8.50},
  {"name": "Wałek", "quantity": 2, "unit": "szt", "price": 4.50}
]'::jsonb
WHERE id = 'task-id';
```

### 3. Stwórz checklist:

```sql
UPDATE project_tasks
SET checklist = '[
  {"id": 1, "text": "Zabezpieczyć meble", "completed": false},
  {"id": 2, "text": "Zagruntować", "completed": false},
  {"id": 3, "text": "Malować", "completed": false}
]'::jsonb
WHERE id = 'task-id';
```

### 4. Ustaw stawkę i godziny (koszt auto-kalkuluje się):

```sql
UPDATE project_tasks
SET 
  hourly_rate = 35.00,
  estimated_hours = 8
WHERE id = 'task-id';

-- calculated_cost automatycznie = materials + (35 * 8)
```

### 5. Zobacz szablony:

```sql
SELECT * FROM task_templates;
```

---

## 🔧 Troubleshooting

### Problem: "calculated_cost nie aktualizuje się"

**Rozwiązanie:** Trigger działa tylko gdy update'ujesz `materials`, `hourly_rate` lub `estimated_hours`.

Force recalculation:
```sql
UPDATE project_tasks
SET calculated_cost = calculate_total_task_cost(materials, hourly_rate, estimated_hours)
WHERE id = 'task-id';
```

### Problem: "task_templates view jest pusty"

**Przyczyna:** Brak zadań z `is_template = true`

**Rozwiązanie:** 
- Uruchom `20251030_2200_02_templates.sql` (z prawdziwymi UUID)
- LUB stwórz szablon ręcznie:
```sql
UPDATE project_tasks
SET 
  is_template = true,
  template_name = 'Mój szablon',
  template_category = 'custom'
WHERE id = 'existing-task-id';
```

### Problem: "Komponenty nie działają"

**Sprawdź:** Czy uruchomiłeś Krok 1 (schema migration)?

```sql
-- Sprawdź czy kolumny istnieją
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'project_tasks' 
AND column_name = 'photos';
```

Jeśli brak - uruchom `20251030_2200_01_schema_rapp_style.sql` ponownie.

---

## 📊 Podsumowanie

| Co | Wymagane? | Plik | Czas |
|----|-----------|------|------|
| Schema changes | ✅ TAK | `20251030_2200_01_schema_rapp_style.sql` | 5s |
| Default templates | ❌ Opcjonalne | `20251030_2200_02_templates.sql` | 2s |

**Minimalna wymagana akcja:** Uruchom tylko Krok 1 (schema).

Szablony możesz dodać później przez UI lub SQL.

---

## ✅ Checklist po migracji

- [ ] Uruchomiłeś `20251030_2200_01_schema_rapp_style.sql`
- [ ] Sprawdziłeś że kolumny istnieją (`SELECT * FROM information_schema.columns...`)
- [ ] Sprawdziłeś że funkcje istnieją (`SELECT * FROM information_schema.routines...`)
- [ ] Sprawdziłeś że widok `task_templates` działa (`SELECT * FROM task_templates;`)
- [ ] (Opcjonalnie) Uruchomiłeś `20251030_2200_02_templates.sql` z prawdziwymi UUID
- [ ] Przetestowałeś komponenty w aplikacji:
  - [ ] TaskPhotoGallery
  - [ ] TaskMaterialsList
  - [ ] TaskChecklistManager
  - [ ] TaskCostCalculator
  - [ ] TaskTemplateSelector

---

**Gotowe!** Teraz możesz używać wszystkich 5 komponentów RAPP.NL 🎉
