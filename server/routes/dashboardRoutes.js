import express from 'express';
import { getCandidateStats } from '../controllers/Dashboard/getCandidateStats.js';
import { getEmployerStats } from '../controllers/Dashboard/getEmployerStats.js';
import { authenticate } from '../middleware/VerifyToken.js';

const router = express.Router();

// Candidate dashboard stats
router.get('/candidate/:candidateId', authenticate, getCandidateStats);

// Employer dashboard stats
router.get('/employer/:employerId', authenticate, getEmployerStats);

export default router;

