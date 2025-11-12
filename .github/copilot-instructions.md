🧠 TRYB MYŚLENIA (Claude Sonnet 5)

AI uruchamia pełny tryb inżynierski:

Analiza systemowa – wykrywa wszystkie zależności między plikami, backendem, frontendem, bazą, API i autoryzacją.

Detekcja błędu – szuka dokładnie tego błędu, który blokuje panel admina, analizując logi i zależności.
Tryb diagnostyczny – przed każdą zmianą sprawdza, czy system już działa częściowo, żeby nie nadpisywać sprawnych elementów.
📁 ZASADY EDYTOWANIA ZARZĄDZANIA PLIKAMI
 JESLI EDYTUJEMY JAKAS STARA RAMKE LUB STARE FUNBKCJE 
Nie usuwa niczego!

Stare pliki trafiają do folderu: /archiwum/smieci/

Nazwa zmieniana na: nazwa_starego_pliku_DEMO.md

Nowe funkcje / komponenty tworzy od zera, czysto, w stylu „clean code”.

Po zakończeniu kompilacji (build w terminalu) — AI wykonuje automatyczną kontrolę:

Czy panel admina otwiera się bez błędów?

Czy wszystkie linki, karty, i formularze działają?

Czy dane zapisują się prawidłowo do bazy?

 🧩 KROK 1 – ANALIZA

Sprawdzenie struktury folderów (src/admin, backend/routes, components/ui, db/schema).

Wykrycie wszystkich plików powiązanych z adminem.

Detekcja błędu (np. brak autoryzacji, routing, brak importu).

KROK 2 – PLAN

Tworzy plan_rozbudowy.md z listą modułów i zależności:

Dashboard

User Management

Logs

Settings

API routes

Każdy moduł dostaje status: OK, DO NAPRAWY, PRZEBUDOWA.

KROK 3 – REFAKTORYZACJA

Przenosi wszystkie stare komponenty do /archiwum/smiecio.

Generuje nowe pliki modułami (po 1 funkcji).

Weryfikuje importy i kompatybilność typów.

KROK 4 – TEST & BUILD

Uruchamia test build (npm run build / vite build).

Jeśli wystąpi błąd → loguje do build_log.txt i poprawia.

.

🔍 ANALIZA

STEP 0: Szuka błędów i duplikatów w kodzie (grep_search, read_file).

Sprawdza czy stare i nowe wersje plików się nie gryzą.

🧩 BAZA DANYCH (MCP + SUPABASE)

Pobiera listę tabel, struktury, polityki RLS.

Jeśli dane istnieją, ale nie zwracają się → blokada RLS → natychmiast naprawić.

⚙️ NAPRAWA KODU

Najpierw UI, potem interface.

Zawsze dodaje console.log('💸 DEBUG: ...') przed testem.

Sprawdza błędy w przeglądarce (F12).

🚫 ZAKAZY

Nie zakładać, że kolumna istnieje — zawsze sprawdź MCP.

Nie kopiować SQL z innej tabeli.

Nie komentować błędów ani używać as any.

🧱 ARCHITEKTURA

Role: worker, employer, accountant, cleaning_company, admin.

Avatar zależny od roli, nie z profilu.

RLS: admin zawsze ma dostęp przez specjalną politykę.

🗃️ ZASADY SQL / MIGRACJE

Każda zmiana → 3 kroki: list_tables → structure → migration file.

Wzór RLS i rollback plan zapisany w pliku migracji.

✅ CHECKPOINTY

CP1: po MCP – czy admin nie zablokowany?

CP2: przed zmianą interfejsu.

CP3: po refaktorze serwisu.

CP4: po zmianie UI (sprawdź dane).

🧠 DIAGNOZA

Zawsze porównaj COUNT(*) vs SELECT * – różnica = RLS problem.

Debug przez console.log.

🧩 PUŁAPKI

Poprawne nazwy pól (contact_email, logo_url, profile_id).

Nie mylić tabel z widokami (v_workers ≠ workers).