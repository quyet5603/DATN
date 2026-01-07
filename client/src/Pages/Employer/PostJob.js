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
            location: "",
            specificAddress: "",
            description: "",
            employmentType: "",
            salary: "",
            category: "",
            level: "",
            employeeType: "",
            quantity: 1,
            deadline: "",
            educationRequirement: "",
            experienceRequirement: "",
            genderRequirement: "",
            jobRequirement: "",
            benefits: ""
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
                            toast.success("Đăng tin tuyển dụng thành công")
            window.location.href = '/all-jobs';
        })
        .catch((error) => {
            console.log(error);
            toast.error("Không thể đăng việc");
        });

    }



    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-8'>
                    <p className='text-sm text-blue-600 font-medium mb-2'>TẠO TIN TUYỂN DỤNG MỚI</p>
                    <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>Đăng tin tuyển dụng mới</h1>
                    <p className='text-gray-600 text-sm md:text-base'>
                        Mô tả rõ ràng vị trí, yêu cầu và quyền lợi để thu hút đúng ứng viên tiềm năng.
                    </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Thông tin chung */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-6'>
                        <h2 className='text-lg font-bold text-gray-800 mb-6 uppercase tracking-wide'>Thông tin chung</h2>
                        <div className='space-y-5'>
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>
                                    <span className='text-red-500 mr-1'>*</span> Tiêu đề
                                </label>
                                <input 
                                    type='text' 
                                    required 
                                    {...register("jobTitle")} 
                                    placeholder='VD: Tuyển lập trình viên ReactJS' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm transition-all'
                                />
                            </div>
                            
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                <div>
                                    <label className='block mb-2 text-sm font-semibold text-gray-700'>
                                        <span className='text-red-500 mr-1'>*</span> Địa điểm
                                    </label>
                                    <input 
                                        type='text' 
                                        required 
                                        {...register("location")} 
                                        placeholder='Hà Nội, Việt Nam' 
                                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm transition-all'
                                    />
                                </div>
                                
                                <div>
                                    <label className='block mb-2 text-sm font-semibold text-gray-700'>Địa chỉ cụ thể</label>
                                    <input 
                                        type='text' 
                                        {...register("specificAddress")} 
                                        placeholder='Tầng 5, Tòa nhà ABC, ...' 
                                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm transition-all'
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>
                                    <span className='text-red-500 mr-1'>*</span> Mô tả công việc
                                </label>
                                <textarea 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm resize-y min-h-[120px] transition-all' 
                                    rows={6} 
                                    placeholder='Mô tả chi tiết về công việc' 
                                    required 
                                    {...register("description")} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Chi tiết tuyển dụng */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-6'>
                        <h2 className='text-lg font-bold text-gray-800 mb-6 uppercase tracking-wide'>Chi tiết tuyển dụng</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>Loại hình</label>
                                <select 
                                    {...register("employmentType")} 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all bg-white'
                                >
                                    <option value=''>Chọn loại hình</option>
                                    <option value='Full-time'>Full-time</option>
                                    <option value='Part-time'>Part-time</option>
                                    <option value='Contract'>Contract</option>
                                    <option value='Internship'>Internship</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>Mức lương</label>
                                <input 
                                    type='text' 
                                    {...register("salary")} 
                                    placeholder='10-15 triệu VND' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm transition-all'
                                />
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>Danh mục</label>
                                <input 
                                    type='text' 
                                    {...register("category")} 
                                    placeholder='IT, Marketing, Sales' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm transition-all'
                                />
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>Cấp độ</label>
                                <select 
                                    {...register("level")} 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all bg-white'
                                >
                                    <option value=''>Chọn cấp độ</option>
                                    <option value='Intern'>Intern</option>
                                    <option value='Fresher'>Fresher</option>
                                    <option value='Junior'>Junior</option>
                                    <option value='Middle'>Middle</option>
                                    <option value='Senior'>Senior</option>
                                    <option value='Lead'>Lead</option>
                                    <option value='Manager'>Manager</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>Nhân viên</label>
                                <input 
                                    type='text' 
                                    {...register("employeeType")} 
                                    placeholder='Nhân viên chính thức' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm transition-all'
                                />
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>Số lượng tuyển</label>
                                <input 
                                    type='number' 
                                    min='1'
                                    {...register("quantity", { valueAsNumber: true })} 
                                    defaultValue={1}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all'
                                />
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>Hạn nộp hồ sơ</label>
                                <input 
                                    type='date' 
                                    {...register("deadline")} 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Yêu cầu ứng viên */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-6'>
                        <h2 className='text-lg font-bold text-gray-800 mb-6 uppercase tracking-wide'>Yêu cầu ứng viên</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>Yêu cầu bằng cấp</label>
                                <select 
                                    {...register("educationRequirement")} 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all bg-white'
                                >
                                    <option value=''>Chọn bằng cấp</option>
                                    <option value='Không yêu cầu'>Không yêu cầu</option>
                                    <option value='Trung cấp'>Trung cấp</option>
                                    <option value='Cao đẳng'>Cao đẳng</option>
                                    <option value='Đại học'>Đại học</option>
                                    <option value='Thạc sĩ'>Thạc sĩ</option>
                                    <option value='Tiến sĩ'>Tiến sĩ</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>Yêu cầu kinh nghiệm</label>
                                <input 
                                    type='text' 
                                    {...register("experienceRequirement")} 
                                    placeholder='VD: Từ 1-3 năm kinh nghiệm' 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm transition-all'
                                />
                            </div>
                            
                            <div>
                                <label className='block mb-2 text-sm font-semibold text-gray-700'>Yêu cầu giới tính</label>
                                <select 
                                    {...register("genderRequirement")} 
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all bg-white'
                                >
                                    <option value=''>Không yêu cầu</option>
                                    <option value='Nam'>Nam</option>
                                    <option value='Nữ'>Nữ</option>
                                    <option value='Không yêu cầu'>Không yêu cầu</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className='mt-5'>
                            <label className='block mb-2 text-sm font-semibold text-gray-700'>Yêu cầu công việc</label>
                            <textarea 
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm resize-y min-h-[100px] transition-all' 
                                rows={4} 
                                placeholder='Mô tả chi tiết các yêu cầu công việc...' 
                                {...register("jobRequirement")} 
                            />
                        </div>
                    </div>

                    {/* Quyền lợi & từ khóa */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-6'>
                        <h2 className='text-lg font-bold text-gray-800 mb-6 uppercase tracking-wide'>Quyền lợi & từ khóa</h2>
                        <div>
                            <label className='block mb-2 text-sm font-semibold text-gray-700'>Quyền lợi</label>
                            <textarea 
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder:text-sm resize-y min-h-[100px] transition-all' 
                                rows={4} 
                                placeholder='Mô tả các quyền lợi mà công ty cung cấp...' 
                                {...register("benefits")} 
                            />
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className='flex justify-center mt-8 mb-8'>
                        <button 
                            type='submit'
                            className='bg-green-600 text-white text-lg font-semibold py-4 px-12 rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl'
                        >
                            Đăng tin tuyển dụng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
