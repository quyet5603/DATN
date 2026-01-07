import Notification from '../../models/Notification.js';

/**
 * Create a notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (notificationData) => {
    try {
        const notification = new Notification(notificationData);
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Create notification for application status change (for candidate)
 */
export const notifyApplicationStatusChange = async (application, job, status) => {
    try {
        const statusMessages = {
            'active': 'Đơn ứng tuyển của bạn đã được xem xét',
            'shortlist': 'Chúc mừng! Đơn ứng tuyển của bạn đã được chấp nhận',
            'rejected': 'Rất tiếc, đơn ứng tuyển của bạn đã bị từ chối'
        };

        const message = statusMessages[status] || 'Trạng thái đơn ứng tuyển của bạn đã được cập nhật';

        await createNotification({
            userId: application.candidateId || application.candidateID,
            type: 'application_status',
            title: 'Cập nhật trạng thái ứng tuyển',
            message: message,
            jobId: job._id,
            jobTitle: job.jobTitle,
            applicationId: application._id,
            link: `/my-jobs`
        });
    } catch (error) {
        console.error('Error creating application status notification:', error);
    }
};

/**
 * Create notification for new application (for employer)
 */
export const notifyNewApplication = async (application, job, candidate) => {
    try {
        await createNotification({
            userId: job.employerId,
            type: 'new_application',
            title: 'Có đơn ứng tuyển mới',
            message: `${candidate.userName} đã ứng tuyển vào vị trí ${job.jobTitle}`,
            jobId: job._id,
            jobTitle: job.jobTitle,
            applicationId: application._id,
            link: `/all-jobs`
        });
    } catch (error) {
        console.error('Error creating new application notification:', error);
    }
};

