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

// Debug endpoint - Get detailed match score analysis
router.get('/match-score-debug/:jobId', authenticate, async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.userId || req.user?._id;
        const CV = (await import('../models/CV.js')).default;
        const User = (await import('../models/User.js')).default;
        const Job = (await import('../models/Job.js')).default;
        const fs = (await import('fs')).default;
        const path = (await import('path')).default;
        const { fileURLToPath } = await import('url');
        
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        const user = await User.findById(userId);
        const job = await Job.findById(jobId);
        const defaultCV = await CV.findOne({ userId, isDefault: true, isActive: true });
        const latestCV = await CV.findOne({ userId, isActive: true }).sort({ updatedAt: -1 });
        
        let cvInfo = {
            found: false,
            source: null,
            filePath: null,
            fileExists: false,
            hasText: false,
            textLength: 0
        };
        
        let cvBuffer = null;
        let cvText = null;
        
        // Check CV from CV Manager
        if (defaultCV || latestCV) {
            const cv = defaultCV || latestCV;
            cvInfo.found = true;
            cvInfo.source = 'CV Manager';
            cvInfo.filePath = cv.cvFilePath;
            
            if (cv.cvFilePath) {
                const fullPath = path.join(__dirname, '../', 'uploads', cv.cvFilePath);
                cvInfo.fileExists = fs.existsSync(fullPath);
                if (cvInfo.fileExists) {
                    cvBuffer = fs.readFileSync(fullPath);
                }
            }
            
            if (cv.cvText) {
                cvInfo.hasText = true;
                cvInfo.textLength = cv.cvText.length;
                cvText = cv.cvText;
            }
        }
        
        // Fallback to User model
        if (!cvInfo.found && user) {
            if (user.cvFilePath) {
                cvInfo.found = true;
                cvInfo.source = 'User Model (Legacy)';
                cvInfo.filePath = user.cvFilePath;
                const fullPath = path.join(__dirname, '../', 'uploads', user.cvFilePath);
                cvInfo.fileExists = fs.existsSync(fullPath);
                if (cvInfo.fileExists) {
                    cvBuffer = fs.readFileSync(fullPath);
                }
            }
            
            if (user.cvText) {
                cvInfo.hasText = true;
                cvInfo.textLength = user.cvText.length;
                cvText = user.cvText;
            }
        }
        
        // Try to analyze if CV found
        let analysisResult = null;
        let analysisError = null;
        
        if (cvBuffer && job) {
            try {
                const { analyzeResume } = await import('../services/ai/resumeMatcherService.js');
                analysisResult = await analyzeResume(
                    cvBuffer,
                    path.basename(cvInfo.filePath || 'resume.pdf'),
                    job.description
                );
            } catch (error) {
                analysisError = {
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                };
            }
        }
        
        res.json({
            success: true,
            debug: {
                userId,
                jobId,
                jobTitle: job?.jobTitle,
                cvInfo,
                jobDescriptionLength: job?.description?.length || 0,
                analysisResult,
                analysisError
            }
        });
    } catch (error) {
        console.error('Debug match score error:', error);
        res.status(500).json({ error: error.message });
    }
});

// CV Improvement
router.get('/improve-cv/:jobId', authenticate, improveCV);

export default router;

