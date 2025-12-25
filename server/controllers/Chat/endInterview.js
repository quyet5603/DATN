import { endInterview } from '../../services/ai/interviewBotService.js';
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

    // Call Python service để end interview
    const summary = await endInterview(sessionId);

    // Update session
    session.status = 'completed';
    session.summary = summary.summary;
    await session.save();

    res.json({
      success: true,
      summary: summary.summary,
      messages: summary.messages
    });

  } catch (error) {
    console.error('Error ending interview:', error);
    res.status(500).json({ 
      error: 'Failed to end interview',
      message: error.message 
    });
  }
};

