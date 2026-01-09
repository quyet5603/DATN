import ollamaService from '../../services/ollamaService.js';
import userContextService from '../../services/userContextService.js';

/**
 * Chat endpoint cho chatbot
 * Hỗ trợ authentication (optional) - nếu có token sẽ lấy thông tin user
 */
export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('[Chat] Received message:', message);

    // Lấy user context nếu có authentication
    let userContext = null;
    const userId = req.userId || req.user?._id || req.user?.id;
    
    if (userId) {
      console.log('[Chat] User authenticated, fetching context for userId:', userId);
      userContext = await userContextService.getUserContext(userId);
      
      if (userContext) {
        console.log('[Chat] User context loaded:', {
          role: userContext.user.role,
          hasCV: !!userContext.candidate?.hasCV,
          hasJobs: !!userContext.employer?.jobs?.length
        });
      }
    }

    // Gọi Ollama service với user context
    const response = await ollamaService.chat(message, [], userContext);

    console.log('[Chat] Response generated');

    res.json({
      success: true,
      response: response,
      timestamp: new Date(),
      hasUserContext: !!userContext
    });

  } catch (error) {
    console.error('[Chat] Error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error.message
    });
  }
};

/**
 * Chat với streaming response
 * Hỗ trợ authentication (optional) - nếu có token sẽ lấy thông tin user
 */
export const chatStream = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log('[Chat Stream] Starting stream for message:', message);

    // Lấy user context nếu có authentication
    let userContext = null;
    const userId = req.userId || req.user?._id || req.user?.id;
    
    if (userId) {
      console.log('[Chat Stream] User authenticated, fetching context for userId:', userId);
      userContext = await userContextService.getUserContext(userId);
    }

    // Stream response với user context
    await ollamaService.chatStream(message, [], (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }, userContext);

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('[Chat Stream] Error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

/**
 * Kiểm tra Ollama health
 */
export const checkOllamaHealth = async (req, res) => {
  try {
    const health = await ollamaService.checkHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
