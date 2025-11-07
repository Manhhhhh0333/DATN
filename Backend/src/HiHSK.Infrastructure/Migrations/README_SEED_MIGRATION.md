# Hướng dẫn Seed Data qua Migration

## Tổng quan

Migration `SeedHSK1Data` sẽ tự động seed dữ liệu HSK1 từ file JSON khi chạy migration. Migration sử dụng:
- **System.Text.Json** để deserialize JSON
- **Entity Framework Migrations** để insert data vào database
- **Extension method** `SeedDataFromJson` để xử lý seed data

## Cách sử dụng

### Bước 1: Tạo file seed data

Đảm bảo file `Backend/data/seed-data-hsk1.json` đã được tạo:

```powershell
cd Backend/scripts
python convert_hsk1_to_seed_data.py
```

### Bước 2: Tạo migration (nếu chưa có)

Migration `SeedHSK1Data` đã được tạo sẵn. Nếu cần tạo migration mới:

```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef migrations add SeedHSK1Data --startup-project ../HiHSK.Api
```

### Bước 3: Chạy migration

```powershell
cd Backend/src/HiHSK.Api
dotnet ef database update --startup-project .
```

Hoặc nếu đã có migration:

```powershell
dotnet ef database update
```

### Bước 4: Kiểm tra dữ liệu

Sau khi migration chạy xong, kiểm tra:

```sql
SELECT COUNT(*) FROM CourseCategories;  -- Phải có 1
SELECT COUNT(*) FROM Courses;            -- Phải có 1
SELECT COUNT(*) FROM Lessons;            -- Phải có 13
SELECT COUNT(*) FROM Words;              -- Phải có 150
```

## Cấu trúc Migration

### SeedHSK1Data.cs

Migration này:
1. Tìm file `seed-data-hsk1.json` trong thư mục `Backend/data/`
2. Gọi extension method `SeedDataFromJson` để seed data
3. Nếu không tìm thấy file, bỏ qua (không báo lỗi)

### MigrationExtensions.cs

Extension method `SeedDataFromJson`:
- Đọc file JSON bằng `System.Text.Json`
- Deserialize thành `SeedData` object
- Tạo SQL INSERT statements với điều kiện `IF NOT EXISTS`
- Map `lessonId` từ `lessonIndex` trong JSON sang ID thực tế trong database

## Lưu ý

1. **File JSON phải tồn tại**: Migration sẽ tìm file ở các đường dẫn:
   - `Backend/data/seed-data-hsk1.json`
   - `Backend/../data/seed-data-hsk1.json`
   - Và các đường dẫn khác

2. **Idempotent**: Migration sử dụng `IF NOT EXISTS` nên có thể chạy nhiều lần mà không bị duplicate

3. **LessonId mapping**: Words trong JSON có `lessonId` là `lessonIndex` (1, 2, 3...), migration sẽ tự động map sang ID thực tế trong database

4. **SQL Injection**: Tất cả string values đều được escape bằng `EscapeSql()` method

## Rollback

Để rollback migration:

```powershell
dotnet ef database update PreviousMigrationName
```

Hoặc xóa dữ liệu thủ công:

```sql
DELETE FROM Words WHERE HSKLevel = 1;
DELETE FROM Lessons WHERE CourseId = 1;
DELETE FROM Courses WHERE CategoryId = 1;
DELETE FROM CourseCategories WHERE Name = 'HSK1';
```

## Troubleshooting

### Lỗi: File không tìm thấy

- Kiểm tra đường dẫn file JSON
- Đảm bảo file `seed-data-hsk1.json` ở trong `Backend/data/`
- Migration sẽ bỏ qua nếu không tìm thấy file (không báo lỗi)

### Lỗi: Foreign Key constraint

- Đảm bảo migration seed theo đúng thứ tự: Categories → Courses → Lessons → Words
- Migration đã tự động xử lý mapping lessonId

### Lỗi: Duplicate data

- Migration sử dụng `IF NOT EXISTS` nên không bị duplicate
- Nếu vẫn bị, có thể do data đã tồn tại từ trước

## So sánh với các phương pháp khác

| Phương pháp | Ưu điểm | Nhược điểm |
|------------|---------|------------|
| **Migration** | Tự động chạy khi deploy, version control | Phức tạp hơn, khó debug |
| **API Endpoint** | Dễ test, linh hoạt | Cần chạy thủ công |
| **Program.cs** | Đơn giản, tự động | Chỉ chạy khi start app |

Migration là cách tốt nhất cho production vì:
- Tự động chạy khi deploy
- Version control với code
- Đảm bảo database luôn có dữ liệu cần thiết

