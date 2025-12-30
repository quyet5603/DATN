import { analyzeResume, extractResumeText } from '../../services/ai/resumeMatcherService.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';

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

    // Call Python service để phân tích CV
    console.log('Calling Python service to analyze CV...', {
      jobId,
      filename: resumeFile.originalname,
      fileSize: resumeFile.size
    });
    
    const analysis = await analyzeResume(
      resumeFile.buffer,
      resumeFile.originalname,
      job.description
    );
    
    console.log('Analysis result received:', {
      score: analysis.score,
      hasMatchReasons: !!analysis.match_reasons,
      hasRedFlags: !!analysis.red_flags
    });

    // Update user với CV analysis results
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          cvScore: analysis.score,
          cvText: analysis.resume_text || analysis.text,
          cvAnalysis: {
            match_reasons: analysis.match_reasons,
            red_flags: analysis.red_flags,
            website: analysis.website
          },
          cvFilePath: resumeFile.path || resumeFile.filename
        }
      });
    }

    res.json({
      success: true,
      score: analysis.score,
      emoji: analysis.emoji,
      color: analysis.color,
      label: analysis.label,
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
      errorMessage = 'Không thể kết nối đến dịch vụ phân tích CV. Vui lòng kiểm tra Python service có đang chạy không (port 5001)';
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

    const text = await extractResumeText(
      resumeFile.buffer,
      resumeFile.originalname
    );

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

