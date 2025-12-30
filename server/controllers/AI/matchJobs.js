import { analyzeResume } from '../../services/ai/resumeMatcherService.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';

/**
 * Lấy danh sách jobs được AI recommend cho candidate
 */
export const getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'User not authenticated' 
      });
    }
    
    // Get user CV
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (!user.cvText && !user.cvFilePath) {
      return res.status(404).json({ 
        error: 'CV not found. Please upload your CV first.' 
      });
    }

    // Get all active jobs
    const jobs = await Job.find({});
    
    if (jobs.length === 0) {
      return res.json({
        success: true,
        jobs: [],
        total: 0,
        message: 'No jobs available'
      });
    }
    
    // Match CV với từng job
    // Tạm thời trả về tất cả jobs với placeholder score
    // Trong tương lai có thể gọi Python service để tính match score thực sự
    const matches = jobs.map((job) => {
      return {
        jobId: job._id.toString(),
        jobTitle: job.jobTitle,
        location: job.location,
        employmentType: job.employmentType,
        salary: job.salary,
        description: job.description,
        matchScore: user.cvScore || 0 // Sử dụng cvScore nếu có, nếu không thì 0
      };
    });

    // Sort theo match score (cao nhất trước)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Trả về top 10 jobs có match score cao nhất
    const topJobs = matches.slice(0, 10);

    res.json({
      success: true,
      jobs: topJobs,
      total: topJobs.length
    });

  } catch (error) {
    console.error('Error getting recommended jobs:', error);
    res.status(500).json({ 
      error: 'Failed to get recommended jobs',
      message: error.message 
    });
  }
};

