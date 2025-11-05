# EMPLOYER PROFILE SETUP - Implementation Steps

## 🎯 Problem
Employer dashboard pokazuje szkielet bo:
- Rejestracja tworzy tylko podstawowe dane (company_name, email, phone)
- Brakuje: logo, website, description, KVK, industry, location
- Nie ma UI do edycji profilu po rejestracji

## ✅ Rozwiązanie
Stworzyliśmy **EmployerProfileSetup** page gdzie employer może uzupełnić profil.

---

## 📋 KROK PO KROKU

### 1. Wykonaj SQL - Dodaj kolumnę `profile_completed`
```bash
# W Supabase SQL Editor wykonaj:
sql/add-profile-completed-column.sql
```

**Co robi:**
- Dodaje kolumnę `profile_completed BOOLEAN` do tabeli `employers`
- Ustawia `FALSE` dla wszystkich istniejących employerów
- Pozwala śledzić czy profil jest ukończony

**Rezultat:**
```sql
id | company_name | profile_completed | has_logo | has_website
---|--------------|-------------------|----------|------------
e15... | Test Employer | false | false | false
8a1... | lenavalentinaaa | false | false | false
```

---

### 2. Wykonaj SQL - Stwórz Storage Bucket dla Logo
```bash
# W Supabase SQL Editor wykonaj:
sql/create-company-logos-bucket.sql
```

**Co robi:**
- Tworzy bucket `company-logos` w Supabase Storage
- Ustawia jako `public: true` (obrazki widoczne publicznie)
- Dodaje RLS policies:
  - ✅ Każdy może **czytać** logo (public read)
  - ✅ Authenticated może **uploadować** logo
  - ✅ Owner może **edytować/usuwać** swoje logo

**Rezultat:**
```
Bucket: company-logos
Public: true
Policies: 4 (SELECT, INSERT, UPDATE, DELETE)
```

---

### 3. Test Flow

#### A. Zaloguj się jako Employer
```
Email: test-employer@example.com
Hasło: (twoje hasło)
```

#### B. Po zalogowaniu automatycznie przekieruje do:
```
/employer/profile-setup
```

**Dlaczego?**
- EmployerDashboard sprawdza `employer.profile_completed`
- Jeśli `false` → redirect do `/employer/profile-setup`
- Jeśli `true` → pokazuje dashboard

#### C. Wypełnij Formularz Profile Setup
Formularz zawiera:
- ✅ **Logo Upload** → Supabase Storage bucket `company-logos`
- ✅ **Bedrijfsnaam** (Company Name) - wymagane
- ✅ **KVK Nummer** - opcjonalne
- ✅ **Branche** (Industry) - dropdown: Bouw, IT, Horeca, Zorg, etc.
- ✅ **Stad** (City) - wymagane
- ✅ **Telefoonnummer** - opcjonalne
- ✅ **Website** - opcjonalne (https://...)
- ✅ **Bedrijfsomschrijving** - textarea

#### D. Po Submit:
1. Uploaduje logo do Supabase Storage
2. UPDATE employers SET:
   - `company_name`
   - `kvk_number`
   - `industry`
   - `location_city`
   - `phone`
   - `website`
   - `description`
   - `logo_url`
   - `profile_completed = TRUE` ← **KLUCZOWE!**
3. Redirect → `/employer` (EmployerDashboard)
4. Dashboard teraz pokaże **pełne dane** zamiast szkieletu

---

## 🗂️ Pliki Stworzone

### 1. `pages/employer/EmployerProfileSetup.tsx`
- Multi-field form do uzupełnienia profilu
- Logo upload z preview
- Validation (required fields: company_name, location_city)
- Auto-redirect po submit

### 2. `sql/add-profile-completed-column.sql`
- Dodaje kolumnę tracking completion

### 3. `sql/create-company-logos-bucket.sql`
- Tworzy Storage bucket + RLS policies

### 4. `App.tsx` (zmodyfikowany)
- Dodany lazy import: `EmployerProfileSetup`
- Dodany route: `/employer/profile-setup`

### 5. `pages/employer/EmployerDashboard.tsx` (zmodyfikowany)
- Dodany `useNavigate`
- Check: `if (employer.profile_completed === false) → redirect`

---

## 🧪 Testing Checklist

### Pre-Test Setup
- [ ] Execute `add-profile-completed-column.sql`
- [ ] Execute `create-company-logos-bucket.sql`
- [ ] Verify bucket exists in Supabase Storage UI
- [ ] Restart dev server (`npm run dev`)

### Test Flow
- [ ] Login as employer (test-employer@example.com)
- [ ] Should auto-redirect to `/employer/profile-setup`
- [ ] Upload logo (PNG/JPG max 5MB)
- [ ] See logo preview appear
- [ ] Fill company name (required)
- [ ] Fill city (required)
- [ ] Fill optional fields (KVK, phone, website, description)
- [ ] Select industry from dropdown
- [ ] Click "Profiel Voltooien"
- [ ] Should redirect to `/employer`
- [ ] Dashboard shows **real data** (not skeleton)
- [ ] Company logo displays in dashboard
- [ ] All profile fields populated

### Edge Cases
- [ ] Try uploading >5MB file → error message
- [ ] Try uploading non-image → error message
- [ ] Submit without company_name → validation error
- [ ] Submit without city → validation error
- [ ] Logout → Login again → should go straight to dashboard (profile_completed=true)

---

## 🐛 Troubleshooting

### Dashboard Still Shows Skeleton After Setup
**Check:**
```sql
SELECT profile_completed, logo_url, website, description 
FROM employers 
WHERE profile_id = 'YOUR_USER_ID';
```
**Fix:** Make sure `profile_completed = TRUE` after submit

---

### Logo Upload Fails
**Check:**
```sql
SELECT id, public FROM storage.buckets WHERE id = 'company-logos';
```
**Fix:** Execute `create-company-logos-bucket.sql` again

---

### Redirect Loop
**Check:** `employer.profile_completed` value in database
**Fix:** 
```sql
UPDATE employers SET profile_completed = FALSE WHERE id = 'employer_id';
```
Then test setup flow again

---

## 📊 Database Changes

### Before
```sql
employers:
- company_name: 'Test Employer'
- kvk_number: ''  ← empty
- industry: 'other'  ← default
- location_city: ''  ← empty
- logo_url: NULL
- website: NULL
- description: NULL
```

### After Profile Setup
```sql
employers:
- company_name: 'Test Employer BV'
- kvk_number: '12345678'  ← filled
- industry: 'construction'  ← selected
- location_city: 'Amsterdam'  ← filled
- logo_url: 'https://supabase.co/storage/company-logos/...'  ← uploaded
- website: 'https://test-employer.nl'  ← filled
- description: 'Wij zijn een bouwbedrijf...'  ← filled
- profile_completed: TRUE  ← completed!
```

---

## 🚀 Next Steps (After This Works)

1. **Worker Avatar Upload** - Similar flow for workers
2. **Employer Job Posting** - Create job form with all fields
3. **Admin Statistics** - Replace fake data with real queries
4. **Storage Policies** - Add certificates bucket

---

## ✅ Success Criteria

Profile setup is complete when:
- ✅ Employer can upload logo
- ✅ Logo displays in dashboard
- ✅ All profile fields save correctly
- ✅ `profile_completed` set to `TRUE`
- ✅ No more skeleton dashboard
- ✅ Redirect works both ways (incomplete → setup, complete → dashboard)

---

**Status:** 🟢 Ready to Test
**Execute:** 2 SQL files, then test login flow
