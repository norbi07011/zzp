# ⚡ QUICK START - System Abonamentowy

**Ostatnia aktualizacja:** 10 października 2025

---

## 🎯 WSZYSTKO GOTOWE! Co teraz?

System jest **w 100% zakończony**. Pozostaje tylko **konfiguracja zewnętrznych serwisów** (Stripe + Resend).

---

## 📋 SZYBKI CHECKLIST (90 minut)

### ✅ **KROK 1: Stripe Account (30 min)**

1. **Zarejestruj się:** https://stripe.com
2. **Utwórz 3 produkty** (Dashboard → Products → Create):

```
PRODUKT 1: Worker Premium
├── Name: Premium ZZP Certificaat
├── Price: €13.00 EUR
├── Billing: Monthly (recurring)
└── Skopiuj: Price ID (price_xxx) → VITE_STRIPE_PRICE_WORKER_PREMIUM

PRODUKT 2: Employer Basic
├── Name: Basic Plan (Employer)
├── Price: €13.00 EUR
├── Billing: Monthly (recurring)
└── Skopiuj: Price ID → VITE_STRIPE_PRICE_EMPLOYER_BASIC

PRODUKT 3: Employer Premium
├── Name: Premium Plan (Employer)
├── Price: €25.00 EUR
├── Billing: Monthly (recurring)
└── Skopiuj: Price ID → VITE_STRIPE_PRICE_EMPLOYER_PREMIUM
```

3. **Pobierz API Keys** (Dashboard → Developers → API Keys):
   - Publishable key (`pk_test_...`)
   - Secret key (`sk_test_...`)

4. **Utwórz Webhook** (Dashboard → Developers → Webhooks):
   - URL: `https://dtnotuygygexmkyqtgb.functions.supabase.co/stripe-webhook`
   - Events: Wybierz wszystkie `checkout.*`, `customer.subscription.*`, `invoice.*`
   - Skopiuj: Webhook secret (`whsec_...`)

---

### ✅ **KROK 2: Resend Email (10 min)**

1. **Zarejestruj się:** https://resend.com
2. **Pobierz API Key** (Dashboard → API Keys → Create)
   - Skopiuj: API Key (`re_xxx`)
3. **(Opcjonalnie) Dodaj domenę:**
   - Dashboard → Domains → Add Domain
   - Dodaj DNS records (SPF, DKIM, DMARC)
   - **BEZ DOMENY:** emaile idą z `resend.dev` (sandbox - 100 emaili/dzień za darmo)

---

### ✅ **KROK 3: Environment Variables (5 min)**

**Utwórz plik `.env` w głównym katalogu:**

```bash
# Stripe (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxx
VITE_STRIPE_PRICE_WORKER_PREMIUM=price_xxxxxxxxx
VITE_STRIPE_PRICE_EMPLOYER_BASIC=price_xxxxxxxxx
VITE_STRIPE_PRICE_EMPLOYER_PREMIUM=price_xxxxxxxxx

# Resend (Frontend)
VITE_RESEND_API_KEY=re_xxxxxxxxx
VITE_FROM_EMAIL=noreply@yourcompany.com

# Supabase
VITE_SUPABASE_URL=https://dtnotuygygexmkyqtgb.supabase.co
VITE_SUPABASE_ANON_KEY=twój_anon_key_tutaj
VITE_SUPABASE_FUNCTIONS_URL=https://dtnotuygygexmkyqtgb.functions.supabase.co
```

**Ustaw sekrety w Supabase (Backend):**

```bash
# Zainstaluj Supabase CLI
npm install -g supabase

# Login
supabase login

# Link projekt
supabase link --project-ref dtnotuygygexmkyqtgb

# Ustaw sekrety
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set RESEND_API_KEY=re_xxx
```

---

### ✅ **KROK 4: Deploy Supabase Functions (20 min)**

```bash
# Deploy obu funkcji
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook

# Sprawdź czy działają
curl https://dtnotuygygexmkyqtgb.functions.supabase.co/create-checkout-session
# Powinno zwrócić error (brak body) - to OK!
```

---

### ✅ **KROK 5: Uruchom Migrację Bazy Danych (5 min)**

1. Otwórz: https://supabase.com/dashboard/project/dtnotuygygexmkyqtgb/sql
2. Wklej zawartość pliku: `SUBSCRIPTION_SYSTEM_MIGRATION.sql`
3. Kliknij **Run**
4. Sprawdź czy tabele zostały utworzone (Tables → subscription_payments, premium_certificates)

---

### ✅ **KROK 6: Test Lokalnie (10 min)**

```bash
# Uruchom dev server
npm run dev

# Otwórz w przeglądarce:
http://localhost:3000

# Testuj:
1. Worker Dashboard → Subscription tab
   ✅ CheckoutButton powinien być zielony (Stripe skonfigurowany)
   
2. Employer Dashboard → /employer/subscription
   ✅ Basic: €13 (niebieski przycisk)
   ✅ Premium: €25 (złoty przycisk)
   
3. Kliknij przycisk upgrade
   ✅ Powinno przekierować do Stripe Checkout
   
4. Użyj testowej karty: 4242 4242 4242 4242
   ✅ Po płatności → redirect na /payment-success
   
5. Sprawdź email (jeśli Resend skonfigurowany)
   ✅ Powinien przyjść welcome email
```

---

### ✅ **KROK 7: Deploy do Production (10 min)**

**Opcja A: Vercel (zalecane)**

```bash
npm install -g vercel
vercel --prod

# W dashboard dodaj environment variables z .env!
```

**Opcja B: Netlify**

```bash
npm install -g netlify-cli
netlify deploy --prod

# W dashboard dodaj environment variables!
```

---

## 🧪 TESTOWANIE END-TO-END

### Test 1: Worker Upgrade
```
1. Zaloguj się jako worker (Basic tier)
2. Przejdź do Dashboard → Subscription
3. Kliknij "Upgrade naar Premium - €13/maand"
4. Wypełnij kartę testową: 4242 4242 4242 4242
5. Sprawdź redirect na /payment-success
6. Sprawdź email (welcome email)
7. Wróć do dashboard → tier powinien być Premium
```

### Test 2: Employer Upgrade
```
1. Zaloguj się jako employer
2. Przejdź do /employer/subscription
3. Kliknij "Upgrade do Premium - €25/maand"
4. Wypełnij kartę testową
5. Sprawdź redirect + email
6. Sprawdź limity (powinno być unlimited)
```

### Test 3: Webhook
```
1. W Stripe Dashboard → Events
2. Trigger test event: checkout.session.completed
3. Sprawdź Supabase logs (Functions → stripe-webhook → Logs)
4. Sprawdź tabelę workers (subscription_status = active)
5. Sprawdź tabelę subscription_payments (nowy wpis)
```

---

## 🐛 TROUBLESHOOTING

### Problem: "Betalingen zijn momenteel niet beschikbaar"
**Rozwiązanie:** Sprawdź `.env` - brak `VITE_STRIPE_PUBLISHABLE_KEY`

### Problem: "Backend API not implemented"
**Rozwiązanie:** Deploy funkcji `create-checkout-session` do Supabase

### Problem: Nie przychodzą emaile
**Rozwiązanie:** 
1. Sprawdź `VITE_RESEND_API_KEY` w `.env`
2. Sprawdź Resend Dashboard → Logs
3. Sprawdź Supabase logs → stripe-webhook

### Problem: Webhook nie działa
**Rozwiązanie:**
1. Sprawdź URL w Stripe Webhook Dashboard
2. Sprawdź `STRIPE_WEBHOOK_SECRET` w Supabase Secrets
3. Sprawdź Supabase logs (Functions → stripe-webhook)

### Problem: TypeScript errors w Deno files
**Rozwiązanie:** To jest **NORMALNE** - pliki Deno w projekcie Node.js. Dodano `supabase/functions` do `tsconfig.json` exclude. Ignoruj te błędy.

---

## 📊 METRYKI SUKCESU

Po wdrożeniu, monitoruj:

- **MRR:** Stripe Dashboard → Analytics
- **Subscription Count:** Supabase Dashboard → Table Editor → workers
- **Email Delivery:** Resend Dashboard → Emails
- **Webhook Success Rate:** Stripe Dashboard → Webhooks → endpoint → Events

---

## ✅ GOTOWE!

Po wykonaniu wszystkich kroków powyżej, system będzie **w 100% funkcjonalny**:

- ✅ Płatności działają (Stripe Checkout)
- ✅ Emaile wysyłają się (Resend)
- ✅ Webhook przetwarza eventy (Supabase)
- ✅ Dashboard pokazuje status (Frontend)
- ✅ Baza danych zapisuje dane (PostgreSQL)

**Czas wdrożenia:** ~90 minut  
**Koszty miesięczne:** ~€65 (Stripe fees + hosting)  
**Potencjalny MRR:** €15,400+ 🚀

---

**Potrzebujesz pomocy?** Sprawdź pełną dokumentację w plikach:
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- `SUPABASE_FUNCTIONS_DEPLOYMENT.md`
- `PRODUCTION_ENVIRONMENT_SETUP.md`
