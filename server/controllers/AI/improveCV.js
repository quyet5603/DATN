import { analyzeResume } from '../../services/ai/resumeMatcherService.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';

/**
 * Gợi ý cải thiện CV dựa trên job description
 */
export const improveCV = async (req, res) => {
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

    // Nếu user chưa có CV text
    if (!user.cvText) {
      return res.status(400).json({
        error: 'CV not found',
        message: 'Please upload your CV first'
      });
    }

    // Phân tích CV với job description để lấy suggestions
    try {
      const Buffer = (await import('buffer')).Buffer;
      const cvBuffer = Buffer.from(user.cvText, 'utf-8');

      const analysis = await analyzeResume(
        cvBuffer,
        'resume.txt',
        job.description
      );

      // Extract suggestions từ analysis
      const suggestions = analysis.suggestions || [];
      const weaknesses = analysis.analysis?.weaknesses || [];
      const matchReasons = analysis.match_reasons || '';

      // Tạo improvement tips
      const improvementTips = [
        ...suggestions.map(s => ({ type: 'suggestion', text: s })),
        ...weaknesses.map(w => ({ type: 'weakness', text: `Cải thiện: ${w}` }))
      ];

      // Nếu có match_reasons, có thể tạo tips dựa trên đó
      if (matchReasons && matchReasons.length > 0) {
        const reasons = matchReasons.split('|').map(r => r.trim());
        reasons.forEach(reason => {
          if (reason && !improvementTips.some(tip => tip.text.includes(reason))) {
            improvementTips.push({
              type: 'match',
              text: `Tăng cường: ${reason}`
            });
          }
        });
      }

      res.json({
        success: true,
        currentScore: analysis.score || user.cvScore || 0,
        jobTitle: job.jobTitle,
        improvements: improvementTips,
        strengths: analysis.analysis?.strengths || [],
        weaknesses: weaknesses,
        recommendations: suggestions,
        matchReasons: matchReasons
      });

    } catch (error) {
      console.error('Error improving CV:', error);
      res.status(500).json({
        error: 'Failed to generate improvement suggestions',
        message: error.message
      });
    }

  } catch (error) {
    console.error('Error in improveCV:', error);
    res.status(500).json({
      error: 'Failed to improve CV',
      message: error.message
    });
  }
};

