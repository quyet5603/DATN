import User from '../../models/User.js'
import bcrypt from 'bcryptjs';

const updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const { userName, userEmail, userPassword, status, role } = req.body;

        const user = await User.findById(id);
        
        if(!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        // Update các field nếu có
        if (userName !== undefined) user.userName = userName;
        if (userEmail !== undefined) user.userEmail = userEmail;
        if (status !== undefined) user.status = status;
        if (role !== undefined) user.role = role;
        if (userPassword !== undefined && userPassword.trim() !== '') {
            // Hash password nếu có thay đổi
            const salt = await bcrypt.genSalt(10);
            user.userPassword = await bcrypt.hash(userPassword, salt);
        }
        
        await user.save();
        res.status(200).json({
            success: true, 
            message: 'Cập nhật người dùng thành công',
            data: user
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

export {updateUser};