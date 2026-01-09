# Hướng Dẫn Kết Nối và Xem Database MongoDB
Dự án này sử dụng **MongoDB** làm database. Có **6 collections (bảng)** chính:

1. **users** - Người dùng (ứng viên, nhà tuyển dụng, admin)
2. **jobs** - Công việc/việc làm
3. **applications** - Đơn ứng tuyển
4. **cvs** - CV/Resume của ứng viên
5. **notifications** - Thông báo
6. **chatsessions** - Phiên chat/phỏng vấn

#### Tìm kiếm theo điều kiện:
// Tìm user có role là "candidate"
db.users.find({ role: "candidate" }).pretty()

// Tìm user có email cụ thể
db.users.find({ userEmail: "example@gmail.com" }).pretty()
```

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

### Đếm số lượng documents:
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

---


## 📝 Ví Dụ Thực Tế

### Xem tất cả ứng viên:
use your_database_name
db.users.find({ role: "candidate" }).pretty()
```

### Xem tất cả nhà tuyển dụng:
db.users.find({ role: "employer" }).pretty()
```

### Xem tất cả công việc đang hoạt động:
db.jobs.find({ isActive: true }).pretty()
```

### Xem đơn ứng tuyển đang chờ xử lý:
db.applications.find({ applicationStatus: "pending" }).pretty()
```

### Xem CV của một user cụ thể:
db.cvs.find({ userId: ObjectId("user_id_here") }).pretty()
```



