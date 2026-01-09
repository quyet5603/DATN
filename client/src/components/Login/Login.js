import React from 'react'
import { useContext, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { toast } from 'react-toastify';
import { LoginContext } from '../ContextProvider/Context';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import 'boxicons';

export const Login = () => {
    const [searchParams] = useSearchParams();
    const { loginData, setLoginData } = useContext(LoginContext);
    const navigate = useNavigate();

    // Xử lý error từ Google OAuth callback
    useEffect(() => {
        const error = searchParams.get('error');
        const message = searchParams.get('message');
        if (error === 'user_not_registered' && message) {
            toast.error(decodeURIComponent(message));
        }
    }, [searchParams]);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    // Hàm xử lý đăng nhập bằng Google
    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    }

    const onSubmit = async (data) => {
        console.log(data)
        // send data to backend API
        fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((result) => {
                console.log(result);
                if (result.success) {
                    // Clear old data first
                    localStorage.removeItem("usertoken");
                    localStorage.removeItem("user");
                    
                    // Set new data
                    localStorage.setItem("usertoken", result.token)
                    localStorage.setItem("user", JSON.stringify(result.user));

                    // Update context with user object (not just token)
                    setLoginData(result.user)
                    toast.success("Đăng nhập thành công")
                    
                    // Force reload to ensure all components update
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 500);
                }
                else
                    toast.error(result.error)
            })
            .catch((err) => {
                toast.error("Đã xảy ra lỗi")
                console.log(err);
            })
    }


    return (
        <div className='min-h-screen bg-teal-50 flex items-center justify-center py-12 px-4'>
            <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8'>
                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='w-full'>
                        {/* Header with icon */}
                        <div className='mb-8 flex items-center gap-3'>
                            <box-icon name='lock-open-alt' size='24px' color='#F97316'></box-icon>
                            <h1 className='text-2xl font-bold text-green-700'>Đăng nhập</h1>
                        </div>

                        <div className='space-y-6 mb-6'>
                            {/* Username field */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2'>
                                    <box-icon name='user' size='16px' color='#6B7280'></box-icon>
                                    <span>Tên tài khoản *</span>
                                </label>
                                <input 
                                    type='text' 
                                    required 
                                    {...register("userEmail")} 
                                    placeholder='VD: test@gmail.com'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all'
                                />
                            </div>

                            {/* Password field */}
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2'>
                                    <box-icon name='lock-alt' size='16px' color='#6B7280'></box-icon>
                                    <span>Mật khẩu *</span>
                                </label>
                                <input 
                                    type='password' 
                                    required 
                                    {...register("userPassword")} 
                                    placeholder='********' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all'
                                />
                            </div>
                        </div>

                        {/* Submit button with green gradient */}
                        <div className='mb-4'>
                            <button 
                                type='submit' 
                                className='w-full bg-gradient-to-r from-green-600 to-green-500 text-white text-md font-bold py-3 rounded-md hover:from-green-700 hover:to-green-600 transition-all shadow-md'
                            >
                                Đăng nhập
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
                                onClick={handleGoogleLogin}
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

                {/* Sign up link */}
                <div className='text-center'>
                    <p className='text-sm text-gray-600'>
                        Chưa có tài khoản?{' '}
                        <Link to='/signup' className='font-bold text-green-700 hover:text-green-800 hover:underline transition-colors'>
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
