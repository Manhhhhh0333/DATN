# 📚 HƯỚNG DẪN SEED DỮ LIỆU BẰNG MIGRATION

## ✅ Đã tạo Migration mới

Migration `SeedVocabularyTopicHsk1` đã được tạo để seed Vocabulary Topic HSK1 và gán từ vựng vào topic.

## 🚀 Cách chạy Migration

### Bước 1: Đảm bảo Backend API đã dừng
```powershell
# Kiểm tra process đang chạy
Get-Process | Where-Object {$_.ProcessName -like "*HiHSK*"}

# Dừng process nếu có
Stop-Process -Name "HiHSK.Api" -Force
```

### Bước 2: Chạy Migration
```powershell
cd Backend/src/HiHSK.Api
dotnet ef database update
```

Hoặc chạy migration cụ thể:
```powershell
dotnet ef database update SeedVocabularyTopicHsk1
```

### Bước 3: Kiểm tra kết quả
```powershell
# Kiểm tra stats
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/stats" -Method Get
```

## 📋 Migration sẽ làm gì?

### Up Method (Khi chạy `dotnet ef database update`)
1. **Tạo Vocabulary Topic HSK1**:
   - Tên: "HSK 1"
   - Mô tả: "Từ vựng HSK Cấp độ 1 - 150 từ vựng cơ bản"
   - SortOrder: 1
   - Tự động tìm Id phù hợp (Id=1 nếu chưa có, hoặc Id tiếp theo)

2. **Gán từ vựng HSK1 vào Topic**:
   - Lấy tất cả từ vựng có `HSKLevel = 1`
   - Gán vào Vocabulary Topic HSK1
   - Tránh duplicate (chỉ gán nếu chưa có)

### Down Method (Khi rollback)
- Xóa tất cả links trong `WordVocabularyTopics`
- Xóa Vocabulary Topic HSK1

## ⚠️ Lưu ý

1. **Migration idempotent**: Có thể chạy nhiều lần mà không bị lỗi
2. **Cần có từ vựng HSK1 trước**: Đảm bảo migration `SeedHSK1Data` đã chạy
3. **Không set Id cứng**: Migration tự động tìm Id phù hợp

## 🔍 Kiểm tra trong Database

```sql
-- Kiểm tra Vocabulary Topic
SELECT * FROM VocabularyTopics WHERE Name = 'HSK 1';

-- Kiểm tra số từ vựng đã gán
SELECT COUNT(*) FROM WordVocabularyTopics 
WHERE VocabularyTopicId = (SELECT Id FROM VocabularyTopics WHERE Name = 'HSK 1');

-- Kiểm tra danh sách từ vựng
SELECT w.Id, w.Character, w.Pinyin, w.Meaning
FROM Words w
INNER JOIN WordVocabularyTopics wvt ON w.Id = wvt.WordId
WHERE wvt.VocabularyTopicId = (SELECT Id FROM VocabularyTopics WHERE Name = 'HSK 1')
ORDER BY w.Character;
```

## 🐛 Xử lý lỗi

### Lỗi: "Migration already applied"
- Không sao, migration đã chạy rồi
- Kiểm tra xem Vocabulary Topic đã tồn tại chưa

### Lỗi: "No words found"
- Chạy migration `SeedHSK1Data` trước:
  ```powershell
  dotnet ef database update SeedHSK1Data
  ```

### Lỗi: "File locked"
- Dừng Backend API trước khi chạy migration
- Hoặc restart máy nếu cần

## ✅ Kết quả mong đợi

Sau khi chạy migration thành công:
- ✅ Vocabulary Topic HSK1 được tạo
- ✅ Tất cả từ vựng HSK1 được gán vào topic
- ✅ Trang `/vocabulary/1` hiển thị danh sách từ vựng
- ✅ Có thể học và ôn tập từ vựng


