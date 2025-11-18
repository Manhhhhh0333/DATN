# Sửa lỗi: Invalid object name 'LessonTopics'

## Vấn đề
Backend API trả về lỗi 500 với message: `Invalid object name 'LessonTopics'`

Điều này có nghĩa là bảng `LessonTopics` chưa được tạo trong database.

## Giải pháp

### Cách 1: Chạy script tự động (Khuyến nghị)

```powershell
.\Backend\scripts\check-and-update-database.ps1
```

### Cách 2: Chạy migration thủ công

1. Mở PowerShell tại thư mục root của project
2. Chạy lệnh:

```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef database update --startup-project ../HiHSK.Api
```

### Cách 3: Kiểm tra và apply migrations

1. Kiểm tra migrations chưa được apply:

```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef migrations list --startup-project ../HiHSK.Api
```

2. Nếu thấy migration `20251107135905_AddLessonTopicAndExercise` chưa được apply, chạy:

```powershell
dotnet ef database update --startup-project ../HiHSK.Api
```

## Migration cần apply

- `20251107135905_AddLessonTopicAndExercise` - Tạo bảng `LessonTopics` và `LessonExercises`
- `20250116000000_Seed12LessonTopicsHsk1` - Seed 12 topics cho HSK1 (nếu có)

## Sau khi apply migration

1. Restart backend API
2. Test lại endpoint: `GET http://localhost:5075/api/courses/hsk-level/1`
3. Kiểm tra frontend có hiển thị danh sách lessons không

## Kiểm tra database

Nếu muốn kiểm tra trực tiếp trong SQL Server:

```sql
-- Kiểm tra bảng có tồn tại không
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LessonTopics'

-- Nếu bảng không tồn tại, cần chạy migration
```

