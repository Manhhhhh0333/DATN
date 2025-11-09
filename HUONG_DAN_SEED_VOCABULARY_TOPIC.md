# Hướng dẫn Seed Vocabulary Topic HSK1

## Vấn đề
Khi truy cập `http://localhost:3000/vocabulary/1`, hệ thống báo "Không tìm thấy chủ đề" vì VocabularyTopic với id=1 chưa được seed vào database.

## Giải pháp

### Cách 1: Gọi API Seed (Khuyến nghị - Nhanh nhất)

1. Đảm bảo backend đang chạy tại `http://localhost:5075` (hoặc port bạn đã cấu hình)

2. Gọi API bằng một trong các cách sau:

**Sử dụng PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5075/api/admin/seed-vocabulary-topic-hsk1" -Method POST
```

**Sử dụng curl:**
```bash
curl -X POST http://localhost:5075/api/admin/seed-vocabulary-topic-hsk1
```

**Sử dụng Postman hoặc trình duyệt:**
- Method: POST
- URL: `http://localhost:5075/api/admin/seed-vocabulary-topic-hsk1`

3. Kiểm tra kết quả - API sẽ trả về:
```json
{
  "message": "Seed Vocabulary Topic HSK1 thành công!",
  "vocabularyTopicId": 1,
  "totalWords": 150,
  "addedWords": 150,
  "existingWords": 0
}
```

### Cách 2: Chạy Migration

Nếu migration `SeedVocabularyTopicHsk1` chưa được chạy:

```powershell
cd Backend/src/HiHSK.Api
dotnet ef database update --project ../HiHSK.Infrastructure
```

Migration này sẽ:
- Tạo VocabularyTopic với id=1, name="HSK 1"
- Gán tất cả từ vựng HSK1 vào VocabularyTopic này

## Kiểm tra

Sau khi seed, kiểm tra bằng cách:

1. Truy cập lại `http://localhost:3000/vocabulary/1` - sẽ thấy danh sách từ vựng
2. Hoặc gọi API: `GET http://localhost:5075/api/vocabularytopics/1` (cần đăng nhập)

## Lưu ý

- API seed có `[AllowAnonymous]` nên không cần đăng nhập
- Nếu VocabularyTopic đã tồn tại, API sẽ bỏ qua việc tạo mới và chỉ gán từ vựng
- Đảm bảo đã seed từ vựng HSK1 trước (từ migration `SeedHSK1Data`)
