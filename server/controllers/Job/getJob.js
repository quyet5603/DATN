import Job from '../../models/Job.js'

const getJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate('employerId', 'userName avatar userEmail address phoneNumber description companyTitle companyDescription website companyLocations companySize companyType industry country establishedYear workingHours companyIntroduction');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export {getJob};