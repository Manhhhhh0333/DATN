# HiHSK Frontend

Frontend application cho ứng dụng học tiếng Trung HiHSK, được xây dựng với Next.js 14, TypeScript và Tailwind CSS.

## Công nghệ sử dụng

- **Next.js 14**: React framework với App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **js-cookie**: Cookie management

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

### Development
```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

### Production
```bash
npm run build
npm start
```

## Cấu trúc thư mục

```
Frontend/
├── app/                  # App Router (Next.js 14)
│   ├── layout.tsx        # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/          # React components
├── lib/                 # Utilities & helpers
│   ├── api.ts          # API client setup
│   ├── auth.ts         # Authentication utilities
│   └── api-endpoints.ts # API endpoints constants
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## Biến môi trường

Tạo file `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Tính năng

- ✅ Authentication với JWT
- ✅ API client với interceptors
- ✅ Type-safe API calls
- ✅ Responsive design với Tailwind CSS
- ✅ Cookie-based token storage

