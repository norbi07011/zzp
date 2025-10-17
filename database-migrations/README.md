# 📊 Database Migrations

Ten folder zawiera wszystkie skrypty SQL dla bazy danych.

## 📁 Struktura

### Najważniejsze pliki:

1. **COMPLETE_MISSING_TABLES_ALL.sql** - Utworzenie 25 brakujących tabel
2. **FIX_INFINITE_RECURSION_PROFILES.sql** - ⭐ KRYTYCZNY FIX - Naprawa RLS policies
3. **INSERT_TEST_DATA.sql** - Dane testowe (5 skills, 3 jobs, 4 certyfikaty)
4. **RLS_POLICIES_COMPLETE.sql** - Kompletne polityki RLS dla wszystkich tabel

### Pliki diagnostyczne:

- **CHECK_DATABASE_ERRORS.sql** - Sprawdzenie błędów w bazie
- **check-missing-tables.sql** - Lista wszystkich tabel
- **FIX_EMPLOYER_DASHBOARD_ERRORS.sql** - Analiza problemów employer dashboard

### Migracje:

- **MIGRACJA_KROK_PO_KROKU.sql** - 16 podstawowych tabel
- **MIGRACJA_BRAKUJACE_TABELE_KOMPLETNA.sql** - 5 dodatkowych tabel

## 🎯 Jak używać:

1. Otwórz Supabase Dashboard → SQL Editor
2. Skopiuj zawartość wybranego pliku
3. Wklej do edytora
4. Kliknij "Run" (lub Ctrl+Enter)

## ⚠️ Ważne:

- **FIX_INFINITE_RECURSION_PROFILES.sql** MUSI być wykonany jako pierwszy (naprawia błędy 500)
- Po wykonaniu wyloguj się i zaloguj ponownie
- Zawsze sprawdź wyniki w zakładce "Results"
