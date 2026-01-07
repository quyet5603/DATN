import express from 'express';
import { startInterviewSession } from '../controllers/Chat/startInterview.js';
import { sendMessage } from '../controllers/Chat/sendMessage.js';
import { endInterviewSession } from '../controllers/Chat/endInterview.js';
import { chat, chatStream, checkOllamaHealth } from '../controllers/Chat/chatController.js';
import { authenticate } from '../middleware/VerifyToken.js';

const router = express.Router();

// General chat endpoints (không cần authenticate)
router.post('/', chat);
router.post('/stream', chatStream);
router.get('/health', checkOllamaHealth);

// Interview endpoints
router.post('/start-interview/:jobId', authenticate, startInterviewSession);
router.post('/message/:sessionId', authenticate, sendMessage);
router.post('/end-interview/:sessionId', authenticate, endInterviewSession);

export default router;

