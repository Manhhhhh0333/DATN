# Tạo bảng LessonTopics

## Vấn đề
Database chưa có bảng `LessonTopics`, cần apply migration để tạo bảng trước khi seed data.

## Giải pháp

### Cách 1: Chạy script tự động (Khuyến nghị)

```powershell
.\Backend\scripts\create-lessontopics-table.ps1
```

### Cách 2: Chạy migration thủ công

```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet build
dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api
```

### Cách 3: Apply tất cả migrations

```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef database update --startup-project ../HiHSK.Api
```

## Sau khi tạo bảng

### Kiểm tra bảng đã được tạo

```sql
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics'
```

### Seed 12 topics cho HSK1

**Option 1: Qua SQL script (Nhanh nhất)**
- Mở file: `Backend/scripts/seed-12-topics-hsk1.sql` trong SQL Server Management Studio
- Execute (F5)

**Option 2: Qua migration**
```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef database update 20250116000000_Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api
```

## Kiểm tra kết quả

```sql
-- Kiểm tra bảng có tồn tại
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics'

-- Kiểm tra có 12 topics
SELECT COUNT(*) FROM LessonTopics WHERE HSKLevel = 1

-- Xem danh sách topics
SELECT Id, Title, TopicIndex FROM LessonTopics WHERE HSKLevel = 1 ORDER BY TopicIndex
```

## Lưu ý

- Migration `20251107135905_AddLessonTopicAndExercise` sẽ tạo:
  - Bảng `LessonTopics`
  - Bảng `LessonExercises`
  - Cột `TopicId` trong bảng `Words`
  - Cột `ExerciseId` trong các bảng liên quan
  - Foreign keys và indexes

