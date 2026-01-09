import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import { notifyNewUserRegistered } from '../Notification/createNotification.js';

/**
 * Google OAuth callback handler
 * Tạo hoặc đăng nhập user từ Google
 */
export const googleCallback = async (req, res) => {
    try {
        console.log('=== GOOGLE OAUTH CALLBACK ===');
        console.log('req.user:', req.user);
        console.log('req.query:', req.query);
        console.log('req.params:', req.params);

        // Kiểm tra xem req.user có tồn tại không
        if (!req.user) {
            console.error('req.user is undefined - authentication may have failed');
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_auth_failed&message=Không thể xác thực với Google`);
        }

        const { id, email, name, picture } = req.user;

        console.log('Google ID:', id);
        console.log('Email from Google:', email);
        console.log('Name:', name);

        if (!email) {
            console.error('No email from Google');
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=no_email`);
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();
        console.log('Normalized email:', normalizedEmail);

        // Tìm user theo Google ID trước (nếu đã từng đăng nhập bằng Google)
        let user = await User.findOne({ googleId: id });
        console.log('User found by Google ID:', user ? 'YES' : 'NO');
        
        // Nếu không tìm thấy bằng Google ID, tìm bằng email (case-insensitive)
        if (!user) {
            console.log('User not found by Google ID, searching by email...');
            console.log('Searching for email:', normalizedEmail);
            
            // Thử nhiều cách tìm user
            // Cách 1: Tìm chính xác với normalized email
            user = await User.findOne({ userEmail: normalizedEmail });
            console.log('Method 1 - Exact match with normalized:', user ? 'FOUND' : 'NOT FOUND');
            
            // Cách 2: Tìm tất cả user và so sánh trong memory (để tránh vấn đề với format email)
            if (!user) {
                console.log('Method 2 - Searching all users in memory...');
                const allUsers = await User.find({ userEmail: { $exists: true, $ne: null } });
                console.log(`Total users with email: ${allUsers.length}`);
                
                // Log tất cả email để debug
                console.log('All emails in DB:');
                allUsers.forEach((u, index) => {
                    const dbEmail = (u.userEmail || '').trim().toLowerCase();
                    const match = dbEmail === normalizedEmail;
                    console.log(`  [${index}] "${u.userEmail}" -> normalized: "${dbEmail}" -> match: ${match}`);
                    if (match && !user) {
                        user = u;
                        console.log(`  *** MATCH FOUND at index ${index}! ***`);
                    }
                });
            }
            
            // Cách 3: Regex search (case-insensitive)
            if (!user) {
                console.log('Method 3 - Trying regex search...');
                const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                user = await User.findOne({ 
                    userEmail: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
                });
                console.log('Regex search result:', user ? 'FOUND' : 'NOT FOUND');
            }
        }

        console.log('User found:', user ? 'YES' : 'NO');
        if (user) {
            console.log('User email in DB:', user.userEmail);
            console.log('User ID:', user._id);
            // Nếu email trong DB chưa normalize, normalize nó
            if (user.userEmail !== normalizedEmail) {
                console.log('Normalizing email in database...');
                user.userEmail = normalizedEmail;
                await user.save();
            }
        }

        if (user) {
            // Clean up applications không hợp lệ (thiếu jobId) trước khi save
            if (user.applications && Array.isArray(user.applications)) {
                const validApplications = user.applications.filter(app => app && app.jobId);
                if (validApplications.length !== user.applications.length) {
                    console.log(`Cleaning up invalid applications: ${user.applications.length} -> ${validApplications.length}`);
                    user.applications = validApplications;
                }
            }

            // User đã tồn tại - cập nhật Google ID nếu chưa có
            if (!user.googleId) {
                user.googleId = id;
                user.provider = 'google';
                if (picture && !user.avatar) {
                    user.avatar = picture;
                }
            }

            // Cập nhật lastLogin
            user.lastLogin = new Date();
            
            // Save user với validation
            try {
                await user.save();
                console.log('User saved successfully');
            } catch (saveError) {
                console.error('Error saving user:', saveError);
                // Nếu vẫn lỗi validation, thử update trực tiếp mà không validate
                if (saveError.name === 'ValidationError') {
                    console.log('Validation error, trying direct update...');
                    await User.updateOne(
                        { _id: user._id },
                        {
                            $set: {
                                googleId: user.googleId || id,
                                provider: user.provider || 'google',
                                lastLogin: new Date(),
                                ...(picture && !user.avatar ? { avatar: picture } : {})
                            }
                        }
                    );
                    // Reload user sau khi update
                    user = await User.findById(user._id);
                    console.log('User updated directly, reloaded');
                } else {
                    throw saveError;
                }
            }
        } else {
            // User chưa tồn tại - KHÔNG tự động tạo tài khoản
            // Yêu cầu user phải đăng ký trước khi có thể đăng nhập bằng Google
            console.log('User not found - redirecting to register page');
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=user_not_registered&message=Tài khoản chưa được đăng ký. Vui lòng đăng ký trước khi sử dụng đăng nhập bằng Google.`);
        }

        // Tạo JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('JWT token created');

        // Convert user to plain object
        const userObject = user.toObject ? user.toObject() : user;
        console.log('User object prepared');

        // Redirect về frontend với token và user data
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const redirectUrl = `${clientUrl}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userObject))}`;
        console.log('Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);

    } catch (error) {
        console.error('=== ERROR IN GOOGLE CALLBACK ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=server_error&message=${encodeURIComponent(error.message)}`);
    }
};

/**
 * Google OAuth failure handler
 */
export const googleFailure = (req, res) => {
    console.error('=== GOOGLE OAUTH FAILURE ===');
    console.error('Query:', req.query);
    console.error('Error:', req.query.error);
    console.error('Error description:', req.query.error_description);
    const errorMessage = req.query.error_description || req.query.error || 'Đăng nhập bằng Google thất bại';
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_auth_failed&message=${encodeURIComponent(errorMessage)}`);
};
