$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$sqlScript = Join-Path $scriptPath "drop-lessons-table.sql"

$serverName = "localhost"
$databaseName = "HIHSK"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Xoa bang Lessons trong database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Dang ket noi den SQL Server..." -ForegroundColor Gray
try {
    $connectionString = "Server=$serverName;Database=$databaseName;Integrated Security=True;TrustServerCertificate=True;"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    Write-Host "  [OK] Ket noi SQL Server thanh cong" -ForegroundColor Green
    $connection.Close()
} catch {
    Write-Host "  [ERROR] Loi ket noi SQL Server: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Dang chay SQL script de xoa bang Lessons..." -ForegroundColor Gray

try {
    $sqlContent = Get-Content $sqlScript -Raw -Encoding UTF8
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    $command = New-Object System.Data.SqlClient.SqlCommand($sqlContent, $connection)
    $command.CommandTimeout = 30
    
    $command.ExecuteNonQuery() | Out-Null
    Write-Host "  [OK] SQL script da duoc chay thanh cong" -ForegroundColor Green
    
    $checkTable = New-Object System.Data.SqlClient.SqlCommand("IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Lessons') SELECT 1 ELSE SELECT 0", $connection)
    $tableExists = $checkTable.ExecuteScalar()
    
    if ($tableExists -eq 0) {
        Write-Host "  [OK] Bang Lessons da duoc xoa thanh cong" -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] Bang Lessons van con ton tai" -ForegroundColor Yellow
    }
    
    $connection.Close()
} catch {
    Write-Host "  [ERROR] Loi khi chay SQL script: $_" -ForegroundColor Red
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
    exit 1
}

Write-Host ""
Write-Host "Hoan thanh!" -ForegroundColor Green

