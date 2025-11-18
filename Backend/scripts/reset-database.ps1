$ErrorActionPreference = "Stop"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructurePath = Join-Path $backendPath "src\HiHSK.Infrastructure"
$apiPath = Join-Path $backendPath "src\HiHSK.Api"
$solutionPath = Join-Path $backendPath "*.sln"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reset Database - Xoa va cai lai DB  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$databaseName = "HIHSK"
$serverName = "localhost"

Write-Host "[1/4] Kiem tra ket noi SQL Server..." -ForegroundColor Yellow
try {
    $connectionString = "Server=$serverName;Database=master;Trusted_Connection=True;TrustServerCertificate=True;"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $connection.Close()
    Write-Host "  [OK] Ket noi SQL Server thanh cong" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Loi ket noi SQL Server: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/4] Xoa database '$databaseName'..." -ForegroundColor Yellow
try {
    $dropDbQuery = "USE master; IF EXISTS (SELECT name FROM sys.databases WHERE name = '$databaseName') BEGIN ALTER DATABASE [$databaseName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$databaseName]; END"

    $connectionString = "Server=$serverName;Database=master;Trusted_Connection=True;TrustServerCertificate=True;"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $command = $connection.CreateCommand()
    $command.CommandText = $dropDbQuery
    $command.ExecuteNonQuery() | Out-Null
    $connection.Close()
    Write-Host "  [OK] Database da duoc xoa" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Loi khi xoa database: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/4] Build project va apply migrations..." -ForegroundColor Yellow

Write-Host "  Kiem tra va dong Backend API neu dang chay..." -ForegroundColor Gray
$apiProcesses = @()
$apiProcesses += Get-Process -Name "HiHSK.Api" -ErrorAction SilentlyContinue

$apiDllPath = Join-Path $apiPath "bin\Debug\net8.0\HiHSK.Api.dll"
if (Test-Path $apiDllPath) {
    try {
        $allProcesses = Get-Process -ErrorAction SilentlyContinue
        foreach ($proc in $allProcesses) {
            try {
                $modules = $proc.Modules
                if ($modules) {
                    $hasApiModule = $modules | Where-Object { $_.FileName -like "*HiHSK.Api*" }
                    if ($hasApiModule) {
                        $apiProcesses += $proc
                    }
                }
            } catch {
            }
        }
    } catch {
    }
}

if ($apiProcesses) {
    $uniqueProcesses = $apiProcesses | Select-Object -Unique -Property Id
    Write-Host "  Tim thay Backend API dang chay (PID: $($uniqueProcesses.Id -join ', '))" -ForegroundColor Yellow
    Write-Host "  Dang dong process..." -ForegroundColor Gray
    $uniqueProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        } catch {
        }
    }
    Start-Sleep -Seconds 2
    
    $stillRunning = @()
    foreach ($proc in $uniqueProcesses) {
        $running = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
        if ($running) {
            $stillRunning += $running
        }
    }
    if ($stillRunning) {
        Write-Host "  [WARNING] Mot so process van dang chay, thu dong lai..." -ForegroundColor Yellow
        $stillRunning | ForEach-Object {
            try {
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            } catch {
            }
        }
        Start-Sleep -Seconds 1
    }
    Write-Host "  [OK] Da dong Backend API" -ForegroundColor Green
} else {
    Write-Host "  Backend API khong dang chay" -ForegroundColor Gray
}

$solutionFile = Get-ChildItem -Path $backendPath -Filter "*.sln" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($solutionFile) {
    Push-Location $backendPath
    try {
        Write-Host "  Dang build solution..." -ForegroundColor Gray
        $buildLogFile = Join-Path $scriptPath "build-log.txt"
        $buildResult = & dotnet build $solutionFile.FullName --no-incremental 2>&1 | Tee-Object -FilePath $buildLogFile
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [ERROR] Loi khi build solution!" -ForegroundColor Red
            Write-Host ""
            Write-Host "  Chi tiet loi:" -ForegroundColor Yellow
            $errors = $buildResult | Select-String -Pattern "error|Error" | Select-Object -First 10
            if ($errors) {
                $errors | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
            } else {
                Write-Host $buildResult -ForegroundColor Red
            }
            Write-Host ""
            Write-Host "  Log day du da duoc luu vao: $buildLogFile" -ForegroundColor Yellow
            Pop-Location
            exit 1
        }
        Write-Host "  [OK] Build thanh cong" -ForegroundColor Green
        if (Test-Path $buildLogFile) {
            Remove-Item $buildLogFile -ErrorAction SilentlyContinue
        }
    } catch {
        Write-Host "  [ERROR] Loi khi build: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
} else {
    Write-Host "  Khong tim thay file .sln, build Infrastructure project..." -ForegroundColor Yellow
    Push-Location $infrastructurePath
    try {
        $buildLogFile = Join-Path $scriptPath "build-log.txt"
        $buildResult = & dotnet build --no-incremental 2>&1 | Tee-Object -FilePath $buildLogFile
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [ERROR] Loi khi build Infrastructure!" -ForegroundColor Red
            Write-Host ""
            Write-Host "  Chi tiet loi:" -ForegroundColor Yellow
            $errors = $buildResult | Select-String -Pattern "error|Error" | Select-Object -First 10
            if ($errors) {
                $errors | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
            } else {
                Write-Host $buildResult -ForegroundColor Red
            }
            Write-Host ""
            Write-Host "  Log day du da duoc luu vao: $buildLogFile" -ForegroundColor Yellow
            Pop-Location
            exit 1
        }
        Write-Host "  [OK] Build Infrastructure thanh cong" -ForegroundColor Green
        if (Test-Path $buildLogFile) {
            Remove-Item $buildLogFile -ErrorAction SilentlyContinue
        }
    } catch {
        Write-Host "  [ERROR] Loi khi build Infrastructure: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

Push-Location $infrastructurePath

try {
    Write-Host "  Dang chay: dotnet ef database update..." -ForegroundColor Gray
    $updateResult = & dotnet ef database update --startup-project ../HiHSK.Api 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Migrations da duoc apply thanh cong" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Loi khi apply migrations:" -ForegroundColor Red
        Write-Host $updateResult -ForegroundColor Red
        Pop-Location
        Pop-Location
        exit 1
    }
} catch {
    Write-Host "  [ERROR] Loi khi chay migration: $_" -ForegroundColor Red
    Pop-Location
    Pop-Location
    exit 1
}

Pop-Location
Pop-Location

Write-Host ""
Write-Host "[4/4] Kiem tra database..." -ForegroundColor Yellow
try {
    $connectionString = "Server=$serverName;Database=$databaseName;Trusted_Connection=True;TrustServerCertificate=True;"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $command = $connection.CreateCommand()
    $command.CommandText = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
    $tableCount = $command.ExecuteScalar()
    $connection.Close()
    
    Write-Host "  [OK] Database co $tableCount bang" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Loi khi kiem tra database: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  [OK] Hoan thanh! Database da duoc reset" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ban co the:" -ForegroundColor Yellow
Write-Host "  1. Chay seed data: .\scripts\seed-12-topics-hsk1.sql" -ForegroundColor White
Write-Host "  2. Hoac chay script seed khac trong thu muc scripts" -ForegroundColor White
Write-Host ""

