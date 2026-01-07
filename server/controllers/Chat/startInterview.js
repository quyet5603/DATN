import ollamaService from '../../services/ollamaService.js';
import Job from '../../models/Job.js';
import ChatSession from '../../models/ChatSession.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Bắt đầu một interview session mới
 */
export const startInterviewSession = async (req, res) => {
  try {
    const { jobId } = req.params;
    // Lấy userId từ authenticate middleware
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

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

    // Generate interview questions using Ollama
    console.log('[Start Interview] Generating questions with Ollama...');
    const questions = await ollamaService.generateInterviewQuestions(
      job.jobTitle,
      job.description
    );

    const sessionId = uuidv4();
    const greeting = `Xin chào ${user.userName}! Tôi là bot phỏng vấn được hỗ trợ bởi AI. Tôi sẽ hỏi bạn ${questions.length} câu hỏi về vị trí ${job.jobTitle}. Hãy bắt đầu thôi!`;
    const firstQuestion = questions[0];

    // Save session to database
    const session = await ChatSession.create({
      candidateID: userId,
      jobID: jobId,
      sessionId: sessionId,
      sessionType: 'interview',
      status: 'active',
      messages: [
        {
          role: 'assistant',
          content: greeting,
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: firstQuestion,
          timestamp: new Date()
        }
      ],
      metadata: {
        questions: questions,
        currentQuestionIndex: 0,
        totalQuestions: questions.length
      }
    });

    res.json({
      success: true,
      sessionId: sessionId,
      greeting: greeting,
      firstQuestion: firstQuestion,
      totalQuestions: questions.length,
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

