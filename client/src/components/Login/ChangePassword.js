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
        <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4'>
            <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='w-full'>
                        <div className='mb-8'>
                            <h1 className='text-2xl font-bold text-gray-800 text-center'>
                                Đổi mật khẩu
                            </h1>
                        </div>

                        <div className='space-y-6 mb-8'>
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
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all'
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
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all'
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
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all'
                                />
                                {errors.confirmPassword && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit button */}
                        <div>
                            <button 
                                type='submit' 
                                disabled={isLoading}
                                className='w-full bg-red-600 text-white text-md font-medium py-3 rounded-md hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

