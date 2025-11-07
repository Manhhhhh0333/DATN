# 🚀 HƯỚNG DẪN CHẠY MIGRATION

## ⚠️ Lỗi thường gặp

### Lỗi: "Your target project doesn't match your migrations assembly"

**Nguyên nhân**: Migrations nằm trong project `HiHSK.Infrastructure` nhưng đang chạy từ `HiHSK.Api`.

**Giải pháp**: Cần chỉ định đúng project cho migrations.

## ✅ Cách chạy Migration đúng

### Cách 1: Chỉ định project (Khuyến nghị)

```powershell
cd Backend/src/HiHSK.Api
dotnet ef migrations add SeedVocabularyTopicHsk1 --project ../HiHSK.Infrastructure
```

### Cách 2: Chạy từ thư mục Infrastructure

```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef migrations add SeedVocabularyTopicHsk1 --startup-project ../HiHSK.Api
```

### Cách 3: Chạy từ thư mục gốc

```powershell
cd Backend/src
dotnet ef migrations add SeedVocabularyTopicHsk1 --project HiHSK.Infrastructure --startup-project HiHSK.Api
```

## 📋 Các lệnh Migration thường dùng

### 1. Tạo Migration mới
```powershell
cd Backend/src/HiHSK.Api
dotnet ef migrations add <TênMigration> --project ../HiHSK.Infrastructure
```

### 2. Xem danh sách Migration
```powershell
cd Backend/src/HiHSK.Api
dotnet ef migrations list --project ../HiHSK.Infrastructure
```

### 3. Cập nhật Database
```powershell
cd Backend/src/HiHSK.Api
dotnet ef database update --project ../HiHSK.Infrastructure
```

### 4. Cập nhật đến Migration cụ thể
```powershell
cd Backend/src/HiHSK.Api
dotnet ef database update <TênMigration> --project ../HiHSK.Infrastructure
```

### 5. Xóa Migration cuối cùng (chưa apply)
```powershell
cd Backend/src/HiHSK.Api
dotnet ef migrations remove --project ../HiHSK.Infrastructure
```

### 6. Tạo Script SQL từ Migration
```powershell
cd Backend/src/HiHSK.Api
dotnet ef migrations script --project ../HiHSK.Infrastructure --output migration.sql
```

## 🔧 Seed Vocabulary Topic HSK1

### Bước 1: Kiểm tra Migration đã tồn tại chưa
```powershell
cd Backend/src/HiHSK.Api
dotnet ef migrations list --project ../HiHSK.Infrastructure
```

### Bước 2: Nếu chưa có, tạo Migration
```powershell
cd Backend/src/HiHSK.Api
dotnet ef migrations add SeedVocabularyTopicHsk1 --project ../HiHSK.Infrastructure
```

**Lưu ý**: Migration `SeedVocabularyTopicHsk1` đã được tạo thủ công, nên có thể bỏ qua bước này nếu file đã tồn tại.

### Bước 3: Cập nhật Database
```powershell
cd Backend/src/HiHSK.Api
dotnet ef database update --project ../HiHSK.Infrastructure
```

### Bước 4: Kiểm tra kết quả
```powershell
# Kiểm tra stats
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/stats" -Method Get

# Hoặc kiểm tra trong database
# SELECT * FROM VocabularyTopics WHERE Name = 'HSK 1';
```

## ⚠️ Lưu ý quan trọng

1. **Luôn chỉ định `--project`**: Vì migrations nằm trong `HiHSK.Infrastructure`
2. **Startup project**: Mặc định là `HiHSK.Api` (nơi có `Program.cs`)
3. **Dừng Backend trước**: Nếu Backend đang chạy, dừng trước khi chạy migration
4. **Backup database**: Nên backup database trước khi chạy migration trong production

## 🐛 Xử lý lỗi

### Lỗi: "No DbContext was found"
- Đảm bảo đang ở đúng thư mục
- Kiểm tra `ApplicationDbContext` có trong `HiHSK.Infrastructure`

### Lỗi: "Unable to create an object of type"
- Kiểm tra connection string trong `appsettings.json`
- Đảm bảo database server đang chạy

### Lỗi: "Migration already exists"
- Migration đã được tạo
- Chỉ cần chạy `dotnet ef database update`

## 📝 Tóm tắt lệnh nhanh

```powershell
# Di chuyển đến thư mục API
cd Backend/src/HiHSK.Api

# Cập nhật database (áp dụng tất cả migrations chưa apply)
dotnet ef database update --project ../HiHSK.Infrastructure
```


