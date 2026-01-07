import ollamaService from '../../services/ollamaService.js';
import ChatSession from '../../models/ChatSession.js';
import Job from '../../models/Job.js';

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

    // Save user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Get job context
    const job = await Job.findById(session.jobID);
    const jobContext = job ? `${job.jobTitle}: ${job.description}` : 'General interview';

    // Get current question
    const metadata = session.metadata || {};
    const questions = metadata.questions || [];
    const currentIndex = metadata.currentQuestionIndex || 0;
    const currentQuestion = questions[currentIndex] || 'General question';

    // Evaluate answer using Ollama
    const evaluation = await ollamaService.evaluateAnswer(
      currentQuestion,
      message,
      jobContext
    );

    // Check if there are more questions
    const nextIndex = currentIndex + 1;
    const hasMoreQuestions = nextIndex < questions.length;
    const nextQuestion = hasMoreQuestions ? questions[nextIndex] : null;

    let assistantMessage = evaluation.feedback;
    if (nextQuestion) {
      assistantMessage += `\n\n${nextQuestion}`;
    } else {
      assistantMessage += '\n\nĐó là câu hỏi cuối cùng. Cảm ơn bạn đã tham gia phỏng vấn!';
    }

    // Update session
    session.messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date()
    });

    session.metadata = {
      ...metadata,
      currentQuestionIndex: nextIndex,
      answers: [...(metadata.answers || []), {
        question: currentQuestion,
        answer: message,
        score: evaluation.score,
        feedback: evaluation.feedback
      }]
    };

    if (!hasMoreQuestions) {
      session.status = 'completed';
    }

    await session.save();

    res.json({
      success: true,
      response: assistantMessage,
      feedback: evaluation.feedback,
      score: evaluation.score,
      hasMoreQuestions: hasMoreQuestions,
      isComplete: !hasMoreQuestions
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error.message 
    });
  }
};

