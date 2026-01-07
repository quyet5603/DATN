import CV from '../../models/CV.js';
import ollamaService from '../../services/ollamaService.js';
import cvScoringService from '../../services/ai/cvScoringService.js';
import pdfParse from 'pdf-parse';

/**
 * Phân tích và chấm điểm CV tự động
 * Controller này sẽ:
 * 1. Extract text từ PDF
 * 2. Phân tích CV với AI (Ollama)
 * 3. Tự động chấm điểm dựa trên kết quả phân tích
 * 4. Lưu kết quả vào database
 */
export const analyzeAndScoreCV = async (req, res) => {
    try {
        const { cvId } = req.params;
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Lấy CV từ database
        const cv = await CV.findOne({ _id: cvId, userId });
        if (!cv) {
            return res.status(404).json({ error: 'CV not found or you do not have permission' });
        }

        // Nếu chưa có cvText, cần upload file
        if (!cv.cvText) {
            return res.status(400).json({ 
                error: 'CV text not available. Please ensure the CV has been properly uploaded.' 
            });
        }

        console.log(`[Analyze & Score CV] Starting analysis for CV ${cvId}...`);

        // Phân tích CV với Ollama để trích xuất thông tin
        const prompt = `Phân tích CV sau và trích xuất thông tin theo cấu trúc JSON:

NỘI DUNG CV:
${cv.cvText.substring(0, 4000)}

YÊU CẦU:
Hãy phân tích CV và trả về JSON với cấu trúc sau (CHỈ JSON, KHÔNG có text thêm):
{
  "skills": ["kỹ năng 1", "kỹ năng 2", "kỹ năng 3"],
  "experience": "Mô tả tóm tắt kinh nghiệm làm việc, số năm kinh nghiệm",
  "education": "Trình độ học vấn cao nhất",
  "strengths": ["điểm mạnh 1", "điểm mạnh 2", "điểm mạnh 3"],
  "weaknesses": ["điểm yếu 1", "điểm yếu 2"]
}

Lưu ý:
- skills: Liệt kê tất cả kỹ năng kỹ thuật, công nghệ, công cụ, ngôn ngữ lập trình
- experience: Tóm tắt kinh nghiệm, nêu rõ số năm
- education: Bằng cấp cao nhất (Tiến sĩ, Thạc sĩ, Đại học, Cao đẳng, etc.)
- strengths: Điểm mạnh của ứng viên (dự án nổi bật, thành tích, chứng chỉ)
- weaknesses: Điểm yếu hoặc thiếu sót (thiếu kỹ năng, ít kinh nghiệm, etc.)`;

        const response = await ollamaService.chat(prompt);
        
        // Parse JSON từ response
        let cvAnalysis = {};
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            try {
                cvAnalysis = JSON.parse(jsonMatch[0]);
                console.log(`[Analyze & Score CV] Analysis completed:`, {
                    skillsCount: cvAnalysis.skills?.length || 0,
                    hasExperience: !!cvAnalysis.experience,
                    hasEducation: !!cvAnalysis.education
                });
            } catch (parseError) {
                console.error('[Analyze & Score CV] JSON parse error:', parseError);
                cvAnalysis = {
                    skills: [],
                    experience: '',
                    education: '',
                    strengths: [],
                    weaknesses: ['Không thể phân tích tự động CV']
                };
            }
        } else {
            console.warn('[Analyze & Score CV] Cannot extract JSON from Ollama response');
            cvAnalysis = {
                skills: [],
                experience: '',
                education: '',
                strengths: [],
                weaknesses: ['Không thể phân tích tự động CV']
            };
        }

        // Cập nhật CV với kết quả phân tích
        cv.cvAnalysis = cvAnalysis;
        cv.updatedAt = new Date();
        await cv.save();

        console.log(`[Analyze & Score CV] CV analysis saved to database`);

        // Tự động chấm điểm CV dựa trên kết quả phân tích
        const scoreData = cvScoringService.calculateCVScore(cvAnalysis);
        
        // Cập nhật điểm vào CV
        cv.cvScore = scoreData.totalScore;
        await cv.save();

        console.log(`[Analyze & Score CV] CV scored: ${scoreData.totalScore}/100`);

        res.json({
            success: true,
            message: 'CV đã được phân tích và chấm điểm thành công',
            data: {
                cvId: cv._id,
                cvName: cv.cvName,
                analysis: cvAnalysis,
                score: {
                    totalScore: scoreData.totalScore,
                    grade: scoreData.grade,
                    breakdown: scoreData.breakdown,
                    recommendations: scoreData.recommendation
                }
            }
        });

    } catch (error) {
        console.error('Error analyzing and scoring CV:', error);
        
        let errorMessage = 'Failed to analyze and score CV';
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
            errorMessage = 'Không thể kết nối đến Ollama. Vui lòng kiểm tra Ollama đang chạy.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Phân tích CV mất quá nhiều thời gian. Vui lòng thử lại sau.';
        }
        
        res.status(500).json({ 
            error: errorMessage,
            message: error.message 
        });
    }
};

/**
 * Phân tích và chấm điểm CV từ file upload
 * Sử dụng khi user upload CV mới
 */
export const analyzeAndScoreCVFromFile = async (req, res) => {
    try {
        const resumeFile = req.file;
        const userId = req.userId || req.user?._id;
        const { cvName } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!resumeFile) {
            return res.status(400).json({ error: 'No resume file provided' });
        }

        if (!cvName || !cvName.trim()) {
            return res.status(400).json({ error: 'CV name is required' });
        }

        console.log('[Analyze & Score CV] Processing uploaded file...', {
            filename: resumeFile.originalname,
            size: resumeFile.size
        });

        // Extract text từ PDF
        const pdfData = await pdfParse(resumeFile.buffer);
        const cvText = pdfData.text;

        if (!cvText || cvText.length < 50) {
            return res.status(400).json({ 
                error: 'Không thể đọc nội dung từ file PDF. Vui lòng kiểm tra file có hợp lệ.' 
            });
        }

        // Lưu file vào disk
        const fs = (await import('fs')).default;
        const path = (await import('path')).default;
        const { fileURLToPath } = await import('url');
        
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        const resumeDir = path.join(__dirname, '../../', 'uploads', 'resume');
        if (!fs.existsSync(resumeDir)) {
            fs.mkdirSync(resumeDir, { recursive: true });
        }

        const timestamp = Date.now();
        const filename = `cv_${userId}_${timestamp}.pdf`;
        const fullPath = path.join(resumeDir, filename);
        const filePath = `resume/${filename}`;

        fs.writeFileSync(fullPath, resumeFile.buffer);
        console.log(`[Analyze & Score CV] File saved: ${fullPath}`);

        // Phân tích CV với Ollama
        const prompt = `Phân tích CV sau và trích xuất thông tin theo cấu trúc JSON:

NỘI DUNG CV:
${cvText.substring(0, 4000)}

YÊU CẦU:
Hãy phân tích CV và trả về JSON với cấu trúc sau (CHỈ JSON, KHÔNG có text thêm):
{
  "skills": ["kỹ năng 1", "kỹ năng 2", "kỹ năng 3"],
  "experience": "Mô tả tóm tắt kinh nghiệm làm việc, số năm kinh nghiệm",
  "education": "Trình độ học vấn cao nhất",
  "strengths": ["điểm mạnh 1", "điểm mạnh 2", "điểm mạnh 3"],
  "weaknesses": ["điểm yếu 1", "điểm yếu 2"]
}`;

        const response = await ollamaService.chat(prompt);
        
        let cvAnalysis = {};
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            try {
                cvAnalysis = JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                console.error('[Analyze & Score CV] JSON parse error:', parseError);
                cvAnalysis = {
                    skills: [],
                    experience: '',
                    education: '',
                    strengths: [],
                    weaknesses: []
                };
            }
        } else {
            cvAnalysis = {
                skills: [],
                experience: '',
                education: '',
                strengths: [],
                weaknesses: []
            };
        }

        // Tính điểm CV
        const scoreData = cvScoringService.calculateCVScore(cvAnalysis);

        // Kiểm tra xem có CV nào chưa
        const existingCVs = await CV.countDocuments({ userId, isActive: true });
        const shouldBeDefault = existingCVs === 0;

        if (shouldBeDefault) {
            await CV.updateMany(
                { userId, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        // Tạo CV mới với phân tích và điểm
        const newCV = new CV({
            userId,
            cvName: cvName.trim(),
            cvFilePath: filePath,
            cvText: cvText,
            cvAnalysis: cvAnalysis,
            cvScore: scoreData.totalScore,
            isDefault: shouldBeDefault
        });

        await newCV.save();
        console.log(`[Analyze & Score CV] CV saved with score: ${scoreData.totalScore}/100`);

        res.json({
            success: true,
            message: 'CV đã được tải lên, phân tích và chấm điểm thành công',
            data: {
                cv: {
                    _id: newCV._id,
                    cvName: newCV.cvName,
                    cvFilePath: newCV.cvFilePath,
                    isDefault: newCV.isDefault
                },
                analysis: cvAnalysis,
                score: {
                    totalScore: scoreData.totalScore,
                    grade: scoreData.grade,
                    breakdown: scoreData.breakdown,
                    recommendations: scoreData.recommendation
                }
            }
        });

    } catch (error) {
        console.error('Error analyzing and scoring CV from file:', error);
        
        let errorMessage = 'Failed to analyze and score CV';
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
            errorMessage = 'Không thể kết nối đến Ollama. Vui lòng kiểm tra Ollama đang chạy.';
        }
        
        res.status(500).json({ 
            error: errorMessage,
            message: error.message 
        });
    }
};
