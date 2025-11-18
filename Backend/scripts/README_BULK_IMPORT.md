# 📚 Bulk Import Scripts - Hướng dẫn sử dụng

## 🎯 Mục đích
Scripts này giúp bổ sung hàng loạt từ vựng vào database từ các nguồn mở.

## 📁 Danh sách Scripts

### 1. `download_hsk_data.py` ⭐
**Mô tả**: Download dữ liệu HSK 1-6 từ GitHub (miễn phí)

**Sử dụng:**
```powershell
cd Backend/scripts
python download_hsk_data.py
```

**Output**: `Backend/data/hsk{1-6}.json` (~5,000 từ)

---

### 2. `import_hsk_all_levels.py` ⭐
**Mô tả**: Import dữ liệu HSK vào database qua API

**Yêu cầu:**
- Backend API đang chạy (`https://localhost:7028`)
- Đã chạy `download_hsk_data.py`

**Sử dụng:**
```powershell
cd Backend/scripts
python import_hsk_all_levels.py
```

**Options:**
- Chọn cấp độ: 1, 1-2, 1-3, 1-4, 1-6
- Batch size: 10 từ/batch (có thể điều chỉnh)
- Delay: 1s giữa các batch

**Thời gian:**
- HSK 1: ~2 phút
- HSK 1-2: ~5 phút
- HSK 1-6: ~30-45 phút

---

### 3. `translation_dict.py`
**Mô tả**: Dictionary dịch từ tiếng Anh sang tiếng Việt

**Sử dụng:** Import trong script khác
```python
from translation_dict import TRANSLATION_DICT
translated = TRANSLATION_DICT.get("hello", "hello")
```

---

## 🚀 Quick Start

### Bước 1: Cài đặt dependencies

```powershell
pip install requests
```

### Bước 2: Download dữ liệu

```powershell
cd Backend/scripts
python download_hsk_data.py
```

Chọn `1` (aldrian/hsk-vocabulary)

### Bước 3: Start Backend API

```powershell
cd Backend/src/HiHSK.Api
dotnet run
```

### Bước 4: Import vào database

```powershell
# Terminal mới
cd Backend/scripts
python import_hsk_all_levels.py
```

Chọn `5` (HSK 1-6)

### Bước 5: Kiểm tra

```sql
SELECT HSKLevel, COUNT(*) as Total
FROM Words
GROUP BY HSKLevel
ORDER BY HSKLevel;
```

---

## ⚙️ Cấu hình

### Thay đổi API URL

Mở `import_hsk_all_levels.py`, sửa:

```python
API_BASE_URL = "https://localhost:7028/api"  # Thay đổi port nếu cần
```

### Thay đổi Batch Size

```python
def import_hsk_level(self, level: int, filepath: Path, batch_size: int = 10):
```

Giảm `batch_size` nếu server bị quá tải (VD: 5)
Tăng `batch_size` nếu muốn nhanh hơn (VD: 20)

### Thay đổi Delay

```python
time.sleep(1)  # Delay 1s giữa các batch
```

---

## 🐛 Troubleshooting

### Lỗi: `Connection refused`
**Nguyên nhân**: Backend API chưa chạy
**Giải pháp**:
```powershell
cd Backend/src/HiHSK.Api
dotnet run
```

### Lỗi: `File not found: hsk1.json`
**Nguyên nhân**: Chưa download dữ liệu
**Giải pháp**:
```powershell
python download_hsk_data.py
```

### Lỗi: `SSL Certificate verification failed`
**Nguyên nhân**: HTTPS certificate chưa trust
**Giải pháp**: Script đã tự động `verify=False` cho localhost

### Import chậm
**Nguyên nhân**: Gemini API chậm (tạo từ mới)
**Giải pháp**:
- Tăng timeout
- Giảm batch size
- Chạy lúc mạng tốt

### Nhiều từ bị skip
**Nguyên nhân**: Từ đã tồn tại trong DB
**Giải pháp**: Bình thường, không cần xử lý

---

## 📊 Monitoring

### Log Format

```
📚 Đang import HSK 1 từ hsk1.json
⏳ Batch 1/15 (10 từ):
  ✅ Tiến độ: 10/150 (6.7%)
  
📊 TỔNG KẾT IMPORT
⏱️  Thời gian: 123.45s
✅ Thành công: 145 từ
⏭️  Bỏ qua (đã tồn tại): 5 từ
❌ Thất bại: 0 từ
```

### Progress Tracking

Script tự động log:
- Batch hiện tại / Tổng batch
- Số từ đã xử lý
- % tiến độ
- Thời gian ước tính

---

## 🔒 Security

### API Authentication

Nếu API yêu cầu authentication:

```python
API_TOKEN = "your-token-here"
```

Script sẽ tự động thêm header:
```
Authorization: Bearer your-token-here
```

---

## 📈 Performance Tips

### 1. Tăng tốc import

```python
batch_size = 20  # Thay vì 10
time.sleep(0.5)  # Thay vì 1s
```

⚠️ **Lưu ý**: Có thể gây quá tải server

### 2. Parallel Processing

Chạy nhiều script đồng thời (mỗi HSK level 1 script):

```powershell
# Terminal 1
python import_hsk_level.py --level 1

# Terminal 2
python import_hsk_level.py --level 2

# ...
```

### 3. Database Optimization

Trước khi import:
```sql
-- Tạm disable indexes
ALTER INDEX ALL ON Words DISABLE;

-- Import...

-- Enable lại indexes
ALTER INDEX ALL ON Words REBUILD;
```

---

## 📞 Support

Nếu gặp vấn đề:
1. Check log output
2. Check Backend API logs
3. Check database connection
4. Report issue với full error message

---

**Happy Importing! 🚀**

