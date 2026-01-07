import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(userStr);
            if (userData.role !== 'admin') {
                toast.error('Bạn không có quyền truy cập trang này!');
                navigate('/');
                return;
            }

            fetchJobs();
        } catch (error) {
            console.error('Error:', error);
            navigate('/login');
        }
    }, [navigate]);

    const fetchJobs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/all-jobs`);
            if (response.ok) {
                const data = await response.json();
                setJobs(Array.isArray(data) ? data : []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Không thể tải danh sách công việc');
            setLoading(false);
        }
    };

    // Filter jobs based on search
    useEffect(() => {
        let filtered = [...jobs];

        // Filter by search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(job => 
                job.jobTitle?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredJobs(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    }, [jobs, searchTerm]);

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`${API_BASE_URL}/jobs/delete-job/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Xóa công việc thành công!');
                fetchJobs();
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(errorData.message || 'Không thể xóa công việc');
            }
        } catch (error) {
            console.error('Lỗi khi xóa công việc:', error);
            toast.error('Lỗi khi xóa công việc!');
        }
    };

    const getEmploymentTypeColor = (type) => {
        switch (type) {
            case 'Full-time':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Part-time':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Contract':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Internship':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString, jobId) => {
        if (dateString) {
            try {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear().toString().slice(-2);
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const seconds = date.getSeconds().toString().padStart(2, '0');
                    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
                }
            } catch (e) {
                console.error('Error parsing date:', e);
            }
        }
        
        if (jobId && typeof jobId === 'string' && jobId.length === 24) {
            try {
                const timestamp = parseInt(jobId.substring(0, 8), 16) * 1000;
                const date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear().toString().slice(-2);
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const seconds = date.getSeconds().toString().padStart(2, '0');
                    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
                }
            } catch (e) {
                console.error('Error extracting date from ObjectId:', e);
            }
        }
        
        return 'N/A';
    };

    // Pagination
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý việc làm</h1>
                    <p className="text-gray-600">Danh sách công việc được đăng tuyển</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex gap-4 items-center">
                        <box-icon
                            name='search'
                            size='20px'
                            color='#000000'
                        ></box-icon>
                        <input
                            type='text'
                            placeholder='Tìm kiếm theo tiêu đề công việc...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                        <button
                            type='button'
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2'
                        >
                            <box-icon name='search' color='#ffffff' size='18px'></box-icon>
                            <span>Tìm kiếm</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STT</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tiêu đề</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Công ty</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Địa điểm</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Loại hình</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lương</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày tạo</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có công việc nào'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedJobs.map((job, index) => (
                                        <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {startIndex + index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {job.jobTitle || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {job.employerId?.userName || job.employerId?.companyTitle || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {job.location || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEmploymentTypeColor(job.employmentType)}`}>
                                                    {job.employmentType || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {job.salary || 'Thỏa thuận'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(job.createdAt, job._id)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        to={`/admin/jobs/detail/${job._id}`}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                    >
                                                        Xem chi tiết
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteJob(job._id)}
                                                        className="text-red-600 hover:text-red-800 hover:underline font-medium"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {filteredJobs.length > 0 && (
                    <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                        <div className="text-sm text-gray-700">
                            Tổng {filteredJobs.length} công việc
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <box-icon name='chevron-left' size='16px' color='#374151'></box-icon>
                            </button>
                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <box-icon name='chevron-right' size='16px' color='#374151'></box-icon>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Hiển thị:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={10}>10 / trang</option>
                                <option value={20}>20 / trang</option>
                                <option value={50}>50 / trang</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
