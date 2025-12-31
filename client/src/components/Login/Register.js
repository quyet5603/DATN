import React from 'react'
import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

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
    const [showVerificationMessage, setShowVerificationMessage] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    useEffect(() => {
        if (redirect) {
            setTimeout(() => {
                window.location.href = "/login";
            }, 4000);
        }
    }, [redirect]);

    const onSubmit = async (data) => {
        console.log(data)
        try {
            const response = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log(result);
            
            if (result.success) {
                if (result.requiresVerification) {
                    // Cần xác thực email
                    setRegisteredEmail(data.userEmail);
                    setShowVerificationMessage(true);
                    toast.success(result.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
                } else {
                    toast.success("Đăng ký thành công");
                    setRedirect(true);
                }
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
        <div className='max-w-scren-2xl w-full md:w-4/6 lg:w-3/5 container mt-8 mb-8 mx-auto px-4'>
            <div className='bg-[#e7e7e7] mx-auto py-8 px-6 md:px-12 rounded-lg shadow-lg'>

                {!showVerificationMessage ? (
                    <>
                        {/* FORM */}
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className='w-full'>
                                <div className='mb-6'>
                                    <h1 className='text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2'>Đăng ký</h1>
                                    <p className='text-sm text-gray-600 text-center'>Tạo tài khoản mới để bắt đầu tìm việc làm</p>
                                </div>

                        <div className='space-y-4 mb-6'>
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>Họ và tên</label>
                                <input type='text' required {...register("userName")} placeholder='VD: Nguyễn Văn A' className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm'></input>
                            </div>
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>Email</label>
                                <input type='email' required {...register("userEmail")} placeholder='VD: nguyenvana@gmail.com' className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm'></input>
                            </div>
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>Mật khẩu</label>
                                <input type='password' required {...register("userPassword")} placeholder='Tạo mật khẩu mạnh' className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm'></input>
                            </div>
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>Giới tính</label>
                                <div className='flex gap-6'>
                                    <label className='flex items-center cursor-pointer'>
                                        <input {...register(`gender`, { required: true })} type="radio" value="Male" className='mr-2' />
                                        <span className='text-sm'>Nam</span>
                                    </label>
                                    <label className='flex items-center cursor-pointer'>
                                        <input {...register(`gender`, { required: true })} type="radio" value="Female" className='mr-2' />
                                        <span className='text-sm'>Nữ</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>Địa chỉ</label>
                                <input type='text' required {...register("address")} placeholder='VD: 123 Đường ABC, Quận XYZ, TP.HCM' className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-sm'></input>
                            </div>
                            <div>
                                <label className='block mb-2 text-sm font-medium text-gray-700'>Loại người dùng</label>
                                <select {...register("role", { required: true })} className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'>
                                    <option value="candidate">Ứng viên (Tìm việc)</option>
                                    <option value="employer">Nhà tuyển dụng (Đăng tin tuyển dụng)</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit button */}
                        <div className='mb-4'>
                            <button type='submit' className='w-full bg-secondary text-white text-md font-medium py-3 rounded-md hover:opacity-90 transition-opacity shadow-md hover:shadow-lg'>Đăng ký</button>
                        </div>
                    </div>
                </form>
                    </>
                ) : (
                    <div className='text-center py-6'>
                        <div className='mb-4'>
                            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4'>
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className='text-xl font-semibold text-gray-800 mb-2'>Kiểm tra email của bạn!</h2>
                            <p className='text-sm text-gray-600 mb-4'>
                                Chúng tôi đã gửi email xác thực đến:
                            </p>
                            <p className='text-base font-medium text-primary mb-4'>{registeredEmail}</p>
                            <p className='text-sm text-gray-600 mb-6'>
                                Vui lòng kiểm tra hộp thư (kể cả thư mục Spam) và làm theo hướng dẫn để xác thực tài khoản.
                            </p>
                            <div className='space-y-3'>
                                <Link 
                                    to={`/verify-email?email=${encodeURIComponent(registeredEmail)}`}
                                    className='inline-block bg-secondary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity'
                                >
                                    Xác thực email ngay
                                </Link>
                                <div>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch("http://localhost:8080/auth/resend-verification-email", {
                                                    method: "POST",
                                                    headers: {'content-type': 'application/json'},
                                                    body: JSON.stringify({ userEmail: registeredEmail })
                                                });
                                                
                                                const result = await response.json();
                                                console.log('Resend verification email response:', result);
                                                
                                                if (result.success) {
                                                    toast.success(result.message || "Email xác thực đã được gửi lại!");
                                                } else {
                                                    const errorMessage = result.error || result.message || "Không thể gửi lại email";
                                                    toast.error(errorMessage);
                                                    console.error('Resend email error:', result);
                                                }
                                            } catch (error) {
                                                console.error('Network error:', error);
                                                toast.error("Không thể kết nối đến server. Vui lòng thử lại sau");
                                            }
                                        }}
                                        className='text-sm text-primary hover:underline'
                                    >
                                        Gửi lại email xác thực
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className='text-center pt-4 border-t border-gray-300'>
                    <Link to='/login'>
                        <p className='text-sm text-gray-600 hover:text-primary hover:underline transition-colors'>Đã có tài khoản? Đăng nhập tại đây!</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
