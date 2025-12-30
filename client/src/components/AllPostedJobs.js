import React from 'react'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoURL from '../assets/img/logo.png'

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
        <div className='max-w-screen-2xl container mx-auto px-4 py-12'>
            <h1 className='text-center text-2xl md:text-3xl font-bold text-primary mb-8'>Tất cả việc làm</h1>
            
            {/* Search and Filter Section */}
            <div className='mb-8 bg-white rounded-lg shadow-md p-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {/* Search by Job Title */}
                    <div className='relative'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Tìm kiếm theo tên công việc
                        </label>
                        <div className='relative'>
                            <box-icon name='search' size='20px' className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></box-icon>
                            <input
                                type='text'
                                placeholder='Nhập tên công việc...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none'
                            />
                        </div>
                    </div>

                    {/* Filter by Location */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Lọc theo địa điểm
                        </label>
                        <select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none'
                        >
                            <option value=''>Tất cả địa điểm</option>
                            {uniqueLocations.map((location, index) => (
                                <option key={index} value={location}>{location}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter by Employment Type */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Lọc theo loại việc làm
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none'
                        >
                            <option value=''>Tất cả loại</option>
                            {uniqueTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Clear Filters Button */}
                {(searchTerm || filterLocation || filterType) && (
                    <div className='mt-4 flex justify-end'>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterLocation('');
                                setFilterType('');
                            }}
                            className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline'
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}

                {/* Results Count */}
                <div className='mt-4 text-sm text-gray-600'>
                    Tìm thấy <span className='font-semibold text-primary'>{filteredJobs.length}</span> công việc
                    {searchTerm && ` với từ khóa "${searchTerm}"`}
                </div>
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