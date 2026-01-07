/**
 * CLI Script để tạo admin từ command line
 * 
 * Cách sử dụng:
 * node server/scripts/createAdminCLI.js
 * 
 * Hoặc với tham số:
 * node server/scripts/createAdminCLI.js --email admin@example.com --password admin123 --name "Admin Name"
 */

import dotenv from 'dotenv';
import createAdmin from './createAdmin.js';

dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const adminData = {};

for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    
    if (key && value) {
        switch (key) {
            case 'email':
                adminData.userEmail = value;
                break;
            case 'password':
                adminData.userPassword = value;
                break;
            case 'name':
                adminData.userName = value;
                break;
            case 'gender':
                adminData.gender = value;
                break;
            case 'address':
                adminData.address = value;
                break;
        }
    }
}

// Chạy script
createAdmin(adminData)
    .then((admin) => {
        if (admin) {
            console.log('\n🎉 Tài khoản admin đã sẵn sàng!');
            console.log('📝 Bạn có thể đăng nhập với thông tin trên.\n');
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Lỗi:', error.message);
        process.exit(1);
    });




