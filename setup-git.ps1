# Script setup Git repository cho dự án DATN
# Chạy script này trong PowerShell: .\setup-git.ps1

Write-Host "🚀 Bắt đầu setup Git repository cho DATN..." -ForegroundColor Green

# Kiểm tra đang ở đúng thư mục
$currentPath = Get-Location
if ($currentPath.Path -notlike "*DATN*") {
    Write-Host "⚠️  Đang ở sai thư mục. Di chuyển vào thư mục DATN..." -ForegroundColor Yellow
    Set-Location "c:\Users\hoang\source\repos\DATN"
}

Write-Host "📁 Thư mục hiện tại: $(Get-Location)" -ForegroundColor Cyan

# Bước 1: Kiểm tra Git đã được cài đặt chưa
Write-Host "`n1️⃣  Kiểm tra Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git đã được cài đặt: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git chưa được cài đặt. Vui lòng cài đặt Git trước." -ForegroundColor Red
    exit 1
}

# Bước 2: Kiểm tra đã có .git folder chưa
Write-Host "`n2️⃣  Kiểm tra Git repository..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "✅ Git repository đã được khởi tạo" -ForegroundColor Green
} else {
    Write-Host "📦 Khởi tạo Git repository mới..." -ForegroundColor Cyan
    git init
    Write-Host "✅ Đã khởi tạo Git repository" -ForegroundColor Green
}

# Bước 3: Cấu hình Git user (nếu chưa có)
Write-Host "`n3️⃣  Cấu hình Git user..." -ForegroundColor Yellow
$gitUser = git config user.name
if ([string]::IsNullOrEmpty($gitUser)) {
    Write-Host "⚠️  Chưa cấu hình Git user. Vui lòng chạy:" -ForegroundColor Yellow
    Write-Host "   git config --global user.name 'Your Name'" -ForegroundColor Cyan
    Write-Host "   git config --global user.email 'your-email@example.com'" -ForegroundColor Cyan
} else {
    Write-Host "✅ Git user: $gitUser" -ForegroundColor Green
}

# Bước 4: Thêm remote GitHub
Write-Host "`n4️⃣  Cấu hình remote GitHub..." -ForegroundColor Yellow
try {
    $remoteUrl = git remote get-url origin 2>$null
    if ($LASTEXITCODE -eq 0 -and $remoteUrl) {
        Write-Host "✅ Remote đã được cấu hình: $remoteUrl" -ForegroundColor Green
        $updateRemote = Read-Host "Bạn có muốn cập nhật remote URL? (y/n)"
        if ($updateRemote -eq "y") {
            git remote set-url origin https://github.com/Manhhhhh0333/DATN.git
            Write-Host "✅ Đã cập nhật remote URL" -ForegroundColor Green
        }
    } else {
        Write-Host "📡 Thêm remote GitHub..." -ForegroundColor Cyan
        git remote add origin https://github.com/Manhhhhh0333/DATN.git
        Write-Host "✅ Đã thêm remote GitHub" -ForegroundColor Green
    }
} catch {
    Write-Host "📡 Thêm remote GitHub..." -ForegroundColor Cyan
    git remote add origin https://github.com/Manhhhhh0333/DATN.git
    Write-Host "✅ Đã thêm remote GitHub" -ForegroundColor Green
}

# Bước 5: Kiểm tra file .gitignore
Write-Host "`n5️⃣  Kiểm tra .gitignore..." -ForegroundColor Yellow
if (Test-Path .gitignore) {
    Write-Host "✅ File .gitignore đã tồn tại" -ForegroundColor Green
} else {
    Write-Host "⚠️  File .gitignore chưa tồn tại. Đã tạo file .gitignore mặc định." -ForegroundColor Yellow
}

# Bước 6: Thêm file vào Git
Write-Host "`n6️⃣  Thêm file vào Git..." -ForegroundColor Yellow
Write-Host "📋 Đang kiểm tra các file sẽ được thêm..." -ForegroundColor Cyan
git status --short | Select-Object -First 20
Write-Host "`n⚠️  Bạn có muốn thêm tất cả file vào Git? (y/n)" -ForegroundColor Yellow
$addFiles = Read-Host
if ($addFiles -eq "y") {
    git add .
    Write-Host "✅ Đã thêm tất cả file vào Git" -ForegroundColor Green
} else {
    Write-Host "⏭️  Bỏ qua. Bạn có thể chạy 'git add .' sau." -ForegroundColor Yellow
}

# Bước 7: Commit
Write-Host "`n7️⃣  Commit code..." -ForegroundColor Yellow
try {
    git diff --cached --quiet
    $hasStagedChanges = $LASTEXITCODE -ne 0
    
    if ($hasStagedChanges) {
        Write-Host "📝 Có thay đổi cần commit." -ForegroundColor Cyan
        $commitMessage = Read-Host "Nhập commit message (hoặc Enter để dùng message mặc định)"
        if ([string]::IsNullOrEmpty($commitMessage)) {
            $commitMessage = "feat: Initial commit - HiHSK Learning Platform"
        }
        git commit -m $commitMessage
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Đã commit code" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Có lỗi khi commit" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ℹ️  Không có thay đổi nào cần commit" -ForegroundColor Cyan
    }
} catch {
    Write-Host "ℹ️  Không có thay đổi nào cần commit" -ForegroundColor Cyan
}

# Bước 8: Push lên GitHub
Write-Host "`n8️⃣  Push lên GitHub..." -ForegroundColor Yellow
$currentBranch = "main"
try {
    $branchOutput = git branch --show-current 2>$null
    if ($branchOutput -and $branchOutput.Trim()) {
        $currentBranch = $branchOutput.Trim()
    } else {
        git branch -M main
        $currentBranch = "main"
    }
} catch {
    git branch -M main
    $currentBranch = "main"
}

Write-Host "🌿 Branch hiện tại: $currentBranch" -ForegroundColor Cyan
Write-Host "⚠️  Bạn có muốn push lên GitHub? (y/n)" -ForegroundColor Yellow
$pushToGitHub = Read-Host
if ($pushToGitHub -eq "y") {
    Write-Host "📤 Đang push lên GitHub..." -ForegroundColor Cyan
    git push -u origin $currentBranch
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Đã push code lên GitHub thành công!" -ForegroundColor Green
        Write-Host "🔗 Xem tại: https://github.com/Manhhhhh0333/DATN" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Có lỗi khi push. Kiểm tra lại:" -ForegroundColor Red
        Write-Host "   - Đã đăng nhập GitHub chưa?" -ForegroundColor Yellow
        Write-Host "   - Repository có tồn tại không?" -ForegroundColor Yellow
        Write-Host "   - Có quyền truy cập repository không?" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Bỏ qua. Bạn có thể chạy 'git push -u origin $currentBranch' sau." -ForegroundColor Yellow
}

Write-Host "`n✨ Hoàn thành!" -ForegroundColor Green
Write-Host "📚 Xem thêm hướng dẫn trong GIT_WORKFLOW_GUIDE.md" -ForegroundColor Cyan

