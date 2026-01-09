import express from 'express';
import { login, logout, register } from '../controllers/Auth/Auth.js';
// Đã tắt chức năng quên mật khẩu
// import { forgotPassword } from '../controllers/Auth/forgotPassword.js';
// import { resetPassword, verifyResetCode } from '../controllers/Auth/resetPassword.js';
import { changePassword } from '../controllers/Auth/changePassword.js';
import { verifyEmail, resendVerificationEmail } from '../controllers/Auth/verifyEmail.js';
import { authenticate } from '../middleware/VerifyToken.js';
import { googleCallback, googleFailure } from '../controllers/Auth/googleAuth.js';
import passport from '../config/passport.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', login); 
router.post('/logout', logout); 
router.post('/register', register);
// Đã tắt chức năng quên mật khẩu
// router.post('/forgot-password', forgotPassword);
// router.post('/verify-reset-code', verifyResetCode);
// router.post('/reset-password', resetPassword);
router.post('/change-password', authenticate, changePassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);

// Google OAuth routes - chỉ enable nếu có cấu hình
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    router.get('/google', 
        passport.authenticate('google', { 
            scope: ['profile', 'email'] 
        })
    );

    router.get('/google/callback',
        (req, res, next) => {
            console.log('=== GOOGLE CALLBACK ROUTE ===');
            console.log('Query params:', req.query);
            console.log('Error param:', req.query.error);
            if (req.query.error) {
                console.error('Google OAuth error:', req.query.error);
                return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_auth_failed&message=${encodeURIComponent(req.query.error_description || req.query.error)}`);
            }
            next();
        },
        passport.authenticate('google', { 
            failureRedirect: '/auth/google/failure',
            session: false // Không dùng session, dùng JWT token
        }),
        googleCallback
    );

    router.get('/google/failure', googleFailure);
} else {
    // Nếu chưa cấu hình Google OAuth, trả về thông báo
    router.get('/google', (req, res) => {
        res.status(503).json({ 
            error: 'Google OAuth chưa được cấu hình. Vui lòng thêm GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET vào file .env' 
        });
    });
}

router.get('/validuser', authenticate, async (req, res) => {
    try {
        const validuser = await User.findById(req.userId)
        res.status(201).json({status:201, validuser});
    } catch (error) {
        res.status(401).json({status:401, error});
    }
})


export default router;