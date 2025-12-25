# 🧪 HƯỚNG DẪN TẠO DỮ LIỆU MẪU ĐỂ TEST

## 🔍 VẤN ĐỀ HIỆN TẠI

Khi đăng nhập vào tài khoản **Candidate**, trang trống vì:
- Chưa có **jobs** nào trong database (cần tài khoản Employer đăng jobs)
- Chưa có **CV** được tải lên (cần để nhận gợi ý việc làm)

---

## ✅ GIẢI PHÁP: TẠO DỮ LIỆU MẪU

### BƯỚC 1: Tạo tài khoản Employer

1. **Đăng xuất** khỏi tài khoản Candidate hiện tại (nếu đang đăng nhập)

2. **Đăng ký tài khoản mới:**
   - Truy cập: `http://localhost:3000/signup`
   - Chọn **"Nhà tuyển dụng"** (Employer)
   - Điền thông tin:
     - Tên: `Công ty ABC`
     - Email: `employer@test.com`
     - Mật khẩu: `123456`
     - Giới tính: `Nam`
     - Địa chỉ: `Hà Nội`
   - Nhấn **Đăng ký**

3. **Đăng nhập** với tài khoản Employer vừa tạo

---

### BƯỚC 2: Đăng các Jobs

Sau khi đăng nhập với tài khoản **Employer**:

1. **Nhấn vào menu "Đăng việc"** (Post Job)

2. **Tạo ít nhất 3-5 jobs** với thông tin mẫu:

#### Job 1: Frontend Developer
```
Tiêu đề: Frontend Developer
Loại việc: Full-time
Mô tả: Tìm kiếm Frontend Developer có kinh nghiệm với React, JavaScript, HTML, CSS. Yêu cầu 2+ năm kinh nghiệm.
Địa điểm: Hà Nội
```

#### Job 2: Backend Developer
```
Tiêu đề: Backend Developer
Loại việc: Full-time
Mô tả: Tuyển Backend Developer với Node.js, Express, MongoDB. Có kinh nghiệm API development.
Địa điểm: TP.HCM
```

#### Job 3: Full Stack Developer
```
Tiêu đề: Full Stack Developer
Loại việc: Full-time
Mô tả: Tuyển Full Stack Developer thành thạo cả Frontend và Backend. React, Node.js, MongoDB.
Địa điểm: Đà Nẵng
```

#### Job 4: UI/UX Designer
```
Tiêu đề: UI/UX Designer
Loại việc: Part-time
Mô tả: Tuyển Designer có khả năng thiết kế giao diện đẹp, sử dụng Figma, Adobe XD.
Địa điểm: Hà Nội
```

#### Job 5: Data Analyst
```
Tiêu đề: Data Analyst
Loại việc: Full-time
Mô tả: Phân tích dữ liệu, làm báo cáo, sử dụng Excel, SQL, Python. Có kinh nghiệm 1+ năm.
Địa điểm: TP.HCM
```

3. **Lưu lại** tất cả các jobs

---

### BƯỚC 3: Test với tài khoản Candidate

1. **Đăng xuất** khỏi tài khoản Employer

2. **Đăng nhập** lại với tài khoản **Candidate** của bạn

3. **Kiểm tra trang chủ:**
   - Bây giờ sẽ thấy section **"Việc làm nổi bật"** với các jobs vừa tạo
   - Section **"Việc làm gợi ý"** vẫn sẽ trống (vì chưa có CV)

---

### BƯỚC 4: Upload CV để nhận gợi ý (Tùy chọn)

1. **Chọn một job** bất kỳ từ danh sách

2. **Nhấn "Tải CV & Phân tích với AI"** (hoặc vào menu "Tải CV & Phân tích")

3. **Upload CV** (PDF hoặc DOC)

4. **Chờ AI phân tích** CV

5. **Quay lại trang chủ** → Sẽ thấy section **"Việc làm gợi ý"** với các jobs phù hợp!

---

## 📋 CHECKLIST TEST

- [ ] Tạo tài khoản Employer
- [ ] Đăng ít nhất 3 jobs
- [ ] Đăng nhập với Candidate
- [ ] Kiểm tra "Việc làm nổi bật" hiển thị
- [ ] Kiểm tra "Việc làm gợi ý" (có thể trống nếu chưa upload CV)
- [ ] Upload CV và kiểm tra gợi ý việc làm

---

## 🐛 NẾU VẪN KHÔNG THẤY JOBS

### Kiểm tra Backend:
1. Mở `http://localhost:8080/jobs/all-jobs` trong browser
2. Phải thấy JSON array với các jobs
3. Nếu lỗi → Kiểm tra MongoDB đang chạy

### Kiểm tra Console (F12):
1. Mở Developer Tools (F12)
2. Vào tab **Console**
3. Xem có lỗi nào không:
   - `Failed to fetch` → Backend không chạy
   - `CORS error` → Kiểm tra CORS config trong server
   - `404 Not Found` → Kiểm tra route trong server

---

## 💡 LƯU Ý

- **Database trống ban đầu** → Cần tạo dữ liệu mẫu
- **AI gợi ý chỉ hoạt động** khi đã upload CV
- **Tất cả services phải đang chạy:**
  - ✅ Resume Matcher (Port 5001)
  - ✅ Interview Bot (Port 5002)
  - ✅ Backend (Port 8080)
  - ✅ Frontend (Port 3000)

---



