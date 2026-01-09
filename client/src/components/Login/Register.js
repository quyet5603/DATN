import React from 'react'
import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import API_BASE_URL from '../../config/api';
import 'boxicons';

export const Register = () => {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            userName: "",
            userEmail: "",
            userPassword: "",
            gender: "",
            address: "",
            role: "",
            isAssigned: false,
            applications: []
        }
    })

    const [redirect, setRedirect] = useState(false);
    const [selectedRole, setSelectedRole] = useState('candidate');
    // TẠM THỜI BỎ - không dùng nữa
    // const [showVerificationMessage, setShowVerificationMessage] = useState(false);
    // const [registeredEmail, setRegisteredEmail] = useState('');

    useEffect(() => {
        if (redirect) {
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000); // Giảm thời gian chờ từ 4s xuống 2s
        }
    }, [redirect]);

    const onSubmit = async (data) => {
        console.log(data)
        // Set role from selectedRole state
        data.role = selectedRole;
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log(result);
            
            if (result.success) {
                // TẠM THỜI BỎ XÁC THỰC EMAIL - tự động redirect về login
                toast.success(result.message || "Đăng ký thành công!");
                setRedirect(true);
            } else {
                const errorMessage = result.error || result.message || "Không thể đăng ký";
                toast.error(errorMessage);
                console.error('Register error:', result);
            }
        } catch (err) {
            console.error('Network error:', err);
            toast.error("Không thể kết nối đến server. Vui lòng thử lại sau");
        }
    }

    return (
        <div className='min-h-screen bg-teal-50 flex items-center justify-center py-12 px-4'>
            <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='w-full'>
                        {/* Header */}
                        <div className='mb-6'>
                            <h1 className='text-2xl font-bold text-green-700'>Tạo tài khoản</h1>
                        </div>

                        <div className='space-y-6 mb-6'>
                            {/* Full Name field */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2'>
                                    <box-icon name='user' size='16px' color='#6B7280'></box-icon>
                                    <span>Họ và tên <span className='text-red-500'>*</span></span>
                                </label>
                                <input 
                                    type='text' 
                                    required 
                                    {...register("userName")} 
                                    placeholder='Nguyễn Văn A' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all'
                                />
                            </div>

                            {/* Email field */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2'>
                                    <box-icon name='envelope' size='16px' color='#6B7280'></box-icon>
                                    <span>Email <span className='text-red-500'>*</span></span>
                                </label>
                                <input 
                                    type='email' 
                                    required 
                                    {...register("userEmail")} 
                                    placeholder='nguyenvana@example.com' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all'
                                />
                            </div>

                            {/* Password field */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2'>
                                    <box-icon name='lock-alt' size='16px' color='#6B7280'></box-icon>
                                    <span>Mật khẩu <span className='text-red-500'>*</span></span>
                                </label>
                                <input 
                                    type='password' 
                                    required 
                                    {...register("userPassword")} 
                                    placeholder='••••••' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all'
                                />
                            </div>

                            {/* Animated Toggle Switch */}
                            <div className='relative'>
                                <div className='bg-gray-100 rounded-full p-1 flex items-center'>
                                    {/* Sliding background */}
                                    <div 
                                        className={`absolute h-12 rounded-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300 ease-in-out shadow-md ${
                                            selectedRole === 'candidate' 
                                                ? 'left-1 w-[calc(50%-0.5rem)]' 
                                                : 'left-[calc(50%+0.25rem)] w-[calc(50%-0.5rem)]'
                                        }`}
                                    ></div>
                                    
                                    {/* Candidate Option */}
                                    <button
                                        type='button'
                                        onClick={() => setSelectedRole('candidate')}
                                        className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-all duration-300 ${
                                            selectedRole === 'candidate' 
                                                ? 'text-white' 
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        <box-icon 
                                            name='user' 
                                            size='20px' 
                                            color={selectedRole === 'candidate' ? '#ffffff' : '#6B7280'}
                                        ></box-icon>
                                        <span className='font-semibold text-sm whitespace-nowrap'>Ứng viên</span>
                                    </button>
                                    
                                    {/* Employer Option */}
                                    <button
                                        type='button'
                                        onClick={() => setSelectedRole('employer')}
                                        className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-all duration-300 ${
                                            selectedRole === 'employer' 
                                                ? 'text-white' 
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        <box-icon 
                                            name='building' 
                                            size='20px' 
                                            color={selectedRole === 'employer' ? '#ffffff' : '#6B7280'}
                                        ></box-icon>
                                        <span className='font-semibold text-sm whitespace-nowrap'>Nhà tuyển dụng</span>
                                    </button>
                                </div>
                                
                                {/* Dynamic description text */}
                                <div className='mt-3 text-center'>
                                    <p className='text-sm text-gray-600'>
                                        {selectedRole === 'candidate' 
                                            ? '🎯 Tìm kiếm cơ hội việc làm phù hợp với bạn' 
                                            : '💼 Đăng tin tuyển dụng và tìm ứng viên chất lượng'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit button with green gradient */}
                        <div className='mb-4'>
                            <button 
                                type='submit' 
                                className='w-full bg-gradient-to-r from-green-600 to-green-500 text-white text-md font-bold py-3 rounded-md hover:from-green-700 hover:to-green-600 transition-all shadow-md'
                            >
                                Đăng ký
                            </button>
                        </div>

                        {/* Divider */}
                        <div className='relative mb-4'>
                            <div className='absolute inset-0 flex items-center'>
                                <div className='w-full border-t border-gray-300'></div>
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>Hoặc</span>
                            </div>
                        </div>

                        {/* Google Login Button */}
                        <div className='mb-6'>
                            <button
                                type='button'
                                onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
                                className='w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 text-md font-semibold py-3 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm'
                            >
                                <svg className='w-5 h-5' viewBox='0 0 24 24'>
                                    <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
                                    <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
                                    <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
                                    <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
                                </svg>
                                <span>Đăng nhập bằng Google</span>
                            </button>
                        </div>
                    </div>
                </form>

                {/* Login link */}
                <div className='text-center'>
                    <p className='text-sm text-gray-600'>
                        Đã có tài khoản?{' '}
                        <Link to='/login' className='font-bold text-green-700 hover:text-green-800 hover:underline transition-colors'>
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
