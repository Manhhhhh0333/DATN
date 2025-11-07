# Hướng dẫn sử dụng file JSON Seed Data

## Cấu trúc file JSON

File `seed-data-template.json` chứa dữ liệu mẫu để seed vào database. Cấu trúc bao gồm:

### 1. CourseCategories
Danh mục khóa học (HSK 1-6)
- `id`: ID danh mục
- `name`: Tên ngắn (ví dụ: "HSK1")
- `displayName`: Tên hiển thị (ví dụ: "HSK Cấp độ 1")
- `description`: Mô tả
- `iconUrl`: URL icon (tùy chọn)
- `sortOrder`: Thứ tự sắp xếp

### 2. Courses
Các khóa học theo cấp độ HSK
- `id`: ID khóa học
- `categoryId`: ID danh mục (tham chiếu CourseCategories)
- `title`: Tiêu đề khóa học
- `description`: Mô tả khóa học
- `imageUrl`: URL hình ảnh (tùy chọn)
- `level`: Cấp độ (ví dụ: "HSK 1")
- `hskLevel`: Cấp độ HSK số (1-6)
- `sortOrder`: Thứ tự sắp xếp
- `isActive`: Có hoạt động hay không

### 3. Lessons
Bài học trong mỗi khóa học (khoảng 25 bài/cấp độ)
- `id`: ID bài học
- `courseId`: ID khóa học (tham chiếu Courses)
- `title`: Tiêu đề bài học
- `description`: Mô tả ngắn
- `lessonIndex`: Số thứ tự bài học (1, 2, 3...)
- `content`: Nội dung bài học (HTML)
- `isLocked`: Có bị khóa hay không (true nếu chưa hoàn thành bài trước)
- `prerequisiteLessonId`: ID bài học yêu cầu phải hoàn thành trước (null cho bài đầu tiên)
- `isActive`: Có hoạt động hay không

### 4. Words
Từ vựng trong mỗi bài học
- `id`: ID từ vựng
- `lessonId`: ID bài học (tham chiếu Lessons, có thể null nếu là từ vựng chung)
- `character`: Chữ Hán
- `pinyin`: Phiên âm
- `meaning`: Nghĩa tiếng Việt
- `audioUrl`: URL file audio phát âm (tùy chọn)
- `exampleSentence`: Câu ví dụ
- `hskLevel`: Cấp độ HSK (1-6)
- `frequency`: Tần suất sử dụng (để sắp xếp)
- `strokeCount`: Số nét

### 5. Questions
Câu hỏi cho quiz trong mỗi bài học
- `id`: ID câu hỏi
- `lessonId`: ID bài học (tham chiếu Lessons)
- `questionText`: Nội dung câu hỏi
- `questionType`: Loại câu hỏi ("CHOOSE_MEANING", "READING", "LISTENING", "FILL_BLANK", "WRITING")
- `audioUrl`: URL audio (cho câu hỏi nghe)
- `points`: Điểm số
- `difficultyLevel`: Mức độ khó (1-5)
- `explanation`: Giải thích đáp án
- `options`: Mảng các đáp án (xem QuestionOptions)

### 6. QuestionOptions
Các đáp án cho mỗi câu hỏi
- `optionLabel`: Nhãn đáp án ("A", "B", "C", "D")
- `optionText`: Nội dung đáp án
- `isCorrect`: Đúng hay sai
- `explanation`: Giải thích (tùy chọn)

## Quan hệ giữa các bảng

```
CourseCategories (1) ──< (N) Courses
Courses (1) ──< (N) Lessons
Lessons (1) ──< (N) Words
Lessons (1) ──< (N) Questions
Questions (1) ──< (N) QuestionOptions
Lessons (1) ──< (1) Lessons (PrerequisiteLesson)
```

## Cách sử dụng

### Option 1: Tạo Data Seeder trong .NET

Tạo class `DataSeeder.cs` trong `HiHSK.Infrastructure`:

```csharp
public class DataSeeder
{
    private readonly ApplicationDbContext _context;
    
    public DataSeeder(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task SeedAsync()
    {
        // Đọc file JSON
        var json = await File.ReadAllTextAsync("data/seed-data.json");
        var data = JsonSerializer.Deserialize<SeedData>(json);
        
        // Seed từng bảng theo thứ tự
        if (!_context.CourseCategories.Any())
        {
            _context.CourseCategories.AddRange(data.CourseCategories);
        }
        
        if (!_context.Courses.Any())
        {
            _context.Courses.AddRange(data.Courses);
        }
        
        // ... tiếp tục với Lessons, Words, Questions
        
        await _context.SaveChangesAsync();
    }
}
```

### Option 2: Import trực tiếp vào SQL Server

1. Convert JSON sang SQL INSERT statements
2. Hoặc sử dụng tool như `sqlcmd` hoặc SQL Server Management Studio

### Option 3: Sử dụng Entity Framework Migrations

Tạo migration với seed data:

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    // Insert seed data
    migrationBuilder.Sql(@"
        INSERT INTO CourseCategories (Name, DisplayName, Description, SortOrder)
        VALUES ('HSK1', 'HSK Cấp độ 1', 'Cấp độ cơ bản nhất', 1);
        -- ... tiếp tục
    ");
}
```

## Lưu ý

1. **Thứ tự import**: Phải import theo thứ tự:
   - CourseCategories → Courses → Lessons → Words → Questions → QuestionOptions

2. **ID tự động**: Nếu database có IDENTITY(1,1), không cần chỉ định ID trong JSON, hoặc đặt ID = 0 để database tự generate.

3. **Foreign Keys**: Đảm bảo các ID tham chiếu (categoryId, courseId, lessonId) đã tồn tại trước khi insert.

4. **PrerequisiteLessonId**: Bài học đầu tiên trong khóa học có `prerequisiteLessonId = null`, các bài sau có thể tham chiếu bài trước.

5. **IsLocked**: Bài học đầu tiên thường có `isLocked = false`, các bài sau có `isLocked = true` cho đến khi hoàn thành bài trước.

## Dữ liệu mẫu

File `seed-data-template.json` chỉ chứa dữ liệu mẫu cho:
- 1 Course Category (HSK 1)
- 1 Course
- 2 Lessons (để demo)
- 4 Words
- 2 Questions với options

Bạn cần mở rộng để có đủ:
- 6 Course Categories (HSK 1-6)
- 6 Courses (mỗi cấp độ 1 khóa)
- ~150 Lessons (25 bài/cấp độ)
- ~1500+ Words (10-20 từ/bài)
- ~300+ Questions (2-3 câu hỏi/bài)

