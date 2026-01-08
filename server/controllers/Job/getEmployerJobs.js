import Job from '../../models/Job.js'

/**
 * Lấy danh sách jobs của employer đang đăng nhập
 * Yêu cầu authentication và chỉ trả về jobs của employer đó
 */
const getEmployerJobs = async (req, res) => {
    try {
        // Lấy userId từ authenticated user (từ middleware authenticate)
        const employerId = req.userId || req.user?._id;
        
        if (!employerId) {
            return res.status(401).json({ 
                error: 'User not authenticated',
                message: 'Vui lòng đăng nhập để xem danh sách công việc của bạn'
            });
        }

        // Chỉ lấy jobs của employer này
        const jobs = await Job.find({ 
            employerId: employerId 
        }).populate('employerId', 'userName avatar userEmail address');
        
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching employer jobs:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

export { getEmployerJobs };

