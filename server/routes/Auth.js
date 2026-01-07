import express from 'express';
import { login, logout, register } from '../controllers/Auth/Auth.js';
// Đã tắt chức năng quên mật khẩu
// import { forgotPassword } from '../controllers/Auth/forgotPassword.js';
// import { resetPassword, verifyResetCode } from '../controllers/Auth/resetPassword.js';
import { changePassword } from '../controllers/Auth/changePassword.js';
import { verifyEmail, resendVerificationEmail } from '../controllers/Auth/verifyEmail.js';
import { authenticate } from '../middleware/VerifyToken.js';
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

router.get('/validuser', authenticate, async (req, res) => {
    try {
        const validuser = await User.findById(req.userId)
        res.status(201).json({status:201, validuser});
    } catch (error) {
        res.status(401).json({status:401, error});
    }
})


export default router;