# ========================================
# DB EXEC - Execute SQL on Supabase Database
# ========================================
# Usage: .\db-exec.ps1 -File "migration.sql"
#        .\db-exec.ps1 -Query "SELECT * FROM profiles;"

param(
    [string]$File,
    [string]$Query,
    [switch]$Tables,
    [switch]$Schema
)

$ErrorActionPreference = "Stop"

Write-Host "🗄️  Supabase Database Tool" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Show all tables
if ($Tables) {
    Write-Host "📋 Fetching all tables..." -ForegroundColor Yellow
    supabase db dump --schema public | Select-String "CREATE TABLE"
    exit
}

# Show schema
if ($Schema) {
    Write-Host "📊 Fetching database schema..." -ForegroundColor Yellow
    $schemaFile = "schema_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    supabase db dump --schema public -f $schemaFile
    Write-Host "✅ Schema saved to: $schemaFile" -ForegroundColor Green
    exit
}

# Execute SQL file
if ($File) {
    if (-not (Test-Path $File)) {
        Write-Host "❌ File not found: $File" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📝 Executing SQL file: $File" -ForegroundColor Yellow
    Write-Host ""
    
    # Read and execute file
    supabase db push
    exit
}

# Execute SQL query
if ($Query) {
    Write-Host "🔍 Executing query..." -ForegroundColor Yellow
    Write-Host "Query: $Query" -ForegroundColor Gray
    Write-Host ""
    
    # Create temp migration file
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $tempFile = "supabase\migrations\temp_query_$timestamp.sql"
    
    $Query | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline
    
    try {
        supabase db push
        Write-Host "✅ Query executed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    } finally {
        # Clean up
        if (Test-Path $tempFile) {
            Remove-Item $tempFile
        }
    }
    exit
}

Write-Host "Usage:" -ForegroundColor Yellow
Write-Host "  .\db-exec.ps1 -Tables          # Show all tables"
Write-Host "  .\db-exec.ps1 -Schema          # Export schema"
Write-Host "  .\db-exec.ps1 -File file.sql   # Execute SQL file"
Write-Host "  .\db-exec.ps1 -Query 'SQL...'  # Execute query"
