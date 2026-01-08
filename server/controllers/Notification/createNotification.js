import Notification from '../../models/Notification.js';
import User from '../../models/User.js';
import Job from '../../models/Job.js';

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
            'rejected': 'Đơn ứng tuyển của bạn đã bị từ chối'
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
            link: `/employer/candidate-detail/${application._id}`
        });
    } catch (error) {
        console.error('Error creating new application notification:', error);
    }
};

/**
 * Create notification for new job posted (for admin)
 */
export const notifyNewJobPosted = async (job, employer) => {
    try {
        // Find all admin users
        const admins = await User.find({ role: 'admin' });
        
        // Create notification for each admin
        const notifications = admins.map(admin => 
            createNotification({
                userId: admin._id,
                type: 'job_posted',
                title: 'Có công việc mới được đăng',
                message: `${employer.userName} đã đăng tin tuyển dụng: ${job.jobTitle}`,
                jobId: job._id,
                jobTitle: job.jobTitle,
                link: `/admin/jobs/detail/${job._id}`
            })
        );
        
        await Promise.all(notifications);
    } catch (error) {
        console.error('Error creating new job posted notification:', error);
    }
};

/**
 * Create notification for new user registered (for admin)
 */
export const notifyNewUserRegistered = async (user) => {
    try {
        // Find all admin users
        const admins = await User.find({ role: 'admin' });
        
        // Create notification for each admin
        const notifications = admins.map(admin => 
            createNotification({
                userId: admin._id,
                type: 'new_user',
                title: 'Có người dùng mới đăng ký',
                message: `${user.userName} (${user.userEmail}) đã đăng ký với vai trò ${user.role === 'candidate' ? 'Ứng viên' : user.role === 'employer' ? 'Nhà tuyển dụng' : 'Admin'}`,
                link: `/admin/users/edit/${user._id}`
            })
        );
        
        await Promise.all(notifications);
    } catch (error) {
        console.error('Error creating new user registered notification:', error);
    }
};

/**
 * Create notification for CV updated (for employer when candidate updates CV)
 */
export const notifyCVUpdated = async (candidate, jobIds) => {
    try {
        // Find all jobs that this candidate has applied to
        const jobs = await Job.find({ 
            _id: { $in: jobIds },
            employerId: { $exists: true }
        });
        
        // Create notification for each employer
        const notifications = jobs.map(job => 
            createNotification({
                userId: job.employerId,
                type: 'cv_updated',
                title: 'Ứng viên đã cập nhật CV',
                message: `${candidate.userName} đã cập nhật CV cho vị trí ${job.jobTitle}`,
                jobId: job._id,
                jobTitle: job.jobTitle,
                link: `/all-jobs`
            })
        );
        
        await Promise.all(notifications);
    } catch (error) {
        console.error('Error creating CV updated notification:', error);
    }
};

