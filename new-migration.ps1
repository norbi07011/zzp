# ========================================
# NEW MIGRATION - Create and apply migration
# ========================================
# Usage: .\new-migration.ps1 "add_column_to_employers" "ALTER TABLE employers ADD COLUMN test TEXT;"

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Name,
    
    [Parameter(Mandatory=$true, Position=1)]
    [string]$SQL
)

$ErrorActionPreference = "Stop"

Write-Host "📝 Creating new migration..." -ForegroundColor Cyan
Write-Host "Name: $Name" -ForegroundColor Gray
Write-Host ""

# Create migration file
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationFile = "supabase\migrations\${timestamp}_${Name}.sql"

# Write SQL to migration file
$SQL | Out-File -FilePath $migrationFile -Encoding UTF8 -NoNewline

Write-Host "✅ Migration file created: $migrationFile" -ForegroundColor Green
Write-Host ""
Write-Host "SQL content:" -ForegroundColor Yellow
Write-Host $SQL
Write-Host ""
Write-Host "Pushing to remote database..." -ForegroundColor Cyan

# Push migration to remote
try {
    supabase db push
    Write-Host ""
    Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error applying migration: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Migration file saved but not applied. You can manually push with:" -ForegroundColor Yellow
    Write-Host "  supabase db push" -ForegroundColor Gray
    exit 1
}
