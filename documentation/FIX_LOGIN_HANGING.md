# 🔧 NAPRAWA ZAWIESZANIA PRZY LOGOWANIU
**Data:** 2025-01-29  
**Problem:** Przy pierwszym zalogowaniu działa, ale przy drugim otwarciu strona się zawiesza na "loading"

---

## ✅ NAPRAWY WYKONANE

### 1. **Dodano timeout do AuthContext (5 sekund)**
**Problem:** Zapytania do bazy czekały w nieskończoność gdy widoki `v_workers`/`v_profiles` nie istniały

**Naprawa:**
- Dodano `Promise.race()` z 5-sekundowym timeout
- Po timeout aplikacja używa podstawowych danych użytkownika z auth.user_metadata
- Użytkownik może się zalogować nawet gdy baza nie odpowiada

**Kod:**
```typescript
const timeoutPromise = new Promise<User>((_, reject) => 
  setTimeout(() => reject(new Error('Auth timeout')), 5000)
);

const appUser = await Promise.race([
  mapSupabaseUserToAppUser(session.user),
  timeoutPromise
]);
```

---

### 2. **Dodano error handling do worker profile**
**Problem:** Błędy przy pobieraniu subscription/certificates blokowały logowanie

**Naprawa:**
- Wrapped w `try/catch` - błędy są tylko logowane (console.warn)
- Logowanie działa nawet gdy brakuje danych subscription

---

### 3. **Fallback do podstawowych danych**
**Problem:** Gdy mapowanie profilu failuje, użytkownik był null

**Naprawa:**
- Zawsze zwracamy podstawowe dane z `session.user.user_metadata`
- User może się zalogować z minimalnym profilem (email, name, role)

---

## 🚀 TESTOWANIE

### **KROK 1: Wyczyść localStorage**
Usuń starą zepsutą sesję:

1. Otwórz Console (F12)
2. Wpisz:
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```
3. Enter

---

### **KROK 2: Odśwież stronę**
```
Ctrl + F5 (hard refresh)
```

---

### **KROK 3: Zaloguj się ponownie**
- Logowanie powinno działać **max 5 sekund**
- Jeśli widoki nie istnieją → używa fallback user data
- Aplikacja **NIE ZAWIESZA SIĘ**

---

## ⚠️ ZNANE OGRANICZENIA (Tymczasowe)

### **Gdy widoki `v_workers` i `v_profiles` nie istnieją:**

❌ **Brak subscription data** - Użytkownik nie widzi swojego planu  
❌ **Brak worker-specific data** - Nie widać specialization, hourly_rate, itp.  
❌ **Niektóre komponenty mogą nie działać** - Jeśli polegają na worker data

**Ale:**
✅ **Logowanie działa** (max 5s timeout)  
✅ **Aplikacja się nie zawiesza**  
✅ **Użytkownik widzi podstawowe info**

---

## 🎯 DOCELOWA NAPRAWA (ZALECANE)

### **Utwórz widoki w Supabase:**

1. **Otwórz SQL Editor:**  
   https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql/new

2. **Skopiuj plik:**  
   `CREATE_VIEWS_WORKERS_PROFILES.sql` (110 linii)

3. **Wklej i kliknij RUN**

4. **Sprawdź wynik:**
   ```
   ✅ Views created successfully!
   profiles_count: X
   workers_count: Y
   ```

**Po utworzeniu widoków:**
- Pełne dane profilu będą ładowane
- Subscription status będzie widoczny
- Wszystkie komponenty będą działać poprawnie
- Timeout nadal chroni przed zawieszaniem

---

## 📊 STATUS

| Problem | Status | Rozwiązanie |
|---------|--------|-------------|
| Zawieszanie przy logowaniu | ✅ FIXED | Timeout 5s + fallback data |
| Error handling | ✅ FIXED | try/catch dla worker data |
| Brak widoków v_workers | ⚠️ WORKAROUND | Działa bez widoków, ale zalecane utworzenie |
| localStorage cleanup | ⏳ MANUAL | User musi wyczyścić raz (localStorage.clear()) |

---

## 🔍 DEBUGGING

Jeśli nadal są problemy, sprawdź Console (F12):

**Normalny flow (bez widoków):**
```
⚠️ Could not fetch worker subscription data: [error]
⚠️ Error mapping user (timeout or error): Auth timeout
✅ User logged in with fallback data: { id, email, role }
```

**Normalny flow (z widokami):**
```
✅ User profile loaded successfully
✅ Worker subscription: basic / active
```

---

## 📋 NASTĘPNE KROKI

1. ✅ Wyczyść localStorage (`localStorage.clear()`)
2. ✅ Odśwież stronę (Ctrl+F5)
3. ✅ Zaloguj się - powinno działać max 5s
4. ⏳ (Opcjonalne) Utwórz widoki w Supabase dla pełnej funkcjonalności
5. ⏳ Testuj payment flow

---

**Potrzebujesz pomocy?** Napisz jeśli:
- Nadal się zawiesza (pokaż Console F12)
- Błędy po zalogowaniu
- Nie wiesz jak utworzyć widoki
