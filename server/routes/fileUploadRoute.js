import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import path from 'path';
const router = express.Router();

// router.get('/all-users', getUsers); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/resume/");
    },
    filename: function (req, file, cb) {
        const id = req.params.id;

        // Get the file extension
        const ext = file.originalname.split('.').pop();

        // Construct the filename as id.extension
        const filename = `${id}.${ext}`;

        // Call the callback with null for error and the constructed filename
        cb(null, filename);
    },
});

const upload = multer({ storage: storage });

// File upload route - nhận cả "file" và "resume" để tương thích
router.post("/upload/resume/:id", upload.fields([{ name: 'file', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), async (req, res) => {
    try {
        // Lấy file từ cả 2 field names
        const file = req.files?.file?.[0] || req.files?.resume?.[0];
        
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const userId = req.params.id;
        const filePath = `resume/${file.filename}`;

        // Cập nhật cvFilePath vào User model
        await User.findByIdAndUpdate(userId, {
            $set: {
                cvFilePath: filePath
            }
        });

        console.log(`CV uploaded for user ${userId}: ${filePath}`);

        res.json({
            success: true,
            file: file,
            filePath: filePath,
            message: 'CV uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading CV:', error);
        res.status(500).json({ error: 'Failed to upload CV', message: error.message });
    }
});


export default router;