import React from 'react'
import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
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
            const response = await fetch("http://localhost:8080/auth/register", {
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
                        <div className='mb-6'>
                            <button 
                                type='submit' 
                                className='w-full bg-gradient-to-r from-green-600 to-green-500 text-white text-md font-bold py-3 rounded-md hover:from-green-700 hover:to-green-600 transition-all shadow-md'
                            >
                                Đăng ký
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
