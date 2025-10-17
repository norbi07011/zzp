# 🔍 Debug Authentication w przeglądarce

## Szybka diagnoza problemu routingu bez SQL

### KROK 1: Otwórz konsolę przeglądarki

1. **Otwórz aplikację** w przeglądarce (http://localhost:3003)
2. **Naciśnij F12** aby otworzyć DevTools
3. **Przejdź do zakładki Console**

---

### KROK 2: Sprawdź użytkownika

**Wklej ten kod w konsoli:**

```javascript
// Pobierz dane użytkownika z localStorage
const authData = localStorage.getItem('sb-[TWÓJ_PROJECT_ID]-auth-token');
if (authData) {
  const parsed = JSON.parse(authData);
  console.log('🔐 Auth User:', parsed.user);
  console.log('📧 Email:', parsed.user?.email);
  console.log('🎭 Role from metadata:', parsed.user?.user_metadata?.role);
  console.log('📅 Created:', new Date(parsed.user?.created_at));
} else {
  console.log('❌ Nie jesteś zalogowany');
}
```

**UWAGA:** Zastąp `[TWÓJ_PROJECT_ID]` swoim prawdziwym project ID z Supabase.

**Lub prościej - bez znajomości project ID:**

```javascript
// Znajdź klucz auth automatycznie
const authKey = Object.keys(localStorage).find(k => k.includes('auth-token'));
if (authKey) {
  const authData = JSON.parse(localStorage.getItem(authKey));
  console.log('🔐 Zalogowany jako:', authData.user?.email);
  console.log('🎭 Rola (metadata):', authData.user?.user_metadata?.role);
} else {
  console.log('❌ Brak tokenu - nie jesteś zalogowany');
}
```

---

### KROK 3: Sprawdź profile w bazie danych

**Wklej ten kod w konsoli:**

```javascript
// Import Supabase client (jeśli masz dostęp)
const checkProfile = async () => {
  // Znajdź supabase client w window
  const supabase = window.supabase || 
                   window.__supabase || 
                   document.querySelector('[data-supabase]')?.__supabase;
  
  if (!supabase) {
    console.log('❌ Nie znaleziono Supabase client');
    console.log('💡 Wykonaj ten kod zamiast tego:');
    console.log(`
      import { supabase } from './src/lib/supabase';
      const { data, error } = await supabase.from('profiles').select('*');
      console.log('Profiles:', data);
      console.log('Error:', error);
    `);
    return;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching profiles:', error);
      
      if (error.message.includes('does not exist')) {
        console.log('🔧 PROBLEM: Tabela profiles nie istnieje!');
        console.log('✅ ROZWIĄZANIE: Wykonaj QUICK_FIX_ROUTING.sql');
      }
      
      if (error.message.includes('permission denied')) {
        console.log('🔧 PROBLEM: RLS blokuje dostęp!');
        console.log('✅ ROZWIĄZANIE: Dodaj politykę SELECT w QUICK_FIX_ROUTING.sql');
      }
    } else {
      console.log('✅ Profiles znalezione:', data?.length || 0);
      console.table(data?.map(p => ({
        Email: p.email,
        Role: p.role,
        Name: p.full_name
      })));
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
};

checkProfile();
```

---

### KROK 4: Test AuthContext w React DevTools

1. **Zainstaluj React Developer Tools** (jeśli nie masz):
   - Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

2. **Otwórz React DevTools** (zakładka "Components" w DevTools)

3. **Znajdź `AuthProvider`** w drzewie komponentów

4. **Sprawdź state:**
   - `user` → Powinien mieć `role: 'admin'|'employer'|'worker'`
   - `isAuthenticated` → Powinno być `true`
   - `isLoading` → Powinno być `false`

5. **Sprawdź props w `ProtectedRoute`:**
   - `requiredRole` → Powinna być poprawna dla danej strony
   - `user.role` → Powinna pasować do requiredRole

---

### KROK 5: Sprawdź Network requests

1. **Przejdź do zakładki Network** w DevTools
2. **Wyloguj się i zaloguj ponownie**
3. **Filtruj requesty:** wpisz `profiles` w pole filtra
4. **Znajdź request do `/rest/v1/profiles`**
5. **Sprawdź:**

#### ✅ Prawidłowy request:
```json
// Response (Status 200)
{
  "id": "uuid...",
  "email": "admin@zzp.nl",
  "role": "admin",
  "full_name": "Admin User"
}
```

#### ❌ Problem #1: Pusty wynik
```json
// Response (Status 200)
[]
```
**Znaczy to:** RLS blokuje dostęp LUB profil nie istnieje
**Rozwiązanie:** Wykonaj `QUICK_FIX_ROUTING.sql`

#### ❌ Problem #2: 401 Unauthorized
```json
// Response (Status 401)
{
  "message": "JWT expired"
}
```
**Znaczy to:** Token wygasł
**Rozwiązanie:** Wyloguj się i zaloguj ponownie

#### ❌ Problem #3: 500 Internal Server Error
**Znaczy to:** Błąd w bazie danych
**Rozwiązanie:** Sprawdź logi Supabase (Dashboard → Logs)

---

### KROK 6: Sprawdź redirect w Network

1. **Wyloguj się**
2. **Zaloguj jako admin@zzp.nl**
3. **Sprawdź zakładkę Network**
4. **Sprawdź ostatni request** po kliknięciu "Login"

**Prawidłowy flow:**
```
POST /auth/v1/token → 200 OK
GET /rest/v1/profiles?id=eq.uuid → 200 OK (profile z role='admin')
Navigate to /admin
```

**Nieprawidłowy flow (wszyscy jako worker):**
```
POST /auth/v1/token → 200 OK
GET /rest/v1/profiles?id=eq.uuid → 200 OK [] (pusty wynik!)
Navigate to /worker (bo domyślna rola = 'worker')
```

---

## 📊 INTERPRETACJA WYNIKÓW

### Scenariusz A: Tabela profiles nie istnieje
**Objawy:**
- Console: `Error: relation "profiles" does not exist`
- Network: `404 Not Found` lub `500 Internal Server Error`

**Rozwiązanie:**
```bash
# Wykonaj w Supabase SQL Editor
QUICK_FIX_ROUTING.sql
```

---

### Scenariusz B: Profile istnieją ale mają złe role
**Objawy:**
- Console: `role: 'worker'` dla wszystkich użytkowników
- Network: `200 OK` z danymi, ale `role: 'worker'` albo `role: null`

**Rozwiązanie:**
```sql
-- Ustaw poprawne role
UPDATE profiles SET role = 'admin' WHERE email = 'admin@zzp.nl';
UPDATE profiles SET role = 'employer' WHERE email = 'employer@test.nl';
UPDATE profiles SET role = 'worker' WHERE email = 'worker@test.nl';
```

---

### Scenariusz C: RLS blokuje SELECT
**Objawy:**
- Console: `Error: permission denied for table profiles`
- Network: `200 OK` ale `[]` (pusty array)

**Rozwiązanie:**
```sql
-- Dodaj politykę SELECT
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
```

---

### Scenariusz D: Wszystko OK w bazie, ale routing nie działa
**Objawy:**
- Profile w bazie są OK
- Network pokazuje poprawne dane z `role: 'admin'`
- Ale nadal redirect do `/worker`

**Możliwe przyczyny:**
1. **Cache w przeglądarce** → Wyczyść cache (Ctrl+Shift+R)
2. **Stary token w localStorage** → Wyloguj i zaloguj ponownie
3. **Bug w kodzie ProtectedRoute** → Sprawdź console czy są errory

**Rozwiązanie:**
```javascript
// Wyczyść localStorage
localStorage.clear();
// Przeładuj stronę
location.reload();
// Zaloguj ponownie
```

---

## 🎯 SZYBKA DIAGNOZA (1 minuta)

**Wykonaj ten kod w konsoli:**

```javascript
(async () => {
  console.log('🔍 DIAGNOZA ROUTINGU - START');
  
  // 1. Sprawdź localStorage
  const authKey = Object.keys(localStorage).find(k => k.includes('auth-token'));
  const authData = authKey ? JSON.parse(localStorage.getItem(authKey)) : null;
  
  console.log('1️⃣ Token w localStorage:', authData ? '✅ Tak' : '❌ Nie');
  console.log('   Email:', authData?.user?.email || 'N/A');
  console.log('   Role (metadata):', authData?.user?.user_metadata?.role || 'N/A');
  
  // 2. Sprawdź window.location
  console.log('2️⃣ Obecny URL:', window.location.pathname);
  
  // 3. Sprawdź czy jesteś na właściwym panelu
  const expectedPath = {
    'admin': '/admin',
    'employer': '/employer',
    'worker': '/worker'
  }[authData?.user?.user_metadata?.role] || '/';
  
  console.log('   Oczekiwany URL:', expectedPath);
  console.log('   Status:', window.location.pathname.startsWith(expectedPath) ? '✅ OK' : '❌ ZŁY PANEL!');
  
  console.log('🔍 DIAGNOZA ROUTINGU - KONIEC');
  console.log('');
  console.log('📋 NASTĘPNE KROKI:');
  if (!authData) {
    console.log('   → Zaloguj się ponownie');
  } else if (!window.location.pathname.startsWith(expectedPath)) {
    console.log('   → PROBLEM: Routing nie działa!');
    console.log('   → Wykonaj QUICK_FIX_ROUTING.sql w Supabase');
  } else {
    console.log('   → Wszystko OK! ✅');
  }
})();
```

---

## 💡 PODSUMOWANIE

**Ten plik pomaga zdiagnozować problem bez dostępu do SQL.**

**Jeśli znalazłeś problem:**
1. ❌ Tabela profiles nie istnieje → `QUICK_FIX_ROUTING.sql`
2. ❌ Profile mają złe role → `UPDATE profiles SET role = ...`
3. ❌ RLS blokuje SELECT → Dodaj politykę w `QUICK_FIX_ROUTING.sql`
4. ❌ Cache przeglądarki → `localStorage.clear()` + reload

**Szczegółowa naprawa:** `FIX_ROUTING_PROBLEM.md`

**Szybka naprawa SQL:** `QUICK_FIX_ROUTING.sql`
