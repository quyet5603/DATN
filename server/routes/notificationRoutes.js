import express from 'express';
import { authenticate } from '../middleware/VerifyToken.js';
import { markAsRead, markAllAsRead } from '../controllers/Notification/getNotifications.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get notifications (works for both candidate and employer)
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const unreadCount = await Notification.countDocuments({ 
            userId, 
            isRead: false 
        });

        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy thông báo'
        });
    }
});

// Mark notification as read
router.put('/:id/read', authenticate, markAsRead);

// Mark all notifications as read
router.put('/read-all', authenticate, markAllAsRead);

export default router;

