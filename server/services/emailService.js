import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Kiểm tra cấu hình email
const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;

// Cấu hình transporter cho Gmail (chỉ tạo nếu có config)
let transporter = null;

if (hasEmailConfig) {
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log('Email transporter created successfully');
    } catch (error) {
        console.error('Error creating email transporter:', error);
        transporter = null;
    }
} else {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not configured. Email service will not work.');
    console.warn('   Please configure email in .env file (see HUONG_DAN_CAU_HINH_EMAIL.md)');
}

/**
 * Gửi email chứa mã xác nhận reset password
 * @param {string} email - Email người nhận
 * @param {string} resetCode - Mã xác nhận (6 chữ số)
 * @returns {Promise} - Promise với kết quả gửi email
 */
export const sendResetPasswordEmail = async (email, resetCode) => {
    try {
        // Kiểm tra transporter có sẵn không
        if (!transporter) {
            throw new Error('Email service chưa được cấu hình. Vui lòng cấu hình EMAIL_USER và EMAIL_PASS trong file .env');
        }

        // Kiểm tra email config
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email chưa được cấu hình. Vui lòng xem file HUONG_DAN_CAU_HINH_EMAIL.md');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã xác nhận đặt lại mật khẩu - Hệ thống Tuyển dụng',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Đặt lại mật khẩu</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Chào bạn,
                        </p>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                            Vui lòng sử dụng mã xác nhận bên dưới để tiếp tục:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background-color: #4A90E2; color: #ffffff; padding: 15px 40px; border-radius: 5px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
                                ${resetCode}
                            </div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; line-height: 1.6;">
                            <strong>Lưu ý:</strong>
                        </p>
                        <ul style="color: #666; font-size: 14px; line-height: 1.8;">
                            <li>Mã xác nhận có hiệu lực trong vòng <strong>15 phút</strong></li>
                            <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                            <li>Không chia sẻ mã xác nhận này cho bất kỳ ai</li>
                        </ul>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                            Email này được gửi tự động, vui lòng không trả lời email này.
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
    }
};

/**
 * Kiểm tra cấu hình email
 */
/**
 * Gửi email xác thực khi đăng ký
 * @param {string} email - Email người nhận
 * @param {string} verificationCode - Mã xác nhận (6 chữ số)
 * @param {string} userName - Tên người dùng
 * @returns {Promise} - Promise với kết quả gửi email
 */
export const sendVerificationEmail = async (email, verificationCode, userName = 'Bạn') => {
    try {
        // Kiểm tra transporter có sẵn không
        if (!transporter) {
            throw new Error('Email service chưa được cấu hình. Vui lòng cấu hình EMAIL_USER và EMAIL_PASS trong file .env');
        }

        // Kiểm tra email config
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email chưa được cấu hình. Vui lòng xem file HUONG_DAN_CAU_HINH_EMAIL.md');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Xác thực email - Hệ thống Tuyển dụng',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Xác thực email</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Chào ${userName},
                        </p>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Cảm ơn bạn đã đăng ký tài khoản trên hệ thống Tuyển dụng. 
                            Để hoàn tất đăng ký, vui lòng sử dụng mã xác nhận bên dưới:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background-color: #50C878; color: #ffffff; padding: 15px 40px; border-radius: 5px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
                                ${verificationCode}
                            </div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; line-height: 1.6;">
                            <strong>Lưu ý:</strong>
                        </p>
                        <ul style="color: #666; font-size: 14px; line-height: 1.8;">
                            <li>Mã xác nhận có hiệu lực trong vòng <strong>24 giờ</strong></li>
                            <li>Nhập mã này vào trang xác thực để kích hoạt tài khoản</li>
                            <li>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?email=${encodeURIComponent(email)}&code=${verificationCode}" 
                               style="display: inline-block; background-color: #50C878; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Xác thực email ngay
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                            Email này được gửi tự động, vui lòng không trả lời email này.
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Không thể gửi email xác thực. Vui lòng thử lại sau.');
    }
};

export const verifyEmailConfig = async () => {
    try {
        if (!transporter) {
            console.error('Email transporter not initialized');
            return false;
        }
        await transporter.verify();
        console.log('Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('Email configuration error:', error);
        return false;
    }
};

