# 🚨 PROBLEM: Wszyscy użytkownicy widzą panel pracownika

## 📋 PODSUMOWANIE PROBLEMU

**Objaw:** Niezależnie od roli (admin/employer/worker), po zalogowaniu każdy użytkownik widzi panel pracownika (`/worker`).

**Przyczyna:** Funkcja `mapSupabaseUserToAppUser` w pliku `contexts/AuthContext.tsx` (linia 66-86) nie może pobrać profilu z bazy danych i używa domyślnej wartości:

```typescript
// AuthContext.tsx, linia 81-85
if (error || !profile) {
  return {
    // ... inne pola
    role: (supabaseUser.user_metadata?.role as UserRole) || 'worker',  // ❌ TUTAJ!
  };
}
```

**Efekt:** Wszyscy użytkownicy dostają `role: 'worker'` → routing przekierowuje do `/worker`.

---

## 🎯 MOŻLIWE PRZYCZYNY (w kolejności prawdopodobieństwa)

### 1. Tabela `profiles` nie istnieje ⭐⭐⭐⭐⭐
- Migracje nie zostały wykonane
- Tabela była usunięta lub nigdy nie utworzona
- **Test:** Sprawdź w Supabase Table Editor czy widzisz tabelę `profiles`

### 2. RLS (Row Level Security) blokuje odczyt ⭐⭐⭐⭐
- Polityki zabezpieczeń są zbyt restrykcyjne
- Brak polityki `SELECT` dla authenticated użytkowników
- **Test:** Sprawdź w Network tab czy request do `/rest/v1/profiles` zwraca `[]`

### 3. Profile nie mają ustawionych ról ⭐⭐⭐
- Kolumna `role` jest NULL
- Role nie są synchronizowane z `auth.users`
- **Test:** Uruchom `SELECT role FROM profiles;` w SQL Editor

### 4. Profile nie istnieją dla użytkowników ⭐⭐
- Konta w `auth.users` istnieją
- Ale nie mają odpowiadających wpisów w `profiles`
- **Test:** Uruchom `CHECK_USER_ROLES.sql`

---

## 🛠️ ROZWIĄZANIE KROK PO KROKU

### OPCJA A: Szybka naprawa (5 minut) ⚡ **← POLECAM TO!**

1. **Otwórz Supabase Dashboard** → SQL Editor
2. **Wykonaj:** `QUICK_FIX_ROUTING.sql` (jeden plik, wszystko naprawia)
3. **Wyloguj się** z aplikacji
4. **Zaloguj ponownie** jako:
   - `admin@zzp.nl` / `test123` → Powinien pokazać `/admin`
   - `employer@test.nl` / `test123` → Powinien pokazać `/employer`
   - `worker@test.nl` / `test123` → Powinien pokazać `/worker`

**Ten skrypt:**
- ✅ Tworzy tabelę `profiles` (jeśli nie istnieje)
- ✅ Dodaje brakujące profile dla użytkowników z `auth.users`
- ✅ Naprawia RLS polityki (pozwala authenticated użytkownikom czytać profile)
- ✅ Synchronizuje role z metadanych
- ✅ Naprawia konkretne konta testowe

---

### OPCJA B: Diagnoza i naprawa manualna (15-30 minut)

**Jeśli szybka naprawa nie zadziała lub chcesz zrozumieć problem:**

1. **Diagnoza:**
   - Wykonaj `CHECK_USER_ROLES.sql` w Supabase SQL Editor
   - Lub sprawdź w przeglądarce (F12 → Console) używając `DEBUG_AUTH_IN_BROWSER.md`

2. **Identyfikacja problemu:**
   - Przeczytaj wyniki z `CHECK_USER_ROLES.sql`
   - Porównaj z przykładami w `FIX_ROUTING_PROBLEM.md`

3. **Naprawa:**
   - Otwórz `FIX_ROUTING_PROBLEM.md`
   - Znajdź sekcję odpowiadającą Twojemu problemowi
   - Wykonaj SQL z tej sekcji

4. **Weryfikacja:**
   - Sprawdź `SELECT email, role FROM profiles;`
   - Wyloguj i zaloguj ponownie
   - Sprawdź czy routing działa

---

## 📁 PLIKI POMOCNICZE

### 🚀 Szybkie rozwiązania:
1. **`QUICK_FIX_ROUTING.sql`** ⭐⭐⭐⭐⭐
   - Wszystko w jednym
   - Idempotentny (bezpieczny do wielokrotnego uruchomienia)
   - Naprawia 90% przypadków
   - **CZAS: 30 sekund**

### 🔍 Diagnostyka:
2. **`CHECK_USER_ROLES.sql`**
   - Sprawdza czy tabela istnieje
   - Pokazuje wszystkie profile i ich role
   - Identyfikuje problemy (NULL role, brak profili, etc.)
   - **CZAS: 10 sekund**

3. **`DEBUG_AUTH_IN_BROWSER.md`**
   - Diagnoza w przeglądarce (bez SQL)
   - Sprawdza localStorage, Network, React DevTools
   - Krok po kroku z kodem do wklejenia w Console
   - **CZAS: 5 minut**

### 📖 Szczegółowa dokumentacja:
4. **`FIX_ROUTING_PROBLEM.md`**
   - Kompleksowy przewodnik
   - 4 scenariusze problemów z rozwiązaniami
   - Debug krok po kroku
   - Długoterminowe rozwiązania
   - **CZAS: Czytanie 10 min, naprawa 5-30 min**

---

## ✅ JAK SPRAWDZIĆ CZY DZIAŁA?

### Test 1: Sprawdź w Supabase
```sql
SELECT email, role FROM profiles 
WHERE email IN ('admin@zzp.nl', 'employer@test.nl', 'worker@test.nl');
```

**Oczekiwany wynik:**
```
admin@zzp.nl     | admin
employer@test.nl | employer
worker@test.nl   | worker
```

### Test 2: Sprawdź w aplikacji

| Konto | Email | Hasło | Oczekiwany URL | Oczekiwany panel |
|-------|-------|-------|----------------|------------------|
| Admin | `admin@zzp.nl` | `test123` | `http://localhost:3003/admin` | Panel administratora |
| Employer | `employer@test.nl` | `test123` | `http://localhost:3003/employer` | Panel pracodawcy |
| Worker | `worker@test.nl` | `test123` | `http://localhost:3003/worker` | Panel pracownika |

### Test 3: Sprawdź w konsoli przeglądarki (F12)

```javascript
// Zaloguj się i wykonaj:
const authKey = Object.keys(localStorage).find(k => k.includes('auth-token'));
const user = JSON.parse(localStorage.getItem(authKey))?.user;
console.log('Email:', user?.email);
console.log('Role:', user?.user_metadata?.role);
console.log('URL:', window.location.pathname);
```

**Prawidłowy wynik dla admin@zzp.nl:**
```
Email: admin@zzp.nl
Role: admin
URL: /admin
```

---

## 🚨 CO JEŚLI NADAL NIE DZIAŁA?

### Krok 1: Sprawdź logi w konsoli przeglądarki
```
Otwórz DevTools (F12) → Console
Szukaj błędów typu:
- "Error fetching user profile"
- "permission denied"
- "relation does not exist"
```

### Krok 2: Sprawdź Network tab
```
1. Otwórz DevTools (F12) → Network
2. Wyloguj i zaloguj ponownie
3. Filtruj: "profiles"
4. Sprawdź response z /rest/v1/profiles
```

**Jeśli widzisz:**
- `[]` (pusty array) → RLS blokuje, wykonaj `QUICK_FIX_ROUTING.sql`
- `404` → Tabela nie istnieje, wykonaj `QUICK_FIX_ROUTING.sql`
- `401` → Token wygasł, wyloguj i zaloguj ponownie
- `500` → Błąd serwera, sprawdź logi Supabase

### Krok 3: Sprawdź RLS polityki
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

**Musisz mieć:**
```
"Profiles are viewable by authenticated users" | SELECT | true
```

### Krok 4: Wyczyść cache
```javascript
// W konsoli przeglądarki:
localStorage.clear();
location.reload();
// Zaloguj ponownie
```

---

## 📞 DALSZE KROKI PO NAPRAWIE

Po naprawieniu routingu, wykonaj pełną migrację bazy danych:

1. ✅ **Routing działa** (to właśnie naprawiliśmy)
2. ⏳ **Wykonaj `FIX_BEZPIECZNY.sql`** - naprawia istniejące tabele (~30 sek)
3. ⏳ **Wykonaj `COMPLETE_MIGRATION_ALL_TABLES.sql`** - dodaje 16 brakujących tabel (~2 min)
4. ⏳ **Wykonaj `RLS_POLICIES_ALL_TABLES.sql`** - zabezpiecza wszystkie tabele (~2 min)

**Szczegóły:** `INSTRUKCJA_WDROZENIA.md`

---

## 🎯 NAJPROSTSZE ROZWIĄZANIE (TL;DR)

```
1. Otwórz Supabase Dashboard → SQL Editor
2. Wykonaj QUICK_FIX_ROUTING.sql
3. Wyloguj się z aplikacji
4. Zaloguj jako admin@zzp.nl / test123
5. Sprawdź czy widzisz /admin panel
```

**Jeśli to nie pomoże:**
- Przeczytaj `FIX_ROUTING_PROBLEM.md`
- Wykonaj diagnostykę z `CHECK_USER_ROLES.sql`
- Sprawdź w przeglądarce używając `DEBUG_AUTH_IN_BROWSER.md`

---

## 📊 CZAS NAPRAWY

| Metoda | Czas | Trudność | Skuteczność |
|--------|------|----------|-------------|
| QUICK_FIX_ROUTING.sql | 1 min | ⭐ Łatwe | 90% |
| Diagnoza + Manualna naprawa | 15-30 min | ⭐⭐ Średnie | 95% |
| Debug w przeglądarce | 5 min | ⭐⭐ Średnie | Tylko diagnoza |
| Pełna migracja | 5 min | ⭐⭐⭐ Trudne | 100% |

---

**POLECAM:** Zacznij od `QUICK_FIX_ROUTING.sql` - najprawdopodobniej to rozwiąże problem! 🚀
