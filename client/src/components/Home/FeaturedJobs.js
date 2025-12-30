import React from 'react'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoURL from '../../assets/img/logo.png'

export const FeaturedJobs = () => {

    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        console.log("hello");
        fetch("http://localhost:8080/jobs/all-jobs").then(res => res.json()).then(
            data => setJobs(data)
        );
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
    return (
        <div className='border border-gray-200 shadow-md hover:shadow-xl rounded-lg p-5 transition-all duration-300 bg-white'>
            {/* Card Header */}
            <div className='flex items-start gap-3 mb-4'>
                <div className='flex-shrink-0'>
                    <img src={logoURL} alt={job.companyName} className='w-12 h-12 rounded-full object-cover' />
                </div>
                <div className='flex-1 min-w-0'>
                    <div className='flex items-center text-gray-600 mb-1'>
                        <box-icon size='16px' name='time'></box-icon>
                        <span className='text-xs ml-1'>{job.employmentType}</span>
                    </div>
                    <h1 className='font-bold text-base lg:text-lg text-gray-800 truncate'>{job.jobTitle}</h1>
                </div>
            </div>
            <div className='mb-4'>
                <p className='text-sm text-gray-600 line-clamp-3 leading-relaxed'>{job.description}</p>
            </div>
            {/* Footer - apply now and location */}
            <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                <div className='flex items-center text-gray-600'>
                    <box-icon size='16px' name='pin'></box-icon>
                    <span className='text-xs ml-1'>{job.location}</span>
                </div>
                <Link to={`/current-job/${job._id}`}>
                    <button className='bg-secondary text-white text-sm font-medium py-2 px-4 rounded-md hover:opacity-90 transition-opacity shadow-sm hover:shadow-md'>Ứng tuyển</button>
                </Link>
            </div>
        </div>
    )
}