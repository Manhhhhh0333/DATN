# Hướng dẫn phân loại từ vựng HSK1 vào 12 chủ đề

## Tổng quan

Script này giúp phân loại 150 từ vựng HSK1 vào 12 chủ đề (LessonTopics) một cách tự động.

## 12 chủ đề

1. Chào hỏi & Giao tiếp cơ bản
2. Số đếm & Thời gian
3. Người & Gia đình
4. Động từ cơ bản
5. Tính từ & Mô tả
6. Địa điểm & Phương hướng
7. Thức ăn & Đồ uống
8. Màu sắc & Đồ vật
9. Thời tiết & Thiên nhiên
10. Cơ thể & Sức khỏe
11. Hoạt động hàng ngày
12. Tổng hợp & Ôn tập

## Cách sử dụng

### Bước 1: Chạy migration để tạo column TopicId và 12 chủ đề

**Quan trọng**: Column `TopicId` phải tồn tại trong database trước khi phân loại từ vựng.

```powershell
cd Backend/scripts
.\check-and-update-database.ps1
```

**Lưu ý**: Phải dùng `.\` trước tên script trong PowerShell.

Hoặc thủ công:
```bash
cd Backend/src/HiHSK.Infrastructure
dotnet ef database update --startup-project ../HiHSK.Api
```

### Bước 2: Chạy script PowerShell

```powershell
cd Backend/scripts
.\organize-hsk1-words.ps1
```

Hoặc gọi API trực tiếp:

```bash
POST http://localhost:5000/api/admin/lessontopics/auto-organize-hsk1
```

### Bước 3: Kiểm tra kết quả

Script sẽ hiển thị:
- Tổng số từ vựng
- Số từ đã phân loại
- Số từ chưa phân loại
- Chi tiết từng chủ đề và số từ vựng

## Lưu ý

- Đảm bảo backend API đang chạy trước khi chạy script
- Nếu cần phân loại lại, có thể reset bằng cách xóa TopicId của các từ vựng HSK1
- Script sử dụng keywords matching để phân loại tự động

