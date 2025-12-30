import User from '../../models/User.js';

/**
 * Cập nhật thông tin hồ sơ người dùng
 */
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, userEmail, phoneNumber, dateOfBirth, gender, address, description } = req.body;

        // Validate required fields
        if (!userName || !userEmail) {
            return res.status(400).json({
                success: false,
                message: 'Họ tên và Email là bắt buộc'
            });
        }

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Check if email is already taken by another user
        if (userEmail !== user.userEmail) {
            const existingUser = await User.findOne({ userEmail });
            if (existingUser && existingUser._id.toString() !== id) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã được sử dụng bởi tài khoản khác'
                });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                userName,
                userEmail,
                phoneNumber,
                dateOfBirth,
                gender,
                address,
                description
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            user: {
                _id: updatedUser._id,
                userName: updatedUser.userName,
                userEmail: updatedUser.userEmail,
                phoneNumber: updatedUser.phoneNumber,
                dateOfBirth: updatedUser.dateOfBirth,
                gender: updatedUser.gender,
                address: updatedUser.address,
                description: updatedUser.description,
                avatar: updatedUser.avatar,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật thông tin',
            error: error.message
        });
    }
};

