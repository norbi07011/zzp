# 🚀 Quick Start - ZZP Werkplaats

## ⚡ Start w 3 Krokach

### 1. Dodaj Service Role Key

W pliku `.env` dodaj brakujący klucz:

```bash
# Otwórz https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/settings/api
# Skopiuj "service_role" key i dodaj tutaj:
SUPABASE_SERVICE_ROLE_KEY=twoj_klucz_tutaj
```

### 2. Utwórz Konto Admina

```bash
node create-test-admin.mjs
```

**Dane logowania:**
- Email: `admin@zzpwerkplaats.nl`
- Hasło: `Admin123!@#`

### 3. Uruchom Aplikację

```bash
npm run dev
```

Przejdź do: http://localhost:5173/login

---

## ✅ Baza Danych - Gotowa!

Wszystkie tabele zostały utworzone:
- ✅ profiles (użytkownicy)
- ✅ workers (pracownicy)
- ✅ employers (pracodawcy)
- ✅ certificates (certyfikaty)
- ✅ jobs (oferty pracy)
- ✅ applications (aplikacje)
- ✅ reviews (opinie)
- ✅ zzp_exam_applications (egzaminy)

## 🔐 Bezpieczeństwo (RLS)

- ✅ Każdy użytkownik widzi tylko swoje dane
- ✅ Admini mają dostęp do wszystkiego
- ✅ Pracodawcy mogą przeglądać pracowników
- ✅ Pracownicy mogą przeglądać oferty pracy

## 🎯 Testowanie

### Panel Admina
http://localhost:5173/login
- Email: admin@zzpwerkplaats.nl
- Hasło: Admin123!@#
- Redirect: `/admin`

### Rejestracja Pracownika
http://localhost:5173/register/worker
- Redirect po rejestracji: `/worker`

### Rejestracja Pracodawcy
http://localhost:5173/register/employer
- Redirect po rejestracji: `/employer/subscription`
- Po opłaceniu subskrypcji: `/employer`

---

## 📚 Więcej Informacji

Pełna dokumentacja: `KONFIGURACJA_BAZY_DANYCH.md`
