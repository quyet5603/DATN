import CV from '../../models/CV.js';
import User from '../../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractResumeText } from '../../services/ai/resumeMatcherService.js';
import cvScoringService from '../../services/ai/cvScoringService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lấy danh sách CVs của user
 */
export const getCVs = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const cvs = await CV.find({ userId, isActive: true })
            .sort({ isDefault: -1, updatedAt: -1 });

        res.json({
            success: true,
            cvs: cvs
        });
    } catch (error) {
        console.error('Error getting CVs:', error);
        res.status(500).json({ error: 'Failed to get CVs', message: error.message });
    }
};

/**
 * Tải CV lên
 */
export const uploadCV = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { cvName, isDefault } = req.body;
        
        if (!cvName || !cvName.trim()) {
            return res.status(400).json({ error: 'CV name is required' });
        }

        // Đảm bảo thư mục tồn tại
        const resumeDir = path.join(__dirname, '../../', 'uploads', 'resume');
        if (!fs.existsSync(resumeDir)) {
            fs.mkdirSync(resumeDir, { recursive: true });
        }

        // Tạo unique filename
        const timestamp = Date.now();
        const filename = `cv_${userId}_${timestamp}.pdf`;
        const fullFilePath = path.join(resumeDir, filename);
        const filePath = `resume/${filename}`;

        // Lưu file vào disk
        fs.writeFileSync(fullFilePath, file.buffer);
        console.log(`[Upload CV] File saved: ${fullFilePath}`);

        // Extract text từ CV
        let cvText = null;
        try {
            cvText = await extractResumeText(file.buffer, file.originalname);
            console.log(`[Upload CV] Text extracted: ${cvText.length} characters`);
        } catch (extractError) {
            console.warn('[Upload CV] Text extraction failed:', extractError.message);
        }

        // Kiểm tra xem user đã có CV nào chưa
        const existingCVs = await CV.countDocuments({ userId, isActive: true });
        const shouldBeDefault = isDefault === 'true' || isDefault === true || existingCVs === 0;

        // Nếu set default hoặc đây là CV đầu tiên, bỏ default của các CV khác
        if (shouldBeDefault) {
            await CV.updateMany(
                { userId, isDefault: true },
                { $set: { isDefault: false } }
            );
            console.log(`[Upload CV] Setting CV as default (isDefault=${isDefault}, existingCVs=${existingCVs})`);
        }

        // Tạo CV mới
        const newCV = new CV({
            userId,
            cvName: cvName.trim(),
            cvFilePath: filePath,
            cvText: cvText,
            isDefault: shouldBeDefault
        });

        await newCV.save();
        console.log(`[Upload CV] CV saved to database: ${newCV._id}, isDefault: ${newCV.isDefault}`);

        // Cập nhật User với CV mặc định nếu cần
        if (newCV.isDefault) {
            await User.findByIdAndUpdate(userId, {
                $set: {
                    cvFilePath: filePath,
                    cvText: cvText
                }
            });
            console.log(`[Upload CV] User ${userId} updated with default CV`);
        }

        res.json({
            success: true,
            cv: newCV,
            message: 'CV đã được tải lên thành công'
        });
    } catch (error) {
        console.error('Error uploading CV:', error);
        res.status(500).json({ error: 'Failed to upload CV', message: error.message });
    }
};

/**
 * Xóa CV
 */
export const deleteCV = async (req, res) => {
    try {
        const { cvId } = req.params;
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const cv = await CV.findOne({ _id: cvId, userId });
        if (!cv) {
            return res.status(404).json({ error: 'CV not found' });
        }

        // Xóa file từ disk
        try {
            const fullPath = path.join(__dirname, '../../', 'uploads', cv.cvFilePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log(`[Delete CV] File deleted: ${fullPath}`);
            }
        } catch (fileError) {
            console.warn('[Delete CV] Error deleting file:', fileError.message);
        }

        // Xóa CV khỏi database (soft delete)
        await CV.findByIdAndUpdate(cvId, { $set: { isActive: false } });

        res.json({
            success: true,
            message: 'CV đã được xóa thành công'
        });
    } catch (error) {
        console.error('Error deleting CV:', error);
        res.status(500).json({ error: 'Failed to delete CV', message: error.message });
    }
};

/**
 * Đặt CV làm mặc định
 */
export const setDefaultCV = async (req, res) => {
    try {
        const { cvId } = req.params;
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const cv = await CV.findOne({ _id: cvId, userId });
        if (!cv) {
            return res.status(404).json({ error: 'CV not found' });
        }

        // Bỏ default của các CV khác
        await CV.updateMany(
            { userId, isDefault: true },
            { $set: { isDefault: false } }
        );

        // Đặt CV này làm default
        cv.isDefault = true;
        await cv.save();

        // Cập nhật User với CV mặc định
        await User.findByIdAndUpdate(userId, {
            $set: {
                cvFilePath: cv.cvFilePath,
                cvText: cv.cvText
            }
        });

        res.json({
            success: true,
            message: 'Đã đặt CV làm mặc định',
            cv: cv
        });
    } catch (error) {
        console.error('Error setting default CV:', error);
        res.status(500).json({ error: 'Failed to set default CV', message: error.message });
    }
};

/**
 * Lấy CV mặc định của user
 */
export const getDefaultCV = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const defaultCV = await CV.findOne({ userId, isDefault: true, isActive: true });
        
        if (!defaultCV) {
            // Nếu không có default, lấy CV mới nhất
            const latestCV = await CV.findOne({ userId, isActive: true })
                .sort({ updatedAt: -1 });
            
            return res.json({
                success: true,
                cv: latestCV || null,
                hasDefault: false
            });
        }

        res.json({
            success: true,
            cv: defaultCV,
            hasDefault: true
        });
    } catch (error) {
        console.error('Error getting default CV:', error);
        res.status(500).json({ error: 'Failed to get default CV', message: error.message });
    }
};

/**
 * Lấy danh sách CVs của candidate (cho employer xem)
 * Employer có thể xem CVs của candidate thông qua application
 */
export const getCandidateCVs = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const userId = req.userId || req.user?._id; // Employer ID
        
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Verify user is employer or admin
        const user = await User.findById(userId);
        if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
            return res.status(403).json({ error: 'Only employers and admins can view candidate CVs' });
        }

        // Get CVs from CV collection
        const cvs = await CV.find({ userId: candidateId, isActive: true })
            .sort({ isDefault: -1, updatedAt: -1 });

        // Also check if candidate has CV in User model (legacy)
        const candidate = await User.findById(candidateId);
        const uploadedCVs = [...cvs];
        
        if (candidate?.cvFilePath && !cvs.find(cv => cv.cvFilePath === candidate.cvFilePath)) {
            uploadedCVs.push({
                _id: 'user-legacy-cv',
                userId: candidateId,
                cvName: candidate.cvTitle || 'CV',
                cvFilePath: candidate.cvFilePath,
                isDefault: true,
                isActive: true,
                uploadedAt: candidate.updatedAt || new Date()
            });
        }

        res.json({
            success: true,
            cvs: uploadedCVs
        });
    } catch (error) {
        console.error('Error getting candidate CVs:', error);
        res.status(500).json({ error: 'Failed to get candidate CVs', message: error.message });
    }
};

