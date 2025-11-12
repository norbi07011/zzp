# 🚀 PLAN KSIĘGOWY - ROZBUDOWA 500% Z PEŁNĄ INTEGRACJĄ PANELI

## 📊 ANALIZA: CO BRAKUJE W OBECNYM PLANIE

### ❌ KRYTYCZNE BRAKI:
1. **Brak integracji z panelem pracodawcy** - employer nie może zlecać księgowości dla swoich ZZP-ów
2. **Brak integracji z panelem pracownika** - worker nie może wysyłać faktur/danych automatycznie
3. **Brak systemu fakturowania** - księgowy nie może wystawiać faktur
4. **Brak zarządzania dokumentami** - brak centralnego storage'u dla dokumentów klientów
5. **Brak kalendarza terminów** - brak przypomnienia o BTW, PIT, ZUS
6. **Brak raportów** - brak generowania PDF/Excel dla klientów
7. **Brak integracji zewnętrznych** - Belastingdienst, KVK, banki
8. **Brak systemu płatności** - subskrypcje, Mollie/Stripe
9. **Brak CRM** - zarządzanie klientami, pipeline, notatki
10. **Brak multi-user** - firmy księgowe potrzebują wielu użytkowników
11. **Brak analytics** - metryki biznesowe, revenue tracking
12. **Brak compliance** - GDPR, audit logs, 2FA, szyfrowanie

---

# 🎯 CZĘŚĆ 1: INTEGRACJA Z PANELEM PRACODAWCY

## 1.1 Employer → Accountant: Zlecanie księgowości

### Nowa tabela: `employer_accountant_contracts`
```sql
CREATE TABLE employer_accountant_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Typ umowy
  contract_type VARCHAR(50) NOT NULL, -- 'payroll', 'full_service', 'tax_only', 'custom'
  
  -- Zakres usług
  services TEXT[] NOT NULL, -- ['payroll', 'btw', 'jaarrekening', 'salarisadministratie']
  
  -- Finansowe
  monthly_fee DECIMAL(10,2),
  fee_per_worker DECIMAL(10,2), -- Opłata za każdego ZZP pracownika
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'quarterly', 'yearly'
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'paused', 'cancelled'
  
  -- Automatyzacja
  auto_sync_workers BOOLEAN DEFAULT true, -- Auto sync listy pracowników
  auto_sync_contracts BOOLEAN DEFAULT true, -- Auto sync umów
  auto_sync_payments BOOLEAN DEFAULT true, -- Auto sync płatności
  
  -- Permissions
  can_view_worker_data BOOLEAN DEFAULT true,
  can_generate_reports BOOLEAN DEFAULT true,
  can_approve_expenses BOOLEAN DEFAULT false,
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  next_billing_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_employer_accountant UNIQUE (employer_id, accountant_id)
);

CREATE INDEX idx_contracts_employer ON employer_accountant_contracts(employer_id);
CREATE INDEX idx_contracts_accountant ON employer_accountant_contracts(accountant_id);
CREATE INDEX idx_contracts_status ON employer_accountant_contracts(status);
```

### Nowa tabela: `payroll_batches` (Księgowanie pracowników przez pracodawcę)
```sql
CREATE TABLE payroll_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES employer_accountant_contracts(id),
  
  -- Okres
  period_month INTEGER NOT NULL, -- 1-12
  period_year INTEGER NOT NULL,
  
  -- Pracownicy
  worker_ids UUID[] NOT NULL, -- Lista worker_id
  total_workers INTEGER NOT NULL,
  
  -- Finansowe
  total_gross_amount DECIMAL(12,2), -- Suma brutto
  total_tax_amount DECIMAL(12,2), -- Suma podatków
  total_net_amount DECIMAL(12,2), -- Suma netto
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted', 'processing', 'approved', 'paid', 'rejected'
  
  -- Pliki
  data_export_url TEXT, -- JSON/CSV z danymi
  report_url TEXT, -- PDF raportu
  
  -- Notatki
  employer_notes TEXT,
  accountant_notes TEXT,
  
  -- Dates
  submitted_at TIMESTAMP,
  processed_at TIMESTAMP,
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payroll_employer ON payroll_batches(employer_id);
CREATE INDEX idx_payroll_accountant ON payroll_batches(accountant_id);
CREATE INDEX idx_payroll_period ON payroll_batches(period_year, period_month);
CREATE INDEX idx_payroll_status ON payroll_batches(status);
```

### UI dla Employer Dashboard:

#### Nowa zakładka: `💼 Księgowość`
```typescript
pages/employer/EmployerAccounting.tsx

Sekcje:
1. Mój księgowy:
   - Jeśli brak: "Znajdź księgowego" button → AccountantSearch
   - Jeśli jest: Card księgowego z danymi kontaktowymi
   - Status umowy (active/paused)
   - Usługi w ramach umowy
   - Koszt miesięczny

2. Payroll pracowników:
   - Przycisk "Wyślij dane pracowników do księgowego"
   - Modal: wybór miesiąca/roku
   - Auto-export listy pracowników z umowami i płatnościami
   - Preview danych przed wysłaniem
   - Historia wysłanych batch'y

3. Raporty:
   - Lista raportów od księgowego
   - Download PDF/Excel
   - Raporty: miesięczne, kwartalne, roczne

4. Dokumenty:
   - Shared folder z księgowym
   - Upload umów, faktur
   - Auto-sync

5. Koszty do zatwierdzenia:
   - Lista kosztów wymagających aprobaty
   - Approve/Reject
   - Komentarze
```

#### Service: `employerAccountingService.ts`
```typescript
// services/employerAccountingService.ts

export const employerAccountingService = {
  // Kontrakty
  async findAccountants(filters) { },
  async createContract(employerId, accountantId, contractData) { },
  async updateContract(contractId, updateData) { },
  async cancelContract(contractId, reason) { },
  async getActiveContract(employerId) { },
  
  // Payroll
  async createPayrollBatch(employerId, accountantId, periodMonth, periodYear) { },
  async getWorkerDataForPeriod(employerId, periodMonth, periodYear) { },
  async submitPayrollBatch(batchId) { },
  async getPayrollBatches(employerId, filters) { },
  async getBatchDetails(batchId) { },
  
  // Raporty
  async getReports(employerId) { },
  async downloadReport(reportId) { },
  
  // Dokumenty
  async uploadDocument(employerId, file, category) { },
  async getSharedDocuments(employerId) { },
  
  // Koszty
  async getPendingExpenses(employerId) { },
  async approveExpense(expenseId) { },
  async rejectExpense(expenseId, reason) { }
}
```

---

# 🎯 CZĘŚĆ 2: INTEGRACJA Z PANELEM PRACOWNIKA

## 2.1 Worker → Accountant: Auto-wysyłka faktur i danych

### Nowa tabela: `worker_accountant_assignments`
```sql
CREATE TABLE worker_accountant_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Zakres usług
  services TEXT[] NOT NULL, -- ['btw', 'jaarrekening', 'facturen', 'kosten']
  
  -- Finansowe
  monthly_fee DECIMAL(10,2),
  fee_per_invoice DECIMAL(10,2),
  
  -- Automatyzacja
  auto_send_invoices BOOLEAN DEFAULT true, -- Auto wysyłka faktur do księgowego
  auto_track_expenses BOOLEAN DEFAULT true, -- Auto tracking wydatków
  auto_send_contracts BOOLEAN DEFAULT true, -- Auto wysyłka umów
  
  -- Notifications
  notify_btw_deadline BOOLEAN DEFAULT true,
  notify_tax_deadline BOOLEAN DEFAULT true,
  notify_missing_documents BOOLEAN DEFAULT true,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  
  start_date DATE NOT NULL,
  end_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_worker_accountant UNIQUE (worker_id, accountant_id)
);

CREATE INDEX idx_assignments_worker ON worker_accountant_assignments(worker_id);
CREATE INDEX idx_assignments_accountant ON worker_accountant_assignments(accountant_id);
```

### Nowa tabela: `worker_invoices` (Faktury ZZP)
```sql
CREATE TABLE worker_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  accountant_id UUID REFERENCES accountants(id) ON DELETE SET NULL,
  
  -- Dane faktury
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Klient
  client_type VARCHAR(20) NOT NULL, -- 'employer', 'private', 'other'
  client_id UUID, -- employer_id jeśli client_type = 'employer'
  client_name VARCHAR(255) NOT NULL,
  client_kvk VARCHAR(50),
  client_address TEXT,
  
  -- Kwoty
  amount_excl_btw DECIMAL(10,2) NOT NULL,
  btw_rate DECIMAL(5,2) DEFAULT 21.00,
  btw_amount DECIMAL(10,2) NOT NULL,
  amount_incl_btw DECIMAL(10,2) NOT NULL,
  
  -- Opis
  description TEXT,
  line_items JSONB, -- Szczegółowe pozycje
  /*
  [
    { "description": "3 dni pracy - murarz", "quantity": 3, "unit_price": 450, "total": 1350 }
  ]
  */
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
  payment_status VARCHAR(50) DEFAULT 'unpaid', -- 'unpaid', 'partial', 'paid'
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMP,
  
  -- Pliki
  pdf_url TEXT, -- PDF faktury
  
  -- Synchronizacja z księgowym
  synced_to_accountant BOOLEAN DEFAULT false,
  synced_at TIMESTAMP,
  accountant_approved BOOLEAN DEFAULT false,
  accountant_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_worker ON worker_invoices(worker_id);
CREATE INDEX idx_invoices_accountant ON worker_invoices(accountant_id);
CREATE INDEX idx_invoices_status ON worker_invoices(status);
CREATE INDEX idx_invoices_date ON worker_invoices(invoice_date);
```

### Nowa tabela: `worker_expenses` (Koszty uzyskania przychodu)
```sql
CREATE TABLE worker_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  accountant_id UUID REFERENCES accountants(id),
  
  -- Dane wydatku
  expense_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'transport', 'tools', 'materials', 'software', 'training', 'other'
  description TEXT NOT NULL,
  
  -- Kwota
  amount DECIMAL(10,2) NOT NULL,
  btw_amount DECIMAL(10,2) DEFAULT 0,
  is_btw_deductible BOOLEAN DEFAULT false,
  
  -- Dowód zakupu
  receipt_url TEXT, -- Zdjęcie/PDF paragonu
  invoice_number VARCHAR(100),
  vendor_name VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'processed'
  
  -- Księgowy
  accountant_approved BOOLEAN DEFAULT false,
  accountant_notes TEXT,
  approved_at TIMESTAMP,
  
  -- Synchronizacja
  synced_to_accountant BOOLEAN DEFAULT false,
  synced_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_worker ON worker_expenses(worker_id);
CREATE INDEX idx_expenses_accountant ON worker_expenses(accountant_id);
CREATE INDEX idx_expenses_category ON worker_expenses(category);
CREATE INDEX idx_expenses_date ON worker_expenses(expense_date);
```

### UI dla Worker Dashboard:

#### Nowa zakładka: `💼 Księgowość`
```typescript
pages/worker/WorkerAccounting.tsx

Sekcje:
1. Mój księgowy:
   - Card księgowego
   - Zakres usług
   - Koszt miesięczny
   - "Znajdź księgowego" jeśli brak

2. Faktury:
   - Przycisk "Wystaw fakturę"
   - Lista faktur (draft, sent, paid, overdue)
   - Status sync z księgowym (✅ Zsynchronizowana / ⏳ Oczekuje)
   - Auto-send do księgowego (toggle)

3. Wydatki:
   - Przycisk "Dodaj wydatek"
   - Lista wydatków z kategoryzacją
   - Upload paragonu (OCR auto-fill)
   - Status zatwierdzenia przez księgowego
   - Suma wydatków (month/year)

4. Terminy:
   - Kalendarz z deadline'ami:
     * BTW aangifte (kwartalne)
     * Jaarrekening (roczne)
     * IB aangifte (roczne)
   - Powiadomienia email/SMS 7 dni przed

5. Raporty:
   - Przychody vs wydatki (wykres)
   - Raport BTW
   - Zestawienie roczne
   - Download PDF

6. Dokumenty:
   - Shared folder z księgowym
   - Kategorie: Faktury, Umowy, Paragony, Raporty
   - Upload/download
```

#### Service: `workerAccountingService.ts`
```typescript
// services/workerAccountingService.ts

export const workerAccountingService = {
  // Księgowy
  async assignAccountant(workerId, accountantId, services) { },
  async getAssignment(workerId) { },
  async cancelAssignment(assignmentId) { },
  
  // Faktury
  async createInvoice(workerId, invoiceData) { },
  async updateInvoice(invoiceId, updateData) { },
  async sendInvoice(invoiceId) { },
  async markInvoiceAsPaid(invoiceId, paidAmount) { },
  async syncInvoiceToAccountant(invoiceId) { },
  async getInvoices(workerId, filters) { },
  async generateInvoicePDF(invoiceId) { },
  
  // Wydatki
  async createExpense(workerId, expenseData) { },
  async uploadReceipt(expenseId, file) { },
  async syncExpenseToAccountant(expenseId) { },
  async getExpenses(workerId, filters) { },
  async getExpenseSummary(workerId, year) { },
  
  // Terminy
  async getDeadlines(workerId) { },
  async getUpcomingDeadlines(workerId, days = 30) { },
  
  // Raporty
  async getIncomeVsExpenses(workerId, year) { },
  async getBTWReport(workerId, quarter, year) { },
  async getAnnualReport(workerId, year) { }
}
```

---

# 🎯 CZĘŚĆ 3: SYSTEM FAKTUROWANIA DLA KSIĘGOWEGO

## 3.1 Księgowy wystawia faktury klientom

### Nowa tabela: `accountant_invoices`
```sql
CREATE TABLE accountant_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Klient
  client_type VARCHAR(20) NOT NULL, -- 'worker', 'employer'
  client_id UUID NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_address TEXT,
  
  -- Numer faktury
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Kwoty
  amount_excl_btw DECIMAL(10,2) NOT NULL,
  btw_rate DECIMAL(5,2) DEFAULT 21.00,
  btw_amount DECIMAL(10,2) NOT NULL,
  amount_incl_btw DECIMAL(10,2) NOT NULL,
  
  -- Szczegóły
  description TEXT,
  line_items JSONB,
  /*
  [
    { "service": "BTW aangifte", "quantity": 1, "unit_price": 150, "total": 150 },
    { "service": "Jaarrekening", "quantity": 1, "unit_price": 500, "total": 500 }
  ]
  */
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMP,
  
  -- Płatności
  payment_method VARCHAR(50), -- 'mollie', 'stripe', 'bank_transfer', 'ideal'
  payment_reference VARCHAR(255),
  
  -- Pliki
  pdf_url TEXT,
  
  -- Recurring (dla subskrypcji)
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(50), -- 'monthly', 'quarterly', 'yearly'
  parent_invoice_id UUID REFERENCES accountant_invoices(id),
  
  -- Notatki
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_acc_invoices_accountant ON accountant_invoices(accountant_id);
CREATE INDEX idx_acc_invoices_client ON accountant_invoices(client_type, client_id);
CREATE INDEX idx_acc_invoices_status ON accountant_invoices(status);
CREATE INDEX idx_acc_invoices_date ON accountant_invoices(invoice_date);
```

### UI: Invoice Generator

```typescript
pages/accountant/InvoiceManagement.tsx

Funkcje:
1. Lista faktur:
   - Filtry: Status, Klient, Okres
   - Sortowanie: Data, Kwota, Status
   - Akcje: View, Edit, Send, Mark Paid, Delete

2. Generowanie faktury:
   - Wybór klienta (auto-complete)
   - Dodawanie pozycji (line items)
   - Auto-calculate BTW
   - Preview PDF przed wysłaniem
   - Send via email
   - Payment link (Mollie/Stripe)

3. Recurring invoices:
   - Template dla subskrypcji
   - Auto-generate miesięcznie/kwartalnie
   - Auto-send

4. Statystyki:
   - Total revenue (month/year)
   - Unpaid invoices (overdue warning)
   - Average invoice amount
   - Payment rate
```

---

# 🎯 CZĘŚĆ 4: ZARZĄDZANIE DOKUMENTAMI (Document Management System)

## 4.1 Centralne repozytorium dokumentów

### Nowa tabela: `documents`
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Właściciel
  owner_type VARCHAR(20) NOT NULL, -- 'worker', 'employer', 'accountant'
  owner_id UUID NOT NULL,
  
  -- Księgowy (jeśli dokument jest shared)
  accountant_id UUID REFERENCES accountants(id),
  
  -- Szczegóły pliku
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- 'pdf', 'jpg', 'png', 'xlsx', 'docx'
  file_size INTEGER, -- bytes
  file_url TEXT NOT NULL,
  
  -- Kategoryzacja
  category VARCHAR(100) NOT NULL, -- 'invoice', 'contract', 'receipt', 'tax_form', 'report', 'other'
  subcategory VARCHAR(100),
  
  -- Metadata
  document_date DATE, -- Data dokumentu (nie upload date)
  description TEXT,
  tags TEXT[], -- ['btw', '2025', 'q1']
  
  -- OCR/AI extraction
  extracted_data JSONB, -- Auto-extracted dane (kwota, data, vendor)
  ocr_processed BOOLEAN DEFAULT false,
  
  -- Sharing
  shared_with UUID[], -- Lista user_id z dostępem
  is_public BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'deleted'
  
  -- Approval (dla wydatków)
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP,
  
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_owner ON documents(owner_type, owner_id);
CREATE INDEX idx_documents_accountant ON documents(accountant_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_date ON documents(document_date);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
```

### Storage Bucket: `client-documents`
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Tylko właściciel i przypisany księgowy
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'client-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own and shared documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'client-documents' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.file_url = storage.objects.name
      AND (
        auth.uid()::text = ANY(d.shared_with) OR
        d.accountant_id IN (SELECT id FROM accountants WHERE user_id = auth.uid())
      )
    )
  )
);
```

### UI: Document Manager

```typescript
pages/shared/DocumentManagement.tsx

Funkcje dla WORKER/EMPLOYER:
1. Upload dokumentów:
   - Drag & drop
   - Multi-upload
   - Auto-kategoryzacja (AI)
   - OCR dla faktur/paragonów

2. Browse dokumentów:
   - Folder structure:
     * 📁 Faktury
     * 📁 Umowy
     * 📁 Paragony
     * 📁 Formularze podatkowe
     * 📁 Raporty
   - Grid/List view
   - Search & filters
   - Tags

3. Share z księgowym:
   - Checkbox "Share with accountant"
   - Multi-select + bulk share

4. Preview:
   - PDF viewer
   - Image viewer
   - Download

Funkcje dla ACCOUNTANT:
1. Client documents browser:
   - Filter by client
   - All categories
   - Request missing documents (send notification)

2. Approval workflow:
   - Lista dokumentów requiring approval
   - Approve/Reject
   - Add notes

3. Auto-categorization:
   - AI categorizes uploaded docs
   - Suggests tags
```

---

# 🎯 CZĘŚĆ 5: KALENDARZ I PRZYPOMNIENIA

## 5.1 Tax Deadlines & Meetings

### Nowa tabela: `calendar_events`
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Właściciel eventu
  owner_type VARCHAR(20) NOT NULL, -- 'accountant', 'worker', 'employer'
  owner_id UUID NOT NULL,
  
  -- Typ eventu
  event_type VARCHAR(50) NOT NULL, -- 'deadline', 'meeting', 'reminder', 'recurring_task'
  
  -- Szczegóły
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Data/czas
  event_date DATE NOT NULL,
  event_time TIME,
  duration_minutes INTEGER, -- dla meetings
  
  -- Deadline specifics
  deadline_type VARCHAR(100), -- 'btw_aangifte', 'jaarrekening', 'ib_aangifte', 'zus'
  is_official_deadline BOOLEAN DEFAULT false, -- Urzędowy termin
  
  -- Notifications
  notify_days_before INTEGER[], -- [7, 3, 1] - powiadomienia 7, 3, 1 dzień przed
  notification_channels TEXT[], -- ['email', 'sms', 'push']
  
  -- Attendees (dla meetings)
  attendees JSONB,
  /*
  [
    { "user_id": "uuid", "user_type": "worker", "status": "pending" },
    { "user_id": "uuid", "user_type": "accountant", "status": "accepted" }
  ]
  */
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule VARCHAR(100), -- 'FREQ=MONTHLY;INTERVAL=3' (co 3 miesiące - BTW)
  
  -- Links
  related_form_id UUID REFERENCES accountant_forms(id),
  related_submission_id UUID REFERENCES form_submissions(id),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_owner ON calendar_events(owner_type, owner_id);
CREATE INDEX idx_events_date ON calendar_events(event_date);
CREATE INDEX idx_events_type ON calendar_events(event_type);
```

### Predefiniowane terminy (Nederlands fiscal year)
```typescript
// lib/fiscalDeadlines.ts

export const FISCAL_DEADLINES_2025 = [
  // BTW aangifte (quarterly)
  { type: 'btw_aangifte', quarter: 'Q1', deadline: '2025-04-30' },
  { type: 'btw_aangifte', quarter: 'Q2', deadline: '2025-07-31' },
  { type: 'btw_aangifte', quarter: 'Q3', deadline: '2025-10-31' },
  { type: 'btw_aangifte', quarter: 'Q4', deadline: '2026-01-31' },
  
  // Inkomstenbelasting (IB aangifte)
  { type: 'ib_aangifte', year: 2024, deadline: '2025-05-01' },
  
  // Jaarrekening
  { type: 'jaarrekening', year: 2024, deadline: '2025-06-30' },
  
  // Voorlopige aanslag
  { type: 'voorlopige_aanslag', year: 2025, deadline: '2025-03-01' }
]

// Auto-create calendar events dla każdego workera/employera
```

### UI: Calendar Component

```typescript
pages/shared/Calendar.tsx

Features:
1. Month/Week/Day view
2. Deadline indicators (czerwone = pilne)
3. Meetings (niebieski)
4. Recurring events
5. Click → event detail modal
6. Integracja z Google Calendar (sync)
7. Notifications settings
8. iCal export
```

---

# 🎯 CZĘŚĆ 6: SYSTEM RAPORTOWANIA

## 6.1 Generowanie raportów PDF/Excel

### Nowa tabela: `reports`
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id),
  
  -- Klient
  client_type VARCHAR(20) NOT NULL, -- 'worker', 'employer'
  client_id UUID NOT NULL,
  client_name VARCHAR(255),
  
  -- Typ raportu
  report_type VARCHAR(100) NOT NULL, -- 'monthly', 'quarterly', 'annual', 'btw', 'payroll', 'expense_summary'
  
  -- Okres
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Dane raportu
  report_data JSONB NOT NULL,
  /*
  {
    "total_income": 45000,
    "total_expenses": 12000,
    "btw_collected": 9450,
    "btw_paid": 2520,
    "net_profit": 33000,
    "categories": { "transport": 3000, "tools": 5000, ... }
  }
  */
  
  -- Pliki
  pdf_url TEXT,
  excel_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'generated', 'sent'
  
  -- Wysyłka
  sent_to_client BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  
  -- Template
  template_id UUID, -- Custom template
  
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_accountant ON reports(accountant_id);
CREATE INDEX idx_reports_client ON reports(client_type, client_id);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_period ON reports(period_start, period_end);
```

### Report Templates

```typescript
// services/reportGenerator.ts

export const reportTemplates = {
  // Monthly report dla ZZP
  async generateMonthlyWorkerReport(workerId, year, month) {
    const data = {
      invoices: await getWorkerInvoices(workerId, year, month),
      expenses: await getWorkerExpenses(workerId, year, month),
      btwSummary: await calculateBTW(workerId, year, month),
      charts: {
        incomeVsExpenses: await generateChart(),
        categoryBreakdown: await generatePieChart()
      }
    }
    
    return generatePDF(data, 'monthly_worker_template')
  },
  
  // Quarterly BTW report
  async generateBTWReport(workerId, quarter, year) { },
  
  // Annual report (jaarrekening)
  async generateAnnualReport(workerId, year) { },
  
  // Payroll report dla employer
  async generatePayrollReport(employerId, month, year) { }
}
```

### UI: Report Generator

```typescript
pages/accountant/ReportManagement.tsx

Features:
1. Report wizard:
   - Select client
   - Select period (month/quarter/year)
   - Select report type
   - Customize template
   - Preview
   - Generate PDF/Excel
   - Send to client

2. Automated reports:
   - Schedule monthly reports (auto-send)
   - Quarterly BTW reports
   - Annual summaries

3. Custom templates:
   - Logo księgowego
   - Brand colors
   - Custom footer/header
   - Sections (włącz/wyłącz)
```

---

# 🎯 CZĘŚĆ 7: INTEGRACJE ZEWNĘTRZNE

## 7.1 Belastingdienst API
```typescript
// services/integrations/belastingdienstAPI.ts

export const belastingdienstAPI = {
  // BTW aangifte submission
  async submitBTWAangifte(workerData, period) {
    // POST do Belastingdienst API
    // Requires: DigiD authentication
  },
  
  // Get aangifte status
  async getAangifteStatus(referenceNumber) { },
  
  // Download confirmation
  async downloadConfirmation(referenceNumber) { }
}
```

## 7.2 KVK API
```typescript
// services/integrations/kvkAPI.ts

export const kvkAPI = {
  // Verify KVK number
  async verifyKVK(kvkNumber) {
    const response = await fetch(`https://api.kvk.nl/api/v1/zoeken?kvkNummer=${kvkNumber}`)
    return response.json()
  },
  
  // Get company details
  async getCompanyDetails(kvkNumber) { },
  
  // Check if company is active
  async isCompanyActive(kvkNumber) { }
}
```

## 7.3 Banking APIs (Bunq, ING, Rabobank)
```typescript
// services/integrations/bankingAPI.ts

export const bankingAPI = {
  // Connect bank account (OAuth)
  async connectBankAccount(provider, accountantId) { },
  
  // Sync transactions
  async syncTransactions(accountId, fromDate, toDate) { },
  
  // Auto-categorize transactions
  async categorizeTransaction(transaction) {
    // AI categorization: invoice payment, expense, salary, etc.
  },
  
  // Match transactions to invoices
  async matchPaymentToInvoice(transaction, invoices) { }
}
```

## 7.4 QuickBooks / Exact Online Export
```typescript
// services/integrations/accountingSoftwareExport.ts

export const accountingSoftwareExport = {
  // Export to QuickBooks
  async exportToQuickBooks(accountantId, data) {
    // Format data dla QuickBooks import
    return generateQBOFile(data)
  },
  
  // Export to Exact Online
  async exportToExactOnline(accountantId, data) { },
  
  // Export to custom CSV
  async exportToCSV(accountantId, data) { }
}
```

---

# 🎯 CZĘŚĆ 8: SYSTEM PŁATNOŚCI (Mollie/Stripe)

## 8.1 Subscription tiers dla księgowych

### Tabela: `subscription_plans`
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Plan details
  name VARCHAR(100) NOT NULL, -- 'Basic', 'Professional', 'Enterprise'
  description TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2), -- Discount dla yearly
  currency VARCHAR(10) DEFAULT 'EUR',
  
  -- Limits
  max_clients INTEGER, -- null = unlimited
  max_monthly_invoices INTEGER,
  max_storage_gb INTEGER,
  
  -- Features
  features JSONB,
  /*
  {
    "custom_branding": true,
    "automated_reports": true,
    "api_access": true,
    "priority_support": true,
    "multi_user": true
  }
  */
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `accountant_subscriptions`
```sql
CREATE TABLE accountant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Billing
  billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'yearly'
  amount DECIMAL(10,2) NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due'
  
  -- Payment provider
  payment_provider VARCHAR(50), -- 'mollie', 'stripe'
  payment_customer_id VARCHAR(255), -- Mollie/Stripe customer ID
  payment_subscription_id VARCHAR(255), -- Mollie/Stripe subscription ID
  
  -- Dates
  start_date DATE NOT NULL,
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  cancel_at DATE,
  cancelled_at TIMESTAMP,
  
  -- Usage
  clients_count INTEGER DEFAULT 0,
  invoices_this_month INTEGER DEFAULT 0,
  storage_used_gb DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_accountant ON accountant_subscriptions(accountant_id);
CREATE INDEX idx_subscriptions_status ON accountant_subscriptions(status);
```

### Payment Integration

```typescript
// services/paymentService.ts

export const paymentService = {
  // Mollie
  async createMollieSubscription(accountantId, planId) {
    const mollie = new MollieClient({ apiKey: process.env.MOLLIE_API_KEY })
    
    const customer = await mollie.customers.create({
      name: accountantData.full_name,
      email: accountantData.email
    })
    
    const subscription = await mollie.subscriptions.create({
      customerId: customer.id,
      amount: { currency: 'EUR', value: plan.price_monthly },
      interval: '1 month',
      description: `${plan.name} subscription`
    })
    
    // Save to DB
  },
  
  // Stripe (alternative)
  async createStripeSubscription(accountantId, planId) { },
  
  // Cancel subscription
  async cancelSubscription(subscriptionId) { },
  
  // Upgrade/downgrade
  async changePlan(subscriptionId, newPlanId) { },
  
  // Handle webhook (payment success/failure)
  async handlePaymentWebhook(provider, payload) { }
}
```

---

# 🎯 CZĘŚĆ 9: CRM DLA KSIĘGOWYCH

## 9.1 Zarządzanie klientami

### Tabela: `accountant_clients`
```sql
CREATE TABLE accountant_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Klient
  client_type VARCHAR(20) NOT NULL, -- 'worker', 'employer'
  client_id UUID NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  
  -- CRM fields
  status VARCHAR(50) DEFAULT 'active', -- 'potential', 'active', 'inactive', 'churned'
  source VARCHAR(100), -- 'website', 'referral', 'feed', 'search'
  
  -- Categorization
  tags TEXT[], -- ['high_value', 'monthly_service', 'tax_only']
  segment VARCHAR(100), -- 'enterprise', 'small_business', 'freelancer'
  
  -- Financial
  monthly_value DECIMAL(10,2), -- Expected monthly revenue
  lifetime_value DECIMAL(10,2), -- Total paid
  
  -- Dates
  first_contact_date DATE,
  contract_start_date DATE,
  contract_end_date DATE,
  last_contact_date DATE,
  last_invoice_date DATE,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_accountant_client UNIQUE (accountant_id, client_type, client_id)
);

CREATE INDEX idx_clients_accountant ON accountant_clients(accountant_id);
CREATE INDEX idx_clients_status ON accountant_clients(status);
```

### Tabela: `client_interactions` (History kontaktów)
```sql
CREATE TABLE client_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_client_id UUID NOT NULL REFERENCES accountant_clients(id) ON DELETE CASCADE,
  accountant_id UUID NOT NULL REFERENCES accountants(id),
  
  -- Typ interakcji
  interaction_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'meeting', 'note', 'task'
  
  -- Szczegóły
  subject VARCHAR(255),
  notes TEXT,
  
  -- Outcome
  outcome VARCHAR(100), -- 'positive', 'neutral', 'negative', 'follow_up_needed'
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  
  interaction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interactions_client ON client_interactions(accountant_client_id);
```

### UI: CRM Dashboard

```typescript
pages/accountant/ClientCRM.tsx

Features:
1. Pipeline view (Kanban):
   [Potential] → [Active] → [Inactive] → [Churned]
   - Drag & drop cards
   - Color coding by value

2. Client list (Table):
   Columns: Name, Type, Status, Monthly Value, Last Contact, Actions
   - Filters: Status, Segment, Tags
   - Sortowanie: Value, Name, Date

3. Client detail:
   - Overview (info, tags, segment)
   - Interaction history (timeline)
   - Financial summary (invoices, payments)
   - Documents
   - Notes
   - Tasks/reminders

4. Tasks & Follow-ups:
   - Lista follow-up required
   - Overdue tasks (red alert)
   - Today's tasks
   - Calendar integration

5. Segmentation:
   - Auto-segment by value (high/medium/low)
   - Custom segments
   - Bulk actions per segment

6. Email marketing (basic):
   - Send newsletter to segment
   - Templates
   - Track opens/clicks
```

---

# 🎯 CZĘŚĆ 10: MULTI-USER (Firmy księgowe)

## 10.1 Team Management

### Tabela: `accountant_team_members`
```sql
CREATE TABLE accountant_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE, -- Główny account (firma)
  
  -- Członek zespołu
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  
  -- Rola
  role VARCHAR(50) NOT NULL, -- 'admin', 'accountant', 'assistant', 'viewer'
  
  -- Uprawnienia
  permissions JSONB,
  /*
  {
    "view_clients": true,
    "manage_clients": true,
    "create_invoices": true,
    "approve_expenses": false,
    "view_reports": true,
    "manage_team": false
  }
  */
  
  -- Przypisani klienci
  assigned_clients UUID[], -- Specific client IDs
  can_view_all_clients BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'invited'
  
  -- Invitation
  invitation_token VARCHAR(255),
  invitation_sent_at TIMESTAMP,
  invitation_accepted_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_team_accountant ON accountant_team_members(accountant_id);
CREATE INDEX idx_team_user ON accountant_team_members(user_id);
```

### UI: Team Management

```typescript
pages/accountant/TeamManagement.tsx

Features:
1. Team members list:
   - Add member (send invitation email)
   - Edit role & permissions
   - Assign clients to member
   - Deactivate member

2. Roles & Permissions:
   Predefiniowane:
   - Admin: Full access
   - Accountant: Can manage clients, invoices, reports
   - Assistant: Can view, limited editing
   - Viewer: Read-only

3. Activity log:
   - Kto co zrobił (audit trail)
   - Filter by member
   - Export do CSV

4. Internal chat (optional):
   - Team messaging
   - Channels per client
   - File sharing
```

---

# 🎯 CZĘŚĆ 11: ANALYTICS & BI

## 11.1 Business Intelligence Dashboard

### Tabela: `accountant_analytics`
```sql
CREATE TABLE accountant_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id),
  
  -- Period
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_date DATE NOT NULL,
  
  -- Metrics
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_invoices_sent INTEGER DEFAULT 0,
  total_invoices_paid INTEGER DEFAULT 0,
  payment_rate DECIMAL(5,2), -- % paid invoices
  
  -- Clients
  new_clients INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  churned_clients INTEGER DEFAULT 0,
  
  -- Services
  services_completed INTEGER DEFAULT 0,
  avg_service_duration_days INTEGER, -- Avg time to complete
  
  -- Submissions
  submissions_received INTEGER DEFAULT 0,
  submissions_processed INTEGER DEFAULT 0,
  
  -- Growth
  revenue_growth_percent DECIMAL(5,2),
  client_growth_percent DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_accountant ON accountant_analytics(accountant_id);
CREATE INDEX idx_analytics_period ON accountant_analytics(period_date);
```

### UI: Analytics Dashboard

```typescript
pages/accountant/Analytics.tsx

Charts:
1. Revenue trends (Line chart):
   - Monthly revenue last 12 months
   - Comparison to previous year

2. Client acquisition (Bar chart):
   - New clients per month
   - Client churn

3. Payment rate (Gauge chart):
   - % invoices paid on time
   - Target: 95%

4. Service breakdown (Pie chart):
   - Revenue by service type
   - BTW vs Jaarrekening vs Payroll

5. Top clients (Table):
   - By lifetime value
   - By monthly value

6. Key metrics (Cards):
   - MRR (Monthly Recurring Revenue)
   - ARR (Annual Recurring Revenue)
   - Churn rate
   - Client Lifetime Value (CLV)
   - Cost per acquisition

7. Conversion funnel:
   Profile views → Contact requests → Contracts signed
```

---

# 🎯 CZĘŚĆ 12: COMPLIANCE & SECURITY

## 12.1 GDPR Compliance

### Tabela: `data_access_logs` (Audit trail)
```sql
CREATE TABLE data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL, -- 'worker', 'employer', 'accountant'
  user_email VARCHAR(255),
  
  -- Action
  action VARCHAR(100) NOT NULL, -- 'view', 'create', 'update', 'delete', 'export'
  resource_type VARCHAR(100) NOT NULL, -- 'invoice', 'document', 'client_data', 'report'
  resource_id UUID,
  
  -- Details
  ip_address INET,
  user_agent TEXT,
  changes JSONB, -- Before/after dla updates
  
  -- Privacy
  is_sensitive BOOLEAN DEFAULT false, -- BSN, bank details
  
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_access_logs_user ON data_access_logs(user_id);
CREATE INDEX idx_access_logs_resource ON data_access_logs(resource_type, resource_id);
CREATE INDEX idx_access_logs_timestamp ON data_access_logs(timestamp);
```

### Data Privacy Features

```typescript
// services/privacyService.ts

export const privacyService = {
  // Export user data (GDPR Right to Access)
  async exportUserData(userId, userType) {
    // Collect ALL data: profile, invoices, documents, messages
    // Generate ZIP file
    return zipUrl
  },
  
  // Delete user data (GDPR Right to Erasure)
  async deleteUserData(userId, userType) {
    // Anonymize instead of hard delete (for audit)
    // Delete files from storage
    // Notify related parties (accountant, clients)
  },
  
  // Data retention policy
  async enforceRetentionPolicy() {
    // Auto-delete data older than X years (configurable)
    // Keep audit logs for 7 years (legal requirement)
  }
}
```

## 12.2 Two-Factor Authentication (2FA)

### Tabela: `user_2fa`
```sql
CREATE TABLE user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 2FA method
  method VARCHAR(50) NOT NULL, -- 'totp', 'sms', 'email'
  
  -- TOTP (Google Authenticator)
  totp_secret VARCHAR(255),
  backup_codes TEXT[], -- One-time use codes
  
  -- SMS
  phone_number VARCHAR(50),
  
  -- Status
  is_enabled BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- Recovery
  recovery_email VARCHAR(255),
  
  enabled_at TIMESTAMP,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 12.3 Encryption

```typescript
// lib/encryption.ts

import crypto from 'crypto'

export const encryption = {
  // Encrypt sensitive data (BSN, bank accounts)
  encrypt(text: string): string {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  },
  
  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}

// Usage:
// const bsn = encryption.encrypt('123456789')
// Store bsn in DB encrypted
```

## 12.4 Automatic Backups

```sql
-- Scheduled backup (cron job)
-- Daily: pg_dump -> AWS S3
-- Retention: 30 days daily, 12 months monthly

CREATE TABLE backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type VARCHAR(50) NOT NULL, -- 'full', 'incremental'
  backup_url TEXT NOT NULL,
  backup_size_mb INTEGER,
  status VARCHAR(50) DEFAULT 'completed',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 📊 PODSUMOWANIE ROZBUDOWY 500%

## ✅ DODANE MODUŁY (12 głównych):

### 1. **Integracja Employer ↔ Accountant** ✅
- Kontrakty pracodawca-księgowy
- Payroll batches (księgowanie pracowników)
- Eksport danych z systemu zatrudnień
- Shared dashboard
- System aprobaty kosztów

### 2. **Integracja Worker ↔ Accountant** ✅
- Przypisanie księgowego do ZZP
- Auto-wysyłka faktur
- Tracking wydatków (koszty uzyskania przychodu)
- Powiadomienia o terminach podatkowych
- Synchronizacja zarobków

### 3. **System Fakturowania** ✅
- Księgowy wystawia faktury klientom
- Auto-fakturowanie za usługi
- Templates faktur
- Recurring invoices (subskrypcje)
- Payment links (Mollie/Stripe)

### 4. **Document Management System** ✅
- Centralne repozytorium dokumentów
- Kategorie (faktury, umowy, PIT, BTW, paragony)
- OCR auto-fill
- Sharing z księgowym
- Approval workflow

### 5. **Kalendarz & Terminy** ✅
- Predefiniowane terminy urzędowe (BTW, PIT, ZUS)
- Spotkania z klientami
- Auto-powiadomienia (email/SMS)
- Integracja Google Calendar
- Recurring deadlines

### 6. **System Raportowania** ✅
- Generowanie PDF/Excel
- Templates (monthly, quarterly, annual)
- Auto-wysyłka do klientów
- Custom branding
- Charts & visualizations

### 7. **Integracje Zewnętrzne** ✅
- Belastingdienst API (BTW submission)
- KVK API (weryfikacja firm)
- Banking APIs (Bunq, ING, Rabobank)
- QuickBooks/Exact Online export
- DigiD authentication

### 8. **System Płatności** ✅
- Subscription tiers (Basic, Pro, Enterprise)
- Mollie integration
- Stripe integration (alt)
- Auto-billing
- Invoice payments online

### 9. **CRM dla Księgowych** ✅
- Pipeline (Potential → Active → Churned)
- Interaction history
- Client segmentation
- Tasks & follow-ups
- Email marketing (basic)

### 10. **Multi-User (Team)** ✅
- Role (Admin, Accountant, Assistant, Viewer)
- Permissions management
- Client assignment
- Activity logs
- Internal chat

### 11. **Analytics & BI** ✅
- Revenue tracking (MRR, ARR)
- Client metrics (CLV, churn rate)
- Conversion funnel
- Payment rate
- Growth trends

### 12. **Compliance & Security** ✅
- GDPR (export/delete data)
- Audit logs
- 2FA (TOTP, SMS)
- Data encryption (AES-256)
- Auto backups

---

## 📈 STATYSTYKI ROZBUDOWY:

| Metryka | Przed | Po | Wzrost |
|---------|-------|-----|---------|
| **Tabele DB** | 5 | 23 | +360% |
| **Funkcjonalności** | 6 | 42 | +600% |
| **Integracje** | 0 | 7 | +∞ |
| **Komponenty UI** | ~15 | ~80 | +433% |
| **Services** | 1 | 12 | +1100% |
| **Strony** | 6 | 25 | +317% |

---

## 🚀 PLAN IMPLEMENTACJI (Priorytetyzacja)

### 🔴 FAZA 1 (1-2 tygodnie): FUNDAMENTY
1. Integracja Worker ↔ Accountant
2. System fakturowania (workers)
3. Document Management
4. Kalendarz terminów

### 🟡 FAZA 2 (1-2 tygodnie): INTEGRACJE
5. Integracja Employer ↔ Accountant
6. Payroll system
7. System raportowania
8. Faktury księgowego

### 🟢 FAZA 3 (1 tydzień): BUSINESS TOOLS
9. CRM dla księgowych
10. Analytics dashboard
11. System płatności (subscriptions)

### 🔵 FAZA 4 (1 tydzień): ADVANCED
12. Integracje zewnętrzne (APIs)
13. Multi-user / Team
14. Compliance & Security (2FA, GDPR)

**TOTAL: 4-6 tygodni pełnego development**

---

## 💡 NEXT STEPS - CO ROBIMY TERAZ?

**Opcje:**

**A) START FROM SCRATCH** - Zaczynamy FAZĘ 1:
1. SQL migration: `worker_accountant_assignments`, `worker_invoices`, `worker_expenses`
2. `workerAccountingService.ts`
3. `WorkerAccounting.tsx` page
4. Invoice generator dla workers

**B) PRIORITIZE INTEGRATION** - Focus na integracji paneli:
1. Worker → Accountant flow
2. Employer → Accountant flow
3. Synchronizacja danych

**C) PICK ONE MODULE** - Zbuduj jeden moduł w całości:
- Document Management (najbardziej universal)
- Invoice System (praktyczny)
- Calendar & Deadlines (szybki win)

**Która opcja? Powiedz A, B, C albo własną!** 🎯
