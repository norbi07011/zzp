# 🔧 Supabase Edge Functions (Deno)

Ten folder zawiera **Supabase Edge Functions** napisane w **Deno**, nie Node.js.

## ⚠️ VS Code TypeScript Errors - TO JEST OK!

Jeśli widzisz błędy TypeScript w plikach `.ts` w tym folderze, to jest **normalne**:

```
❌ Cannot find module 'https://deno.land/...'
❌ Cannot find name 'Deno'
```

**Dlaczego?** VS Code używa TypeScript dla Node.js, ale Edge Functions używają Deno runtime.

## ✅ Jak naprawić błędy w VS Code?

### Opcja 1: Zainstaluj Deno Extension (Zalecane)

```bash
# 1. Otwórz Extensions (Ctrl+Shift+X)
# 2. Wyszukaj "Deno"
# 3. Zainstaluj "denoland.vscode-deno"
# 4. Przeładuj VS Code
```

Po instalacji, VS Code automatycznie rozpozna pliki Deno w `supabase/functions/`.

### Opcja 2: Ignoruj błędy (Tymczasowe)

Błędy **NIE WPŁYWAJĄ** na działanie kodu. Pliki będą działać poprawnie po deployment do Supabase.

## 📁 Struktura

```
supabase/functions/
├── stripe-webhook/
│   └── index.ts          # Webhook handler (280 linii)
├── deno.json             # Deno config
└── .vscode/
    └── settings.json     # VS Code Deno settings
```

## 🚀 Deployment

```bash
# 1. Zainstaluj Supabase CLI
npm install -g supabase

# 2. Zaloguj się
supabase login

# 3. Linkuj projekt
supabase link --project-ref your-project-ref

# 4. Deploy funkcji
supabase functions deploy stripe-webhook

# 5. Ustaw sekrety
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📖 Dokumentacja

Pełna dokumentacja deployment i konfiguracji znajduje się w:

- `FAZA6_STRIPE_PAYMENT_COMPLETE.md`
- `FAZA6_QUICK_START.md`

---

**Status:** ✅ Kod jest poprawny (błędy VS Code można zignorować)
