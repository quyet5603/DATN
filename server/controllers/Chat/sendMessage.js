import { sendChatMessage } from '../../services/ai/interviewBotService.js';
import ChatSession from '../../models/ChatSession.js';

/**
 * Gửi message trong interview
 */
export const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get session
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user owns this session
    if (session.candidateID.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Call Python service
    const response = await sendChatMessage(sessionId, message);

    // Update session với messages mới
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    session.messages.push({
      role: 'assistant',
      content: response.response,
      timestamp: new Date()
    });

    await session.save();

    res.json({
      success: true,
      response: response.response,
      feedback: response.feedback,
      score: response.score
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error.message 
    });
  }
};

