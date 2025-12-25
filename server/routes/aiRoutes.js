import express from 'express';
import multer from 'multer';
import { analyzeCV, extractCVText } from '../controllers/AI/analyzeCV.js';
import { getRecommendedJobs } from '../controllers/AI/matchJobs.js';
import { getMatchedCandidates } from '../controllers/AI/matchCandidates.js';
import { getMatchScore } from '../controllers/AI/getMatchScore.js';
import { improveCV } from '../controllers/AI/improveCV.js';
import { authenticate } from '../middleware/VerifyToken.js';

const router = express.Router();

// Multer config cho CV upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'), false);
    }
  }
});

// CV Analysis
router.post('/analyze-cv/:jobId', authenticate, upload.single('resume'), analyzeCV);
router.post('/extract-cv-text', authenticate, upload.single('resume'), extractCVText);

// Job Matching (cho candidate)
router.get('/recommended-jobs', authenticate, getRecommendedJobs);

// Candidate Matching (cho employer)
router.get('/matched-candidates/:jobId', authenticate, getMatchedCandidates);

// Get match score cho một job cụ thể (cho candidate)
router.get('/match-score/:jobId', authenticate, getMatchScore);

// CV Improvement
router.get('/improve-cv/:jobId', authenticate, improveCV);

export default router;

