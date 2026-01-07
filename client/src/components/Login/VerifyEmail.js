import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export const VerifyEmail = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [verified, setVerified] = useState(false);
    
    const emailFromUrl = searchParams.get('email') || '';
    const codeFromUrl = searchParams.get('code') || '';

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm({
        defaultValues: {
            userEmail: emailFromUrl,
            verificationCode: codeFromUrl
        }
    });

    // Auto-fill từ URL nếu có
    useEffect(() => {
        if (emailFromUrl) {
            setValue('userEmail', emailFromUrl);
        }
        if (codeFromUrl) {
            setValue('verificationCode', codeFromUrl);
            // Tự động verify nếu có code trong URL
            if (emailFromUrl && codeFromUrl) {
                handleAutoVerify(emailFromUrl, codeFromUrl);
            }
        }
    }, [emailFromUrl, codeFromUrl, setValue]);

    const handleAutoVerify = async (email, code) => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/auth/verify-email", {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ userEmail: email, verificationCode: code })
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message || "Xác thực email thành công!");
                setVerified(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error(result.error || "Mã xác nhận không đúng hoặc đã hết hạn");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Đã xảy ra lỗi. Vui lòng thử lại");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        
        try {
            const response = await fetch("http://localhost:8080/auth/verify-email", {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message || "Xác thực email thành công!");
                setVerified(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error(result.error || "Mã xác nhận không đúng hoặc đã hết hạn");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendEmail = async (email) => {
        if (!email) {
            toast.error("Vui lòng nhập email");
            return;
        }

        setIsResending(true);
        try {
            const response = await fetch("http://localhost:8080/auth/resend-verification-email", {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ userEmail: email })
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message || "Email xác thực đã được gửi lại!");
            } else {
                toast.error(result.error || "Không thể gửi lại email");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Đã xảy ra lỗi. Vui lòng thử lại");
        } finally {
            setIsResending(false);
        }
    };

    if (verified) {
        return (
            <div className='max-w-scren-2xl w-full md:w-2/5 lg:w-1/3 container mt-8 mb-8 mx-auto px-4'>
                <div className='bg-[#e7e7e7] mx-auto py-8 px-6 md:px-12 rounded-lg shadow-lg text-center'>
                    <div className='mb-4'>
                        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4'>
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className='text-xl font-semibold text-gray-800 mb-2'>Xác thực thành công!</h2>
                        <p className='text-sm text-gray-600 mb-4'>
                            Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.
                        </p>
                        <Link to='/login' className='inline-block bg-secondary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity'>
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='max-w-scren-2xl w-full md:w-2/5 lg:w-1/3 container mt-8 mb-8 mx-auto px-4'>
            <div className='bg-[#e7e7e7] mx-auto py-8 px-6 md:px-12 rounded-lg shadow-lg'>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='w-full'>
                        <div className='mb-6'>
                            <h1 className='text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2'>
                                Xác thực email
                            </h1>
                            <p className='text-sm text-gray-600 text-center'>
                                Nhập mã xác nhận đã được gửi đến email của bạn
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

                            {/* Verification code field */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>
                                    Mã xác nhận
                                </label>
                                <input 
                                    type='text' 
                                    required 
                                    {...register("verificationCode", {
                                        required: "Vui lòng nhập mã xác nhận",
                                        pattern: {
                                            value: /^\d{6}$/,
                                            message: "Mã xác nhận phải là 6 chữ số"
                                        }
                                    })} 
                                    placeholder='Nhập 6 chữ số' 
                                    maxLength={6}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm text-center text-2xl tracking-widest'
                                />
                                {errors.verificationCode && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.verificationCode.message}</p>
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
                                {isLoading ? 'Đang xác thực...' : 'Xác thực email'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className='text-center pt-4 border-t border-gray-300 space-y-2'>
                    <button
                        onClick={() => {
                            const email = document.querySelector('input[name="userEmail"]')?.value || emailFromUrl;
                            handleResendEmail(email);
                        }}
                        disabled={isResending}
                        className='text-sm text-primary hover:underline disabled:opacity-50'
                    >
                        {isResending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                    </button>
                    <div>
                        <Link to='/login'>
                            <p className='text-sm text-gray-600 hover:text-primary hover:underline transition-colors'>
                                Quay lại đăng nhập
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

















