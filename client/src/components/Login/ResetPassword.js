import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [codeVerified, setCodeVerified] = useState(false);
    const emailFromUrl = searchParams.get('email') || '';

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm({
        defaultValues: {
            userEmail: emailFromUrl,
            resetCode: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    const newPassword = watch('newPassword');

    // Verify code first
    const handleVerifyCode = async (data) => {
        setIsVerifying(true);
        
        try {
            const response = await fetch("http://localhost:8080/auth/verify-reset-code", {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    userEmail: data.userEmail,
                    resetCode: data.resetCode
                })
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success("Mã xác nhận hợp lệ");
                setCodeVerified(true);
            } else {
                toast.error(result.error || "Mã xác nhận không đúng");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Đã xảy ra lỗi. Vui lòng thử lại");
        } finally {
            setIsVerifying(false);
        }
    };

    // Reset password
    const onSubmit = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch("http://localhost:8080/auth/reset-password", {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    userEmail: data.userEmail,
                    resetCode: data.resetCode,
                    newPassword: data.newPassword
                })
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message || "Đặt lại mật khẩu thành công");
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                toast.error(result.error || "Đã xảy ra lỗi. Vui lòng thử lại");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='max-w-scren-2xl w-full md:w-2/5 lg:w-1/3 container mt-8 mb-8 mx-auto px-4'>
            <div className='bg-[#e7e7e7] mx-auto py-8 px-6 md:px-12 rounded-lg shadow-lg'>
                
                <form onSubmit={handleSubmit(codeVerified ? onSubmit : handleVerifyCode)}>
                    <div className='w-full'>
                        <div className='mb-6'>
                            <h1 className='text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2'>
                                Đặt lại mật khẩu
                            </h1>
                            <p className='text-sm text-gray-600 text-center'>
                                {codeVerified 
                                    ? "Nhập mật khẩu mới của bạn"
                                    : "Nhập mã xác nhận đã được gửi đến email của bạn"
                                }
                            </p>
                        </div>

                        <div className='space-y-4 mb-6'>
                            {/* Email field */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>
                                    Email
                                </label>
                                <input 
                                    type='email' 
                                    required 
                                    {...register("userEmail", {
                                        required: "Vui lòng nhập email",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Email không hợp lệ"
                                        }
                                    })} 
                                    placeholder='VD: nguyenvana@gmail.com' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm'
                                    readOnly={!!emailFromUrl}
                                />
                                {errors.userEmail && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.userEmail.message}</p>
                                )}
                            </div>

                            {/* Reset code field */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>
                                    Mã xác nhận
                                </label>
                                <input 
                                    type='text' 
                                    required 
                                    {...register("resetCode", {
                                        required: "Vui lòng nhập mã xác nhận",
                                        pattern: {
                                            value: /^\d{6}$/,
                                            message: "Mã xác nhận phải là 6 chữ số"
                                        }
                                    })} 
                                    placeholder='Nhập 6 chữ số' 
                                    maxLength={6}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm text-center text-2xl tracking-widest'
                                    readOnly={codeVerified}
                                />
                                {errors.resetCode && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.resetCode.message}</p>
                                )}
                            </div>

                            {/* Show password fields only after code is verified */}
                            {codeVerified && (
                                <>
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
                                </>
                            )}
                        </div>

                        {/* Submit button */}
                        <div className='mb-4'>
                            <button 
                                type='submit' 
                                disabled={isLoading || isVerifying}
                                className='w-full bg-secondary text-white text-md font-medium py-3 rounded-md hover:opacity-90 transition-opacity shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {isVerifying ? 'Đang xác thực...' : 
                                 isLoading ? 'Đang xử lý...' : 
                                 codeVerified ? 'Đặt lại mật khẩu' : 'Xác thực mã'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className='text-center pt-4 border-t border-gray-300 space-y-2'>
                    <Link to='/forgot-password'>
                        <p className='text-sm text-gray-600 hover:text-primary hover:underline transition-colors'>
                            Gửi lại mã xác nhận
                        </p>
                    </Link>
                    <Link to='/login'>
                        <p className='text-sm text-gray-600 hover:text-primary hover:underline transition-colors'>
                            Quay lại đăng nhập
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

















