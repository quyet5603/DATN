import User from '../../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// TẠM THỜI BỎ IMPORT EMAIL SERVICE
// import { sendVerificationEmail } from '../../services/emailService.js'

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

        // Cho phép đăng ký bằng bất kỳ email nào (không có hạn chế domain)
        // Accepts any email format: gmail, yahoo, hotmail, company emails, etc.
        
        // Normalize email: trim whitespace and convert to lowercase
        const normalizedEmail = userEmail.trim().toLowerCase();
        
        // Check if user already exists (case-insensitive search)
        const existingUser = await User.findOne({ 
            userEmail: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
        }) || await User.findOne({ userEmail: normalizedEmail });
        
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const hashPassword = await bcrypt.hashSync(userPassword,10)

        // TẠM THỜI BỎ XÁC THỰC EMAIL - để test hệ thống
        // TODO: Bật lại xác thực email sau khi fix lỗi
        
        const newUser = new User({ 
            userName, 
            userEmail: normalizedEmail, // Store normalized email
            userPassword: hashPassword, 
            gender, 
            address, 
            role, 
            isAssigned, 
            applications,
            emailVerified: true, // Tạm thời set true để bỏ qua xác thực
            verificationCode: null,
            verificationExpires: null
        });
        
        await newUser.save();

        // TẠM THỜI BỎ GỬI EMAIL XÁC THỰC
        // Gửi email xác thực
        // try {
        //     await sendVerificationEmail(userEmail, verificationCode, userName);
        //     console.log('Verification email sent to:', userEmail);
        // } catch (emailError) {
        //     console.error('Error sending verification email:', emailError);
        // }

        res.status(201).json({ 
            success: true,
            message: 'Đăng ký thành công!',
            requiresVerification: false // Tạm thời bỏ xác thực
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

        // Validate input
        if (!userEmail || !userPassword) {
            return res.status(400).json({ error: 'Email và mật khẩu không được để trống' });
        }

        // Normalize email: trim whitespace and convert to lowercase for consistent lookup
        const normalizedEmail = userEmail.trim().toLowerCase();

        console.log('=== LOGIN ATTEMPT ===');
        console.log('Original email:', userEmail);
        console.log('Normalized email:', normalizedEmail);

        // Find user by normalized email
        const user = await User.findOne({ 
            userEmail: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
        });

        // Also try direct lookup in case regex doesn't work
        const userDirect = await User.findOne({ userEmail: normalizedEmail });
        const userFound = user || userDirect;

        if (!userFound) {
            console.log('User not found with email:', normalizedEmail);
            // Debug: List all emails in database (first 5)
            const allUsers = await User.find({}, 'userEmail').limit(5);
            console.log('Sample users in database:', allUsers.map(u => u.userEmail));
            return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        console.log('User found:', userFound.userEmail);

        const isPasswordValid = await bcrypt.compare(userPassword, userFound.userPassword);

        if (!isPasswordValid) {
            console.log('Invalid password for user:', userFound.userEmail);
            return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        // Update lastLogin timestamp (non-blocking - don't fail login if this fails)
        try {
            userFound.lastLogin = new Date();
            await userFound.save();
            console.log('Updated lastLogin for user:', userFound.userEmail);
        } catch (updateError) {
            // Log error but don't fail the login
            console.error('Error updating lastLogin (non-critical):', updateError);
        }

        // const token = generateToken(user);
        const token = jwt.sign({ userId: userFound._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); 
        res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
        
        // Convert user to plain object to avoid issues with Mongoose document
        const userObject = userFound.toObject ? userFound.toObject() : userFound;
        res.status(200).json({ success: true, message: "Login successful", user: userObject, token });
        
    }
    catch (error) {
        console.error('Error logging in user:', error);
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