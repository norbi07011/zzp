# 🚀 ZZP Werkplaats - Complete Startup Script
# Uruchamia CAŁY stack: Frontend + Backend + Database

Write-Host "
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     🚀 ZZP WERKPLAATS - FULL STACK STARTUP 🚀          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# =====================================
# STEP 1: Check Prerequisites
# =====================================
Write-Host "`n[1/6] 🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found! Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "  ✓ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ npm not found!" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "  ✓ node_modules found" -ForegroundColor Green
} else {
    Write-Host "  ⚠ node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install
}

# =====================================
# STEP 2: Check Environment Variables
# =====================================
Write-Host "`n[2/6] 📋 Checking environment variables..." -ForegroundColor Yellow

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "  ✓ .env.local found" -ForegroundColor Green
    
    # Read .env.local
    $envContent = Get-Content ".env.local" -Raw
    
    # Check Supabase URL
    if ($envContent -match 'VITE_SUPABASE_URL=(.+)') {
        $supabaseUrl = $matches[1].Trim()
        if ($supabaseUrl -ne "your_supabase_url_here" -and $supabaseUrl -ne "") {
            Write-Host "  ✓ VITE_SUPABASE_URL: $($supabaseUrl.Substring(0, [Math]::Min(30, $supabaseUrl.Length)))..." -ForegroundColor Green
        } else {
            Write-Host "  ✗ VITE_SUPABASE_URL not configured!" -ForegroundColor Red
            Write-Host "    Please set your Supabase URL in .env.local" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ VITE_SUPABASE_URL not found in .env.local" -ForegroundColor Red
    }
    
    # Check Supabase Anon Key
    if ($envContent -match 'VITE_SUPABASE_ANON_KEY=(.+)') {
        $supabaseKey = $matches[1].Trim()
        if ($supabaseKey -ne "your_supabase_anon_key_here" -and $supabaseKey -ne "") {
            Write-Host "  ✓ VITE_SUPABASE_ANON_KEY: [CONFIGURED]" -ForegroundColor Green
        } else {
            Write-Host "  ✗ VITE_SUPABASE_ANON_KEY not configured!" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ⚠ .env.local not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "  ✓ Created .env.local - Please configure it!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ .env.example not found!" -ForegroundColor Red
    }
}

# =====================================
# STEP 3: Check Database Connection
# =====================================
Write-Host "`n[3/6] 🗄️  Checking database connection..." -ForegroundColor Yellow

# Test Supabase connection (if configured)
if ($supabaseUrl -and $supabaseUrl -ne "your_supabase_url_here") {
    try {
        Write-Host "  Testing Supabase connection..." -ForegroundColor Gray
        $response = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "  ✓ Supabase is reachable" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠ Cannot reach Supabase (may need authentication)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ Supabase URL not configured - skipping test" -ForegroundColor Yellow
}

# =====================================
# STEP 4: Check Ports
# =====================================
Write-Host "`n[4/6] 🔌 Checking ports..." -ForegroundColor Yellow

# Check if port 3001 is available
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($port3001) {
    Write-Host "  ⚠ Port 3001 is already in use" -ForegroundColor Yellow
    Write-Host "    PID: $($port3001[0].OwningProcess)" -ForegroundColor Gray
    
    $response = Read-Host "    Kill process and continue? (y/n)"
    if ($response -eq 'y') {
        Stop-Process -Id $port3001[0].OwningProcess -Force
        Write-Host "  ✓ Process killed" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "  ✓ Port 3001 is available" -ForegroundColor Green
}

# =====================================
# STEP 5: Build Check
# =====================================
Write-Host "`n[5/6] 🔨 Checking build status..." -ForegroundColor Yellow

if (Test-Path "dist") {
    Write-Host "  ✓ dist folder exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠ dist folder not found (first run)" -ForegroundColor Yellow
}

# =====================================
# STEP 6: Start Development Server
# =====================================
Write-Host "`n[6/6] 🚀 Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                          ║" -ForegroundColor Cyan
Write-Host "║              🎉 STARTING VITE DEV SERVER 🎉             ║" -ForegroundColor Cyan
Write-Host "║                                                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Run npm run dev
npm run dev

Write-Host "`n`n✨ Server stopped." -ForegroundColor Yellow
