# 🚀 INSTRUKCJA: Rozbudowa systemu Tasks (RAPP.NL Style)

## 📋 CO ZOSTANIE DODANE:

### Nowe kolumny w `project_tasks`:
- ✅ `photos` - galeria zdjęć z adnotacjami
- ✅ `materials` - lista materiałów z cenami
- ✅ `checklist` - kroki do wykonania
- ✅ `calculated_cost` - auto-kalkulacja (materiały + robocizna)
- ✅ `hourly_rate` - stawka za godzinę
- ✅ `is_template` - czy to szablon
- ✅ `template_name` - nazwa szablonu
- ✅ `template_category` - kategoria (painting, plumbing, electrical...)
- ✅ `before_photos` / `after_photos` - foto przed/po
- ✅ `client_signature_url` - podpis klienta

### Funkcje pomocnicze:
- ✅ `calculate_materials_cost()` - suma kosztów materiałów
- ✅ `calculate_total_task_cost()` - materiały + robocizna
- ✅ `update_task_calculated_cost()` - auto-update przy zmianie
- ✅ `count_completed_checklist_items()` - ile kroków zrobione
- ✅ `get_checklist_completion_percentage()` - % postępu

### Widok:
- ✅ `task_templates` - wszystkie szablony zadań

### Domyślne szablony (3):
1. **Malowanie pokoju** (painting) - 8h, €280 materiały
2. **Naprawa dachu** (renovation) - 12h, €540 materiały  
3. **Instalacja elektryczna** (electrical) - 6h, €300 materiały

---

## 🎯 WYKONAJ MIGRACJĘ:

### 1️⃣ Otwórz SQL Editor:
```
https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql
```

### 2️⃣ Skopiuj plik:
```
database-migrations/20251030_2200_enhance_tasks_rapp_style.sql
```

### 3️⃣ Wklej i kliknij **RUN**

### 4️⃣ Zweryfikuj:
```bash
node scripts/verify-enhanced-tasks.mjs
```

---

## 📊 PRZYKŁADY UŻYCIA:

### Utwórz zadanie z szablonu:
```sql
INSERT INTO project_tasks (project_id, title, description, materials, checklist, hourly_rate, estimated_hours)
SELECT 
    'your-project-id',
    'Malowanie salonu',
    description,
    materials,
    checklist,
    hourly_rate,
    estimated_hours
FROM task_templates
WHERE template_name = 'Malowanie pokoju';
```

### Dodaj zdjęcie:
```sql
UPDATE project_tasks
SET photos = photos || '[{"url": "...", "caption": "Przed", "timestamp": "2025-10-30T10:00:00Z"}]'::jsonb
WHERE id = 'task-id';
```

### Oznacz krok jako wykonany:
```sql
UPDATE project_tasks
SET checklist = jsonb_set(checklist, '{0,completed}', 'true'::jsonb)
WHERE id = 'task-id';
```

---

## 🎉 PO MIGRACJI:

Każde zadanie będzie miało:
- 📸 Galerię zdjęć (przed/w trakcie/po)
- 🛠️ Listę materiałów z auto-sumą kosztów
- ✅ Checklist kroków (z % postępu)
- 💰 Auto-kalkulację: materiały + (stawka × godziny)
- 📋 Możliwość zapisu jako szablon
- ✍️ Podpis klienta po zakończeniu

**To będzie game-changer!** 🚀
