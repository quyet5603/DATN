import multer from 'multer';
import path from 'path';
import User from '../../models/User.js';
import fs from 'fs';

// Configure multer for avatar upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/avatars/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const userId = req.params.id;
        const ext = path.extname(file.originalname);
        const filename = `${userId}${ext}`;
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: fileFilter,
});

// Middleware for single file upload
export const uploadAvatarMiddleware = upload.single('avatar');

/**
 * Upload avatar cho user
 */
export const uploadAvatar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            // Delete uploaded file if user doesn't exist
            if (req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Delete old avatar if exists
        if (user.avatar) {
            const oldAvatarPath = path.join('uploads/avatars', path.basename(user.avatar));
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Save avatar path to database
        const avatarPath = `avatars/${req.file.filename}`;
        const updatedUser = await User.findByIdAndUpdate(id, { avatar: avatarPath }, { new: true });

        res.json({
            success: true,
            message: 'Upload ảnh đại diện thành công',
            avatar: avatarPath,
            user: {
                _id: updatedUser._id,
                userName: updatedUser.userName,
                userEmail: updatedUser.userEmail,
                avatar: updatedUser.avatar
            }
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        
        // Delete uploaded file if there's an error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi upload ảnh đại diện',
            error: error.message
        });
    }
};

