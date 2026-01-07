import User from '../../models/User.js'
import bcrypt from 'bcryptjs';

const addUser = async (req, res) => {
    try {
        const { userName, userEmail, userPassword, gender, address, role, status } = req.body;
        
        // Validate required fields
        if (!userName || !userEmail || !userPassword || !role) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
            });
        }

        // Normalize email
        const normalizedEmail = userEmail.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({ 
            userEmail: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
        }) || await User.findOne({ userEmail: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Email đã tồn tại trong hệ thống' 
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(userPassword, 10);

        // Create new user
        const newUser = new User({
            userName,
            userEmail: normalizedEmail,
            userPassword: hashPassword,
            gender: gender || 'Khác',
            address: address || '',
            role: role || 'candidate',
            status: status || 'active',
            emailVerified: true // Admin-created users are auto-verified
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản thành công',
            user: newUser
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Lỗi khi tạo tài khoản' 
        });
    }
};

export {addUser};