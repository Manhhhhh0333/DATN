# Auto download and import HSK data
# Run: .\auto_import_hsk.ps1

param(
    [int]$MaxLevel = 6,
    [switch]$SkipDownload,
    [switch]$DryRun
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  HSK VOCABULARY AUTO IMPORTER" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python not installed" -ForegroundColor Red
    Write-Host "  Download at: https://www.python.org/downloads/" -ForegroundColor Gray
    exit 1
}
Write-Host "OK: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Check module requests
Write-Host "Checking module requests..." -ForegroundColor Yellow
python -c "import requests" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Module requests not installed" -ForegroundColor Yellow
    Write-Host "Installing..." -ForegroundColor Yellow
    pip install requests
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Cannot install requests" -ForegroundColor Red
        exit 1
    }
}
Write-Host "OK: Module requests" -ForegroundColor Green
Write-Host ""

# Check Backend API
Write-Host "Checking Backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://localhost:7028/api/health" -SkipCertificateCheck -TimeoutSec 5 -ErrorAction Stop 2>&1
    Write-Host "OK: Backend API is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Backend API not running" -ForegroundColor Red
    Write-Host "  Please start Backend first:" -ForegroundColor Gray
    Write-Host "  cd Backend\src\HiHSK.Api" -ForegroundColor Gray
    Write-Host "  dotnet run" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}
Write-Host ""

# Step 1: Download data
if (-not $SkipDownload) {
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  STEP 1: DOWNLOAD HSK DATA" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Downloading HSK 1-$MaxLevel from GitHub..." -ForegroundColor Yellow
    Write-Host ""
    
    if ($DryRun) {
        Write-Host "[DRY RUN] Will run: python download_hsk_data.py" -ForegroundColor Gray
    } else {
        python download_hsk_data.py
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Download failed" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host ""
} else {
    Write-Host "Skipping download step" -ForegroundColor Gray
    Write-Host ""
}

# Step 2: Check files
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  STEP 2: CHECK FILES" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$dataDir = Join-Path $PSScriptRoot "..\data"
$missingFiles = @()

for ($level = 1; $level -le $MaxLevel; $level++) {
    $file = Join-Path $dataDir "hsk$level.json"
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        $sizeKB = [math]::Round($size / 1KB, 2)
        Write-Host "OK: hsk$level.json ($sizeKB KB)" -ForegroundColor Green
    } else {
        Write-Host "MISSING: hsk$level.json" -ForegroundColor Red
        $missingFiles += $level
    }
}

Write-Host ""

if ($missingFiles.Count -gt 0) {
    Write-Host "WARNING: Missing HSK files: $($missingFiles -join ', ')" -ForegroundColor Yellow
    $continue = Read-Host "Continue with available files? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Step 3: Import to database
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  STEP 3: IMPORT TO DATABASE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN] Will import HSK 1-$MaxLevel" -ForegroundColor Gray
    Write-Host "[DRY RUN] Estimated time: $([math]::Round($MaxLevel * 5, 0)) minutes" -ForegroundColor Gray
} else {
    Write-Host "About to import HSK 1-$MaxLevel into database" -ForegroundColor Yellow
    Write-Host "  Estimated time: $([math]::Round($MaxLevel * 5, 0)) minutes" -ForegroundColor Gray
    Write-Host ""
    $confirm = Read-Host "Confirm import? (y/n)"
    
    if ($confirm -ne "y") {
        Write-Host "Cancelled" -ForegroundColor Red
        exit 0
    }
    
    Write-Host ""
    Write-Host "Importing..." -ForegroundColor Yellow
    Write-Host ""
    
    # Run import script
    python import_hsk_all_levels.py
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Import failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  COMPLETED!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SUCCESS: Imported HSK 1-$MaxLevel" -ForegroundColor Green
Write-Host ""
Write-Host "Check database:" -ForegroundColor Yellow
Write-Host "  SELECT HSKLevel, COUNT(*) FROM Words GROUP BY HSKLevel;" -ForegroundColor Gray
Write-Host ""
