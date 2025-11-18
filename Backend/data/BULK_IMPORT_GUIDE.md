# 📚 Hướng dẫn Bổ sung Dữ liệu Từ vựng Hàng loạt

## 🎯 Mục tiêu
Bổ sung **5,000-10,000 từ vựng** vào database để:
- ✅ Giảm gọi Gemini API (tiết kiệm thời gian & tiền)
- ✅ Cải thiện trải nghiệm người dùng (load nhanh hơn)
- ✅ Đầy đủ từ vựng HSK 1-6 + từ phổ biến

---

## 📊 So sánh các giải pháp

| Giải pháp | Số từ | Độ khó | Thời gian | Chi phí | Chất lượng |
|-----------|-------|--------|-----------|---------|------------|
| **1. Import HSK 1-6** | ~5,000 | ⭐ Dễ | ~30 phút | 💰 Miễn phí | ⭐⭐⭐⭐⭐ |
| **2. CC-CEDICT** | ~100,000 | ⭐⭐⭐ Khó | ~2-3 giờ | 💰 Miễn phí | ⭐⭐⭐⭐ |
| **3. Bulk Generate AI** | Tùy chọn | ⭐⭐ Trung bình | ~1-2 giờ | 💰💰 $5-20 | ⭐⭐⭐⭐⭐ |
| **4. Progressive Loading** | Tùy chọn | ⭐ Dễ | Tức thì | 💰 Miễn phí | ⭐⭐⭐ |

---

## ✅ Giải pháp 1: Import HSK 1-6 (ĐỀ XUẤT)

### Tại sao chọn giải pháp này?
- ✅ **Đầy đủ nhất**: 5,000 từ vựng chuẩn HSK
- ✅ **Miễn phí**: Nguồn dữ liệu mở
- ✅ **Nhanh chóng**: ~30 phút setup
- ✅ **Phù hợp app**: App học HSK nên có đủ từ HSK

### Bước 1: Download dữ liệu HSK

```powershell
cd Backend/scripts
python download_hsk_data.py
```

Script sẽ:
- Download HSK 1-6 từ GitHub (miễn phí)
- Lưu vào `Backend/data/hsk{1-6}.json`
- Tổng ~5,000 từ

**Nguồn dữ liệu:**
- [aldrian/hsk-vocabulary](https://github.com/aldrian/hsk-vocabulary) ⭐ Đề xuất
- [clem109/hsk-vocabulary](https://github.com/clem109/hsk-vocabulary)

### Bước 2: Import vào database

```powershell
cd Backend/scripts
python import_hsk_all_levels.py
```

Script sẽ:
- Đọc các file HSK JSON
- Gọi API `/vocabulary/get-or-create` cho mỗi từ
- Batch processing (10 từ/batch) để tránh quá tải
- Delay 1s giữa các batch
- Log tiến độ chi tiết

**Thời gian ước tính:**
- HSK 1-2 (300 từ): ~3-5 phút
- HSK 1-4 (1200 từ): ~10-15 phút
- HSK 1-6 (5000 từ): ~30-45 phút

### Bước 3: Kiểm tra

```sql
-- Đếm số từ theo HSK level
SELECT HSKLevel, COUNT(*) as Total
FROM Words
GROUP BY HSKLevel
ORDER BY HSKLevel;

-- Kết quả mong đợi:
-- HSK 1: 150
-- HSK 2: 150
-- HSK 3: 300
-- HSK 4: 600
-- HSK 5: 1300
-- HSK 6: 2500
-- TỔNG: ~5000
```

---

## 🔧 Giải pháp 2: Import CC-CEDICT (~100,000 từ)

### Khi nào dùng?
- Cần **từ điển đầy đủ** (không chỉ HSK)
- App mở rộng ngoài HSK (văn bản tự do, đọc báo, etc.)
- Có thời gian setup (2-3 giờ)

### Ưu điểm:
- ✅ ~100,000 từ vựng + cụm từ
- ✅ Miễn phí, open source
- ✅ Chất lượng tốt (community maintain)

### Nhược điểm:
- ❌ File lớn (~28MB uncompressed)
- ❌ Cần parse format đặc biệt
- ❌ Database lớn hơn (cân nhắc performance)
- ❌ Nhiều từ hiếm, ít dùng

### Cách triển khai:

**Bước 1: Download CC-CEDICT**

```powershell
# Download file
curl -o Backend/data/cedict_ts.u8 https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz

# Hoặc dùng browser: https://www.mdbg.net/chinese/dictionary/cedict.txt
```

**Bước 2: Parse CC-CEDICT**

```python
# Backend/scripts/parse_cedict.py (cần tạo)
# Format CC-CEDICT:
# 你好 你好 [ni3 hao3] /hello/hi/how are you/
```

**Bước 3: Import vào DB**

```powershell
python Backend/scripts/import_cedict.py
```

⚠️ **Lưu ý**: Giải pháp này phức tạp hơn, cần thêm code để parse format CC-CEDICT.

---

## 🤖 Giải pháp 3: Bulk Generate bằng AI

### Khi nào dùng?
- Cần thông tin **chất lượng cao** (AI generate examples, meanings)
- Có budget cho API calls (~$5-20 cho 5000 từ)
- Muốn customize dữ liệu (VD: meaning chuyên biệt)

### Cách triển khai:

**Bước 1: Tạo danh sách từ cần generate**

```python
# Backend/scripts/bulk_generate_ai.py
words_to_generate = [
    "你好", "谢谢", "对不起", ...  # List 5000 từ
]

for word in words_to_generate:
    # Gọi API /vocabulary/get-or-create
    # API sẽ tự động gọi Gemini nếu chưa có
    response = requests.get(f"{API_URL}/vocabulary/get-or-create?character={word}")
    time.sleep(2)  # Rate limit: 30 requests/min
```

**Ước tính chi phí:**
- Gemini API: ~$0.001-0.003/từ
- 5000 từ: ~$5-15
- Thời gian: ~2-3 giờ (với rate limit)

---

## 🔄 Giải pháp 4: Progressive Loading (Không cần import trước)

### Ý tưởng:
Không import trước, mà **tạo từ on-demand**:
- User gặp từ mới → API tạo + cache
- Dần dần database tự động phát triển
- Chỉ có từ user thực sự cần

### Ưu điểm:
- ✅ Không cần setup ban đầu
- ✅ Database nhỏ gọn (chỉ từ cần thiết)
- ✅ Tiết kiệm chi phí (không generate từ hiếm)

### Nhược điểm:
- ❌ User đầu tiên phải đợi (bad UX)
- ❌ Không kiểm soát được chất lượng
- ❌ Phụ thuộc vào Gemini API uptime

### Cải thiện:
✅ **Đã implement** trong code hiện tại:
- Pre-loading từ trong ví dụ
- Cache mechanism
- Batch API với retry

---

## 📋 So sánh & Khuyến nghị

### Khuyến nghị cho HiHSK app:

**Phase 1: Ngay lập tức (30 phút)**
```
✅ Import HSK 1-6 (~5,000 từ)
   → Đủ cho app học HSK
   → Miễn phí, nhanh chóng
```

**Phase 2: Sau 1-2 tuần (tùy chọn)**
```
⭐ Theo dõi user behavior:
   - Từ nào user hay gặp nhưng chưa có trong DB?
   - Import thêm những từ đó (bulk generate AI hoặc CC-CEDICT)
```

**Phase 3: Tương lai (khi mở rộng)**
```
🔮 Nếu app mở rộng ngoài HSK:
   - Import CC-CEDICT (100,000 từ)
   - Hoặc tích hợp dictionary API
```

---

## 🚀 Quick Start (30 phút)

```powershell
# 1. Download HSK data
cd Backend/scripts
python download_hsk_data.py
# Chọn: 1 (aldrian/hsk-vocabulary)

# 2. Import vào database
python import_hsk_all_levels.py
# Chọn: 5 (HSK 1-6)

# 3. Kiểm tra
# Mở SQL Server Management Studio, chạy:
# SELECT COUNT(*) FROM Words;
# Kết quả: ~5000+
```

---

## ❓ FAQ

**Q: Import HSK 1-6 có tốn tiền không?**
A: Không. Dữ liệu HSK là mở, miễn phí.

**Q: Import HSK có ảnh hưởng performance không?**
A: 5,000 từ là con số nhỏ. Với index tốt, không ảnh hưởng.

**Q: Nếu từ đã tồn tại, script có duplicate không?**
A: Không. Script check `IF NOT EXISTS` hoặc API trả về 409 Conflict.

**Q: Import xong, Gemini API có còn được gọi không?**
A: Có. Chỉ cho các từ KHÔNG có trong 5,000 từ HSK (từ hiếm).

**Q: Nên dùng giải pháp nào?**
A: **HSK 1-6** (Giải pháp 1) là tốt nhất cho app HiHSK.

---

## 📞 Hỗ trợ

Nếu gặp lỗi khi import:
1. Kiểm tra Backend API đang chạy
2. Kiểm tra database connection
3. Xem log trong console
4. Report issue với error message

---

**Tác giả:** AI Assistant  
**Cập nhật:** 2024

