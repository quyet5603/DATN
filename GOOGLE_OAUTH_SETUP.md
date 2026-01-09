# Hướng Dẫn Cấu Hình Google OAuth Login

## Bước 1: Tạo Google OAuth Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Chọn **Web application**
6. Điền thông tin:
   - **Name**: JobFinder (hoặc tên bạn muốn)
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `http://localhost:8080` (backend)
     - URL production của bạn (khi deploy)
   - **Authorized redirect URIs**:
     - `http://localhost:8080/auth/google/callback` (development)
     - URL production của bạn (khi deploy)
7. Click **Create**
8. Copy **Client ID** và **Client Secret**

## Bước 2: Cấu Hình Environment Variables

Thêm vào file `.env` trong thư mục `server/`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=/auth/google/callback

# Client URL (frontend)
CLIENT_URL=http://localhost:3000

# Session Secret (có thể dùng JWT_SECRET)
SESSION_SECRET=your-session-secret-here
```

## Bước 3: Restart Server

Sau khi cấu hình xong, restart server:

```bash
cd server
npm run dev
```

## Bước 4: Test

1. Mở trình duyệt và vào `http://localhost:3000/login`
2. Click nút **"Đăng nhập bằng Google"**
3. Chọn tài khoản Google
4. Cho phép quyền truy cập
5. Sẽ tự động đăng nhập và redirect về trang chủ

## Lưu Ý

- **Development**: Sử dụng `http://localhost:3000` và `http://localhost:8080`
- **Production**: Cần cập nhật Authorized origins và redirect URIs trong Google Console
- **Security**: Không commit file `.env` lên Git
- **Email**: Google sẽ cung cấp email đã được verify, user sẽ tự động có `emailVerified: true`

## Troubleshooting

### Lỗi: "redirect_uri_mismatch"
- Kiểm tra lại Authorized redirect URIs trong Google Console
- Đảm bảo URL chính xác (không có trailing slash)

### Lỗi: "invalid_client"
- Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong .env
- Đảm bảo đã restart server sau khi thêm env variables

### Không redirect về frontend
- Kiểm tra CLIENT_URL trong .env
- Đảm bảo CORS đã được cấu hình đúng
