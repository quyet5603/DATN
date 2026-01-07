import Job from '../../models/Job.js'

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('employerId', 'userName avatar userEmail address');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export {getJobs};