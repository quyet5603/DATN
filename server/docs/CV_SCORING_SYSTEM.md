# Hệ thống Chấm điểm CV Tự động

## Tổng quan

Hệ thống chấm điểm CV tự động sử dụng dữ liệu từ model CV để đánh giá và cho điểm CV của ứng viên. Điểm số được tính dựa trên 5 tiêu chí chính:

1. **Kỹ năng (Skills)** - 25 điểm
2. **Kinh nghiệm (Experience)** - 30 điểm  
3. **Học vấn (Education)** - 20 điểm
4. **Điểm mạnh (Strengths)** - 15 điểm
5. **Tính hoàn thiện (Completeness)** - 10 điểm

**Tổng điểm**: 100 điểm

## Cách thức hoạt động

### 1. Phân tích CV với AI (Ollama)
Khi CV được upload hoặc phân tích, hệ thống sẽ:
- Trích xuất text từ file PDF
- Sử dụng Ollama AI để phân tích và trích xuất thông tin:
  - Danh sách kỹ năng
  - Kinh nghiệm làm việc
  - Trình độ học vấn
  - Điểm mạnh
  - Điểm yếu

### 2. Tính điểm tự động
Dựa trên dữ liệu phân tích, hệ thống tính điểm theo công thức:

#### Điểm Kỹ năng (0-25)
- ≥10 kỹ năng: 25 điểm
- 7-9 kỹ năng: 20 điểm
- 5-6 kỹ năng: 15 điểm
- 3-4 kỹ năng: 10 điểm
- 1-2 kỹ năng: 5 điểm

#### Điểm Kinh nghiệm (0-30)
- ≥5 năm: 30 điểm
- 3-4 năm: 25 điểm
- 2 năm: 20 điểm
- 1 năm: 15 điểm
- <1 năm: 10 điểm
- Fresher: 5 điểm

#### Điểm Học vấn (0-20)
- Tiến sĩ/PhD: 20 điểm
- Thạc sĩ/Master: 18 điểm
- Đại học/Bachelor: 15 điểm
- Cao đẳng/College: 12 điểm
- Trung cấp/Diploma: 8 điểm

#### Điểm Điểm mạnh (0-15)
- ≥5 điểm mạnh: 15 điểm
- 3-4 điểm mạnh: 12 điểm
- 2 điểm mạnh: 8 điểm
- 1 điểm mạnh: 5 điểm

#### Điểm Hoàn thiện (0-10)
Dựa trên số lượng mục được điền đầy đủ

### 3. Xếp loại
- 90-100: Xuất sắc 🌟
- 80-89: Tốt 👍
- 70-79: Khá 😊
- 60-69: Trung bình 😐
- 50-59: Yếu 😕
- 0-49: Kém 😞

## API Endpoints

### 1. Phân tích và chấm điểm CV đã upload
```http
POST /api/cv/analyze-score/:cvId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "CV đã được phân tích và chấm điểm thành công",
  "data": {
    "cvId": "...",
    "cvName": "CV của tôi",
    "analysis": {
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": "3 năm kinh nghiệm làm việc với React",
      "education": "Đại học Bách Khoa",
      "strengths": ["Làm việc nhóm tốt", "Giải quyết vấn đề"],
      "weaknesses": ["Thiếu kinh nghiệm với AI"]
    },
    "score": {
      "totalScore": 75,
      "grade": {
        "label": "Khá",
        "emoji": "😊",
        "color": "#84cc16"
      },
      "breakdown": {
        "skillsScore": 15,
        "experienceScore": 25,
        "educationScore": 15,
        "strengthsScore": 8,
        "completenessScore": 10
      },
      "recommendations": [...]
    }
  }
}
```

### 2. Upload và phân tích CV mới
```http
POST /api/cv/analyze-score-upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- cv: [file PDF]
- cvName: "Tên CV"
```

### 3. Lấy điểm CV
```http
GET /api/cv/score/:cvId
Authorization: Bearer {token}
```

### 4. Cập nhật điểm CV
```http
PUT /api/cv/score/:cvId
Authorization: Bearer {token}
```

### 5. Lấy điểm tất cả CV của user
```http
GET /api/cv/scores/all
Authorization: Bearer {token}
```

### 6. So sánh điểm giữa nhiều CV
```http
POST /api/cv/scores/compare
Authorization: Bearer {token}
Content-Type: application/json

{
  "cvIds": ["cvId1", "cvId2", "cvId3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cvs": [...],
    "highest": { "cvId": "...", "score": 85 },
    "lowest": { "cvId": "...", "score": 60 },
    "average": 72.5
  }
}
```

### 7. Phân tích chi tiết điểm CV
```http
GET /api/cv/score/:cvId/analyze
Authorization: Bearer {token}
```

## Cấu trúc Database (CV Model)

```javascript
{
  userId: ObjectId,
  cvName: String,
  cvFilePath: String,
  cvText: String,
  isActive: Boolean,
  isDefault: Boolean,
  
  // Dữ liệu chấm điểm
  cvScore: Number,  // Điểm tổng (0-100)
  
  // Dữ liệu phân tích
  cvAnalysis: {
    skills: [String],      // Danh sách kỹ năng
    experience: String,     // Mô tả kinh nghiệm
    education: String,      // Trình độ học vấn
    strengths: [String],    // Điểm mạnh
    weaknesses: [String]    // Điểm yếu
  },
  
  cvEmbedding: [Number],
  uploadedAt: Date,
  updatedAt: Date
}
```

## Ví dụ sử dụng

### Frontend - Phân tích và chấm điểm CV

```javascript
// Upload và phân tích CV mới
const uploadAndAnalyzeCV = async (file, cvName) => {
  const formData = new FormData();
  formData.append('cv', file);
  formData.append('cvName', cvName);
  
  const response = await fetch('/api/cv/analyze-score-upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const result = await response.json();
  console.log('CV Score:', result.data.score.totalScore);
  console.log('Grade:', result.data.score.grade.label);
  console.log('Recommendations:', result.data.score.recommendations);
};

// Lấy điểm CV đã có
const getCVScore = async (cvId) => {
  const response = await fetch(`/api/cv/score/${cvId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result.data;
};

// So sánh điểm nhiều CV
const compareMyCVs = async (cvIds) => {
  const response = await fetch('/api/cv/scores/compare', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cvIds })
  });
  
  const result = await response.json();
  console.log('Best CV:', result.data.highest);
  console.log('Average Score:', result.data.average);
};
```

## Khuyến nghị cải thiện CV

Hệ thống tự động đưa ra khuyến nghị dựa trên điểm số:

1. **Kỹ năng thấp (<15)**: Cần bổ sung thêm kỹ năng chuyên môn
2. **Kinh nghiệm thấp (<15)**: Mô tả chi tiết hơn về dự án và vai trò
3. **Học vấn thấp (<10)**: Bổ sung thông tin bằng cấp đầy đủ
4. **Điểm mạnh thấp (<8)**: Nêu bật thành tích và điểm mạnh cá nhân
5. **Hoàn thiện thấp (<7)**: Hoàn thiện các mục còn thiếu

## Lưu ý

1. **Yêu cầu Ollama**: Cần có Ollama chạy trên port 8080 để phân tích CV
2. **Format PDF**: Chỉ hỗ trợ file PDF, tối đa 10MB
3. **Ngôn ngữ**: Hỗ trợ cả tiếng Việt và tiếng Anh
4. **Tự động cập nhật**: Điểm sẽ tự động cập nhật khi CV được phân tích lại

## Kiểm tra lỗi

Nếu gặp lỗi khi chấm điểm CV:

1. **Lỗi kết nối Ollama**: Kiểm tra Ollama đang chạy
   ```bash
   # Kiểm tra Ollama
   curl http://localhost:8080/api/version
   ```

2. **Lỗi parse PDF**: Đảm bảo file PDF hợp lệ và có text

3. **Lỗi phân tích**: Kiểm tra model Ollama đã được tải
   ```bash
   ollama list
   # Nếu chưa có, tải model
   ollama pull phi3:mini
   ```

## Tích hợp với Match Score

Điểm CV (cvScore) có thể được sử dụng kết hợp với Match Score khi tính độ phù hợp với công việc:

```javascript
const finalScore = (matchScore * 0.7) + (cvScore * 0.3);
```

Công thức này giúp cân bằng giữa:
- 70% độ phù hợp với công việc cụ thể (match score)
- 30% chất lượng CV tổng thể (cv score)
