# 📚 HƯỚNG DẪN SEED VOCABULARY TOPIC HSK1

## ❌ Vấn đề
Khi truy cập `http://localhost:3000/vocabulary/1`, hiển thị "Không tìm thấy chủ đề" vì Vocabulary Topic HSK1 chưa được seed vào database.

## ✅ Giải pháp

### Cách 1: Gọi API Endpoint (Khuyến nghị - Nhanh nhất)

**Bước 1**: Đảm bảo Backend API đang chạy tại `http://localhost:5075`

**Bước 2**: Gọi API endpoint:

#### PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/seed-vocabulary-topic-hsk1" -Method Post -ContentType "application/json"
```

#### Hoặc dùng curl:
```bash
curl -X POST http://localhost:5075/api/admin/seed-vocabulary-topic-hsk1 -H "Content-Type: application/json"
```

#### Hoặc dùng Postman/Browser:
- Method: `POST`
- URL: `http://localhost:5075/api/admin/seed-vocabulary-topic-hsk1`
- Headers: `Content-Type: application/json`

**Bước 3**: Kiểm tra kết quả:
```powershell
# Kiểm tra stats
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/stats" -Method Get

# Kiểm tra vocabulary topic (cần đăng nhập)
Invoke-RestMethod -Uri "http://localhost:5075/api/vocabularytopics/1" -Method Get
```

---

### Cách 2: Chạy Script PowerShell

**Bước 1**: Mở PowerShell

**Bước 2**: Chạy script:
```powershell
cd Backend/scripts
.\seed_vocabulary_topic.ps1
```

**Bước 3**: Kiểm tra kết quả trong console

---

### Cách 3: Chạy Migration (Nếu chưa chạy)

**Bước 1**: Di chuyển đến thư mục API:
```powershell
cd Backend/src/HiHSK.Api
```

**Bước 2**: Chạy migration:
```powershell
dotnet ef database update
```

**Lưu ý**: Migration sẽ tự động seed Vocabulary Topic HSK1 nếu file `seed-data-hsk1.json` tồn tại.

---

## 🔍 Kiểm tra dữ liệu đã seed

### Kiểm tra qua API:
```powershell
# Stats tổng quan
GET http://localhost:5075/api/admin/stats

# Chi tiết Vocabulary Topic (cần auth)
GET http://localhost:5075/api/vocabularytopics/1
```

### Kiểm tra trong Database:
```sql
-- Kiểm tra Vocabulary Topic
SELECT * FROM VocabularyTopics WHERE Id = 1;

-- Kiểm tra số từ vựng đã gán
SELECT COUNT(*) FROM WordVocabularyTopics WHERE VocabularyTopicId = 1;

-- Kiểm tra danh sách từ vựng
SELECT w.Id, w.Character, w.Pinyin, w.Meaning
FROM Words w
INNER JOIN WordVocabularyTopics wvt ON w.Id = wvt.WordId
WHERE wvt.VocabularyTopicId = 1
ORDER BY w.Character;
```

---

## ⚠️ Lưu ý

1. **Đảm bảo từ vựng HSK1 đã được seed trước**:
   - Vocabulary Topic cần từ vựng để gán vào
   - Nếu chưa có từ vựng, chạy migration hoặc seed data trước

2. **Kiểm tra database connection**:
   - Đảm bảo connection string đúng trong `appsettings.json`
   - Database đã được tạo

3. **Authentication**:
   - Endpoint seed có `[AllowAnonymous]` nên không cần đăng nhập
   - Endpoint get topic cần đăng nhập (có `[Authorize]`)

---

## 🐛 Xử lý lỗi

### Lỗi: "Cannot find module"
- Đảm bảo đang ở đúng thư mục
- Kiểm tra file script có tồn tại

### Lỗi: "Connection refused"
- Kiểm tra Backend API đang chạy
- Kiểm tra port 5000 không bị chiếm

### Lỗi: "No words found"
- Chạy seed data từ vựng trước:
  ```powershell
  POST http://localhost:5075/api/admin/seed?fileName=seed-data-hsk1.json
  ```

### Lỗi: "Vocabulary Topic already exists"
- Không sao, topic đã tồn tại
- Chỉ thêm các từ vựng chưa được gán

---

## ✅ Kết quả mong đợi

Sau khi seed thành công:
- ✅ Vocabulary Topic HSK1 (Id=1) được tạo
- ✅ Tất cả từ vựng HSK1 được gán vào topic
- ✅ Trang `/vocabulary/1` hiển thị danh sách từ vựng
- ✅ Có thể học và ôn tập từ vựng

---

## 📞 Hỗ trợ

Nếu vẫn gặp lỗi, kiểm tra:
1. Backend logs trong console
2. Database có dữ liệu chưa
3. API endpoint có hoạt động không

