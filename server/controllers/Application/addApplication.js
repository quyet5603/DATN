import Application from '../../models/Application.js'
import Job from '../../models/Job.js'
import User from '../../models/User.js'
import uniqid from 'uniqid';
import { notifyNewApplication } from '../Notification/createNotification.js';

const addApplication = async (req, res) => {
    const { jobID, candidateID, applicationStatus, applicationForm, candidateFeedback } = req.body;

    try {
        // Kiểm tra xem đã có application nào cho job và candidate này chưa
        const existingApplication = await Application.findOne({
            jobID: jobID,
            candidateID: candidateID
        });

        if (existingApplication) {
            // Nếu đã tồn tại, cập nhật
            if (applicationStatus) {
                existingApplication.applicationStatus = applicationStatus;
            }
            if (applicationForm) {
                existingApplication.applicationForm = applicationForm;
            }
            if (candidateFeedback) {
                existingApplication.candidateFeedback = candidateFeedback;
            }

            await existingApplication.save();
            return res.status(200).json(existingApplication);
        }

        // Nếu chưa tồn tại, tạo mới
        const newApplication = new Application({
            jobID: jobID,
            candidateID: candidateID,
            applicationStatus: applicationStatus || "active",
            applicationForm: applicationForm || [],
            candidateFeedback: candidateFeedback || []
        });

        await newApplication.save();

        // Tạo thông báo cho employer khi có ứng viên mới apply
        try {
            const job = await Job.findById(jobID);
            const candidate = await User.findById(candidateID);
            
            if (job && candidate && job.employerId) {
                await notifyNewApplication(newApplication, job, candidate);
            }
        } catch (notifError) {
            console.error('Error creating notification for employer:', notifError);
            // Don't fail the request if notification fails
        }

        res.status(201).json(newApplication);
    } catch (error) {
        console.error('Error in addApplication:', error);
        res.status(500).json({ message: error.message });
    }
};

export {addApplication};