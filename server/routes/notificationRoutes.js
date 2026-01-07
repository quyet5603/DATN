import express from 'express';
import { getCandidateNotifications, getEmployerNotifications, markAsRead, markAllAsRead } from '../controllers/Notification/getNotifications.js';
import { VerifyToken } from '../middleware/VerifyToken.js';

const router = express.Router();

// Get notifications for candidate
router.get('/candidate', VerifyToken, getCandidateNotifications);

// Get notifications for employer
router.get('/employer', VerifyToken, getEmployerNotifications);

// Mark notification as read
router.put('/:id/read', VerifyToken, markAsRead);

// Mark all notifications as read
router.put('/read-all', VerifyToken, markAllAsRead);

export default router;

