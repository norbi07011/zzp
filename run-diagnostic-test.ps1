# 🧪 DIAGNOSTIC TEST RUNNER - Certyfikaty & ZZP Exams
# Data: 12 listopada 2025
# Zgodnie z: Copilot Instructions (CP1 - Sprawdź MCP przed zmianami)

Write-Host "🧪 ========================================" -ForegroundColor Cyan
Write-Host "🧪 DIAGNOSTIC TEST - CERTYFIKATY & ZZP" -ForegroundColor Cyan
Write-Host "🧪 ========================================" -ForegroundColor Cyan
Write-Host ""

# CP1: Sprawdź czy serwer działa
Write-Host "📋 CP1: Sprawdzanie czy development server działa..." -ForegroundColor Yellow
$serverRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3006" -Method Head -TimeoutSec 2 -ErrorAction Stop
    $serverRunning = $true
    Write-Host "✅ Server działa na http://localhost:3006" -ForegroundColor Green
} catch {
    Write-Host "❌ Server NIE działa" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Uruchom serwer:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "⏸️  Test wstrzymany - uruchom serwer i spróbuj ponownie" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# CP1: Sprawdź czy plik diagnostyczny istnieje
Write-Host "📋 CP1: Sprawdzanie pliku diagnostycznego..." -ForegroundColor Yellow
$diagnosticFile = "diagnostics\certificatesDiagnostic.ts"

if (Test-Path $diagnosticFile) {
    Write-Host "✅ Plik diagnostyczny znaleziony: $diagnosticFile" -ForegroundColor Green
} else {
    Write-Host "❌ BŁĄD: Brak pliku $diagnosticFile" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Instrukcje dla użytkownika
Write-Host "📋 INSTRUKCJE - URUCHOM TESTY MCP W PRZEGLĄDARCE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Otwórz przeglądarkę:" -ForegroundColor Yellow
Write-Host "   http://localhost:3006/admin" -ForegroundColor White
Write-Host ""
Write-Host "2. Zaloguj się jako ADMIN" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Otwórz konsolę (F12)" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Uruchom NOWY TEST MCP:" -ForegroundColor Yellow
Write-Host "   await window.runMCPTests()" -ForegroundColor Green
Write-Host ""
Write-Host "   LUB stary test certyfikatów:" -ForegroundColor Yellow
Write-Host "   window.runCertificateDiagnostics()" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Sprawdź wyniki w konsoli:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ✅ Szukaj: '[table] - OK (COUNT=X, SELECT=X)'" -ForegroundColor Green
Write-Host "   🚨 Szukaj: 'RLS PROBLEM' (jeśli COUNT > SELECT)" -ForegroundColor Red
Write-Host "   📊 Sprawdź: Tabela SUMMARY TABLE" -ForegroundColor Cyan
Write-Host ""

# Sprawdź obecne pliki AdminDashboard
Write-Host "📋 CP1: Analiza plików AdminDashboard..." -ForegroundColor Yellow
$adminDashboard = "pages\AdminDashboard.tsx"

if (Test-Path $adminDashboard) {
    Write-Host "✅ AdminDashboard znaleziony: $adminDashboard" -ForegroundColor Green
    
    # Sprawdź stare ścieżki
    $content = Get-Content $adminDashboard -Raw
    
    Write-Host ""
    Write-Host "🔍 Skanowanie błędnych ścieżek..." -ForegroundColor Yellow
    
    $issues = @()
    
    if ($content -match 'path: "/admin/certificate-approval"') {
        $issues += "❌ Znaleziono: /admin/certificate-approval (STARA ŚCIEŻKA)"
    }
    
    if ($content -match 'path: "/admin/test-scheduler"') {
        $issues += "❌ Znaleziono: /admin/test-scheduler (BŁĘDNA ŚCIEŻKA)"
    }
    
    if ($content -match 'value: "0".*pendingCertificates') {
        $issues += "⚠️  Znaleziono: hardcoded '0' dla certyfikatów"
    }
    
    if ($issues.Count -gt 0) {
        Write-Host ""
        Write-Host "🚨 ZNALEZIONE PROBLEMY:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "   $issue" -ForegroundColor Red
        }
    } else {
        Write-Host "✅ Brak znanych problemów w ścieżkach" -ForegroundColor Green
    }
} else {
    Write-Host "❌ BŁĄD: Brak AdminDashboard.tsx" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 NASTĘPNE KROKI:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Uruchom test w przeglądarce (instrukcje powyżej)" -ForegroundColor White
Write-Host "2. Jeśli test OK → Napraw ścieżki (AdminDashboard.tsx)" -ForegroundColor White
Write-Host "3. Jeśli RLS problem → Sprawdź polityki RLS w Supabase" -ForegroundColor White
Write-Host ""
Write-Host "📖 Szczegóły:" -ForegroundColor Yellow
Write-Host "   - MCP_DIAGNOSTIC_REPORT.md" -ForegroundColor White
Write-Host "   - RAPORT_DIAGNOSTYCZNY_CERTYFIKATY.md" -ForegroundColor White
Write-Host ""
Write-Host "✅ Diagnostic test runner zakończony" -ForegroundColor Green
