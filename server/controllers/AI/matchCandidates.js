import { matchResumes } from '../../services/ai/resumeMatcherService.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import Application from '../../models/Application.js';

/**
 * Lấy danh sách candidates phù hợp với job (cho employer)
 */
export const getMatchedCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get all candidates đã apply cho job này
    const applications = await Application.find({ jobID: jobId });
    
    if (applications.length === 0) {
      return res.json({
        success: true,
        candidates: [],
        total: 0
      });
    }

    // Get CV files của các candidates
    const candidates = await Promise.all(
      applications.map(async (app) => {
        const candidate = await User.findById(app.candidateID);
        if (!candidate || !candidate.cvFilePath) {
          return null;
        }
        
        return {
          candidateId: candidate._id,
          candidateName: candidate.userName,
          applicationId: app._id,
          cvFilePath: candidate.cvFilePath,
          cvText: candidate.cvText
        };
      })
    );

    const validCandidates = candidates.filter(c => c !== null);

    // TODO: Match CVs với job description
    // Cần đọc CV files và gọi Python service
    // Tạm thời return candidates với placeholder scores

    const matchedCandidates = validCandidates.map((candidate, index) => ({
      ...candidate,
      matchScore: 0, // Placeholder - cần gọi Python service
      rank: index + 1
    }));

    // Sort theo match score (sẽ có sau khi gọi Python service)
    matchedCandidates.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      candidates: matchedCandidates,
      total: matchedCandidates.length,
      jobTitle: job.jobTitle
    });

  } catch (error) {
    console.error('Error getting matched candidates:', error);
    res.status(500).json({ 
      error: 'Failed to get matched candidates',
      message: error.message 
    });
  }
};

