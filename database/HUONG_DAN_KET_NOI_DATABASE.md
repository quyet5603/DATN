# Hướng Dẫn Kết Nối và Xem Database MongoDB

## 📋 Tổng Quan

Dự án này sử dụng **MongoDB** làm database. Có **6 collections (bảng)** chính:

1. **users** - Người dùng (ứng viên, nhà tuyển dụng, admin)
2. **jobs** - Công việc/việc làm
3. **applications** - Đơn ứng tuyển
4. **cvs** - CV/Resume của ứng viên
5. **notifications** - Thông báo
6. **chatsessions** - Phiên chat/phỏng vấn

---

## 🔧 Cách 1: Sử dụng MongoDB Compass (Giao diện đồ họa - Khuyên dùng)

### Bước 1: Tải và cài đặt MongoDB Compass
1. Truy cập: https://www.mongodb.com/try/download/compass
2. Tải về và cài đặt MongoDB Compass

### Bước 2: Lấy Connection String từ file .env
1. Mở file `.env` trong thư mục `server/`
2. Tìm dòng `MONGODB_URL=...`
3. Copy connection string (ví dụ: `mongodb://localhost:27017/your_database_name`)

### Bước 3: Kết nối trong MongoDB Compass
1. Mở MongoDB Compass
2. Dán connection string vào ô "Connection String"
3. Click "Connect"

### Bước 4: Xem các Collections
- Ở bên trái, bạn sẽ thấy danh sách các databases
- Click vào database của bạn (tên database nằm trong connection string)
- Bạn sẽ thấy danh sách các collections:
  - `users`
  - `jobs`
  - `applications`
  - `cvs`
  - `notifications`
  - `chatsessions`

### Bước 5: Xem dữ liệu trong từng Collection
1. Click vào tên collection (ví dụ: `users`)
2. Bạn sẽ thấy danh sách tất cả documents (bản ghi) trong collection đó
3. Click vào một document để xem chi tiết
4. Có thể tìm kiếm, lọc, sắp xếp dữ liệu

---

## 💻 Cách 2: Sử dụng MongoDB Shell (mongo/mongosh)

### Bước 1: Mở Terminal/Command Prompt

### Bước 2: Kết nối đến MongoDB
```bash
# Nếu dùng MongoDB 4.x trở xuống
mongo

# Nếu dùng MongoDB 5.0 trở lên
mongosh
```

Hoặc kết nối trực tiếp với connection string:
```bash
mongosh "mongodb://localhost:27017/your_database_name"
```

### Bước 3: Xem danh sách databases
```javascript
show dbs
```

### Bước 4: Chọn database
```javascript
use your_database_name
```
(Thay `your_database_name` bằng tên database trong file .env)

### Bước 5: Xem danh sách collections
```javascript
show collections
```

Kết quả sẽ hiển thị:
```
users
jobs
applications
cvs
notifications
chatsessions
```

### Bước 6: Xem dữ liệu trong từng collection

#### Xem tất cả documents trong collection `users`:
```javascript
db.users.find().pretty()
```

#### Xem số lượng documents:
```javascript
db.users.countDocuments()
```

#### Xem 5 documents đầu tiên:
```javascript
db.users.find().limit(5).pretty()
```

#### Xem một document cụ thể:
```javascript
db.users.findOne()
```

#### Tìm kiếm theo điều kiện:
```javascript
// Tìm user có role là "candidate"
db.users.find({ role: "candidate" }).pretty()

// Tìm user có email cụ thể
db.users.find({ userEmail: "example@gmail.com" }).pretty()
```

#### Tương tự cho các collections khác:
```javascript
// Xem jobs
db.jobs.find().pretty()

// Xem applications
db.applications.find().pretty()

// Xem cvs
db.cvs.find().pretty()

// Xem notifications
db.notifications.find().pretty()

// Xem chatsessions
db.chatsessions.find().pretty()
```

---

## 📊 Cấu Trúc Dữ Liệu Các Collections

### 1. Collection: `users`
**Mục đích**: Lưu thông tin người dùng

**Các trường chính**:
- `userName` - Tên người dùng
- `userEmail` - Email
- `userPassword` - Mật khẩu (đã hash)
- `role` - Vai trò: "candidate", "employer", "admin"
- `phoneNumber` - Số điện thoại
- `address` - Địa chỉ
- `gender` - Giới tính
- `dateOfBirth` - Ngày sinh
- `avatar` - Đường dẫn avatar
- `position` - Chức vụ
- `cvSections` - Các phần CV (cho candidate)
- `companyTitle`, `companyDescription`, `website`, ... (cho employer)

### 2. Collection: `jobs`
**Mục đích**: Lưu thông tin công việc

**Các trường chính**:
- `jobID` - ID công việc
- `jobTitle` - Tiêu đề công việc
- `employmentType` - Loại hình: "Full-time", "Part-time", ...
- `location` - Địa điểm
- `salary` - Mức lương
- `description` - Mô tả công việc
- `employerId` - ID nhà tuyển dụng (reference đến User)
- `isActive` - Trạng thái hoạt động

### 3. Collection: `applications`
**Mục đích**: Lưu đơn ứng tuyển

**Các trường chính**:
- `jobID` - ID công việc (reference đến Job)
- `candidateID` - ID ứng viên (reference đến User)
- `applicationStatus` - Trạng thái: "pending", "accepted", "rejected"
- `applicationForm` - Form ứng tuyển
- `matchScore` - Điểm phù hợp (nếu có)
- `createdAt` - Ngày tạo

### 4. Collection: `cvs`
**Mục đích**: Lưu CV/Resume của ứng viên

**Các trường chính**:
- `userId` - ID người dùng (reference đến User)
- `cvName` - Tên CV
- `cvFilePath` - Đường dẫn file CV
- `cvText` - Nội dung CV (text)
- `isActive` - Trạng thái hoạt động
- `isDefault` - CV mặc định

### 5. Collection: `notifications`
**Mục đích**: Lưu thông báo

**Các trường chính**:
- `userId` - ID người dùng nhận thông báo
- `type` - Loại thông báo
- `title` - Tiêu đề
- `message` - Nội dung
- `isRead` - Đã đọc chưa
- `createdAt` - Ngày tạo

### 6. Collection: `chatsessions`
**Mục đích**: Lưu phiên chat/phỏng vấn

**Các trường chính**:
- `candidateID` - ID ứng viên
- `jobID` - ID công việc (nếu có)
- `sessionId` - ID phiên
- `messages` - Danh sách tin nhắn
- `status` - Trạng thái: "active", "completed"

---

## 🔍 Các Câu Lệnh Hữu Ích

### Đếm số lượng documents:
```javascript
db.users.countDocuments()
db.jobs.countDocuments()
db.applications.countDocuments()
```

### Xem cấu trúc của một document:
```javascript
db.users.findOne()
```

### Tìm kiếm nâng cao:
```javascript
// Tìm jobs của một employer cụ thể
db.jobs.find({ employerId: "ObjectId_here" }).pretty()

// Tìm applications của một candidate
db.applications.find({ candidateID: "user_id_here" }).pretty()

// Tìm applications theo status
db.applications.find({ applicationStatus: "pending" }).pretty()
```

### Sắp xếp:
```javascript
// Sắp xếp theo ngày tạo (mới nhất trước)
db.jobs.find().sort({ createdAt: -1 }).pretty()

// Sắp xếp theo tên (A-Z)
db.users.find().sort({ userName: 1 }).pretty()
```

### Giới hạn kết quả:
```javascript
// Lấy 10 documents đầu tiên
db.users.find().limit(10).pretty()

// Bỏ qua 5 documents đầu, lấy 10 tiếp theo
db.users.find().skip(5).limit(10).pretty()
```

---

## ⚠️ Lưu Ý

1. **Connection String**: Đảm bảo MongoDB đang chạy trước khi kết nối
2. **Tên Database**: Kiểm tra tên database trong file `.env` (phần cuối của `MONGODB_URL`)
3. **Bảo mật**: Không chỉnh sửa dữ liệu trực tiếp trong production database
4. **Backup**: Nên backup database trước khi thực hiện các thao tác quan trọng

---

## 🆘 Xử Lý Lỗi

### Lỗi: "Connection refused"
- **Nguyên nhân**: MongoDB chưa được khởi động
- **Giải pháp**: Khởi động MongoDB service

### Lỗi: "Authentication failed"
- **Nguyên nhân**: Sai username/password trong connection string
- **Giải pháp**: Kiểm tra lại file `.env`

### Lỗi: "Database not found"
- **Nguyên nhân**: Database chưa được tạo
- **Giải pháp**: Database sẽ tự động được tạo khi có dữ liệu đầu tiên

---

## 📝 Ví Dụ Thực Tế

### Xem tất cả ứng viên:
```javascript
use your_database_name
db.users.find({ role: "candidate" }).pretty()
```

### Xem tất cả nhà tuyển dụng:
```javascript
db.users.find({ role: "employer" }).pretty()
```

### Xem tất cả công việc đang hoạt động:
```javascript
db.jobs.find({ isActive: true }).pretty()
```

### Xem đơn ứng tuyển đang chờ xử lý:
```javascript
db.applications.find({ applicationStatus: "pending" }).pretty()
```

### Xem CV của một user cụ thể:
```javascript
db.cvs.find({ userId: ObjectId("user_id_here") }).pretty()
```

---

**Chúc bạn thành công! 🎉**

