# 🔧 Setup Git Repository cho Dự án DATN

## Vấn đề hiện tại
Git repository đang ở thư mục cha, không phải trong thư mục DATN. Cần khởi tạo repository mới trong DATN.

## Các bước thực hiện

### Bước 1: Khởi tạo Git repository trong DATN

```powershell
cd c:\Users\hoang\source\repos\DATN
git init
```

### Bước 2: Cấu hình Git (nếu chưa có)

```powershell
git config user.name "Manhhhhh0333"
git config user.email "your-email@example.com"
```

### Bước 3: Thêm remote GitHub

```powershell
git remote add origin https://github.com/Manhhhhh0333/DATN.git
```

### Bước 4: Thêm tất cả file vào Git

```powershell
git add .
```

### Bước 5: Commit

```powershell
git commit -m "feat: Initial commit - HiHSK Learning Platform

- Backend: .NET 8.0 API với Entity Framework Core
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Features: Authentication, Courses, Lessons, Vocabulary Topics, Quiz
- Database: SQL Server với migrations
- Thêm LessonTopic và LessonExercise entities cho cấu trúc mới"
```

### Bước 6: Push lên GitHub

```powershell
git branch -M main
git push -u origin main
```

## Nếu repository trên GitHub đã có code

Nếu repository trên GitHub đã có code (không phải empty), cần pull trước:

```powershell
git pull origin main --allow-unrelated-histories
# Giải quyết conflicts nếu có
git add .
git commit -m "merge: Merge với code trên GitHub"
git push origin main
```

## Kiểm tra kết quả

Sau khi push thành công:
1. Vào https://github.com/Manhhhhh0333/DATN
2. Kiểm tra code đã được push lên
3. Tạo README.md để mô tả dự án

