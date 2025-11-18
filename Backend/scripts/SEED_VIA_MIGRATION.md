# Seed 12 LessonTopics qua Migration

## Vấn đề

Migration `20250116000000_Seed12LessonTopicsHsk1` thiếu file `.Designer.cs`, nên EF Core không nhận diện migration này.

## Giải pháp: Tạo file Designer.cs

### Cách 1: Chạy script tự động (Khuyến nghị)

```powershell
powershell -ExecutionPolicy Bypass -File Backend/scripts/create-designer-for-seed12.ps1
```

Script này sẽ:
1. Copy file Designer.cs từ migration gần nhất (`20251109020524_UpdateSeedHSK1DataWithoutLessons.Designer.cs`)
2. Sửa tên migration và class name
3. Tạo file `20250116000000_Seed12LessonTopicsHsk1.Designer.cs`

### Cách 2: Tạo thủ công

1. Copy file `20251109020524_UpdateSeedHSK1DataWithoutLessons.Designer.cs`
2. Đổi tên thành `20250116000000_Seed12LessonTopicsHsk1.Designer.cs`
3. Sửa 2 dòng:
   - Dòng 15: `[Migration("20251109020524_UpdateSeedHSK1DataWithoutLessons")]` → `[Migration("20250116000000_Seed12LessonTopicsHsk1")]`
   - Dòng 16: `partial class UpdateSeedHSK1DataWithoutLessons` → `partial class Seed12LessonTopicsHsk1`

### Cách 3: Tạo migration mới với timestamp đúng

```powershell
cd Backend/src/HiHSK.Infrastructure

# Xóa migration cũ (nếu cần)
# Remove-Item Migrations\20250116000000_Seed12LessonTopicsHsk1.cs

# Tạo migration mới với timestamp sau AddLessonTopicAndExercise
dotnet ef migrations add Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api

# Copy nội dung seed từ migration cũ vào migration mới
```

## Sau khi tạo file Designer.cs

1. **Rebuild project**:
```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet build
```

2. **Kiểm tra migrations**:
```powershell
dotnet ef migrations list --startup-project ../HiHSK.Api
```

Migration `20250116000000_Seed12LessonTopicsHsk1` sẽ xuất hiện trong danh sách.

3. **Apply migration**:
```powershell
# Apply đến migration tạo bảng trước
dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api

# Sau đó apply migration seed
dotnet ef database update 20250116000000_Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api

# Hoặc apply tất cả
dotnet ef database update --startup-project ../HiHSK.Api
```

## Lưu ý về thứ tự

Vì migration `20250116000000_Seed12LessonTopicsHsk1` có timestamp `2025-01-16` (trước `2025-11-07`), EF Core sẽ cố gắng apply nó trước migration tạo bảng. 

**Giải pháp**: Apply migrations theo thứ tự thủ công:
1. Apply đến `20251107135905_AddLessonTopicAndExercise` (tạo bảng)
2. Sau đó apply `20250116000000_Seed12LessonTopicsHsk1` (seed data)

## Kiểm tra kết quả

```sql
-- Kiểm tra có 12 topics
SELECT COUNT(*) FROM LessonTopics WHERE HSKLevel = 1;

-- Xem danh sách topics
SELECT Id, Title, TopicIndex, IsLocked FROM LessonTopics WHERE HSKLevel = 1 ORDER BY TopicIndex;
```

