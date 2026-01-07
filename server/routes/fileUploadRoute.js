import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import { extractResumeText } from '../services/ai/resumeMatcherService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Đảm bảo thư mục tồn tại
const resumeDir = path.join(__dirname, '../', 'uploads', 'resume');
if (!fs.existsSync(resumeDir)) {
    fs.mkdirSync(resumeDir, { recursive: true });
    console.log(`[Multer] Created directory: ${resumeDir}`);
}

// Sử dụng memoryStorage và tự lưu file để kiểm soát tốt hơn
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// File upload route - TỰ LƯU FILE ĐỂ ĐẢM BẢO CHẮC CHẮN
// Middleware để log mọi request đến route này
router.use('/upload/resume/:id', (req, res, next) => {
    console.log('========================================');
    console.log('[Upload CV Middleware] Request received');
    console.log('[Upload CV Middleware] Method:', req.method);
    console.log('[Upload CV Middleware] URL:', req.url);
    console.log('[Upload CV Middleware] Params:', req.params);
    next();
});

router.post("/upload/resume/:id", upload.fields([{ name: 'file', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), async (req, res) => {
    console.log('========================================');
    console.log('[Upload CV] ===== POST HANDLER CALLED =====');
    console.log('[Upload CV] Method:', req.method);
    console.log('[Upload CV] URL:', req.url);
    console.log('[Upload CV] User ID from params:', req.params.id);
    console.log('[Upload CV] Request files exists:', !!req.files);
    console.log('[Upload CV] Request files keys:', req.files ? Object.keys(req.files) : 'NO FILES');
    if (req.files) {
        console.log('[Upload CV] req.files.file:', req.files.file ? `Array with ${req.files.file.length} items` : 'undefined');
        console.log('[Upload CV] req.files.resume:', req.files.resume ? `Array with ${req.files.resume.length} items` : 'undefined');
    }
    console.log('========================================');
    
    try {
        // Lấy file từ cả 2 field names
        const file = req.files?.file?.[0] || req.files?.resume?.[0];
        
        if (!file) {
            console.error('[Upload CV] ❌ No file received');
            console.error('[Upload CV] Request files object:', req.files);
            console.error('[Upload CV] req.files?.file:', req.files?.file);
            console.error('[Upload CV] req.files?.resume:', req.files?.resume);
            return res.status(400).json({ error: 'No file uploaded. Please check file field name.' });
        }

        const userId = req.params.id;
        if (!userId) {
            console.error('[Upload CV] No user ID provided');
            return res.status(400).json({ error: 'User ID is required' });
        }

        console.log(`[Upload CV] Uploading CV for user ${userId}`);
        console.log(`[Upload CV] File name: ${file.originalname}`);
        console.log(`[Upload CV] File size: ${file.size} bytes`);
        console.log(`[Upload CV] File buffer exists: ${!!file.buffer}`);

        // Đảm bảo thư mục tồn tại
        const resumeDir = path.join(__dirname, '../', 'uploads', 'resume');
        if (!fs.existsSync(resumeDir)) {
            fs.mkdirSync(resumeDir, { recursive: true });
            console.log(`[Upload CV] Created directory: ${resumeDir}`);
        }

        // Tên file: {userId}.pdf
        const filename = `${userId}.pdf`;
        const fullFilePath = path.join(resumeDir, filename);
        const filePath = `resume/${filename}`;

        // LƯU FILE VÀO DISK
        try {
            fs.writeFileSync(fullFilePath, file.buffer);
            console.log(`[Upload CV] ✅ File saved successfully: ${fullFilePath}`);
            
            // Verify file đã được lưu
            if (fs.existsSync(fullFilePath)) {
                const stats = fs.statSync(fullFilePath);
                console.log(`[Upload CV] ✅ File verified - Size: ${stats.size} bytes`);
            } else {
                throw new Error('File was not saved despite writeFileSync');
            }
        } catch (writeError) {
            console.error(`[Upload CV] ❌ Error saving file: ${writeError.message}`);
            console.error(`[Upload CV] Full path: ${fullFilePath}`);
            return res.status(500).json({ 
                error: 'Failed to save file to disk', 
                message: writeError.message 
            });
        }

        // CẬP NHẬT DATABASE - Đơn giản, chỉ lưu cvFilePath
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { cvFilePath: filePath } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            console.error(`[Upload CV] User not found: ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify đã lưu thành công
        console.log(`[Upload CV] Database updated - User ${userId} cvFilePath: ${updatedUser.cvFilePath}`);

        // Extract text từ CV (tùy chọn, không block nếu lỗi)
        let cvText = null;
        try {
            const fileBuffer = fs.readFileSync(fullFilePath);
            cvText = await extractResumeText(fileBuffer, file.originalname);
            
            // Cập nhật cvText nếu extract thành công
            if (cvText) {
                await User.findByIdAndUpdate(userId, { $set: { cvText: cvText } });
                console.log(`[Upload CV] CV text extracted and saved: ${cvText.length} characters`);
            }
        } catch (extractError) {
            console.warn('[Upload CV] Text extraction failed (non-critical):', extractError.message);
            // Không quan trọng, file đã được lưu
        }

        res.json({
            success: true,
            filePath: filePath,
            fileUrl: `http://localhost:8080/uploads/${filePath}`,
            message: 'CV đã được tải lên thành công',
            userId: userId,
            cvFilePath: filePath
        });
    } catch (error) {
        console.error('[Upload CV] Error:', error);
        console.error('[Upload CV] Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to upload CV', 
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Debug endpoint - Kiểm tra CV của user
router.get("/check-cv/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let fileExists = false;
        let fileSize = 0;
        if (user.cvFilePath) {
            const fullPath = path.join(__dirname, '../', 'uploads', user.cvFilePath);
            if (fs.existsSync(fullPath)) {
                fileExists = true;
                const stats = fs.statSync(fullPath);
                fileSize = stats.size;
            }
        }

        res.json({
            userId: userId,
            userName: user.userName,
            cvFilePath: user.cvFilePath,
            cvFileExists: fileExists,
            cvFileSize: fileSize,
            hasCvText: !!user.cvText,
            cvTextLength: user.cvText?.length || 0,
            cvFileUrl: user.cvFilePath ? `http://localhost:8080/uploads/${user.cvFilePath}` : null
        });
    } catch (error) {
        console.error('[Check CV] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;