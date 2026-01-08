import Job from '../../models/Job.js'
import User from '../../models/User.js'
import uniqid from 'uniqid';
import { notifyNewJobPosted } from '../Notification/createNotification.js';

const addJob = async (req, res) => {
    const { 
        jobTitle, 
        employmentType, 
        location, 
        specificAddress,
        salary, 
        description,
        category,
        level,
        employeeType,
        quantity,
        deadline,
        educationRequirement,
        experienceRequirement,
        genderRequirement,
        jobRequirement,
        benefits,
        applicationForm, 
        applicants 
    } = req.body;
    
    // Lấy employerId từ authenticated user hoặc từ body
    const employerId = req.userId || req.user?._id || req.body.employerId;

    console.log("Data on backend");
    console.log(req.body);

    const job = new Job({
        jobID: uniqid(),
        jobTitle,
        employmentType,
        location,
        specificAddress,
        salary,
        description,
        category,
        level,
        employeeType,
        quantity: quantity || 1,
        deadline: deadline ? new Date(deadline) : undefined,
        educationRequirement,
        experienceRequirement,
        genderRequirement,
        jobRequirement,
        benefits,
        applicationForm,
        applicants,
        employerId: employerId
    });

    try {   
        await job.save();
        
        // Tạo thông báo cho admin khi có job mới được đăng
        try {
            const employer = await User.findById(employerId);
            if (employer) {
                await notifyNewJobPosted(job, employer);
            }
        } catch (notifError) {
            console.error('Error creating notification for admin:', notifError);
            // Don't fail the request if notification fails
        }
        
        res.status(201).json(job);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export {addJob};