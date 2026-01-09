import Job from '../../models/Job.js'
import mongoose from 'mongoose';

const getJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        
        // Try to find by _id (ObjectId) first, then by jobID (String)
        let job = null;
        
        // Check if jobId is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(jobId)) {
            job = await Job.findById(jobId).populate('employerId', 'userName avatar userEmail address phoneNumber description companyTitle companyDescription website companyLocations companySize companyType industry country establishedYear workingHours companyIntroduction');
        }
        
        // If not found by _id, try to find by jobID field
        if (!job) {
            job = await Job.findOne({ jobID: jobId }).populate('employerId', 'userName avatar userEmail address phoneNumber description companyTitle companyDescription website companyLocations companySize companyType industry country establishedYear workingHours companyIntroduction');
        }
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        console.error('Error in getJob:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export {getJob};