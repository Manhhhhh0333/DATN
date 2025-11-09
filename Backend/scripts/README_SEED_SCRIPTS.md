# HƯỚNG DẪN SỬ DỤNG SCRIPTS SEED DATA

## Scripts có sẵn

### 1. `seed_data_via_api.ps1`
Seed dữ liệu qua API endpoint (yêu cầu Backend API đang chạy)

**Cách dùng:**
```powershell
cd Backend\scripts
.\seed_data_via_api.ps1
```

**Yêu cầu:**
- Backend API phải đang chạy tại http://localhost:5075

### 2. `start_and_seed.ps1`
Tự động khởi động Backend API và seed dữ liệu

**Cách dùng:**
```powershell
cd Backend\scripts
.\start_and_seed.ps1
```

**Tính năng:**
- Tự động kiểm tra Backend API có đang chạy không
- Nếu chưa chạy, tự động khởi động Backend API
- Chờ Backend API sẵn sàng (30 giây)
- Tự động chạy script seed data

## Các bước thủ công

### Bước 1: Khởi động Backend API

```powershell
cd Backend\src\HiHSK.Api
dotnet run
```

Để chạy trong background (PowerShell):
```powershell
Start-Job -ScriptBlock {
    cd C:\Users\hoang\source\repos\DATN\Backend\src\HiHSK.Api
    dotnet run
}
```

### Bước 2: Seed dữ liệu

**Cách 1: Dùng script**
```powershell
cd Backend\scripts
.\seed_data_via_api.ps1
```

**Cách 2: Seed thủ công qua API**
```powershell
# Kiểm tra stats
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/stats" -Method Get

# Seed dữ liệu
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/seed?fileName=seed-data-hsk1.json" -Method Post

# Seed Vocabulary Topic
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/seed-vocabulary-topic-hsk1" -Method Post
```

**Cách 3: Dùng Migration**
```powershell
cd Backend\src\HiHSK.Api
dotnet ef database update --project ..\HiHSK.Infrastructure
```

## Kiểm tra kết quả

```powershell
# Kiểm tra stats
Invoke-RestMethod -Uri "http://localhost:5075/api/admin/stats" -Method Get
```

Kết quả mong đợi:
```json
{
  "courseCategories": 1,
  "courses": 1,
  "lessons": 13,
  "words": 150,
  "vocabularyTopics": 1
}
```

## Xử lý lỗi

### Lỗi: "Backend API không chạy"
- Khởi động Backend API trước: `cd Backend\src\HiHSK.Api; dotnet run`
- Hoặc dùng script `start_and_seed.ps1`

### Lỗi: "File không tìm thấy"
- Kiểm tra file `Backend/data/seed-data-hsk1.json` có tồn tại không
- Kiểm tra đường dẫn trong AdminController

### Lỗi: "Port 5075 đã được sử dụng"
- Tìm process đang dùng port: `Get-NetTCPConnection -LocalPort 5075`
- Dừng process hoặc đổi port trong `appsettings.json`

## Dừng Backend API

**Nếu chạy trong terminal:**
- Nhấn `Ctrl+C`

**Nếu chạy trong background job:**
```powershell
Get-Job | Stop-Job
Get-Job | Remove-Job
```

**Nếu chạy trong process riêng:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"} | Stop-Process
```

