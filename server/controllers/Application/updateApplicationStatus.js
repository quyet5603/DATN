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

        // Nếu đang chấp nhận (shortlist) ứng viên
        if (status === 'shortlist') {
            // Kiểm tra số lượng shortlisted hiện tại (TRƯỚC KHI cập nhật)
            const currentShortlistedCount = await Application.countDocuments({
                jobID: application.jobID,
                applicationStatus: 'shortlist'
            });

            // Nếu application hiện tại đang là shortlist, thì không tính vào count
            // Nếu application hiện tại không phải shortlist, thì sau khi update sẽ là currentShortlistedCount + 1
            const willBeShortlisted = application.applicationStatus !== 'shortlist';
            const newShortlistedCount = willBeShortlisted 
                ? currentShortlistedCount + 1 
                : currentShortlistedCount;

            // Kiểm tra nếu đã đủ số lượng
            if (newShortlistedCount > job.quantity) {
                return res.status(400).json({
                    success: false,
                    error: 'Công việc này đã đủ số lượng ứng viên. Không thể chấp nhận thêm.'
                });
            }
        }

        // Update status
        application.applicationStatus = status;
        await application.save();

        // Nếu vừa shortlist và đã đủ số lượng, tự động đóng job
        if (status === 'shortlist') {
            const newShortlistedCount = await Application.countDocuments({
                jobID: application.jobID,
                applicationStatus: 'shortlist'
            });

            if (newShortlistedCount >= job.quantity && job.status !== 'filled') {
                // Tự động đóng job
                job.status = 'filled';
                await job.save();

                // (Optional) Tự động reject các application còn lại với status active/inactive
                try {
                    await Application.updateMany(
                        { 
                            jobID: application.jobID,
                            applicationStatus: { $in: ['active', 'inactive'] },
                            _id: { $ne: application._id } // Không reject application vừa được shortlist
                        },
                        { applicationStatus: 'rejected' }
                    );
                } catch (rejectError) {
                    console.error('Error auto-rejecting other applications:', rejectError);
                    // Không fail request nếu auto-reject lỗi
                }
            }
        }

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

