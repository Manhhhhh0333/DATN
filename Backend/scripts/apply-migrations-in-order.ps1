[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructureProject = Join-Path $backendPath "src\HiHSK.Infrastructure"

Write-Host "Apply migrations theo thu tu dung..." -ForegroundColor Green

if (-not (Test-Path $infrastructureProject)) {
    Write-Host "Loi: Khong tim thay project tai $infrastructureProject" -ForegroundColor Red
    exit 1
}

Push-Location $infrastructureProject
try {
    Write-Host "`nBuoc 1: Build project..." -ForegroundColor Yellow
    dotnet build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build that bai!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`nBuoc 2: Apply migrations tao bang truoc..." -ForegroundColor Yellow
    
    $migrations = @(
        "20251101173058_InitialCreate",
        "20251102172321_CompleteDatabaseRedesign",
        "20251106145124_SeedHSK1Data",
        "20251106192834_SeedVocabularyTopicHsk1",
        "20251107135905_AddLessonTopicAndExercise"
    )
    
    foreach ($migration in $migrations) {
        Write-Host "`n  Applying: $migration" -ForegroundColor Cyan
        dotnet ef database update $migration --startup-project ../HiHSK.Api
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ❌ Loi khi apply $migration" -ForegroundColor Red
            exit 1
        }
        Write-Host "  ✅ OK" -ForegroundColor Green
    }
    
    Write-Host "`nBuoc 3: Apply migration seed (neu bang da ton tai)..." -ForegroundColor Yellow
    Write-Host "  Migration: 20250116000000_Seed12LessonTopicsHsk1" -ForegroundColor Cyan
    
    dotnet ef database update 20250116000000_Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Da apply migrations thanh cong!" -ForegroundColor Green
    }
    else {
        Write-Host "`n⚠️  Migration seed co the that bai neu bang chua ton tai" -ForegroundColor Yellow
        Write-Host "  Chay SQL seed thay the: Backend/scripts/seed-12-topics-hsk1.sql" -ForegroundColor Cyan
    }
    
    Write-Host "`nBuoc 4: Apply migration cuoi cung..." -ForegroundColor Yellow
    Write-Host "  Migration: 20251109020524_UpdateSeedHSK1DataWithoutLessons" -ForegroundColor Cyan
    
    dotnet ef database update --startup-project ../HiHSK.Api
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Hoan thanh!" -ForegroundColor Green
    }
}
catch {
    Write-Host "Loi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}

