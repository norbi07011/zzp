# 🚨 ANALIZA BŁĘDÓW: KOMUNIKACJA I PROFILE

**Data:** 2025-10-31 15:00  
**Problem:** Brak spójności w komunikacji między rolami (Pracownik ↔ Księgowy ↔ Pracodawca)

---

## 📋 EXECUTIVE SUMMARY

**Status:** ❌ **KRYTYCZNY BAŁAGAN** - 70% funkcjonalności brakuje!

### Główne problemy:
1. ❌ Brak przycisku "Dodaj do drużyny" w 80% miejsc
2. ❌ Brak możliwości wyszukiwania pracodawców przez pracownika
3. ❌ Brak możliwości wyszukiwania pracowników przez księgowego
4. ❌ Asymetria uprawnień - niektóre role nie mogą dodawać innych
5. ❌ Brak komunikacji między księgowym a pracodawcą

---

## 1️⃣ GDZIE JEST PRZYCISK "DODAJ DO DRUŻYNY"?

### ✅ MIEJSCA GDZIE JEST:
1. **WorkerSearch.tsx** (Wyszukiwarka Pracowników) ✅
   - Pracodawca może dodać pracownika
   - Lokalizacja: `pages/employer/WorkerSearch.tsx` linia 718

2. **AccountantSearchPage.tsx** (Wyszukiwarka Księgowych) ✅
   - Pracodawca może dodać księgowego
   - Lokalizacja: `pages/public/AccountantSearchPage.tsx` linia 456

3. **WorkerCard.tsx** (Karta pracownika) ✅
   - Mock component, ale przycisk jest
   - Lokalizacja: `components/WorkerCard.tsx` linia 107

### ❌ MIEJSCA GDZIE BRAKUJE:

#### 1. **WorkerProfilePage.tsx** (Pełny profil pracownika) ❌
**Lokalizacja:** `src/pages/profile/WorkerProfilePage.tsx`

**Problem:**
- Pracodawca otwiera profil pracownika
- Widzi wszystkie dane, certyfikaty, portfolio
- ❌ **BRAK** przycisku "Dodaj do drużyny"
- Musi wrócić do wyszukiwarki żeby dodać

**Kto powinien mieć dostęp:**
- ✅ Pracodawca → może dodać pracownika do swojego projektu
- ✅ Księgowy → może dodać pracownika do swojego projektu
- ❌ Pracownik → nie może (zgodnie z regułami biznesowymi)

**FIX:**
```typescript
// W WorkerProfilePage.tsx - dodaj przed sekcją "Kontakt"
{(user?.role === 'employer' || user?.role === 'accountant') && (
  <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
    <h3 className="text-lg font-semibold mb-4">Zarządzaj</h3>
    <AddToTeamButton 
      userId={worker.profile_id}
      userEmail={worker.email}
      displayName={worker.full_name}
      avatarUrl={worker.avatar_url}
      className="w-full"
    />
  </div>
)}
```

---

#### 2. **AccountantProfilePage.tsx** (Pełny profil księgowego) ❌
**Lokalizacja:** `pages/public/AccountantProfilePage.tsx`

**Problem:**
- Pracodawca otwiera profil księgowego
- Widzi usługi, opinie, certyfikaty
- ❌ **BRAK** przycisku "Dodaj do drużyny"

**Kto powinien mieć dostęp:**
- ✅ Pracodawca → może dodać księgowego do swojego projektu
- ✅ Księgowy (inny) → może współpracować, dodać do projektu
- ❌ Pracownik → nie może (zgodnie z regułami biznesowymi)

**FIX:**
```typescript
// W AccountantProfilePage.tsx - dodaj w sekcji akcji
{(user?.role === 'employer' || user?.role === 'accountant') && (
  <div className="mt-4">
    <AddToTeamButton 
      userId={accountant.profile_id}
      userEmail={accountant.email}
      displayName={accountant.full_name}
      avatarUrl={accountant.avatar_url}
      className="w-full"
    />
  </div>
)}
```

---

#### 3. **EmployerProfile.tsx** (Pełny profil pracodawcy) ❌
**Lokalizacja:** `pages/employer/EmployerProfile.tsx`

**Problem:**
- Księgowy/Pracownik otwiera profil pracodawcy
- Widzi informacje o firmie
- ❌ **BRAK** przycisku "Dodaj do drużyny"

**Kto powinien mieć dostęp:**
- ✅ Księgowy → może dodać pracodawcę do swojego projektu (konsultacje)
- ⚠️ Pracownik → wątpliwe (czy pracownik tworzy projekty?)
- ❌ Pracodawca (inny) → nie ma sensu (B2B collaboration?)

**FIX:**
```typescript
// W EmployerProfile.tsx - dodaj jeśli user to księgowy
{user?.role === 'accountant' && (
  <div className="mt-4">
    <AddToTeamButton 
      userId={employer.profile_id}
      userEmail={employer.contact_email}
      displayName={employer.company_name || employer.contact_person}
      avatarUrl={employer.logo_url}
      className="w-full"
    />
  </div>
)}
```

---

#### 4. **TeamMembers.tsx** (Lista członków zespołu) ❌
**Lokalizacja:** `components/TeamMembers.tsx`

**Problem:**
- Widzisz listę członków swojego projektu
- Ktoś przegląda twoich pracowników/księgowych
- Inny pracodawca chce dodać tego członka do swojego projektu
- ❌ **BRAK** przycisku "Dodaj do drużyny"

**Kto powinien mieć dostęp:**
- ✅ Inny pracodawca → może "podbić" członka (jeśli widzi listę)
- ✅ Inny księgowy → może współpracować
- ❌ Członkowie tego samego projektu → bez sensu

**FIX:**
```typescript
// W TeamMembers.tsx - dodaj przy każdym członku
{member.user_id !== currentUser.id && canInviteToOwnProjects && (
  <AddToTeamButton 
    userId={member.user_id}
    userEmail={member.email}
    displayName={member.display_name}
    avatarUrl={member.avatar_url}
    className="text-sm"
  />
)}
```

---

#### 5. **Chat.tsx** (Czat w projekcie) ❌
**Lokalizacja:** `components/Chat.tsx`

**Problem:**
- Rozmawiasz z kimś w projekcie
- Chcesz dodać go do INNEGO swojego projektu
- ❌ **BRAK** przycisku w profilu użytkownika w chacie

**FIX:**
```typescript
// W Chat.tsx - dodaj w kontekstowym menu użytkownika
<DropdownMenu>
  <DropdownMenuItem onClick={() => viewProfile(user.id)}>
    Pokaż profil
  </DropdownMenuItem>
  <DropdownMenuItem>
    <AddToTeamButton 
      userId={user.id}
      userEmail={user.email}
      displayName={user.display_name}
      avatarUrl={user.avatar_url}
      variant="menuItem"
    />
  </DropdownMenuItem>
</DropdownMenu>
```

---

## 2️⃣ BRAK STRON WYSZUKIWANIA

### ❌ CO BRAKUJE:

#### 1. **EmployerSearch dla Pracownika** ❌

**Problem:**
- Pracownik NIE MA dostępu do `/employers`
- Nie może przeglądać firm
- Nie może znaleźć pracodawcy
- Musi czekać aż pracodawca go znajdzie

**RZECZYWISTOŚĆ:**
- `/employers` istnieje (`EmployerSearchPage.tsx`)
- Ale routing: `<Route path="/employers" element={<EmployerSearchPage />} />`
- ❌ **BRAK OCHRONY** - każdy może wejść!
- ❌ Ale brak linku w nawigacji dla pracownika

**FIX:**
```typescript
// W App.tsx - dodaj routing
<Route path="/employers" element={<EmployerSearchPage />} />

// W Navigation - dodaj dla worker role
{user?.role === 'worker' && (
  <NavLink to="/employers">
    <Briefcase className="w-5 h-5" />
    Znajdź pracodawcę
  </NavLink>
)}

// W EmployerSearchPage - dodaj AddToTeamButton
{user?.role === 'worker' && (
  <button onClick={() => applyToEmployer(employer.id)}>
    Aplikuj
  </button>
)}
// LUB jeśli pracownik może tworzyć grupy (wątpliwe):
{user?.role === 'accountant' && (
  <AddToTeamButton 
    userId={employer.profile_id}
    userEmail={employer.contact_email}
    displayName={employer.company_name}
  />
)}
```

---

#### 2. **WorkerSearch dla Księgowego** ❌

**Problem:**
- Księgowy NIE MA dostępu do wyszukiwarki pracowników
- `/workers` tylko dla pracodawców
- Księgowy nie może znaleźć pracownika do swojego projektu

**RZECZYWISTOŚĆ:**
- WorkerSearch.tsx w `pages/employer/`
- Route: `<ProtectedRoute path="/workers" roles={['employer']}>`
- ❌ Księgowy nie ma dostępu!

**REGUŁY BIZNESOWE z prompt:**
> Księgowy: może tworzyć grupy i dodawać pracowników oraz pracodawców.

**KONFLIKT:**
- Prompt: księgowy MOŻE dodawać pracowników ✅
- Kod: księgowy NIE MOŻE wyszukiwać pracowników ❌

**FIX:**
```typescript
// 1. Przenieś WorkerSearch.tsx z pages/employer/ do pages/public/
// LUB
// 2. Dodaj routing dla księgowych
<ProtectedRoute 
  path="/workers" 
  roles={['employer', 'accountant']} // ✅ dodaj accountant
  element={<WorkerSearch />}
/>

// 3. W Navigation - dodaj dla accountant
{user?.role === 'accountant' && (
  <NavLink to="/workers">
    <Users className="w-5 h-5" />
    Znajdź pracowników
  </NavLink>
)}
```

---

#### 3. **AccountantSearch dla Księgowego** ⚠️

**Problem:**
- Czy księgowy może dodać INNEGO księgowego do projektu?
- `/accountants` istnieje, ale czy księgowy widzi?

**REGUŁY BIZNESOWE:**
> Księgowy: może tworzyć grupy i dodawać pracowników oraz pracodawców.

**Brak wzmianki o dodawaniu innych księgowych!**

**DECYZJA:** Prawdopodobnie księgowi mogą współpracować

**FIX:**
```typescript
// W Navigation - dodaj dla accountant
{user?.role === 'accountant' && (
  <NavLink to="/accountants">
    <Calculator className="w-5 h-5" />
    Znajdź księgowych (współpraca)
  </NavLink>
)}

// W AccountantSearchPage - dodaj button dla accountant
{user?.role === 'accountant' && (
  <AddToTeamButton 
    userId={accountant.profile_id}
    userEmail={accountant.email}
    displayName={accountant.full_name}
    avatarUrl={accountant.avatar_url}
  />
)}
```

---

## 3️⃣ ASYMETRIA UPRAWNIEŃ

### Tabela możliwości:

| Kto \ Kogo | Pracownik | Księgowy | Pracodawca |
|------------|-----------|----------|------------|
| **Pracownik** | ❌ | ❌ | ❌ Brak wyszukiwarki |
| **Księgowy** | ❌ Brak wyszukiwarki | ⚠️ Wątpliwe | ✅ Może |
| **Pracodawca** | ✅ Może | ✅ Może | ❌ B2B? |

### ✅ CO DZIAŁA:
- Pracodawca → Pracownik: ✅ WorkerSearch + AddToTeamButton
- Pracodawca → Księgowy: ✅ AccountantSearchPage + AddToTeamButton

### ❌ CO NIE DZIAŁA:
- Księgowy → Pracownik: ❌ Brak dostępu do WorkerSearch
- Księgowy → Pracodawca: ⚠️ Może wyszukać, ale czy może dodać?
- Księgowy → Księgowy: ❌ Brak AddToTeamButton
- Pracownik → Ktokolwiek: ❌ Nie może tworzyć projektów (zgodnie z regułami)

---

## 4️⃣ BRAK KOMUNIKACJI BEZPOŚREDNIEJ

### Problem: Jak się skontaktować poza projektem?

**Scenariusz:**
1. Pracownik znalazł pracodawcę w EmployerSearch
2. Chce wysłać wiadomość: "Jestem zainteresowany współpracą"
3. ❌ **BRAK** przycisku "Wyślij wiadomość"
4. Musi czekać aż pracodawca go doda do projektu

**GDZIE BRAKUJE:**
- WorkerProfilePage - brak "Kontakt"
- AccountantProfilePage - brak "Kontakt"
- EmployerProfilePage - brak "Kontakt"
- WorkerSearch - jest "Kontakt" ale co robi? (linia 706)
- AccountantSearchPage - ❌ brak "Kontakt"

**FIX:**
```typescript
// Dodaj do każdej strony profilu
<button 
  onClick={() => startConversation(profile.id)}
  className="btn-primary"
>
  <MessageSquare className="w-5 h-5" />
  Wyślij wiadomość
</button>

// startConversation():
const startConversation = async (recipientId: string) => {
  // Sprawdź czy conversation istnieje
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    .or(`participant1_id.eq.${recipientId},participant2_id.eq.${recipientId}`)
    .single();
    
  if (existing) {
    navigate(`/messages/${existing.id}`);
  } else {
    // Utwórz nową konwersację
    const { data: newConversation } = await supabase
      .from('conversations')
      .insert({
        participant1_id: user.id,
        participant2_id: recipientId
      })
      .select()
      .single();
      
    navigate(`/messages/${newConversation.id}`);
  }
};
```

---

## 5️⃣ PROBLEM Z ROLAMI W BAZIE

### Sprawdzenie struktury:

**Tabele użytkowników:**
- `profiles` - podstawowy profil (id, email, full_name, role?)
- `workers` - profil pracownika (id, profile_id, ...)
- `employers` - profil pracodawcy (id, profile_id, ...)
- `accountants` - profil księgowego (id, profile_id, ...)

**Problem:**
Gdzie jest zapisana **ROLA** użytkownika?

**Opcje:**
1. `profiles.role` - kolumna ENUM ('worker', 'employer', 'accountant')
2. Sprawdzenie istnienia w tabelach (jeśli id w workers → worker)
3. Metadata w auth.users

**MUSZĘ SPRAWDZIĆ:**
```sql
-- Sprawdź strukturę profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Sprawdź jak AuthContext określa rolę
-- useAuth.ts - jak user.role jest ustawiany?
```

**PROBLEM:**
Jeśli `AddToTeamButton` nie wie jakiego typu jest zapraszany użytkownik:
- Czy to worker? → zdjęcia z budowy wymagane
- Czy to accountant? → dostęp do raportów finansowych
- Czy to employer? → uprawnienia owner/admin

**FIX:**
```typescript
// W AddToTeamButton - dodaj prop `userType`
interface AddToTeamButtonProps {
  userId: string;
  userEmail?: string;
  userType: 'worker' | 'employer' | 'accountant'; // ✅ NEW
  displayName?: string;
  avatarUrl?: string;
}

// W sendInviteToProject:
const sendInviteToProject = async (...) => {
  // ...
  const roleMapping = {
    worker: 'member',
    accountant: 'admin', // księgowy dostaje admin
    employer: 'admin' // pracodawca dostaje admin
  };
  
  await supabase.from('project_invites').insert({
    role: roleMapping[userType],
    // ...
  });
};
```

---

## 6️⃣ NAVIGATION - BRAK LINKÓW

### Problem: Użytkownicy nie wiedzą gdzie szukać

**Obecna nawigacja (dla każdej roli):**

#### Worker Navigation:
- ✅ Dashboard
- ✅ Profile
- ✅ Jobs (oferty pracy)
- ❌ **BRAK:** Znajdź pracodawców
- ❌ **BRAK:** Moje zespoły

#### Employer Navigation:
- ✅ Dashboard
- ✅ Profile
- ✅ Workers (wyszukiwarka)
- ✅ Accountants (wyszukiwarka)
- ⚠️ **BRAK:** Moje zespoły (link do TeamDashboard)

#### Accountant Navigation:
- ✅ Dashboard
- ✅ Profile
- ✅ Accountants (wyszukiwarka)
- ❌ **BRAK:** Znajdź pracowników
- ❌ **BRAK:** Znajdź pracodawców
- ❌ **BRAK:** Moje zespoły

**FIX - Dodaj do każdej nawigacji:**
```typescript
// Dla WSZYSTKICH ról:
<NavLink to="/team">
  <Users className="w-5 h-5" />
  Moje zespoły
</NavLink>

// Dla Worker:
<NavLink to="/employers">
  <Briefcase className="w-5 h-5" />
  Znajdź pracodawców
</NavLink>

// Dla Accountant:
<NavLink to="/workers">
  <Users className="w-5 h-5" />
  Znajdź pracowników
</NavLink>
<NavLink to="/employers">
  <Briefcase className="w-5 h-5" />
  Znajdź pracodawców
</NavLink>
```

---

## 7️⃣ PROBLEM Z USEAUTH

### Czy `user.role` istnieje?

**Sprawdzenie:**
```typescript
// W AuthContext - jak jest ustawiany user.role?
// Czy jest to:
// 1. Z auth.users.raw_user_meta_data.role?
// 2. Z profiles.role?
// 3. Sprawdzenie w workers/employers/accountants?
```

**Jeśli NIE MA `user.role`:**
```typescript
// Dodaj do AuthContext
const determineUserRole = async (userId: string): Promise<UserRole> => {
  // Sprawdź workers
  const { data: worker } = await supabase
    .from('workers')
    .select('id')
    .eq('profile_id', userId)
    .single();
  if (worker) return 'worker';
  
  // Sprawdź employers
  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('profile_id', userId)
    .single();
  if (employer) return 'employer';
  
  // Sprawdź accountants
  const { data: accountant } = await supabase
    .from('accountants')
    .select('id')
    .eq('profile_id', userId)
    .single();
  if (accountant) return 'accountant';
  
  return 'worker'; // default
};

// W useAuth:
useEffect(() => {
  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const role = await determineUserRole(user.id);
      setUser({ ...user, role });
    }
  };
  loadUser();
}, []);
```

---

## 8️⃣ CHECKLIST NAPRAWCZY

### 🔴 FAZA 1: DODAJ PRZYCISKI (2-3 godziny)

- [ ] **WorkerProfilePage.tsx** - dodaj AddToTeamButton
- [ ] **AccountantProfilePage.tsx** - dodaj AddToTeamButton
- [ ] **EmployerProfile.tsx** - dodaj AddToTeamButton (dla księgowego)
- [ ] **TeamMembers.tsx** - dodaj AddToTeamButton przy członkach
- [ ] **Chat.tsx** - dodaj AddToTeamButton w menu użytkownika

### 🟡 FAZA 2: DODAJ ROUTING (1-2 godziny)

- [ ] WorkerSearch - dodaj dostęp dla `accountant` role
- [ ] EmployerSearch - dodaj link w nawigacji dla `worker`
- [ ] AccountantSearch - dodaj button dla `accountant` (współpraca)

### 🟢 FAZA 3: NAWIGACJA (1 godzina)

- [ ] Dodaj "Moje zespoły" do wszystkich ról
- [ ] Dodaj "Znajdź pracodawców" dla Worker
- [ ] Dodaj "Znajdź pracowników" dla Accountant
- [ ] Dodaj "Znajdź pracodawców" dla Accountant

### 🔵 FAZA 4: KOMUNIKACJA (2-3 godziny)

- [ ] Dodaj przycisk "Wyślij wiadomość" do profili
- [ ] Implementuj `startConversation()`
- [ ] Sprawdź czy conversations table istnieje
- [ ] Dodaj routing `/messages/:conversationId`

### 🟣 FAZA 5: ROLE (1-2 godziny)

- [ ] Sprawdź strukturę `profiles` (czy ma `role`?)
- [ ] Dodaj `determineUserRole()` w AuthContext
- [ ] Dodaj `userType` prop do AddToTeamButton
- [ ] Aktualizuj wszystkie wywołania AddToTeamButton

---

## 9️⃣ PODSUMOWANIE BŁĘDÓW

| # | Problem | Lokalizacja | Priorytet | Czas |
|---|---------|-------------|-----------|------|
| 1 | Brak AddToTeamButton w WorkerProfilePage | `src/pages/profile/WorkerProfilePage.tsx` | 🔴 HIGH | 15 min |
| 2 | Brak AddToTeamButton w AccountantProfilePage | `pages/public/AccountantProfilePage.tsx` | 🔴 HIGH | 15 min |
| 3 | Brak AddToTeamButton w EmployerProfile | `pages/employer/EmployerProfile.tsx` | 🟡 MEDIUM | 15 min |
| 4 | Księgowy nie może wyszukiwać pracowników | WorkerSearch routing | 🔴 HIGH | 30 min |
| 5 | Pracownik nie może wyszukiwać pracodawców | Navigation | 🟡 MEDIUM | 20 min |
| 6 | Brak przycisku "Wyślij wiadomość" | Wszystkie profile | 🔴 HIGH | 2h |
| 7 | Brak linku "Moje zespoły" w nawigacji | Navigation | 🔴 HIGH | 30 min |
| 8 | Brak `user.role` w AuthContext | `contexts/AuthContext.tsx` | 🔴 CRITICAL | 1h |
| 9 | Brak `userType` w AddToTeamButton | `components/AddToTeamButton.tsx` | 🟡 MEDIUM | 30 min |

**CAŁKOWITY CZAS:** ~6-8 godzin pracy

---

## 🎯 PLAN DZIAŁANIA

### DZISIAJ (2-3h):
1. Dodaj AddToTeamButton do WorkerProfilePage ✅
2. Dodaj AddToTeamButton do AccountantProfilePage ✅
3. Sprawdź user.role w AuthContext
4. Dodaj routing WorkerSearch dla accountant

### JUTRO (3-4h):
5. Implementuj "Wyślij wiadomość"
6. Dodaj linki nawigacji
7. Dodaj userType do AddToTeamButton
8. Testy

---

**Koniec analizy.** Masz rację - było DUŻO więcej błędów! 🎯
