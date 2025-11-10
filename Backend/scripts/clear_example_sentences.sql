-- Script để cập nhật cột ExampleSentence thành NULL cho tất cả các bản ghi trong bảng Words
-- Tác giả: HiHSK Development Team
-- Ngày: 2025-01-09

USE HIHSK;
GO

-- Kiểm tra số lượng bản ghi trước khi update
DECLARE @CountBefore INT;
SELECT @CountBefore = COUNT(*) FROM Words WHERE ExampleSentence IS NOT NULL AND ExampleSentence != '';
PRINT 'Số lượng bản ghi có ExampleSentence trước khi update: ' + CAST(@CountBefore AS VARCHAR(10));
GO

-- Cập nhật tất cả ExampleSentence thành NULL
UPDATE Words
SET ExampleSentence = NULL
WHERE ExampleSentence IS NOT NULL AND ExampleSentence != '';
GO

-- Kiểm tra số lượng bản ghi sau khi update
DECLARE @CountAfter INT;
SELECT @CountAfter = COUNT(*) FROM Words WHERE ExampleSentence IS NOT NULL AND ExampleSentence != '';
PRINT 'Số lượng bản ghi có ExampleSentence sau khi update: ' + CAST(@CountAfter AS VARCHAR(10));
GO

-- Hiển thị kết quả
SELECT 
    COUNT(*) AS TotalWords,
    SUM(CASE WHEN ExampleSentence IS NULL OR ExampleSentence = '' THEN 1 ELSE 0 END) AS WordsWithEmptyExample,
    SUM(CASE WHEN ExampleSentence IS NOT NULL AND ExampleSentence != '' THEN 1 ELSE 0 END) AS WordsWithExample
FROM Words;
GO

PRINT 'Đã hoàn thành việc cập nhật ExampleSentence thành NULL cho tất cả các bản ghi.';
GO

