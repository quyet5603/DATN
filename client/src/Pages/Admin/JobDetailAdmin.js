import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const JobDetailAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/current-job/${id}`);
            if (response.ok) {
                const data = await response.json();
                setJob(data);
            } else {
                toast.error('Không thể tải thông tin công việc');
                navigate('/admin/jobs');
            }
        } catch (error) {
            console.error('Error fetching job:', error);
            toast.error('Lỗi khi tải thông tin công việc');
            navigate('/admin/jobs');
        } finally {
            setLoading(false);
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }
        } catch (e) {
            console.error('Error parsing date:', e);
        }
        return 'N/A';
    };


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

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center py-20">
                        <p className="text-gray-600">Không tìm thấy công việc</p>
                        <Link to="/admin/jobs" className="mt-4 text-blue-600 hover:underline">
                            Quay lại danh sách
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const companyName = job.employerId?.userName || job.employerId?.companyTitle || 'N/A';
    const companyLocation = job.employerId?.companyLocation || 'N/A';
    const companyWebsite = job.employerId?.companyWebsite || '';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        to="/admin/jobs"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <box-icon name='arrow-back' size='20px' color='#4B5563'></box-icon>
                        <span className="font-medium">Quay lại</span>
                    </Link>
                </div>

                {/* Title Section */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết việc làm</h1>
                    <p className="text-gray-600">Xem thông tin chi tiết của việc làm</p>
                </div>

                {/* Job Overview */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{job.jobTitle || 'N/A'}</h2>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-600">
                            <box-icon name='map' size='20px' color='#6B7280'></box-icon>
                            <span className="font-medium">{job.location || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <box-icon name='dollar' size='20px' color='#6B7280'></box-icon>
                            <span className="font-medium">{job.salary || 'Thỏa thuận'}</span>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-sm font-medium border ${getEmploymentTypeColor(job.employmentType)}`}>
                            {job.employmentType || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Company Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin công ty</h3>
                    <p className="text-lg font-semibold text-gray-800 mb-3">{companyName}</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <box-icon name='map' size='18px' color='#6B7280'></box-icon>
                            <span>{companyLocation}</span>
                        </div>
                        {companyWebsite && (
                            <div className="flex items-center gap-2">
                                <a
                                    href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {companyWebsite}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Job Details Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Mô tả công việc</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{job.description || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Yêu cầu</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                        {job.jobRequirement ? (
                                            <ul className="list-disc list-inside space-y-1">
                                                {job.jobRequirement.split('\n').map((req, idx) => (
                                                    <li key={idx}>{req.trim()}</li>
                                                ))}
                                            </ul>
                                        ) : 'N/A'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Quyền lợi</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                        {job.benefits ? (
                                            <ul className="list-disc list-inside space-y-1">
                                                {job.benefits.split('\n').map((benefit, idx) => (
                                                    <li key={idx}>{benefit.trim()}</li>
                                                ))}
                                            </ul>
                                        ) : 'N/A'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Cấp bậc</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{job.level || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Số lượng tuyển</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <box-icon name='user' size='18px' color='#6B7280'></box-icon>
                                            <span>{job.quantity || 1} người</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Yêu cầu giới tính</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{job.genderRequirement || 'Không yêu cầu'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Yêu cầu bằng cấp</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{job.educationRequirement || 'Không yêu cầu'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Yêu cầu kinh nghiệm</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{job.experienceRequirement || 'Không yêu cầu'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Địa chỉ cụ thể</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{job.specificAddress || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Hạn ứng tuyển</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <box-icon name='calendar' size='18px' color='#6B7280'></box-icon>
                                            <span>{formatDate(job.deadline)}</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Danh mục</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                        {job.category ? (
                                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium border border-gray-200">
                                                {job.category}
                                            </span>
                                        ) : 'N/A'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

