# 🚀 FULL STACK STARTUP GUIDE

## ✅ **QUICK START**

### **Opcja 1: Automatyczny Start (Recommended)**
```powershell
.\start-full-stack.ps1
```

### **Opcja 2: Manualny Start**
```powershell
# 1. Install dependencies (first time only)
npm install

# 2. Configure environment
# Edit .env.local with your Supabase credentials

# 3. Start dev server
npm run dev
```

---

## 📋 **WHAT RUNS?**

### **Frontend (Vite Dev Server)**
- **Port**: 3001
- **URL**: http://localhost:3001
- **Features**:
  - Hot Module Reload (HMR)
  - Fast refresh
  - TypeScript compilation
  - TailwindCSS processing

### **Backend (Supabase)**
- **Type**: Cloud-hosted PostgreSQL + Auth + Storage
- **Connection**: Via .env.local configuration
- **Features**:
  - Real-time database
  - Authentication (Email, OAuth)
  - File storage
  - Edge Functions

---

## 🔧 **CONFIGURATION**

### **1. Supabase Setup**

#### **A. Get Credentials:**
1. Go to https://supabase.com
2. Create/Login to your project
3. Settings → API → Copy:
   - Project URL
   - anon public key

#### **B. Configure .env.local:**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### **2. Database Tables**

**Required tables:**
- `users` - User accounts
- `worker_profiles` - Worker information
- `companies` - Employer information
- `certificates` - Certifications
- `jobs` - Job postings
- `applications` - Job applications
- `messages` - Chat system
- `payments` - Payment records

**Seed database:**
```powershell
# Run migration scripts
node scripts/migrate-database.mjs
```

---

## 🌐 **ACCESSING THE APPLICATION**

### **Public Routes (No Auth Required)**
```
http://localhost:3001/              → Home
http://localhost:3001/about         → About Us
http://localhost:3001/login         → Login
http://localhost:3001/register      → Register
http://localhost:3001/certificates  → Certificates Info
```

### **Worker Routes (Auth Required)**
```
http://localhost:3001/dashboard     → Worker Dashboard
http://localhost:3001/profile       → Worker Profile (6 tabs)
http://localhost:3001/jobs          → Browse Jobs
http://localhost:3001/applications  → My Applications
http://localhost:3001/messages      → Messages
```

### **Admin Routes (Admin Auth Required)**
```
http://localhost:3001/admin/dashboard         → Admin Dashboard
http://localhost:3001/admin/workers           → Manage Workers
http://localhost:3001/admin/employers         → Manage Employers
http://localhost:3001/admin/payments          → Payment Manager
http://localhost:3001/admin/certificates      → Certificate Manager
http://localhost:3001/admin/analytics         → Analytics
http://localhost:3001/admin/reports           → Reports
http://localhost:3001/admin/performance       → Performance
http://localhost:3001/admin/monitoring        → System Monitoring
http://localhost:3001/admin/backup            → Backup & Recovery
http://localhost:3001/admin/settings          → System Settings
http://localhost:3001/admin/documentation     → Admin Docs

... + 13 more admin modules (24 total)
```

---

## 🧪 **TESTING**

### **Test Users (After Seeding)**
```
Worker Account:
Email: worker@test.nl
Password: [set during registration]

Employer Account:
Email: employer@test.nl
Password: [set during registration]

Admin Account:
Email: admin@zzp.nl
Password: [set during registration]
```

### **Test Credentials Creation**
```powershell
# Create test users
node create-admin.mjs
```

---

## 🐛 **TROUBLESHOOTING**

### **Problem: Port 3001 already in use**
```powershell
# Find process
Get-NetTCPConnection -LocalPort 3001

# Kill process
Stop-Process -Id [PID]

# Or use script
.\start-full-stack.ps1
```

### **Problem: Supabase connection failed**
```
Check:
1. ✅ .env.local exists
2. ✅ VITE_SUPABASE_URL is correct
3. ✅ VITE_SUPABASE_ANON_KEY is correct
4. ✅ Supabase project is running
5. ✅ Internet connection works
```

### **Problem: Database tables missing**
```powershell
# Run migrations
cd database
psql -h [your-supabase-host] -U postgres -d postgres -f schema.sql
psql -h [your-supabase-host] -U postgres -d postgres -f seeds/*.sql
```

### **Problem: Build errors**
```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force dist
npm install
npm run dev
```

---

## 📊 **MONITORING**

### **Check Server Status**
```powershell
# Frontend
curl http://localhost:3001

# Supabase REST API
curl https://your-project.supabase.co/rest/v1/
```

### **Check Logs**
```powershell
# Vite dev server logs
# (automatically shown in terminal)

# Browser console
# F12 → Console
```

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **1. Build for Production**
```powershell
npm run build
```

### **2. Preview Production Build**
```powershell
npm run preview
```

### **3. Deploy to Hosting**

**Vercel:**
```bash
vercel deploy
```

**Netlify:**
```bash
netlify deploy --prod
```

**Docker:**
```bash
docker build -t zzp-werkplaats .
docker run -p 80:80 zzp-werkplaats
```

---

## 📚 **DOCUMENTATION**

- **Admin Panel**: See `ADMIN_PANEL_100_PERCENT_COMPLETE.md`
- **Worker Profile**: See `WORKER_PROFILE_COMPLETE_UPGRADE.md`
- **Authentication**: See `docs/AUTH_DEVELOPER_GUIDE.md`
- **API Reference**: `/admin/documentation` (when logged in)

---

## 🎯 **QUICK LINKS**

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend Dev | http://localhost:3001 | Main application |
| Supabase Dashboard | https://app.supabase.com | Database management |
| Vite Config | `vite.config.ts` | Build configuration |
| Environment | `.env.local` | Secrets & config |
| Admin Panel | `/admin/*` | 24 admin modules |

---

## ✅ **STARTUP CHECKLIST**

Before running the app, ensure:

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured with Supabase credentials
- [ ] Supabase project created and running
- [ ] Database tables created (migrations)
- [ ] Test users created (optional)
- [ ] Port 3001 is available

**Then run:**
```powershell
.\start-full-stack.ps1
```

---

*Made with ❤️ for ZZP Werkplaats Platform*
