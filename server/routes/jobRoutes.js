import express from 'express';
import Job from '../models/Job.js';
import { authenticate } from '../middleware/VerifyToken.js';
import { requireAdmin, requireAdminOrOwner } from '../middleware/authorize.js';

const router = express.Router();

import {getJobs} from '../controllers/Job/getJobs.js';
import {getEmployerJobs} from '../controllers/Job/getEmployerJobs.js';
import {getJob } from '../controllers/Job/getJob.js';
import {addJob} from '../controllers/Job/addJob.js';
import { deleteJob } from '../controllers/Job/deleteJob.js';
import { updateJob } from '../controllers/Job/updateJob.js';
import { updateJobByCandidate } from '../controllers/Job/updateJobByCandidate.js';

router.get('/all-jobs', getJobs); // Public - ai cũng có thể xem jobs (cho candidate)
router.get('/employer-jobs', authenticate, getEmployerJobs); // Chỉ employer xem jobs của mình
router.post('/post-job', authenticate, addJob); // Employer có thể đăng job
router.get('/current-job/:id', getJob); // Public

// Admin có thể xóa bất kỳ job nào, employer chỉ xóa được job của mình
router.delete('/delete-job/:id', authenticate, requireAdminOrOwner(async (req) => {
    const job = await Job.findById(req.params.id);
    return job?.employerId;
}), deleteJob); 

// Admin có thể update bất kỳ job nào, employer chỉ update được job của mình
router.put('/update-job/:id', authenticate, requireAdminOrOwner(async (req) => {
    const job = await Job.findById(req.params.id);
    return job?.employerId;
}), updateJob);

router.put('/update-job-by-candidate/', updateJobByCandidate);


export default router;