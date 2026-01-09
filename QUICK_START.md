# Hướng Dẫn Khởi Động Dự Án

## Bước 1: Khởi Động Backend Server

Mở terminal và chạy:

```bash
cd server
npm install  # Nếu chưa cài dependencies
npm run dev  # Hoặc npm start
```

Server sẽ chạy trên: `http://localhost:8080`

## Bước 2: Khởi Động Frontend

Mở terminal mới và chạy:

```bash
cd client
npm install  # Nếu chưa cài dependencies
npm start
```

Frontend sẽ chạy trên: `http://localhost:3000`

## Bước 3: Cấu Hình Google OAuth (Nếu dùng Google Login)

1. Tạo Google OAuth credentials (xem `GOOGLE_OAUTH_SETUP.md`)
2. Thêm vào `server/.env`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
```

## Lưu Ý

- **Backend phải chạy trước** khi test Google OAuth
- Nếu gặp lỗi "ERR_CONNECTION_REFUSED", kiểm tra:
  - Backend server đã chạy chưa?
  - Port 8080 có bị chiếm bởi ứng dụng khác không?
  - Firewall có chặn port 8080 không?

## Troubleshooting

### Lỗi: "ERR_CONNECTION_REFUSED"
- ✅ Kiểm tra backend server đã chạy: `http://localhost:8080`
- ✅ Kiểm tra port 8080: `netstat -ano | findstr :8080` (Windows)
- ✅ Restart backend server

### Lỗi: "Module not found"
- ✅ Chạy `npm install` trong thư mục `server/` và `client/`
