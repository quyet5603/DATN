import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const CandidateDetail = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    
    const [application, setApplication] = useState(null);
    const [candidate, setCandidate] = useState(null);
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('active');
    const [showCVModal, setShowCVModal] = useState(false);
    const [cvSections, setCvSections] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch application
                const appResponse = await fetch(`${API_BASE_URL}/application/all-application`);
                if (!appResponse.ok) {
                    throw new Error('Failed to fetch applications');
                }
                const allApplications = await appResponse.json();
                const app = allApplications.find(a => a._id === applicationId);
                
                if (!app) {
                    toast.error('Không tìm thấy đơn ứng tuyển');
                    navigate('/employer/cv-management');
                    return;
                }
                
                setApplication(app);
                setStatus(app.applicationStatus || 'active');
                
                // Debug: log để kiểm tra dữ liệu
                console.log('Application data:', {
                    _id: app._id,
                    createdAt: app.createdAt,
                    updatedAt: app.updatedAt,
                    hasTimestamps: !!(app.createdAt || app.updatedAt)
                });
                
                // Fetch candidate
                const candidateResponse = await fetch(`${API_BASE_URL}/users/user/${app.candidateID}`);
                if (!candidateResponse.ok) {
                    throw new Error('Failed to fetch candidate');
                }
                const candidateData = await candidateResponse.json();
                setCandidate(candidateData);
                
                // Fetch job
                const jobResponse = await fetch(`${API_BASE_URL}/jobs/current-job/${app.jobID}`);
                if (!jobResponse.ok) {
                    throw new Error('Failed to fetch job');
                }
                const jobData = await jobResponse.json();
                setJob(jobData);
                
                // Get CV sections
                if (candidateData.cvSections) {
                    setCvSections({
                        introduction: candidateData.cvSections.introduction || '',
                        education: Array.isArray(candidateData.cvSections.education) ? candidateData.cvSections.education : [],
                        experience: Array.isArray(candidateData.cvSections.experience) ? candidateData.cvSections.experience : [],
                        skills: Array.isArray(candidateData.cvSections.skills) ? candidateData.cvSections.skills : [],
                        languages: Array.isArray(candidateData.cvSections.languages) ? candidateData.cvSections.languages : [],
                        projects: Array.isArray(candidateData.cvSections.projects) ? candidateData.cvSections.projects : [],
                        certificates: Array.isArray(candidateData.cvSections.certificates) ? candidateData.cvSections.certificates : [],
                        awards: Array.isArray(candidateData.cvSections.awards) ? candidateData.cvSections.awards : []
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Không thể tải dữ liệu');
            } finally {
                setIsLoading(false);
            }
        };

        if (applicationId) {
            fetchData();
        }
    }, [applicationId, navigate]);

    const handleStatusChange = async (newStatus) => {
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) {
                toast.error('Vui lòng đăng nhập');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/application/update-status/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setStatus(newStatus);
                toast.success('Đã cập nhật trạng thái thành công');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(errorData.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const handleViewCV = () => {
        setShowCVModal(true);
    };

    const handleDownloadCV = () => {
        if (!candidate?.cvFilePath) {
            toast.error('CV không có sẵn để tải xuống');
            return;
        }
        
        const cvUrl = `${API_BASE_URL.replace('/api', '')}/uploads/${candidate.cvFilePath}`;
        const link = document.createElement('a');
        link.href = cvUrl;
        link.download = candidate.cvTitle || 'CV.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
            'active': 'bg-blue-100 text-blue-800',
            'shortlist': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'inactive': 'bg-gray-100 text-gray-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
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
        
        // Fallback: sử dụng thời gian hiện tại nếu không có dữ liệu
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!application || !candidate || !job) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center py-20 text-gray-500">
                        <p>Không tìm thấy dữ liệu</p>
                        <button
                            onClick={() => navigate('/employer/cv-management')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/employer/cv-management')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <box-icon name='chevron-left' size='20px' color='#4B5563'></box-icon>
                        <span className="font-medium">Quay lại</span>
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết ứng viên</h1>
                            <p className="text-gray-600">Xem thông tin và quản lý trạng thái ứng viên</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
                            <select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium"
                            >
                                <option value="active">Chờ xử lý</option>
                                <option value="shortlist">Đã chấp nhận</option>
                                <option value="rejected">Đã từ chối</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Candidate Information Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin ứng viên</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <p className="text-gray-900 font-semibold">{candidate.userName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900">{candidate.userEmail || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <p className="text-gray-900">{candidate.phoneNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí ứng tuyển</label>
                                <p className="text-gray-900">{job.jobTitle || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề CV</label>
                                <p className="text-gray-900">{candidate.cvTitle || 'CV'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                    {getStatusLabel(status)}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ứng tuyển</label>
                                <p className="text-gray-900">{formatDate(application.createdAt || application.updatedAt, application._id || applicationId)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
                        <button
                            onClick={handleViewCV}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <box-icon name='show' size='20px' color='#ffffff'></box-icon>
                            <span>Xem CV</span>
                        </button>
                        <button
                            onClick={handleDownloadCV}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <box-icon name='download' size='20px' color='#ffffff'></box-icon>
                            <span>Tải xuống CV</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* CV Template Modal */}
            {showCVModal && candidate && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={() => setShowCVModal(false)}>
                    <div className='bg-gray-100 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className='sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10'>
                            <h2 className='text-xl font-bold text-gray-800'>CV - {candidate.userName}</h2>
                            <button
                                onClick={() => setShowCVModal(false)}
                                className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <box-icon name='x' size='24px'></box-icon>
                            </button>
                        </div>

                        {/* CV Template Content */}
                        <div className='p-4'>
                            <div 
                                className="bg-white shadow-lg mx-auto"
                                style={{ 
                                    width: '210mm', 
                                    minHeight: '297mm',
                                    padding: '20mm'
                                }}
                            >
                                {/* Header Section */}
                                <div className="flex items-center gap-6 mb-8 pb-6 border-b-2 border-gray-300">
                                    <div className="flex-shrink-0">
                                        {candidate.avatar ? (
                                            <img 
                                                src={`${API_BASE_URL.replace('/api', '')}/uploads/${candidate.avatar}`} 
                                                alt="Avatar" 
                                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-300">
                                                <span className="text-4xl text-gray-600 font-bold">
                                                    {candidate.userName?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{candidate.userName || 'N/A'}</h1>
                                        <p className="text-lg text-gray-600 mb-2">{candidate.position || 'Chưa cập nhật'}</p>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p><strong>Email:</strong> {candidate.userEmail || 'N/A'}</p>
                                            <p><strong>Điện thoại:</strong> {candidate.phoneNumber || 'N/A'}</p>
                                            {candidate.address && <p><strong>Địa chỉ:</strong> {candidate.address}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Introduction */}
                                {cvSections?.introduction && (
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Giới thiệu bản thân</h2>
                                        <p className="text-gray-700 whitespace-pre-wrap">{cvSections.introduction}</p>
                                    </div>
                                )}

                                {/* Education */}
                                {cvSections?.education && cvSections.education.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Học vấn</h2>
                                        {cvSections.education.map((edu, idx) => (
                                            <div key={idx} className="mb-3">
                                                <p className="font-semibold text-gray-800">{edu.major || 'N/A'}</p>
                                                <p className="text-gray-600">{edu.school || 'N/A'} • {edu.from || ''} {edu.isCurrent ? '- Hiện tại' : edu.to ? `- ${edu.to}` : ''}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Experience */}
                                {cvSections?.experience && cvSections.experience.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Kinh nghiệm làm việc</h2>
                                        {cvSections.experience.map((exp, idx) => (
                                            <div key={idx} className="mb-4">
                                                <p className="font-semibold text-gray-800">{exp.position || 'N/A'} tại {exp.company || 'N/A'}</p>
                                                <p className="text-gray-600 text-sm mb-2">{exp.from || ''} {exp.isCurrent ? '- Hiện tại' : exp.to ? `- ${exp.to}` : ''}</p>
                                                {exp.description && <p className="text-gray-700 text-sm whitespace-pre-wrap">{exp.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Skills */}
                                {cvSections?.skills && cvSections.skills.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Kỹ năng</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {cvSections.skills.map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                                                    {skill.skill || skill} {skill.experience ? `(${skill.experience})` : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Languages */}
                                {cvSections?.languages && cvSections.languages.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Ngoại ngữ</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {cvSections.languages.map((lang, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                                                    {lang.language || lang} ({lang.level || 'N/A'})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Projects */}
                                {cvSections?.projects && cvSections.projects.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Dự án nổi bật</h2>
                                        {cvSections.projects.map((proj, idx) => (
                                            <div key={idx} className="mb-3">
                                                <p className="font-semibold text-gray-800">{proj.name || 'N/A'}</p>
                                                <p className="text-gray-600 text-sm mb-1">
                                                    {proj.startMonth}/{proj.startYear} {proj.isCurrent ? '- Hiện tại' : proj.endMonth && proj.endYear ? `- ${proj.endMonth}/${proj.endYear}` : ''}
                                                </p>
                                                {proj.description && <p className="text-gray-700 text-sm whitespace-pre-wrap">{proj.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Certificates */}
                                {cvSections?.certificates && cvSections.certificates.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Chứng chỉ</h2>
                                        {cvSections.certificates.map((cert, idx) => (
                                            <div key={idx} className="mb-2">
                                                <p className="font-semibold text-gray-800">{cert.name || 'N/A'}</p>
                                                <p className="text-gray-600 text-sm">{cert.organization || 'N/A'} • {cert.year || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Awards */}
                                {cvSections?.awards && cvSections.awards.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Giải thưởng</h2>
                                        {cvSections.awards.map((award, idx) => (
                                            <div key={idx} className="mb-2">
                                                <p className="font-semibold text-gray-800">{award.name || 'N/A'}</p>
                                                <p className="text-gray-600 text-sm">{award.organization || 'N/A'} • {award.year || 'N/A'}</p>
                                                {award.description && <p className="text-gray-700 text-sm mt-1">{award.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

