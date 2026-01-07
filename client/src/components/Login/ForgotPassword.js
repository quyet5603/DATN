import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        
        try {
            const response = await fetch("http://localhost:8080/auth/forgot-password", {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message || "Mã xác nhận đã được gửi đến email của bạn");
                setEmailSent(true);
                // Chuyển đến trang reset password với email
                setTimeout(() => {
                    navigate(`/reset-password?email=${encodeURIComponent(data.userEmail)}`);
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
                
                {!emailSent ? (
                    <>
                        {/* FORM */}
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className='w-full'>
                                <div className='mb-6'>
                                    <h1 className='text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2'>
                                        Quên mật khẩu
                                    </h1>
                                    <p className='text-sm text-gray-600 text-center'>
                                        Nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu
                                    </p>
                                </div>

                                <div className='space-y-4 mb-6'>
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
                                        />
                                        {errors.userEmail && (
                                            <p className='text-red-500 text-xs mt-1'>{errors.userEmail.message}</p>
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
                                        {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className='text-center py-4'>
                        <div className='mb-4'>
                            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4'>
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className='text-xl font-semibold text-gray-800 mb-2'>Email đã được gửi!</h2>
                            <p className='text-sm text-gray-600'>
                                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
                            </p>
                        </div>
                    </div>
                )}

                <div className='text-center pt-4 border-t border-gray-300'>
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

















