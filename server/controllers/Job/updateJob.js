import Job from '../../models/Job.js'

const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
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

        const updateData = {};
        if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
        if (employmentType !== undefined) updateData.employmentType = employmentType;
        if (location !== undefined) updateData.location = location;
        if (specificAddress !== undefined) updateData.specificAddress = specificAddress;
        if (salary !== undefined) updateData.salary = salary;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (level !== undefined) updateData.level = level;
        if (employeeType !== undefined) updateData.employeeType = employeeType;
        if (quantity !== undefined) updateData.quantity = quantity;
        if (deadline !== undefined) updateData.deadline = deadline;
        if (educationRequirement !== undefined) updateData.educationRequirement = educationRequirement;
        if (experienceRequirement !== undefined) updateData.experienceRequirement = experienceRequirement;
        if (genderRequirement !== undefined) updateData.genderRequirement = genderRequirement;
        if (jobRequirement !== undefined) updateData.jobRequirement = jobRequirement;
        if (benefits !== undefined) updateData.benefits = benefits;
        if (applicationForm !== undefined) updateData.applicationForm = applicationForm;
        if (applicants !== undefined) updateData.applicants = applicants;

        const updatedJob = await Job.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật tin tuyển dụng thành công",
            job: updatedJob
        });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message 
        });
    }
}

export { updateJob };