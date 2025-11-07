# HiHSK - PHÂN TÍCH CHỨC NĂNG VÀ THIẾT KẾ DATABASE

## 📋 CÁC CHỨC NĂNG CHÍNH CỦA TRANG WEB HiHSK

Dựa trên phân tích trang https://hihsk.com/, các chức năng chính bao gồm:

### 1. **Giáo trình HSK** (HSK Curriculum)
- Học theo chuẩn HSK quốc tế từ cấp độ 1 đến 6
- 150 bài học
- Phù hợp với mọi trình độ

### 2. **Từ vựng theo chủ đề** (Vocabulary by Topic)
- Hệ thống từ vựng được phân loại theo chủ đề
- 80 bài học
- Dễ học và ghi nhớ

### 3. **Hội thoại** (Dialogues/Conversations)
- Luyện tập hội thoại thực tế
- Các tình huống giao tiếp hàng ngày
- 120 bài học

### 4. **Đọc hiểu** (Reading Comprehension)
- Nâng cao khả năng đọc hiểu
- Các bài văn từ cơ bản đến nâng cao
- 90 bài học

### 5. **Luyện thi** (Test Practice)
- Đề thi thử HSK
- Hệ thống chấm điểm tự động
- Phân tích chi tiết
- 60 bài học

### 6. **Bộ thủ** (Radicals - Bộ thủ Hán tự)
- Học 214 bộ thủ cơ bản
- Giúp nhận biết và viết chữ Hán chính xác
- 30 bài học

### 7. **Dịch** (Translation Tool)
- Công cụ dịch thông minh
- Từ điển tích hợp
- Ví dụ minh họa
- 40 bài học

### 8. **Mẫu câu** (Sentence Patterns)
- Học mẫu câu tiếng Trung qua các chủ đề
- 70 bài học

### 9. **Luyện viết** (Writing Practice)
- Luyện viết chữ Hán chuẩn nét
- Có hướng dẫn và đếm số nét sai
- 50 bài học

### 10. **Lượng từ** (Measure Words)
- Học các loại lượng từ phổ biến trong tiếng Trung
- Kèm ví dụ cụ thể
- 45 bài học

### 11. **Luyện đề THPT** (THPT Exam Practice)
- Luyện đề thi thử THPT online
- Hệ thống chấm điểm tự động
- Giải thích chi tiết
- 10 bài học

### 12. **Phát âm** (Pronunciation Practice)
- Luyện phát âm tiếng Trung
- Có audio và hướng dẫn

---

## 🗄️ THIẾT KẾ DATABASE

### ========= 1. BẢNG QUẢN LÝ KHÓA HỌC VÀ LOẠI KHÓA HỌC =========

-- Bảng loại khóa học (phân loại các tính năng)
CREATE TABLE CourseCategories (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE, -- 'HSK Curriculum', 'Vocabulary', 'Dialogue', 'Reading', etc.
    DisplayName NVARCHAR(200) NOT NULL, -- 'Giáo trình HSK', 'Từ vựng chủ đề', etc.
    Description NVARCHAR(500) NULL,
    IconUrl NVARCHAR(MAX) NULL,
    SortOrder INT NOT NULL DEFAULT 0
);

-- Lưu các khóa học chính (ví dụ: HSK 1, HSK 2, Vocabulary Topic 1, etc.)
CREATE TABLE Courses (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CategoryId INT NOT NULL, -- Phân loại: HSK, Vocabulary, Dialogue, Reading, etc.
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    ImageUrl NVARCHAR(MAX) NULL,
    Level NVARCHAR(50) NULL, -- Ví dụ: 'HSK 1', 'HSK 2', 'Beginner', 'Intermediate'
    HSKLevel INT NULL, -- 1-6 (chỉ cho HSK Curriculum), NULL cho các loại khác
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsActive BIT NOT NULL DEFAULT 1,
    
    FOREIGN KEY (CategoryId) REFERENCES CourseCategories(Id)
);

-- Lưu các bài học trong một khóa học
CREATE TABLE Lessons (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CourseId INT NOT NULL,
    Title NVARCHAR(250) NOT NULL, -- Ví dụ: 'Bài 1: Chào hỏi'
    Description NVARCHAR(1000) NULL,
    LessonIndex INT NOT NULL, -- Dùng để sắp xếp thứ tự 1, 2, 3...
    Content NVARCHAR(MAX) NULL, -- Nội dung bài học (HTML hoặc Markdown)
    IsLocked BIT NOT NULL DEFAULT 1, -- Bài học bị khóa cho đến khi hoàn thành bài trước
    PrerequisiteLessonId INT NULL, -- Bài học yêu cầu phải hoàn thành trước (NULL nếu là bài đầu tiên)
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsActive BIT NOT NULL DEFAULT 1,
    
    FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE,
    FOREIGN KEY (PrerequisiteLessonId) REFERENCES Lessons(Id)
);

-- ========= 2. BẢNG TỪ VỰNG =========

-- Bảng Từ vựng (cho Flashcard và tham chiếu Quiz)
CREATE TABLE Words (
    Id INT PRIMARY KEY IDENTITY(1,1),
    LessonId INT NULL, -- NULL nếu là từ vựng chung, không gắn với bài học cụ thể
    Character NVARCHAR(50) NOT NULL, -- Chữ Hán (ví dụ: '你好')
    Pinyin NVARCHAR(100) NOT NULL, -- Pinyin (ví dụ: 'nǐ hǎo')
    Meaning NVARCHAR(500) NOT NULL, -- Nghĩa tiếng Việt
    AudioUrl NVARCHAR(MAX) NULL, -- Link file audio phát âm
    ExampleSentence NVARCHAR(500) NULL, -- Câu ví dụ
    HSKLevel INT NULL, -- Cấp độ HSK (1-6)
    Frequency INT NULL, -- Tần suất sử dụng (để sắp xếp từ phổ biến)
    StrokeCount INT NULL, -- Số nét
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (LessonId) REFERENCES Lessons(Id) ON DELETE SET NULL
);

-- Bảng chủ đề từ vựng (cho tính năng Từ vựng theo chủ đề)
CREATE TABLE VocabularyTopics (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL, -- 'Gia đình', 'Màu sắc', 'Động vật', etc.
    Description NVARCHAR(500) NULL,
    ImageUrl NVARCHAR(MAX) NULL,
    SortOrder INT NOT NULL DEFAULT 0
);

-- Bảng liên kết từ vựng với chủ đề (Many-to-Many)
CREATE TABLE WordVocabularyTopics (
    WordId INT NOT NULL,
    VocabularyTopicId INT NOT NULL,
    PRIMARY KEY (WordId, VocabularyTopicId),
    FOREIGN KEY (WordId) REFERENCES Words(Id) ON DELETE CASCADE,
    FOREIGN KEY (VocabularyTopicId) REFERENCES VocabularyTopics(Id) ON DELETE CASCADE
);

-- ========= 3. BẢNG BỘ THỦ (RADICALS) =========

CREATE TABLE Radicals (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Character NVARCHAR(10) NOT NULL UNIQUE, -- Ký tự bộ thủ
    Pinyin NVARCHAR(50) NOT NULL,
    Meaning NVARCHAR(200) NOT NULL, -- Nghĩa
    StrokeCount INT NOT NULL, -- Số nét
    Description NVARCHAR(500) NULL, -- Mô tả về bộ thủ
    ImageUrl NVARCHAR(MAX) NULL, -- Hình ảnh minh họa
    AnimationUrl NVARCHAR(MAX) NULL, -- Video/animation cách viết
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Bảng liên kết từ vựng với bộ thủ (một từ có thể có nhiều bộ thủ)
CREATE TABLE WordRadicals (
    WordId INT NOT NULL,
    RadicalId INT NOT NULL,
    PRIMARY KEY (WordId, RadicalId),
    FOREIGN KEY (WordId) REFERENCES Words(Id) ON DELETE CASCADE,
    FOREIGN KEY (RadicalId) REFERENCES Radicals(Id) ON DELETE CASCADE
);

-- ========= 4. BẢNG HỘI THOẠI =========

CREATE TABLE Dialogues (
    Id INT PRIMARY KEY IDENTITY(1,1),
    LessonId INT NULL, -- NULL nếu hội thoại độc lập, không gắn với bài học cụ thể
    Title NVARCHAR(200) NOT NULL,
    DialogueText NVARCHAR(MAX) NOT NULL, -- Nội dung hội thoại
    Pinyin NVARCHAR(MAX) NULL, -- Pinyin của toàn bộ hội thoại
    Translation NVARCHAR(MAX) NULL, -- Bản dịch tiếng Việt
    AudioUrl NVARCHAR(MAX) NULL, -- Audio file của hội thoại
    SceneDescription NVARCHAR(500) NULL, -- Mô tả tình huống
    Category NVARCHAR(100) NULL, -- 'Shopping', 'Restaurant', 'Transportation', 'Hospital', etc.
    DifficultyLevel INT NOT NULL DEFAULT 1, -- 1-6 (tương ứng HSK)
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (LessonId) REFERENCES Lessons(Id) ON DELETE SET NULL
);

-- Bảng câu trong hội thoại (để phân tích từng câu)
CREATE TABLE DialogueSentences (
    Id INT PRIMARY KEY IDENTITY(1,1),
    DialogueId INT NOT NULL,
    SentenceText NVARCHAR(500) NOT NULL, -- Câu tiếng Trung
    Pinyin NVARCHAR(500) NULL,
    Translation NVARCHAR(500) NULL,
    Speaker NVARCHAR(100) NULL, -- Người nói (A, B, hoặc tên)
    SentenceIndex INT NOT NULL, -- Thứ tự câu trong hội thoại
    AudioUrl NVARCHAR(MAX) NULL, -- Audio riêng của câu này
    
    FOREIGN KEY (DialogueId) REFERENCES Dialogues(Id) ON DELETE CASCADE
);

-- ========= 5. BẢNG ĐỌC HIỂU =========

CREATE TABLE ReadingPassages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    LessonId INT NULL, -- NULL nếu bài đọc độc lập, không gắn với bài học cụ thể
    Title NVARCHAR(200) NOT NULL,
    PassageText NVARCHAR(MAX) NOT NULL, -- Nội dung bài đọc
    Pinyin NVARCHAR(MAX) NULL, -- Pinyin (có thể hiển thị khi cần)
    Translation NVARCHAR(MAX) NULL, -- Bản dịch
    DifficultyLevel INT NOT NULL DEFAULT 1, -- 1-6 (tương ứng HSK)
    WordCount INT NULL, -- Số từ trong bài
    Category NVARCHAR(100) NULL, -- 'News', 'Story', 'Article', 'Advertisement', etc.
    ImageUrl NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (LessonId) REFERENCES Lessons(Id) ON DELETE SET NULL
);

-- Bảng từ vựng trong bài đọc (để highlight và giải thích)
CREATE TABLE ReadingPassageWords (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PassageId INT NOT NULL,
    WordId INT NOT NULL,
    PositionInText INT NOT NULL, -- Vị trí xuất hiện trong bài
    Context NVARCHAR(200) NULL, -- Ngữ cảnh xuất hiện
    
    FOREIGN KEY (PassageId) REFERENCES ReadingPassages(Id) ON DELETE CASCADE,
    FOREIGN KEY (WordId) REFERENCES Words(Id) ON DELETE CASCADE
);

-- ========= 6. BẢNG CÂU HỎI QUIZ (CHO TẤT CẢ CÁC LOẠI) =========

CREATE TABLE Questions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    LessonId INT NULL, -- NULL nếu là câu hỏi độc lập (như luyện thi)
    ReadingPassageId INT NULL, -- NULL hoặc tham chiếu đến bài đọc
    DialogueId INT NULL, -- NULL hoặc tham chiếu đến hội thoại
    SentencePatternId INT NULL, -- NULL hoặc tham chiếu đến mẫu câu (cho bài tập mẫu câu)
    
    QuestionText NVARCHAR(MAX) NOT NULL, -- Câu hỏi hoặc đoạn văn (cho Luyện Đọc)
    
    -- Dùng để phân loại: 
    -- 'READING', 'LISTENING', 'CHOOSE_MEANING', 'FILL_BLANK', 
    -- 'WRITING', 'TRANSLATION', 'GRAMMAR', 'HSK_TEST', 'THPT_TEST', 'SENTENCE_PATTERN'
    QuestionType NVARCHAR(50) NOT NULL DEFAULT 'CHOOSE_MEANING',
    
    AudioUrl NVARCHAR(MAX) NULL, -- Link file audio (dùng cho QuestionType = 'LISTENING')
    
    Points INT NOT NULL DEFAULT 1, -- Điểm số cho câu hỏi
    DifficultyLevel INT NOT NULL DEFAULT 1,
    Explanation NVARCHAR(MAX) NULL, -- Giải thích đáp án
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (LessonId) REFERENCES Lessons(Id) ON DELETE SET NULL,
    FOREIGN KEY (ReadingPassageId) REFERENCES ReadingPassages(Id) ON DELETE SET NULL,
    FOREIGN KEY (DialogueId) REFERENCES Dialogues(Id) ON DELETE SET NULL,
    FOREIGN KEY (SentencePatternId) REFERENCES SentencePatterns(Id) ON DELETE SET NULL
);

-- Bảng các lựa chọn A, B, C, D cho câu hỏi
CREATE TABLE QuestionOptions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    QuestionId INT NOT NULL,
    OptionText NVARCHAR(500) NOT NULL, -- Nội dung lựa chọn
    OptionLabel NVARCHAR(10) NOT NULL, -- 'A', 'B', 'C', 'D'
    IsCorrect BIT NOT NULL DEFAULT 0, -- (1 = Đúng, 0 = Sai)
    Explanation NVARCHAR(500) NULL, -- Giải thích tại sao đúng/sai
    
    FOREIGN KEY (QuestionId) REFERENCES Questions(Id) ON DELETE CASCADE
);

-- Bảng đề thi (cho tính năng Luyện thi HSK và THPT)
CREATE TABLE ExamPapers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200) NOT NULL,
    ExamType NVARCHAR(50) NOT NULL, -- 'HSK', 'THPT'
    Level INT NULL, -- 1-6 cho HSK
    Description NVARCHAR(500) NULL,
    DurationMinutes INT NOT NULL, -- Thời gian làm bài (phút)
    TotalQuestions INT NOT NULL DEFAULT 0,
    TotalPoints INT NOT NULL DEFAULT 0,
    PassingScore INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsActive BIT NOT NULL DEFAULT 1
);

-- Bảng liên kết câu hỏi với đề thi
CREATE TABLE ExamPaperQuestions (
    ExamPaperId INT NOT NULL,
    QuestionId INT NOT NULL,
    QuestionOrder INT NOT NULL, -- Thứ tự câu hỏi trong đề
    PRIMARY KEY (ExamPaperId, QuestionId),
    FOREIGN KEY (ExamPaperId) REFERENCES ExamPapers(Id) ON DELETE CASCADE,
    FOREIGN KEY (QuestionId) REFERENCES Questions(Id) ON DELETE CASCADE
);

-- ========= 7. BẢNG MẪU CÂU =========

CREATE TABLE SentencePatterns (
    Id INT PRIMARY KEY IDENTITY(1,1),
    LessonId INT NULL,
    PatternText NVARCHAR(200) NOT NULL, -- Mẫu câu (ví dụ: "A 比 B 更...")
    Pinyin NVARCHAR(200) NULL,
    Meaning NVARCHAR(500) NOT NULL, -- Nghĩa tiếng Việt
    Usage NVARCHAR(1000) NULL, -- Cách sử dụng
    ExampleSentences NVARCHAR(MAX) NULL, -- Ví dụ câu
    Category NVARCHAR(100) NULL, -- 'Comparison', 'Condition', 'Time', etc.
    DifficultyLevel INT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (LessonId) REFERENCES Lessons(Id) ON DELETE SET NULL
);

-- Bảng ví dụ câu cho mẫu câu
CREATE TABLE SentencePatternExamples (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SentencePatternId INT NOT NULL,
    ExampleText NVARCHAR(500) NOT NULL, -- Câu ví dụ
    Pinyin NVARCHAR(500) NULL,
    Translation NVARCHAR(500) NOT NULL, -- Bản dịch
    AudioUrl NVARCHAR(MAX) NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    
    FOREIGN KEY (SentencePatternId) REFERENCES SentencePatterns(Id) ON DELETE CASCADE
);

-- ========= 8. BẢNG LƯỢNG TỪ =========

CREATE TABLE MeasureWords (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Character NVARCHAR(10) NOT NULL, -- Ký tự lượng từ
    Pinyin NVARCHAR(50) NOT NULL,
    Meaning NVARCHAR(200) NOT NULL, -- Nghĩa
    UsageDescription NVARCHAR(500) NULL, -- Cách sử dụng
    Category NVARCHAR(100) NULL, -- 'People', 'Animals', 'Objects', etc.
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Bảng ví dụ sử dụng lượng từ
CREATE TABLE MeasureWordExamples (
    Id INT PRIMARY KEY IDENTITY(1,1),
    MeasureWordId INT NOT NULL,
    ExampleText NVARCHAR(200) NOT NULL, -- Ví dụ: "三个人"
    Pinyin NVARCHAR(200) NULL,
    Translation NVARCHAR(200) NOT NULL, -- "Ba người"
    Explanation NVARCHAR(300) NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    
    FOREIGN KEY (MeasureWordId) REFERENCES MeasureWords(Id) ON DELETE CASCADE
);

-- Bảng liên kết từ vựng với lượng từ phù hợp
CREATE TABLE WordMeasureWords (
    WordId INT NOT NULL,
    MeasureWordId INT NOT NULL,
    PRIMARY KEY (WordId, MeasureWordId),
    FOREIGN KEY (WordId) REFERENCES Words(Id) ON DELETE CASCADE,
    FOREIGN KEY (MeasureWordId) REFERENCES MeasureWords(Id) ON DELETE CASCADE
);

-- ========= 9. BẢNG LUYỆN VIẾT =========

CREATE TABLE WritingExercises (
    Id INT PRIMARY KEY IDENTITY(1,1),
    LessonId INT NULL,
    WordId INT NOT NULL, -- Từ cần luyện viết
    Title NVARCHAR(200) NOT NULL,
    Instructions NVARCHAR(500) NULL, -- Hướng dẫn
    StrokeOrderGuide NVARCHAR(MAX) NULL, -- Hướng dẫn thứ tự nét (JSON hoặc text)
    AnimationUrl NVARCHAR(MAX) NULL, -- Video/animation cách viết
    ExpectedStrokeCount INT NOT NULL, -- Số nét đúng
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (LessonId) REFERENCES Lessons(Id) ON DELETE SET NULL,
    FOREIGN KEY (WordId) REFERENCES Words(Id) ON DELETE CASCADE
);

-- ========= 10. BẢNG DỊCH =========

-- Lịch sử dịch của người dùng (cho tính năng Dịch)
CREATE TABLE TranslationHistory (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    SourceText NVARCHAR(MAX) NOT NULL, -- Văn bản gốc
    SourceLanguage NVARCHAR(50) NOT NULL, -- 'zh-CN', 'vi', 'en'
    TranslatedText NVARCHAR(MAX) NOT NULL, -- Văn bản đã dịch
    TargetLanguage NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
);

-- ========= 11. BẢNG THEO DÕI TIẾN ĐỘ NGƯỜI DÙNG =========

-- Lưu kết quả Quiz của người dùng cho một bài học hoặc đề thi
CREATE TABLE UserLessonProgress (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    LessonId INT NULL,
    ExamPaperId INT NULL, -- NULL hoặc tham chiếu đến đề thi
    Score INT NOT NULL, -- Điểm số (ví dụ: 8)
    TotalQuestions INT NOT NULL, -- Tổng số câu (ví dụ: 10)
    TotalPoints INT NOT NULL, -- Tổng điểm có thể đạt
    CorrectAnswers INT NOT NULL, -- Số câu đúng
    WrongAnswers INT NOT NULL, -- Số câu sai
    CompletedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    TimeSpentSeconds INT NULL, -- Thời gian làm bài (giây)
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (LessonId) REFERENCES Lessons(Id) ON DELETE CASCADE,
    FOREIGN KEY (ExamPaperId) REFERENCES ExamPapers(Id) ON DELETE CASCADE
);

-- Bảng chi tiết câu trả lời của người dùng
CREATE TABLE UserAnswers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserProgressId INT NOT NULL,
    QuestionId INT NOT NULL,
    SelectedOptionId INT NULL, -- Option đã chọn (NULL nếu tự luận)
    UserAnswerText NVARCHAR(MAX) NULL, -- Câu trả lời tự luận
    IsCorrect BIT NOT NULL,
    PointsEarned INT NOT NULL DEFAULT 0,
    TimeSpentSeconds INT NULL,
    
    FOREIGN KEY (UserProgressId) REFERENCES UserLessonProgress(Id) ON DELETE CASCADE,
    FOREIGN KEY (QuestionId) REFERENCES Questions(Id),
    FOREIGN KEY (SelectedOptionId) REFERENCES QuestionOptions(Id)
);

-- Lưu trạng thái học Flashcard (ôn tập ngắt quãng - SRS)
CREATE TABLE UserWordProgress (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    WordId INT NOT NULL,
    
    -- Trạng thái: 'New', 'Learning', 'Mastered', 'Reviewing'
    Status NVARCHAR(50) NOT NULL DEFAULT 'New',
    
    -- Ngày ôn tập tiếp theo
    NextReviewDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Thống kê học tập
    ReviewCount INT NOT NULL DEFAULT 0, -- Số lần đã ôn
    CorrectCount INT NOT NULL DEFAULT 0, -- Số lần trả lời đúng
    WrongCount INT NOT NULL DEFAULT 0, -- Số lần trả lời sai
    LastReviewedAt DATETIME2 NULL,
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (WordId) REFERENCES Words(Id) ON DELETE CASCADE,
    
    -- Đảm bảo mỗi user chỉ có 1 tiến độ cho 1 từ
    UNIQUE(UserId, WordId)
);

-- Bảng tiến độ học bài học
CREATE TABLE UserLessonStatus (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    LessonId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'NotStarted', -- 'NotStarted', 'InProgress', 'Completed'
    ProgressPercentage INT NOT NULL DEFAULT 0, -- 0-100
    StartedAt DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    LastAccessedAt DATETIME2 NULL,
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (LessonId) REFERENCES Lessons(Id) ON DELETE CASCADE,
    
    UNIQUE(UserId, LessonId)
);

-- Bảng tiến độ học khóa học
CREATE TABLE UserCourseStatus (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    CourseId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'NotStarted', -- 'NotStarted', 'InProgress', 'Completed'
    ProgressPercentage INT NOT NULL DEFAULT 0,
    StartedAt DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE,
    
    UNIQUE(UserId, CourseId)
);

-- Bảng tiến độ luyện viết
CREATE TABLE UserWritingProgress (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    WritingExerciseId INT NOT NULL,
    AttemptsCount INT NOT NULL DEFAULT 0,
    BestScore INT NULL, -- Điểm tốt nhất
    LastAttemptAt DATETIME2 NULL,
    IsCompleted BIT NOT NULL DEFAULT 0,
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (WritingExerciseId) REFERENCES WritingExercises(Id) ON DELETE CASCADE,
    
    UNIQUE(UserId, WritingExerciseId)
);

-- Bảng lịch sử luyện viết (lưu từng lần thử)
CREATE TABLE UserWritingAttempts (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    WritingExerciseId INT NOT NULL,
    StrokeCount INT NULL, -- Số nét đã viết
    CorrectStrokeCount INT NULL, -- Số nét đúng
    StrokeData NVARCHAR(MAX) NULL, -- Dữ liệu nét vẽ (JSON)
    Score INT NULL,
    AttemptedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (WritingExerciseId) REFERENCES WritingExercises(Id) ON DELETE CASCADE
);

-- ========= 12. BẢNG PHÁT ÂM (PRONUNCIATION PRACTICE) =========

-- Bảng lưu kết quả luyện phát âm
CREATE TABLE UserPronunciationAttempts (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    WordId INT NULL, -- NULL nếu luyện phát âm câu hoặc đoạn văn
    SentenceText NVARCHAR(500) NULL, -- Câu cần luyện phát âm (nếu không phải từ đơn)
    AudioUrl NVARCHAR(MAX) NULL, -- Audio ghi âm của người dùng
    Score INT NULL, -- Điểm số phát âm (0-100)
    ToneAccuracy DECIMAL(5,2) NULL, -- Độ chính xác tone (0-100)
    PronunciationAccuracy DECIMAL(5,2) NULL, -- Độ chính xác phát âm (0-100)
    Feedback NVARCHAR(1000) NULL, -- Gợi ý cải thiện
    WaveformData NVARCHAR(MAX) NULL, -- Dữ liệu waveform (JSON)
    AttemptedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (WordId) REFERENCES Words(Id) ON DELETE SET NULL
);

-- ========= 13. BẢNG YÊU THÍCH (FAVORITES) =========

-- Bảng đánh dấu từ vựng yêu thích
CREATE TABLE FavoriteWords (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    WordId INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (WordId) REFERENCES Words(Id) ON DELETE CASCADE,
    
    UNIQUE(UserId, WordId)
);

-- Bảng đánh dấu mẫu câu yêu thích
CREATE TABLE FavoriteSentencePatterns (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    SentencePatternId INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (SentencePatternId) REFERENCES SentencePatterns(Id) ON DELETE CASCADE,
    
    UNIQUE(UserId, SentencePatternId)
);

-- ========= 14. BẢNG THEO DÕI TIẾN ĐỘ CHI TIẾT =========

-- Bảng tiến độ học hội thoại
CREATE TABLE UserDialogueProgress (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    DialogueId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'NotStarted', -- 'NotStarted', 'InProgress', 'Completed'
    TimesListened INT NOT NULL DEFAULT 0, -- Số lần đã nghe
    LastAccessedAt DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (DialogueId) REFERENCES Dialogues(Id) ON DELETE CASCADE,
    
    UNIQUE(UserId, DialogueId)
);

-- Bảng tiến độ đọc hiểu
CREATE TABLE UserReadingProgress (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    PassageId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'NotStarted', -- 'NotStarted', 'Reading', 'Completed'
    ReadingTimeSeconds INT NULL, -- Thời gian đọc (giây)
    WordsMarkedCount INT NOT NULL DEFAULT 0, -- Số từ đã đánh dấu
    LastAccessedAt DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (PassageId) REFERENCES ReadingPassages(Id) ON DELETE CASCADE,
    
    UNIQUE(UserId, PassageId)
);

-- Bảng đánh dấu từ vựng trong bài đọc (để lưu lại từ vựng user đã highlight)
CREATE TABLE UserReadingWordMarks (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    PassageId INT NOT NULL,
    WordId INT NOT NULL,
    MarkType NVARCHAR(50) NOT NULL DEFAULT 'Unknown', -- 'Known', 'Unknown', 'Learned'
    Notes NVARCHAR(500) NULL, -- Ghi chú của user về từ này
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (PassageId) REFERENCES ReadingPassages(Id) ON DELETE CASCADE,
    FOREIGN KEY (WordId) REFERENCES Words(Id) ON DELETE CASCADE,
    
    UNIQUE(UserId, PassageId, WordId)
);

-- Bảng tiến độ học bộ thủ
CREATE TABLE UserRadicalProgress (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    RadicalId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'NotStarted', -- 'NotStarted', 'Learning', 'Mastered'
    PracticeCount INT NOT NULL DEFAULT 0, -- Số lần luyện viết
    BestScore INT NULL, -- Điểm tốt nhất khi luyện viết
    LastPracticedAt DATETIME2 NULL,
    MasteredAt DATETIME2 NULL,
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (RadicalId) REFERENCES Radicals(Id) ON DELETE CASCADE,
    
    UNIQUE(UserId, RadicalId)
);

-- ========= 15. BẢNG PHÂN TÍCH KẾT QUẢ THI =========

-- Bảng phân tích chi tiết kết quả thi (để lưu phân tích điểm mạnh/yếu)
CREATE TABLE ExamResultAnalysis (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserProgressId INT NOT NULL, -- Tham chiếu đến UserLessonProgress (khi ExamPaperId không NULL)
    SkillType NVARCHAR(50) NOT NULL, -- 'Listening', 'Reading', 'Writing', 'Overall'
    Score INT NOT NULL, -- Điểm số cho kỹ năng này
    MaxScore INT NOT NULL, -- Điểm tối đa
    CorrectCount INT NOT NULL, -- Số câu đúng
    WrongCount INT NOT NULL, -- Số câu sai
    AverageTimeSeconds INT NULL, -- Thời gian trung bình mỗi câu
    Strengths NVARCHAR(500) NULL, -- Điểm mạnh (ví dụ: "Từ vựng cơ bản")
    Weaknesses NVARCHAR(500) NULL, -- Điểm yếu (ví dụ: "Ngữ pháp phức tạp")
    Recommendations NVARCHAR(1000) NULL, -- Gợi ý cải thiện
    
    FOREIGN KEY (UserProgressId) REFERENCES UserLessonProgress(Id) ON DELETE CASCADE
);

-- ========= 16. BẢNG XẾP HẠNG (LEADERBOARD) - OPTIONAL =========

-- Bảng xếp hạng (cho tính năng THPT và HSK)
CREATE TABLE Leaderboard (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    ExamPaperId INT NOT NULL,
    Score INT NOT NULL,
    TotalPoints INT NOT NULL,
    Ranking INT NULL, -- Thứ hạng (1, 2, 3...)
    CompletedAt DATETIME2 NOT NULL,
    TimeSpentSeconds INT NULL,
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    FOREIGN KEY (ExamPaperId) REFERENCES ExamPapers(Id) ON DELETE CASCADE
);

-- Index để truy vấn xếp hạng nhanh
CREATE INDEX IX_Leaderboard_ExamPaperId_Score ON Leaderboard(ExamPaperId, Score DESC);
CREATE INDEX IX_Leaderboard_UserId_ExamPaperId ON Leaderboard(UserId, ExamPaperId);

-- ========= 17. BẢNG THỐNG KÊ VÀ BÁO CÁO =========

-- Bảng thống kê học tập hàng ngày của người dùng
CREATE TABLE UserDailyStats (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId NVARCHAR(450) NOT NULL,
    StatDate DATE NOT NULL,
    WordsLearned INT NOT NULL DEFAULT 0,
    WordsReviewed INT NOT NULL DEFAULT 0,
    LessonsCompleted INT NOT NULL DEFAULT 0,
    QuestionsAnswered INT NOT NULL DEFAULT 0,
    CorrectAnswers INT NOT NULL DEFAULT 0,
    StudyTimeMinutes INT NOT NULL DEFAULT 0,
    
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    
    UNIQUE(UserId, StatDate)
);

-- ========= 18. INDEXES ĐỂ TỐI ƯU HIỆU SUẤT =========

-- Indexes cho bảng Words
CREATE INDEX IX_Words_LessonId ON Words(LessonId);
CREATE INDEX IX_Words_HSKLevel ON Words(HSKLevel);
CREATE INDEX IX_Words_Character ON Words(Character);

-- Indexes cho bảng Questions
CREATE INDEX IX_Questions_LessonId ON Questions(LessonId);
CREATE INDEX IX_Questions_QuestionType ON Questions(QuestionType);
CREATE INDEX IX_Questions_ReadingPassageId ON Questions(ReadingPassageId);
CREATE INDEX IX_Questions_DialogueId ON Questions(DialogueId);
CREATE INDEX IX_Questions_SentencePatternId ON Questions(SentencePatternId);

-- Indexes cho bảng UserWordProgress
CREATE INDEX IX_UserWordProgress_UserId_NextReviewDate ON UserWordProgress(UserId, NextReviewDate);
CREATE INDEX IX_UserWordProgress_Status ON UserWordProgress(Status);

-- Indexes cho bảng UserLessonProgress
CREATE INDEX IX_UserLessonProgress_UserId ON UserLessonProgress(UserId);
CREATE INDEX IX_UserLessonProgress_CompletedAt ON UserLessonProgress(CompletedAt);

-- Indexes cho bảng UserDailyStats
CREATE INDEX IX_UserDailyStats_UserId_StatDate ON UserDailyStats(UserId, StatDate);

-- Indexes cho bảng Dialogues
CREATE INDEX IX_Dialogues_LessonId ON Dialogues(LessonId);
CREATE INDEX IX_Dialogues_DifficultyLevel ON Dialogues(DifficultyLevel);
CREATE INDEX IX_Dialogues_Category ON Dialogues(Category);

-- Indexes cho bảng ReadingPassages
CREATE INDEX IX_ReadingPassages_LessonId ON ReadingPassages(LessonId);
CREATE INDEX IX_ReadingPassages_DifficultyLevel ON ReadingPassages(DifficultyLevel);

-- Indexes cho bảng UserDialogueProgress
CREATE INDEX IX_UserDialogueProgress_UserId ON UserDialogueProgress(UserId);
CREATE INDEX IX_UserDialogueProgress_DialogueId ON UserDialogueProgress(DialogueId);

-- Indexes cho bảng UserReadingProgress
CREATE INDEX IX_UserReadingProgress_UserId ON UserReadingProgress(UserId);
CREATE INDEX IX_UserReadingProgress_PassageId ON UserReadingProgress(PassageId);

-- Indexes cho bảng UserReadingWordMarks
CREATE INDEX IX_UserReadingWordMarks_UserId_PassageId ON UserReadingWordMarks(UserId, PassageId);
CREATE INDEX IX_UserReadingWordMarks_WordId ON UserReadingWordMarks(WordId);

-- Indexes cho bảng UserRadicalProgress
CREATE INDEX IX_UserRadicalProgress_UserId ON UserRadicalProgress(UserId);
CREATE INDEX IX_UserRadicalProgress_Status ON UserRadicalProgress(Status);

-- Indexes cho bảng UserPronunciationAttempts
CREATE INDEX IX_UserPronunciationAttempts_UserId ON UserPronunciationAttempts(UserId);
CREATE INDEX IX_UserPronunciationAttempts_WordId ON UserPronunciationAttempts(WordId);
CREATE INDEX IX_UserPronunciationAttempts_AttemptedAt ON UserPronunciationAttempts(AttemptedAt);

-- Indexes cho bảng FavoriteWords
CREATE INDEX IX_FavoriteWords_UserId ON FavoriteWords(UserId);
CREATE INDEX IX_FavoriteWords_WordId ON FavoriteWords(WordId);

-- Indexes cho bảng ExamResultAnalysis
CREATE INDEX IX_ExamResultAnalysis_UserProgressId ON ExamResultAnalysis(UserProgressId);

-- Indexes cho bảng Lessons (thêm index cho PrerequisiteLessonId)
CREATE INDEX IX_Lessons_PrerequisiteLessonId ON Lessons(PrerequisiteLessonId);
CREATE INDEX IX_Lessons_CourseId_LessonIndex ON Lessons(CourseId, LessonIndex);
