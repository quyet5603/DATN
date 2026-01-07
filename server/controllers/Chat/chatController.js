import ollamaService from '../../services/ollamaService.js';

/**
 * Chat endpoint cho chatbot
 */
export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('[Chat] Received message:', message);

    // Gọi Ollama service (không cần history)
    const response = await ollamaService.chat(message, []);

    console.log('[Chat] Response generated');

    res.json({
      success: true,
      response: response,
      timestamp: new Date()
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

    // Stream response (không cần history)
    await ollamaService.chatStream(message, [], (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

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
