# Python Services Integration

## 📦 Setup Instructions

### 1. Clone Resume-Job-Matcher

```bash
cd python-services
git clone https://github.com/sliday/resume-job-matcher.git resume-matcher-service
cd resume-matcher-service
pip install -r requirements.txt
```

### 2. Clone Interview-Bot

```bash
cd ..
git clone https://github.com/nehalvaghasiya/interview-bot.git interview-bot-service
cd interview-bot-service
pip install -r requirements.txt
```

### 3. Environment Variables

Tạo `.env` files cho mỗi service:

**resume-matcher-service/.env:**
```
CLAUDE_API_KEY=your_claude_api_key
# HOẶC
OPENAI_API_KEY=your_openai_api_key
```

**interview-bot-service/.env:**
```
OPENAI_API_KEY=your_openai_api_key
# HOẶC (nếu dùng Ollama local)
OLLAMA_BASE_URL=http://localhost:11434
```

### 4. Run Services

```bash
# Terminal 1: Resume Matcher Service
cd resume-matcher-service
python app.py  # Sẽ chạy trên port 5001

# Terminal 2: Interview Bot Service  
cd interview-bot-service
python app.py  # Sẽ chạy trên port 5002
```

## 🔗 Integration với Node.js

Node.js backend sẽ gọi các Python services qua HTTP API.

