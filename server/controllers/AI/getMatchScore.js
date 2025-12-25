import { analyzeResume } from '../../services/ai/resumeMatcherService.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import Application from '../../models/Application.js';

/**
 * Lấy match score cho một candidate và job cụ thể
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

    // Nếu user chưa có CV, return 0
    if (!user.cvText) {
      return res.json({
        success: true,
        matchScore: 0,
        hasCV: false,
        message: 'Please upload your CV first to see match score'
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
    // Gọi Python service với CV text
    try {
      // Tạo buffer từ CV text (giả định format đơn giản)
      // Trong thực tế cần có CV file
      const Buffer = (await import('buffer')).Buffer;
      const cvBuffer = Buffer.from(user.cvText, 'utf-8');

      const analysis = await analyzeResume(
        cvBuffer,
        'resume.txt', // filename
        job.description
      );

      // Lưu match score vào Application nếu có
      if (application) {
        await Application.findByIdAndUpdate(application._id, {
          $set: {
            matchScore: analysis.score || 0,
            aiAnalysis: {
              strengths: analysis.analysis?.strengths || [],
              weaknesses: analysis.analysis?.weaknesses || [],
              recommendations: analysis.suggestions || []
            }
          }
        });
      }

      res.json({
        success: true,
        matchScore: analysis.score || 0,
        hasCV: true,
        fromCache: false,
        label: analysis.label,
        match_reasons: analysis.match_reasons,
        aiAnalysis: {
          strengths: analysis.analysis?.strengths || [],
          weaknesses: analysis.analysis?.weaknesses || [],
          recommendations: analysis.suggestions || []
        }
      });

    } catch (error) {
      console.error('Error calculating match score:', error);
      // Return user's CV score nếu có
      res.json({
        success: true,
        matchScore: user.cvScore || 0,
        hasCV: true,
        fromCache: false,
        error: 'Could not calculate match score, using CV score instead'
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

