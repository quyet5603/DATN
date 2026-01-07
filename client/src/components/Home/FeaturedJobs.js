import React from 'react'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoURL from '../../assets/img/logo.png'
import API_BASE_URL from '../../config/api';

export const FeaturedJobs = () => {

    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/jobs/all-jobs`);
                if (response.ok) {
                    const data = await response.json();
                    setJobs(data);
                } else {
                    console.error('Error fetching jobs:', response.status);
                    setJobs([]);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                // Handle network errors gracefully
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    console.warn('Network error: Server may not be running or CORS issue');
                }
                setJobs([]);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div id="featured-jobs" className='max-w-screen-2xl container mx-auto px-4 py-12'>
            <h1 className='text-center text-2xl md:text-3xl font-bold text-primary mb-8'>Việc làm nổi bật</h1>
            {jobs.length > 0 ? (
                <div className='w-full grid sm:grid-cols-2 md:grid-cols-3 gap-6'>
                    {jobs.map((job, key) => <Card key={key} job={job} />)}
                </div>
            ) : (
                <div className='text-center py-12'>
                    <p className='text-gray-600 text-lg mb-4'>Hiện tại chưa có việc làm nào được đăng tải.</p>
                    <p className='text-gray-500 text-sm'>Các nhà tuyển dụng đang đăng tin tuyển dụng, vui lòng quay lại sau!</p>
                </div>
            )}
        </div>
    )
}

function Card({ job }) {
    // Lấy thông tin công ty từ employerId
    const companyName = job.employerId?.userName || 'Công ty';
    const companyEmail = job.employerId?.userEmail || '';
    const companyAddress = job.employerId?.address || '';
    
    // Lấy avatar của công ty - chỉ dùng avatar thực, không dùng logo JobFinder
    let companyAvatar = null;
    
    if (job.employerId && job.employerId.avatar && job.employerId.avatar.trim() !== '') {
        const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
        companyAvatar = `${baseURL}/uploads/${job.employerId.avatar}`;
    }
    
    // Lấy chữ cái đầu của tên công ty cho placeholder
    const companyInitial = companyName.charAt(0).toUpperCase();
    
    return (
        <div className='border border-gray-200 shadow-md hover:shadow-xl rounded-lg p-5 transition-all duration-300 bg-white'>
            {/* Job Title - Clickable */}
            <Link to={`/current-job/${job._id}`}>
                <h1 className='font-bold text-lg lg:text-xl text-gray-800 mb-4 hover:text-secondary transition-colors cursor-pointer'>
                    {job.jobTitle}
                </h1>
            </Link>
            
            {/* Company Logo and Name */}
            <div className='flex items-center gap-3 mb-3'>
                <div className='flex-shrink-0'>
                    {companyAvatar ? (
                        <img src={companyAvatar} alt={companyName} className='w-12 h-12 rounded-full object-cover border border-gray-200' />
                    ) : (
                        <div className='w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-gray-200'>
                            <span className='text-white font-bold text-lg'>{companyInitial}</span>
                        </div>
                    )}
                </div>
                <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-sm text-gray-700 truncate'>{companyName}</p>
                </div>
            </div>
            
            {/* Company Information */}
            <div className='space-y-2 mb-4'>
                {companyEmail && (
                    <div className='flex items-center text-gray-600 text-xs'>
                        <box-icon size='14px' name='envelope' color='#6B7280'></box-icon>
                        <span className='ml-2 truncate'>{companyEmail}</span>
                    </div>
                )}
                {companyAddress && (
                    <div className='flex items-center text-gray-600 text-xs'>
                        <box-icon size='14px' name='map' color='#6B7280'></box-icon>
                        <span className='ml-2 truncate'>{companyAddress}</span>
                    </div>
                )}
                <div className='flex items-center text-gray-600 text-xs'>
                    <box-icon size='14px' name='time' color='#6B7280'></box-icon>
                    <span className='ml-2'>{job.employmentType}</span>
                </div>
                <div className='flex items-center text-gray-600 text-xs'>
                    <box-icon size='14px' name='pin' color='#6B7280'></box-icon>
                    <span className='ml-2'>{job.location}</span>
                </div>
            </div>
        </div>
    )
}