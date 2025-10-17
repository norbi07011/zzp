# 📋 FAZA 3: IMPLEMENTATION PLAN - DASHBOARD & CORE FEATURES

**Status:** 🟢 W TRAKCIE (2/7 kroków ukończone - 28.6%)  
**Rozpoczęto:** Październik 2025  
**Cel:** Pełna platforma z dashboard, profilami, ofertami pracy, wiadomościami i płatnościami

---

## 🎯 OVERVIEW

FAZA 3 rozbudowuje platformę o wszystkie kluczowe funkcjonalności dla users (workers + companies):

1. ✅ **Dashboard** - statystyki, aktywność, szybkie akcje
2. ✅ **Profile Management** - edycja profili, umiejętności, weryfikacja
3. ⏳ **Job Management** - oferty pracy, aplikacje, search
4. 📅 **Messaging System** - chat, real-time, attachments
5. 📅 **Invoice & Payment** - faktury PDF, płatności, BTW
6. 📅 **Search & Filtering** - zaawansowane wyszukiwanie
7. 📅 **Admin Panel** - zarządzanie użytkownikami, moderacja

**Szacowany czas:** 40-50h pracy systematycznej

---

## ✅ KROK 3.1: DASHBOARD [COMPLETE]

**Status:** ✅ 100% UKOŃCZONE  
**Data:** Październik 2025  
**Dokumentacja:** `SESSION_DASHBOARD_COMPLETE.md`

### Zrealizowane:
- [x] DashboardService (API do statystyk)
- [x] StatCard component
- [x] RecentActivity component
- [x] QuickActions component
- [x] RevenueChart component
- [x] DashboardPage (kompletna strona)
- [x] Testy (100% passing)
- [x] Build: 0 errors

### Pliki:
- `src/services/dashboard.ts`
- `src/components/dashboard/` (4 komponenty)
- `src/pages/dashboard/DashboardPage.tsx`

---

## ✅ KROK 3.2: PROFILE MANAGEMENT [COMPLETE]

**Status:** ✅ 100% UKOŃCZONE  
**Data:** 8 października 2025  
**Dokumentacja:** `FAZA3_KROK3.2_PROFILE_COMPLETE.md`

### Zrealizowane:
- [x] ProfileService (CRUD operations, avatar upload)
- [x] ProfileForm component (worker profile editing)
- [x] SkillsEditor component (interactive skills management)
- [x] AvatarUpload component (drag & drop, validation)
- [x] WorkerProfilePage (complete page with tabs)
- [x] CompanyProfilePage (complete page with KvK verification)
- [x] Profile completion tracking (% progress)
- [x] Testy (12 nowych, 69/69 total passing)
- [x] Build: 0 errors

### Pliki (6 nowych, ~1,500 LOC):
- `src/services/profile.ts` (500 LOC)
- `src/components/profile/ProfileForm.tsx` (280 LOC)
- `src/components/profile/SkillsEditor.tsx` (170 LOC)
- `src/components/profile/AvatarUpload.tsx` (200 LOC)
- `src/pages/profile/WorkerProfilePage.tsx` (350 LOC)
- `src/pages/profile/CompanyProfilePage.tsx` (350 LOC)
- `src/tests/profile.test.ts` (350 LOC)

### Funkcjonalności:
- Worker profile editing (9 fields)
- Company profile editing (12 fields)
- Skills management (50+ popular skills, autocomplete)
- Avatar/Logo upload (max 5MB, JPEG/PNG/WebP)
- KvK verification system
- Profile completion tracking

---

## ⏳ KROK 3.3: JOB MANAGEMENT SYSTEM [NEXT]

**Status:** 📅 PLANNED  
**Priorytet:** HIGH  
**Szacowany czas:** 8-10h

### Zadania:

#### 1. JobService (~300 LOC)
**Plik:** `src/services/job.ts`

```typescript
// Funkcje:
- createJob(jobData) - tworzenie oferty (tylko companies)
- updateJob(jobId, updates) - aktualizacja oferty
- deleteJob(jobId) - usuwanie oferty
- getJobById(jobId) - szczegóły oferty
- getJobs(filters?) - lista ofert z filtrowaniem
- searchJobs(query, filters?) - wyszukiwanie

// Filters:
- specialization
- location (city)
- hourly_rate_min, hourly_rate_max
- employment_type (freelance, contract, permanent)
- remote_allowed (boolean)
- skills[] (array)
- status (active, closed, draft)
```

#### 2. ApplicationService (~200 LOC)
**Plik:** `src/services/application.ts`

```typescript
// Funkcje:
- applyForJob(jobId, workerId, coverLetter?) - aplikuj
- getApplicationsByWorker(workerId) - moje aplikacje
- getApplicationsByJob(jobId) - aplikacje do oferty
- updateApplicationStatus(id, status) - akceptuj/odrzuć
- withdrawApplication(id) - wycofaj aplikację

// Statuses:
- pending, accepted, rejected, withdrawn
```

#### 3. Components (~400 LOC)

**JobCard.tsx** (100 LOC)
- Wyświetlanie pojedynczej oferty (card)
- Company logo, title, location, rate
- Skills badges
- Apply button

**JobFilters.tsx** (150 LOC)
- Filtry (specialization, location, rate, remote)
- Search bar
- Sort options (date, rate, relevance)

**ApplicationCard.tsx** (100 LOC)
- Wyświetlanie aplikacji
- Status badge (pending/accepted/rejected)
- Actions (withdraw, view details)

**JobForm.tsx** (150 LOC)
- Formularz tworzenia/edycji oferty
- Validation
- Skills selector

#### 4. Pages (~600 LOC)

**JobListingPage.tsx** (200 LOC)
- Lista wszystkich ofert
- JobFilters + JobCard grid
- Pagination
- Empty state

**JobDetailPage.tsx** (200 LOC)
- Szczegóły oferty
- Company info
- Requirements
- Apply button (modal)
- Related jobs

**CreateJobPage.tsx** (200 LOC)
- Formularz dla companies
- JobForm component
- Preview
- Publish/Save as draft

**ApplicationsPage.tsx** (200 LOC)
- Lista aplikacji (workers: moje aplikacje, companies: aplikacje do ofert)
- Filter by status
- Bulk actions

#### 5. Testy (~300 LOC)
**Plik:** `src/tests/job.test.ts`

```typescript
// Test suites:
- JobService CRUD operations (5 tests)
- ApplicationService operations (5 tests)
- JobFilters component (3 tests)
- JobCard component (3 tests)
```

### Database Schema (SQL migration):
```sql
-- jobs table (już istnieje, sprawdź strukturę)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  specialization TEXT,
  location_city TEXT,
  hourly_rate_min DECIMAL,
  hourly_rate_max DECIMAL,
  employment_type TEXT,
  remote_allowed BOOLEAN DEFAULT false,
  skills TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, worker_id)
);

-- Indexes
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
```

### Routing:
```typescript
<Route path="/jobs" element={<JobListingPage />} />
<Route path="/jobs/:id" element={<JobDetailPage />} />
<Route path="/jobs/create" element={<CreateJobPage />} />
<Route path="/applications" element={<ApplicationsPage />} />
```

### Checklist:
- [ ] JobService
- [ ] ApplicationService
- [ ] JobCard component
- [ ] JobFilters component
- [ ] ApplicationCard component
- [ ] JobForm component
- [ ] JobListingPage
- [ ] JobDetailPage
- [ ] CreateJobPage
- [ ] ApplicationsPage
- [ ] Database migrations
- [ ] Testy (16+ testów)
- [ ] Build: 0 errors
- [ ] Dokumentacja

---

## 📅 KROK 3.4: MESSAGING SYSTEM

**Status:** 📅 PLANNED  
**Szacowany czas:** 8-10h

### Zadania:

#### 1. MessageService (~250 LOC)
```typescript
- sendMessage(recipientId, content, attachments?)
- getConversations(userId) - lista rozmów
- getMessages(conversationId) - wiadomości w rozmowie
- markAsRead(messageId)
- deleteMessage(messageId)
- searchMessages(query)
```

#### 2. Real-time Integration
- Supabase Realtime subscriptions
- New message notifications
- Typing indicators
- Online status

#### 3. Components (~500 LOC)
- **ConversationList** (150 LOC) - lista rozmów
- **MessageThread** (200 LOC) - okno czatu
- **MessageComposer** (100 LOC) - input + attachments
- **MessageBubble** (50 LOC) - pojedyncza wiadomość

#### 4. Pages (~300 LOC)
- **MessagingPage** (300 LOC) - split view (conversations + thread)

#### 5. File Attachments
- Upload do Supabase Storage
- Preview (images, PDF)
- Download functionality

### Database Schema:
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  participant_1 UUID REFERENCES profiles(id),
  participant_2 UUID REFERENCES profiles(id),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  attachments JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📅 KROK 3.5: INVOICE & PAYMENT FLOW

**Status:** 📅 PLANNED  
**Szacowany czas:** 6-8h

### Zadania:

#### 1. InvoiceService (~200 LOC)
```typescript
- generateInvoice(jobId, workerId, amount)
- getInvoices(userId)
- getInvoiceById(id)
- downloadInvoicePDF(id)
- sendInvoiceEmail(id)
```

#### 2. PDF Generation
- jsPDF library integration
- Invoice template (NL format)
- BTW calculation (21%)
- Company details + worker details

#### 3. Components (~300 LOC)
- **InvoiceGenerator** (150 LOC) - formularz generowania
- **InvoicePreview** (100 LOC) - podgląd przed generowaniem
- **InvoiceList** (50 LOC) - lista faktur

#### 4. Pages (~200 LOC)
- **InvoiceListPage** (100 LOC) - historia faktur
- **CreateInvoicePage** (100 LOC) - tworzenie faktury

#### 5. Stripe Integration
- Payment intents
- Checkout session
- Webhook handling (już istnieje)

### Database Schema:
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  worker_id UUID REFERENCES workers(id),
  company_id UUID REFERENCES companies(id),
  invoice_number TEXT UNIQUE,
  amount DECIMAL,
  vat_amount DECIMAL,
  total_amount DECIMAL,
  status TEXT DEFAULT 'draft',
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📅 KROK 3.6: SEARCH & FILTERING

**Status:** 📅 PLANNED  
**Szacowany czas:** 5-7h

### Zadania:

#### 1. SearchService (~200 LOC)
```typescript
- searchWorkers(query, filters)
- searchJobs(query, filters)
- searchCompanies(query, filters)
- saveSearch(userId, query, filters)
- getSavedSearches(userId)
```

#### 2. Advanced Filters
- Multi-select filters (skills, location, etc.)
- Range filters (rate, experience)
- Boolean filters (remote, verified)
- Sort options (relevance, date, rate)

#### 3. Components (~400 LOC)
- **SearchBar** (100 LOC) - autocomplete search
- **AdvancedFilters** (150 LOC) - filter panel
- **SearchResults** (100 LOC) - results grid
- **SavedSearches** (50 LOC) - saved searches list

#### 4. Pages (~300 LOC)
- **SearchPage** (300 LOC) - universal search

#### 5. Analytics
- Track popular searches
- Click-through rates
- Conversion tracking

---

## 📅 KROK 3.7: ADMIN PANEL EXPANSION

**Status:** 📅 PLANNED  
**Szacowany czas:** 8-10h

### Zadania:

#### 1. AdminService (~300 LOC)
```typescript
- getUsers(filters, pagination)
- updateUserStatus(userId, status) // approve, suspend
- deleteUser(userId)
- getReports(type, dateRange)
- moderateContent(contentId, action)
- getAuditLogs(filters)
```

#### 2. User Management
- List all users (workers + companies)
- Approve/Suspend/Delete actions
- Bulk operations
- User details modal

#### 3. Content Moderation
- Flagged content review
- Approve/Reject/Delete actions
- Moderation queue

#### 4. Reports & Analytics
- User growth charts
- Revenue reports
- Activity metrics
- Export to CSV/PDF

#### 5. System Settings
- Platform settings (fees, limits)
- Email templates
- Feature flags

#### 6. Audit Logs
- All admin actions logged
- Filter by user, action, date
- Export logs

### Components (~600 LOC):
- **UserManagement** (200 LOC)
- **ContentModeration** (150 LOC)
- **ReportsViewer** (150 LOC)
- **SystemSettings** (100 LOC)

### Pages (~400 LOC):
- **AdminUsersPage** (200 LOC)
- **AdminReportsPage** (200 LOC)

---

## 📊 PROGRESS TRACKING

### Overall FAZA 3:
```
✅ KROK 3.1: Dashboard              [100%] ████████████████████
✅ KROK 3.2: Profile Management     [100%] ████████████████████
⏳ KROK 3.3: Job Management         [  0%] ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
📅 KROK 3.4: Messaging System       [  0%] ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
📅 KROK 3.5: Invoice & Payment      [  0%] ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
📅 KROK 3.6: Search & Filtering     [  0%] ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
📅 KROK 3.7: Admin Panel            [  0%] ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
```

**FAZA 3 Completion:** 28.6% (2/7 kroków)

### Estimated Time Remaining:
- KROK 3.3: 8-10h
- KROK 3.4: 8-10h
- KROK 3.5: 6-8h
- KROK 3.6: 5-7h
- KROK 3.7: 8-10h

**Total:** ~35-45h

---

## 🎯 QUALITY STANDARDS

### Każdy KROK musi mieć:
- [x] Service layer (business logic)
- [x] Components (UI elements)
- [x] Pages (routing + layout)
- [x] Tests (minimum 80% coverage)
- [x] `npm run build` - 0 errors
- [x] `npm test` - 100% passing
- [x] Dokumentacja (raport ukończenia)

### Best Practices:
- TypeScript strict mode
- Error handling w każdym async/await
- Loading states w komponentach
- Responsive design (mobile-first)
- Accessibility (ARIA, labels)
- Security (input validation, XSS protection)

---

## 🚀 NEXT STEPS

### KROK 3.3: Job Management (START NOW!)

1. **Sprawdź istniejące tabele:**
   ```sql
   SELECT * FROM jobs LIMIT 1;
   SELECT * FROM applications LIMIT 1;
   ```

2. **Utwórz JobService:**
   - `src/services/job.ts`
   - Implementuj CRUD operations
   - Dodaj filtry i search

3. **Utwórz ApplicationService:**
   - `src/services/application.ts`
   - Apply/Withdraw/Update status

4. **Utwórz komponenty:**
   - JobCard, JobFilters, ApplicationCard, JobForm

5. **Utwórz strony:**
   - JobListingPage, JobDetailPage, CreateJobPage, ApplicationsPage

6. **Napisz testy:**
   - `src/tests/job.test.ts`
   - Minimum 16 testów

7. **Build & Test:**
   ```bash
   npm run build  # 0 errors expected
   npm test       # All tests passing
   ```

8. **Dokumentacja:**
   - `FAZA3_KROK3.3_JOB_MANAGEMENT_COMPLETE.md`

---

## 📝 NOTES

### Dependencies:
- Wszystkie dependencies już zainstalowane (React, Supabase, Tailwind)
- Nowe: jsPDF (dla faktur w KROK 3.5)

### Database:
- Schema już istnieje (sprawdź migrations/)
- RLS policies configured
- Indexes created

### Routing:
- React Router już skonfigurowany
- Dodaj nowe routes w `App.tsx`

---

**Last Updated:** 8 października 2025  
**Next Review:** Po ukończeniu KROK 3.3

🎯 **Cel: Ukończenie FAZA 3 = Pełna platforma gotowa do wdrożenia!**
