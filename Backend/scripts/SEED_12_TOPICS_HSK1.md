# Seed 12 LessonTopics cho HSK1

## Vấn đề
API trả về danh sách rỗng vì bảng `LessonTopics` chưa có dữ liệu cho HSK1.

## Giải pháp

### Cách 1: Chạy SQL script (Nhanh nhất - Khuyến nghị)

1. Mở SQL Server Management Studio (SSMS)
2. Connect đến database `HIHSK`
3. Mở file: `Backend/scripts/seed-12-topics-hsk1.sql`
4. Execute (F5)

Hoặc chạy qua command line:
```powershell
sqlcmd -S localhost -d HIHSK -i "Backend\scripts\seed-12-topics-hsk1.sql"
```

### Cách 2: Chạy qua migration (Nếu đã có Designer.cs)

```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef database update 20250116000000_Seed12LessonTopicsHsk1 --startup-project ../HiHSK.Api
```

### Cách 3: Kiểm tra và seed thủ công

1. Kiểm tra bảng có dữ liệu chưa:
```sql
SELECT COUNT(*) FROM LessonTopics WHERE HSKLevel = 1
```

2. Nếu = 0, chạy SQL seed từ file `Backend/scripts/seed-12-topics-hsk1.sql`

## Kiểm tra kết quả

Sau khi seed, kiểm tra:
```sql
SELECT Id, Title, TopicIndex, IsLocked 
FROM LessonTopics 
WHERE HSKLevel = 1 
ORDER BY TopicIndex
```

Phải có 12 topics:
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

## Test lại Frontend

Sau khi seed, refresh trang frontend và chọn HSK 1. Phải hiển thị 12 topics.

