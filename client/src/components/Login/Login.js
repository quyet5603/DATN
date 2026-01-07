import React, { useEffect } from 'react'
import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useForm, SubmitHandler } from "react-hook-form"
import { ToastContainer, toast } from 'react-toastify';
import { LoginContext } from '../ContextProvider/Context';
import { useNavigate } from 'react-router-dom';
import 'boxicons';

export const Login = () => {

    const { loginData, setLoginData } = useContext(LoginContext);
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const onSubmit = async (data) => {
        console.log(data)
        // send data to backend API
        fetch("http://localhost:8080/auth/login", {
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
                        <div className='mb-6'>
                            <button 
                                type='submit' 
                                className='w-full bg-gradient-to-r from-green-600 to-green-500 text-white text-md font-bold py-3 rounded-md hover:from-green-700 hover:to-green-600 transition-all shadow-md'
                            >
                                Đăng nhập
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
