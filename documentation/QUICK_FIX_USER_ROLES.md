# 🚀 QUICK START - Fix User Roles

## ⚡ **3 KROKI DO NAPRAWY:**

### **KROK 1: Uruchom SQL**
1. Otwórz: https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql/new
2. Skopiuj **cały plik:** `FIX_USER_ROLES_AND_REMOVE_VCA.sql`
3. Wklej i kliknij **RUN** ▶️

---

### **KROK 2: Wyloguj się i zaloguj ponownie**
❗ **WAŻNE:** Musisz wylogować się aby cache się odświeżył!

---

### **KROK 3: Test**

**Zaloguj jako `worker@test.nl`:**
- ✅ Przekierowanie do `/worker`
- ✅ Worker Dashboard widoczny
- ✅ BRAK zakładki "Kursy VCA"
- ✅ Zakładka "🏆 Certyfikaty" (nie "Weryfikacja VCA")

**Zaloguj jako `employer@test.nl`:**
- ✅ Przekierowanie do `/employer`
- ✅ Employer Dashboard widoczny (nie Worker!)

**Zaloguj jako `admin@zzp.nl`:**
- ✅ Przekierowanie do `/admin`
- ✅ Admin Panel widoczny

---

## ✅ **EXPECTED RESULTS:**

```
worker@test.nl   → /worker   (Worker Dashboard)
employer@test.nl → /employer (Employer Dashboard)  
admin@zzp.nl     → /admin    (Admin Panel)
```

**VCA System:**
- ❌ Kursy VCA - USUNIĘTE
- ✅ Certyfikaty doświadczenia - DODANE

---

**Uruchom `FIX_USER_ROLES_AND_REMOVE_VCA.sql` teraz!** 🎯
