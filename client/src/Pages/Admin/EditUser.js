import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const EditUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        userName: '',
        userEmail: '',
        userPassword: '',
        status: 'active',
        role: 'candidate'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');

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

            if (userId) {
                fetchUser();
            }
        } catch (error) {
            console.error('Error:', error);
            navigate('/login');
        }
    }, [userId, navigate]);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`${API_BASE_URL}/users/user/${userId}`, {
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('User data from API:', {
                    lastLogin: userData.lastLogin,
                    updatedAt: userData.updatedAt,
                    createdAt: userData.createdAt,
                    lastLoginType: typeof userData.lastLogin
                });
                setUser(userData);
                setFormData({
                    userName: userData.userName || '',
                    userEmail: userData.userEmail || '',
                    userPassword: '',
                    status: userData.status || 'active',
                    role: userData.role || 'candidate'
                });
                
                // Load avatar
                if (userData.avatar) {
                    setAvatarPreview(`${API_BASE_URL.replace('/api', '')}/uploads/${userData.avatar}`);
                }
            } else {
                toast.error('Không tìm thấy người dùng');
                navigate('/admin/users');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Không thể tải thông tin người dùng');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('usertoken');
            
            // First, upload avatar if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('avatar', selectedFile);
                
                const avatarResponse = await fetch(`${API_BASE_URL}/users/upload-avatar/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                    },
                    body: formData
                });
                
                if (!avatarResponse.ok) {
                    toast.error('Lỗi khi upload avatar');
                    return;
                }
            }
            
            // Then, update user data
            const updateData = { ...formData };
            // Only send password if it's not empty
            if (!updateData.userPassword || updateData.userPassword.trim() === '') {
                delete updateData.userPassword;
            }
            
            const response = await fetch(`${API_BASE_URL}/users/update-user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                toast.success('Cập nhật người dùng thành công');
                navigate('/admin/users');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(errorData.message || 'Không thể cập nhật người dùng');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Có lỗi xảy ra khi cập nhật người dùng');
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác!')) {
            return;
        }

        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`${API_BASE_URL}/users/delete-user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Xóa người dùng thành công!');
                navigate('/admin/users');
            } else {
                toast.error('Lỗi khi xóa người dùng!');
            }
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            toast.error('Lỗi khi xóa người dùng!');
        }
    };

    const formatDate = (dateString, userId) => {
        // Nếu có dateString, sử dụng nó
        if (dateString) {
            try {
                // Parse date string (có thể là ISO string hoặc timestamp)
                let date;
                if (typeof dateString === 'string') {
                    // Nếu là ISO string, parse trực tiếp
                    date = new Date(dateString);
                } else if (typeof dateString === 'number') {
                    date = new Date(dateString);
                } else if (dateString instanceof Date) {
                    date = dateString;
                } else if (dateString.$date) {
                    // MongoDB extended JSON format
                    date = new Date(dateString.$date);
                } else {
                    date = new Date(dateString);
                }
                
                if (!isNaN(date.getTime())) {
                    // Sử dụng local time (không phải UTC)
                    // JavaScript Date tự động convert sang local time khi dùng getDate(), getHours(), etc.
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear().toString().slice(-2);
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const seconds = date.getSeconds().toString().padStart(2, '0');
                    
                    const formatted = `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
                    console.log('FormatDate result:', {
                        input: dateString,
                        parsed: date.toISOString(),
                        local: formatted
                    });
                    return formatted;
                } else {
                    console.warn('Invalid date:', dateString, 'parsed as:', date);
                }
            } catch (e) {
                console.error('Error parsing date:', e, 'dateString:', dateString);
            }
        }
        
        // Nếu không có dateString nhưng có userId (MongoDB ObjectId chứa timestamp)
        if (userId && typeof userId === 'string' && userId.length === 24) {
            try {
                // Extract timestamp from MongoDB ObjectId
                const timestamp = parseInt(userId.substring(0, 8), 16) * 1000;
                const date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear().toString().slice(-2);
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const seconds = date.getSeconds().toString().padStart(2, '0');
                    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
                }
            } catch (e) {
                console.error('Error extracting date from ObjectId:', e);
            }
        }
        
        return 'N/A';
    };

    const copyUserId = () => {
        if (user?._id) {
            navigator.clipboard.writeText(user._id);
            toast.success('Đã sao chép User ID');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center py-20 text-gray-500">
                        <p>Không tìm thấy người dùng</p>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa người dùng</h1>
                    <p className="text-gray-600">Cập nhật thông tin người dùng trong hệ thống</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <box-icon name='user' size='48px' color='#9CA3AF'></box-icon>
                                    )}
                                </div>
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                        Đổi
                                    </span>
                                </label>
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">Email</p>
                                <p className="text-sm font-medium text-gray-900">{user.userEmail}</p>
                            </div>

                            {/* User ID */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-2">User ID</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 px-3 py-2 bg-gray-100 rounded text-xs font-mono text-gray-700 truncate">
                                        {user._id}
                                    </div>
                                    <button
                                        onClick={copyUserId}
                                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-xs font-medium"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="space-y-2 border-t border-gray-200 pt-4">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                        activeTab === 'profile'
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <box-icon name='user' size='18px' color='currentColor'></box-icon>
                                    <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <box-icon name='trash' size='18px' color='#DC2626'></box-icon>
                                    <span className="text-sm font-medium">Xóa người dùng</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Main Content */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {/* Thông tin cá nhân */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>
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
                                                placeholder="Để trống nếu không muốn đổi mật khẩu"
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Trạng thái
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="active">Hoạt động</option>
                                            <option value="inactive">Ngừng hoạt động</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Vai trò
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="admin">Administrator</option>
                                            <option value="employer">Company</option>
                                            <option value="candidate">Candidate</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

