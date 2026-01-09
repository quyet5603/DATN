import Job from '../../models/Job.js';
import Application from '../../models/Application.js';
import User from '../../models/User.js';
import { notifyJobDeleted } from '../Notification/createNotification.js';

const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        
        // 1. Lấy thông tin job trước khi xóa (để thông báo)
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ 
                message: 'Không tìm thấy công việc' 
            });
        }

        // 2. Lấy tất cả applications của job này
        const applications = await Application.find({ jobID: jobId });

        // 3. Tự động reject tất cả applications và thông báo cho ứng viên
        if (applications.length > 0) {
            // Reject tất cả applications
            await Application.updateMany(
                { jobID: jobId },
                { applicationStatus: 'rejected' }
            );

            // Thông báo cho từng ứng viên
            for (const application of applications) {
                try {
                    const candidate = await User.findById(application.candidateID);
                    if (candidate) {
                        await notifyJobDeleted(application, job, candidate);
                    }
                } catch (notifError) {
                    console.error(`Error notifying candidate ${application.candidateID}:`, notifError);
                    // Không fail request nếu notification lỗi
                }
            }
        }

        // 4. Xóa job
        await Job.findByIdAndDelete(jobId);

        res.status(200).json({ 
            message: 'Công việc đã được xóa thành công',
            deletedApplications: applications.length
        });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: 'Lỗi khi xóa công việc' });
    }
};

export {deleteJob};