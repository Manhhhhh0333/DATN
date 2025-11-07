# 🎓 HiHSK - Nền tảng Học Tiếng Trung

Nền tảng học tiếng Trung trực tuyến với phương pháp HSK, giúp bạn học tiếng Trung hiệu quả từ cơ bản đến nâng cao.

## 📋 Tổng quan

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: .NET 8.0 API + Entity Framework Core
- **Database**: SQL Server
- **Authentication**: JWT + ASP.NET Core Identity

## 🚀 Tính năng

### ✅ Đã hoàn thành
- ✅ Authentication & Authorization (Đăng ký/Đăng nhập)
- ✅ Giáo trình HSK (Courses & Lessons)
- ✅ Từ vựng theo chủ đề (Vocabulary Topics)
- ✅ Flashcard với SRS (Spaced Repetition System)
- ✅ Quiz với chấm điểm tự động
- ✅ Audio playback với proxy endpoint

### 🚧 Đang phát triển
- 🔄 Cấu trúc mới: LessonTopic và LessonExercise
- 🔄 14 loại bài tập trong mỗi chủ đề
- 🔄 Hội thoại, Đọc hiểu, Ngữ pháp

## 📁 Cấu trúc dự án

```
DATN/
├── Backend/          # .NET 8.0 API
│   ├── src/
│   │   ├── HiHSK.Api/           # API Controllers
│   │   ├── HiHSK.Application/    # Business Logic
│   │   ├── HiHSK.Domain/         # Domain Entities
│   │   └── HiHSK.Infrastructure/ # Data Access
│   ├── data/         # Seed data
│   └── scripts/     # Utility scripts
├── Frontend/        # Next.js 14
│   ├── app/         # App Router
│   ├── components/  # React Components
│   └── lib/         # Utilities
└── docs/            # Documentation
```

## 🛠️ Cài đặt

### Backend

```powershell
cd Backend/src/HiHSK.Api
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend

```powershell
cd Frontend
npm install
npm run dev
```

## 📚 Tài liệu

- [GIT_WORKFLOW_GUIDE.md](./GIT_WORKFLOW_GUIDE.md) - Hướng dẫn quy trình Git/GitHub
- [PUSH_TO_GITHUB.md](./PUSH_TO_GITHUB.md) - Hướng dẫn push code lên GitHub
- [PHAN_TICH_DU_AN_VA_BUOC_TIEP_THEO.md](./PHAN_TICH_DU_AN_VA_BUOC_TIEP_THEO.md) - Phân tích dự án

## 🔗 Liên kết

- **GitHub**: https://github.com/Manhhhhh0333/DATN
- **Website**: https://hihsk.com/

## 📝 License

© 2025 HiHSK. Tất cả quyền được bảo lưu.

