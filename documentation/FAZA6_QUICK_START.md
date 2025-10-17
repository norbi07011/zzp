# 🧪 FAZA 6: QUICK START TESTING GUIDE

## ⚡ SZYBKIE TESTOWANIE (5 minut)

### 1. Sprawdź czy strona działa
✅ Otwórz: http://localhost:3000
✅ Landing page powinien się załadować bez błędów

### 2. Zobacz Premium Section
✅ Przewiń do sekcji "Premium ZZP Certificaat"
✅ Powinny być widoczne:
   - 3-step proces (📝 Aplikuj → 🤝 Spotkanie → 🏆 Certyfikat)
   - Yellow gradient benefits box (6 korzyści)
   - FAQ accordion (8 pytań)

### 3. Sprawdź konsole przeglądarki (F12)
```javascript
// Otwórz Developer Tools (F12) → Console
// Wpisz:
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ❌ Jeśli undefined → Stripe NIE jest skonfigurowany (to OK w development!)
// ✅ Jeśli pokazuje 'pk_test_...' → Stripe skonfigurowany
```

### 4. Test CheckoutButton (wymaga konfiguracji Stripe)

**OPCJA A: Bez konfiguracji Stripe (Mock Mode)**
```
1. Przejdź do Worker Dashboard (trzeba być zalogowanym jako worker)
2. Znajdź przycisk "Upgrade naar Premium - €13/maand"
3. Kliknij przycisk
4. Powinien pojawić się warning:
   "🟠 Betalingen zijn momenteel niet beschikbaar. 
       Configureer Stripe om door te gaan."
5. ✅ TO JEST POPRAWNE zachowanie bez konfiguracji!
```

**OPCJA B: Z konfiguracją Stripe (wymaga Stripe account)**
```
1. Skopiuj .env.example → .env
2. Dodaj klucze Stripe (zobacz FAZA6_STRIPE_PAYMENT_COMPLETE.md)
3. Restartuj dev server (npm run dev)
4. Przejdź do Worker Dashboard
5. Kliknij "Upgrade naar Premium"
6. Powinno pojawić się:
   ❌ "Backend API not implemented. See FAZA6 documentation..."
7. ✅ TO JEST POPRAWNE - backend endpoint jeszcze nie zaimplementowany!
```

---

## 🎯 CO DZIAŁA TERAZ (bez backend API):

✅ **Frontend Payment Flow:**
- CheckoutButton renderuje się poprawnie
- Walidacja konfiguracji Stripe działa
- UI states (loading, error, success) działają
- PaymentSuccess page renderuje się

✅ **Worker Dashboard Integration:**
- SubscriptionPanel pokazuje CheckoutButton
- Premium users widzą "Premium Actief" badge
- Basic users widzą przycisk upgrade

✅ **Landing Page:**
- Premium Certificate Section wyświetla się
- FAQ accordion działa
- Wszystkie gradienty i animacje działają

---

## ⚠️ CO NIE DZIAŁA (wymaga dalszej implementacji):

❌ **Backend API Endpoint:**
```
Brakuje: /api/create-checkout-session
Potrzebne do: Utworzenia Stripe Checkout Session
Estymowany czas: 15-30 minut implementacji
```

❌ **Prawdziwe płatności:**
```
Wymaga:
1. Stripe account
2. Publishable Key w .env
3. Price ID w .env
4. Backend API endpoint
5. Webhook handler deployed do Supabase
```

❌ **Email notifications:**
```
To będzie FAZA 7 (Resend integration)
Estymowany czas: 2-3 godziny
```

---

## 🔧 NASTĘPNE KROKI DLA PEŁNEJ FUNKCJONALNOŚCI:

### Krok 1: Konfiguracja Stripe (30 min)
```bash
# 1. Utwórz konto Stripe (testowe):
https://dashboard.stripe.com/register

# 2. Pobierz klucze API:
https://dashboard.stripe.com/apikeys
→ Publishable key: pk_test_...
→ Secret key: sk_test_...

# 3. Utwórz produkt Premium (€13/month):
https://dashboard.stripe.com/products
→ Skopiuj Price ID: price_...

# 4. Dodaj do .env:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRICE_PREMIUM=price_...
```

### Krok 2: Backend API Implementation (15-30 min)
```typescript
// Utwórz: supabase/functions/create-checkout-session/index.ts
// Zobacz FAZA6_STRIPE_PAYMENT_COMPLETE.md sekcja "Test 3"
```

### Krok 3: Webhook Deployment (15 min)
```bash
# 1. Deploy Supabase Edge Function:
supabase functions deploy stripe-webhook

# 2. Konfiguruj webhook w Stripe Dashboard:
https://dashboard.stripe.com/webhooks
```

### Krok 4: End-to-End Testing (10 min)
```bash
# Test z testową kartą Stripe:
Number: 4242 4242 4242 4242
Expiry: 12/34
CVC:    123
```

---

## 📊 CURRENT STATUS SUMMARY

| Komponent | Status | Uwagi |
|-----------|--------|-------|
| CheckoutButton | ✅ 100% | Gotowy do użycia |
| PaymentSuccess | ✅ 100% | Renderuje się poprawnie |
| Stripe Config | ✅ 100% | Walidacja działa |
| Worker Dashboard | ✅ 100% | Zintegrowany z CheckoutButton |
| Webhook Handler | ✅ 100% | Gotowy do deployment |
| Backend API | ❌ 0% | Wymaga implementacji |
| Stripe Account | ⚠️ Manual | Wymaga ręcznej konfiguracji |
| Production Ready | ⏳ 70% | Brakuje backend + konfiguracja |

---

## 💡 SZYBKIE PORADY:

### Jak przetestować CheckoutButton bez Stripe?
```tsx
// Tymczasowo możesz zakomentować walidację:
// src/components/payment/CheckoutButton.tsx

// PRZED:
if (!isConfigured) {
  setError('Stripe is niet geconfigureerd...');
  return;
}

// PO (tylko do testowania UI!):
// if (!isConfigured) {
//   setError('Stripe is niet geconfigureerd...');
//   return;
// }
```

### Jak symulować Premium user?
```tsx
// src/components/subscription/SubscriptionPanel.tsx
// Linia 34 - zmień mockSubscription:

subscription_tier: 'premium', // Zmień na 'premium'
zzp_certificate_issued: true, // Zmień na true
zzp_certificate_number: 'ZZP-2025-001', // Dodaj numer
```

### Jak sprawdzić TypeScript errors?
```bash
# W terminalu:
npm run build

# Powinno zakończyć się bez błędów
# (ignoruj błędy w supabase/functions/stripe-webhook/index.ts - to Deno)
```

---

## 🎉 READY TO TEST!

Aplikacja jest gotowa do testowania w **Sandbox Mode**.

**Co możesz zrobić TERAZ:**
1. ✅ Przeglądać Landing Page z Premium Section
2. ✅ Testować UI CheckoutButton w Worker Dashboard
3. ✅ Sprawdzać PaymentSuccess page design
4. ✅ Walidować integrację z istniejącym kodem

**Co wymaga konfiguracji Stripe:**
1. ⏳ Prawdziwe płatności
2. ⏳ Przekierowanie do Stripe Checkout
3. ⏳ Webhook events handling

---

**Pytania? Problemy?**
Zobacz: `FAZA6_STRIPE_PAYMENT_COMPLETE.md` - kompletna dokumentacja!
