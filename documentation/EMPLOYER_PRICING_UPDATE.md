# 💼 AKTUALIZACJA: EMPLOYER SUBSCRIPTION PRICING

**Data:** 10 października 2025  
**Typ zmiany:** Pricing Model Update  
**Status:** ✅ ZAKOŃCZONE

---

## 📊 NOWE CENY DLA PRACODAWCÓW (EMPLOYERS)

### ✅ Zmiana cen:

| Plan | Stara cena | **NOWA CENA** | Zmiana |
|------|------------|---------------|--------|
| **Basic** | €49/miesiąc | **€13/miesiąc** | -73% ⬇️ |
| **Premium** | €99/miesiąc | **€25/miesiąc** | -75% ⬇️ |
| ~~Enterprise~~ | Custom | **USUNIĘTY** | N/A |

---

## 🎯 NOWY MODEL CENOWY

### 💼 **Basic Plan - €13/miesiąc**

**Limity:**
- ✅ Do 50 wyszukiwań/miesiąc (poprzednio: 100)
- ✅ Do 5 kontaktów/miesiąc (poprzednio: 10)
- ✅ Do 10 zapisanych pracowników (poprzednio: 20)
- ✅ Email support

**Idealny dla:** Małych firm, okazjonalne poszukiwania pracowników

---

### 👑 **Premium Plan - €25/miesiąc**

**Dostęp do WSZYSTKIEGO:**
- ✅ **Nielimitowane wyszukiwania** (poprzednio: 500)
- ✅ **Nielimitowane kontakty** (poprzednio: 50)
- ✅ **Nielimitowani zapisani pracownicy** (poprzednio: 100)
- ✅ Priorytetowe wsparcie 24/7
- ✅ Pełny dostęp do statystyk
- ✅ Zaawansowane filtry i AI matching
- ✅ **Dostęp do Premium workers** (nowa funkcja!)
- ✅ API access
- ✅ Custom integracje

**Idealny dla:** Wszystkie firmy potrzebujące regularnie pracowników

---

## 🔧 ZMIANY TECHNICZNE

### 1. **Stripe Configuration** (`src/config/stripe.ts`)

**PRZED:**
```typescript
products: {
  premiumMonthly: {
    priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM,
    amount: 13,
    currency: 'eur'
  }
}
```

**PO:**
```typescript
products: {
  // Worker subscriptions
  workerPremium: {
    priceId: import.meta.env.VITE_STRIPE_PRICE_WORKER_PREMIUM,
    amount: 13,
    currency: 'eur',
    name: 'Premium ZZP Certificaat (Worker)'
  },
  
  // Employer subscriptions  
  employerBasic: {
    priceId: import.meta.env.VITE_STRIPE_PRICE_EMPLOYER_BASIC,
    amount: 13,
    currency: 'eur',
    name: 'Basic Plan (Employer)'
  },
  
  employerPremium: {
    priceId: import.meta.env.VITE_STRIPE_PRICE_EMPLOYER_PREMIUM,
    amount: 25,
    currency: 'eur',
    name: 'Premium Plan (Employer)'
  }
}
```

---

### 2. **Employer Checkout Button** (NOWY)

**Lokalizacja:** `src/components/payment/EmployerCheckoutButton.tsx`

**Funkcje:**
- Obsługa płatności dla Basic i Premium
- Walidacja konfiguracji Stripe
- Obsługa błędów i loading states
- Różne kolory dla Basic (niebieski) i Premium (złoty)

**Użycie:**
```tsx
<EmployerCheckoutButton
  employerId="employer-123"
  plan="premium"
  currentPlan="basic"
  className="w-full"
/>
```

---

### 3. **Stripe Service Update** (`src/services/stripe.ts`)

**NOWA FUNKCJA:**
```typescript
export const handleEmployerSubscription = async (
  employerId: string, 
  plan: 'basic' | 'premium'
): Promise<void> => {
  const priceId = plan === 'basic' 
    ? STRIPE_CONFIG.products.employerBasic.priceId
    : STRIPE_CONFIG.products.employerPremium.priceId;
    
  const checkoutUrl = await createCheckoutSession(priceId, employerId);
  await redirectToCheckout(checkoutUrl);
};
```

---

### 4. **Subscription Manager** (`pages/employer/SubscriptionManager.tsx`)

**Zmiany:**
- ❌ Usunięto plan "Enterprise"
- ✅ Zmieniono ceny: Basic €13, Premium €25
- ✅ Zintegrowano `EmployerCheckoutButton`
- ✅ Zaktualizowano limity dla Premium (wszystko unlimited)
- ✅ Zmieniono nazwę "Pro" → "Premium"

---

### 5. **Environment Variables** (`.env.example`)

**NOWE ZMIENNE:**
```bash
# Worker Subscription (€13/month)
VITE_STRIPE_PRICE_WORKER_PREMIUM=price_worker_premium_here

# Employer Subscriptions
VITE_STRIPE_PRICE_EMPLOYER_BASIC=price_employer_basic_here      # €13/month
VITE_STRIPE_PRICE_EMPLOYER_PREMIUM=price_employer_premium_here  # €25/month
```

**USUNIĘTA ZMIENNA:**
```bash
VITE_STRIPE_PRICE_PREMIUM  # Zastąpiona przez 3 nowe
```

---

## 📁 ZMODYFIKOWANE PLIKI (6)

```
MODIFIED:
├── src/config/stripe.ts                               (+30 linii)
├── src/services/stripe.ts                             (+25 linii)
├── pages/employer/SubscriptionManager.tsx             (~50 linii zmian)
├── .env.example                                       (+10 linii)

CREATED:
└── src/components/payment/EmployerCheckoutButton.tsx  (NEW - 127 linii)
```

---

## 🔐 STRIPE CONFIGURATION GUIDE

### Krok 1: Utwórz produkty w Stripe Dashboard

```bash
# 1. Przejdź do: https://dashboard.stripe.com/products

# 2. Utwórz 3 produkty:

## Produkt 1: Worker Premium
Name:        Premium ZZP Certificaat
Price:       €13.00 EUR
Billing:     Monthly (recurring)
Description: Maandelijks abonnement voor Premium ZZP Certificaat
→ Skopiuj Price ID → VITE_STRIPE_PRICE_WORKER_PREMIUM

## Produkt 2: Employer Basic
Name:        Basic Plan (Employer)
Price:       €13.00 EUR
Billing:     Monthly (recurring)
Description: Basis toegang - 50 searches, 5 contacten
→ Skopiuj Price ID → VITE_STRIPE_PRICE_EMPLOYER_BASIC

## Produkt 3: Employer Premium
Name:        Premium Plan (Employer)
Price:       €25.00 EUR
Billing:     Monthly (recurring)
Description: Volledige toegang - Unlimited alles
→ Skopiuj Price ID → VITE_STRIPE_PRICE_EMPLOYER_PREMIUM
```

### Krok 2: Zaktualizuj .env

```bash
cp .env.example .env

# Edytuj .env i dodaj:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
VITE_STRIPE_PRICE_WORKER_PREMIUM=price_1...
VITE_STRIPE_PRICE_EMPLOYER_BASIC=price_1...
VITE_STRIPE_PRICE_EMPLOYER_PREMIUM=price_1...
```

### Krok 3: Restartuj dev server

```bash
npm run dev
```

---

## 🧪 TESTOWANIE

### Test 1: Basic Plan dla Employer

```bash
# 1. Zaloguj się jako employer
# 2. Przejdź do: /employer/subscription
# 3. Sprawdź kartę "Basic":
   ✅ Cena: €13/miesiąc
   ✅ Limity: 50 searches, 5 kontakty
   ✅ Przycisk: "Koop Basic - €13/maand"
# 4. Kliknij przycisk → powinno pokazać error (brak backend API)
```

### Test 2: Premium Plan dla Employer

```bash
# 1. W /employer/subscription sprawdź kartę "Premium":
   ✅ Cena: €25/miesiąc
   ✅ Limity: Wszystko unlimited
   ✅ 9 features (włącznie z "Dostęp do Premium workers")
   ✅ Żółty gradient przycisk "Upgrade do Premium - €25/maand"
# 2. Kliknij przycisk → powinno pokazać error (brak backend API)
```

### Test 3: Worker Premium (nie zmienione)

```bash
# 1. Zaloguj się jako worker (Basic tier)
# 2. Przejdź do: /worker → Subscription tab
# 3. Sprawdź:
   ✅ Cena: €13/miesiąc (NIE ZMIENIONE)
   ✅ Przycisk: "Upgrade naar Premium - €13/maand"
```

---

## 📊 PORÓWNANIE WORKER vs EMPLOYER PRICING

| Typ użytkownika | Plan | Cena | Co otrzymuje |
|-----------------|------|------|--------------|
| **Worker** | Basic | €0 | Podstawowy profil |
| **Worker** | Premium | **€13/month** | Premium badge, certyfikat, 3x więcej kontaktów |
| **Employer** | Basic | **€13/month** | 50 searches, 5 kontaktów, 10 saved |
| **Employer** | Premium | **€25/month** | **UNLIMITED wszystko** + Premium workers |

---

## 💰 BUSINESS MODEL

### Przychody z Workers:
- €13/miesiąc × ilość Premium workers
- Target: 1000 Premium workers = **€13,000 MRR**

### Przychody z Employers:
- Basic: €13/miesiąc × ilość Basic employers
- Premium: €25/miesiąc × ilość Premium employers
- Target: 500 Basic + 300 Premium = **€14,000 MRR**

### **TOTAL TARGET MRR: €27,000**

---

## 🚀 DEPLOYMENT CHECKLIST

- [x] Zaktualizowano ceny w SubscriptionManager
- [x] Utworzono EmployerCheckoutButton component
- [x] Zaktualizowano Stripe config (3 produkty)
- [x] Zaktualizowano .env.example
- [x] Dodano nową funkcję handleEmployerSubscription()
- [x] Usunięto plan Enterprise
- [x] 0 TypeScript errors
- [ ] Utworzono produkty w Stripe Dashboard
- [ ] Zaktualizowano .env z Price IDs
- [ ] Testowanie płatności (sandbox mode)
- [ ] Deployment do production

---

## ✅ STATUS

**Zmiany cen dla Employers:** ✅ **ZAKOŃCZONE**

**Gotowe do:**
- ✅ Testowania UI
- ✅ Code review
- ⏳ Konfiguracji Stripe (3 produkty)
- ⏳ Production deployment

**Następny krok:** Konfiguracja Stripe Dashboard z 3 produktami

---

**Autor:** AI Assistant  
**Data:** 10 października 2025  
**Wersja:** 2.0 (Employer Pricing Update)
