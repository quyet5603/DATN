import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Controller: Đổi mật khẩu khi đã đăng nhập
 */
export const changePassword = async (req, res) => {
    try {
        const userId = req.userId; // Từ auth middleware
        
        console.log('Change password - userId:', userId, 'Type:', typeof userId);
        
        // Kiểm tra userId có tồn tại không (từ middleware)
        if (!userId) {
            console.error('Change password - No userId found');
            return res.status(401).json({ 
                success: false, 
                error: 'Không xác thực được người dùng. Vui lòng đăng nhập lại.' 
            });
        }
        
        const { currentPassword, newPassword } = req.body;
        
        console.log('Change password request:', { 
            userId, 
            hasCurrentPassword: !!currentPassword, 
            hasNewPassword: !!newPassword,
            newPasswordLength: newPassword?.length 
        });

        // Kiểm tra các trường bắt buộc
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vui lòng điền đầy đủ thông tin' 
            });
        }

        // Kiểm tra độ dài mật khẩu mới
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
            });
        }

        // Tìm user
        let user;
        try {
            user = await User.findById(userId);
            console.log('Change password - User found:', !!user);
        } catch (dbError) {
            console.error('Change password - Database error finding user:', dbError);
            return res.status(500).json({ 
                success: false, 
                error: 'Lỗi kết nối database. Vui lòng thử lại sau.' 
            });
        }
        
        if (!user) {
            console.error('Change password - User not found for userId:', userId);
            return res.status(404).json({ 
                success: false, 
                error: 'Không tìm thấy tài khoản' 
            });
        }

        // Kiểm tra user có mật khẩu không
        if (!user.userPassword) {
            console.error('Change password - User has no password set');
            return res.status(400).json({ 
                success: false, 
                error: 'Tài khoản chưa có mật khẩu. Vui lòng sử dụng chức năng quên mật khẩu.' 
            });
        }

        // Kiểm tra mật khẩu hiện tại
        let isCurrentPasswordValid;
        try {
            isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.userPassword);
            console.log('Change password - Current password valid:', isCurrentPasswordValid);
        } catch (bcryptError) {
            console.error('Change password - Bcrypt compare error:', bcryptError);
            return res.status(500).json({ 
                success: false, 
                error: 'Lỗi xác thực mật khẩu. Vui lòng thử lại.' 
            });
        }
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mật khẩu hiện tại không đúng' 
            });
        }

        // Kiểm tra mật khẩu mới có khác mật khẩu cũ không
        const isSamePassword = await bcrypt.compare(newPassword, user.userPassword);
        if (isSamePassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mật khẩu mới phải khác mật khẩu cũ' 
            });
        }

        // Hash mật khẩu mới
        let hashPassword;
        try {
            hashPassword = await bcrypt.hash(newPassword, 10);
            console.log('Change password - Password hashed successfully');
        } catch (hashError) {
            console.error('Change password - Bcrypt hash error:', hashError);
            return res.status(500).json({ 
                success: false, 
                error: 'Lỗi mã hóa mật khẩu. Vui lòng thử lại.' 
            });
        }

        // Lưu mật khẩu mới
        try {
            // Sử dụng findByIdAndUpdate để tránh validation issues
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { userPassword: hashPassword },
                { new: true, runValidators: false } // Tắt validators để tránh lỗi
            );
            
            if (!updatedUser) {
                console.error('Change password - Failed to update user');
                return res.status(500).json({ 
                    success: false, 
                    error: 'Không thể cập nhật mật khẩu. Vui lòng thử lại sau.' 
                });
            }
            
            console.log('Change password - Password saved successfully');
        } catch (saveError) {
            console.error('Change password - Save error:', saveError);
            console.error('Save error details:', {
                name: saveError.name,
                message: saveError.message,
                code: saveError.code
            });
            return res.status(500).json({ 
                success: false, 
                error: 'Lỗi lưu mật khẩu. Vui lòng thử lại sau.',
                details: process.env.NODE_ENV !== 'production' ? saveError.message : undefined
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Đổi mật khẩu thành công' 
        });

    } catch (error) {
        console.error('Error in changePassword - Unexpected error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Trả về thông tin chi tiết hơn trong development
        const errorResponse = { 
            success: false, 
            error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
        };
        
        // Trong development, thêm chi tiết lỗi
        if (process.env.NODE_ENV !== 'production') {
            errorResponse.details = {
                message: error.message,
                name: error.name,
                stack: error.stack
            };
        }
        
        res.status(500).json(errorResponse);
    }
};

