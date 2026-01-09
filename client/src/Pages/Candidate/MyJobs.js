import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import 'boxicons';

export const MyJobs = () => {
    const [applications, setApplications] = useState([]);
    const [loginData, setLoginData] = useState();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('applied');
    
    useEffect(() => {
        let token = localStorage.getItem("user");
        if (token) {
            const user = JSON.parse(token);
            setLoginData(Array.isArray(user) ? user[0] : user);
        }
    }, [])

    useEffect(() => {
        const fetchApplications = async () => {
            if (!loginData?._id) {
                console.log('No loginData._id found');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                console.log('Fetching applications for candidateID:', loginData._id);
                
                // Fetch applications của user
                const response = await fetch(`${API_BASE_URL}/application/all-application/`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const allApplications = await response.json();
                console.log('All applications:', allApplications);
                
                // Filter applications của user này
                const userApplications = allApplications.filter(app => {
                    const candidateIdStr = app.candidateID?.toString();
                    const loginIdStr = loginData._id?.toString();
                    return candidateIdStr === loginIdStr;
                });
                console.log('Filtered applications:', userApplications);
                
                // Fetch job details cho mỗi application và lọc bỏ các job đã bị xóa
                const applicationsWithJobs = await Promise.allSettled(
                    userApplications.map(async (app) => {
                        try {
                            // Sử dụng fetch với error handling im lặng
                            let jobResponse;
                            try {
                                jobResponse = await fetch(`${API_BASE_URL}/jobs/current-job/${app.jobID}`);
                            } catch (fetchError) {
                                // Fetch failed (network error, etc.), im lặng bỏ qua
                                console.debug(`[MyJobs] Network error fetching job ${app.jobID}:`, fetchError.message);
                                return null;
                            }
                            
                            // Kiểm tra nếu job không tồn tại (404) hoặc có lỗi
                            if (!jobResponse || !jobResponse.ok) {
                                // Job đã bị xóa hoặc không tồn tại, im lặng bỏ qua (không log 404)
                                if (jobResponse?.status !== 404) {
                                    console.warn(`[MyJobs] Error fetching job ${app.jobID}:`, jobResponse?.status);
                                }
                                return null; // Trả về null để lọc bỏ sau
                            }
                            
                            let job;
                            try {
                                job = await jobResponse.json();
                            } catch (jsonError) {
                                // JSON parse failed, im lặng bỏ qua
                                return null;
                            }
                            
                            // Kiểm tra nếu job không có dữ liệu hợp lệ
                            if (!job || !job.jobTitle) {
                                // Job không có dữ liệu hợp lệ, im lặng bỏ qua
                                return null;
                            }
                            
                            // Format date
                            const date = new Date(app.createdAt || app.updatedAt);
                            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                            
                            return {
                                ...app,
                                job: job,
                                jobTitle: job.jobTitle,
                                companyName: job?.employerId?.userName || 'Chưa cập nhật',
                                companyAvatar: job?.employerId?.avatar || null,
                                salary: job?.salary || 'Thỏa thuận',
                                location: job?.location || 'Chưa cập nhật',
                                applicationDate: formattedDate,
                                applicationStatus: app.applicationStatus || 'active'
                            };
                        } catch (error) {
                            // Lỗi khi fetch job (có thể job đã bị xóa), im lặng bỏ qua
                            return null; // Trả về null để lọc bỏ sau
                        }
                    })
                );
                
                // Extract values from Promise.allSettled results
                const applicationsWithJobsValues = applicationsWithJobs.map(result => 
                    result.status === 'fulfilled' ? result.value : null
                );
                
                // Lọc bỏ các applications có job đã bị xóa (null)
                const validApplications = applicationsWithJobsValues.filter(app => app !== null);
                
                setApplications(validApplications);
            } catch (error) {
                console.error('Error fetching applications:', error);
            } finally {
                setLoading(false);
            }
        };

        if (loginData?._id) {
            fetchApplications();
        }
    }, [loginData]);

    const appliedCount = applications.length;

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4'>
                {/* Header */}
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-800 mb-2'>Việc làm của tôi</h1>
                </div>

                {/* Tabs */}
                <div className='mb-6 flex gap-4 border-b border-gray-200'>
                    <button
                        onClick={() => setActiveTab('applied')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'applied'
                                ? 'text-green-600 border-b-2 border-green-600'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        Đã ứng tuyển {appliedCount > 0 && <span className='ml-2'>({appliedCount})</span>}
                    </button>
                </div>

                {/* Table */}
                <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Logo</th>
                                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Công việc</th>
                                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Lương</th>
                                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Địa điểm</th>
                                    <th className='px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            Đang tải...
                                        </td>
                                    </tr>
                                ) : applications.length > 0 ? (
                                    applications.map((application, key) => (
                                        <RenderTableRows key={key} application={application} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            Chưa có đơn ứng tuyển nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

function RenderTableRows({ application }) {
    const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
    
    const getStatusText = (status) => {
        const statusMap = {
            'active': 'Đang xét duyệt',
            'shortlist': 'Đã duyệt',
            'rejected': 'Từ chối',
            'inactive': 'Đã hủy'
        };
        return statusMap[status] || 'Đang xét duyệt';
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'active': 'border-yellow-500 text-yellow-700 bg-yellow-50',
            'shortlist': 'border-green-500 text-green-700 bg-green-50',
            'rejected': 'border-red-500 text-red-700 bg-red-50',
            'inactive': 'border-gray-500 text-gray-700 bg-gray-50'
        };
        return colorMap[status] || 'border-gray-500 text-gray-700 bg-gray-50';
    };

    // Get company avatar or initial
    const companyAvatar = application.companyAvatar 
        ? `${baseURL}/uploads/${application.companyAvatar}`
        : null;
    const companyInitial = application.companyName?.charAt(0)?.toUpperCase() || 'C';

    return (
        <tr className='hover:bg-gray-50 transition-colors'>
            {/* Logo */}
            <td className='px-6 py-4 whitespace-nowrap'>
                <div className='w-12 h-12 rounded-lg bg-yellow-400 flex items-center justify-center overflow-hidden'>
                    {companyAvatar ? (
                        <img 
                            src={companyAvatar} 
                            alt={application.companyName}
                            className='w-full h-full object-cover'
                        />
                    ) : (
                        <span className='text-white font-bold text-lg'>{companyInitial}</span>
                    )}
                </div>
            </td>

            {/* Công việc */}
            <td className='px-6 py-4'>
                <div>
                    <Link 
                        to={`/current-job/${application.jobID}`} 
                        className='font-semibold text-gray-900 hover:text-blue-600 transition-colors block'
                    >
                        {application.jobTitle}
                    </Link>
                    <p className='text-sm text-gray-500 mt-1'>{application.companyName}</p>
                </div>
            </td>

            {/* Lương */}
            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                {application.salary}
            </td>

            {/* Địa điểm */}
            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                {application.location}
            </td>

            {/* Trạng thái */}
            <td className='px-6 py-4 whitespace-nowrap'>
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(application.applicationStatus)}`}>
                    {getStatusText(application.applicationStatus)}
                </span>
            </td>
        </tr>
    );
}
