# ========================================
# DB QUERY - Execute SQL and see results
# ========================================
# Usage: .\db-query.ps1 "SELECT * FROM profiles;"

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Query
)

$ErrorActionPreference = "Stop"

Write-Host "🔍 Executing query..." -ForegroundColor Cyan
Write-Host "Query: $Query" -ForegroundColor Gray
Write-Host ""

# Check available commands
$commands = @(
    @{cmd = "supabase db execute"; desc = "Using db execute"},
    @{cmd = "supabase db query"; desc = "Using db query"},
    @{cmd = "supabase db sql"; desc = "Using db sql"}
)

foreach ($cmdInfo in $commands) {
    Write-Host "Trying: $($cmdInfo.desc)..." -ForegroundColor Yellow
    try {
        $result = Invoke-Expression "$($cmdInfo.cmd) --query `"$Query`"" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $result
            Write-Host ""
            Write-Host "✅ Query executed successfully" -ForegroundColor Green
            exit 0
        }
    } catch {
        # Try next command
        continue
    }
}

# If all commands fail, try alternative approach
Write-Host "Standard commands not available. Using alternative method..." -ForegroundColor Yellow
Write-Host "For now, use: supabase db dump --data-only" -ForegroundColor Gray
