-- Seed các từ phổ biến thường xuất hiện trong examples HSK1
-- Chạy script này để giảm số lần gọi AI khi user click vào từ

USE HIHSK
GO

-- Kiểm tra và insert các từ phổ biến (chỉ insert nếu chưa tồn tại)
MERGE INTO Words AS target
USING (VALUES
    -- Đại từ nhân xưng
    (N'我', 'wǒ', 'tôi', 1),
    (N'你', 'nǐ', 'bạn', 1),
    (N'他', 'tā', 'anh ấy', 1),
    (N'她', 'tā', 'cô ấy', 1),
    (N'们', 'men', '(trợ từ số nhiều)', 1),
    
    -- Động từ phổ biến
    (N'有', 'yǒu', 'có', 1),
    (N'是', 'shì', 'là', 1),
    (N'在', 'zài', 'ở, tại', 1),
    (N'说', 'shuō', 'nói', 1),
    (N'看', 'kàn', 'nhìn, xem', 1),
    (N'听', 'tīng', 'nghe', 1),
    (N'吃', 'chī', 'ăn', 1),
    (N'喝', 'hē', 'uống', 1),
    (N'去', 'qù', 'đi', 1),
    (N'来', 'lái', 'đến', 1),
    (N'做', 'zuò', 'làm', 1),
    (N'买', 'mǎi', 'mua', 1),
    (N'学', 'xué', 'học', 1),
    (N'想', 'xiǎng', 'muốn, nghĩ', 1),
    (N'知', 'zhī', 'biết', 1),
    (N'能', 'néng', 'có thể', 1),
    (N'会', 'huì', 'biết, sẽ', 1),
    (N'用', 'yòng', 'dùng', 1),
    (N'叫', 'jiào', 'gọi', 1),
    (N'问', 'wèn', 'hỏi', 1),
    (N'给', 'gěi', 'cho', 1),
    (N'坐', 'zuò', 'ngồi', 1),
    (N'住', 'zhù', 'ở, sống', 1),
    (N'走', 'zǒu', 'đi bộ', 1),
    (N'写', 'xiě', 'viết', 1),
    (N'读', 'dú', 'đọc', 1),
    (N'打', 'dǎ', 'đánh', 1),
    (N'开', 'kāi', 'mở', 1),
    (N'关', 'guān', 'đóng', 1),
    
    -- Trợ từ & từ phụ
    (N'的', 'de', '(trợ từ sở hữu)', 1),
    (N'了', 'le', '(trợ từ hoàn thành)', 1),
    (N'着', 'zhe', '(trợ từ tiếp diễn)', 1),
    (N'过', 'guò', '(trợ từ kinh nghiệm)', 1),
    (N'吗', 'ma', '(trợ từ nghi vấn)', 1),
    (N'呢', 'ne', '(trợ từ nghi vấn)', 1),
    (N'吧', 'ba', '(trợ từ đề nghị)', 1),
    (N'啊', 'a', '(trợ từ cảm thán)', 1),
    
    -- Phủ định & kết nối
    (N'不', 'bù', 'không', 1),
    (N'没', 'méi', 'chưa, không có', 1),
    (N'也', 'yě', 'cũng', 1),
    (N'都', 'dōu', 'đều', 1),
    (N'很', 'hěn', 'rất', 1),
    (N'太', 'tài', 'quá', 1),
    (N'和', 'hé', 'và', 1),
    (N'跟', 'gēn', 'với, theo', 1),
    (N'或', 'huò', 'hoặc', 1),
    (N'但', 'dàn', 'nhưng', 1),
    (N'而', 'ér', 'mà', 1),
    (N'就', 'jiù', 'thì, liền', 1),
    (N'才', 'cái', 'mới', 1),
    (N'还', 'hái', 'còn', 1),
    (N'再', 'zài', 'lại', 1),
    (N'又', 'yòu', 'lại', 1),
    
    -- Số từ
    (N'一', 'yī', 'một', 1),
    (N'二', 'èr', 'hai', 1),
    (N'三', 'sān', 'ba', 1),
    (N'四', 'sì', 'bốn', 1),
    (N'五', 'wǔ', 'năm', 1),
    (N'六', 'liù', 'sáu', 1),
    (N'七', 'qī', 'bảy', 1),
    (N'八', 'bā', 'tám', 1),
    (N'九', 'jiǔ', 'chín', 1),
    (N'十', 'shí', 'mười', 1),
    (N'百', 'bǎi', 'trăm', 1),
    (N'千', 'qiān', 'nghìn', 1),
    (N'万', 'wàn', 'vạn', 1),
    (N'个', 'gè', '(lượng từ chung)', 1),
    (N'些', 'xiē', 'một số, một ít', 1),
    (N'多', 'duō', 'nhiều', 1),
    (N'少', 'shǎo', 'ít', 1),
    
    -- Danh từ phổ biến  
    (N'人', 'rén', 'người', 1),
    (N'东', 'dōng', 'đông', 1),
    (N'西', 'xī', 'tây', 1),
    (N'南', 'nán', 'nam', 1),
    (N'北', 'běi', 'bắc', 1),
    (N'上', 'shàng', 'trên', 1),
    (N'下', 'xià', 'dưới', 1),
    (N'中', 'zhōng', 'giữa', 1),
    (N'内', 'nèi', 'trong', 1),
    (N'外', 'wài', 'ngoài', 1),
    (N'前', 'qián', 'trước', 1),
    (N'后', 'hòu', 'sau', 1),
    (N'左', 'zuǒ', 'trái', 1),
    (N'右', 'yòu', 'phải', 1),
    (N'天', 'tiān', 'trời, ngày', 1),
    (N'年', 'nián', 'năm', 1),
    (N'月', 'yuè', 'tháng', 1),
    (N'日', 'rì', 'ngày', 1),
    (N'时', 'shí', 'giờ', 1),
    (N'分', 'fēn', 'phút', 1),
    (N'秒', 'miǎo', 'giây', 1),
    (N'今', 'jīn', 'nay', 1),
    (N'明', 'míng', 'sáng', 1),
    (N'昨', 'zuó', 'hôm qua', 1),
    (N'家', 'jiā', 'nhà', 1),
    (N'国', 'guó', 'nước', 1),
    (N'水', 'shuǐ', 'nước', 1),
    (N'火', 'huǒ', 'lửa', 1),
    (N'饭', 'fàn', 'cơm', 1),
    (N'茶', 'chá', 'trà', 1),
    (N'钱', 'qián', 'tiền', 1),
    (N'书', 'shū', 'sách', 1),
    (N'车', 'chē', 'xe', 1),
    (N'话', 'huà', 'lời nói', 1),
    (N'名', 'míng', 'tên', 1),
    (N'字', 'zì', 'chữ', 1),
    
    -- Tính từ
    (N'好', 'hǎo', 'tốt', 1),
    (N'大', 'dà', 'to', 1),
    (N'小', 'xiǎo', 'nhỏ', 1),
    (N'新', 'xīn', 'mới', 1),
    (N'旧', 'jiù', 'cũ', 1),
    (N'长', 'cháng', 'dài', 1),
    (N'短', 'duǎn', 'ngắn', 1),
    (N'高', 'gāo', 'cao', 1),
    (N'低', 'dī', 'thấp', 1),
    (N'快', 'kuài', 'nhanh', 1),
    (N'慢', 'màn', 'chậm', 1),
    (N'早', 'zǎo', 'sớm', 1),
    (N'晚', 'wǎn', 'muộn, tối', 1),
    (N'热', 'rè', 'nóng', 1),
    (N'冷', 'lěng', 'lạnh', 1),
    (N'远', 'yuǎn', 'xa', 1),
    (N'近', 'jìn', 'gần', 1),
    
    -- Nghi vấn từ
    (N'什', 'shén', 'gì', 1),
    (N'么', 'me', '(trợ từ)', 1),
    (N'谁', 'shuí', 'ai', 1),
    (N'哪', 'nǎ', 'nào', 1),
    (N'怎', 'zěn', 'làm sao', 1),
    (N'为', 'wèi', 'vì', 1),
    (N'几', 'jǐ', 'mấy', 1),
    
    -- Thường gặp trong examples
    (N'该', 'gāi', 'nên, phải', 1),
    (N'应', 'yīng', 'nên, đáp ứng', 1),
    (N'从', 'cóng', 'từ', 1),
    (N'到', 'dào', 'đến', 1),
    (N'于', 'yú', 'ở, tại', 1),
    (N'对', 'duì', 'đúng, đối với', 1),
    (N'把', 'bǎ', '(giới từ)', 1),
    (N'被', 'bèi', 'bị', 1),
    (N'让', 'ràng', 'để, khiến', 1),
    (N'使', 'shǐ', 'khiến', 1)
) AS source (Character, Pinyin, Meaning, HSKLevel)
ON target.Character = source.Character
WHEN NOT MATCHED THEN
    INSERT (Character, Pinyin, Meaning, HSKLevel, CreatedAt)
    VALUES (source.Character, source.Pinyin, source.Meaning, source.HSKLevel, GETUTCDATE());

GO

-- Hiển thị kết quả
DECLARE @InsertedCount INT = @@ROWCOUNT;
PRINT N'✅ Đã seed ' + CAST(@InsertedCount AS NVARCHAR) + N' từ phổ biến vào database.';
PRINT N'';
PRINT N'Kiểm tra:';
SELECT COUNT(*) AS [Tổng số từ HSK1], 
       MIN(CreatedAt) AS [Từ cũ nhất],
       MAX(CreatedAt) AS [Từ mới nhất]
FROM Words 
WHERE HSKLevel = 1;

GO

