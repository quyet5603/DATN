import ollamaService from '../../services/ollamaService.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import CV from '../../models/CV.js';
import Application from '../../models/Application.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lấy match score cho một candidate và job cụ thể
 * Ưu tiên sử dụng CV từ CV Manager (default CV)
 */
export const getMatchScore = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user và job
    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Ưu tiên lấy CV từ CV Manager (default CV)
    let defaultCV = await CV.findOne({ userId, isDefault: true, isActive: true });
    
    // Nếu không có default CV, lấy CV mới nhất
    if (!defaultCV) {
      defaultCV = await CV.findOne({ userId, isActive: true })
        .sort({ updatedAt: -1 });
    }

    console.log(`[Match Score] User ${userId}, Job ${jobId}`);
    console.log(`[Match Score] Default CV found: ${!!defaultCV}`);
    if (defaultCV) {
      console.log(`[Match Score] CV Name: ${defaultCV.cvName}, isDefault: ${defaultCV.isDefault}`);
      console.log(`[Match Score] CV FilePath: ${defaultCV.cvFilePath}, hasText: ${!!defaultCV.cvText}`);
    }
    console.log(`[Match Score] User has cvText: ${!!user.cvText}, cvFilePath: ${user.cvFilePath}`);

    // Kiểm tra có CV không (từ CV Manager hoặc User model)
    const hasCV = defaultCV || user.cvText || user.cvFilePath;
    
    if (!hasCV) {
      console.log(`[Match Score] No CV found for user ${userId}`);
      return res.json({
        success: true,
        matchScore: 0,
        hasCV: false,
        message: 'Vui lòng tải CV lên để xem điểm phù hợp'
      });
    }

    // Check xem đã có match score trong Application chưa
    const application = await Application.findOne({
      jobID: jobId,
      candidateID: userId
    });

    if (application && application.matchScore && application.matchScore > 0) {
      return res.json({
        success: true,
        matchScore: application.matchScore,
        hasCV: true,
        fromCache: true,
        aiAnalysis: application.aiAnalysis
      });
    }

    // Nếu chưa có, tính toán match score
    // Sử dụng Ollama để phân tích CV
    try {
      let cvText = '';
      let cvFilename = 'resume.pdf';

      // Ưu tiên: Lấy CV từ CV Manager
      if (defaultCV && defaultCV.cvFilePath) {
        try {
          const cvPath = path.join(__dirname, '../../', 'uploads', defaultCV.cvFilePath);
          if (fs.existsSync(cvPath)) {
            const cvBuffer = fs.readFileSync(cvPath);
            cvFilename = path.basename(defaultCV.cvFilePath);
            console.log(`[Match Score] Using CV from CV Manager: ${defaultCV.cvName}`);
            
            // Extract text từ PDF
            if (cvFilename.endsWith('.pdf')) {
              const pdfData = await pdfParse(cvBuffer);
              cvText = pdfData.text;
            } else {
              cvText = cvBuffer.toString('utf-8');
            }
          } else if (defaultCV.cvText) {
            // Fallback: dùng cvText nếu file không tồn tại
            cvText = defaultCV.cvText;
          }
        } catch (error) {
          console.error('Error reading CV file from CV Manager:', error);
        }
      }

      // Fallback: Lấy CV từ User model (backward compatibility)
      if (!cvText && user.cvFilePath) {
        try {
          const cvPath = path.join(__dirname, '../../', 'uploads', user.cvFilePath);
          if (fs.existsSync(cvPath)) {
            const cvBuffer = fs.readFileSync(cvPath);
            cvFilename = path.basename(user.cvFilePath);
            console.log(`[Match Score] Using CV from User model (legacy)`);
            
            // Extract text từ PDF
            if (cvFilename.endsWith('.pdf')) {
              const pdfData = await pdfParse(cvBuffer);
              cvText = pdfData.text;
            } else {
              cvText = cvBuffer.toString('utf-8');
            }
          }
        } catch (error) {
          console.error('Error reading CV file from User:', error);
        }
      }

      // Nếu không có file, dùng cvText
      if (!cvText && (defaultCV?.cvText || user.cvText)) {
        cvText = defaultCV?.cvText || user.cvText;
        console.log(`[Match Score] Using CV text`);
      }

      if (!cvText || cvText.length < 50) {
        return res.json({
          success: true,
          matchScore: 0,
          hasCV: false,
          message: 'Không thể đọc CV. Vui lòng tải lại CV.'
        });
      }

      console.log(`[Match Score] Calling Ollama service to analyze CV...`);
      console.log(`[Match Score] CV Text length: ${cvText.length} characters`);
      console.log(`[Match Score] Job Description length: ${job.description?.length || 0} characters`);
      
      const jobInfo = {
        description: job.description,
        location: job.location,
        minExperience: job.minExperience,
        requiredSkills: job.requiredSkills,
        jobTitle: job.jobTitle
      };
      
      const analysis = await ollamaService.analyzeCV(
        cvText,
        job.description,
        jobInfo
      );

      console.log(`[Match Score] Ollama service response received:`);
      console.log(`[Match Score] - Score: ${analysis.score}`);
      console.log(`[Match Score] - Label: ${analysis.label}`);
      console.log(`[Match Score] - Location Match: ${analysis.location_match?.match_status}`);
      console.log(`[Match Score] - Experience Match: ${analysis.experience_match?.match_status}`);
      console.log(`[Match Score] - Has match_reasons: ${!!analysis.match_reasons}`);
      console.log(`[Match Score] - Full response keys:`, Object.keys(analysis));

      // Kiểm tra nếu score = 0, có thể là lỗi hoặc thực sự không phù hợp
      if (analysis.score === 0 || analysis.score === null || analysis.score === undefined) {
        console.warn(`[Match Score] ⚠️ Score is 0/null/undefined. This might indicate an issue.`);
        console.warn(`[Match Score] Analysis object:`, JSON.stringify(analysis, null, 2));
      }

      // Lưu match score vào Application nếu có
      if (application) {
        await Application.findByIdAndUpdate(application._id, {
          $set: {
            matchScore: analysis.score || 0,
            aiAnalysis: {
              location_match: analysis.location_match,
              experience_match: analysis.experience_match,
              skills_match: analysis.skills_match,
              education_match: analysis.education_match,
              strengths: analysis.match_reasons || [],
              weaknesses: analysis.red_flags || [],
              recommendations: analysis.suggestions || []
            }
          }
        });
      }

      const finalScore = analysis.score || 0;
      console.log(`[Match Score] ✅ Returning match score: ${finalScore}%`);

      res.json({
        success: true,
        matchScore: finalScore,
        hasCV: true,
        fromCache: false,
        label: analysis.label,
        location_match: analysis.location_match,
        experience_match: analysis.experience_match,
        skills_match: analysis.skills_match,
        education_match: analysis.education_match,
        match_reasons: analysis.match_reasons,
        aiAnalysis: {
          location_match: analysis.location_match,
          experience_match: analysis.experience_match,
          skills_match: analysis.skills_match,
          education_match: analysis.education_match,
          strengths: analysis.match_reasons || [],
          weaknesses: analysis.red_flags || [],
          recommendations: analysis.suggestions || []
        }
      });

    } catch (error) {
      console.error('Error calculating match score:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Nếu có CV nhưng không tính được score, vẫn trả về hasCV: true với score = 0
      // Để frontend biết là có CV nhưng cần kiểm tra lại
      const hasCVData = !!(defaultCV || user.cvText || user.cvFilePath);
      
      res.json({
        success: true,
        matchScore: 0,
        hasCV: hasCVData,
        fromCache: false,
        error: error.message || 'Could not calculate match score. Please check if Python service is running (port 5001)',
        errorType: error.message?.includes('ECONNREFUSED') ? 'SERVICE_NOT_RUNNING' : 'CALCULATION_ERROR'
      });
    }

  } catch (error) {
    console.error('Error getting match score:', error);
    res.status(500).json({
      error: 'Failed to get match score',
      message: error.message
    });
  }
};

