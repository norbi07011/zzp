# 🔍 INSTRUKCJA - SPRAWDZENIE I NAPRAWA BAZY SUPABASE

## KROK 1: Przejdź do Supabase Dashboard

1. Otwórz przeglądarkę
2. Wejdź na: https://supabase.com/dashboard
3. Zaloguj się
4. Wybierz projekt: **dtnotuyagygexmkyqtgb**
5. Kliknij **SQL Editor** w menu bocznym

---

## KROK 2: Szybka Diagnoza (3 minuty)

### A. Sprawdź orphaned tasks

Skopiuj i uruchom w SQL Editor:

```sql
SELECT 
    pt.id,
    pt.title,
    pt.project_id as "❌ Nieistniejący projekt",
    pt.status
FROM project_tasks pt
LEFT JOIN projects p ON pt.project_id = p.id
WHERE p.id IS NULL;
```

**Co to pokazuje:**
- ✅ **0 wyników** = Wszystko OK, przejdź do KROK 3
- ❌ **Są wyniki** = Masz orphaned tasks, kontynuuj poniżej ⬇️

---

### B. Sprawdź prawdziwe projekty

```sql
SELECT 
    id,
    name,
    created_at
FROM projects
ORDER BY created_at DESC;
```

**Skopiuj jedno z ID projektów** (będzie potrzebne w naprawie)

Przykład wyniku:
```
id: cce21528-6d03-4f49-bd50-bbdd385e3765
name: Projekt Demo
```

---

### C. NAPRAWA - Przypisz zadania do projektu

**⚠️ UWAGA:** Zamień `'TUTAJ_ID'` na prawdziwe ID z kroku B!

```sql
UPDATE project_tasks 
SET project_id = 'cce21528-6d03-4f49-bd50-bbdd385e3765'  -- ⬅️ WKLEJ PRAWDZIWE ID
WHERE project_id NOT IN (SELECT id FROM projects);
```

**Kliknij RUN!**

---

### D. Weryfikacja naprawy

Uruchom ponownie query z kroku A:

```sql
SELECT 
    pt.id,
    pt.title,
    pt.project_id as "❌ Nieistniejący projekt"
FROM project_tasks pt
LEFT JOIN projects p ON pt.project_id = p.id
WHERE p.id IS NULL;
```

**Wynik: 0 rows** = ✅ NAPRAWIONE!

---

## KROK 3: Sprawdź strukturę tabel

### Sprawdź czy wszystkie tabele istnieją:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Wymagane tabele:**
- ✅ `project_tasks`
- ✅ `projects`
- ✅ `project_members`
- ✅ `profiles`

---

### Sprawdź kolumny w project_tasks:

```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'project_tasks'
ORDER BY ordinal_position;
```

**Kluczowe kolumny:**
- ✅ `id` - uuid
- ✅ `project_id` - uuid
- ✅ `title` - text
- ✅ `assigned_to` - uuid (nullable)
- ✅ `status` - text
- ✅ `priority` - text

---

## KROK 4: Sprawdź Foreign Keys

```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'project_tasks';
```

**Wymagane FK:**
- ✅ `project_tasks.project_id` → `projects.id`
- ✅ `project_tasks.assigned_to` → `profiles.id` (jeśli istnieje)

---

## KROK 5: Test Finalny

### Sprawdź czy możesz pobrać zadania:

```sql
SELECT 
    pt.id,
    pt.title,
    pt.status,
    pt.priority,
    p.name as project_name,
    pt.assigned_to
FROM project_tasks pt
JOIN projects p ON pt.project_id = p.id
ORDER BY pt.created_at DESC
LIMIT 5;
```

**Oczekiwany wynik:**
- ✅ Zadania wyświetlają się
- ✅ Każde zadanie ma `project_name`
- ✅ Brak błędów

---

## 🎯 CHECKLIST KOŃCOWY

Po wykonaniu wszystkich kroków, zaznacz:

- [ ] Sprawdziłem orphaned tasks (KROK 2A)
- [ ] Naprawiłem orphaned tasks jeśli były (KROK 2C)
- [ ] Zweryfikowałem naprawę (KROK 2D)
- [ ] Wszystkie wymagane tabele istnieją (KROK 3)
- [ ] Kolumny project_tasks są OK (KROK 3)
- [ ] Foreign keys są obecne (KROK 4)
- [ ] Test finalny przeszedł (KROK 5)

---

## 📝 CO DALEJ?

### Jeśli wszystko OK (✅):
1. Aplikacja powinna działać
2. Zadania będą widoczne w UI
3. Możesz tworzyć nowe zadania

### Jeśli są problemy (❌):
1. Skopiuj błąd z SQL Editor
2. Uruchom pełną diagnozę: `DIAGNOZA_BAZY_KOMPLETNA.sql`
3. Daj mi znać jaki błąd - naprawię

---

## 🚀 PLIKI POMOCNICZE

W projekcie masz 3 pliki SQL:

1. **SZYBKA_NAPRAWA_ORPHANED_TASKS.sql** - 3 query do szybkiej naprawy
2. **FIX_ORPHANED_TASKS.sql** - Szczegółowa naprawa z komentarzami
3. **DIAGNOZA_BAZY_KOMPLETNA.sql** - Pełna analiza 10 kroków

---

**Powodzenia! 🎉**
