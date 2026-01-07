import cvScoringService from '../../services/ai/cvScoringService.js';
import CV from '../../models/CV.js';

/**
 * Lấy điểm của một CV
 */
export const getCVScore = async (req, res) => {
    try {
        const { cvId } = req.params;
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Kiểm tra CV có thuộc về user không
        const cv = await CV.findOne({ _id: cvId, userId });
        if (!cv) {
            return res.status(404).json({ error: 'CV not found or you do not have permission' });
        }

        const scoreData = await cvScoringService.getCVScore(cvId);

        res.json({
            success: true,
            data: scoreData
        });
    } catch (error) {
        console.error('Error getting CV score:', error);
        res.status(500).json({ 
            error: 'Failed to get CV score', 
            message: error.message 
        });
    }
};

/**
 * Cập nhật điểm cho một CV
 */
export const updateCVScore = async (req, res) => {
    try {
        const { cvId } = req.params;
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Kiểm tra CV có thuộc về user không
        const cv = await CV.findOne({ _id: cvId, userId });
        if (!cv) {
            return res.status(404).json({ error: 'CV not found or you do not have permission' });
        }

        const scoreData = await cvScoringService.updateCVScore(cvId);

        res.json({
            success: true,
            message: 'CV score updated successfully',
            data: scoreData
        });
    } catch (error) {
        console.error('Error updating CV score:', error);
        res.status(500).json({ 
            error: 'Failed to update CV score', 
            message: error.message 
        });
    }
};

/**
 * Lấy điểm tất cả CV của user
 */
export const getAllCVScores = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const results = await cvScoringService.updateAllUserCVScores(userId);

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('Error getting all CV scores:', error);
        res.status(500).json({ 
            error: 'Failed to get CV scores', 
            message: error.message 
        });
    }
};

/**
 * So sánh điểm giữa nhiều CV
 */
export const compareCVScores = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { cvIds } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!cvIds || !Array.isArray(cvIds) || cvIds.length === 0) {
            return res.status(400).json({ error: 'CV IDs array is required' });
        }

        // Kiểm tra tất cả CV có thuộc về user không
        const cvs = await CV.find({ _id: { $in: cvIds }, userId });
        if (cvs.length !== cvIds.length) {
            return res.status(404).json({ 
                error: 'Some CVs not found or you do not have permission' 
            });
        }

        const comparison = await cvScoringService.compareCVScores(cvIds);

        res.json({
            success: true,
            data: comparison
        });
    } catch (error) {
        console.error('Error comparing CV scores:', error);
        res.status(500).json({ 
            error: 'Failed to compare CV scores', 
            message: error.message 
        });
    }
};

/**
 * Phân tích chi tiết điểm CV
 */
export const analyzeScore = async (req, res) => {
    try {
        const { cvId } = req.params;
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Kiểm tra CV có thuộc về user không
        const cv = await CV.findOne({ _id: cvId, userId });
        if (!cv) {
            return res.status(404).json({ error: 'CV not found or you do not have permission' });
        }

        // Tính toán điểm chi tiết
        const scoreData = cvScoringService.calculateCVScore(cv.cvAnalysis || {});

        res.json({
            success: true,
            data: {
                cvId: cv._id,
                cvName: cv.cvName,
                currentScore: cv.cvScore,
                analysis: {
                    totalScore: scoreData.totalScore,
                    grade: scoreData.grade,
                    breakdown: scoreData.breakdown,
                    recommendations: scoreData.recommendation
                },
                cvAnalysis: {
                    skills: cv.cvAnalysis?.skills || [],
                    experience: cv.cvAnalysis?.experience || '',
                    education: cv.cvAnalysis?.education || '',
                    strengths: cv.cvAnalysis?.strengths || [],
                    weaknesses: cv.cvAnalysis?.weaknesses || []
                }
            }
        });
    } catch (error) {
        console.error('Error analyzing CV score:', error);
        res.status(500).json({ 
            error: 'Failed to analyze CV score', 
            message: error.message 
        });
    }
};
