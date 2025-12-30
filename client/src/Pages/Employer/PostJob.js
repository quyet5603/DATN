import React from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { toast } from 'react-toastify'


export const PostJob = () => {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues:{
            jobTitle: "",
            employmentType: "",
            location: "",
            salary: "",
            description: ""
        }
    })

    const onSubmit = (data) =>{ 
        console.log(data)
        const token = localStorage.getItem('usertoken');
        // send data to backend API
        fetch("http://localhost:8080/jobs/post-job", {
            method: "POST",
            headers: {
                'content-type' : 'application/json',
                'Authorization': token ? (token.startsWith('Bearer') ? token : `Bearer ${token}`) : ''
            },
            body: JSON.stringify(data)
        })
        .then((res) => res.json())
        .then((result) => {
            console.log(result);
                            toast.success("Đăng việc thành công")
            window.location.href = '/all-jobs';
        })
        .catch((error) => {
            console.log(error);
            toast.error("Không thể đăng việc");
        });

    }



    return (
        <div className='max-w-screen-2xl container mt-2 mx-auto xl:px-24 px-4 py-8'>
            <div className='bg-[#e7e7e7] py-8 px-4 lg:px-16 rounded-lg max-w-3xl mx-auto'>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} >
                    {/* JOB POSTING DETAILS */}
                    <div className='w-full'>
                        <div className='mb-6'>
                            <h1 className='text-2xl md:text-3xl font-bold text-center text-primary'>Chi tiết công việc</h1>
                        </div>
                        
                        <div className='space-y-4'>
                            <div>
                                <label className='block mb-2 text-md font-medium text-gray-700'>Tiêu đề công việc</label>
                                <input 
                                    type='text' 
                                    required 
                                    {...register("jobTitle")} 
                                    placeholder='VD: Lập trình viên Full Stack' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm'
                                />
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-md font-medium text-gray-700'>Loại việc làm</label>
                                <input 
                                    type='text' 
                                    required 
                                    {...register("employmentType")} 
                                    placeholder='VD: Thực tập, Bán thời gian, Toàn thời gian' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm'
                                />
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-md font-medium text-gray-700'>Địa điểm</label>
                                <input 
                                    type='text' 
                                    required 
                                    {...register("location")} 
                                    placeholder='VD: Hà Nội' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm'
                                />
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-md font-medium text-gray-700'>
                                    Mức lương dự kiến <span className='text-sm text-gray-500'>(triệu/tháng)</span>
                                </label>
                                <input 
                                    type='text' 
                                    required 
                                    {...register("salary")} 
                                    placeholder='VD: 20' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm'
                                />
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-md font-medium text-gray-700'>Mô tả công việc</label>
                                <textarea 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm resize-y' 
                                    rows={6} 
                                    placeholder='Mô tả công việc và yêu cầu' 
                                    required 
                                    {...register("description")} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className='flex justify-center mt-8'>
                        <button 
                            type='submit'
                            className='bg-secondary text-white text-md font-medium py-3 px-16 rounded-md hover:opacity-90 transition-opacity shadow-md hover:shadow-lg'
                        >
                            Tạo bài đăng việc làm
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}
