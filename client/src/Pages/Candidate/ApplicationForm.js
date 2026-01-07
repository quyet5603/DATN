import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

export const ApplicationForm = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState([]);
    const [loginData, setLoginData] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [hasCV, setHasCV] = useState(false);
    const [loadingCV, setLoadingCV] = useState(true);

    // Load user data from localStorage
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            const token = localStorage.getItem('usertoken');
            
            if (!userStr || !token) {
                toast.error('Vui lòng đăng nhập để ứng tuyển');
                navigate('/login');
                return;
            }
            
            const user = JSON.parse(userStr);
            setLoginData(user);
        } catch (error) {
            console.error('Error loading user data:', error);
            toast.error('Lỗi khi tải thông tin người dùng');
            navigate('/login');
        }
    }, [navigate]);

    // Kiểm tra CV của user
    useEffect(() => {
        const checkCV = async () => {
            const token = localStorage.getItem('usertoken');
            if (!token) {
                setHasCV(false);
                setLoadingCV(false);
                return;
            }

            setLoadingCV(true);
            try {
                const response = await fetch('http://localhost:8080/api/cv/list', {
                    headers: {
                        'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Kiểm tra xem có ít nhất 1 CV active không
                    const hasActiveCV = data.cvs && data.cvs.length > 0;
                    setHasCV(hasActiveCV);
                    
                    if (!hasActiveCV) {
                        toast.error('Vui lòng tải CV lên trước khi ứng tuyển');
                        setTimeout(() => {
                            navigate('/cv/manager');
                        }, 2000);
                    }
                } else {
                    // Nếu lỗi 401, không có CV
                    if (response.status === 401) {
                        setHasCV(false);
                        toast.error('Vui lòng tải CV lên trước khi ứng tuyển');
                        setTimeout(() => {
                            navigate('/cv/manager');
                        }, 2000);
                    } else {
                        setHasCV(false);
                        toast.error('Không thể kiểm tra CV. Vui lòng thử lại.');
                    }
                }
            } catch (error) {
                console.error('Error checking CV:', error);
                setHasCV(false);
                toast.error('Lỗi khi kiểm tra CV');
            } finally {
                setLoadingCV(false);
            }
        };

        if (loginData) {
            checkCV();
        }
    }, [loginData, navigate]);

    const handleSubmit = async () => {
        if (hasSubmitted) return; // Tránh submit nhiều lần
        if (!loginData || !loginData._id) return;
        
        // Kiểm tra CV - BẮT BUỘC phải có CV trước khi ứng tuyển
        if (!hasCV) {
            toast.error('Vui lòng tải CV lên trước khi ứng tuyển. Đang chuyển đến trang Tạo CV...');
            navigate('/cv/manager');
            return;
        }
        
        setHasSubmitted(true);

        const candidateID = loginData._id;
        const newData = { 
            jobID: id,
            candidateID: candidateID,
            applicationStatus: "active",
            applicationForm: [],
            candidateFeedback: []
        };

        try {
            // send data to backend API
            const applicationResponse = await fetch("http://localhost:8080/application/post-application", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(newData),
            });

            const applicationResult = await applicationResponse.json();
            
            if (!applicationResponse.ok) {
                throw new Error(applicationResult.message || 'Lỗi khi gửi đơn ứng tuyển');
            }

            // Update job with candidate
            await fetch("http://localhost:8080/jobs/update-job-by-candidate", {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    jobID: id,
                    candidateID: candidateID,
                    status: "active"                
                }),
            });

            // Update user with application
            await fetch("http://localhost:8080/users/update-user-by-candidate", {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    jobID: id,
                    candidateID: candidateID,
                    status: "active"                
                }),
            });

            toast.success('Đơn ứng tuyển đã được gửi thành công!');
            
            // Redirect sau 2 giây
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi gửi đơn ứng tuyển');
            setHasSubmitted(false); // Reset để có thể thử lại
        }
    };

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await fetch(`http://localhost:8080/jobs/current-job/${id}`);
                const data = await response.json();
                setJob(data);
            } catch (error) {
                console.log(error);
            }
        };
        
        fetchJob();
    }, [id]);

    // Auto submit khi loginData, job và CV đã sẵn sàng
    useEffect(() => {
        if (hasSubmitted) return;
        if (loadingCV) return; // Đợi kiểm tra CV xong
        if (!hasCV) return; // Không có CV thì không submit
        
        if (loginData && loginData._id && job && job.jobTitle && hasCV) {
            handleSubmit();
        }
    }, [loginData, job, hasSubmitted, hasCV, loadingCV]);

    return (
        <div className='max-w-scren-2xl w-full md:w-4/6 lg:w-1/2 container mt-2 mx-auto xl:px-24 px-4 '>
            <div className=' bg-[#e7e7e7] mx-auto py-6 px-6 md:px-16 rounded-lg'>
                <div className='w-full'>
                    <div>
                        <h1 className='text-xl my-1 font-bold text-center'>Đơn ứng tuyển</h1>
                        <h1 className='text-md mb-2 font-bold text-center text-gray-700'>Vị trí {job.jobTitle}</h1>
                    </div>
                    
                    <div className='mt-6 text-center'>
                        {loadingCV ? (
                            <div>
                                <p className='text-gray-600 mb-4'>Đang kiểm tra CV...</p>
                            </div>
                        ) : !hasCV ? (
                            <div>
                                <p className='text-red-600 mb-4 font-semibold'>⚠️ Bạn cần tải CV lên trước khi ứng tuyển</p>
                                <p className='text-gray-600 mb-4'>Đang chuyển đến trang Tạo CV...</p>
                                <Link 
                                    to="/cv/manager"
                                    className='inline-block bg-blue-600 text-white text-sm font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition-colors'
                                >
                                    📄 Đi đến trang Tạo CV
                                </Link>
                            </div>
                        ) : (
                            <p className='text-gray-600 mb-4'>Đang gửi đơn ứng tuyển...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
