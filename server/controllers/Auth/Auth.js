import User from '../../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendVerificationEmail } from '../../services/emailService.js'

const register = async (req, res) => {
    try {
        const {
            userName,
            userEmail,
            userPassword,
            gender,
            address,
            role,
            isAssigned,
            applications
        } = req.body;

        const existingUser = await User.findOne({ userEmail });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const hashPassword = await bcrypt.hashSync(userPassword,10)

        // Tạo mã xác thực email 6 chữ số
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Thời gian hết hạn (24 giờ)
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 24);

        const newUser = new User({ 
            userName, 
            userEmail, 
            userPassword: hashPassword, 
            gender, 
            address, 
            role, 
            isAssigned, 
            applications,
            emailVerified: false,
            verificationCode: verificationCode,
            verificationExpires: verificationExpires
        });
        
        await newUser.save();

        // Gửi email xác thực
        try {
            await sendVerificationEmail(userEmail, verificationCode, userName);
            console.log('Verification email sent to:', userEmail);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            console.error('Email error details:', {
                message: emailError.message,
                code: emailError.code
            });
            // Vẫn tạo user thành công, nhưng cảnh báo
            // User có thể yêu cầu gửi lại email verification sau
            // Không throw error để user vẫn được tạo
        }

        res.status(201).json({ 
            success: true,
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
            requiresVerification: true
        });
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const login = async (req, res) => {
    try {
        const { userEmail, userPassword } = req.body;

        const user = await User.findOne({ userEmail });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // const token = generateToken(user);
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); 
        res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
        res.status(200).json({ success: true, message: "Login successful", user, token });
        
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const logout = (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



export { register, login, logout }