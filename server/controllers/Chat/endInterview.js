import ollamaService from '../../services/ollamaService.js';
import ChatSession from '../../models/ChatSession.js';

/**
 * Kết thúc interview và nhận tổng kết
 */
export const endInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    // Get session
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check authorization
    if (session.candidateID.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Calculate average score from answers
    const metadata = session.metadata || {};
    const answers = metadata.answers || [];
    
    let averageScore = 0;
    if (answers.length > 0) {
      const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
      averageScore = Math.round(totalScore / answers.length);
    }

    // Generate summary
    const summary = {
      totalQuestions: metadata.totalQuestions || answers.length,
      answeredQuestions: answers.length,
      averageScore: averageScore,
      feedback: averageScore >= 70 ? 'Tốt' : averageScore >= 50 ? 'Trung bình' : 'Cần cải thiện',
      details: answers.map(ans => ({
        question: ans.question,
        answer: ans.answer,
        score: ans.score,
        feedback: ans.feedback
      }))
    };

    // Update session
    session.status = 'completed';
    session.summary = summary;
    await session.save();

    res.json({
      success: true,
      summary: summary,
      messages: session.messages
    });

  } catch (error) {
    console.error('Error ending interview:', error);
    res.status(500).json({ 
      error: 'Failed to end interview',
      message: error.message 
    });
  }
};

