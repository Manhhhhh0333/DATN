# Script de cap nhat cot ExampleSentence thanh NULL trong database
# Tac gia: HiHSK Development Team
# Ngay: 2025-01-09

# Set encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== CAP NHAT ExampleSentence THANH RONG ===" -ForegroundColor Green
Write-Host ""

# Cau hinh
$connectionString = $env:ConnectionStrings__DefaultConnection
if (-not $connectionString) {
    $connectionString = "Server=localhost;Database=HIHSK;Trusted_Connection=True;TrustServerCertificate=True;"
}

Write-Host "Connection String: $connectionString" -ForegroundColor Yellow
Write-Host ""

# Duong dan den file SQL
$sqlScriptPath = Join-Path $PSScriptRoot "clear_example_sentences.sql"

if (-not (Test-Path $sqlScriptPath)) {
    Write-Host "[ERROR] Khong tim thay file SQL: $sqlScriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Tim thay file SQL: $sqlScriptPath" -ForegroundColor Green
Write-Host ""

# Doc noi dung file SQL
$sqlContent = Get-Content $sqlScriptPath -Raw -Encoding UTF8

# Parse connection string de lay thong tin ket noi
$server = "localhost"
$database = "HIHSK"
$useIntegratedSecurity = $true

if ($connectionString -match "Server=([^;]+)") {
    $server = $matches[1]
}
if ($connectionString -match "Database=([^;]+)") {
    $database = $matches[1]
}

Write-Host "Thong tin ket noi:" -ForegroundColor Cyan
Write-Host "  Server: $server" -ForegroundColor White
Write-Host "  Database: $database" -ForegroundColor White
Write-Host ""

# Xac nhan tu nguoi dung
Write-Host "Ban co chac chan muon cap nhat tat ca ExampleSentence thanh NULL?" -ForegroundColor Yellow
$confirm = Read-Host "Nhap 'y' de tiep tuc hoac phim bat ky de huy"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Da huy thao tac." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "=== BAT DAU CAP NHAT ===" -ForegroundColor Cyan
Write-Host ""

try {
    # Su dung sqlcmd de chay SQL script
    $sqlcmdPath = "sqlcmd"
    
    # Kiem tra xem sqlcmd co san khong
    $sqlcmdExists = Get-Command $sqlcmdPath -ErrorAction SilentlyContinue
    if (-not $sqlcmdExists) {
        Write-Host "[ERROR] Khong tim thay sqlcmd. Vui long cai dat SQL Server Command Line Utilities." -ForegroundColor Red
        Write-Host ""
        Write-Host "Hoac ban co the chay SQL script truc tiep trong SQL Server Management Studio:" -ForegroundColor Yellow
        Write-Host "  $sqlScriptPath" -ForegroundColor White
        exit 1
    }
    
    # Tao file SQL tam voi connection string
    $tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
    
    # Them USE statement vao dau file
    $fullSqlContent = @"
USE [$database];
GO

$sqlContent
"@
    
    Set-Content -Path $tempSqlFile -Value $fullSqlContent -Encoding UTF8
    
    # Chay sqlcmd
    $sqlcmdArgs = @(
        "-S", $server,
        "-d", $database,
        "-E",  # Integrated Security
        "-i", $tempSqlFile,
        "-b"   # Stop on error
    )
    
    Write-Host "Dang chay SQL script..." -ForegroundColor Yellow
    $result = & $sqlcmdPath $sqlcmdArgs 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[OK] Cap nhat thanh cong!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Ket qua:" -ForegroundColor Cyan
        $result | ForEach-Object { Write-Host $_ -ForegroundColor White }
    } else {
        Write-Host ""
        Write-Host "[ERROR] Co loi xay ra khi chay SQL script:" -ForegroundColor Red
        $result | ForEach-Object { Write-Host $_ -ForegroundColor Red }
        exit 1
    }
    
    # Xoa file tam
    Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Loi: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ban co the chay SQL script truc tiep trong SQL Server Management Studio:" -ForegroundColor Yellow
    Write-Host "  $sqlScriptPath" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "=== HOAN THANH ===" -ForegroundColor Green

