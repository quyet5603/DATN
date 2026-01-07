import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginContext } from '../../components/ContextProvider/Context';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const CVManagement = () => {
    const { loginData } = useContext(LoginContext);
    const navigate = useNavigate();
    
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'shortlist', 'rejected'
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Get user ID
                let userId = loginData?._id;
                if (!userId) {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        try {
                            const user = JSON.parse(userStr);
                            userId = user._id;
                        } catch (e) {
                            console.error('Error parsing user data:', e);
                            toast.error('Vui lòng đăng nhập lại');
                            navigate('/login');
                            return;
                        }
                    } else {
                        toast.error('Vui lòng đăng nhập lại');
                        navigate('/login');
                        return;
                    }
                }

                // Fetch all jobs của employer
                const jobsResponse = await fetch(`${API_BASE_URL}/jobs/all-jobs`);
                if (!jobsResponse.ok) {
                    throw new Error('Failed to fetch jobs');
                }
                const allJobs = await jobsResponse.json();
                
                // Filter jobs của employer này
                const employerJobs = allJobs.filter(job => {
                    const jobEmployerId = job.employerId?._id || job.employerId;
                    return String(jobEmployerId) === String(userId);
                });
                
                const jobIds = employerJobs.map(job => job._id.toString());
                
                if (jobIds.length === 0) {
                    setApplications([]);
                    setFilteredApplications([]);
                    setIsLoading(false);
                    return;
                }

                // Fetch all applications
                const appResponse = await fetch(`${API_BASE_URL}/application/all-application`);
                if (!appResponse.ok) {
                    throw new Error('Failed to fetch applications');
                }
                const allApplications = await appResponse.json();
                
                // Filter applications cho các jobs của employer
                const employerApplications = allApplications.filter(app => {
                    const appJobID = String(app.jobID || '');
                    return jobIds.includes(appJobID);
                });

                // Fetch candidate và job details cho mỗi application
                const applicationsWithDetails = await Promise.allSettled(
                    employerApplications.map(async (app) => {
                        try {
                            // Fetch candidate
                            const candidateResponse = await fetch(`${API_BASE_URL}/users/user/${app.candidateID}`);
                            if (!candidateResponse.ok) {
                                return null;
                            }
                            const candidate = await candidateResponse.json();
                            
                            // Fetch job
                            const jobResponse = await fetch(`${API_BASE_URL}/jobs/current-job/${app.jobID}`);
                            if (!jobResponse.ok) {
                                return null;
                            }
                            const job = await jobResponse.json();
                            
                            return {
                                _id: app._id,
                                applicationId: app._id,
                                candidateId: app.candidateID,
                                candidateName: candidate.userName || 'N/A',
                                candidateEmail: candidate.userEmail || 'N/A',
                                candidatePhone: candidate.phoneNumber || 'N/A',
                                cvTitle: candidate.cvTitle || 'CV',
                                cvFilePath: candidate.cvFilePath || null,
                                jobTitle: job.jobTitle || 'N/A',
                                jobId: app.jobID,
                                status: app.applicationStatus || 'active',
                                createdAt: app.createdAt || app.updatedAt,
                                cvSections: candidate.cvSections || null
                            };
                        } catch (error) {
                            console.error('Error fetching details for application:', error);
                            return null;
                        }
                    })
                );

                const validApplications = applicationsWithDetails
                    .filter(result => result.status === 'fulfilled' && result.value !== null)
                    .map(result => result.value);

                setApplications(validApplications);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Không thể tải dữ liệu');
            } finally {
                setIsLoading(false);
            }
        };

        if (loginData || localStorage.getItem('user')) {
            fetchData();
        }
    }, [loginData, navigate]);

    // Filter applications based on tab and search
    useEffect(() => {
        let filtered = [...applications];

        // Filter by status tab
        if (activeTab !== 'all') {
            const statusMap = {
                'active': 'active',
                'shortlist': 'shortlist',
                'rejected': 'rejected'
            };
            filtered = filtered.filter(app => app.status === statusMap[activeTab]);
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(app => 
                app.candidateName.toLowerCase().includes(searchLower) ||
                app.candidateEmail.toLowerCase().includes(searchLower)
            );
        }

        setFilteredApplications(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    }, [applications, activeTab, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

    const getStatusLabel = (status) => {
        const statusMap = {
            'active': 'Chờ xử lý',
            'shortlist': 'Đã chấp nhận',
            'rejected': 'Đã từ chối',
            'inactive': 'Không hoạt động'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'active': 'bg-yellow-100 text-yellow-800',
            'shortlist': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'inactive': 'bg-gray-100 text-gray-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    const getTabCount = (tab) => {
        if (tab === 'all') return applications.length;
        const statusMap = {
            'active': 'active',
            'shortlist': 'shortlist',
            'rejected': 'rejected'
        };
        return applications.filter(app => app.status === statusMap[tab]).length;
    };

    const handleViewDetail = (applicationId) => {
        navigate(`/employer/candidate-detail/${applicationId}`);
    };

    const formatDate = (dateString, applicationId) => {
        // Nếu có dateString, sử dụng nó
        if (dateString) {
            try {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    return `${hours}:${minutes} ${day}/${month}/${year}`;
                }
            } catch (e) {
                console.error('Error parsing date:', e);
            }
        }
        
        // Nếu không có dateString nhưng có applicationId (MongoDB ObjectId chứa timestamp)
        if (applicationId && typeof applicationId === 'string' && applicationId.length === 24) {
            try {
                // Extract timestamp from MongoDB ObjectId
                const timestamp = parseInt(applicationId.substring(0, 8), 16) * 1000;
                const date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    return `${hours}:${minutes} ${day}/${month}/${year}`;
                }
            } catch (e) {
                console.error('Error extracting date from ObjectId:', e);
            }
        }
        
        return 'N/A';
    };

    if (isLoading) {
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý CV</h1>
                    <p className="text-gray-600">Quản lý và theo dõi các CV ứng tuyển</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${
                                activeTab === 'all'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Tất cả ({getTabCount('all')})
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${
                                activeTab === 'active'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Chờ xử lý ({getTabCount('active')})
                        </button>
                        <button
                            onClick={() => setActiveTab('shortlist')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${
                                activeTab === 'shortlist'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Đã chấp nhận ({getTabCount('shortlist')})
                        </button>
                        <button
                            onClick={() => setActiveTab('rejected')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${
                                activeTab === 'rejected'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Đã từ chối ({getTabCount('rejected')})
                        </button>
                    </div>
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
                            placeholder='Tìm kiếm theo tên hoặc email...'
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
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Họ và tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tiêu đề CV</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vị trí ứng tuyển</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày gửi</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có CV nào'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedApplications.map((app, index) => (
                                        <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {startIndex + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {app.candidateName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {app.candidateEmail}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {app.cvTitle}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {app.jobTitle}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                                    {getStatusLabel(app.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(app.createdAt, app.applicationId || app._id)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => handleViewDetail(app.applicationId)}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {filteredApplications.length > 0 && (
                    <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                        <div className="text-sm text-gray-700">
                            Tổng {filteredApplications.length} CV
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <box-icon name='chevron-left' size='16px' color='#374151'></box-icon>
                            </button>
                            <span className="text-sm text-gray-700">
                                Trang {currentPage} / {totalPages || 1}
                            </span>
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

