import express from 'express';
import { startInterviewSession } from '../controllers/Chat/startInterview.js';
import { sendMessage } from '../controllers/Chat/sendMessage.js';
import { endInterviewSession } from '../controllers/Chat/endInterview.js';
import { authenticate } from '../middleware/VerifyToken.js';

const router = express.Router();

// Interview endpoints
router.post('/start-interview/:jobId', authenticate, startInterviewSession);
router.post('/message/:sessionId', authenticate, sendMessage);
router.post('/end-interview/:sessionId', authenticate, endInterviewSession);

export default router;

