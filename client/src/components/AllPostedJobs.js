import React from 'react'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoURL from '../assets/img/logo.png'
import API_BASE_URL from '../config/api';
import 'boxicons';

export const AllPostedJobs = () => {

    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterType, setFilterType] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch("http://localhost:8080/jobs/all-jobs").then(res => res.json()).then(
            data => {
                setJobs(data);
                setFilteredJobs(data);
                setLoading(false);
            }
        ).catch(error => {
            console.error('Error fetching jobs:', error);
            setLoading(false);
        });
    }, []);

    // Filter jobs based on search term, location, and type
    useEffect(() => {
        let filtered = jobs;

        // Filter by search term (job title)
        if (searchTerm.trim()) {
            filtered = filtered.filter(job =>
                job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by location
        if (filterLocation) {
            filtered = filtered.filter(job =>
                job.location?.toLowerCase().includes(filterLocation.toLowerCase())
            );
        }

        // Filter by employment type
        if (filterType) {
            filtered = filtered.filter(job =>
                job.employmentType?.toLowerCase() === filterType.toLowerCase()
            );
        }

        setFilteredJobs(filtered);
    }, [searchTerm, filterLocation, filterType, jobs]);

    // Get unique locations and types for filter dropdowns
    const uniqueLocations = [...new Set(jobs.map(job => job.location).filter(Boolean))].sort();
    const uniqueTypes = [...new Set(jobs.map(job => job.employmentType).filter(Boolean))].sort();

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Search Bar Section */}
            <div className='max-w-screen-2xl container mx-auto px-4 py-8'>
                <div className='bg-white rounded-2xl shadow-md p-6 md:p-8'>
                    <div className='flex flex-col md:flex-row gap-4 items-stretch md:items-center'>
                        {/* Location/City Filter - Left */}
                        <div className='w-full md:w-auto md:min-w-[200px]'>
                            <select
                                value={filterLocation}
                                onChange={(e) => setFilterLocation(e.target.value)}
                                className='w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-gray-700 font-medium'
                            >
                                <option value=''>Tất cả thành phố</option>
                                {uniqueLocations.map((location, index) => (
                                    <option key={index} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>

                        {/* Main Search Input - Middle */}
                        <div className='flex-1 w-full'>
                            <input
                                type='text'
                                placeholder='Tìm kiếm theo kỹ năng, chức vụ, công ty...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        // Search is already handled by useEffect
                                    }
                                }}
                                className='w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 placeholder-gray-400'
                            />
                        </div>

                        {/* Search Button - Right */}
                        <div className='w-full md:w-auto md:flex-shrink-0'>
                            <button
                                onClick={() => {
                                    // Search is handled by useEffect, but we can add explicit search here if needed
                                }}
                                className='w-full md:w-auto px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg'
                            >
                                <box-icon name='search' size='20px' color='#ffffff'></box-icon>
                                <span>Tìm Kiếm</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className='max-w-screen-2xl container mx-auto px-4 py-12'>
                {/* Results Count */}
                <div className='mb-6 text-sm text-gray-600'>
                    Tìm thấy <span className='font-semibold text-green-600'>{filteredJobs.length}</span> công việc
                    {searchTerm && ` với từ khóa "${searchTerm}"`}
                </div>

                {/* Jobs Grid */}
                {loading ? (
                    <div className='text-center py-12'>
                        <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-secondary'></div>
                        <p className='mt-4 text-gray-600'>Đang tải...</p>
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className='w-full grid sm:grid-cols-2 md:grid-cols-3 gap-6'>
                        {filteredJobs.map((job, key) => <Card key={key} job={job} />)}
                    </div>
                ) : (
                    <div className='text-center py-12 bg-gray-50 rounded-lg'>
                        <box-icon name='search-alt' size='48px' className='text-gray-400 mb-4'></box-icon>
                        <p className='text-lg font-medium text-gray-700 mb-2'>Không tìm thấy công việc nào</p>
                        <p className='text-sm text-gray-500'>
                            {searchTerm || filterLocation || filterType
                                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                                : 'Hiện chưa có công việc nào được đăng'}
                        </p>
                        {(searchTerm || filterLocation || filterType) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterLocation('');
                                    setFilterType('');
                                }}
                                className='mt-4 px-6 py-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-opacity'
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>
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