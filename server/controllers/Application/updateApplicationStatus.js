import Application from '../../models/Application.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import { notifyApplicationStatusChange } from '../Notification/createNotification.js';

export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        if (!['active', 'shortlist', 'rejected', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Trạng thái không hợp lệ'
            });
        }

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy đơn ứng tuyển'
            });
        }

        // Lấy thông tin job
        const job = await Job.findById(application.jobID);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy job'
            });
        }

        // Update status
        application.applicationStatus = status;
        await application.save();

        // Create notification for candidate
        try {
            // jobID and candidateID are strings, need to find by ID
            const candidate = await User.findById(application.candidateID);
            
            if (job && candidate) {
                // Create a notification object with proper structure
                const notificationData = {
                    _id: application._id,
                    candidateId: application.candidateID,
                    jobID: application.jobID
                };
                await notifyApplicationStatusChange(notificationData, job, status);
            }
        } catch (notifError) {
            console.error('Error creating notification:', notifError);
            // Don't fail the request if notification fails
        }

        res.json({
            success: true,
            application
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi khi cập nhật trạng thái'
        });
    }
};

