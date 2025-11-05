# 🚀 INSTRUKCJA: Utworzenie tabeli project_invites

## ⚠️ Supabase NIE pozwala wykonywać raw SQL przez API
Musisz ręcznie skopiować i wkleić SQL w Dashboard.

---

## 📋 KROKI (5 minut):

### 1️⃣ Otwórz SQL Editor w Supabase Dashboard:
```
https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql
```

### 2️⃣ Skopiuj CAŁĄ zawartość pliku:
```
database-migrations/20251030_2100_create_invites_system.sql
```

### 3️⃣ Wklej w SQL Editor (wielkie pole tekstowe)

### 4️⃣ Kliknij przycisk "RUN" (prawy dolny róg)

### 5️⃣ Zweryfikuj:
```bash
node scripts/verify-invites-table.mjs
```

Powinieneś zobaczyć: ✅ Tabela project_invites istnieje!

---

## 📦 Co zostanie utworzone:

- ✅ ENUM `invite_status` (pending, accepted, rejected, expired)
- ✅ Tabela `project_invites` (14 kolumn)
- ✅ 6 indeksów (performance)
- ✅ 6 RLS policies (bezpieczeństwo)
- ✅ 3 funkcje (expire_old_invites, set_invitee_id_on_accept, generate_invite_token)
- ✅ 1 trigger (auto-dodaje użytkownika do project_members po akceptacji)

---

## ❓ Problemy?

Jeśli pojawi się błąd "already exists" - to OK, znaczy że część już istnieje.

Jeśli inne błędy - skopiuj komunikat i daj znać.

---

## 🎯 Po utworzeniu tabeli:

1. ✅ Zweryfikuj: `node scripts/verify-invites-table.mjs`
2. ✅ Uruchom aplikację: `npm run dev`
3. ✅ Przejdź do Team Dashboard → zakładka "Zaproszenia"
4. ✅ Kliknij "Zaproś członka" i przetestuj!

---

**GOTOWE!** System zaproszeń będzie w pełni funkcjonalny 🎉
