# 🚀 SERWER URUCHOMIONY - INSTRUKCJA UŻYTKOWANIA

## ✅ **STATUS: ONLINE**

```
✓ Vite Development Server: RUNNING
✓ Port: 3001
✓ URL: http://localhost:3001/
✓ Hot Module Reload: ENABLED
✓ No compilation errors
```

---

## 🌐 **JAK OTWORZYĆ APLIKACJĘ?**

### **Metoda 1: Kliknij Link (Recommended)**
W terminalu VS Code powinna być widoczna linia:
```
➜  Local:   http://localhost:3001/
```
**CTRL + Click** na ten link

### **Metoda 2: Przeglądarka**
1. Otwórz przeglądarkę (Chrome/Edge/Firefox)
2. Wpisz w pasek adresu:
   ```
   http://localhost:3001
   ```
3. Naciśnij ENTER

### **Metoda 3: PowerShell Command**
```powershell
Start-Process "http://localhost:3001"
```

---

## 🔍 **CO POWINNO SIĘ POKAZAĆ?**

### **Strona Główna (Home Page)**
- Header z logo "ZZP Werkplaats"
- Navigation menu (Home, About, Certificates, For Employers, Contact)
- Hero section z CTA buttons
- Footer

### **Jeśli widzisz błąd "ERR_CONNECTION_REFUSED":**

#### **PROBLEM 1: Serwer się zatrzymał**
**Sprawdź terminal:**
- Czy widzisz: `VITE v6.3.6  ready in 187 ms`?
- Czy terminal jest aktywny (nie pokazuje błędów)?

**Rozwiązanie:**
```powershell
# Zatrzymaj serwer (jeśli działa)
CTRL + C

# Uruchom ponownie
npm run dev
```

#### **PROBLEM 2: Zły port**
**Sprawdź który port używa Vite:**
W terminalu szukaj linii:
```
➜  Local:   http://localhost:XXXX/
```

Użyj tego portu zamiast 3001.

#### **PROBLEM 3: Firewall blokuje**
**Windows Firewall może blokować:**
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Dodaj Node.js

---

## 🧪 **TESTOWANIE STRON**

### **Publiczne Strony (Bez logowania):**
```
http://localhost:3001/              → Home Page
http://localhost:3001/about         → About Us
http://localhost:3001/login         → Login Form
http://localhost:3001/register      → Registration
http://localhost:3001/certificates  → Certificates Info
http://localhost:3001/employers     → For Employers
http://localhost:3001/contact       → Contact Form
```

### **Worker Profile (Wymaga logowania):**
```
http://localhost:3001/profile       → Worker Profile
  └─ Tab 1: 📊 Overview (Quick Stats)
  └─ Tab 2: 👤 Basic Info (Edit Profile)
  └─ Tab 3: ⚡ Skills (Add/Remove Skills)
  └─ Tab 4: 📜 Certificates (View Certs)
  └─ Tab 5: 🎨 Portfolio (Projects)
  └─ Tab 6: ⚙️ Settings (Preferences)
```

### **Admin Panel (Wymaga admin auth):**
```
http://localhost:3001/admin/dashboard    → Main Dashboard

CORE MANAGEMENT:
http://localhost:3001/admin/workers      → Workers Manager
http://localhost:3001/admin/employers    → Employers Manager
http://localhost:3001/admin/payments     → Payments Manager
http://localhost:3001/admin/certificates → Certificates Manager

ANALYTICS & REPORTS:
http://localhost:3001/admin/analytics    → Data Analytics
http://localhost:3001/admin/reports      → Reports Manager
http://localhost:3001/admin/performance  → Performance Manager

SYSTEM ADMIN:
http://localhost:3001/admin/monitoring   → System Monitoring
http://localhost:3001/admin/backup       → Backup & Recovery
http://localhost:3001/admin/settings     → System Settings
http://localhost:3001/admin/documentation → Admin Docs

... + 13 więcej modułów (24 total)
```

---

## 🐛 **TROUBLESHOOTING**

### **Biała Strona (White Screen)**

#### **1. Sprawdź Console**
1. Otwórz stronę: http://localhost:3001
2. Naciśnij **F12** (Developer Tools)
3. Przejdź do zakładki **Console**
4. Czy są czerwone błędy?

**Częste błędy:**
- `Failed to fetch` → Supabase not configured (OK, używa mock data)
- `Module not found` → Sprawdź czy serwer działa
- `Unexpected token` → Błąd składni (sprawdź terminal)

#### **2. Sprawdź Network**
1. F12 → Network tab
2. Odśwież stronę (F5)
3. Czy widzisz request do `localhost:3001`?
4. Jaki status? (200 = OK, 404 = Not Found, 500 = Server Error)

#### **3. Sprawdź Terminal**
Szukaj błędów kompilacji:
```
✗ Build failed
✗ Error: ...
```

Jeśli są błędy:
```powershell
# Zatrzymaj (CTRL+C) i restart
npm run dev
```

### **ERR_CONNECTION_REFUSED**

**Oznacza to że serwer NIE DZIAŁA.**

**Krok 1: Sprawdź czy proces działa**
```powershell
Get-Process node | Where-Object {$_.Path -like "*node.exe"}
```

**Krok 2: Sprawdź port**
```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
```

Jeśli pusty wynik = port wolny = serwer nie działa!

**Krok 3: Uruchom ponownie**
```powershell
npm run dev
```

### **Serwer Startuje Ale Crash**

Sprawdź logi w terminalu:
```
[vite] Internal server error: ...
```

**Częste przyczyny:**
- Brak node_modules → `npm install`
- Błąd w kodzie → Sprawdź ostatnie zmiany
- Port zajęty → Zmień port w vite.config.ts

---

## ⚡ **SZYBKI DEBUG**

### **Test 1: Czy serwer działa?**
```powershell
curl http://localhost:3001
```
**Oczekiwany wynik:** HTML strony (długi tekst)
**Błąd:** `curl: (7) Failed to connect` = Serwer nie działa!

### **Test 2: Który port używa Vite?**
Sprawdź terminal:
```
➜  Local:   http://localhost:XXXX/
```
Użyj tego portu!

### **Test 3: Czy są błędy kompilacji?**
W terminalu szukaj:
```
✓ = OK (zielone)
✗ = BŁĄD (czerwone)
⚠ = WARNING (żółte)
```

---

## 📞 **JEŚLI NADAL NIE DZIAŁA**

### **Opcja 1: Full Restart**
```powershell
# 1. Zatrzymaj serwer
CTRL + C

# 2. Wyczyść cache
npm run build

# 3. Uruchom ponownie
npm run dev
```

### **Opcja 2: Reinstall Dependencies**
```powershell
# 1. Zatrzymaj serwer
CTRL + C

# 2. Usuń node_modules
Remove-Item -Recurse -Force node_modules

# 3. Reinstall
npm install

# 4. Start
npm run dev
```

### **Opcja 3: Check Package.json**
```powershell
# Sprawdź czy dev script istnieje
Get-Content package.json | Select-String '"dev"'
```

Powinna być linia:
```json
"dev": "vite",
```

---

## ✅ **CHECKLIST PRZED ZGŁOSZENIEM PROBLEMU**

Sprawdź:
- [ ] Terminal pokazuje: `VITE v6.3.6  ready in XXX ms`
- [ ] Widzę URL: `http://localhost:3001/`
- [ ] Nie ma czerwonych błędów w terminalu
- [ ] Port 3001 jest wolny (lub użyj pokazanego portu)
- [ ] Firewall nie blokuje Node.js
- [ ] Przeglądarka działa (test: google.com)
- [ ] Używam poprawnego URL (localhost:3001, nie 3000 ani 3002)

---

## 🎯 **AKTUALNY STATUS**

```
✓ Vite Server: RUNNING
✓ Port: 3001
✓ URL: http://localhost:3001/
✓ Compilation: SUCCESS (no errors)
✓ Worker Profile: UPGRADED (6 tabs)
✓ Admin Panel: COMPLETE (24 modules)
✓ Mock Data: ACTIVE (Supabase optional)
```

**APLIKACJA JEST GOTOWA!**

Otwórz: **http://localhost:3001/** w przeglądarce! 🚀

---

*Jeśli widzisz białą stronę lub błąd - uruchom krok po kroku debug powyżej.*
