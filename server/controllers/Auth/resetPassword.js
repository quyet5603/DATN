import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Controller: Xác thực mã reset và đặt lại mật khẩu mới
 */
export const resetPassword = async (req, res) => {
    try {
        const { userEmail, resetCode, newPassword } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!userEmail || !resetCode || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vui lòng điền đầy đủ thông tin' 
            });
        }

        // Kiểm tra độ dài mật khẩu mới
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mật khẩu phải có ít nhất 6 ký tự' 
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

        // Kiểm tra mã reset có tồn tại không
        if (!user.resetPasswordCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' 
            });
        }

        // Kiểm tra mã reset có khớp không
        if (user.resetPasswordCode !== resetCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mã xác nhận không đúng' 
            });
        }

        // Kiểm tra mã reset có hết hạn không
        if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
            // Xóa mã reset đã hết hạn
            user.resetPasswordCode = null;
            user.resetPasswordExpires = null;
            await user.save();
            
            return res.status(400).json({ 
                success: false, 
                error: 'Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.' 
            });
        }

        // Mã hợp lệ, tiến hành đổi mật khẩu
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.userPassword = hashPassword;
        user.resetPasswordCode = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({ 
            success: true, 
            message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.' 
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' 
        });
    }
};

/**
 * Controller: Xác thực mã reset (verify code trước khi cho phép reset password)
 */
export const verifyResetCode = async (req, res) => {
    try {
        const { userEmail, resetCode } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!userEmail || !resetCode) {
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

        // Kiểm tra mã reset có tồn tại không
        if (!user.resetPasswordCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' 
            });
        }

        // Kiểm tra mã reset có khớp không
        if (user.resetPasswordCode !== resetCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mã xác nhận không đúng' 
            });
        }

        // Kiểm tra mã reset có hết hạn không
        if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
            // Xóa mã reset đã hết hạn
            user.resetPasswordCode = null;
            user.resetPasswordExpires = null;
            await user.save();
            
            return res.status(400).json({ 
                success: false, 
                error: 'Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.' 
            });
        }

        // Mã hợp lệ
        return res.status(200).json({ 
            success: true, 
            message: 'Mã xác nhận hợp lệ' 
        });

    } catch (error) {
        console.error('Error in verifyResetCode:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' 
        });
    }
};

















