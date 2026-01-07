import ollamaService from '../../services/ollamaService.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import pdfParse from 'pdf-parse';

/**
 * Phân tích CV của candidate với một job
 */
export const analyzeCV = async (req, res) => {
  try {
    const { jobId } = req.params;
    const resumeFile = req.file; // từ multer middleware
    const userId = req.userId || req.user?._id; // từ auth middleware

    if (!resumeFile) {
      return res.status(400).json({ error: 'No resume file provided' });
    }

    // Get job description
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Extract text từ PDF
    console.log('Extracting text from PDF...', {
      jobId,
      filename: resumeFile.originalname,
      fileSize: resumeFile.size
    });
    
    const pdfData = await pdfParse(resumeFile.buffer);
    const cvText = pdfData.text;
    
    if (!cvText || cvText.length < 50) {
      return res.status(400).json({ 
        error: 'Không thể đọc nội dung từ file PDF. Vui lòng kiểm tra file PDF có hợp lệ không.' 
      });
    }
    
    console.log('Analyzing CV with Ollama...');
    const jobInfo = {
      description: job.description,
      location: job.location,
      minExperience: job.minExperience,
      requiredSkills: job.requiredSkills,
      jobTitle: job.jobTitle
    };
    const analysis = await ollamaService.analyzeCV(cvText, job.description, jobInfo);
    
    console.log('Analysis result received:', {
      score: analysis.score,
      locationMatch: analysis.location_match,
      experienceMatch: analysis.experience_match,
      hasMatchReasons: !!analysis.match_reasons,
      hasRedFlags: !!analysis.red_flags
    });

    // Update user với CV analysis results
    // QUAN TRỌNG: Lưu file CV vào uploads/resume/ để employer có thể xem
    if (userId) {
      const fs = (await import('fs')).default;
      const path = (await import('path')).default;
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      // Lưu buffer vào file (multer dùng memoryStorage nên file là buffer)
      const resumeDir = path.join(__dirname, '../../uploads/resume/');
      if (!fs.existsSync(resumeDir)) {
        fs.mkdirSync(resumeDir, { recursive: true });
      }
      
      const filename = `${userId}.pdf`;
      const fullPath = path.join(resumeDir, filename);
      fs.writeFileSync(fullPath, resumeFile.buffer);
      const cvFilePath = `resume/${filename}`;
      
      console.log(`[AnalyzeCV] CV file saved: ${fullPath}`);

      await User.findByIdAndUpdate(userId, {
        $set: {
          cvScore: analysis.score,
          cvText: analysis.resume_text || analysis.text,
          cvAnalysis: {
            match_reasons: analysis.match_reasons,
            red_flags: analysis.red_flags,
            website: analysis.website
          },
          cvFilePath: cvFilePath  // Đảm bảo cvFilePath được lưu
        }
      });
      
      console.log(`[AnalyzeCV] User ${userId} CV saved to database: ${cvFilePath}`);
    }

    res.json({
      success: true,
      score: analysis.score,
      emoji: analysis.emoji,
      color: analysis.color,
      label: analysis.label,
      location_match: analysis.location_match,
      experience_match: analysis.experience_match,
      skills_match: analysis.skills_match,
      education_match: analysis.education_match,
      match_reasons: analysis.match_reasons,
      red_flags: analysis.red_flags,
      website: analysis.website,
      resumeText: analysis.resume_text || analysis.text
    });

  } catch (error) {
    console.error('Error analyzing CV:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error message
    let errorMessage = 'Failed to analyze CV';
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      errorMessage = 'Không thể kết nối đến Ollama. Vui lòng kiểm tra Ollama đang chạy trên port 8080';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Phân tích CV mất quá nhiều thời gian. Vui lòng thử lại sau';
    } else {
      errorMessage = error.message || 'Failed to analyze CV';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Extract text từ CV (không phân tích)
 */
export const extractCVText = async (req, res) => {
  try {
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ error: 'No resume file provided' });
    }

    const pdfData = await pdfParse(resumeFile.buffer);
    const text = pdfData.text;

    res.json({
      success: true,
      text: text
    });

  } catch (error) {
    console.error('Error extracting CV text:', error);
    res.status(500).json({ 
      error: 'Failed to extract CV text',
      message: error.message 
    });
  }
};

