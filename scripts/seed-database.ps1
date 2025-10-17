# =================================================================
# HOLENDERSKA PLATFORMA ZZP - DATABASE SEEDING SCRIPT
# PowerShell script to run database seeding
# =================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ConnectionString = $null,
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseUrl = $null,
    
    [Parameter(Mandatory=$false)]
    [switch]$Supabase = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Local = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$SeedFile = "master-seed.sql"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Magenta = "Magenta"

function Write-ColorOutput($ForegroundColor, $Message) {
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Write-Banner {
    Write-ColorOutput $Cyan "========================================================"
    Write-ColorOutput $Cyan "    HOLENDERSKA PLATFORMA ZZP - DATABASE SEEDING"
    Write-ColorOutput $Cyan "    Populate your database with realistic Dutch data"
    Write-ColorOutput $Cyan "========================================================"
    Write-Host ""
}

function Write-Summary {
    Write-Host ""
    Write-ColorOutput $Green "========================================================"
    Write-ColorOutput $Green "                SEEDING COMPLETED!"
    Write-ColorOutput $Green "========================================================"
    Write-ColorOutput $Yellow "Your database now contains:"
    Write-Host "  • 50+ Dutch companies across all industries"
    Write-Host "  • 200+ ZZP professionals with diverse skills"
    Write-Host "  • 100+ job opportunities in various sectors"
    Write-Host "  • Professional certificates and qualifications"
    Write-Host "  • Authentic reviews and ratings"
    Write-Host ""
    Write-ColorOutput $Cyan "Next Steps:"
    Write-Host "  1. Verify data in your database"
    Write-Host "  2. Test search and filtering functions"
    Write-Host "  3. Continue with FAZA 1 KROK 1.2 - Payment System"
    Write-Host ""
    Write-ColorOutput $Green "Happy coding! 🚀"
    Write-Host ""
}

function Test-Command($Command) {
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Get-DatabaseConnection {
    # Try to detect database connection method
    if ($ConnectionString) {
        return $ConnectionString
    }
    
    if ($DatabaseUrl) {
        return $DatabaseUrl
    }
    
    # Check for environment variables
    $supabaseUrl = $env:SUPABASE_URL
    $supabaseKey = $env:SUPABASE_ANON_KEY
    $postgresUrl = $env:DATABASE_URL
    
    if ($Supabase -and $supabaseUrl) {
        Write-ColorOutput $Yellow "Using Supabase connection..."
        # Convert Supabase URL to PostgreSQL connection string
        $supabaseDbUrl = $supabaseUrl -replace "https://", "postgresql://postgres:"
        $supabaseDbUrl += "@"
        $supabaseDbUrl += ($supabaseUrl -replace "https://", "").Split('.')[0]
        $supabaseDbUrl += ".supabase.co:5432/postgres"
        return $supabaseDbUrl
    }
    
    if ($Local) {
        Write-ColorOutput $Yellow "Using local PostgreSQL connection..."
        return "postgresql://postgres:password@localhost:5432/zzp_platform"
    }
    
    if ($postgresUrl) {
        Write-ColorOutput $Yellow "Using DATABASE_URL environment variable..."
        return $postgresUrl
    }
    
    return $null
}

function Invoke-DatabaseSeed {
    param($DbConnection, $SeedFileName)
    
    Write-ColorOutput $Yellow "Connecting to database..."
    Write-Host "Connection: $($DbConnection -replace 'password:.*?@', 'password:***@')"
    
    if ($DryRun) {
        Write-ColorOutput $Magenta "DRY RUN MODE - No actual database changes will be made"
        Write-Host "Would execute: $SeedFileName"
        return $true
    }
    
    # Check if psql is available
    if (-not (Test-Command "psql")) {
        Write-ColorOutput $Red "Error: psql command not found!"
        Write-Host "Please install PostgreSQL client tools or add psql to your PATH"
        Write-Host ""
        Write-Host "Installation options:"
        Write-Host "  • Windows: Download from https://www.postgresql.org/download/windows/"
        Write-Host "  • Using Chocolatey: choco install postgresql"
        Write-Host "  • Using Scoop: scoop install postgresql"
        return $false
    }
    
    # Verify seed file exists
    $seedPath = Join-Path $PSScriptRoot "database\seeds\$SeedFileName"
    if (-not (Test-Path $seedPath)) {
        Write-ColorOutput $Red "Error: Seed file not found: $seedPath"
        return $false
    }
    
    Write-ColorOutput $Yellow "Executing database seeding..."
    Write-Host "Seed file: $seedPath"
    Write-Host ""
    
    try {
        # Execute the seed file
        $psqlCommand = "psql `"$DbConnection`" -f `"$seedPath`""
        
        if ($Verbose) {
            Write-ColorOutput $Cyan "Executing: $psqlCommand"
        }
        
        $result = Invoke-Expression $psqlCommand
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput $Green "✓ Database seeding completed successfully!"
            return $true
        } else {
            Write-ColorOutput $Red "✗ Database seeding failed with exit code: $LASTEXITCODE"
            return $false
        }
    }
    catch {
        Write-ColorOutput $Red "✗ Error executing seed file: $($_.Exception.Message)"
        return $false
    }
}

function Show-Help {
    Write-Host ""
    Write-ColorOutput $Cyan "Usage:"
    Write-Host "  .\seed-database.ps1 [OPTIONS]"
    Write-Host ""
    Write-ColorOutput $Cyan "Options:"
    Write-Host "  -ConnectionString <string>   PostgreSQL connection string"
    Write-Host "  -DatabaseUrl <string>        Database URL (alternative to connection string)"
    Write-Host "  -Supabase                    Use Supabase connection (requires SUPABASE_URL env var)"
    Write-Host "  -Local                       Use local PostgreSQL (localhost:5432)"
    Write-Host "  -DryRun                      Show what would be done without executing"
    Write-Host "  -Verbose                     Show detailed output"
    Write-Host "  -SeedFile <string>           Specific seed file to run (default: master-seed.sql)"
    Write-Host ""
    Write-ColorOutput $Cyan "Examples:"
    Write-Host "  .\seed-database.ps1 -Local"
    Write-Host "  .\seed-database.ps1 -Supabase"
    Write-Host "  .\seed-database.ps1 -ConnectionString `"postgresql://user:pass@host:5432/db`""
    Write-Host "  .\seed-database.ps1 -DryRun -Verbose"
    Write-Host ""
    Write-ColorOutput $Cyan "Environment Variables:"
    Write-Host "  SUPABASE_URL                 Your Supabase project URL"
    Write-Host "  SUPABASE_ANON_KEY           Your Supabase anonymous key"
    Write-Host "  DATABASE_URL                 PostgreSQL connection URL"
    Write-Host ""
}

# =================================================================
# MAIN EXECUTION
# =================================================================

# Check for help request
if ($args -contains "-help" -or $args -contains "--help" -or $args -contains "-h") {
    Write-Banner
    Show-Help
    exit 0
}

# Show banner
Write-Banner

# Validate parameters
if (-not $Supabase -and -not $Local -and -not $ConnectionString -and -not $DatabaseUrl) {
    Write-ColorOutput $Yellow "No connection method specified. Attempting auto-detection..."
}

# Get database connection
$dbConnection = Get-DatabaseConnection

if (-not $dbConnection) {
    Write-ColorOutput $Red "Error: No database connection could be established!"
    Write-Host ""
    Write-Host "Please specify a connection method:"
    Write-Host "  • Use -Local for local PostgreSQL"
    Write-Host "  • Use -Supabase for Supabase (requires SUPABASE_URL env var)"
    Write-Host "  • Use -ConnectionString with your PostgreSQL connection string"
    Write-Host "  • Set DATABASE_URL environment variable"
    Write-Host ""
    Write-Host "Run with -help for more information"
    exit 1
}

# Verify we're in the right directory
if (-not (Test-Path "database\seeds")) {
    Write-ColorOutput $Red "Error: database\seeds directory not found!"
    Write-Host "Please run this script from the project root directory"
    exit 1
}

# Execute the seeding
Write-ColorOutput $Yellow "Starting database seeding process..."
Write-Host "Target: $($dbConnection -replace 'password:.*?@', 'password:***@')"
Write-Host "Seed file: $SeedFile"
Write-Host ""

$success = Invoke-DatabaseSeed -DbConnection $dbConnection -SeedFileName $SeedFile

if ($success) {
    Write-Summary
    exit 0
} else {
    Write-ColorOutput $Red "Database seeding failed. Please check the error messages above."
    Write-Host ""
    Write-Host "Common solutions:"
    Write-Host "  • Verify your database connection details"
    Write-Host "  • Ensure the database exists and is accessible"
    Write-Host "  • Check that you have the necessary permissions"
    Write-Host "  • Make sure PostgreSQL client (psql) is installed"
    Write-Host ""
    exit 1
}