# Script setup Git repository đơn giản cho dự án DATN
# Chạy: .\setup-git-simple.ps1

Write-Host "🚀 Setup Git repository cho DATN" -ForegroundColor Green
Write-Host ""

# 1. Khởi tạo Git
Write-Host "1. Khởi tạo Git repository..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "   ✅ Git đã được khởi tạo" -ForegroundColor Green
} else {
    git init
    Write-Host "   ✅ Đã khởi tạo Git" -ForegroundColor Green
}

# 2. Thêm remote
Write-Host ""
Write-Host "2. Cấu hình remote GitHub..." -ForegroundColor Yellow
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "   ✅ Remote origin đã tồn tại" -ForegroundColor Green
    git remote set-url origin https://github.com/Manhhhhh0333/DATN.git
    Write-Host "   ✅ Đã cập nhật remote URL" -ForegroundColor Green
} else {
    git remote add origin https://github.com/Manhhhhh0333/DATN.git
    Write-Host "   ✅ Đã thêm remote GitHub" -ForegroundColor Green
}

# 3. Thêm file
Write-Host ""
Write-Host "3. Thêm file vào Git..." -ForegroundColor Yellow
git add .
Write-Host "   ✅ Đã thêm file" -ForegroundColor Green

# 4. Commit
Write-Host ""
Write-Host "4. Commit code..." -ForegroundColor Yellow
$commitMsg = "feat: Initial commit - HiHSK Learning Platform với LessonTopic và LessonExercise"
git commit -m $commitMsg
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Đã commit" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Có thể đã có commit trước đó" -ForegroundColor Yellow
}

# 5. Đặt branch main
Write-Host ""
Write-Host "5. Đặt branch là main..." -ForegroundColor Yellow
git branch -M main
Write-Host "   ✅ Branch: main" -ForegroundColor Green

# 6. Push
Write-Host ""
Write-Host "6. Push lên GitHub..." -ForegroundColor Yellow
Write-Host "   ⚠️  Bạn sẽ cần nhập thông tin đăng nhập GitHub" -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Hoàn thành! Code đã được push lên GitHub" -ForegroundColor Green
    Write-Host "🔗 Xem tại: https://github.com/Manhhhhh0333/DATN" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Có lỗi khi push. Kiểm tra:" -ForegroundColor Red
    Write-Host "   - Đã đăng nhập GitHub chưa?" -ForegroundColor Yellow
    Write-Host "   - Repository có tồn tại không?" -ForegroundColor Yellow
    Write-Host "   - Có quyền truy cập không?" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Xong!" -ForegroundColor Green

