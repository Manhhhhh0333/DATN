# Xóa bảng Lessons và tạo bảng LessonTopics

## Mục đích
Migration này sẽ:
1. Xóa bảng `Lessons` (nếu tồn tại)
2. Đảm bảo bảng `LessonTopics` được tạo (nếu chưa tồn tại)

## Cách chạy

### Option 1: Chạy script tự động (Khuyến nghị)
```powershell
.\Backend\scripts\remove-lessons-and-create-topics.ps1
```

### Option 2: Chạy thủ công
```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet build
dotnet ef database update 20250117000000_RemoveLessonsTableAndEnsureLessonTopics --startup-project ../HiHSK.Api
```

## Sau khi chạy migration

### Kiểm tra kết quả
```sql
-- Kiểm tra bảng Lessons đã bị xóa
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Lessons'
-- Kết quả: Không có dòng nào

-- Kiểm tra bảng LessonTopics đã được tạo
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics'
-- Kết quả: Có 1 dòng

-- Xem cấu trúc bảng LessonTopics
SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'LessonTopics'
```

### Seed 12 topics cho HSK1
Sau khi bảng `LessonTopics` được tạo, chạy SQL seed:
```sql
-- Chạy file: Backend/scripts/seed-12-topics-hsk1.sql
```

Hoặc chạy migration seed (nếu đã có):
```powershell
dotnet ef database update 20250116000000_Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api
```

## Rollback (nếu cần)
```powershell
dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api
```

## Lưu ý
- Migration này an toàn: chỉ xóa/tạo nếu bảng tồn tại/chưa tồn tại
- Dữ liệu trong bảng `Lessons` sẽ bị mất (nếu có)
- Bảng `LessonTopics` sẽ được tạo với đầy đủ indexes và foreign keys

