import { startInterview } from '../../services/ai/interviewBotService.js';
import Job from '../../models/Job.js';
import ChatSession from '../../models/ChatSession.js';

/**
 * Bắt đầu một interview session mới
 */
export const startInterviewSession = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user?.id;

    // Get job info
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get user info
    const User = (await import('../../models/User.js')).default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Call Python service để start interview
    const interviewData = await startInterview(
      job.jobTitle,
      job.description,
      user.userName
    );

    // Save session to database
    const session = await ChatSession.create({
      candidateID: userId,
      jobID: jobId,
      sessionId: interviewData.session_id,
      sessionType: 'interview',
      status: 'active',
      messages: [{
        role: 'assistant',
        content: interviewData.greeting || interviewData.first_question,
        timestamp: new Date()
      }]
    });

    res.json({
      success: true,
      sessionId: interviewData.session_id,
      greeting: interviewData.greeting,
      firstQuestion: interviewData.first_question,
      totalQuestions: interviewData.total_questions,
      jobTitle: job.jobTitle
    });

  } catch (error) {
    console.error('[Start Interview] Error:', error);
    console.error('[Start Interview] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to start interview',
      message: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

