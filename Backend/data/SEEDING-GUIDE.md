# Hướng dẫn Seed Data vào Database

## Tổng quan

Dự án HiHSK cần dữ liệu mẫu để có thể chạy và test. File JSON seed data cung cấp cấu trúc dữ liệu chuẩn để import vào database.

## Cấu trúc file JSON cần có

### 1. **CourseCategories** (6 bản ghi - HSK 1-6)
Mỗi cấp độ HSK cần 1 category:
```json
{
  "courseCategories": [
    {
      "name": "HSK1",
      "displayName": "HSK Cấp độ 1",
      "description": "Cấp độ cơ bản nhất - 150 từ vựng",
      "sortOrder": 1
    }
    // ... HSK 2-6
  ]
}
```

### 2. **Courses** (6 khóa học - mỗi HSK level 1 khóa)
```json
{
  "courses": [
    {
      "categoryId": 1,
      "title": "HSK 1 - Khóa học cơ bản",
      "description": "Khóa học HSK 1 với 25 bài học...",
      "hskLevel": 1,
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

### 3. **Lessons** (~150 bài - 25 bài/cấp độ)
```json
{
  "lessons": [
    {
      "courseId": 1,
      "title": "Bài 1: Chào hỏi",
      "lessonIndex": 1,
      "content": "<h2>Nội dung HTML...</h2>",
      "isLocked": false,
      "prerequisiteLessonId": null
    },
    {
      "courseId": 1,
      "title": "Bài 2: Giới thiệu bản thân",
      "lessonIndex": 2,
      "isLocked": true,
      "prerequisiteLessonId": 1  // Phải hoàn thành bài 1
    }
  ]
}
```

**Lưu ý:**
- Bài đầu tiên: `isLocked = false`, `prerequisiteLessonId = null`
- Các bài sau: `isLocked = true`, `prerequisiteLessonId = ID bài trước`

### 4. **Words** (~1500-2000 từ vựng)
```json
{
  "words": [
    {
      "lessonId": 1,
      "character": "你",
      "pinyin": "nǐ",
      "meaning": "bạn",
      "exampleSentence": "你好 (nǐ hǎo) - Xin chào",
      "hskLevel": 1,
      "strokeCount": 7
    }
  ]
}
```

**Số lượng từ vựng:**
- HSK 1: ~150 từ
- HSK 2: ~150 từ (tổng 300)
- HSK 3: ~300 từ (tổng 600)
- HSK 4: ~600 từ (tổng 1,200)
- HSK 5: ~1,300 từ (tổng 2,500)
- HSK 6: ~2,500 từ (tổng 5,000)

### 5. **Questions** (~300-450 câu hỏi - 2-3 câu/bài)
```json
{
  "questions": [
    {
      "lessonId": 1,
      "questionText": "Chữ '你' có nghĩa là gì?",
      "questionType": "CHOOSE_MEANING",
      "points": 1,
      "explanation": "Chữ '你' có nghĩa là 'bạn'",
      "options": [
        {
          "optionLabel": "A",
          "optionText": "Tôi",
          "isCorrect": false
        },
        {
          "optionLabel": "B",
          "optionText": "Bạn",
          "isCorrect": true
        }
        // ... C, D
      ]
    }
  ]
}
```

**Loại câu hỏi (questionType):**
- `CHOOSE_MEANING`: Chọn nghĩa đúng
- `READING`: Đọc hiểu
- `LISTENING`: Nghe hiểu (cần `audioUrl`)
- `FILL_BLANK`: Điền vào chỗ trống
- `WRITING`: Viết câu

**Quy tắc options:**
- Mỗi câu hỏi có 4 options (A, B, C, D)
- Chỉ có 1 option có `isCorrect = true`
- `optionLabel`: "A", "B", "C", "D"

## Cách sử dụng DataSeeder

### Bước 1: Copy file JSON vào project
```
Backend/
  data/
    seed-data.json  (file dữ liệu của bạn)
```

### Bước 2: Thêm vào Program.cs
```csharp
// Trong Program.cs, sau khi tạo app
var app = builder.Build();

// Seed data (chỉ chạy trong development)
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var seeder = new DataSeeder(context);
        
        // Đảm bảo database đã được tạo
        context.Database.EnsureCreated();
        
        // Seed data
        var jsonPath = Path.Combine(
            app.Environment.ContentRootPath, 
            "..", "..", "data", "seed-data.json"
        );
        await seeder.SeedFromJsonAsync(jsonPath);
    }
}
```

### Bước 3: Chạy ứng dụng
- Seed data sẽ tự động chạy khi start app lần đầu
- Hoặc tạo endpoint riêng để seed manual

## Tạo Endpoint Seed Manual

Thêm vào `Program.cs` hoặc tạo controller:

```csharp
app.MapPost("/api/admin/seed", async (ApplicationDbContext context) =>
{
    var seeder = new DataSeeder(context);
    var jsonPath = Path.Combine(
        Directory.GetCurrentDirectory(), 
        "data", "seed-data.json"
    );
    
    await seeder.SeedFromJsonAsync(jsonPath);
    return Results.Ok(new { message = "Data seeded successfully" });
})
.WithTags("Admin")
.RequireAuthorization(); // Chỉ admin mới seed được
```

## Kiểm tra dữ liệu

Sau khi seed, kiểm tra:
```sql
SELECT COUNT(*) FROM CourseCategories;  -- Phải có 6
SELECT COUNT(*) FROM Courses;            -- Phải có 6
SELECT COUNT(*) FROM Lessons;            -- Phải có ~150
SELECT COUNT(*) FROM Words;              -- Phải có ~1500-2000
SELECT COUNT(*) FROM Questions;          -- Phải có ~300-450
SELECT COUNT(*) FROM QuestionOptions;    -- Phải có ~1200-1800 (4 options/câu)
```

## Nguồn dữ liệu

Bạn có thể lấy dữ liệu từ:
1. **HSK Standard Course** - Sách giáo khoa chính thức
2. **HSK Vocabulary Lists** - Danh sách từ vựng chính thức HSK
3. **Online HSK Resources** - Các trang web học HSK
4. **Textbooks** - Sách giáo khoa tiếng Trung

## Lưu ý quan trọng

1. **Thứ tự import**: Phải theo đúng thứ tự để đảm bảo Foreign Keys
2. **ID tự động**: Không cần chỉ định ID trong JSON (hoặc set = 0)
3. **Prerequisite**: Bài học phải có prerequisiteLessonId hợp lệ
4. **Content HTML**: Nội dung bài học có thể là HTML hoặc Markdown
5. **Audio URLs**: Có thể để null nếu chưa có file audio

## Format JSON chuẩn

Xem file `seed-data-template.json` để có format mẫu đầy đủ.

