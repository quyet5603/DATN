import User from '../../models/User.js';
import Application from '../../models/Application.js';
import Job from '../../models/Job.js';
import ChatSession from '../../models/ChatSession.js';

/**
 * Lấy thống kê cho candidate
 */
export const getCandidateStats = async (req, res) => {
  try {
    // Lấy userId từ params hoặc từ authenticated user
    const userId = req.params.candidateId || req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Số applications
    const applications = await Application.find({ candidateID: userId });
    const totalApplications = applications.length;
    
    // Applications theo status
    const applicationsByStatus = {
      active: applications.filter(app => app.applicationStatus === 'active').length,
      shortlist: applications.filter(app => app.applicationStatus === 'shortlist').length,
      rejected: applications.filter(app => app.applicationStatus === 'rejected').length,
      inactive: applications.filter(app => app.applicationStatus === 'inactive').length
    };

    // Average match score
    const applicationsWithScore = applications.filter(app => app.matchScore && app.matchScore > 0);
    const averageMatchScore = applicationsWithScore.length > 0
      ? Math.round(applicationsWithScore.reduce((sum, app) => sum + app.matchScore, 0) / applicationsWithScore.length)
      : 0;

    // Highest match score
    const highestMatchScore = applications.length > 0
      ? Math.max(...applications.map(app => app.matchScore || 0))
      : 0;

    // CV Score
    const cvScore = user.cvScore || 0;

    // Interview sessions
    const interviewSessions = await ChatSession.find({
      candidateID: userId,
      sessionType: 'interview'
    });
    const totalInterviews = interviewSessions.length;
    const completedInterviews = interviewSessions.filter(s => s.status === 'completed').length;

    // Jobs applied (unique)
    const uniqueJobIds = [...new Set(applications.map(app => app.jobID))];
    const uniqueJobsApplied = uniqueJobIds.length;

    res.json({
      success: true,
      stats: {
        totalApplications,
        applicationsByStatus,
        averageMatchScore,
        highestMatchScore,
        cvScore,
        totalInterviews,
        completedInterviews,
        uniqueJobsApplied
      }
    });

  } catch (error) {
    console.error('Error getting candidate stats:', error);
    res.status(500).json({
      error: 'Failed to get candidate statistics',
      message: error.message
    });
  }
};

