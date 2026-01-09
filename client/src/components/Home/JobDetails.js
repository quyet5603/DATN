import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { LoginContext } from '../ContextProvider/Context'
import 'boxicons'
import API_BASE_URL from '../../config/api'

export const JobDetails = () => {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            candidateID: "",
            jobID: "",
            applicationStatus: "active",
            resume: null,
            applicationForm: [{
                question: "",
                answer: ""
            }],
            candidateFeedback: [{
                question: "",
                answer: ""
            }]
        }
    })

    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState();
    const [applicants, setApplicants] = useState();
    const [applicationsCount, setApplicationsCount] = useState(0);
    const [shortlistedCount, setShortlistedCount] = useState(0);
    const [hasCV, setHasCV] = useState(false);
    const [loadingCV, setLoadingCV] = useState(false);
    const [profileComplete, setProfileComplete] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);

    const [loginData, setLoginData] = useState();
    
    useEffect(() => {
        let token = localStorage.getItem("user");
        if (token) {
            const user = JSON.parse(token);
            setLoginData(user)
            console.log(user);
        }
    }, [])

    useEffect(() => {
        fetch(`http://localhost:8080/jobs/current-job/${id}`).then(res => res.json()).then(
            data => { 
                setJob(data); 
                console.log(data); 
            }
        );
        
        // Fetch số lượng ứng viên thực tế
        fetch(`http://localhost:8080/application/all-application/`)
            .then(res => res.json())
            .then(data => {
                const jobApplications = data.filter(app => app.jobID === id);
                setApplicationsCount(jobApplications.length);
                
                // Đếm số lượng shortlisted
                const shortlisted = jobApplications.filter(
                    app => app.applicationStatus === 'shortlist'
                );
                setShortlistedCount(shortlisted.length);
            })
            .catch(error => {
                console.error('Error fetching applications count:', error);
            });
    }, [id]);

    // Kiểm tra CV của user
    useEffect(() => {
        const checkCV = async () => {
            if (!loginData || loginData.role !== 'candidate') {
                setHasCV(false);
                return;
            }
            
            const token = localStorage.getItem('usertoken');
            if (!token) {
                setHasCV(false);
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
                } else {
                    // Nếu lỗi 401, không có CV
                    if (response.status === 401) {
                        setHasCV(false);
                    } else {
                        // Lỗi khác, giả sử không có CV để an toàn
                        setHasCV(false);
                    }
                }
            } catch (error) {
                console.error('Error checking CV:', error);
                setHasCV(false);
            } finally {
                setLoadingCV(false);
            }
        };

        if (loginData) {
            checkCV();
        }
    }, [loginData]);

    // Kiểm tra thông tin "Hồ sơ cá nhân" đã đầy đủ chưa
    useEffect(() => {
        const checkProfileComplete = async () => {
            if (!loginData || loginData.role !== 'candidate') {
                setProfileComplete(false);
                return;
            }

            const token = localStorage.getItem('usertoken');
            if (!token) {
                setProfileComplete(false);
                return;
            }

            setLoadingProfile(true);
            try {
                // Lấy thông tin user từ API
                const userResponse = await fetch(`${API_BASE_URL}/users/user/${loginData._id}`, {
                    headers: {
                        'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    
                    // Kiểm tra các trường BẮT BUỘC trong Personal Info
                    const hasRequiredPersonalInfo = 
                        userData.userName && userData.userName.trim() !== '' &&
                        userData.userEmail && userData.userEmail.trim() !== '' &&
                        userData.phoneNumber && userData.phoneNumber.trim() !== '' &&
                        userData.address && userData.address.trim() !== '';

                    // Kiểm tra CV Sections từ localStorage hoặc database
                    let sections = null;
                    const savedSections = localStorage.getItem('cvSections');
                    if (savedSections) {
                        try {
                            sections = JSON.parse(savedSections);
                        } catch (e) {
                            console.error('Error parsing cvSections:', e);
                        }
                    }

                    // Nếu không có trong localStorage, lấy từ database
                    if (!sections && userData.cvSections) {
                        sections = userData.cvSections;
                    }

                    // Kiểm tra các section QUAN TRỌNG (ít nhất phải có một trong các mục này)
                    // Yêu cầu: Giới thiệu bản thân HOẶC Học vấn HOẶC Kinh nghiệm làm việc
                    const hasImportantSections = sections && (
                        (sections.introduction && sections.introduction.trim() !== '') ||
                        (sections.education && sections.education.length > 0) ||
                        (sections.experience && sections.experience.length > 0)
                    );

                    // Profile được coi là đầy đủ nếu:
                    // 1. Có đủ thông tin cá nhân bắt buộc (Họ tên, Email, SĐT, Địa chỉ)
                    // 2. Có ít nhất một trong các section quan trọng (Giới thiệu, Học vấn, hoặc Kinh nghiệm)
                    // LƯU Ý: Không yêu cầu điền TẤT CẢ các trường (Kỹ năng, Ngoại ngữ, Dự án, Chứng chỉ, Giải thưởng là tùy chọn)
                    setProfileComplete(hasRequiredPersonalInfo && hasImportantSections);
                } else {
                    setProfileComplete(false);
                }
            } catch (error) {
                console.error('Error checking profile:', error);
                setProfileComplete(false);
            } finally {
                setLoadingProfile(false);
            }
        };

        if (loginData) {
            checkProfileComplete();
        }
    }, [loginData]);


    useEffect(() => {
        // Chỉ fetch applicants data nếu user là employer hoặc admin
        // Candidate không cần xem danh sách applicants
        if (job && job.applicants && job.applicants.length > 0 && loginData && (loginData.role === 'employer' || loginData.role === 'admin')) {
            const fetchApplicantsData = async () => {
                try {
                    const token = localStorage.getItem('usertoken');
                    if (!token) {
                        console.warn('No token for fetching applicants data');
                        return;
                    }

                    const response = await fetch(`http://localhost:8080/users/all-users`, {
                        headers: {
                            'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) {
                        // Không throw error, chỉ log để không ảnh hưởng đến trải nghiệm
                        if (response.status === 401) {
                            console.warn('Unauthorized to fetch applicants data');
                        } else {
                            console.warn('Failed to fetch applicants data:', response.status);
                        }
                        return;
                    }

                    const data = await response.json();

                    const filteredApplicants = data.filter(app => {
                        return job.applicants.some(jobApplicant => jobApplicant.applicant === app._id);
                    });

                    setApplicants(filteredApplicants);
                } catch (error) {
                    // Chỉ log error, không ảnh hưởng đến UI
                    console.warn('Error fetching applicants data:', error.message);
                }
            };

            fetchApplicantsData();
        } else {
            // Nếu không phải employer/admin hoặc không có applicants, set empty array
            setApplicants([]);
        }
    }, [job, loginData]);


    const handleApplyClick = (e) => {
        e.preventDefault();
        
        // Kiểm tra đăng nhập
        const token = localStorage.getItem('usertoken');
        const user = localStorage.getItem('user');
        if (!token || !user) {
            toast.error('Vui lòng đăng nhập để ứng tuyển');
            navigate('/login');
            return;
        }

        // Kiểm tra job status
        if (job && job.status === 'filled') {
            toast.error('Công việc này đã đủ số lượng ứng viên');
            return;
        }

        // Kiểm tra CV file upload - BẮT BUỘC phải có CV trước khi ứng tuyển
        if (!hasCV) {
            toast.error('Vui lòng tải CV lên trước khi ứng tuyển. Vào phần "Hồ sơ cá nhân" để tải CV.');
            navigate('/cv/manager');
            return;
        }

        // Kiểm tra thông tin "Hồ sơ cá nhân" đã đầy đủ chưa
        if (!profileComplete) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc trong "Hồ sơ cá nhân" trước khi ứng tuyển. Yêu cầu: Họ tên, Email, Số điện thoại, Địa chỉ và ít nhất một trong: Giới thiệu bản thân, Học vấn, hoặc Kinh nghiệm làm việc.');
            navigate('/cv/manager');
            return;
        }

        // Redirect đến trang application form
        navigate(`/application-form/${id}`);
    }

    // Calculate weeks ago
    const getWeeksAgo = (date) => {
        if (!date) return 'N/A';
        const jobDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - jobDate);
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks > 0 ? `${diffWeeks} tuần trước` : 'Vừa đăng';
    };

    // Format date for display
    const getFormattedDate = () => {
        let dateToUse = job?.createdAt || job?.updatedAt;
        if (!dateToUse && job?._id) {
            try {
                const idStr = job._id.toString();
                if (idStr.length === 24) {
                    const timestampHex = idStr.substring(0, 8);
                    const timestamp = parseInt(timestampHex, 16) * 1000;
                    dateToUse = new Date(timestamp);
                }
            } catch (e) {
                console.error('Error parsing ObjectId timestamp:', e);
            }
        }
        return dateToUse;
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex flex-col lg:flex-row gap-8'>
                    {/* LEFT COLUMN - JOB DETAILS */}
                    {job && (
                        <div className='w-full lg:w-2/3'>
                            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8'>
                                {/* Job Title */}
                                <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-2'>
                                    {job.jobTitle}
                                </h1>
                                
                                {/* Company Name */}
                                {job.employerId && (
                                    <p className='text-lg text-gray-600 mb-6'>
                                        {job.employerId.userName || 'Công ty'}
                                    </p>
                                )}

                                {/* Salary */}
                                {job.salary && (
                                    <div className='mb-6'>
                                        <span className='text-2xl font-bold text-green-600'>
                                            $ {job.salary}
                                        </span>
                                    </div>
                                )}

                                {/* Location, Work Type, Posted Date */}
                                <div className='space-y-3 mb-6'>
                                    {job.specificAddress && (
                                        <div className='flex items-center gap-2 text-gray-700'>
                                            <box-icon name='map' size='20px' color='#6B7280'></box-icon>
                                            <span>{job.specificAddress}</span>
                                        </div>
                                    )}
                                    {!job.specificAddress && job.location && (
                                        <div className='flex items-center gap-2 text-gray-700'>
                                            <box-icon name='map' size='20px' color='#6B7280'></box-icon>
                                            <span>{job.location}</span>
                                        </div>
                                    )}
                                    
                                    <div className='flex items-center gap-2 text-gray-700'>
                                        <box-icon name='building' size='20px' color='#6B7280'></box-icon>
                                        <span>Làm việc tại văn phòng</span>
                                    </div>
                                    
                                    {getFormattedDate() && (
                                        <div className='flex items-center gap-2 text-gray-700'>
                                            <box-icon name='time' size='20px' color='#6B7280'></box-icon>
                                            <span>Đăng {getWeeksAgo(getFormattedDate())}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Skills, Specialization, Field */}
                                <div className='flex flex-wrap gap-3 mb-6'>
                                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                                        <>
                                            <span className='text-sm font-semibold text-gray-700'>Kỹ năng:</span>
                                            {job.requiredSkills.map((skill, index) => (
                                                <span key={index} className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium'>
                                                    {skill}
                                                </span>
                                            ))}
                                        </>
                                    )}
                                    {job.category && (
                                        <>
                                            <span className='text-sm font-semibold text-gray-700'>Chuyên môn:</span>
                                            <span className='px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium'>
                                                {job.category}
                                            </span>
                                        </>
                                    )}
                                    {job.employerId?.industry && (
                                        <>
                                            <span className='text-sm font-semibold text-gray-700'>Lĩnh vực:</span>
                                            <span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium'>
                                                {job.employerId.industry}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Apply Button */}
                                <div className='mb-8'>
                                    {job && job.status === 'filled' && (
                                        <div className='mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                                            <p className='text-yellow-800 font-semibold text-center'>
                                                ⚠️ Công việc này đã đủ số lượng ứng viên
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleApplyClick}
                                        disabled={
                                            loadingCV || 
                                            loadingProfile || 
                                            (job && job.status === 'filled') ||
                                            (loginData && loginData.role === 'candidate' && (!hasCV || !profileComplete))
                                        }
                                        className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-all ${
                                            loadingCV || 
                                            loadingProfile || 
                                            (job && job.status === 'filled') ||
                                            (loginData && loginData.role === 'candidate' && (!hasCV || !profileComplete))
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {(loadingCV || loadingProfile) 
                                            ? 'Đang kiểm tra...' 
                                            : (job && job.status === 'filled')
                                                ? 'Công việc đã đủ số lượng'
                                                : 'Ứng tuyển'}
                                    </button>
                                    {loginData && loginData.role === 'candidate' && !loadingCV && !loadingProfile && (
                                        <div className='mt-4 text-center space-y-2'>
                                            {!hasCV && (
                                                <div>
                                                    <p className='text-sm text-red-600 mb-2'>
                                                        ⚠️ Bạn cần tải CV lên trước khi ứng tuyển
                                                    </p>
                                                    <Link 
                                                        to="/cv/manager"
                                                        className='inline-block bg-blue-600 text-white text-sm font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition-colors'
                                                    >
                                                        📄 Đi đến trang Hồ sơ cá nhân
                                                    </Link>
                                                </div>
                                            )}
                                            {hasCV && !profileComplete && (
                                                <div>
                                                    <p className='text-sm text-red-600 mb-2 font-semibold'>
                                                        ⚠️ Bạn cần điền đầy đủ thông tin BẮT BUỘC trong "Hồ sơ cá nhân"
                                                    </p>
                                                    <div className='text-xs text-gray-700 mb-3 space-y-1 bg-gray-50 p-3 rounded-lg'>
                                                        <p className='font-semibold'>Thông tin bắt buộc:</p>
                                                        <ul className='list-disc list-inside space-y-1 ml-2'>
                                                            <li>Họ tên</li>
                                                            <li>Email</li>
                                                            <li>Số điện thoại</li>
                                                            <li>Địa chỉ</li>
                                                            <li>Ít nhất một trong: <span className='font-semibold'>Giới thiệu bản thân</span>, <span className='font-semibold'>Học vấn</span>, hoặc <span className='font-semibold'>Kinh nghiệm làm việc</span></li>
                                                        </ul>
                                                        <p className='text-gray-500 mt-2 italic'>Lưu ý: Các mục khác (Kỹ năng, Ngoại ngữ, Dự án, Chứng chỉ, Giải thưởng) là tùy chọn.</p>
                                                    </div>
                                                    <Link 
                                                        to="/cv/manager"
                                                        className='inline-block bg-blue-600 text-white text-sm font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition-colors'
                                                    >
                                                        📝 Đi đến trang Hồ sơ cá nhân
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Benefits */}
                                {job.benefits && (
                                    <div className='mb-8'>
                                        <h2 className='text-xl font-bold text-gray-800 mb-4'>Phúc lợi</h2>
                                        <ul className='space-y-2'>
                                            {job.benefits.split('\n').filter(line => line.trim()).map((benefit, index) => (
                                                <li key={index} className='flex items-start gap-2 text-gray-700'>
                                                    <span className='text-red-600 font-bold mt-1'>•</span>
                                                    <span>{benefit.trim()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Job Description */}
                                {job.description && (
                                    <div className='mb-8'>
                                        <h2 className='text-xl font-bold text-gray-800 mb-4'>Mô tả công việc</h2>
                                        <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
                                            {job.description}
                                        </p>
                                    </div>
                                )}

                                {/* Job Requirements */}
                                {job.jobRequirement && (
                                    <div className='mb-8'>
                                        <h2 className='text-xl font-bold text-gray-800 mb-4'>Yêu cầu công việc</h2>
                                        <ul className='space-y-2'>
                                            {job.jobRequirement.split('\n').filter(line => line.trim()).map((req, index) => (
                                                <li key={index} className='flex items-start gap-2 text-gray-700'>
                                                    <box-icon name='check' size='20px' color='#10b981' className='mt-0.5 flex-shrink-0'></box-icon>
                                                    <span>{req.trim()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Level */}
                                {job.level && (
                                    <div className='mb-4'>
                                        <ul className='space-y-2'>
                                            <li className='flex items-start gap-2 text-gray-700'>
                                                <box-icon name='check' size='20px' color='#10b981' className='mt-0.5 flex-shrink-0'></box-icon>
                                                <span>{job.level}</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                {/* Experience Requirement */}
                                {job.experienceRequirement && (
                                    <div className='mb-4'>
                                        <ul className='space-y-2'>
                                            <li className='flex items-start gap-2 text-gray-700'>
                                                <box-icon name='check' size='20px' color='#10b981' className='mt-0.5 flex-shrink-0'></box-icon>
                                                <span>{job.experienceRequirement}</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                {/* Education Requirement */}
                                {job.educationRequirement && (
                                    <div className='mb-4'>
                                        <span className='font-semibold text-gray-700'>Học vấn: </span>
                                        <span className='text-gray-600'>{job.educationRequirement}</span>
                                    </div>
                                )}

                                {/* Gender Requirement */}
                                {job.genderRequirement && (
                                    <div className='mb-4'>
                                        <span className='font-semibold text-gray-700'>Giới tính: </span>
                                        <span className='text-gray-600'>{job.genderRequirement}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* RIGHT COLUMN - COMPANY INFORMATION */}
                    {job && job.employerId && (
                        <div className='w-full lg:w-1/3'>
                            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8'>
                                {/* Company Logo and Name */}
                                <div className='flex items-center gap-4 mb-6 pb-6 border-b border-gray-200'>
                                    {(() => {
                                        const companyName = job.employerId?.userName || 'Công ty';
                                        const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
                                        const companyAvatar = job.employerId?.avatar 
                                            ? `${baseURL}/uploads/${job.employerId.avatar}` 
                                            : null;
                                        const companyInitial = companyName.charAt(0).toUpperCase();
                                        
                                        return (
                                            <>
                                                {companyAvatar ? (
                                                    <img 
                                                        src={companyAvatar} 
                                                        alt={companyName} 
                                                        className='w-16 h-16 rounded-lg object-cover border-2 border-gray-200' 
                                                    />
                                                ) : (
                                                    <div className='w-16 h-16 rounded-lg bg-yellow-500 flex items-center justify-center border-2 border-gray-200'>
                                                        <span className='text-white font-bold text-2xl'>{companyInitial}</span>
                                                    </div>
                                                )}
                                                <div className='flex-1 min-w-0'>
                                                    <h3 className='font-bold text-lg text-gray-800 truncate'>{companyName}</h3>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Company Information */}
                                <div className='space-y-4'>
                                    <div>
                                        <p className='text-sm font-semibold text-gray-700 mb-1'>Năm thành lập</p>
                                        <p className='text-sm text-gray-600'>{job.employerId.establishedYear || 'Chưa cập nhật'}</p>
                                    </div>

                                    <div>
                                        <p className='text-sm font-semibold text-gray-700 mb-1'>Mô hình công ty</p>
                                        <p className='text-sm text-gray-600'>{job.employerId.companyType || 'Chưa cập nhật'}</p>
                                    </div>

                                    <div>
                                        <p className='text-sm font-semibold text-gray-700 mb-1'>Lĩnh vực</p>
                                        <p className='text-sm text-gray-600'>{job.employerId.industry || 'Chưa cập nhật'}</p>
                                    </div>

                                    <div>
                                        <p className='text-sm font-semibold text-gray-700 mb-1'>Quy mô</p>
                                        <p className='text-sm text-gray-600'>{job.employerId.companySize || 'Chưa cập nhật'}</p>
                                    </div>

                                    <div>
                                        <p className='text-sm font-semibold text-gray-700 mb-1'>Quốc gia</p>
                                        <p className='text-sm text-gray-600'>{job.employerId.country || 'Chưa cập nhật'}</p>
                                    </div>

                                    <div>
                                        <p className='text-sm font-semibold text-gray-700 mb-1'>Thời gian làm việc</p>
                                        <p className='text-sm text-gray-600'>{job.employerId.workingHours || 'Chưa cập nhật'}</p>
                                    </div>

                                    <div>
                                        <p className='text-sm font-semibold text-gray-700 mb-1'>Làm việc ngoài giờ</p>
                                        <p className='text-sm text-gray-600'>Không có</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
