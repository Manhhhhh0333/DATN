# Sửa lỗi Migration Seed12LessonTopicsHsk1

## Vấn đề

Migration `20250116000000_Seed12LessonTopicsHsk1` không được EF Core nhận diện vì:
1. **Thiếu file Designer.cs** - EF Core cần cả file `.cs` và `.Designer.cs`
2. **Timestamp sai thứ tự** - Migration có timestamp `2025-01-16` nhưng cần chạy sau `2025-11-07` (AddLessonTopicAndExercise)

## Giải pháp

### Cách 1: Apply migrations theo thứ tự thủ công (Khuyến nghị - nhanh nhất)

```powershell
cd Backend/src/HiHSK.Infrastructure

# Bước 1: Apply đến migration tạo bảng LessonTopics
dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api

# Bước 2: Chạy SQL seed trực tiếp từ migration file
# Copy nội dung SQL từ file 20250116000000_Seed12LessonTopicsHsk1.cs và chạy trong SQL Server Management Studio
# Hoặc sử dụng script PowerShell bên dưới
```

### Cách 2: Tạo lại migration với timestamp đúng

```powershell
cd Backend/src/HiHSK.Infrastructure

# Bước 1: Backup nội dung migration cũ
Copy-Item Migrations\20250116000000_Seed12LessonTopicsHsk1.cs Migrations\20250116000000_Seed12LessonTopicsHsk1.cs.backup

# Bước 2: Xóa migration cũ
Remove-Item Migrations\20250116000000_Seed12LessonTopicsHsk1.cs

# Bước 3: Tạo migration mới với timestamp sau AddLessonTopicAndExercise
dotnet ef migrations add Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api

# Bước 4: Copy nội dung seed từ file backup vào migration mới
# Mở file migration mới và thay thế nội dung Up() và Down() bằng nội dung từ backup
```

### Cách 3: Chạy SQL seed trực tiếp (Nhanh nhất nếu đã có bảng) ⭐ **KHUYẾN NGHỊ**

Nếu bảng `LessonTopics` đã được tạo (từ migration AddLessonTopicAndExercise), chạy SQL seed trực tiếp:

**Bước 1**: Apply migration tạo bảng
```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api
```

**Bước 2**: Chạy SQL seed
- Mở file `Backend/scripts/seed-12-topics-hsk1.sql` trong SQL Server Management Studio
- Hoặc chạy trực tiếp trong database

File SQL đã được tạo sẵn tại: `Backend/scripts/seed-12-topics-hsk1.sql`

## Script PowerShell để chạy SQL seed

Tạo file `Backend/scripts/run-seed12-topics.ps1`:

```powershell
# Script này sẽ đọc SQL từ migration file và chạy trực tiếp
# Cần cấu hình connection string trong appsettings.json
```

## Kiểm tra sau khi apply

```sql
-- Kiểm tra bảng có tồn tại
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics'

-- Kiểm tra có 12 topics cho HSK1
SELECT COUNT(*) FROM LessonTopics WHERE HSKLevel = 1

-- Kiểm tra topics
SELECT Id, Title, TopicIndex, IsLocked FROM LessonTopics WHERE HSKLevel = 1 ORDER BY TopicIndex
```

## Lưu ý

1. **Luôn backup database** trước khi chạy migrations
2. **Kiểm tra bảng LessonTopics đã tồn tại** trước khi chạy seed
3. **Migration seed có thể chạy nhiều lần** (sử dụng IF NOT EXISTS)
4. **Nếu lỗi**, rollback về migration trước đó

## Thứ tự apply migrations đúng

1. ✅ `20251101173058_InitialCreate`
2. ✅ `20251102172321_CompleteDatabaseRedesign`
3. ✅ `20251106145124_SeedHSK1Data`
4. ✅ `20251106192834_SeedVocabularyTopicHsk1`
5. ✅ `20251107135905_AddLessonTopicAndExercise` **← TẠO BẢNG LessonTopics**
6. ✅ `20251108000000_SeedLessonTopicsHsk1` (nếu cần)
7. ✅ **Chạy SQL seed từ `20250116000000_Seed12LessonTopicsHsk1`** (thủ công)
8. ✅ `20250115000000_SeedHSK1DataNoLessons`
9. ✅ `20251109020524_UpdateSeedHSK1DataWithoutLessons`

