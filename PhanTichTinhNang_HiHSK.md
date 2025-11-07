# 📊 PHÂN TÍCH CHI TIẾT CÁC TÍNH NĂNG HiHSK

## 📑 MỤC LỤC
1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Phân tích từng tính năng](#2-phân-tích-từng-tính-năng)
3. [Luồng nghiệp vụ chính](#3-luồng-nghiệp-vụ-chính)
4. [Yêu cầu hệ thống](#4-yêu-cầu-hệ-thống)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Mục đích
HiHSK là nền tảng học tiếng Trung trực tuyến, tập trung vào chuẩn HSK quốc tế, cung cấp đầy đủ tài nguyên từ cơ bản đến nâng cao.

### 1.2. Đối tượng người dùng
- **Người học tự do**: Tự học, không theo chương trình cụ thể
- **Thí sinh HSK**: Chuẩn bị thi chứng chỉ HSK 1-6
- **Học sinh THPT**: Luyện thi tiếng Trung THPT
- **Người học nâng cao**: Cải thiện kỹ năng đọc, viết, nghe, nói

### 1.3. Kiến trúc hệ thống
- **Frontend**: Next.js (React) với TypeScript
- **Backend**: .NET 8.0 API
- **Database**: SQL Server
- **Authentication**: ASP.NET Core Identity với JWT

---

## 2. PHÂN TÍCH TỪNG TÍNH NĂNG

### 2.1. 🔤 GIÁO TRÌNH HSK (HSK Curriculum)

#### **Mô tả**
Chương trình học theo chuẩn HSK quốc tế, chia thành 6 cấp độ từ cơ bản đến nâng cao, mỗi cấp độ có khoảng 25 bài học.

#### **Đặc điểm kỹ thuật**
- **Số lượng**: 150 bài học tổng cộng (khoảng 25 bài/cấp)
- **Cấu trúc**: Theo thứ tự từ HSK 1 → HSK 6
- **Nội dung mỗi bài**: Từ vựng, ngữ pháp, bài tập, quiz

#### **Luồng hoạt động**
```
1. Người dùng chọn cấp độ HSK (1-6)
   ↓
2. Hệ thống hiển thị danh sách bài học của cấp độ
   ↓
3. Người dùng chọn bài học
   ↓
4. Hệ thống hiển thị:
   - Từ vựng trong bài
   - Ngữ pháp
   - Nội dung bài học (HTML/Markdown)
   - Bài tập luyện tập
   ↓
5. Người dùng làm bài tập
   ↓
6. Hệ thống chấm điểm và lưu tiến độ
   ↓
7. Mở khóa bài học tiếp theo khi hoàn thành
```

#### **Yêu cầu chức năng**
- ✅ Hiển thị danh sách khóa học theo cấp độ HSK
- ✅ Xem chi tiết bài học với đầy đủ nội dung
- ✅ Làm bài tập và quiz
- ✅ Chấm điểm tự động
- ✅ Lưu tiến độ học tập
- ✅ Mở khóa bài học theo thứ tự (bắt buộc hoàn thành bài trước)
- ✅ Hiển thị phần trăm hoàn thành khóa học

#### **Yêu cầu phi chức năng**
- Hiển thị nội dung nhanh (< 2s)
- Hỗ trợ đa phương tiện (video, audio, hình ảnh)
- Responsive trên mobile/tablet/desktop

---

### 2.2. 📚 TỪ VỰNG THEO CHỦ ĐỀ (Vocabulary by Topic)

#### **Mô tả**
Hệ thống từ vựng được phân loại theo chủ đề như: Gia đình, Màu sắc, Động vật, Thực phẩm, Du lịch, v.v. Giúp học viên học từ vựng theo ngữ cảnh.

#### **Đặc điểm kỹ thuật**
- **Số lượng**: 80 bài học với nhiều chủ đề
- **Mỗi chủ đề**: 20-50 từ vựng
- **Flashcard system**: SRS (Spaced Repetition System)

#### **Luồng hoạt động**
```
1. Người dùng xem danh sách chủ đề từ vựng
   ↓
2. Chọn chủ đề muốn học
   ↓
3. Hệ thống hiển thị danh sách từ vựng trong chủ đề:
   - Chữ Hán
   - Pinyin
   - Nghĩa tiếng Việt
   - Audio phát âm
   - Câu ví dụ
   ↓
4. Người dùng học bằng flashcard:
   - Xem mặt trước (chữ Hán)
   - Lật mặt sau (nghĩa, pinyin)
   - Đánh giá: Dễ / Khó / Quên
   ↓
5. Hệ thống lưu tiến độ và lên lịch ôn tập
   ↓
6. Hiển thị từ cần ôn tập hôm nay
```

#### **Yêu cầu chức năng**
- ✅ Phân loại từ vựng theo chủ đề
- ✅ Flashcard với hiệu ứng lật
- ✅ Phát âm audio cho mỗi từ
- ✅ SRS tự động lên lịch ôn tập
- ✅ Thống kê số từ đã học / đang học / đã thuộc
- ✅ Tìm kiếm từ vựng
- ✅ Lọc theo cấp độ HSK
- ✅ Đánh dấu từ yêu thích

#### **Yêu cầu phi chức năng**
- Tải audio nhanh (< 1s)
- Animations mượt mà cho flashcard
- Có thể học offline (cache từ vựng)

---

### 2.3. 💬 HỘI THOẠI (Dialogues/Conversations)

#### **Mô tả**
Học tiếng Trung qua các đoạn hội thoại thực tế trong cuộc sống hàng ngày, giúp cải thiện kỹ năng giao tiếp.

#### **Đặc điểm kỹ thuật**
- **Số lượng**: 120 bài hội thoại
- **Các tình huống**: Mua sắm, Nhà hàng, Giao thông, Bệnh viện, v.v.
- **Định dạng**: Text + Audio + Pinyin + Translation

#### **Luồng hoạt động**
```
1. Người dùng chọn chủ đề hội thoại
   ↓
2. Hệ thống hiển thị danh sách hội thoại
   ↓
3. Người dùng chọn một hội thoại:
   - Mô tả tình huống (ví dụ: "Tại nhà hàng")
   ↓
4. Hiển thị hội thoại với các tính năng:
   - Audio toàn bộ hội thoại
   - Audio từng câu riêng lẻ
   - Text tiếng Trung + Pinyin
   - Bản dịch tiếng Việt
   - Highlight từ vựng quan trọng
   ↓
5. Người dùng có thể:
   - Nghe và lặp lại
   - Xem giải thích từ vựng
   - Làm bài tập về hội thoại
   ↓
6. Hệ thống lưu tiến độ
```

#### **Yêu cầu chức năng**
- ✅ Hiển thị hội thoại với đầy đủ thông tin
- ✅ Phát audio toàn bộ hoặc từng câu
- ✅ Highlight từ vựng có thể click
- ✅ Hiển thị/ẩn pinyin và bản dịch
- ✅ Bài tập về hội thoại (điền từ, sắp xếp câu)
- ✅ Tốc độ phát audio có thể điều chỉnh
- ✅ Lặp lại câu cụ thể
- ✅ Ghi âm và so sánh phát âm

#### **Yêu cầu phi chức năng**
- Audio chất lượng cao (128kbps+)
- Đồng bộ text với audio (karaoke-style)
- Hỗ trợ background playback

---

### 2.4. 📖 ĐỌC HIỂU (Reading Comprehension)

#### **Mô tả**
Các bài đọc từ cơ bản đến nâng cao, giúp cải thiện kỹ năng đọc hiểu và mở rộng vốn từ vựng.

#### **Đặc điểm kỹ thuật**
- **Số lượng**: 90 bài đọc
- **Độ dài**: 100-1000 từ tùy cấp độ
- **Thể loại**: Tin tức, Truyện ngắn, Bài luận, Quảng cáo

#### **Luồng hoạt động**
```
1. Người dùng chọn bài đọc theo cấp độ HSK
   ↓
2. Hệ thống hiển thị bài đọc:
   - Text tiếng Trung
   - Có thể toggle hiển thị pinyin
   ↓
3. Người dùng đọc và có thể:
   - Click vào từ để xem nghĩa
   - Highlight từ để lưu vào từ vựng
   - Dịch đoạn văn
   ↓
4. Sau khi đọc xong:
   - Hiển thị câu hỏi đọc hiểu
   - Multiple choice
   - Trả lời đúng/sai
   ↓
5. Hệ thống chấm điểm và giải thích đáp án
   ↓
6. Hiển thị từ vựng mới trong bài
```

#### **Yêu cầu chức năng**
- ✅ Hiển thị bài đọc với font size có thể điều chỉnh
- ✅ Click vào từ để xem nghĩa (popup)
- ✅ Toggle hiển thị/ẩn pinyin
- ✅ Highlight và lưu từ vựng
- ✅ Bài tập đọc hiểu sau mỗi bài
- ✅ Thống kê tốc độ đọc
- ✅ Dịch đoạn văn tự động
- ✅ Đánh dấu từ vựng đã biết/chưa biết

#### **Yêu cầu phi chức năng**
- Text rendering rõ ràng (font tiếng Trung đẹp)
- Tải bài đọc nhanh
- Hỗ trợ dark mode

---

### 2.5. 📝 LUYỆN THI (Test Practice)

#### **Mô tả**
Đề thi thử HSK và THPT với hệ thống chấm điểm tự động, phân tích chi tiết kết quả để người học biết điểm mạnh/yếu.

#### **Đặc điểm kỹ thuật**
- **HSK**: 60 đề thi (10 đề/cấp độ)
- **THPT**: 10 đề thi
- **Thời gian**: Theo chuẩn thi thật
- **Cấu trúc**: Giống đề thi thật (Nghe, Đọc, Viết)

#### **Luồng hoạt động**
```
1. Người dùng chọn loại đề thi (HSK hoặc THPT)
   ↓
2. Chọn cấp độ (HSK 1-6)
   ↓
3. Hệ thống hiển thị:
   - Thời gian làm bài
   - Số câu hỏi
   - Hướng dẫn
   ↓
4. Người dùng bắt đầu làm bài:
   - Phần Nghe: Phát audio và chọn đáp án
   - Phần Đọc: Đọc và chọn đáp án
   - Phần Viết: Điền từ hoặc viết câu
   ↓
5. Có thể:
   - Đánh dấu câu để xem lại
   - Bỏ qua và quay lại
   - Xem thời gian còn lại
   ↓
6. Sau khi nộp bài:
   - Hệ thống chấm điểm tự động
   - Hiển thị kết quả chi tiết:
     * Điểm từng phần
     * Câu đúng/sai
     * Giải thích đáp án
     * Phân tích điểm mạnh/yếu
   ↓
7. Lưu kết quả vào lịch sử
```

#### **Yêu cầu chức năng**
- ✅ Tạo đề thi ngẫu nhiên từ ngân hàng câu hỏi
- ✅ Timer đếm ngược thời gian
- ✅ Auto-submit khi hết thời gian
- ✅ Chấm điểm tự động
- ✅ Phân tích kết quả chi tiết
- ✅ Lịch sử làm bài
- ✅ So sánh điểm với các lần làm trước
- ✅ Export kết quả PDF
- ✅ In đề thi (nếu cần)

#### **Yêu cầu phi chức năng**
- Không thể quay lại sau khi nộp bài
- Audio chất lượng tốt cho phần nghe
- Auto-save câu trả lời mỗi 30s
- Hỗ trợ offline mode cho phần đọc

---

### 2.6. 🔤 BỘ THỦ (Radicals - Bộ thủ Hán tự)

#### **Mô tả**
Học 214 bộ thủ cơ bản trong tiếng Trung, giúp nhận biết và viết chữ Hán chính xác hơn.

#### **Đặc điểm kỹ thuật**
- **Số lượng**: 214 bộ thủ
- **Mỗi bộ thủ**: Ký tự, Nghĩa, Số nét, Cách viết
- **Tương tác**: Animation cách viết, Ví dụ từ vựng

#### **Luồng hoạt động**
```
1. Người dùng xem danh sách 214 bộ thủ
   ↓
2. Có thể:
   - Tìm kiếm theo ký tự hoặc nghĩa
   - Lọc theo số nét
   - Sắp xếp theo thứ tự
   ↓
3. Chọn một bộ thủ để xem chi tiết:
   - Ký tự bộ thủ
   - Pinyin
   - Nghĩa
   - Số nét
   - Animation cách viết (stroke order)
   - Danh sách từ vựng chứa bộ thủ này
   ↓
4. Người dùng có thể:
   - Xem animation cách viết nhiều lần
   - Luyện viết bộ thủ (touch/mouse)
   - Ôn tập từ vựng liên quan
```

#### **Yêu cầu chức năng**
- ✅ Hiển thị đầy đủ 214 bộ thủ
- ✅ Animation cách viết (SVG path)
- ✅ Tìm kiếm và lọc bộ thủ
- ✅ Hiển thị từ vựng liên quan
- ✅ Luyện viết bộ thủ (canvas)
- ✅ Đếm số nét và so sánh với đáp án
- ✅ Thống kê tiến độ học bộ thủ

#### **Yêu cầu phi chức năng**
- Animation mượt mà 60fps
- Hỗ trợ touch trên mobile
- Canvas rendering nhanh

---

### 2.7. 🌐 DỊCH (Translation Tool)

#### **Mô tả**
Công cụ dịch thông minh với từ điển tích hợp, hỗ trợ dịch Trung-Việt, Việt-Trung, kèm ví dụ minh họa.

#### **Đặc điểm kỹ thuật**
- **Dịch**: Đoạn văn, câu, từ
- **Từ điển**: Tra từ với ví dụ
- **Lịch sử**: Lưu các lần dịch trước

#### **Luồng hoạt động**
```
1. Người dùng mở công cụ dịch
   ↓
2. Nhập/nhúng text cần dịch:
   - Có thể nhập từ bàn phím
   - Hoặc paste từ clipboard
   - Hoặc upload file
   ↓
3. Chọn ngôn ngữ:
   - Trung → Việt
   - Việt → Trung
   - Trung → Anh (nếu có)
   ↓
4. Hệ thống dịch và hiển thị kết quả:
   - Bản dịch chính
   - Từng từ được highlight và có thể click
   - Khi click từ: Hiển thị từ điển với:
     * Nghĩa chi tiết
     * Pinyin
     * Ví dụ câu
     * Audio phát âm
   ↓
5. Có thể:
   - Copy bản dịch
   - Lưu vào lịch sử
   - Chia sẻ
   - Đánh giá chất lượng dịch
```

#### **Yêu cầu chức năng**
- ✅ Dịch đa ngôn ngữ (Trung-Việt-Việt-Trung)
- ✅ Tra từ điển tích hợp
- ✅ Lịch sử dịch
- ✅ Dịch file (Word, PDF)
- ✅ Text-to-speech cho bản dịch
- ✅ Highlight từ có thể click
- ✅ Export lịch sử dịch

#### **Yêu cầu phi chức năng**
- Dịch nhanh (< 2s cho đoạn văn < 500 từ)
- Chính xác cao (sử dụng API dịch chất lượng)
- Hỗ trợ OCR (dịch từ ảnh)

---

### 2.8. 📝 MẪU CÂU (Sentence Patterns)

#### **Mô tả**
Học các mẫu câu tiếng Trung thông dụng qua các chủ đề, giúp nắm vững ngữ pháp và cách diễn đạt.

#### **Đặc điểm kỹ thuật**
- **Số lượng**: 70 bài học
- **Mỗi bài**: 5-10 mẫu câu
- **Ví dụ**: Mỗi mẫu câu có 3-5 ví dụ

#### **Luồng hoạt động**
```
1. Người dùng xem danh sách bài học mẫu câu
   ↓
2. Chọn bài học theo chủ đề
   ↓
3. Hệ thống hiển thị các mẫu câu:
   - Mẫu câu (ví dụ: "A 比 B 更...")
   - Nghĩa tiếng Việt
   - Cách sử dụng
   - Ví dụ câu (3-5 câu)
     * Mỗi ví dụ có: Text + Pinyin + Translation + Audio
   ↓
4. Người dùng có thể:
   - Nghe audio ví dụ
   - Làm bài tập điền vào chỗ trống
   - Viết câu sử dụng mẫu câu
   ↓
5. Hệ thống chấm và phản hồi
```

#### **Yêu cầu chức năng**
- ✅ Hiển thị mẫu câu với format rõ ràng
- ✅ Ví dụ minh họa đa dạng
- ✅ Audio cho ví dụ
- ✅ Bài tập thực hành
- ✅ Tìm kiếm mẫu câu
- ✅ Lọc theo chủ đề ngữ pháp
- ✅ Lưu mẫu câu yêu thích

#### **Yêu cầu phi chức năng**
- Layout rõ ràng, dễ đọc
- Audio chất lượng tốt

---

### 2.9. ✍️ LUYỆN VIẾT (Writing Practice)

#### **Mô tả**
Luyện viết chữ Hán chuẩn nét với hướng dẫn chi tiết, đếm số nét và kiểm tra độ chính xác.

#### **Đặc điểm kỹ thuật**
- **Số lượng**: 50 bài luyện viết
- **Công nghệ**: Canvas/HTML5 để vẽ
- **Kiểm tra**: So sánh stroke order và số nét

#### **Luồng hoạt động**
```
1. Người dùng chọn từ cần luyện viết
   ↓
2. Hệ thống hiển thị:
   - Từ cần viết (chữ Hán)
   - Animation hướng dẫn cách viết
   - Grid để viết
   ↓
3. Người dùng viết bằng:
   - Mouse (desktop)
   - Touch/stylus (mobile/tablet)
   ↓
4. Hệ thống:
   - Nhận diện nét vẽ
   - Đếm số nét
   - So sánh với đáp án
   - Hiển thị nét sai
   ↓
5. Sau khi viết xong:
   - Hiển thị điểm số
   - Số nét đúng/sai
   - Gợi ý cải thiện
   ↓
6. Có thể:
   - Xóa và viết lại
   - Xem lại animation
   - Lưu kết quả
```

#### **Yêu cầu chức năng**
- ✅ Canvas vẽ chữ Hán
- ✅ Animation hướng dẫn cách viết
- ✅ Nhận diện stroke order
- ✅ Đếm số nét tự động
- ✅ So sánh và chấm điểm
- ✅ Highlight nét sai
- ✅ Lưu kết quả luyện viết
- ✅ Thống kê tiến độ

#### **Yêu cầu phi chức năng**
- Canvas mượt mà 60fps
- Nhận diện chính xác stroke order (80%+)
- Hỗ trợ pressure-sensitive stylus
- Tối ưu cho mobile

---

### 2.10. 🔢 LƯỢNG TỪ (Measure Words)

#### **Mô tả**
Học các lượng từ phổ biến trong tiếng Trung (个, 张, 本, v.v.) kèm ví dụ cụ thể về cách sử dụng.

#### **Đặc điểm kỹ thuật**
- **Số lượng**: 45 bài học
- **Mỗi lượng từ**: Nghĩa, Cách dùng, Ví dụ

#### **Luồng hoạt động**
```
1. Người dùng xem danh sách lượng từ
   ↓
2. Có thể lọc theo:
   - Danh mục (người, đồ vật, động vật...)
   - Mức độ phổ biến
   ↓
3. Chọn một lượng từ để học:
   - Ký tự + Pinyin
   - Nghĩa
   - Cách sử dụng
   - Ví dụ câu (5-10 ví dụ)
     * Format: Số + Lượng từ + Danh từ
     * Ví dụ: "三个人" (Ba người)
   ↓
4. Làm bài tập:
   - Điền lượng từ vào chỗ trống
   - Chọn lượng từ đúng
   ↓
5. Hệ thống chấm và giải thích
```

#### **Yêu cầu chức năng**
- ✅ Danh sách lượng từ đầy đủ
- ✅ Phân loại theo danh mục
- ✅ Ví dụ minh họa
- ✅ Bài tập thực hành
- ✅ Tìm kiếm lượng từ
- ✅ Liên kết với từ vựng (từ nào dùng lượng từ nào)

#### **Yêu cầu phi chức năng**
- Layout đơn giản, dễ hiểu
- Audio cho ví dụ

---

### 2.11. 🎓 LUYỆN ĐỀ THPT (THPT Exam Practice)

#### **Mô tả**
Luyện đề thi thử THPT Quốc gia môn Tiếng Trung với hệ thống chấm điểm tự động và giải thích chi tiết.

#### **Đặc điểm kỹ thuật**
- **Số lượng**: 10 đề thi
- **Cấu trúc**: Theo đề thi THPT chính thức
- **Thời gian**: 60-90 phút

#### **Luồng hoạt động**
```
1. Người dùng chọn "Luyện đề THPT"
   ↓
2. Xem danh sách đề thi:
   - Đề năm nào
   - Mức độ khó
   - Thời gian làm bài
   - Số người đã làm
   ↓
3. Chọn đề và bắt đầu làm:
   - Giống như luyện thi HSK
   - Có thể làm theo thời gian thực
   hoặc không giới hạn thời gian
   ↓
4. Sau khi nộp bài:
   - Chấm điểm
   - Hiển thị đáp án chi tiết
   - Phân tích điểm mạnh/yếu
   - So sánh với các lần làm trước
```

#### **Yêu cầu chức năng**
- ✅ Đề thi theo chuẩn THPT
- ✅ Chấm điểm tự động
- ✅ Phân tích kết quả
- ✅ Lịch sử làm bài
- ✅ Bảng xếp hạng (optional)
- ✅ Export kết quả

#### **Yêu cầu phi chức năng**
- Giống như luyện thi HSK

---

### 2.12. 🎤 PHÁT ÂM (Pronunciation Practice)

#### **Mô tả**
Luyện phát âm tiếng Trung với công nghệ nhận diện giọng nói, so sánh với phát âm chuẩn.

#### **Luồng hoạt động**
```
1. Người dùng chọn từ/câu cần luyện phát âm
   ↓
2. Nghe audio phát âm chuẩn
   ↓
3. Ghi âm phát âm của mình
   ↓
4. Hệ thống:
   - So sánh với phát âm chuẩn
   - Phân tích tone, âm tiết
   - Hiển thị điểm số và gợi ý cải thiện
   ↓
5. Có thể nghe lại và thử lại
```

#### **Yêu cầu chức năng**
- ✅ Ghi âm phát âm
- ✅ So sánh với phát âm chuẩn (Speech Recognition API)
- ✅ Phân tích tone (4 tone)
- ✅ Hiển thị waveform
- ✅ Điểm số phát âm
- ✅ Gợi ý cải thiện

#### **Yêu cầu phi chức năng**
- Nhận diện giọng nói chính xác
- Real-time feedback
- Hỗ trợ microphone trên mobile

---

## 3. LUỒNG NGHIỆP VỤ CHÍNH

### 3.1. Luồng đăng ký và đăng nhập
```
1. Người dùng truy cập trang chủ
   ↓
2. Chọn "Đăng ký"
   ↓
3. Nhập thông tin:
   - Email/Số điện thoại
   - Mật khẩu
   - Xác nhận mật khẩu
   ↓
4. Hệ thống gửi email xác nhận
   ↓
5. Người dùng click link xác nhận
   ↓
6. Đăng nhập thành công
   ↓
7. Chọn cấp độ HSK hoặc làm bài test xác định trình độ
   ↓
8. Bắt đầu học
```

### 3.2. Luồng học bài học mới
```
1. Người dùng đăng nhập
   ↓
2. Xem Dashboard:
   - Tiến độ học tập
   - Bài học tiếp theo
   - Từ vựng cần ôn tập hôm nay
   ↓
3. Chọn bài học
   ↓
4. Học nội dung:
   - Đọc nội dung bài học
   - Học từ vựng (flashcard)
   - Nghe audio
   ↓
5. Làm bài tập
   ↓
6. Hoàn thành → Mở khóa bài tiếp theo
```

### 3.3. Luồng ôn tập từ vựng (SRS)
```
1. Hệ thống tính toán từ vựng cần ôn hôm nay
   (dựa trên NextReviewDate)
   ↓
2. Hiển thị trên Dashboard
   ↓
3. Người dùng click "Ôn tập"
   ↓
4. Flashcard hiển thị từng từ:
   - Hiển thị chữ Hán
   - Người dùng nhớ nghĩa → Click "Nhớ"
   - Không nhớ → Click "Quên"
   ↓
5. Hệ thống:
   - Cập nhật NextReviewDate
   - Cập nhật trạng thái (Learning/Mastered)
   - Tăng ReviewCount
   ↓
6. Lặp lại cho đến hết từ cần ôn
```

---

## 4. YÊU CẦU HỆ THỐNG

### 4.1. Yêu cầu chức năng tổng quan

#### **Quản lý người dùng**
- ✅ Đăng ký/Đăng nhập/Đăng xuất
- ✅ Quên mật khẩu
- ✅ Xác thực email
- ✅ Quản lý profile
- ✅ Đổi mật khẩu

#### **Quản lý nội dung (Admin)**
- ✅ CRUD khóa học, bài học
- ✅ CRUD từ vựng, câu hỏi
- ✅ Quản lý người dùng
- ✅ Thống kê hệ thống
- ✅ Import/Export dữ liệu

#### **Thống kê và báo cáo**
- ✅ Dashboard người dùng:
  - Tiến độ học tập
  - Số từ đã học
  - Điểm số bài thi
  - Lịch sử học tập
- ✅ Thống kê chi tiết:
  - Biểu đồ tiến độ theo ngày/tuần/tháng
  - Điểm mạnh/yếu (theo kỹ năng)
  - Từ vựng cần ôn tập

### 4.2. Yêu cầu phi chức năng

#### **Hiệu năng**
- Tải trang < 2s
- API response time < 500ms
- Hỗ trợ 1000+ người dùng đồng thời

#### **Bảo mật**
- JWT authentication
- HTTPS bắt buộc
- Validate input đầu vào
- SQL injection prevention
- XSS prevention

#### **Khả dụng**
- Uptime 99.5%
- Backup database hàng ngày
- Error logging và monitoring

#### **Khả năng mở rộng**
- Kiến trúc microservices-ready
- Horizontal scaling
- CDN cho static assets
- Cache cho dữ liệu thường dùng

#### **Tương thích**
- Responsive design (mobile, tablet, desktop)
- Cross-browser (Chrome, Firefox, Safari, Edge)
- Progressive Web App (PWA)

### 4.3. Yêu cầu tích hợp

#### **API bên ngoài**
- Dịch thuật (Google Translate API hoặc tương tự)
- Text-to-Speech (cho phát âm)
- Speech Recognition (cho luyện phát âm)
- Payment gateway (nếu có premium features)

#### **Third-party services**
- Email service (SendGrid, AWS SES)
- Cloud storage (Azure Blob, AWS S3) cho audio/video
- Analytics (Google Analytics)

---

## 5. KẾT LUẬN

Hệ thống HiHSK là một nền tảng học tiếng Trung toàn diện với 12 tính năng chính, hỗ trợ đầy đủ từ học tập đến luyện thi. Database đã được thiết kế chi tiết để đáp ứng tất cả các yêu cầu này.

**Ưu tiên phát triển:**
1. **Phase 1**: Đăng nhập, Giáo trình HSK, Từ vựng (flashcard)
2. **Phase 2**: Hội thoại, Đọc hiểu, Luyện thi
3. **Phase 3**: Bộ thủ, Mẫu câu, Lượng từ
4. **Phase 4**: Luyện viết, Dịch, Phát âm, THPT

---

**Tài liệu này phục vụ cho:**
- Phân tích yêu cầu hệ thống
- Thiết kế database
- Phát triển frontend và backend
- Testing và QA
- Tài liệu cho đồ án tốt nghiệp

