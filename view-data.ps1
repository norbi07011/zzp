# ========================================
# VIEW DATA - View table data
# ========================================
# Usage: .\view-data.ps1 profiles
#        .\view-data.ps1 employers

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$TableName
)

$ErrorActionPreference = "Stop"

Write-Host "📊 Fetching data from table: $TableName" -ForegroundColor Cyan
Write-Host ""

try {
    # Dump data for specific table
    $result = supabase db dump --data-only --schema public 2>&1 | Select-String -Pattern "COPY.*$TableName|INSERT INTO.*$TableName" -Context 0,10
    
    if ($result) {
        Write-Host $result
    } else {
        Write-Host "⚠️  No data found in table: $TableName" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Fetching full dump to check..." -ForegroundColor Gray
        supabase db dump --data-only --schema public 2>&1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}
