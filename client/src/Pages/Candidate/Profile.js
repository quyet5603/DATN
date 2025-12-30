import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../../components/ContextProvider/Context';
import { toast } from 'react-toastify';
import logoURL from '../../assets/img/logo.png';

export const Profile = () => {
    const navigate = useNavigate();
    const { loginData } = useContext(LoginContext);
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Personal Info State
    const [personalInfo, setPersonalInfo] = useState({
        userName: '',
        userEmail: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        description: ''
    });

    useEffect(() => {
        // Check if user is logged in
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('usertoken');
        
        if (!userStr || !token) {
            toast.error('Vui lòng đăng nhập để xem hồ sơ');
            navigate('/login');
            return;
        }

        // Load user data
        const user = JSON.parse(userStr);
        setPersonalInfo({
            userName: user.userName || '',
            userEmail: user.userEmail || '',
            phoneNumber: user.phoneNumber || '',
            dateOfBirth: user.dateOfBirth || '',
            gender: user.gender || '',
            address: user.address || '',
            description: user.description || ''
        });

        // Load avatar if exists
        if (user.avatar) {
            setAvatarPreview(`http://localhost:8080/uploads/${user.avatar}`);
        } else {
            setAvatarPreview(null);
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chọn file ảnh');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước ảnh không được vượt quá 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload avatar
            uploadAvatar(file);
        }
    };

    const uploadAvatar = async (file) => {
        try {
            const token = localStorage.getItem('usertoken');
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const userId = user._id;

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(`http://localhost:8080/users/upload-avatar/${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Cập nhật ảnh đại diện thành công');
                // Update local storage
                const updatedUser = { ...user, avatar: data.avatar };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                toast.error(data.message || 'Có lỗi xảy ra khi upload ảnh');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Có lỗi xảy ra khi upload ảnh');
        }
    };

    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('usertoken');
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const userId = user._id;

            const response = await fetch(`http://localhost:8080/users/update-profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(personalInfo)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Cập nhật thông tin thành công');
                // Update local storage
                const updatedUser = { ...user, ...personalInfo };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                toast.error(data.message || 'Có lỗi xảy ra khi cập nhật');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Có lỗi xảy ra khi cập nhật');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setPersonalInfo({
                userName: user.userName || '',
                userEmail: user.userEmail || '',
                phoneNumber: user.phoneNumber || '',
                dateOfBirth: user.dateOfBirth || '',
                gender: user.gender || '',
                address: user.address || '',
                description: user.description || ''
            });
            toast.info('Đã khôi phục thông tin ban đầu');
        }
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                    {/* Main Content */}
                    <div className='p-8'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-800 mb-6 uppercase'>
                                Thông tin cá nhân
                            </h1>

                                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                                        {/* Form Section */}
                                        <div className='lg:col-span-2 space-y-6'>
                                            {/* Name */}
                                            <div>
                                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                                    <span className='text-red-500'>*</span> Họ và tên
                                                </label>
                                                <input
                                                    type='text'
                                                    name='userName'
                                                    value={personalInfo.userName}
                                                    onChange={handleInputChange}
                                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none'
                                                    required
                                                />
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                                    <span className='text-red-500'>*</span> Email
                                                </label>
                                                <input
                                                    type='email'
                                                    name='userEmail'
                                                    value={personalInfo.userEmail}
                                                    onChange={handleInputChange}
                                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none'
                                                    required
                                                />
                                            </div>

                                            {/* Phone Number */}
                                            <div>
                                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                                    Số điện thoại
                                                </label>
                                                <input
                                                    type='tel'
                                                    name='phoneNumber'
                                                    value={personalInfo.phoneNumber}
                                                    onChange={handleInputChange}
                                                    placeholder='Nhập số điện thoại'
                                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none'
                                                />
                                            </div>

                                            {/* Date of Birth */}
                                            <div>
                                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                                    Ngày sinh
                                                </label>
                                                <div className='relative'>
                                                    <box-icon
                                                        name='calendar'
                                                        size='20px'
                                                        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                                                    ></box-icon>
                                                    <input
                                                        type='date'
                                                        name='dateOfBirth'
                                                        value={personalInfo.dateOfBirth}
                                                        onChange={handleInputChange}
                                                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none'
                                                    />
                                                </div>
                                            </div>

                                            {/* Gender */}
                                            <div>
                                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                                    Giới tính
                                                </label>
                                                <div className='flex gap-4'>
                                                    <button
                                                        type='button'
                                                        onClick={() => setPersonalInfo(prev => ({ ...prev, gender: 'Nam' }))}
                                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                                            personalInfo.gender === 'Nam'
                                                                ? 'bg-secondary text-white'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        Nam
                                                    </button>
                                                    <button
                                                        type='button'
                                                        onClick={() => setPersonalInfo(prev => ({ ...prev, gender: 'Nữ' }))}
                                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                                            personalInfo.gender === 'Nữ'
                                                                ? 'bg-secondary text-white'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        Nữ
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div>
                                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                                    Địa chỉ
                                                </label>
                                                <input
                                                    type='text'
                                                    name='address'
                                                    value={personalInfo.address}
                                                    onChange={handleInputChange}
                                                    placeholder='Nhập địa chỉ'
                                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none'
                                                />
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                                    Mô tả bản thân
                                                </label>
                                                <textarea
                                                    name='description'
                                                    value={personalInfo.description}
                                                    onChange={handleInputChange}
                                                    rows={6}
                                                    placeholder='Giới thiệu về bản thân, kỹ năng, kinh nghiệm...'
                                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none resize-none'
                                                />
                                            </div>

                                            {/* Action Buttons */}
                                            <div className='flex gap-4 pt-4'>
                                                <button
                                                    onClick={handleSaveChanges}
                                                    disabled={loading}
                                                    className='flex-1 bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
                                                >
                                                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                                </button>
                                                <button
                                                    onClick={handleReset}
                                                    className='flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors'
                                                >
                                                    Khôi phục
                                                </button>
                                            </div>
                                        </div>

                                        {/* Avatar Section */}
                                        <div className='lg:col-span-1'>
                                            <div className='sticky top-8'>
                                                <div className='text-center'>
                                                    <div className='relative inline-block mb-4'>
                                                        <div className='w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 mx-auto'>
                                                            {avatarPreview ? (
                                                                <img
                                                                    src={avatarPreview}
                                                                    alt='Avatar'
                                                                    className='w-full h-full object-cover'
                                                                />
                                                            ) : (
                                                                <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                                                                    <box-icon
                                                                        name='user'
                                                                        size='64px'
                                                                        color='#9CA3AF'
                                                                    ></box-icon>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <label className='inline-block bg-secondary text-white px-6 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity'>
                                                        <input
                                                            type='file'
                                                            accept='image/*'
                                                            onChange={handleAvatarUpload}
                                                            className='hidden'
                                                        />
                                                        <div className='flex items-center gap-2'>
                                                            <box-icon name='upload' size='20px' color='#ffffff'></box-icon>
                                                            <span>Tải ảnh đại diện</span>
                                                        </div>
                                                    </label>
                                                    <p className='text-xs text-gray-500 mt-2'>
                                                        JPG, PNG hoặc GIF (tối đa 5MB)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

