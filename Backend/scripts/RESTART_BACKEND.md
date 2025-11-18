# Hướng dẫn Restart Backend API

## Vấn đề
Sau khi sửa `ApplicationDbContext.cs`, backend API cần được restart để EF Core nhận cấu hình mới về `TopicId` relationship.

## Cách restart

### Option 1: Restart trong Visual Studio/VS Code
1. Dừng backend API (nếu đang chạy)
2. Rebuild solution: `Ctrl+Shift+B` hoặc `dotnet build`
3. Chạy lại backend API: `F5` hoặc `dotnet run`

### Option 2: Restart bằng PowerShell
```powershell
# Dừng process đang chạy (nếu có)
Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"} | Stop-Process -Force

# Rebuild
cd Backend/src/HiHSK.Api
dotnet build

# Chạy lại
dotnet run
```

### Option 3: Chỉ cần rebuild (nếu đang chạy với hot reload)
```powershell
cd Backend/src/HiHSK.Api
dotnet build
```

## Kiểm tra
Sau khi restart, chạy lại script:
```powershell
.\Backend\scripts\organize-hsk1-words.ps1
```

Nếu vẫn lỗi, có thể cần tạo migration:
```powershell
cd Backend/src/HiHSK.Infrastructure
dotnet ef migrations add UpdateWordTopicIdMapping --startup-project ../HiHSK.Api
dotnet ef database update --startup-project ../HiHSK.Api
```

