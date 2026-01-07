import User from '../../models/User.js';
import { sendVerificationEmail } from '../../services/emailService.js';

/**
 * Controller: Xác thực email khi đăng ký
 */
export const verifyEmail = async (req, res) => {
    try {
        const { userEmail, verificationCode } = req.body;

        console.log('=== VERIFY EMAIL REQUEST ===');
        console.log('Email:', userEmail);
        console.log('Code:', verificationCode);

        // Kiểm tra các trường bắt buộc
        if (!userEmail || !verificationCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vui lòng nhập email và mã xác nhận' 
            });
        }

        // Tìm user theo email
        const user = await User.findOne({ userEmail });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'Không tìm thấy tài khoản với email này' 
            });
        }

        // Kiểm tra email đã được xác thực chưa
        if (user.emailVerified) {
            return res.status(200).json({ 
                success: true, 
                message: 'Email đã được xác thực trước đó' 
            });
        }

        // Kiểm tra mã xác thực có tồn tại không
        if (!user.verificationCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' 
            });
        }

        // Kiểm tra mã xác thực có khớp không
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mã xác nhận không đúng' 
            });
        }

        // Kiểm tra mã xác thực có hết hạn không
        if (!user.verificationExpires || new Date() > user.verificationExpires) {
            // Xóa mã đã hết hạn
            user.verificationCode = null;
            user.verificationExpires = null;
            await user.save();
            
            return res.status(400).json({ 
                success: false, 
                error: 'Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.' 
            });
        }

        // Mã hợp lệ, xác thực email
        user.emailVerified = true;
        user.verificationCode = null;
        user.verificationExpires = null;
        await user.save();

        console.log('Email verified successfully for:', userEmail);

        return res.status(200).json({ 
            success: true, 
            message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.' 
        });

    } catch (error) {
        console.error('Error in verifyEmail:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        res.status(500).json({ 
            success: false, 
            error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
            details: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
};

/**
 * Controller: Gửi lại email xác thực
 */
export const resendVerificationEmail = async (req, res) => {
    try {
        const { userEmail } = req.body;

        if (!userEmail) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vui lòng nhập email' 
            });
        }

        // Tìm user
        const user = await User.findOne({ userEmail });
        
        if (!user) {
            // Không tiết lộ thông tin user có tồn tại hay không (bảo mật)
            return res.status(200).json({ 
                success: true, 
                message: 'Nếu email tồn tại trong hệ thống, email xác thực đã được gửi.' 
            });
        }

        // Kiểm tra email đã được xác thực chưa
        if (user.emailVerified) {
            return res.status(200).json({ 
                success: true, 
                message: 'Email đã được xác thực. Bạn có thể đăng nhập ngay.' 
            });
        }

        // Tạo mã xác thực mới
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 24);

        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;
        await user.save();

        // Gửi email xác thực
        try {
            await sendVerificationEmail(userEmail, verificationCode, user.userName);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.' 
            });
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            console.error('Email error details:', {
                message: emailError.message,
                code: emailError.code,
                response: emailError.response
            });
            
            // Kiểm tra nếu là lỗi authentication
            if (emailError.code === 'EAUTH' || emailError.message?.includes('BadCredentials')) {
                // Xóa mã nếu gửi email thất bại
                user.verificationCode = null;
                user.verificationExpires = null;
                await user.save();
                
                return res.status(500).json({ 
                    success: false, 
                    error: 'Cấu hình email không đúng. Vui lòng liên hệ quản trị viên.',
                    details: process.env.NODE_ENV !== 'production' ? 'Kiểm tra EMAIL_USER và EMAIL_PASS trong file .env' : undefined
                });
            }
            
            // Xóa mã nếu gửi email thất bại
            user.verificationCode = null;
            user.verificationExpires = null;
            await user.save();
            
            return res.status(500).json({ 
                success: false, 
                error: emailError.message || 'Không thể gửi email. Vui lòng thử lại sau.',
                details: process.env.NODE_ENV !== 'production' ? emailError.message : undefined
            });
        }

    } catch (error) {
        console.error('Error in resendVerificationEmail:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' 
        });
    }
};

