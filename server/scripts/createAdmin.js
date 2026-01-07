/**
 * Script để tạo tài khoản admin đầu tiên
 * 
 * Cách sử dụng:
 * 1. Chạy: node server/scripts/createAdmin.js
 * 2. Hoặc import vào file khác và gọi hàm createAdmin()
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import connectDB from '../config/connectDB.js';

dotenv.config();

/**
 * Tạo tài khoản admin
 * @param {Object} adminData - Thông tin admin
 * @param {string} adminData.userName - Tên admin
 * @param {string} adminData.userEmail - Email admin
 * @param {string} adminData.userPassword - Mật khẩu admin
 * @param {string} adminData.gender - Giới tính
 * @param {string} adminData.address - Địa chỉ
 */
const createAdmin = async (adminData = {}) => {
    try {
        // Kết nối database
        connectDB();
        
        // Đợi kết nối database
        await new Promise((resolve, reject) => {
            if (mongoose.connection.readyState === 1) {
                resolve();
            } else {
                mongoose.connection.once('connected', resolve);
                mongoose.connection.once('error', reject);
                setTimeout(() => reject(new Error('Connection timeout')), 5000);
            }
        });
        
        console.log('✅ Đã kết nối database');

        // Dữ liệu mặc định
        const defaultAdmin = {
            userName: adminData.userName || 'Admin',
            userEmail: adminData.userEmail || 'admin@example.com',
            userPassword: adminData.userPassword || 'admin123',
            gender: adminData.gender || 'other',
            address: adminData.address || 'Admin Address',
            role: 'admin',
            emailVerified: true
        };

        // Kiểm tra xem đã có admin chưa
        const existingAdmin = await User.findOne({ 
            role: 'admin',
            userEmail: defaultAdmin.userEmail 
        });

        if (existingAdmin) {
            console.log('⚠️  Admin đã tồn tại với email:', defaultAdmin.userEmail);
            console.log('   Bạn có muốn cập nhật mật khẩu không? (Y/N)');
            return existingAdmin;
        }

        // Hash password
        const hashPassword = await bcrypt.hashSync(defaultAdmin.userPassword, 10);

        // Tạo admin mới
        const newAdmin = new User({
            ...defaultAdmin,
            userPassword: hashPassword
        });

        await newAdmin.save();

        console.log('✅ Đã tạo tài khoản admin thành công!');
        console.log('📧 Email:', defaultAdmin.userEmail);
        console.log('🔑 Password:', defaultAdmin.userPassword);
        console.log('⚠️  Hãy đổi mật khẩu sau khi đăng nhập!');

        return newAdmin;
    } catch (error) {
        console.error('❌ Lỗi khi tạo admin:', error);
        throw error;
    }
};

// Chạy script nếu được gọi trực tiếp
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('createAdmin.js')) {
    createAdmin()
        .then(() => {
            console.log('✅ Hoàn thành!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Lỗi:', error);
            process.exit(1);
        });
}

export default createAdmin;
