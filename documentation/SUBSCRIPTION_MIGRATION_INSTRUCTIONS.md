# 📋 INSTRUKCJA WDROŻENIA SYSTEMU ABONAMENTOWEGO

## ✅ KROK 1: MIGRACJA BAZY DANYCH (WYKONAJ TERAZ!)

### A) Otwórz Supabase Dashboard
1. Przejdź do: https://supabase.com/dashboard
2. Wybierz swój projekt ZZP Werkplaats
3. Kliknij **SQL Editor** w lewym menu

### B) Uruchom migrację
1. Skopiuj zawartość pliku: `SUBSCRIPTION_SYSTEM_MIGRATION.sql`
2. Wklej do SQL Editor
3. Kliknij **RUN** (lub Ctrl+Enter)

### C) Sprawdź wynik
Powinieneś zobaczyć:
```
✅ MIGRACJA ZAKOŃCZONA POMYŚLNIE!
========================================
Workers ogółem: X
Basic tier: Y
Premium tier: Z

📋 Utworzone tabele:
  ✅ subscription_payments
  ✅ certificate_applications
  ✅ subscription_events

🔒 RLS Policies: ✅ Aktywne
📊 Views: ✅ v_active_subscriptions
```

### D) Weryfikacja ręczna
Sprawdź w **Table Editor** czy istnieją:
- ✅ `workers` (nowe kolumny: subscription_tier, subscription_status, etc.)
- ✅ `subscription_payments`
- ✅ `certificate_applications`
- ✅ `subscription_events`

---

## 📊 CO ZOSTAŁO DODANE DO BAZY DANYCH?

### 1. Nowe kolumny w tabeli `workers`:
```sql
subscription_tier           -- 'basic' | 'premium'
subscription_status         -- 'active' | 'cancelled' | 'expired' | 'trial'
subscription_start_date     -- Data rozpoczęcia abonamentu
subscription_end_date       -- Data wygaśnięcia (renewal)
last_payment_date          -- Ostatnia płatność
monthly_fee                -- €13.00
stripe_customer_id         -- Stripe Customer ID
stripe_subscription_id     -- Stripe Subscription ID
zzp_certificate_issued     -- Czy ma certyfikat Premium
zzp_certificate_date       -- Data wydania certyfikatu
zzp_certificate_number     -- Numer certyfikatu (ZZP-00000001)
zzp_certificate_expires_at -- Data wygaśnięcia certyfikatu (opcjonalne)
```

### 2. Nowa tabela `subscription_payments`:
**Historia wszystkich płatności**
- `worker_id` - Link do pracownika
- `amount` - Kwota (€13.00)
- `currency` - EUR
- `payment_date` - Data płatności
- `period_start/end` - Okres abonamentu (30 dni)
- `payment_method` - stripe/ideal/card/bank_transfer
- `stripe_payment_intent_id` - ID płatności w Stripe
- `status` - pending/completed/failed/refunded

### 3. Nowa tabela `certificate_applications`:
**Aplikacje o certyfikat Premium**
- `worker_id` - Kto aplikuje
- `status` - pending/scheduled/testing/approved/rejected
- `meeting_scheduled_date` - Kiedy spotkanie weryfikacyjne
- `test_score` - Wynik testu (0-100)
- `reviewer_id` - Kto przeprowadził weryfikację (Admin)
- `reviewer_notes` - Notatki z weryfikacji
- `certificate_number` - Numer nadanego certyfikatu
- `motivation_letter` - List motywacyjny od workera

### 4. Nowa tabela `subscription_events`:
**Audit log wszystkich zdarzeń**
- subscription_created/renewed/cancelled/expired
- payment_succeeded/failed
- certificate_granted/revoked

### 5. View `v_active_subscriptions`:
**Szybki przegląd aktywnych subskrypcji dla Admin Dashboard**

---

## 🔒 BEZPIECZEŃSTWO (RLS Policies)

### Workers mogą:
- ✅ Widzieć tylko swoje płatności
- ✅ Widzieć tylko swoje aplikacje o certyfikat
- ✅ Tworzyć nowe aplikacje o certyfikat
- ❌ NIE mogą edytować statusu aplikacji

### Admins mogą:
- ✅ Widzieć wszystkie płatności
- ✅ Widzieć wszystkie aplikacje
- ✅ Edytować aplikacje (zatwierdzanie/odrzucanie)
- ✅ Ręcznie dodawać płatności

---

## 📈 MIGRACJA ISTNIEJĄCYCH DANYCH

### Automatyczne zmiany:
1. **Wszyscy istniejący workers:**
   - Otrzymali `subscription_tier = 'basic'`
   - Status: `active`
   - Data start: ich `created_at`
   - Data end: `created_at + 30 dni`
   - Monthly fee: `€13.00`

2. **Workers z `verified = true`:**
   - Automatycznie otrzymali `subscription_tier = 'premium'`
   - Nadano certyfikat: `zzp_certificate_issued = true`
   - Numer certyfikatu: `ZZP-00000001`, `ZZP-00000002`, etc.

---

## 🎯 NASTĘPNE KROKI

Po wykonaniu migracji SQL:

### FAZA 2: Backend (Stripe Integration)
- [ ] Utworzenie Stripe account (Test mode)
- [ ] Supabase Edge Functions:
  - `create-checkout-session`
  - `handle-stripe-webhook`
  - `cancel-subscription`

### FAZA 3: Frontend (Worker Registration)
- [ ] Nowa strona rejestracji (public)
- [ ] Integracja Stripe Checkout
- [ ] Email confirmation

### FAZA 4: Worker Dashboard
- [ ] Zakładka "Subskrypcja"
- [ ] CTA "Zdobądź Certyfikat"

### FAZA 5: Employer Dashboard
- [ ] Filtry: Premium/Basic
- [ ] Badge system

### FAZA 6: Admin Panel
- [ ] Moduł Subscriptions
- [ ] Moduł Certificates
- [ ] Financial Dashboard

---

## ⚠️ WAŻNE UWAGI

1. **Backup przed migracją:**
   - Supabase robi auto-backup, ale możesz zrobić manual snapshot
   - Dashboard → Settings → Backups

2. **Rollback (jeśli coś pójdzie nie tak):**
   ```sql
   -- Usuń dodane kolumny
   ALTER TABLE workers DROP COLUMN subscription_tier;
   ALTER TABLE workers DROP COLUMN subscription_status;
   -- ... etc
   
   -- Usuń tabele
   DROP TABLE subscription_payments CASCADE;
   DROP TABLE certificate_applications CASCADE;
   DROP TABLE subscription_events CASCADE;
   ```

3. **Test environment:**
   - Zalecam najpierw test na development database
   - Potem production

---

## 📞 WSPARCIE

Jeśli napotkasz błędy podczas migracji:
1. Skopiuj treść błędu z SQL Editor
2. Sprawdź czy wszystkie tabele istnieją (profiles, workers)
3. Zgłoś błąd - naprawię migrację

---

**STATUS:** ✅ Migracja SQL gotowa do uruchomienia
**CZAS:** ~2-5 sekund wykonania
**RYZYKO:** Niskie (tylko dodaje kolumny/tabele, nie usuwa danych)
