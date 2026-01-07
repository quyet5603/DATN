import Job from '../../models/Job.js';
import Application from '../../models/Application.js';
import User from '../../models/User.js';

/**
 * Lấy thống kê cho employer
 */
export const getEmployerStats = async (req, res) => {
  try {
    // Lấy userId từ params hoặc từ authenticated user
    const userId = req.params.employerId || req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get all jobs của employer
    const jobs = await Job.find({ 
        $or: [
            { employerId: userId },
            { employerId: { $exists: false } } // Fallback: lấy jobs cũ chưa có employerId
        ]
    });
    const totalJobs = jobs.length;

    // Get all applications cho các jobs này
    const allJobIds = jobs.map(job => job._id.toString());
    const applications = await Application.find({
      jobID: { $in: allJobIds }
    });

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

    // Top skills từ applications (từ aiAnalysis)
    const allSkills = [];
    applications.forEach(app => {
      if (app.aiAnalysis && app.aiAnalysis.strengths) {
        allSkills.push(...app.aiAnalysis.strengths);
      }
    });
    
    // Count skills frequency
    const skillFrequency = {};
    allSkills.forEach(skill => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });

    // Top 5 skills
    const topSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));

    // Applications per job
    const applicationsPerJob = {};
    applications.forEach(app => {
      applicationsPerJob[app.jobID] = (applicationsPerJob[app.jobID] || 0) + 1;
    });

    // Top 5 jobs với nhiều applications nhất
    const topJobs = Object.entries(applicationsPerJob)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([jobId, count]) => {
        const job = jobs.find(j => j._id.toString() === jobId);
        return {
          jobId,
          jobTitle: job?.jobTitle || 'Unknown',
          applicationsCount: count
        };
      });

    // Match score distribution
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    applicationsWithScore.forEach(app => {
      const score = app.matchScore;
      if (score >= 0 && score <= 20) scoreRanges['0-20']++;
      else if (score <= 40) scoreRanges['21-40']++;
      else if (score <= 60) scoreRanges['41-60']++;
      else if (score <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });

    res.json({
      success: true,
      stats: {
        totalJobs,
        totalApplications,
        applicationsByStatus,
        averageMatchScore,
        topSkills,
        topJobs,
        scoreDistribution: scoreRanges
      }
    });

  } catch (error) {
    console.error('Error getting employer stats:', error);
    res.status(500).json({
      error: 'Failed to get employer statistics',
      message: error.message
    });
  }
};

