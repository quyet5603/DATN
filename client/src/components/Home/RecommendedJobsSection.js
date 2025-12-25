import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
                const response = await fetch('http://localhost:8080/api/ai/recommended-jobs', {
                    headers: {
                        'Authorization': authToken.startsWith('Bearer') ? authToken : `Bearer ${authToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.recommendedJobs) {
                        // Lấy top 5 jobs
                        setRecommendedJobs(data.recommendedJobs.slice(0, 5));
                    }
                }
            } catch (error) {
                console.error('Error fetching recommended jobs:', error);
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
                    🎯 Việc làm gợi ý cho bạn
                </h2>
                <p className='text-gray-600 text-sm md:text-base'>
                    Dựa trên CV của bạn, đây là những công việc phù hợp nhất
                </p>
            </div>
            
            {recommendedJobs.length > 0 ? (
                <>
                    <div className='w-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
                        {recommendedJobs.map((job) => (
                            <RecommendedJobCard key={job._id} job={job} />
                        ))}
                    </div>
                    <div className='text-center mt-6'>
                        <Link
                            to='/recommended-jobs'
                            className='inline-block bg-primary text-white text-sm font-medium py-2 px-6 rounded-md hover:opacity-90 transition-opacity'
                        >
                            Xem tất cả việc làm gợi ý
                        </Link>
                    </div>
                </>
            ) : (
                <div className='text-center py-8 bg-white rounded-lg shadow-sm'>
                    <p className='text-gray-600 text-lg mb-4'>Bạn chưa có việc làm được gợi ý.</p>
                    <p className='text-gray-500 text-sm mb-4'>
                        Để nhận gợi ý công việc phù hợp, vui lòng:
                    </p>
                    <ul className='text-gray-500 text-sm mb-6 space-y-2'>
                        <li>• Tải CV lên hệ thống</li>
                        <li>• Cập nhật đầy đủ thông tin hồ sơ</li>
                    </ul>
                    <Link
                        to={`/cv-upload/${loginData?._id || ''}`}
                        className='inline-block bg-primary text-white text-sm font-medium py-2 px-6 rounded-md hover:opacity-90 transition-opacity'
                    >
                        Tải CV ngay
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

    return (
        <div className='border border-gray-200 shadow-md hover:shadow-xl rounded-lg p-4 transition-all duration-300 bg-white relative'>
            {/* Match Score Badge */}
            {matchScore > 0 && (
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold border ${getScoreColor(matchScore)}`}>
                    {matchScore}%
                </div>
            )}
            
            <div className='mb-3'>
                <h3 className='font-bold text-base text-gray-800 truncate mb-1'>{job.jobTitle}</h3>
                <p className='text-xs text-gray-600 mb-1'>
                    <box-icon size='12px' name='pin'></box-icon>
                    <span className='ml-1'>{job.location}</span>
                </p>
                <p className='text-xs text-gray-600'>
                    <box-icon size='12px' name='time'></box-icon>
                    <span className='ml-1'>{job.employmentType}</span>
                </p>
            </div>
            
            <div className='mb-3'>
                <p className='text-xs text-gray-700 line-clamp-2'>{job.description?.substring(0, 100)}...</p>
            </div>
            
            <Link to={`/current-job/${job._id}`} className='block w-full'>
                <button className='w-full bg-primary text-white text-xs font-medium py-2 px-3 rounded-md hover:opacity-90 transition-opacity'>
                    Xem chi tiết
                </button>
            </Link>
        </div>
    );
}

