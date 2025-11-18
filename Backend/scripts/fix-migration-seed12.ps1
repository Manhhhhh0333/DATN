[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
$infrastructureProject = Join-Path $backendPath "src\HiHSK.Infrastructure"
$apiProject = Join-Path $backendPath "src\HiHSK.Api"

Write-Host "Sửa migration Seed12LessonTopicsHsk1..." -ForegroundColor Green

if (-not (Test-Path $infrastructureProject)) {
    Write-Host "Lỗi: Không tìm thấy project tại $infrastructureProject" -ForegroundColor Red
    exit 1
}

Push-Location $infrastructureProject
try {
    Write-Host "`nBước 1: Kiểm tra migration hiện tại..." -ForegroundColor Yellow
    $migrationFile = "Migrations\20250116000000_Seed12LessonTopicsHsk1.cs"
    $designerFile = "Migrations\20250116000000_Seed12LessonTopicsHsk1.Designer.cs"
    
    if (-not (Test-Path $migrationFile)) {
        Write-Host "Lỗi: Không tìm thấy file migration: $migrationFile" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path $designerFile)) {
        Write-Host "⚠️  Không tìm thấy file Designer.cs. Migration có thể không được nhận diện." -ForegroundColor Yellow
        Write-Host "`nBước 2: Xóa migration cũ và tạo lại..." -ForegroundColor Yellow
        
        # Backup nội dung migration
        $migrationContent = Get-Content $migrationFile -Raw
        
        # Xóa migration cũ
        Remove-Item $migrationFile -Force
        Write-Host "  ✅ Đã xóa migration cũ" -ForegroundColor Green
        
        # Build project để đảm bảo snapshot được cập nhật
        Write-Host "`nBước 3: Build project..." -ForegroundColor Yellow
        dotnet build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Build thất bại!" -ForegroundColor Red
            exit 1
        }
        
        # Tạo migration mới với tên tương tự
        Write-Host "`nBước 4: Tạo migration mới..." -ForegroundColor Yellow
        Write-Host "  Lưu ý: Cần tạo migration với timestamp sau AddLessonTopicAndExercise" -ForegroundColor Cyan
        Write-Host "  Chạy lệnh:" -ForegroundColor Cyan
        Write-Host "  dotnet ef migrations add Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api" -ForegroundColor White
        
        Write-Host "`nBước 5: Sau khi tạo migration mới, copy nội dung seed từ migration cũ vào." -ForegroundColor Yellow
        
    }
    else {
        Write-Host "✅ File Designer.cs đã tồn tại" -ForegroundColor Green
        
        Write-Host "`nBước 2: Rebuild project..." -ForegroundColor Yellow
        dotnet build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Build thất bại!" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "`nBước 3: Kiểm tra migrations..." -ForegroundColor Yellow
        $migrations = dotnet ef migrations list --startup-project ../HiHSK.Api 2>&1
        
        if ($migrations -match "Seed12LessonTopicsHsk1") {
            Write-Host "✅ Migration đã được nhận diện" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  Migration chưa được nhận diện. Cần rebuild hoặc tạo lại migration." -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nCách khác: Apply migrations theo thứ tự thủ công" -ForegroundColor Cyan
    Write-Host "  1. dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api" -ForegroundColor White
    Write-Host "  2. Sau đó apply migration seed bằng cách chạy SQL trực tiếp hoặc tạo migration mới" -ForegroundColor White
    
}
catch {
    Write-Host "Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}

