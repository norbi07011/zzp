# 🔧 FIX - Brakujące kolumny i tabele

## ❌ **BŁĘDY:**

```
Error adding certificate: "Could not find the 'file_url' column of 'certificates'"
Error adding portfolio_project: "Could not find table 'portfolio_projects'"
```

## ✅ **ROZWIĄZANIE:**

### **Uruchom w Supabase SQL Editor:**

1. Otwórz: https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql/new
2. Skopiuj **cały plik:** `FIX_MISSING_COLUMNS.sql`
3. Wklej i kliknij **RUN** ▶️

---

## 📋 **CO ZOSTANIE DODANE:**

1. ✅ **Kolumna `file_url`** do tabeli `certificates`
2. ✅ **Tabela `portfolio_projects`** z pełną strukturą:
   - id, worker_id, title, description
   - project_date, client_name, location
   - images (JSONB), file_url, tags (JSONB)
   - status, created_at, updated_at
3. ✅ **RLS policies** dla portfolio_projects (5 policies)
4. ✅ **Indexes** dla szybszych zapytań
5. ✅ **Trigger** dla auto-update updated_at

---

## 🔍 **WERYFIKACJA:**

Po uruchomieniu SQL powinieneś zobaczyć:

**Certificates columns:**
```
column_name       | data_type
------------------|------------
id                | uuid
worker_id         | uuid
certificate_type  | character varying
certificate_number| character varying
issue_date        | date
expiry_date       | date
status            | character varying
pdf_url           | text
file_url          | text          <-- NOWA!
created_at        | timestamp
```

**Portfolio projects:**
```
portfolio_projects_exists
--------------------------
t (true)
```

---

## 🚀 **PO URUCHOMIENIU:**

1. **Odśwież przeglądarkę** (F5)
2. **Kliknij na różne zakładki** (Portfolio, Weryfikacja, etc.)
3. **Błędy powinny zniknąć!** ✅

---

**Uruchom `FIX_MISSING_COLUMNS.sql` w Supabase teraz!** 🎯
