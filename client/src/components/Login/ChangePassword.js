import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const ChangePassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm();

    const newPassword = watch('newPassword');

    const onSubmit = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsLoading(true);
        
        try {
            const token = localStorage.getItem('usertoken');
            
            if (!token) {
                toast.error("Vui lòng đăng nhập");
                navigate('/login');
                return;
            }

            const response = await fetch("http://localhost:8080/auth/change-password", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword
                })
            });

            const result = await response.json();
            
            console.log('Change password response:', response.status, result); // Debug log
            
            // Kiểm tra status code
            if (!response.ok) {
                // Lỗi từ server (401, 400, 500, etc.)
                const errorMessage = result.error || result.message || `Lỗi ${response.status}: ${response.statusText}`;
                toast.error(errorMessage);
                console.error('Change password error:', result);
                
                // Nếu là lỗi authentication, redirect về login
                if (response.status === 401) {
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                }
                return;
            }
            
            // Success
            if (result.success) {
                toast.success(result.message || "Đổi mật khẩu thành công");
                setTimeout(() => {
                    navigate('/profile');
                }, 1500);
            } else {
                // Response OK nhưng success = false
                const errorMessage = result.error || result.message || "Đã xảy ra lỗi. Vui lòng thử lại";
                toast.error(errorMessage);
                console.error('Change password error:', result);
            }
        } catch (error) {
            console.error('Network error:', error);
            toast.error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='max-w-scren-2xl w-full md:w-2/5 lg:w-1/3 container mt-8 mb-8 mx-auto px-4'>
            <div className='bg-[#e7e7e7] mx-auto py-8 px-6 md:px-12 rounded-lg shadow-lg'>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='w-full'>
                        <div className='mb-6'>
                            <h1 className='text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2'>
                                Đổi mật khẩu
                            </h1>
                            <p className='text-sm text-gray-600 text-center'>
                                Nhập mật khẩu hiện tại và mật khẩu mới
                            </p>
                        </div>

                        <div className='space-y-4 mb-6'>
                            {/* Current Password */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>
                                    Mật khẩu hiện tại
                                </label>
                                <input 
                                    type='password' 
                                    required 
                                    {...register("currentPassword", {
                                        required: "Vui lòng nhập mật khẩu hiện tại"
                                    })} 
                                    placeholder='Nhập mật khẩu hiện tại' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm'
                                />
                                {errors.currentPassword && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.currentPassword.message}</p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>
                                    Mật khẩu mới
                                </label>
                                <input 
                                    type='password' 
                                    required 
                                    {...register("newPassword", {
                                        required: "Vui lòng nhập mật khẩu mới",
                                        minLength: {
                                            value: 6,
                                            message: "Mật khẩu phải có ít nhất 6 ký tự"
                                        }
                                    })} 
                                    placeholder='Nhập mật khẩu mới' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm'
                                />
                                {errors.newPassword && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.newPassword.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>
                                    Xác nhận mật khẩu mới
                                </label>
                                <input 
                                    type='password' 
                                    required 
                                    {...register("confirmPassword", {
                                        required: "Vui lòng xác nhận mật khẩu",
                                        validate: value => 
                                            value === newPassword || "Mật khẩu xác nhận không khớp"
                                    })} 
                                    placeholder='Nhập lại mật khẩu mới' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm'
                                />
                                {errors.confirmPassword && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit button */}
                        <div className='mb-4'>
                            <button 
                                type='submit' 
                                disabled={isLoading}
                                className='w-full bg-secondary text-white text-md font-medium py-3 rounded-md hover:opacity-90 transition-opacity shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className='text-center pt-4 border-t border-gray-300'>
                    <Link to='/profile'>
                        <p className='text-sm text-gray-600 hover:text-primary hover:underline transition-colors'>
                            Quay lại hồ sơ
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

