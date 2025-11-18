# Reset Database - Hướng dẫn xóa và cài lại database

## Cách sử dụng

### Option 1: Chỉ reset database (xóa và apply migrations)

```powershell
cd Backend/scripts
.\reset-database.ps1
```

Script này sẽ:
1. Kiểm tra kết nối SQL Server
2. Xóa database `HIHSK` (nếu tồn tại)
3. Tạo lại database và apply tất cả migrations
4. Kiểm tra số lượng bảng đã được tạo

### Option 2: Reset database + Seed data

```powershell
cd Backend/scripts
.\reset-and-seed.ps1
```

Script này sẽ:
1. Chạy `reset-database.ps1` để xóa và tạo lại database
2. Tự động seed 12 LessonTopics cho HSK1 từ file `seed-12-topics-hsk1.sql`

## Lưu ý

- **Backup dữ liệu trước khi reset**:** Script sẽ xóa toàn bộ dữ liệu trong database!

- **Yêu cầu:**
  - SQL Server đang chạy
  - Database name: `HIHSK`
  - Server: `localhost`
  - Windows Authentication

- **Nếu gặp lỗi:**
  - Kiểm tra SQL Server đang chạy
  - Kiểm tra quyền truy cập database
  - Kiểm tra connection string trong `appsettings.json`

## Sau khi reset

Sau khi reset database, bạn có thể:

1. **Seed thêm dữ liệu:**
   ```powershell
   # Chạy script seed khác
   sqlcmd -S localhost -d HIHSK -i .\scripts\seed-12-topics-hsk1.sql
   ```

2. **Kiểm tra migrations:**
   ```powershell
   cd Backend/src/HiHSK.Infrastructure
   dotnet ef migrations list --startup-project ../HiHSK.Api
   ```

3. **Chạy backend:**
   ```powershell
   cd Backend/src/HiHSK.Api
   dotnet run
   ```

