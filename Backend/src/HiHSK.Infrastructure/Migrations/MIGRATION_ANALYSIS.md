# Phân tích Migrations

## Thứ tự Migrations theo Timestamp

### 1. `20251101173058_InitialCreate`
- **Mục đích**: Tạo database ban đầu
- **Tạo bảng**: Tất cả các bảng cơ bản
- **Status**: ✅ Cần apply đầu tiên

### 2. `20251102172321_CompleteDatabaseRedesign`
- **Mục đích**: Redesign lại toàn bộ database structure
- **Tạo bảng**: Cập nhật các bảng hiện có
- **Status**: ✅ Cần apply sau InitialCreate

### 3. `20251106145124_SeedHSK1Data`
- **Mục đích**: Seed dữ liệu HSK1 (Courses, Lessons, Words)
- **Dependencies**: Cần Courses, Lessons, Words tables
- **Status**: ✅ Có thể apply sau CompleteDatabaseRedesign

### 4. `20251106192834_SeedVocabularyTopicHsk1`
- **Mục đích**: Seed Vocabulary Topics cho HSK1
- **Dependencies**: Cần VocabularyTopics table
- **Status**: ✅ Có thể apply sau SeedHSK1Data

### 5. `20251107135905_AddLessonTopicAndExercise` ⚠️ **QUAN TRỌNG**
- **Mục đích**: **TẠO BẢNG LessonTopics và LessonExercises**
- **Tạo bảng**: 
  - `LessonTopics` (bảng chính cần thiết!)
  - `LessonExercises`
  - Thêm cột `TopicId` vào bảng `Words`
  - Thêm cột `ExerciseId` vào các bảng liên quan
- **Status**: ✅ **PHẢI APPLY TRƯỚC các migration seed LessonTopics**

### 6. `20251108000000_SeedLessonTopicsHsk1`
- **Mục đích**: Seed LessonTopics cho HSK1
- **Dependencies**: **CẦN bảng LessonTopics** (từ migration #5)
- **Status**: ✅ Có thể apply sau AddLessonTopicAndExercise

### 7. `20250115000000_SeedHSK1DataNoLessons`
- **Mục đích**: Seed HSK1 data không có lessons
- **Timestamp**: 2025-01-15 (SAU migration #5 nhưng TRƯỚC migration #8)
- **Status**: ⚠️ Cần kiểm tra conflict

### 8. `20250116000000_Seed12LessonTopicsHsk1` ⚠️ **CÓ VẤN ĐỀ**
- **Mục đích**: Seed 12 LessonTopics cho HSK1
- **Timestamp**: 2025-01-16 (SAU migration #5)
- **Dependencies**: **CẦN bảng LessonTopics** (từ migration #5)
- **Status**: ✅ Có thể apply sau AddLessonTopicAndExercise
- **Lưu ý**: Migration này sẽ DELETE và INSERT lại 12 topics cho HSK1

### 9. `20251109020524_UpdateSeedHSK1DataWithoutLessons`
- **Mục đích**: Update seed data HSK1 không có lessons
- **Timestamp**: 2025-11-09 (SAU tất cả migrations khác)
- **Status**: ✅ Có thể apply cuối cùng

## ⚠️ VẤN ĐỀ PHÁT HIỆN

### Vấn đề 1: Thứ tự Timestamp không đúng
- Migration `20250116000000_Seed12LessonTopicsHsk1` có timestamp **2025-01-16**
- Migration `20251107135905_AddLessonTopicAndExercise` có timestamp **2025-11-07**
- **EF Core sẽ apply migrations theo thứ tự timestamp**, nghĩa là migration seed sẽ chạy TRƯỚC migration tạo bảng!
- **Kết quả**: Lỗi `Invalid object name 'LessonTopics'`

### Vấn đề 2: Migration seed có thể conflict
- `20251108000000_SeedLessonTopicsHsk1` và `20250116000000_Seed12LessonTopicsHsk1` đều seed LessonTopics cho HSK1
- Cần kiểm tra xem có conflict không

## ✅ GIẢI PHÁP

### Cách 1: Đổi tên migration (Khuyến nghị)
Đổi tên migration `20250116000000_Seed12LessonTopicsHsk1` thành timestamp sau `20251107135905`:

```powershell
# Xóa migration cũ
Remove-Item Backend/src/HiHSK.Infrastructure/Migrations/20250116000000_Seed12LessonTopicsHsk1.cs
Remove-Item Backend/src/HiHSK.Infrastructure/Migrations/20250116000000_Seed12LessonTopicsHsk1.Designer.cs

# Tạo migration mới với timestamp đúng
cd Backend/src/HiHSK.Infrastructure
dotnet ef migrations add Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api
# Sau đó copy nội dung seed từ migration cũ vào migration mới
```

### Cách 2: Apply migrations theo thứ tự thủ công
Nếu không muốn đổi tên, có thể apply migrations theo thứ tự đúng:

```powershell
cd Backend/src/HiHSK.Infrastructure

# Apply đến migration tạo bảng
dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api

# Sau đó apply migration seed
dotnet ef database update 20250116000000_Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api

# Cuối cùng apply tất cả migrations còn lại
dotnet ef database update --startup-project ../HiHSK.Api
```

### Cách 3: Sửa migration seed để kiểm tra bảng tồn tại
Thêm kiểm tra vào migration seed:

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    // Kiểm tra bảng có tồn tại không
    migrationBuilder.Sql(@"
        IF OBJECT_ID('LessonTopics', 'U') IS NOT NULL
        BEGIN
            UPDATE Words SET TopicId = NULL WHERE HSKLevel = 1;
            DELETE FROM LessonTopics WHERE HSKLevel = 1;
            -- ... rest of seed code
        END
    ");
}
```

## 📋 THỨ TỰ APPLY MIGRATIONS ĐÚNG

1. ✅ `20251101173058_InitialCreate`
2. ✅ `20251102172321_CompleteDatabaseRedesign`
3. ✅ `20251106145124_SeedHSK1Data`
4. ✅ `20251106192834_SeedVocabularyTopicHsk1`
5. ✅ `20251107135905_AddLessonTopicAndExercise` **← TẠO BẢNG LessonTopics**
6. ✅ `20251108000000_SeedLessonTopicsHsk1`
7. ✅ `20250115000000_SeedHSK1DataNoLessons`
8. ✅ `20250116000000_Seed12LessonTopicsHsk1` **← SEED 12 TOPICS**
9. ✅ `20251109020524_UpdateSeedHSK1DataWithoutLessons`

## 🔍 KIỂM TRA MIGRATIONS ĐÃ APPLY

```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef migrations list --startup-project ../HiHSK.Api
```

Migrations có dấu `*` là đã được apply.

## 🚀 CHẠY MIGRATIONS

```powershell
# Cách 1: Chạy script tự động
.\Backend\scripts\check-and-update-database.ps1

# Cách 2: Chạy thủ công
cd Backend/src/HiHSK.Infrastructure
dotnet ef database update --startup-project ../HiHSK.Api
```

## ⚠️ LƯU Ý

1. **Luôn backup database** trước khi chạy migrations
2. **Kiểm tra thứ tự migrations** trước khi apply
3. **Migration seed có thể chạy nhiều lần** (sử dụng IF NOT EXISTS)
4. **Nếu lỗi**, rollback về migration trước đó và kiểm tra lại

