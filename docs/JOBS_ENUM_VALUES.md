# 📋 JOBS TABLE - ALLOWED ENUM VALUES

## ⚠️ IMPORTANT: Use underscores in employment_type!

When inserting jobs, make sure to use the correct enum values with underscores where needed.

---

## 🔹 employment_type (WITH underscores!)

```sql
employment_type: 'full_time' | 'part_time' | 'contract' | 'temporary'
```

✅ **Correct:**
- `'full_time'`
- `'part_time'`
- `'contract'`
- `'temporary'`

❌ **Wrong:**
- ~~`'fulltime'`~~ (no underscore - will fail!)
- ~~`'parttime'`~~ (no underscore - will fail!)

---

## 🔹 location_type (NO underscores!)

```sql
location_type: 'onsite' | 'remote' | 'hybrid'
```

✅ **Correct:**
- `'onsite'`
- `'remote'`
- `'hybrid'`

❌ **Wrong:**
- ~~`'on_site'`~~ (has underscore - will fail!)

---

## 🔹 experience_level

```sql
experience_level: 'junior' | 'medior' | 'senior' | 'expert'
```

✅ **Correct:**
- `'junior'`
- `'medior'`
- `'senior'`
- `'expert'`

❌ **Wrong:**
- ~~`'mid'`~~ (wrong value - will fail!)
- ~~`'entry'`~~ (not in enum - will fail!)

---

## 🔹 status

```sql
status: 'active' | 'filled' | 'expired' | 'draft'
```

✅ **Correct:**
- `'active'`
- `'filled'`
- `'expired'`
- `'draft'`

---

## 🔹 salary_period

```sql
salary_period: 'hour' | 'day' | 'month' | 'year'
```

✅ **Correct:**
- `'hour'`
- `'day'`
- `'month'`
- `'year'`

---

## 📝 Example: Correct Job Insert

```sql
INSERT INTO jobs (
  employer_id,
  title,
  description,
  category,
  employment_type,    -- ✅ 'full_time' (with underscore!)
  location_type,       -- ✅ 'onsite' (no underscore!)
  city,
  country,
  salary_min,
  salary_max,
  salary_currency,
  salary_period,
  experience_level,    -- ✅ 'medior'
  status
) VALUES (
  '66bb0aef-c74c-4bbc-9705-43d9e4c35042',
  'Metselaar - Amsterdam',
  'Job description...',
  'metselaar',
  'full_time',         -- ✅ With underscore
  'onsite',            -- ✅ No underscore
  'Amsterdam',
  'NL',
  2500,
  3500,
  'EUR',
  'month',
  'medior',           -- ✅ Not 'mid'
  'active'
);
```

---

## ❌ Common Mistakes

### Mistake 1: Using 'fulltime' instead of 'full_time'
```sql
employment_type: 'fulltime'  -- ❌ WRONG!
-- Error: violates check constraint "jobs_employment_type_check"
```

**Fix:**
```sql
employment_type: 'full_time'  -- ✅ CORRECT!
```

### Mistake 2: Using 'on_site' instead of 'onsite'
```sql
location_type: 'on_site'  -- ❌ WRONG!
-- Error: violates check constraint "jobs_location_type_check"
```

**Fix:**
```sql
location_type: 'onsite'  -- ✅ CORRECT!
```

### Mistake 3: Using 'mid' instead of 'medior'
```sql
experience_level: 'mid'  -- ❌ WRONG!
-- Error: violates check constraint "jobs_experience_level_check"
```

**Fix:**
```sql
experience_level: 'medior'  -- ✅ CORRECT!
```

---

## 🔍 How to Check Constraints

If you're unsure about allowed values, run this SQL:

```sql
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'jobs'
  AND con.contype = 'c'  -- check constraint
ORDER BY con.conname;
```

---

## ✅ Summary

| Column | Values | Note |
|--------|--------|------|
| `employment_type` | `full_time`, `part_time`, `contract`, `temporary` | ⚠️ **WITH underscores!** |
| `location_type` | `onsite`, `remote`, `hybrid` | ✅ No underscores |
| `experience_level` | `junior`, `medior`, `senior`, `expert` | ✅ Use 'medior' not 'mid' |
| `status` | `active`, `filled`, `expired`, `draft` | ✅ Standard |
| `salary_period` | `hour`, `day`, `month`, `year` | ✅ Standard |

---

**Remember:** Always use `full_time` (with underscore) for employment_type!
