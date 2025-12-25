import { analyzeResume } from '../../services/ai/resumeMatcherService.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';

/**
 * Lấy danh sách jobs được AI recommend cho candidate
 */
export const getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Get user CV
    const user = await User.findById(userId);
    if (!user || !user.cvText) {
      return res.status(404).json({ 
        error: 'CV not found. Please upload your CV first.' 
      });
    }

    // Get all active jobs
    const jobs = await Job.find({});
    
    // Match CV với từng job
    const matches = await Promise.all(
      jobs.map(async (job) => {
        try {
          // Create a buffer from CV text (giả định có sẵn CV file)
          // Trong thực tế, cần lưu CV file và đọc lại
          // Tạm thời dùng CV text đã extract sẵn
          
          // TODO: Nếu có CV file, dùng analyzeResume với file buffer
          // Nếu chỉ có text, cần adapt Python service để nhận text thay vì file
          
          // Placeholder: Giả sử đã có match score từ trước
          // Hoặc cần gọi Python service với CV text
          
          return {
            jobId: job._id,
            jobTitle: job.jobTitle,
            matchScore: 0 // Placeholder
          };
        } catch (error) {
          console.error(`Error matching job ${job._id}:`, error);
          return null;
        }
      })
    );

    // Filter và sort theo match score
    const validMatches = matches
      .filter(m => m !== null)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      jobs: validMatches,
      total: validMatches.length
    });

  } catch (error) {
    console.error('Error getting recommended jobs:', error);
    res.status(500).json({ 
      error: 'Failed to get recommended jobs',
      message: error.message 
    });
  }
};

