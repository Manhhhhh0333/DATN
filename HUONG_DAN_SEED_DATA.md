# 📚 HƯỚNG DẪN SEED DỮ LIỆU VÀO DATABASE

## ✅ File seed data đã sẵn sàng

File `Backend/data/seed-data-hsk1.json` đã được sửa lỗi và sẵn sàng để seed vào database.

## 🚀 Cách 1: Chạy Migration (Khuyến nghị)

### Bước 1: Dừng Backend API (nếu đang chạy)

```powershell
# Kiểm tra process
Get-Process | Where-Object {$_.ProcessName -like "*HiHSK*"}

# Dừng nếu có
Stop-Process -Name "HiHSK.Api" -Force -ErrorAction SilentlyContinue
```

### Bước 2: Chạy Migration

```powershell
# Di chuyển đến thư mục Backend API
cd Backend\src\HiHSK.Api

# Chạy migration
dotnet ef database update --project ..\HiHSK.Infrastructure
```

### Bước 3: Kiểm tra kết quả

```powershell
# Kiểm tra stats (Backend API phải đang chạy)
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/stats" -Method Get
```

## 🚀 Cách 2: Sử dụng Script PowerShell

```powershell
# Chạy script seed database
cd Backend\scripts
.\seed_database.ps1
```

## 📋 Migration sẽ làm gì?

### Migration `SeedHSK1Data`:
1. ✅ Seed Course Categories (HSK1)
2. ✅ Seed Courses (1 khóa học HSK1)
3. ✅ Seed Lessons (13 bài học)
4. ✅ Seed Words (150 từ vựng HSK1)
5. ✅ Seed Vocabulary Topic HSK1
6. ✅ Gán từ vựng vào Vocabulary Topic

### Migration `SeedVocabularyTopicHsk1`:
- Migration này sẽ được chạy tự động nếu chưa chạy
- Seed Vocabulary Topic HSK1 (nếu chưa có)
- Gán từ vựng HSK1 vào topic (nếu chưa gán)

## ⚠️ Lưu ý

1. **Migration idempotent**: Có thể chạy nhiều lần mà không bị lỗi (có `IF NOT EXISTS`)
2. **Cần có database**: Đảm bảo database đã được tạo
3. **File seed data**: Đường dẫn file JSON được tìm tự động
4. **Backend API**: Nên dừng Backend API trước khi chạy migration để tránh lỗi "file locked"

## 🔍 Kiểm tra trong Database

```sql
-- Kiểm tra Course Categories
SELECT * FROM CourseCategories;

-- Kiểm tra Courses
SELECT * FROM Courses;

-- Kiểm tra Lessons
SELECT COUNT(*) FROM Lessons WHERE CourseId = 1;

-- Kiểm tra Words
SELECT COUNT(*) FROM Words WHERE HSKLevel = 1;

-- Kiểm tra Vocabulary Topic
SELECT * FROM VocabularyTopics WHERE Name = 'HSK 1';

-- Kiểm tra số từ vựng đã gán
SELECT COUNT(*) FROM WordVocabularyTopics 
WHERE VocabularyTopicId = (SELECT Id FROM VocabularyTopics WHERE Name = 'HSK 1');
```

## 🐛 Xử lý lỗi

### Lỗi: "File locked"
- **Nguyên nhân**: Backend API đang chạy và giữ file
- **Giải pháp**: Dừng Backend API trước khi chạy migration

### Lỗi: "File not found"
- **Nguyên nhân**: Không tìm thấy file `seed-data-hsk1.json`
- **Giải pháp**: Kiểm tra file có tồn tại tại `Backend/data/seed-data-hsk1.json`

### Lỗi: "Migration already applied"
- **Nguyên nhân**: Migration đã chạy rồi
- **Giải pháp**: Không sao, dữ liệu đã được seed. Kiểm tra database xem có dữ liệu chưa.

### Lỗi: "Cannot find path"
- **Nguyên nhân**: Đường dẫn không đúng
- **Giải pháp**: Chạy từ thư mục `Backend/src/HiHSK.Api`

## ✅ Kết quả mong đợi

Sau khi chạy migration thành công:

- ✅ **Course Categories**: 1 category (HSK1)
- ✅ **Courses**: 1 course (HSK 1 - Khóa học cơ bản)
- ✅ **Lessons**: 13 lessons (Bài 1-13)
- ✅ **Words**: 150 words (từ vựng HSK1)
- ✅ **Vocabulary Topic**: 1 topic (HSK 1)
- ✅ **Word-Vocabulary Links**: 150 links

## 🌐 Kiểm tra trên Frontend

Sau khi seed thành công:

1. **Khởi động Backend API**:
   ```powershell
   cd Backend\src\HiHSK.Api
   dotnet run
   ```

2. **Khởi động Frontend** (terminal khác):
   ```powershell
   cd Frontend
   npm run dev
   ```

3. **Truy cập**:
   - Trang vocabulary: http://localhost:3000/vocabulary/1
   - Trang courses: http://localhost:3000/courses
   - Trang lesson: http://localhost:3000/lessons/1

## 📝 Lệnh hữu ích

```powershell
# Xem danh sách migrations
cd Backend\src\HiHSK.Api
dotnet ef migrations list --project ..\HiHSK.Infrastructure

# Xem migration cụ thể
dotnet ef migrations script SeedHSK1Data --project ..\HiHSK.Infrastructure

# Rollback migration (nếu cần)
dotnet ef database update PreviousMigrationName --project ..\HiHSK.Infrastructure
```

## 🎯 Tóm tắt

1. **Dừng Backend API** (nếu đang chạy)
2. **Chạy migration**: `dotnet ef database update --project ..\HiHSK.Infrastructure`
3. **Kiểm tra kết quả**: Xem stats hoặc truy cập Frontend
4. **Khởi động lại Backend API** để test

---

**Lưu ý**: Nếu gặp lỗi, vui lòng kiểm tra:
- Database connection string trong `appsettings.json`
- File `seed-data-hsk1.json` có tồn tại không
- Backend API đã dừng chưa

