# Hướng dẫn Seed 12 LessonTopics cho HSK1

## Bước 1: Đảm bảo bảng LessonTopics đã được tạo

```powershell
# Kiểm tra migrations
cd Backend/src/HiHSK.Infrastructure
dotnet ef migrations list --startup-project ../HiHSK.Api

# Nếu chưa có migration AddLessonTopicAndExercise, apply nó:
dotnet ef database update 20251107135905_AddLessonTopicAndExercise --startup-project ../HiHSK.Api
```

## Bước 2: Seed 12 topics

### Cách 1: Qua SQL Server Management Studio (Khuyến nghị)

1. Mở SQL Server Management Studio (SSMS)
2. Connect đến database `HIHSK`
3. Mở file: `Backend/scripts/seed-12-topics-hsk1.sql`
4. Execute (F5)

### Cách 2: Qua command line (sqlcmd)

```powershell
sqlcmd -S localhost -d HIHSK -i "Backend\scripts\seed-12-topics-hsk1.sql"
```

### Cách 3: Copy và paste SQL

1. Mở file `Backend/scripts/seed-12-topics-hsk1.sql`
2. Copy toàn bộ nội dung
3. Paste vào SSMS và Execute

## Bước 3: Kiểm tra kết quả

```sql
-- Kiểm tra số lượng topics
SELECT COUNT(*) AS TotalTopics FROM LessonTopics WHERE HSKLevel = 1;
-- Phải = 12

-- Xem danh sách topics
SELECT Id, Title, TopicIndex, IsLocked 
FROM LessonTopics 
WHERE HSKLevel = 1 
ORDER BY TopicIndex;
```

## Danh sách 12 topics sẽ được seed:

1. Chào hỏi & Giao tiếp cơ bản (TopicIndex = 1, IsLocked = 0)
2. Số đếm & Thời gian (TopicIndex = 2, IsLocked = 1)
3. Người & Gia đình (TopicIndex = 3, IsLocked = 1)
4. Động từ cơ bản (TopicIndex = 4, IsLocked = 1)
5. Tính từ & Mô tả (TopicIndex = 5, IsLocked = 1)
6. Địa điểm & Phương hướng (TopicIndex = 6, IsLocked = 1)
7. Thức ăn & Đồ uống (TopicIndex = 7, IsLocked = 1)
8. Màu sắc & Đồ vật (TopicIndex = 8, IsLocked = 1)
9. Thời tiết & Thiên nhiên (TopicIndex = 9, IsLocked = 1)
10. Cơ thể & Sức khỏe (TopicIndex = 10, IsLocked = 1)
11. Hoạt động hàng ngày (TopicIndex = 11, IsLocked = 1)
12. Tổng hợp & Ôn tập (TopicIndex = 12, IsLocked = 1)

## Sau khi seed

Refresh frontend và chọn HSK 1. Phải hiển thị 12 topics.

