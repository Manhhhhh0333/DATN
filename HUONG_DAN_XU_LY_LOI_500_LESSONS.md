# 🐛 HƯỚNG DẪN XỬ LÝ LỖI 500 KHI TRUY CẬP /api/lessons/1

## ❌ Lỗi

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
:5075/api/lessons/1:1
```

## 🔍 Nguyên nhân

Lỗi 500 có thể do:

1. **Dữ liệu chưa được seed vào database**
   - Lesson với ID=1 không tồn tại
   - Course không tồn tại hoặc không liên kết với Lesson

2. **Lesson không có Course liên kết**
   - CourseId trong Lesson không tồn tại trong bảng Courses
   - Foreign key constraint bị lỗi

3. **User chưa authenticated**
   - Endpoint `/api/lessons/{id}` cần authentication

## ✅ Giải pháp

### Bước 1: Kiểm tra dữ liệu trong database

```powershell
# Kiểm tra stats (Backend API phải đang chạy)
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/stats" -Method Get
```

Nếu trả về:
```json
{
  "courseCategories": 0,
  "courses": 0,
  "lessons": 0,
  "words": 0
}
```

→ **Dữ liệu chưa được seed!** Cần chạy migration.

### Bước 2: Seed dữ liệu vào database

#### Cách 1: Chạy Migration (Khuyến nghị)

```powershell
# 1. Dừng Backend API (nếu đang chạy)
Get-Process | Where-Object {$_.ProcessName -like "*HiHSK*"}

# 2. Chạy migration
cd Backend\src\HiHSK.Api
dotnet ef database update --project ..\HiHSK.Infrastructure
```

#### Cách 2: Sử dụng API endpoint (nếu có authentication)

```powershell
# Seed data qua API
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/seed?fileName=seed-data-hsk1.json" -Method Post
```

### Bước 3: Kiểm tra lại

Sau khi seed xong:

1. **Kiểm tra stats**:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5075/api/admin/stats" -Method Get
   ```

   Kết quả mong đợi:
   ```json
   {
     "courseCategories": 1,
     "courses": 1,
     "lessons": 13,
     "words": 150
   }
   ```

2. **Kiểm tra Lesson ID=1 có tồn tại**:
   ```sql
   SELECT l.Id, l.Title, l.CourseId, c.Title as CourseTitle
   FROM Lessons l
   LEFT JOIN Courses c ON l.CourseId = c.Id
   WHERE l.Id = 1;
   ```

3. **Truy cập lại Frontend**:
   - http://localhost:3000/lessons/1

## 🔧 Đã sửa code

### 1. Thêm error handling trong LessonService

Đã thêm kiểm tra null cho `lesson.Course`:

```csharp
// Kiểm tra Course có tồn tại không
if (lesson.Course == null)
{
    throw new InvalidOperationException($"Lesson {id} không có Course liên kết. Vui lòng kiểm tra CourseId trong database.");
}
```

### 2. Thêm error handling trong LessonsController

Đã thêm try-catch để bắt lỗi và trả về thông báo rõ ràng:

```csharp
try
{
    var lesson = await _lessonService.GetLessonByIdAsync(id, userId);
    // ...
}
catch (InvalidOperationException ex)
{
    return StatusCode(500, new { message = ex.Message });
}
catch (Exception ex)
{
    return StatusCode(500, new { message = "Lỗi khi lấy thông tin bài học", error = ex.Message });
}
```

## 📋 Checklist

- [ ] Backend API đã khởi động
- [ ] Database đã được tạo
- [ ] Migration đã chạy (`dotnet ef database update`)
- [ ] Dữ liệu đã được seed (kiểm tra stats)
- [ ] User đã đăng nhập (có token authentication)
- [ ] Lesson ID=1 tồn tại trong database
- [ ] Course ID=1 tồn tại và liên kết với Lesson

## 🐛 Debug thêm

Nếu vẫn gặp lỗi, kiểm tra:

1. **Backend logs**: Xem console output của Backend API để biết lỗi chi tiết
2. **Database connection**: Kiểm tra connection string trong `appsettings.json`
3. **Migration status**: 
   ```powershell
   cd Backend\src\HiHSK.Api
   dotnet ef migrations list --project ..\HiHSK.Infrastructure
   ```

## 📝 Lệnh hữu ích

```powershell
# Xem danh sách migrations
cd Backend\src\HiHSK.Api
dotnet ef migrations list --project ..\HiHSK.Infrastructure

# Chạy migration cụ thể
dotnet ef database update SeedHSK1Data --project ..\HiHSK.Infrastructure

# Tạo migration mới (nếu cần)
dotnet ef migrations add MigrationName --project ..\HiHSK.Infrastructure

# Xem SQL script của migration
dotnet ef migrations script --project ..\HiHSK.Infrastructure
```

## ✅ Kết quả mong đợi

Sau khi seed dữ liệu thành công:
- ✅ API `/api/lessons/1` trả về 200 OK với dữ liệu lesson
- ✅ Frontend hiển thị bài học bình thường
- ✅ Có thể xem từ vựng, ngữ pháp, bài đọc, quiz

---

**Lưu ý**: Đảm bảo đã chạy migration để seed dữ liệu trước khi truy cập API!

