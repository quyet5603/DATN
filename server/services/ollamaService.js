import axios from "axios";
import userContextService from "./userContextService.js";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:8080";
const MODEL = process.env.OLLAMA_MODEL || "phi3:mini";

class OllamaService {
  constructor() {
    this.baseURL = OLLAMA_HOST;
    this.model = MODEL;
    console.log(`[Ollama Service] Initialized with URL: ${this.baseURL}, Model: ${this.model}`);
  }

  /**
   * Detect language from message (simple detection)
   */
  detectLanguage(message) {
    const englishWords = /\b(the|is|are|what|where|when|how|why|can|will|would|should|this|that|these|those)\b/i;
    const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    
    if (vietnameseChars.test(message)) {
      return 'vietnamese';
    }
    if (englishWords.test(message)) {
      return 'english';
    }
    // Default to detecting by common patterns
    if (message.match(/[a-zA-Z]{3,}/) && !message.match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i)) {
      return 'english';
    }
    return 'vietnamese'; // Default
  }

  /**
   * Chat với Ollama (non-streaming)
   * @param {string} message - Tin nhắn từ user
   * @param {Array} history - Lịch sử chat (optional)
   * @param {Object} userContext - Thông tin user context (optional)
   */
  async chat(message, history = [], userContext = null) {
    try {
      const recentHistory = history.slice(-5);
      
      // Detect language from user message
      const detectedLanguage = this.detectLanguage(message);
      const languageInstruction = detectedLanguage === 'english' 
        ? 'CRITICAL: The user is asking in ENGLISH. You MUST respond in ENGLISH only. Do not use Vietnamese.'
        : 'CRITICAL: The user is asking in VIETNAMESE. You MUST respond in VIETNAMESE only. Do not use English.';

      // Tạo system prompt với user context nếu có
      let systemPrompt = '';
      if (userContext) {
        const contextText = userContextService.formatContextForPrompt(userContext);
        
        systemPrompt = `You are an intelligent AI assistant for a job recruitment system. You can answer questions about:
- User's personal information
- CV and work experience
- Job applications
- Posted jobs (if employer)
- Career advice, CV writing, interviews
- Other system-related questions

${languageInstruction}

${contextText}

Please respond in a friendly, helpful, and accurate manner based on the provided information. If information is not available, please state so clearly.\n\n`;
      } else {
        systemPrompt = `You are an intelligent AI assistant for a job recruitment system. You can answer questions about job searching, CV writing, interviews, and related topics.

${languageInstruction}\n\n`;
      }

      const context = recentHistory
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const prompt = systemPrompt + (context
        ? `${context}\nuser: ${message}\nassistant:`
        : `user: ${message}\nassistant:`);

      console.log(`[Ollama] Sending request to ${this.baseURL}/api/generate`);
      if (userContext) {
        console.log(`[Ollama] User context included for role: ${userContext.user.role}`);
      }

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            num_predict: 500,
            temperature: 0.7,
          },
        },
        {
          timeout: 120000,
        }
      );

      return response.data.response;
    } catch (error) {
      console.error("Ollama Service Error:", error.message);
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Không thể kết nối với Ollama tại ${this.baseURL}. Vui lòng kiểm tra Ollama đang chạy với port 8080`);
      }
      throw new Error(`Lỗi Ollama: ${error.message}`);
    }
  }

  /**
   * Chat với streaming response
   * @param {string} message - Tin nhắn từ user
   * @param {Array} history - Lịch sử chat (optional)
   * @param {Function} onChunk - Callback khi nhận được chunk
   * @param {Object} userContext - Thông tin user context (optional)
   */
  async chatStream(message, history = [], onChunk, userContext = null) {
    try {
      // Detect language from user message
      const detectedLanguage = this.detectLanguage(message);
      const languageInstruction = detectedLanguage === 'english' 
        ? 'CRITICAL: The user is asking in ENGLISH. You MUST respond in ENGLISH only. Do not use Vietnamese.'
        : 'CRITICAL: The user is asking in VIETNAMESE. You MUST respond in VIETNAMESE only. Do not use English.';

      // Tạo system prompt với user context nếu có
      let systemPrompt = '';
      if (userContext) {
        const contextText = userContextService.formatContextForPrompt(userContext);
        
        systemPrompt = `You are an intelligent AI assistant for a job recruitment system. You can answer questions about:
- User's personal information
- CV and work experience
- Job applications
- Posted jobs (if employer)
- Career advice, CV writing, interviews
- Other system-related questions

${languageInstruction}

${contextText}

Please respond in a friendly, helpful, and accurate manner based on the provided information. If information is not available, please state so clearly.\n\n`;
      } else {
        systemPrompt = `You are an intelligent AI assistant for a job recruitment system. You can answer questions about job searching, CV writing, interviews, and related topics.

${languageInstruction}\n\n`;
      }

      const context = history
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const prompt = systemPrompt + (context
        ? `${context}\nuser: ${message}\nassistant:`
        : `user: ${message}\nassistant:`);

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: true,
        },
        {
          responseType: "stream",
          timeout: 60000,
        }
      );

      return new Promise((resolve, reject) => {
        let fullResponse = "";

        response.data.on("data", (chunk) => {
          const lines = chunk.toString().split("\n").filter(Boolean);

          lines.forEach((line) => {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                fullResponse += data.response;
                if (onChunk) {
                  onChunk(data.response);
                }
              }
              if (data.done) {
                resolve(fullResponse);
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          });
        });

        response.data.on("error", (error) => {
          reject(error);
        });

        response.data.on("end", () => {
          if (fullResponse) {
            resolve(fullResponse);
          }
        });
      });
    } catch (error) {
      console.error("Ollama Streaming Error:", error.message);
      throw new Error(`Không thể kết nối với Ollama: ${error.message}`);
    }
  }

  /**
   * Phân tích CV với job description
   * jobInfo có thể chứa: { description, location, minExperience, requiredSkills, jobTitle }
   */
  async analyzeCV(cvText, jobDescription, jobInfo = {}) {
    try {
      // Tách các thông tin quan trọng
      const jobLocation = jobInfo.location || "Không xác định";
      const minExperience = jobInfo.minExperience || 0;
      const requiredSkills = jobInfo.requiredSkills || [];
      const jobTitle = jobInfo.jobTitle || "Vị trí tuyển dụng";

      const prompt = `Bạn là chuyên gia tuyển dụng AI. Hãy phân tích CV sau với yêu cầu công việc và đánh giá độ phù hợp.

THÔNG TIN CÔNG VIỆC:
- Vị trí: ${jobTitle}
- Địa điểm làm việc: ${jobLocation}
- Kinh nghiệm tối thiểu: ${minExperience} năm
- Kỹ năng yêu cầu: ${requiredSkills.join(', ') || 'Xem mô tả công việc'}
- Mô tả chi tiết: ${jobDescription}

NỘI DUNG CV:
${cvText.substring(0, 3000)}

YÊU CẦU ĐÁNH GIÁ:
1. ĐỊA ĐIỂM: So sánh địa điểm trong CV với địa điểm công việc (${jobLocation})
   - Cùng thành phố: +20 điểm
   - Khác thành phố nhưng sẵn sàng di chuyển: +10 điểm
   - Không đề cập: 0 điểm
   
2. KINH NGHIỆM: So sánh số năm kinh nghiệm với yêu cầu (${minExperience} năm)
   - Đủ hoặc cao hơn yêu cầu: +30 điểm
   - Thiếu 1-2 năm: +15 điểm
   - Thiếu nhiều hơn: +5 điểm
   - Không có kinh nghiệm: 0 điểm

3. KỸ NĂNG: Đánh giá kỹ năng phù hợp với yêu cầu công việc (+30 điểm tối đa)

4. HỌC VẤN & CHỨNG CHỈ: Đánh giá trình độ (+20 điểm tối đa)

Trả về JSON với cấu trúc sau (CHỈ JSON, KHÔNG có text thêm):
{
  "score": <số điểm từ 0-100>,
  "location_match": {
    "score": <0-20>,
    "cv_location": "địa điểm trong CV",
    "match_status": "perfect/good/poor/unknown"
  },
  "experience_match": {
    "score": <0-30>,
    "cv_years": <số năm kinh nghiệm>,
    "required_years": ${minExperience},
    "match_status": "exceeded/met/close/insufficient"
  },
  "skills_match": {
    "score": <0-30>,
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["skill3"]
  },
  "education_match": {
    "score": <0-20>,
    "cv_education": "trình độ trong CV"
  },
  "match_reasons": ["Lý do phù hợp 1", "Lý do 2", "Lý do 3"],
  "red_flags": ["Vấn đề 1", "Vấn đề 2"],
  "suggestions": ["Gợi ý cải thiện 1", "Gợi ý 2"],
  "analysis": "Phân tích tổng quan 2-3 câu"
}`;

      const response = await this.chat(prompt);
      
      // Parse JSON từ response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Tính tổng điểm từ các thành phần
        const totalScore = (analysis.location_match?.score || 0) +
                          (analysis.experience_match?.score || 0) +
                          (analysis.skills_match?.score || 0) +
                          (analysis.education_match?.score || 0);
        
        const finalScore = analysis.score || totalScore || 50;
        
        // Đảm bảo có đủ fields
        return {
          score: Math.min(100, Math.max(0, finalScore)),
          location_match: analysis.location_match || { score: 0, match_status: 'unknown' },
          experience_match: analysis.experience_match || { score: 0, match_status: 'unknown' },
          skills_match: analysis.skills_match || { score: 0, matched_skills: [], missing_skills: [] },
          education_match: analysis.education_match || { score: 0 },
          match_reasons: analysis.match_reasons || [],
          red_flags: analysis.red_flags || [],
          suggestions: analysis.suggestions || [],
          analysis: analysis.analysis || "Đã phân tích CV",
          emoji: this.getEmoji(finalScore),
          color: this.getColor(finalScore),
          label: this.getLabel(finalScore),
          resume_text: cvText
        };
      } else {
        // Fallback nếu không parse được JSON
        console.warn('[AnalyzeCV] Cannot parse JSON from Ollama response');
        return {
          score: 50,
          location_match: { score: 0, match_status: 'unknown' },
          experience_match: { score: 0, match_status: 'unknown' },
          skills_match: { score: 0, matched_skills: [], missing_skills: [] },
          education_match: { score: 0 },
          match_reasons: [],
          red_flags: ["Không thể phân tích tự động"],
          suggestions: ["Vui lòng kiểm tra lại CV"],
          analysis: response.substring(0, 500),
          emoji: "😐",
          color: "orange",
          label: "Cần xem xét",
          resume_text: cvText
        };
      }
    } catch (error) {
      console.error("CV Analysis Error:", error);
      throw new Error(`Lỗi phân tích CV: ${error.message}`);
    }
  }

  /**
   * Tạo câu hỏi phỏng vấn
   */
  async generateInterviewQuestions(jobTitle, jobDescription) {
    try {
      const prompt = `Bạn là chuyên gia phỏng vấn. Tạo 5 câu hỏi phỏng vấn cho vị trí: ${jobTitle}

Mô tả công việc:
${jobDescription || "Vị trí " + jobTitle}

Yêu cầu:
- Mỗi câu hỏi tối đa 20 từ
- Câu hỏi bằng tiếng Việt
- Đánh giá năng lực ứng viên
- Format: Mỗi câu hỏi một dòng, bắt đầu bằng số (1., 2., 3., ...)

CHỈ trả về danh sách câu hỏi, không có text thêm.`;

      const response = await this.chat(prompt);
      
      // Parse câu hỏi
      const questions = [];
      const lines = response.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        let question = trimmed;
        // Loại bỏ số và ký tự đặc biệt ở đầu
        if (trimmed[0] && /\d/.test(trimmed[0])) {
          question = trimmed.split('.', 2)[1]?.trim() || trimmed;
        } else if (trimmed.startsWith('-')) {
          question = trimmed.substring(1).trim();
        }
        
        if (question && question.length > 10) {
          questions.push(question);
        }
      }
      
      // Đảm bảo có ít nhất 3 câu hỏi
      if (questions.length < 3) {
        throw new Error("Không thể tạo đủ câu hỏi phỏng vấn");
      }
      
      return questions;
    } catch (error) {
      console.error("Generate Questions Error:", error);
      throw new Error(`Lỗi tạo câu hỏi: ${error.message}`);
    }
  }

  /**
   * Đánh giá câu trả lời phỏng vấn
   */
  async evaluateAnswer(question, answer, jobContext) {
    try {
      const prompt = `Bạn là chuyên gia đánh giá phỏng vấn.

Câu hỏi: ${question}
Câu trả lời của ứng viên: ${answer}
Ngữ cảnh công việc: ${jobContext}

Hãy đánh giá câu trả lời và trả về JSON:
{
  "score": <điểm từ 0-100>,
  "feedback": "Nhận xét về câu trả lời",
  "next_question": "Câu hỏi tiếp theo (nếu có)"
}

CHỈ trả về JSON.`;

      const response = await this.chat(prompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        score: 50,
        feedback: "Câu trả lời được ghi nhận",
        next_question: null
      };
    } catch (error) {
      console.error("Evaluate Answer Error:", error);
      return {
        score: 50,
        feedback: "Đã ghi nhận câu trả lời",
        next_question: null
      };
    }
  }

  /**
   * Kiểm tra health của Ollama service
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000,
      });
      return {
        status: "ok",
        models: response.data.models || [],
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message,
      };
    }
  }

  /**
   * Lấy danh sách models
   */
  async getModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error("Get Models Error:", error.message);
      throw new Error("Không thể lấy danh sách models");
    }
  }

  // Helper methods
  getEmoji(score) {
    if (score >= 80) return "🎉";
    if (score >= 60) return "😊";
    if (score >= 40) return "😐";
    return "😞";
  }

  getColor(score) {
    if (score >= 80) return "green";
    if (score >= 60) return "blue";
    if (score >= 40) return "orange";
    return "red";
  }

  getLabel(score) {
    if (score >= 80) return "Phù hợp cao";
    if (score >= 60) return "Phù hợp";
    if (score >= 40) return "Cần xem xét";
    return "Không phù hợp";
  }
}

export default new OllamaService();
