import express from 'express';
import multer from 'multer';
import { getCVs, uploadCV, deleteCV, setDefaultCV, getDefaultCV } from '../controllers/CV/cvController.js';
import { getCVScore, updateCVScore, getAllCVScores, compareCVScores, analyzeScore } from '../controllers/CV/scoreCVController.js';
import { analyzeAndScoreCV, analyzeAndScoreCVFromFile } from '../controllers/CV/analyzeScoreCV.js';
import { authenticate } from '../middleware/VerifyToken.js';

const router = express.Router();

// Multer config cho CV upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// CV Management Routes
router.get('/list', authenticate, getCVs);
router.post('/upload', authenticate, upload.single('cv'), uploadCV);
router.delete('/delete/:cvId', authenticate, deleteCV);
router.put('/set-default/:cvId', authenticate, setDefaultCV);
router.get('/default', authenticate, getDefaultCV);

// CV Analysis & Scoring Routes
router.post('/analyze-score/:cvId', authenticate, analyzeAndScoreCV);
router.post('/analyze-score-upload', authenticate, upload.single('cv'), analyzeAndScoreCVFromFile);

// CV Scoring Routes
router.get('/score/:cvId', authenticate, getCVScore);
router.put('/score/:cvId', authenticate, updateCVScore);
router.get('/scores/all', authenticate, getAllCVScores);
router.post('/scores/compare', authenticate, compareCVScores);
router.get('/score/:cvId/analyze', authenticate, analyzeScore);

// Debug endpoint - Check CV status for match score
router.get('/debug-status', authenticate, async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const CV = (await import('../models/CV.js')).default;
        const User = (await import('../models/User.js')).default;
        const fs = (await import('fs')).default;
        const path = (await import('path')).default;
        const { fileURLToPath } = await import('url');
        
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        
        const user = await User.findById(userId);
        const defaultCV = await CV.findOne({ userId, isDefault: true, isActive: true });
        const latestCV = await CV.findOne({ userId, isActive: true }).sort({ updatedAt: -1 });
        
        let cvFileExists = false;
        let cvFilePath = null;
        if (defaultCV?.cvFilePath || latestCV?.cvFilePath) {
            cvFilePath = defaultCV?.cvFilePath || latestCV?.cvFilePath;
            const fullPath = path.join(__dirname, '../', 'uploads', cvFilePath);
            cvFileExists = fs.existsSync(fullPath);
        } else if (user?.cvFilePath) {
            cvFilePath = user.cvFilePath;
            const fullPath = path.join(__dirname, '../', 'uploads', cvFilePath);
            cvFileExists = fs.existsSync(fullPath);
        }
        
        res.json({
            userId,
            hasUser: !!user,
            hasDefaultCV: !!defaultCV,
            hasLatestCV: !!latestCV,
            defaultCV: defaultCV ? {
                _id: defaultCV._id,
                cvName: defaultCV.cvName,
                cvFilePath: defaultCV.cvFilePath,
                hasCvText: !!defaultCV.cvText,
                isDefault: defaultCV.isDefault,
                isActive: defaultCV.isActive
            } : null,
            latestCV: latestCV ? {
                _id: latestCV._id,
                cvName: latestCV.cvName,
                cvFilePath: latestCV.cvFilePath,
                hasCvText: !!latestCV.cvText,
                isDefault: latestCV.isDefault
            } : null,
            userCV: {
                cvFilePath: user?.cvFilePath,
                hasCvText: !!user?.cvText,
                cvScore: user?.cvScore
            },
            cvFileExists,
            cvFilePath,
            canCalculateMatchScore: !!(defaultCV || latestCV || user?.cvText || user?.cvFilePath)
        });
    } catch (error) {
        console.error('Debug CV status error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;

