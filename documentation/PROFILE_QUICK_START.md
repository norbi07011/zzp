# 🚀 PROFILE MANAGEMENT - QUICK START GUIDE

**KROK 3.2 Complete!** Ten przewodnik pokazuje jak używać systemu zarządzania profilami.

---

## 📦 CO ZOSTAŁO DODANE?

### 1. ProfileService
Serwis do zarządzania profilami workers i companies.

**Import:**
```typescript
import profileService from './services/profile';
// lub pojedyncze funkcje:
import { getWorkerProfile, updateWorkerProfile } from './services/profile';
```

### 2. Komponenty UI
- **ProfileForm** - formularz edycji profilu worker
- **SkillsEditor** - interaktywny edytor umiejętności
- **AvatarUpload** - drag & drop upload avatarów/logo

### 3. Strony
- **WorkerProfilePage** - `/profile/worker`
- **CompanyProfilePage** - `/profile/company`

---

## 🎯 UŻYCIE

### Worker Profile

#### Pobieranie profilu:
```typescript
import { getWorkerProfile } from './services/profile';

const profile = await getWorkerProfile(userId);
console.log(profile.completion_percentage); // 85%
console.log(profile.skills); // ['React', 'TypeScript']
```

#### Aktualizacja profilu:
```typescript
import { updateWorkerProfile } from './services/profile';

const updated = await updateWorkerProfile(userId, {
  bio: 'Experienced React developer',
  hourly_rate: 85,
  availability_status: 'available'
});
```

#### Zarządzanie umiejętnościami:
```typescript
import { updateWorkerSkills } from './services/profile';

await updateWorkerSkills(userId, [
  'React',
  'TypeScript',
  'Node.js',
  'PostgreSQL'
]);
```

#### Upload avatara:
```typescript
import { uploadAvatar } from './services/profile';

const file = document.querySelector('input[type="file"]').files[0];
const { url, path } = await uploadAvatar(file, userId, 'worker');

// Następnie zaktualizuj profil:
await updateWorkerProfile(userId, { avatar_url: url });
```

---

### Company Profile

#### Pobieranie profilu:
```typescript
import { getCompanyProfile } from './services/profile';

const profile = await getCompanyProfile(userId);
console.log(profile.company_name); // "Tech BV"
console.log(profile.kvk_verified); // true
```

#### Aktualizacja profilu:
```typescript
import { updateCompanyProfile } from './services/profile';

const updated = await updateCompanyProfile(userId, {
  company_name: 'Tech Solutions BV',
  industry: 'IT',
  company_size: '11-50',
  website: 'https://techsolutions.nl'
});
```

#### Weryfikacja KvK:
```typescript
import { verifyCompanyKvK } from './services/profile';

const success = await verifyCompanyKvK(userId, '12345678');
if (success) {
  console.log('KvK verified!');
}
```

---

### Komponenty

#### ProfileForm (Worker):
```typescript
import ProfileForm from './components/profile/ProfileForm';
import { WorkerProfile } from './services/profile';

function MyPage() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);

  return (
    <ProfileForm
      profile={profile}
      onUpdate={(updated) => setProfile(updated)}
      onCancel={() => navigate('/dashboard')}
    />
  );
}
```

#### SkillsEditor:
```typescript
import SkillsEditor from './components/profile/SkillsEditor';

function MyPage() {
  const [skills, setSkills] = useState<string[]>([]);

  return (
    <SkillsEditor
      userId={userId}
      initialSkills={skills}
      onUpdate={(newSkills) => setSkills(newSkills)}
    />
  );
}
```

#### AvatarUpload:
```typescript
import AvatarUpload from './components/profile/AvatarUpload';

function MyPage() {
  return (
    <AvatarUpload
      userId={userId}
      currentAvatarUrl={profile.avatar_url}
      type="worker" // lub "company"
      onUpload={(url) => console.log('Uploaded:', url)}
    />
  );
}
```

---

### Routing

Dodaj do `App.tsx`:

```typescript
import WorkerProfilePage from './pages/profile/WorkerProfilePage';
import CompanyProfilePage from './pages/profile/CompanyProfilePage';

function App() {
  return (
    <Routes>
      {/* Existing routes... */}
      
      <Route path="/profile/worker" element={<WorkerProfilePage />} />
      <Route path="/profile/company" element={<CompanyProfilePage />} />
    </Routes>
  );
}
```

---

## 🔧 KONFIGURACJA

### Supabase Storage Bucket

Upewnij się, że bucket `avatars` istnieje:

```sql
-- W Supabase Dashboard: Storage > Create bucket
Bucket name: avatars
Public: true (lub skonfiguruj RLS policies)
```

### RLS Policies (opcjonalne)

Jeśli bucket jest private, dodaj policies:

```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read all avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## 📋 PRZYKŁADY

### Kompletny przykład: Worker Profile Page

```typescript
import React, { useState, useEffect } from 'react';
import { getWorkerProfile, WorkerProfile } from './services/profile';
import ProfileForm from './components/profile/ProfileForm';
import SkillsEditor from './components/profile/SkillsEditor';
import AvatarUpload from './components/profile/AvatarUpload';

export function MyWorkerProfile() {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = 'current-user-id'; // Get from auth context

  useEffect(() => {
    async function load() {
      const data = await getWorkerProfile(userId);
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      {/* Profile completion */}
      <div className="mb-6">
        <div className="text-sm text-gray-600">
          Profile {profile.completion_percentage}% complete
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${profile.completion_percentage}%` }}
          />
        </div>
      </div>

      {/* Avatar */}
      <div className="mb-8">
        <AvatarUpload
          userId={userId}
          currentAvatarUrl={profile.avatar_url}
          type="worker"
          onUpload={async (url) => {
            // Auto-update profile
            const updated = await updateWorkerProfile(userId, { avatar_url: url });
            setProfile(updated);
          }}
        />
      </div>

      {/* Profile form */}
      <div className="mb-8">
        <ProfileForm
          profile={profile}
          onUpdate={setProfile}
        />
      </div>

      {/* Skills */}
      <div className="mb-8">
        <SkillsEditor
          userId={userId}
          initialSkills={profile.skills}
          onUpdate={(skills) => setProfile({ ...profile, skills })}
        />
      </div>
    </div>
  );
}
```

---

## 🎨 STYLOWANIE

Wszystkie komponenty używają Tailwind CSS. Możesz customizować:

```typescript
// Zmień kolory w ProfileForm:
<button className="bg-purple-600 hover:bg-purple-700">
  Save
</button>

// Zmień rozmiar avatara w AvatarUpload:
<div className="w-48 h-48 rounded-full"> {/* zamiast w-32 h-32 */}
  {/* ... */}
</div>
```

---

## ⚠️ ERROR HANDLING

Wszystkie funkcje rzucają błędy, które możesz złapać:

```typescript
try {
  await updateWorkerProfile(userId, updates);
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to update profile:', error.message);
    // Show error to user
  }
}
```

Komponenty mają wbudowane error handling:

```typescript
// ProfileForm pokazuje error message automatycznie
<ProfileForm 
  profile={profile}
  onUpdate={setProfile}
  // Error wyświetli się w czerwonym boxie
/>
```

---

## 🧪 TESTOWANIE

### Uruchom testy:
```bash
npm test
```

### Mock dane dla testów:
```typescript
import { vi } from 'vitest';

vi.mock('./lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null
          })
        })
      })
    })
  }
}));
```

---

## 📱 RESPONSIVE DESIGN

Wszystkie komponenty są responsive:

- **Mobile:** Stack columns, full-width forms
- **Tablet:** 2-column grids
- **Desktop:** 3-column layouts, sticky sidebars

Testuj na różnych rozdzielczościach:

```typescript
// Tailwind breakpoints:
sm: 640px   // Phone landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

---

## 🔐 SECURITY

### File Upload:
- Client-side validation (typ, rozmiar)
- Server-side validation (Supabase Storage)
- Unique filenames (timestamp-based)

### Input Sanitization:
- Wszystkie inputy są escaped (React robi to automatycznie)
- Validacja długości stringów
- Whitelist dla select options

---

## 🚀 DEPLOYMENT

### Przed deploymentem:

1. **Sprawdź build:**
   ```bash
   npm run build
   ```

2. **Uruchom testy:**
   ```bash
   npm test
   ```

3. **Sprawdź Supabase:**
   - Bucket `avatars` utworzony
   - RLS policies skonfigurowane
   - Tabele `profiles`, `workers`, `companies` istnieją

4. **Environment variables:**
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

---

## ❓ FAQ

**Q: Jak zmienić max rozmiar avatara?**
A: W `profile.ts` zmień `MAX_FILE_SIZE = 5 * 1024 * 1024` na inną wartość.

**Q: Jak dodać nowe pole do profilu?**
A: 
1. Dodaj pole w `WorkerProfile` interface
2. Dodaj input w `ProfileForm`
3. Dodaj walidację w `updateWorkerProfile`
4. Zaktualizuj `calculateWorkerCompletion`

**Q: Czy mogę użyć innego storage provider?**
A: Tak, zmień implementację `uploadAvatar()` w `profile.ts`.

**Q: Jak dodać cropping do avatarów?**
A: Zainstaluj `react-image-crop` i dodaj przed upload.

---

## 📚 WIĘCEJ INFORMACJI

- **Pełna dokumentacja:** `FAZA3_KROK3.2_PROFILE_COMPLETE.md`
- **Plan implementacji:** `FAZA3_IMPLEMENTATION_PLAN.md`
- **Testy:** `src/tests/profile.test.ts`

---

**Last Updated:** 8 października 2025  
**Version:** 1.0.0

🎉 **Happy coding!**
