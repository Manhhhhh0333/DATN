# 📚 Hướng dẫn Quy trình Git/GitHub cho Dự án HiHSK

## 🎯 Mục tiêu
Quản lý code hiệu quả với Git và GitHub, sử dụng branches để làm việc an toàn và có tổ chức.

---

## 📋 QUY TRÌNH LÀM VIỆC HÀNG NGÀY

### **1. Sau mỗi lần code xong - Commit và Push**

```powershell
# Bước 1: Kiểm tra những gì đã thay đổi
git status

# Bước 2: Xem chi tiết thay đổi (tùy chọn)
git diff

# Bước 3: Thêm các file đã thay đổi vào staging area
git add .

# Hoặc thêm từng file cụ thể (khuyến nghị)
git add Backend/src/HiHSK.Domain/Entities/LessonTopic.cs
git add Frontend/app/courses/page.tsx

# Bước 4: Commit với message rõ ràng
git commit -m "feat: Thêm LessonTopic và LessonExercise entities"

# Bước 5: Push lên GitHub
git push origin main
```

### **2. Quy ước Commit Message (Conventional Commits)**

Sử dụng format: `type: description`

**Các loại (types):**
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật tài liệu
- `style:` - Format code (không ảnh hưởng logic)
- `refactor:` - Refactor code
- `test:` - Thêm/sửa tests
- `chore:` - Công việc bảo trì (dependencies, config...)

**Ví dụ:**
```bash
git commit -m "feat: Thêm endpoint lấy lessons theo HSK Level"
git commit -m "fix: Sửa lỗi CORS khi phát audio"
git commit -m "refactor: Đổi tên 'Khóa học' thành 'Giáo trình HSK'"
git commit -m "docs: Cập nhật README với hướng dẫn setup"
```

---

## 🌿 QUẢN LÝ BRANCHES (NHÁNH)

### **Cấu trúc Branches Khuyến nghị**

```
main (production)
  ├── develop (development chính)
  │   ├── feature/lesson-topic (tính năng mới)
  │   ├── feature/vocabulary-exercise
  │   ├── bugfix/audio-cors-error
  │   └── hotfix/critical-bug
```

### **1. Tạo và làm việc với Feature Branch**

```powershell
# Bước 1: Đảm bảo đang ở branch develop và cập nhật mới nhất
git checkout develop
git pull origin develop

# Bước 2: Tạo branch mới cho tính năng
git checkout -b feature/lesson-topic

# Bước 3: Code và commit như bình thường
git add .
git commit -m "feat: Thêm LessonTopic entity"

# Bước 4: Push branch lên GitHub
git push origin feature/lesson-topic

# Bước 5: Tạo Pull Request trên GitHub để merge vào develop
```

### **2. Các loại Branch**

#### **Feature Branch** - Tính năng mới
```powershell
git checkout -b feature/tên-tính-năng
# Ví dụ: feature/lesson-topic, feature/vocabulary-exercise
```

#### **Bugfix Branch** - Sửa lỗi
```powershell
git checkout -b bugfix/mô-tả-lỗi
# Ví dụ: bugfix/audio-cors-error, bugfix/login-validation
```

#### **Hotfix Branch** - Sửa lỗi khẩn cấp trên production
```powershell
git checkout -b hotfix/mô-tả-lỗi
# Ví dụ: hotfix/security-patch, hotfix/critical-bug
```

### **3. Merge Branch về Develop**

```powershell
# Bước 1: Chuyển về develop
git checkout develop

# Bước 2: Pull code mới nhất
git pull origin develop

# Bước 3: Merge feature branch
git merge feature/lesson-topic

# Bước 4: Push lên GitHub
git push origin develop
```

### **4. Xóa Branch sau khi merge**

```powershell
# Xóa branch local
git branch -d feature/lesson-topic

# Xóa branch trên GitHub
git push origin --delete feature/lesson-topic
```

---

## 🚀 SETUP LẦN ĐẦU - Push code lên GitHub

### **Bước 1: Kiểm tra Git đã được khởi tạo chưa**

```powershell
cd c:\Users\hoang\source\repos\DATN
git status
```

Nếu chưa có Git repository:
```powershell
git init
```

### **Bước 2: Tạo file .gitignore (nếu chưa có)**

Tạo file `.gitignore` ở root của dự án:

```
# Build results
**/bin/
**/obj/
**/node_modules/
**/.next/
**/dist/
**/build/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vs/
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite

# Temporary files
*.tmp
*.temp
```

### **Bước 3: Thêm remote GitHub**

```powershell
# Kiểm tra remote hiện tại
git remote -v

# Nếu chưa có, thêm remote
git remote add origin https://github.com/Manhhhhh0333/DATN.git

# Hoặc nếu đã có nhưng sai URL, sửa lại
git remote set-url origin https://github.com/Manhhhhh0333/DATN.git
```

### **Bước 4: Commit và Push code lên GitHub**

```powershell
# Thêm tất cả file
git add .

# Commit
git commit -m "feat: Initial commit - HiHSK Learning Platform"

# Push lên GitHub (lần đầu)
git push -u origin main
```

Nếu branch hiện tại không phải `main`:
```powershell
# Đổi tên branch thành main
git branch -M main

# Push
git push -u origin main
```

---

## 📝 QUY TRÌNH HÀNG NGÀY (DAILY WORKFLOW)

### **Buổi sáng - Bắt đầu làm việc**

```powershell
# 1. Pull code mới nhất từ develop
git checkout develop
git pull origin develop

# 2. Tạo feature branch mới
git checkout -b feature/tên-tính-năng

# 3. Bắt đầu code
```

### **Trong khi code**

```powershell
# Commit thường xuyên (sau mỗi tính năng nhỏ hoàn thành)
git add .
git commit -m "feat: Thêm LessonTopic entity"

# Push lên GitHub để backup
git push origin feature/tên-tính-năng
```

### **Cuối ngày - Kết thúc công việc**

```powershell
# 1. Commit tất cả thay đổi
git add .
git commit -m "feat: Hoàn thành tính năng X"

# 2. Push lên GitHub
git push origin feature/tên-tính-năng

# 3. Tạo Pull Request trên GitHub (nếu tính năng đã hoàn thành)
```

---

## 🔄 XỬ LÝ CONFLICTS (Xung đột)

### **Khi có conflict khi merge**

```powershell
# 1. Merge develop vào feature branch
git checkout feature/lesson-topic
git pull origin develop

# 2. Nếu có conflict, Git sẽ báo
# 3. Mở file có conflict, tìm các dòng:
<<<<<<< HEAD
Code của bạn
=======
Code từ develop
>>>>>>> develop

# 4. Sửa conflict, giữ lại code đúng
# 5. Sau khi sửa xong:
git add .
git commit -m "fix: Resolve merge conflicts"
```

---

## 🎯 BEST PRACTICES (Thực hành tốt)

### ✅ Nên làm:

1. **Commit thường xuyên** - Mỗi tính năng nhỏ hoàn thành
2. **Commit message rõ ràng** - Mô tả chính xác những gì đã làm
3. **Pull trước khi push** - Luôn pull code mới nhất trước khi push
4. **Sử dụng branches** - Không code trực tiếp trên main/develop
5. **Review code** - Tạo Pull Request và review trước khi merge

### ❌ Không nên:

1. **Commit code chưa test** - Luôn test trước khi commit
2. **Commit quá nhiều thay đổi** - Chia nhỏ thành nhiều commit
3. **Force push lên main/develop** - Rất nguy hiểm!
4. **Commit file nhạy cảm** - Passwords, API keys, tokens
5. **Commit file build** - Chỉ commit source code

---

## 📦 CÁC LỆNH GIT HỮU ÍCH

### **Xem lịch sử**

```powershell
# Xem commit history
git log --oneline --graph --all

# Xem thay đổi của một file
git log --follow -- Frontend/app/courses/page.tsx

# Xem diff giữa 2 commits
git diff commit1 commit2
```

### **Undo/Revert**

```powershell
# Undo thay đổi chưa commit
git restore file.txt

# Undo tất cả thay đổi chưa commit
git restore .

# Undo commit (giữ lại thay đổi)
git reset --soft HEAD~1

# Undo commit (xóa thay đổi)
git reset --hard HEAD~1
```

### **Stash (Tạm lưu thay đổi)**

```powershell
# Lưu thay đổi tạm thời
git stash

# Xem danh sách stash
git stash list

# Lấy lại thay đổi
git stash pop

# Xóa stash
git stash drop
```

---

## 🔐 BẢO MẬT

### **Không commit:**

- File `.env` chứa secrets
- API keys, tokens
- Passwords
- Private keys
- Database credentials

### **Sử dụng:**

- `.env.example` - Template cho environment variables
- `.gitignore` - Loại trừ file nhạy cảm
- GitHub Secrets - Lưu secrets cho CI/CD

---

## 📚 TÀI LIỆU THAM KHẢO

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🎓 TÓM TẮT QUY TRÌNH

1. **Bắt đầu ngày làm việc:**
   - `git checkout develop && git pull`

2. **Tạo feature branch:**
   - `git checkout -b feature/tên-tính-năng`

3. **Code và commit:**
   - `git add . && git commit -m "feat: ..."`

4. **Push thường xuyên:**
   - `git push origin feature/tên-tính-năng`

5. **Kết thúc tính năng:**
   - Tạo Pull Request trên GitHub
   - Review và merge vào develop

6. **Deploy:**
   - Merge develop vào main khi sẵn sàng release

---

**Lưu ý:** Luôn làm việc trên feature branch, không code trực tiếp trên main hoặc develop!

