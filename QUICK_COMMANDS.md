# ⚡ Lệnh Nhanh - Copy & Paste

## 🚀 Push code lên GitHub lần đầu

```powershell
git add .
git commit -m "feat: Initial commit - HiHSK Learning Platform"
git branch -M main
git remote add origin https://github.com/Manhhhhh0333/DATN.git
git push -u origin main
```

## 📝 Sau mỗi lần code xong

```powershell
git add .
git commit -m "feat: Mô tả những gì đã làm"
git push origin main
```

## 🌿 Tạo và làm việc với Feature Branch

```powershell
# Tạo branch mới
git checkout -b feature/tên-tính-năng

# Code và commit
git add .
git commit -m "feat: Mô tả tính năng"
git push origin feature/tên-tính-năng
```

## 🔄 Merge branch về main

```powershell
git checkout main
git pull origin main
git merge feature/tên-tính-năng
git push origin main
```

## 📊 Xem lịch sử

```powershell
git log --oneline --graph --all
```

## 🔍 Kiểm tra trạng thái

```powershell
git status
```

