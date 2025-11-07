# 🚀 Hướng dẫn Push Code lên GitHub

## Bước 1: Kiểm tra Git Repository

Mở PowerShell và chạy:

```powershell
cd c:\Users\hoang\source\repos\DATN
git status
```

## Bước 2: Thêm Remote GitHub (nếu chưa có)

```powershell
# Kiểm tra remote hiện tại
git remote -v

# Nếu chưa có, thêm remote
git remote add origin https://github.com/Manhhhhh0333/DATN.git

# Hoặc nếu đã có nhưng sai URL, sửa lại
git remote set-url origin https://github.com/Manhhhhh0333/DATN.git
```

## Bước 3: Thêm tất cả file vào Git

```powershell
# Thêm tất cả file (trừ những file trong .gitignore)
git add .

# Kiểm tra lại những gì sẽ được commit
git status
```

## Bước 4: Commit code

```powershell
# Commit với message mô tả rõ ràng
git commit -m "feat: Initial commit - HiHSK Learning Platform với LessonTopic và LessonExercise"
```

## Bước 5: Đảm bảo branch là main

```powershell
# Kiểm tra branch hiện tại
git branch

# Nếu không phải main, đổi tên
git branch -M main
```

## Bước 6: Push lên GitHub

```powershell
# Push lên GitHub (lần đầu tiên)
git push -u origin main

# Các lần sau chỉ cần:
git push
```

## Nếu gặp lỗi "Repository not found"

1. Kiểm tra bạn đã đăng nhập GitHub chưa
2. Kiểm tra quyền truy cập repository
3. Có thể cần xác thực lại:
   ```powershell
   git config --global user.name "Manhhhhh0333"
   git config --global user.email "your-email@example.com"
   ```

## Nếu repository trên GitHub đã có code

```powershell
# Pull code từ GitHub trước
git pull origin main --allow-unrelated-histories

# Giải quyết conflicts nếu có, sau đó:
git add .
git commit -m "merge: Merge với code trên GitHub"
git push origin main
```

---

## Sau khi push thành công

1. Vào https://github.com/Manhhhhh0333/DATN
2. Kiểm tra code đã được push lên chưa
3. Tạo README.md để mô tả dự án

