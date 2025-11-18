# Quick Fix: Tạo bảng LessonTopics

## Vấn đề
Lỗi: `Invalid object name 'LessonTopics'` - Bảng `LessonTopics` chưa được tạo trong database.

## Giải pháp nhanh

### Cách 1: Chạy script tự động (Khuyến nghị)

```powershell
.\Backend\scripts\apply-migration-create-table.ps1
```

### Cách 2: Chạy migration thủ công

```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api
```

### Cách 3: Apply tất cả migrations

```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef database update --startup-project ../HiHSK.Api
```

## Sau khi tạo bảng

### Option A: Seed qua migration (nếu đã có file Designer.cs)

```powershell
# Sau khi tạo bảng, apply migration seed
dotnet ef database update 20250116000000_Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api
```

### Option B: Seed qua SQL (nhanh hơn)

Chạy file SQL: `Backend/scripts/seed-12-topics-hsk1.sql` trong SQL Server Management Studio

## Kiểm tra kết quả

```sql
-- Kiểm tra bảng có tồn tại
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics'

-- Kiểm tra có 12 topics
SELECT COUNT(*) FROM LessonTopics WHERE HSKLevel = 1

-- Xem danh sách topics
SELECT Id, Title, TopicIndex FROM LessonTopics WHERE HSKLevel = 1 ORDER BY TopicIndex
```

## Restart Backend

Sau khi tạo bảng và seed data, restart backend API:

```powershell
# Dừng backend hiện tại (Ctrl+C)
# Sau đó chạy lại
cd Backend/src/HiHSK.Api
dotnet run
```

## Test API

Sau khi restart, test endpoint:

```
GET http://localhost:5075/api/courses/hsk-level/1
```

Hoặc trong browser console:
```javascript
fetch('http://localhost:5075/api/courses/hsk-level/1')
  .then(r => r.json())
  .then(console.log)
```

