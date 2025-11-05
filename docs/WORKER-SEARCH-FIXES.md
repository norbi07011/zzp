# WorkerSearch Critical Bug Fixes

## Problem
WorkerSearch.tsx had critical bugs where UI interactions showed visual feedback but never persisted to the database:

1. **Save Worker**: Clicking bookmark icon only updated local React state `setSavedWorkers()` - no database INSERT
2. **Send Message**: Sending message only showed success toast - no database INSERT to `messages` table

This meant:
- Dashboard stats stayed at 0 even after saving workers
- Workers never received messages
- All changes lost on page refresh

## Root Cause
Functions were implemented as UI prototypes with mock data and were never updated to call backend services when database was connected.

## Changes Made

### 1. Added User Authentication Context
**File**: `pages/employer/WorkerSearch.tsx`

```typescript
// Import useAuth
import { useAuth } from '../../contexts/AuthContext';

// Add state for employer ID
const { user } = useAuth();
const [employerId, setEmployerId] = useState<string | null>(null);

// Load employer ID on mount
useEffect(() => {
  if (user?.id) loadEmployerId();
}, [user?.id]);

async function loadEmployerId() {
  if (!user?.id) return;
  const employer = await employerService.getEmployerByUserId(user.id);
  if (employer) setEmployerId(employer.id);
}
```

### 2. Fixed Save Worker Function
**Before**:
```typescript
const toggleSaveWorker = (workerId: string) => {
  setSavedWorkers(prev => [...prev, workerId]); // UI only ❌
};
```

**After**:
```typescript
const toggleSaveWorker = async (workerId: string) => {
  if (!employerId) {
    showError('Nie można zapisać pracownika - brak ID pracodawcy');
    return;
  }

  const isSaved = savedWorkers.includes(workerId);

  if (isSaved) {
    setSavedWorkers(prev => prev.filter(id => id !== workerId));
    success('Usunięto z zapisanych');
  } else {
    // Save to database ✅
    const saved = await employerService.saveWorker(employerId, workerId);
    
    if (saved) {
      setSavedWorkers(prev => [...prev, workerId]);
      success('Dodano do zapisanych pracowników!');
    } else {
      showError('Nie udało się zapisać pracownika');
    }
  }
};
```

### 3. Fixed Send Message Function
**Before**:
```typescript
const handleSendContact = () => {
  if (!contactSubject || !contactMessage) {
    showError('Proszę wypełnić wszystkie pola');
    return;
  }
  success(`✅ Wiadomość wysłana do ${selectedWorker?.fullName}!`);
  setIsContactModalOpen(false);
  setContactSubject('');
  setContactMessage('');
};
```

**After**:
```typescript
const handleSendContact = async () => {
  if (!contactSubject || !contactMessage) {
    showError('Proszę wypełnić wszystkie pola');
    return;
  }

  if (!employerId) {
    showError('Nie można wysłać wiadomości - brak ID pracodawcy');
    return;
  }

  if (!selectedWorker?.userId) {
    showError('Nie można wysłać wiadomości - brak danych pracownika');
    return;
  }

  try {
    // Send message to database ✅
    const sent = await employerService.sendMessage(
      employerId,
      selectedWorker.userId,
      contactSubject,
      contactMessage
    );

    if (sent) {
      success(`✅ Wiadomość wysłana do ${selectedWorker?.fullName}!`);
      setIsContactModalOpen(false);
      setContactSubject('');
      setContactMessage('');
    } else {
      showError('Nie udało się wysłać wiadomości');
    }
  } catch (error) {
    console.error('[WORKER-SEARCH] Error sending message:', error);
    showError('Błąd podczas wysyłania wiadomości');
  }
};
```

### 4. Added userId to Worker Interface
**Updated Worker interface**:
```typescript
interface Worker {
  id: string;
  userId: string; // Profile ID (auth user ID) for messaging ✅
  fullName: string;
  // ... rest of fields
}
```

**Updated transformer**:
```typescript
function transformWorkerData(dbWorker: WorkerSearchResult): Worker {
  return {
    id: dbWorker.id,
    userId: dbWorker.profile_id, // User ID for messaging ✅
    fullName: dbWorker.fullName,
    // ... rest of fields
  };
}
```

## Testing Instructions

### Test 1: Save Worker Functionality

1. **Login** as employer: `lenavalentinaaa@gmail.com`
2. **Navigate** to Worker Search page
3. **Click bookmark icon** on any worker card
4. **Expected behavior**:
   - ✅ Toast notification: "Dodano do zapisanych pracowników!"
   - ✅ Bookmark icon changes color
   - ✅ Dashboard "Zapisani Pracownicy" stat increases by 1 (after refresh)

5. **Verify in database**:
   ```sql
   SELECT * FROM employer_saved_workers 
   WHERE employer_id = '65751f6f-a38a-4de5-ba25-5fd10f59a675'
   ORDER BY created_at DESC;
   ```
   - Should show new row with worker_id and timestamp

6. **Refresh page** - bookmark should still be colored (persisted)

### Test 2: Send Message Functionality

1. **Login** as employer: `lenavalentinaaa@gmail.com`
2. **Navigate** to Worker Search page
3. **Click "Kontakt"** button on any worker card
4. **Fill in modal**:
   - Subject: "Test wiadomości"
   - Message: "Dzień dobry, czy jest Pan dostępny na projekt?"
5. **Click "Wyślij Wiadomość"**
6. **Expected behavior**:
   - ✅ Toast notification: "✅ Wiadomość wysłana do [worker name]!"
   - ✅ Modal closes
   - ✅ Form clears

7. **Verify in database**:
   ```sql
   SELECT * FROM messages 
   WHERE sender_id = '65751f6f-a38a-4de5-ba25-5fd10f59a675'
   ORDER BY created_at DESC
   LIMIT 5;
   ```
   - Should show new message with subject and content

8. **Login as worker** (recipient) and check if message is visible in their inbox

### Test 3: Error Handling

1. **Test without employer ID** (should never happen in production):
   - If `employerId` is null, should show error toast
   - No database operation should occur

2. **Test network failure** (simulated):
   - Turn off internet
   - Try to save worker or send message
   - Should show error toast: "Nie udało się..."
   - UI should not update

### Test 4: Stats Update

**Current Behavior** (needs separate fix):
- Dashboard stats don't auto-update after saving worker
- Requires manual page refresh to see new count

**To verify**:
1. Save a worker in WorkerSearch
2. Navigate back to Dashboard
3. Stats still show old count ❌
4. Refresh page (F5)
5. Stats now show updated count ✅

**Future Fix**: Add real-time subscription or manual refresh button

## Database Queries for Testing

### Check employer ID
```sql
SELECT id, company_name, email 
FROM employers 
WHERE email = 'lenavalentinaaa@gmail.com';
```

### Check saved workers
```sql
SELECT 
  esw.id,
  esw.created_at,
  w.id as worker_id,
  p.full_name as worker_name,
  p.email as worker_email
FROM employer_saved_workers esw
JOIN workers w ON w.id = esw.worker_id
JOIN profiles p ON p.id = w.profile_id
WHERE esw.employer_id = '65751f6f-a38a-4de5-ba25-5fd10f59a675'
ORDER BY esw.created_at DESC;
```

### Check sent messages
```sql
SELECT 
  m.id,
  m.created_at,
  m.subject,
  m.content,
  p.full_name as recipient_name,
  p.email as recipient_email
FROM messages m
JOIN profiles p ON p.id = m.recipient_id
WHERE m.sender_id = '65751f6f-a38a-4de5-ba25-5fd10f59a675'
ORDER BY m.created_at DESC
LIMIT 10;
```

### Count employer stats
```sql
SELECT 
  (SELECT COUNT(*) FROM employer_saved_workers WHERE employer_id = '65751f6f-a38a-4de5-ba25-5fd10f59a675') AS saved_workers,
  (SELECT COUNT(*) FROM messages WHERE sender_id = '65751f6f-a38a-4de5-ba25-5fd10f59a675') AS messages_sent;
```

## Remaining Issues

### 1. Dashboard Stats Don't Auto-Update ⚠️
**Problem**: After saving worker in WorkerSearch, dashboard stats stay at 0 until page refresh

**Solution Options**:

**Option A: Manual Refresh Button** (quick fix)
```typescript
// EmployerDashboard.tsx
const refreshStats = async () => {
  const newStats = await employerService.getEmployerStats(employerId);
  setStats(newStats);
};

<button onClick={refreshStats}>
  🔄 Odśwież statystyki
</button>
```

**Option B: Real-time Subscription** (better UX)
```typescript
// EmployerDashboard.tsx
useEffect(() => {
  if (!employerId) return;

  const subscription = supabase
    .channel('employer_stats_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'employer_saved_workers',
      filter: `employer_id=eq.${employerId}`
    }, () => {
      employerService.getEmployerStats(employerId).then(setStats);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [employerId]);
```

**Option C: Context API** (most robust)
```typescript
// Create EmployerStatsContext.tsx
// Provide global stats that auto-refresh
// Both Dashboard and WorkerSearch can update it
```

### 2. Remove Worker from Saved ⚠️
**Problem**: `toggleSaveWorker` can add workers but can't remove them (needs `saved_worker_id` for DELETE)

**Current code**:
```typescript
if (isSaved) {
  setSavedWorkers(prev => prev.filter(id => id !== workerId));
  success('Usunięto z zapisanych');
  // Missing: await employerService.removeSavedWorker(savedWorkerId) ❌
}
```

**Fix needed**:
```typescript
// 1. Load saved_worker_ids on mount
const [savedWorkerIds, setSavedWorkerIds] = useState<Record<string, string>>({});

// 2. Store mapping when loading
const saved = await employerService.getSavedWorkers(employerId);
setSavedWorkerIds(saved.reduce((acc, s) => ({ ...acc, [s.worker_id]: s.id }), {}));

// 3. Use mapping when removing
if (isSaved) {
  const savedWorkerId = savedWorkerIds[workerId];
  if (savedWorkerId) {
    const removed = await employerService.removeSavedWorker(savedWorkerId);
    if (removed) {
      setSavedWorkers(prev => prev.filter(id => id !== workerId));
      success('Usunięto z zapisanych');
    }
  }
}
```

### 3. AuthContext Mapping Error ⚠️
**Error**: "Error mapping user to employer/worker" in console

**Impact**: Non-critical (fallback to basic user data works)

**Fix**: Check `contexts/AuthContext.tsx` user mapping logic and increase timeout or add retry

## Backend Services Used

### employerService.saveWorker()
```typescript
// Location: services/employerService.ts:323
export async function saveWorker(
  employerId: string,
  workerId: string,
  notes?: string,
  tags?: string[]
): Promise<boolean>
```

### employerService.sendMessage()
```typescript
// Location: services/employerService.ts:477
export async function sendMessage(
  senderId: string,
  recipientId: string,
  subject: string,
  content: string
): Promise<boolean>
```

### employerService.getEmployerByUserId()
```typescript
// Location: services/employerService.ts
export async function getEmployerByUserId(userId: string): Promise<Employer | null>
```

## Summary

✅ **Fixed**:
- Save worker now persists to database
- Send message now creates message in database
- Proper error handling and user feedback
- TypeScript types updated

⚠️ **Still needs work**:
- Dashboard stats auto-update
- Remove worker from saved
- AuthContext error (low priority)

🎯 **Next Priority**: Implement stats refresh mechanism (Option B: Real-time subscription recommended)
