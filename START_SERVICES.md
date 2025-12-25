# ⚡ CHẠY TẤT CẢ SERVICES 

## 📋 Mở 4 Terminal riêng biệt và chạy lần lượt:

---

### 🔹 TERMINAL 1: Resume Matcher (Port 5001)

```powershell
cd python-services\resume-matcher-service
.\venv\Scripts\Activate.ps1
python app.py
```


### 🔹 TERMINAL 2: Interview Bot (Port 5002)

```powershell
cd python-services\interview-bot-service
.\venv\Scripts\Activate.ps1
python app.py
```

### 🔹 TERMINAL 3: Backend Server (Port 8080)

```powershell
cd server
npm run dev
```


### 🔹 TERMINAL 4: Frontend (Port 3000)

```powershell
cd client
npm start
```


---

- **Không tắt 4 terminals này** - để chúng chạy liên tục
- **MongoDB phải đang chạy** (check Windows Services)
- Sau khi tất cả chạy → Bắt đầu test!

---


