import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../../utils/api';
import API_BASE_URL from '../../config/api';
import logoURL from '../../assets/img/logo.png';

export const RecommendedJobsSection = () => {
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loginData, setLoginData] = useState(null);

    useEffect(() => {
        // Check login
        const token = localStorage.getItem('user');
        if (token) {
            try {
                const user = JSON.parse(token);
                setLoginData(Array.isArray(user) ? user[0] : user);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchRecommendedJobs = async () => {
            if (!loginData || loginData.role !== 'candidate') {
                setLoading(false);
                return;
            }

            const authToken = localStorage.getItem('usertoken');
            if (!authToken) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await apiCall('/api/ai/recommended-jobs', {
                    headers: {
                        'Authorization': authToken.startsWith('Bearer') ? authToken : `Bearer ${authToken}`
                    }
                });

                // Handle 401 Unauthorized - token expired or invalid
                if (response.status === 401) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('API error (401):', errorData);
                    
                    // Clear expired token and user data silently (don't show error on home page)
                    localStorage.removeItem('usertoken');
                    localStorage.removeItem('user');
                    
                    // Set empty array and hide section
                    setRecommendedJobs([]);
                    setLoginData(null);
                    setLoading(false);
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    console.log('Recommended jobs data:', data);
                    if (data.success && (data.recommendedJobs || data.jobs)) {
                        // Lấy top 5 jobs từ recommendedJobs hoặc jobs
                        const jobs = data.recommendedJobs || data.jobs || [];
                        setRecommendedJobs(jobs.slice(0, 5));
                    }
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('API error:', errorData);
                    // Nếu lỗi, vẫn set empty array để hiển thị message
                    setRecommendedJobs([]);
                }
            } catch (error) {
                console.error('Error fetching recommended jobs:', error);
                // Handle network errors gracefully
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    console.warn('Network error: Server may not be running or CORS issue');
                }
                setRecommendedJobs([]);
            } finally {
                setLoading(false);
            }
        };

        if (loginData) {
            fetchRecommendedJobs();
        } else {
            setLoading(false);
        }
    }, [loginData]);

    if (!loginData || loginData.role !== 'candidate') {
        return null; // Không hiển thị nếu không phải candidate
    }

    if (loading) {
        return (
            <div className='max-w-screen-2xl container mx-auto px-4 py-12 bg-gray-50'>
                <div className='mb-6 text-center'>
                    <h2 className='text-2xl md:text-3xl font-bold text-primary mb-2'>
                        🎯 Việc làm gợi ý cho bạn
                    </h2>
                </div>
                <div className='text-center text-gray-500 py-8'>Đang tải...</div>
            </div>
        );
    }

    return (
        <div className='max-w-screen-2xl container mx-auto px-4 py-12 bg-gray-50'>
            <div className='mb-6 text-center'>
                <h2 className='text-2xl md:text-3xl font-bold text-primary mb-2'>
                    🤖 Việc làm gợi ý AI cho bạn
                </h2>
                <p className='text-gray-600 text-sm md:text-base'>
                    AI phân tích CV của bạn và đề xuất những công việc phù hợp nhất
                </p>
            </div>
            
            {recommendedJobs.length > 0 ? (
                <>
                    <div className='w-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
                        {recommendedJobs.map((job) => (
                            <RecommendedJobCard key={job.jobId || job._id} job={job} />
                        ))}
                    </div>
                    <div className='text-center mt-6'>
                        <Link
                            to='/recommended-jobs'
                            className='inline-block bg-secondary text-white text-sm font-medium py-2 px-6 rounded-md hover:opacity-90 transition-opacity'
                        >
                            Xem tất cả việc làm gợi ý
                        </Link>
                    </div>
                </>
            ) : (
                <div className='text-center py-8 bg-white rounded-lg shadow-sm'>
                    <p className='text-gray-600 text-lg mb-4'>Chưa có việc làm được gợi ý.</p>
                    <p className='text-gray-500 text-sm mb-4'>
                        Để nhận gợi ý công việc phù hợp từ AI, vui lòng:
                    </p>
                    <ul className='text-gray-500 text-sm mb-6 space-y-2'>
                        <li>• Vào phần <strong>"Tạo CV"</strong> và tải CV lên hệ thống</li>
                        <li>• Đặt CV làm mặc định để AI có thể phân tích</li>
                        <li>• AI sẽ tự động match CV với các công việc và tính điểm phù hợp</li>
                    </ul>
                    <Link
                        to="/cv/manager"
                        className='inline-block bg-secondary text-white text-sm font-medium py-2 px-6 rounded-md hover:opacity-90 transition-opacity'
                    >
                        🤖 Quản lý CV để nhận gợi ý AI
                    </Link>
                </div>
            )}
        </div>
    );
};

function RecommendedJobCard({ job }) {
    const matchScore = job.matchScore || 0;
    const getScoreColor = (score) => {
        if (score >= 80) return 'bg-green-100 text-green-700 border-green-300';
        if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return 'bg-red-100 text-red-700 border-red-300';
    };

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
        <div className='border border-gray-200 shadow-md hover:shadow-xl rounded-lg p-4 transition-all duration-300 bg-white relative'>
            {/* Match Score Badge */}
            {matchScore > 0 && (
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold border ${getScoreColor(matchScore)}`}>
                    {matchScore}%
                </div>
            )}
            
            {/* Job Title - Clickable */}
            <Link to={`/current-job/${job.jobId || job._id}`}>
                <h3 className='font-bold text-base text-gray-800 mb-3 hover:text-secondary transition-colors cursor-pointer'>
                    {job.jobTitle}
                </h3>
            </Link>
            
            {/* Company Logo and Name */}
            <div className='flex items-center gap-2 mb-3'>
                {companyAvatar ? (
                    <img src={companyAvatar} alt={companyName} className='w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0' />
                ) : (
                    <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-gray-200 flex-shrink-0'>
                        <span className='text-white font-bold text-sm'>{companyInitial}</span>
                    </div>
                )}
                <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-xs text-gray-700 truncate'>{companyName}</p>
                </div>
            </div>
            
            {/* Company Information */}
            <div className='space-y-1.5 mb-3'>
                {companyEmail && (
                    <div className='flex items-center text-gray-600 text-xs'>
                        <box-icon size='12px' name='envelope' color='#6B7280'></box-icon>
                        <span className='ml-2 truncate'>{companyEmail}</span>
                    </div>
                )}
                {companyAddress && (
                    <div className='flex items-center text-gray-600 text-xs'>
                        <box-icon size='12px' name='map' color='#6B7280'></box-icon>
                        <span className='ml-2 truncate'>{companyAddress}</span>
                    </div>
                )}
                <div className='flex items-center text-gray-600 text-xs'>
                    <box-icon size='12px' name='time' color='#6B7280'></box-icon>
                    <span className='ml-2'>{job.employmentType}</span>
                </div>
                <div className='flex items-center text-gray-600 text-xs'>
                    <box-icon size='12px' name='pin' color='#6B7280'></box-icon>
                    <span className='ml-2'>{job.location}</span>
                </div>
            </div>
        </div>
    );
}

