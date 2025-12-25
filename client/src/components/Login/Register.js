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

    useEffect(() => {
        if (redirect) {
            setTimeout(() => {
                window.location.href = "/login";
            }, 4000);
        }
    }, [redirect]);

    const onSubmit = (data) => {
        console.log(data)
        // send data to backend API
        fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: {'content-type' : 'application/json'},
            body: JSON.stringify(data)
        })
        .then((res) => res.json())
        .then((result) => {
            console.log(result);
            toast.success("Đăng ký thành công")
            setRedirect(true)
        })
        .catch((err) => {
            toast.error("Không thể đăng ký")
            console.log(err);
        })
    }

    return (
        <div className='max-w-scren-2xl w-full md:w-4/6 lg:w-3/5 container mt-8 mb-8 mx-auto px-4'>
            <div className='bg-[#e7e7e7] mx-auto py-8 px-6 md:px-12 rounded-lg shadow-lg'>

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
                <div className='text-center pt-4 border-t border-gray-300'>
                    <Link to='/login'>
                        <p className='text-sm text-gray-600 hover:text-primary hover:underline transition-colors'>Đã có tài khoản? Đăng nhập tại đây!</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
