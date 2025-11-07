# Hướng dẫn Seed Data HSK1

## Tổng quan

Script này sẽ:
1. Đọc file `hsk1.json` (150 từ vựng HSK 1)
2. Dịch meaning từ tiếng Anh sang tiếng Việt
3. Tạo audioUrl bằng Google Text-to-Speech
4. Chia thành 13 bài học (12 từ/bài)
5. Tạo file `seed-data-hsk1.json` để import vào database

## Cách sử dụng

### Bước 1: Tạo file seed data

```powershell
cd Backend/scripts
python convert_hsk1_to_seed_data.py
```

File output: `Backend/data/seed-data-hsk1.json`

### Bước 2: Kiểm tra file seed data

```powershell
python check_seed_data.py
```

Hoặc chỉ định file cụ thể:
```powershell
python check_seed_data.py ..\data\seed-data-hsk1.json
```

### Bước 3: Seed vào database

Có 2 cách:

#### Cách 1: Dùng API endpoint (Khuyến nghị)

1. Chạy backend:
```powershell
cd Backend/src/HiHSK.Api
dotnet run
```

2. Gọi API để seed data:
```bash
# Seed data (không xóa dữ liệu cũ)
POST http://localhost:5000/api/admin/seed?fileName=seed-data-hsk1.json

# Seed data (xóa dữ liệu cũ trước)
POST http://localhost:5000/api/admin/seed?fileName=seed-data-hsk1.json&clearExisting=true
```

3. Kiểm tra thống kê:
```bash
GET http://localhost:5000/api/admin/stats
```

#### Cách 2: Seed tự động khi start app

Thêm vào `Program.cs`:

```csharp
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var seeder = new DataSeeder(context);
        
        var jsonPath = Path.Combine(
            Directory.GetCurrentDirectory(), 
            "..", "..", "data", "seed-data-hsk1.json"
        );
        
        if (File.Exists(jsonPath))
        {
            await seeder.SeedFromJsonAsync(jsonPath);
        }
    }
}
```

## Cấu trúc file seed data

```json
{
  "courseCategories": [
    {
      "id": 1,
      "name": "HSK1",
      "displayName": "HSK Cấp độ 1",
      ...
    }
  ],
  "courses": [
    {
      "id": 1,
      "categoryId": 1,
      "title": "HSK 1 - Khóa học cơ bản",
      ...
    }
  ],
  "lessons": [
    {
      "courseId": 1,
      "title": "Bài 1: ...",
      "lessonIndex": 1,
      ...
    }
  ],
  "words": [
    {
      "character": "爱",
      "pinyin": "ài",
      "meaning": "yêu, tình yêu",  // Đã dịch sang tiếng Việt
      "audioUrl": "https://translate.google.com/translate_tts?...",
      "exampleSentence": "爱 (ài) - yêu, tình yêu",
      "hskLevel": 1,
      "lessonId": 1,  // lessonIndex trong JSON, sẽ được map sang ID thực tế
      ...
    }
  ]
}
```

## Lưu ý

1. **AudioUrl**: Dùng Google TTS (miễn phí, không cần API key)
2. **Meaning**: Đã được dịch sang tiếng Việt bằng dictionary
3. **LessonId mapping**: Script tự động map lessonIndex (1, 2, 3...) sang ID thực tế trong database
4. **Clear existing data**: Cẩn thận khi dùng `clearExisting=true`, sẽ xóa tất cả dữ liệu cũ

## API Endpoints

### POST `/api/admin/seed`
Seed dữ liệu từ file JSON

**Query Parameters:**
- `fileName`: Tên file JSON (mặc định: `seed-data-hsk1.json`)
- `clearExisting`: Xóa dữ liệu cũ trước khi seed (mặc định: `false`)

**Response:**
```json
{
  "message": "Seed data thành công!",
  "stats": {
    "courseCategories": 1,
    "courses": 1,
    "lessons": 13,
    "words": 150,
    "questions": 0
  }
}
```

### POST `/api/admin/clear-data`
Xóa tất cả dữ liệu seed (cẩn thận!)

### GET `/api/admin/stats`
Lấy thống kê dữ liệu hiện tại

## Troubleshooting

### Lỗi: File không tồn tại
- Kiểm tra đường dẫn file JSON
- Đảm bảo file `hsk1.json` ở trong `Backend/scripts/`

### Lỗi: Foreign Key constraint
- Đảm bảo seed theo đúng thứ tự: Categories → Courses → Lessons → Words
- Script đã tự động xử lý mapping lessonId

### Lỗi: Duplicate data
- Dùng `clearExisting=true` để xóa dữ liệu cũ trước khi seed
- Hoặc kiểm tra xem đã có dữ liệu chưa bằng `/api/admin/stats`

