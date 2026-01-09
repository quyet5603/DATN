# 🚀 HƯỚNG DẪN THIẾT LẬP ĐĂNG NHẬP BẰNG GOOGLE (5 PHÚT)

## BƯỚC 1: Tạo Google OAuth Credentials (3 phút)

### 1.1. Truy cập Google Cloud Console
👉 Mở trình duyệt và vào: https://console.cloud.google.com/

### 1.2. Tạo Project mới (nếu chưa có)
1. Click vào dropdown **"Select a project"** ở trên cùng
2. Click **"New Project"**
3. Đặt tên: **JobFinder** (hoặc tên bạn muốn)
4. Click **"Create"**
5. Chờ vài giây, sau đó chọn project vừa tạo

### 1.3. Bật Google+ API
1. Vào menu **☰** (góc trái trên) > **APIs & Services** > **Library**
2. Tìm kiếm: **"Google+ API"** hoặc **"People API"**
3. Click vào **"Google+ API"** hoặc **"People API"**
4. Click **"Enable"** (nếu chưa enable)

### 1.4. Tạo OAuth Credentials
1. Vào **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** ở trên cùng
3. Chọn **"OAuth client ID"**
4. Nếu lần đầu, sẽ hỏi **"Configure consent screen"**:
   - Chọn **"External"** > Click **"Create"**
   - **App name**: JobFinder
   - **User support email**: Chọn email của bạn
   - **Developer contact**: Nhập email của bạn
   - Click **"Save and Continue"** 3 lần (bỏ qua các bước còn lại)
   - Click **"Back to Dashboard"**

5. Quay lại **Credentials** > Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
6. **Application type**: Chọn **"Web application"**
7. **Name**: JobFinder
8. **Authorized JavaScript origins**: Thêm:
   ```
   http://localhost:3000
   http://localhost:8080
   ```
9. **Authorized redirect URIs**: Thêm:
   ```
   http://localhost:8080/auth/google/callback
   ```
10. Click **"Create"**
11. **QUAN TRỌNG**: Copy 2 thông tin này:
    - **Your Client ID**: (dạng: 123456789-abc...xyz.apps.googleusercontent.com)
    - **Your Client Secret**: (dạng: GOCSPX-abc...xyz)

## BƯỚC 2: Tạo file .env (1 phút)

1. Mở file `.env` trong thư mục `server/` (nếu chưa có thì tạo mới)
2. Thêm các dòng sau (thay thế bằng giá trị bạn vừa copy):

```env
# Google OAuth (BẮT BUỘC cho đăng nhập Google)
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
CLIENT_URL=http://localhost:3000

# Các biến khác (nếu chưa có)
MONGODB_URL=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key
PORT=8080
```

**Ví dụ:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
CLIENT_URL=http://localhost:3000
```

## BƯỚC 3: Restart Server (30 giây)

1. Dừng server hiện tại (Ctrl+C trong terminal)
2. Chạy lại:
   ```bash
   cd server
   npm run dev
   ```
3. Bạn sẽ thấy dòng: **"✅ Google OAuth Strategy initialized"**

## BƯỚC 4: Test (30 giây)

1. Mở trình duyệt: `http://localhost:3000/login`
2. Click nút **"Đăng nhập bằng Google"**
3. Chọn tài khoản Google
4. Cho phép quyền truy cập
5. ✅ Tự động đăng nhập và chuyển về trang chủ!

---

## ❌ NẾU GẶP LỖI:

### Lỗi: "redirect_uri_mismatch"
- Kiểm tra lại **Authorized redirect URIs** trong Google Console
- Phải chính xác: `http://localhost:8080/auth/google/callback` (không có dấu / ở cuối)

### Lỗi: "invalid_client"
- Kiểm tra lại GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong file .env
- Đảm bảo không có khoảng trắng thừa
- Restart server sau khi sửa .env

### Lỗi: "OAuth2Strategy requires a clientID option"
- File .env chưa được tạo hoặc chưa có GOOGLE_CLIENT_ID
- Kiểm tra file .env có đúng tên và đúng thư mục `server/.env`

---

## ✅ HOÀN TẤT!

Sau khi làm xong 4 bước trên, chức năng đăng nhập bằng Google sẽ hoạt động ngay!
