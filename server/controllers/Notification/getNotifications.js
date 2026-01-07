import Notification from '../../models/Notification.js';

/**
 * Get notifications for candidate
 */
export const getCandidateNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

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
        console.error('Error fetching candidate notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy thông báo'
        });
    }
};

/**
 * Get notifications for employer
 */
export const getEmployerNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

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
        console.error('Error fetching employer notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy thông báo'
        });
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy thông báo'
            });
        }

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi khi cập nhật thông báo'
        });
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            message: 'Đã đánh dấu tất cả thông báo là đã đọc'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi khi cập nhật thông báo'
        });
    }
};

