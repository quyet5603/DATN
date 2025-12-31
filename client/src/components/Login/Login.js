import React, { useEffect } from 'react'
import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useForm, SubmitHandler } from "react-hook-form"
import { ToastContainer, toast } from 'react-toastify';
import { LoginContext } from '../ContextProvider/Context';
import { useNavigate } from 'react-router-dom';

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
        <div className='max-w-scren-2xl w-full md:w-2/5 lg:w-1/3 container mt-8 mb-8 mx-auto px-4'>
            <div className='bg-[#e7e7e7] mx-auto py-8 px-6 md:px-12 rounded-lg shadow-lg'>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='w-full'>
                        <div className='mb-6'>
                            <h1 className='text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2'>Đăng nhập</h1>
                            <p className='text-sm text-gray-600 text-center'>Nhập thông tin để đăng nhập vào tài khoản</p>
                        </div>

                        <div className='space-y-4 mb-6'>
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>Email</label>
                                <input type='email' required {...register("userEmail")} placeholder='VD: nguyenvana@gmail.com' className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm'></input>
                            </div>
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>Mật khẩu</label>
                                <input type='password' required {...register("userPassword")} placeholder='Nhập mật khẩu của bạn' className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm'></input>
                            </div>
                        </div>

                        {/* Forgot password link */}
                        <div className='mb-4 text-right'>
                            <Link to='/forgot-password'>
                                <p className='text-sm text-primary hover:underline transition-colors'>
                                    Quên mật khẩu?
                                </p>
                            </Link>
                        </div>

                        {/* Submit button */}
                        <div className='mb-4'>
                            <button type='submit' className='w-full bg-secondary text-white text-md font-medium py-3 rounded-md hover:opacity-90 transition-opacity shadow-md hover:shadow-lg'>Đăng nhập</button>
                        </div>
                    </div>
                </form>
                <div className='text-center pt-4 border-t border-gray-300'>
                    <Link to='/signup'>
                        <p className='text-sm text-gray-600 hover:text-primary hover:underline transition-colors'>Người dùng mới? Đăng ký tại đây!</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
