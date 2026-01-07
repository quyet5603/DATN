import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const CreateUser = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        userName: '',
        userEmail: '',
        userPassword: '',
        status: 'active',
        role: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(userStr);
            if (userData.role !== 'admin') {
                toast.error('Bạn không có quyền truy cập trang này!');
                navigate('/');
                return;
            }
        } catch (error) {
            console.error('Error:', error);
            navigate('/login');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.userName || !formData.userEmail || !formData.userPassword || !formData.role) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            const token = localStorage.getItem('usertoken');
            
            // Prepare data for API
            const userData = {
                userName: formData.userName,
                userEmail: formData.userEmail,
                userPassword: formData.userPassword,
                gender: 'Khác', // Default value
                address: '', // Default value
                role: formData.role,
                status: formData.status
            };
            
            const response = await fetch(`${API_BASE_URL}/users/add-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                toast.success('Tạo tài khoản thành công!');
                navigate('/admin/users');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(errorData.message || errorData.error || 'Không thể tạo tài khoản');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error('Có lỗi xảy ra khi tạo tài khoản');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <box-icon name='chevron-left' size='20px' color='#4B5563'></box-icon>
                        <span className="font-medium">Quay lại</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h1>
                    <p className="text-gray-600">Thêm tài khoản người dùng mới vào hệ thống</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    placeholder="Nhập họ và tên"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tài khoản email <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="userEmail"
                                    value={formData.userEmail}
                                    onChange={handleInputChange}
                                    placeholder="Nhập email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="userPassword"
                                        value={formData.userPassword}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mật khẩu"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <box-icon 
                                            name={showPassword ? 'hide' : 'show'} 
                                            size='20px' 
                                            color='currentColor'
                                        ></box-icon>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái
                                </label>
                                <div className="relative">
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                                            formData.status === 'active' ? 'pl-8' : ''
                                        }`}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Ngừng hoạt động</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <box-icon name='chevron-down' size='20px' color='#6B7280'></box-icon>
                                    </div>
                                    {formData.status === 'active' && (
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vai trò <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                    >
                                        <option value="">Chọn vai trò</option>
                                        <option value="admin">Administrator</option>
                                        <option value="employer">Company</option>
                                        <option value="candidate">Candidate</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <box-icon name='chevron-down' size='20px' color='#6B7280'></box-icon>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/users')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Tạo mới
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

