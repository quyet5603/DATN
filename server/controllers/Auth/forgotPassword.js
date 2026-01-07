import User from '../../models/User.js';
import { sendResetPasswordEmail } from '../../services/emailService.js';

/**
 * Controller: Gửi mã xác nhận reset password qua email
 */
export const forgotPassword = async (req, res) => {
    try {
        console.log('=== FORGOT PASSWORD REQUEST ===');
        console.log('Request body:', req.body);
        
        const { userEmail } = req.body;

        // Kiểm tra email có được cung cấp không
        if (!userEmail) {
            console.log('Error: No email provided');
            return res.status(400).json({ 
                success: false, 
                error: 'Vui lòng nhập email' 
            });
        }
        
        // Normalize email: trim whitespace and convert to lowercase
        const normalizedEmail = userEmail.trim().toLowerCase();
        console.log('Processing forgot password for email:', normalizedEmail);

        // Tìm user theo email (case-insensitive search)
        console.log('Looking for user with email:', normalizedEmail);
        const user = await User.findOne({ 
            userEmail: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
        }) || await User.findOne({ userEmail: normalizedEmail });
        console.log('User found:', !!user);
        
        // Không tiết lộ thông tin user có tồn tại hay không (bảo mật)
        // Luôn trả về thành công dù user có tồn tại hay không
        if (!user) {
            console.log('User not found, returning success message (security)');
            return res.status(200).json({ 
                success: true, 
                message: 'Nếu email tồn tại trong hệ thống, mã xác nhận đã được gửi đến email của bạn' 
            });
        }

        // Tạo mã xác nhận 6 chữ số
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated reset code:', resetCode);
        
        // Lưu mã vào database với thời gian hết hạn (15 phút)
        const resetPasswordExpires = new Date();
        resetPasswordExpires.setMinutes(resetPasswordExpires.getMinutes() + 15);
        console.log('Reset code expires at:', resetPasswordExpires);

        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = resetPasswordExpires;
        
        try {
            await user.save();
            console.log('Reset code saved to database successfully');
        } catch (saveError) {
            console.error('Error saving reset code to database:', saveError);
            throw saveError;
        }

        // Gửi email chứa mã xác nhận (sử dụng email từ user trong database để đảm bảo đúng format)
        try {
            await sendResetPasswordEmail(user.userEmail, resetCode);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.' 
            });
        } catch (emailError) {
            console.error('Error sending reset password email:', emailError);
            console.error('Email error details:', {
                message: emailError.message,
                name: emailError.name
            });
            
            // Kiểm tra xem email service có được cấu hình không
            const isEmailNotConfigured = 
                !process.env.EMAIL_USER || 
                !process.env.EMAIL_PASS ||
                (emailError.message && (
                    emailError.message.includes('chưa được cấu hình') ||
                    emailError.message.includes('not configured') ||
                    emailError.message.includes('Email service')
                ));
            
            // Nếu email chưa được cấu hình, trong development mode, trả về mã trong response
            if (isEmailNotConfigured && process.env.NODE_ENV !== 'production') {
                console.log('⚠️  EMAIL NOT CONFIGURED - Development mode:');
                console.log('⚠️  Reset code for', user.userEmail, ':', resetCode);
                console.log('⚠️  Please configure EMAIL_USER and EMAIL_PASS in .env file');
                console.log('⚠️  Using reset code from response or database for testing');
                
                // Giữ mã trong database để có thể test
                return res.status(200).json({ 
                    success: true, 
                    message: 'Email chưa được cấu hình. Mã xác nhận đã được tạo. Xem response hoặc server logs để lấy mã.',
                    // CHỈ TRONG DEVELOPMENT - XÓA TRONG PRODUCTION!
                    resetCode: resetCode,
                    warning: 'Email service chưa được cấu hình. Trong development mode, mã reset được trả về trong response để test.'
                });
            }
            
            // Nếu gửi email thất bại và KHÔNG phải development mode
            // Trong production, không tiết lộ mã reset
            if (process.env.NODE_ENV === 'production') {
                // Xóa mã reset đã lưu để đảm bảo bảo mật
                user.resetPasswordCode = null;
                user.resetPasswordExpires = null;
                await user.save();
            }
            
            // Trả về lỗi cụ thể hơn
            const errorMessage = emailError.message || 'Không thể gửi email. Vui lòng thử lại sau.';
            
            return res.status(500).json({ 
                success: false, 
                error: errorMessage,
                details: process.env.NODE_ENV !== 'production' ? emailError.message : undefined
            });
        }

    } catch (error) {
        console.error('Error in forgotPassword:', error);
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

