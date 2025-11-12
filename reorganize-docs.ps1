# 📁 AUTOMATYCZNA REORGANIZACJA DOKUMENTACJI
# Data: 2025-11-12
# Opis: Przenosi 90 plików dokumentacji do nowej struktury CURRENT/ i archive/

Write-Host "🚀 ROZPOCZYNAM REORGANIZACJĘ DOKUMENTACJI..." -ForegroundColor Cyan
Write-Host ""

$docPath = "c:\AI PROJEKT\zzp-werkplaats (3)\documentation"
Set-Location $docPath

# ======================================
# KROK 1: TWORZENIE STRUKTURY FOLDERÓW
# ======================================

Write-Host "📂 KROK 1: Tworzenie struktury folderów..." -ForegroundColor Yellow

$currentFolders = @(
    "CURRENT\architecture",
    "CURRENT\dashboards",
    "CURRENT\payment",
    "CURRENT\deployment",
    "CURRENT\quickstart",
    "CURRENT\public-pages",
    "CURRENT\troubleshooting",
    "CURRENT\plans"
)

$archiveFolders = @(
    "archive\fixes-history",
    "archive\sessions",
    "archive\stripe-history",
    "archive\old-quickstarts",
    "archive\testing",
    "archive\migrations",
    "archive\implementation-phases",
    "archive\worker-profile-history"
)

foreach ($folder in $currentFolders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  ✅ Utworzono: $folder" -ForegroundColor Green
    }
}

foreach ($folder in $archiveFolders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  ✅ Utworzono: $folder" -ForegroundColor Green
    }
}

Write-Host ""

# ======================================
# KROK 2: PRZENOSZENIE AKTUALNYCH PLIKÓW DO CURRENT/
# ======================================

Write-Host "📝 KROK 2: Przenoszenie aktualnych plików do CURRENT/..." -ForegroundColor Yellow

# Architecture
$architectureFiles = @(
    "LOGIKA_SYSTEMU_VERIFIED_BY_MCP.md",
    "RLS_POLICIES_COMPLETE_VERIFICATION.md",
    "DIAGRAM_BAZY_DANYCH.md",
    "ANALIZA_SCHEMATU_KOMPLETNA.md",
    "RAPORT_BAZA_DANYCH_STATUS.md"
)

foreach ($file in $architectureFiles) {
    if (Test-Path $file) {
        Move-Item $file "CURRENT\architecture\" -Force
        Write-Host "  ✅ $file → CURRENT\architecture\" -ForegroundColor Green
    }
}

# Dashboards
$dashboardFiles = @(
    "ADMIN_PANEL_100_PERCENT_COMPLETE.md",
    "ADMIN_PERFORMANCE_PAGE_COMPLETION.md",
    "FAZA2_EMPLOYER_DASHBOARD_COMPLETE.md",
    "FAZA3_WORKER_DASHBOARD_COMPLETE.md",
    "WORKER_PROFILE_1000_PERCENT_COMPLETE.md"
)

foreach ($file in $dashboardFiles) {
    if (Test-Path $file) {
        Move-Item $file "CURRENT\dashboards\" -Force
        Write-Host "  ✅ $file → CURRENT\dashboards\" -ForegroundColor Green
    }
}

# Payment
$paymentFiles = @(
    "FAZA6_STRIPE_PAYMENT_COMPLETE.md",
    "SUBSCRIPTION_ENFORCEMENT_COMPLETE.md",
    "EMPLOYER_PRICING_UPDATE.md"
)

foreach ($file in $paymentFiles) {
    if (Test-Path $file) {
        Move-Item $file "CURRENT\payment\" -Force
        Write-Host "  ✅ $file → CURRENT\payment\" -ForegroundColor Green
    }
}

# Deployment
$deploymentFiles = @(
    "DEPLOYMENT_GUIDE_ZZP_EXAM.md",
    "INSTRUKCJA_DEPLOYMENT_KROK_PO_KROKU.md",
    "FULL_STACK_STARTUP_GUIDE.md"
)

foreach ($file in $deploymentFiles) {
    if (Test-Path $file) {
        Move-Item $file "CURRENT\deployment\" -Force
        Write-Host "  ✅ $file → CURRENT\deployment\" -ForegroundColor Green
    }
}

# Quickstart
if (Test-Path "QUICK_START_15MIN.md") {
    Move-Item "QUICK_START_15MIN.md" "CURRENT\quickstart\" -Force
    Write-Host "  ✅ QUICK_START_15MIN.md → CURRENT\quickstart\" -ForegroundColor Green
}

# Public pages
$publicFiles = @(
    "FAZA5_LANDING_PAGE_COMPLETE.md",
    "PUBLIC_PAGES_CONTENT_UPDATE_COMPLETE.md",
    "HOMEPAGE_COMPLETE_OVERHAUL_2025.md"
)

foreach ($file in $publicFiles) {
    if (Test-Path $file) {
        Move-Item $file "CURRENT\public-pages\" -Force
        Write-Host "  ✅ $file → CURRENT\public-pages\" -ForegroundColor Green
    }
}

# Troubleshooting
$troubleFiles = @(
    "SERVER_TROUBLESHOOTING_GUIDE.md",
    "DEBUG_AUTH_IN_BROWSER.md"
)

foreach ($file in $troubleFiles) {
    if (Test-Path $file) {
        Move-Item $file "CURRENT\troubleshooting\" -Force
        Write-Host "  ✅ $file → CURRENT\troubleshooting\" -ForegroundColor Green
    }
}

# Plans folder
if (Test-Path "PLAN_ROZBUDOWY_I_NAPRAW") {
    Move-Item "PLAN_ROZBUDOWY_I_NAPRAW" "CURRENT\plans\" -Force
    Write-Host "  ✅ PLAN_ROZBUDOWY_I_NAPRAW → CURRENT\plans\" -ForegroundColor Green
}

Write-Host ""

# ======================================
# KROK 3: ARCHIWIZACJA PRZESTARZAŁYCH PLIKÓW
# ======================================

Write-Host "🗄️  KROK 3: Archiwizacja przestarzałych plików..." -ForegroundColor Yellow

# Fixes history
$fixesFiles = @(
    "ALL_FIXED_REPORT.md",
    "FIX_404_406_PAYMENT_ERRORS.md",
    "FIX_406_404_TIMEOUT_COMPLETE.md",
    "FIX_406_COMPLETE_STATUS.md",
    "FIX_408_TIMEOUT_COMPLETE.md",
    "FIX_408_TIMEOUT_RLS_ISSUE.md",
    "FIX_COLUMNS_README.md",
    "FIX_DENO_TYPESCRIPT_ERRORS.md",
    "FIX_INFINITE_RECURSION_README.md",
    "FIX_LOGIN_HANGING.md",
    "FIX_PROFILE_PAYMENT_STATUS.md",
    "FIX_ROUTING_PROBLEM.md",
    "FIX_SUPABASE_SECRETS.md",
    "FIX_USER_ROLES_VCA_COMPLETE.md",
    "FIX_3_PAYMENT_BOXES.md",
    "PAYMENT_ERRORS_FIXED_REPORT.md",
    "PROFILE_FIX_NOW.md",
    "ROUTING_PROBLEM_SOLUTION.md",
    "TYPEOF_FIX.md",
    "TESTING_RLS_FIX.md"
)

foreach ($file in $fixesFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\fixes-history\" -Force
        Write-Host "  📦 $file → archive\fixes-history\" -ForegroundColor Cyan
    }
}

# Sessions
$sessionFiles = @(
    "SESSION_COMPLETE_SUMMARY.md",
    "FINAL_STATUS_REPORT.md",
    "FINAL_STEPS.md",
    "FINAL_QUICK_START_FIX.md",
    "KROK3.2_SUMMARY.md",
    "FAZA3_KROK3.2_PROFILE_COMPLETE.md",
    "PODSUMOWANIE_KOMPLETNE.md",
    "OPCJA_A_MIGRATION_SUMMARY.md"
)

foreach ($file in $sessionFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\sessions\" -Force
        Write-Host "  📦 $file → archive\sessions\" -ForegroundColor Cyan
    }
}

# Stripe history
$stripeFiles = @(
    "STRIPE_AUDIT_REPORT.md",
    "STRIPE_FIX_STATUS.md",
    "STRIPE_SECRET_KEY_FIX.md",
    "STRIPE_SUPABASE_FINAL_REPORT.md",
    "SUBSCRIPTION_MIGRATION_INSTRUCTIONS.md",
    "SUBSCRIPTION_PAYMENT_FIX_REPORT.md",
    "SUBSCRIPTION_SYSTEM_PROGRESS.md"
)

foreach ($file in $stripeFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\stripe-history\" -Force
        Write-Host "  📦 $file → archive\stripe-history\" -ForegroundColor Cyan
    }
}

# Old quickstarts
$oldQuickstarts = @(
    "QUICK_START_90MIN.md",
    "QUICK_START_ABONAMENT.md",
    "QUICK_START_FAZA2_TESTING.md",
    "QUICK_FIX_GUIDE.md",
    "QUICK_FIX_USER_ROLES.md",
    "PROFILE_QUICK_START.md",
    "PERFORMANCE_DASHBOARD_QUICK_START.md",
    "FAZA6_QUICK_START.md"
)

foreach ($file in $oldQuickstarts) {
    if (Test-Path $file) {
        Move-Item $file "archive\old-quickstarts\" -Force
        Write-Host "  📦 $file → archive\old-quickstarts\" -ForegroundColor Cyan
    }
}

# Testing
$testingFiles = @(
    "FAZA2_TEST_RESULTS.md",
    "FAZA2_VISUAL_TESTING_CHECKLIST.md",
    "TESTING_CHECKLIST_VIEWS.md",
    "WORKER_PROFILE_TESTING_GUIDE.md",
    "SYSTEM_ANALYSIS_REGISTRATION_SUBSCRIPTIONS.md"
)

foreach ($file in $testingFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\testing\" -Force
        Write-Host "  📦 $file → archive\testing\" -ForegroundColor Cyan
    }
}

# Migrations
$migrationFiles = @(
    "RAPORT_FINALNY_MIGRACJA_2025-10-13.md",
    "VIEW_MIGRATION_COMPLETE_REPORT.md",
    "DEPLOY_FUNCTIONS_NOW.md"
)

foreach ($file in $migrationFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\migrations\" -Force
        Write-Host "  📦 $file → archive\migrations\" -ForegroundColor Cyan
    }
}

# Implementation phases
$implFiles = @(
    "FAZA3_IMPLEMENTATION_PLAN.md",
    "INSTRUKCJE_FAZA_1_ZAKOŃCZONA.md",
    "DEPLOYMENT_STEPS.md"
)

foreach ($file in $implFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\implementation-phases\" -Force
        Write-Host "  📦 $file → archive\implementation-phases\" -ForegroundColor Cyan
    }
}

# Worker profile history
$workerFiles = @(
    "WORKER_PROFILE_100_PERCENT_COMPLETION_REPORT.md",
    "WORKER_PROFILE_COMPLETE_UPGRADE.md",
    "WORKER_PROFILE_FINAL_SUMMARY.md",
    "WORKER_REGISTRATION_FORM_COMPLETE.md"
)

foreach ($file in $workerFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\worker-profile-history\" -Force
        Write-Host "  📦 $file → archive\worker-profile-history\" -ForegroundColor Cyan
    }
}

Write-Host ""

# ======================================
# KROK 4: USUWANIE DUPLIKATÓW
# ======================================

Write-Host "🗑️  KROK 4: Usuwanie duplikatów..." -ForegroundColor Yellow

$toDelete = @(
    "INDEX.md",
    "README_ANALIZA.md",
    "REAL_PROBLEM_DIAGNOSIS.md",
    "ANALIZA_PROJEKTU_PELNA.md",
    "INSTRUKCJA_WDROZENIA.md",
    "ADMIN_PERFORMANCE_PAGE_FEATURES.md",
    "FAZA4_ADMIN_PANEL_COMPLETE.md"
)

foreach ($file in $toDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  🗑️  Usunięto: $file" -ForegroundColor Red
    }
}

Write-Host ""

# ======================================
# PODSUMOWANIE
# ======================================

Write-Host "✅ REORGANIZACJA ZAKOŃCZONA!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 STATYSTYKI:" -ForegroundColor Cyan
Write-Host "  📁 Plików w CURRENT/: ~25" -ForegroundColor White
Write-Host "  🗄️  Plików w archive/: ~58" -ForegroundColor White
Write-Host "  🗑️  Usuniętych duplikatów: 7" -ForegroundColor White
Write-Host ""
Write-Host "📂 NOWA STRUKTURA:" -ForegroundColor Cyan
Write-Host "  ├── CURRENT/" -ForegroundColor White
Write-Host "  │   ├── architecture/ (5 plików)" -ForegroundColor Gray
Write-Host "  │   ├── dashboards/ (5 plików)" -ForegroundColor Gray
Write-Host "  │   ├── payment/ (3 pliki)" -ForegroundColor Gray
Write-Host "  │   ├── deployment/ (3 pliki)" -ForegroundColor Gray
Write-Host "  │   ├── quickstart/ (1 plik)" -ForegroundColor Gray
Write-Host "  │   ├── public-pages/ (3 pliki)" -ForegroundColor Gray
Write-Host "  │   ├── troubleshooting/ (2 pliki)" -ForegroundColor Gray
Write-Host "  │   └── plans/ (folder)" -ForegroundColor Gray
Write-Host "  └── archive/ (8 kategorii)" -ForegroundColor White
Write-Host ""
Write-Host "🎯 NASTĘPNE KROKI:" -ForegroundColor Yellow
Write-Host "  1. Sprawdź strukturę CURRENT/ i archive/" -ForegroundColor White
Write-Host "  2. Zaktualizuj INDEX_DOKUMENTACJI.md" -ForegroundColor White
Write-Host "  3. Zaktualizuj README.md z linkami do CURRENT/" -ForegroundColor White
Write-Host ""
