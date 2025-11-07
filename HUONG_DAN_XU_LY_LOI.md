# 🔧 HƯỚNG DẪN XỬ LÝ LỖI KHI CHẠY BACKEND

## ⚠️ Lỗi File Locking (MSB3027/MSB3021)

### Nguyên nhân
Khi chạy `dotnet watch run`, nếu đã có một instance của API đang chạy, các DLL files sẽ bị lock và không thể copy được.

### Giải pháp

#### Cách 1: Dừng process cũ (Khuyến nghị)
1. Tìm process đang chạy:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*HiHSK*"}
   ```

2. Dừng process:
   ```powershell
   Stop-Process -Name "HiHSK.Api" -Force
   ```
   Hoặc dừng theo PID (ví dụ: 4148):
   ```powershell
   Stop-Process -Id 4148 -Force
   ```

3. Chạy lại:
   ```powershell
   cd Backend/src/HiHSK.Api
   dotnet watch run
   ```

#### Cách 2: Restart từ Task Manager
1. Mở Task Manager (Ctrl + Shift + Esc)
2. Tìm process `HiHSK.Api` hoặc `dotnet`
3. End Task
4. Chạy lại `dotnet watch run`

#### Cách 3: Dùng port khác
Nếu không thể dừng process, có thể chạy trên port khác:
```powershell
dotnet run --urls "http://localhost:5076"
```

---

## ⚠️ Warnings về Nullable Reference Types

### Đã sửa
Tất cả warnings về nullable reference types trong `VocabularyTopicsController` đã được sửa bằng cách:
- Kiểm tra `userId` null trước khi sử dụng
- Trả về `Unauthorized` nếu user không authenticated

### Warnings còn lại (không ảnh hưởng)
- `CS8632` trong Migration file - có thể bỏ qua, không ảnh hưởng chức năng

---

## ✅ Kiểm tra sau khi sửa

1. **Build lại project:**
   ```powershell
   cd Backend/src/HiHSK.Api
   dotnet build
   ```

2. **Chạy lại:**
   ```powershell
   dotnet watch run
   ```

3. **Kiểm tra API:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5075/api/admin/stats" -Method Get
   ```

---

## 📝 Lưu ý

- Luôn dừng process cũ trước khi chạy lại
- Nếu vẫn gặp lỗi, restart Visual Studio/IDE
- Có thể cần restart máy nếu file vẫn bị lock

