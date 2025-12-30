import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { SimilarJobs } from '../SimilarJobs'
import { MatchScoreBar } from '../AI/MatchScoreBar'
import { toast } from 'react-toastify'
import { LoginContext } from '../ContextProvider/Context'

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
    const [file, setFile] = useState();
    const [matchScore, setMatchScore] = useState(null);
    const [loadingMatchScore, setLoadingMatchScore] = useState(false);
    const [applicationsCount, setApplicationsCount] = useState(0);

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
            })
            .catch(error => {
                console.error('Error fetching applications count:', error);
            });
    }, [id]);

    // Fetch match score nếu user đã login và là candidate
    useEffect(() => {
        const fetchMatchScore = async () => {
            if (!loginData || loginData.role !== 'candidate') return;
            
            const token = localStorage.getItem('usertoken') || loginData.token;
            if (!token) return;

            setLoadingMatchScore(true);
            try {
                const response = await fetch(`http://localhost:8080/api/ai/match-score/${id}`, {
                    headers: {
                        'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success && data.hasCV) {
                    setMatchScore(data.matchScore);
                }
            } catch (error) {
                console.error('Error fetching match score:', error);
            } finally {
                setLoadingMatchScore(false);
            }
        };

        if (loginData && id) {
            fetchMatchScore();
        }
    }, [loginData, id]);

    useEffect(() => {
        if (job && job.applicants && job.applicants.length > 0) {
            const fetchApplicantsData = async () => {
                try {
                    const response = await fetch(`http://localhost:8080/users/all-users`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch applicants data');
                    }
                    const data = await response.json();

                    const filteredApplicants = data.filter(app => {
                        return job.applicants.some(jobApplicant => jobApplicant.applicant === app._id);
                    });

                    setApplicants(filteredApplicants);
                    console.log(filteredApplicants);
                    // console.log(jobs.applicants);
                } catch (error) {
                    console.error('Error fetching applicants data:', error);
                }
            };

            fetchApplicantsData();
        }
    }, [job]);

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            
            // Upload CV lên server
            const formData = new FormData();
            formData.append("resume", selectedFile);
            
            const token = localStorage.getItem('usertoken');
            const userStr = localStorage.getItem('user');
            let userId = null;
            
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userId = user._id;
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
            
            if (userId) {
                fetch(`http://localhost:8080/upload/resume/${userId}`, {
                    method: "POST",
                    body: formData,
                })
                    .then(async (res) => {
                        const result = await res.json();
                        if (res.ok && result.success) {
                            toast.success('CV đã được tải lên thành công');
                            console.log('CV uploaded:', result);
                        } else {
                            console.error('Upload error:', result);
                            toast.error(result.error || result.message || 'Lỗi khi tải CV lên');
                        }
                    })
                    .catch((error) => {
                        console.error('Error uploading CV:', error);
                        toast.error('Lỗi khi tải CV lên');
                    });
            } else {
                toast.error('Vui lòng đăng nhập để tải CV');
            }
        }
    }

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

        // Redirect đến trang application form (CV có thể upload sau)
        navigate(`/application-form/${id}`);
    }

    return (
        <div className='max-w-scren-2xl  w-full md:w-5/6 lg:w-6/8 container mt-2 mx-auto xl:px-24 px-4 '>

            <div className=' bg-[#efefef] mx-auto py-12 md:px-14 px-8 rounded-lg'>

                <div className='flex flex-col lg:flex-row  gap-8'>

                    {/* JOB DETAILS */}
                    {
                        job &&
                        <div className='w-full'>

                            {/* BASIC DETAILS */}
                            <div className='flex items-center flex-wrap justify-center md:justify-normal'>
                                <div className='mx-4 my-3 text-center md:text-left md:my-0'>
                                    <h1 className='text-xl md:text-2xl font-bold'>{job.jobTitle}</h1>
                                    <p className='text-sm text-gray-700'>
                                        Đăng tải - {(() => {
                                            // Ưu tiên createdAt, nếu không có thì dùng updatedAt
                                            let dateToUse = job.createdAt || job.updatedAt;
                                            
                                            // Nếu vẫn không có, lấy timestamp từ ObjectId (8 ký tự đầu của _id là timestamp)
                                            if (!dateToUse && job._id) {
                                                try {
                                                    const idStr = job._id.toString();
                                                    if (idStr.length === 24) {
                                                        // ObjectId có 24 ký tự hex, 8 ký tự đầu là timestamp (4 bytes)
                                                        const timestampHex = idStr.substring(0, 8);
                                                        const timestamp = parseInt(timestampHex, 16) * 1000;
                                                        dateToUse = new Date(timestamp);
                                                    }
                                                } catch (e) {
                                                    console.error('Error parsing ObjectId timestamp:', e);
                                                }
                                            }
                                            
                                            if (dateToUse) {
                                                return new Date(dateToUse).toLocaleDateString('vi-VN', { 
                                                    day: '2-digit', 
                                                    month: '2-digit', 
                                                    year: 'numeric' 
                                                });
                                            }
                                            return 'N/A';
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {/* ADDITIONALS */}
                            <div className='my-4 gap-2 grid grid-cols-2 sm:grid-cols-4'>
                                <div className='bg-blue-300 rounded-lg py-4 md:py-5 text-center'>
                                    <h2 className='text-xs md:text-md font-semibold text-gray-700'>Loại việc làm</h2><p className='text-sm md:text-lg font-bold'>{job.employmentType}</p>
                                </div>
                                <div className='bg-green-300 rounded-lg py-4 md:py-5 text-center'>
                                    <h2 className='text-xs md:text-md font-semibold text-gray-700'>Mức lương</h2><p className='text-sm md:text-lg font-bold'>{job.salary}</p>
                                </div>
                                <div className='bg-blue-300 rounded-lg py-4 md:py-5 text-center'>
                                    <h2 className='text-xs md:text-md font-semibold text-gray-700'>Địa điểm</h2><p className='text-sm md:text-lg font-bold'>{job.location}</p>
                                </div>
                                <div className='bg-green-300 rounded-lg py-4 md:py-5 text-center'>
                                    <h2 className='text-xs md:text-md font-semibold text-gray-700'>Ứng viên</h2><p className='text-sm md:text-lg font-bold'>{applicationsCount}</p>
                                </div>
                            </div>

                            {/* Match Score - Chỉ hiển thị nếu candidate đã login và có CV */}
                            {loginData && loginData.role === 'candidate' && (
                                <div className='my-4 px-1'>
                                    {loadingMatchScore ? (
                                        <div className='bg-gray-100 rounded-lg py-3 px-4 text-center'>
                                            <span className='text-sm text-gray-600'>Đang tính toán độ phù hợp...</span>
                                        </div>
                                    ) : matchScore !== null && matchScore > 0 ? (
                                        <div className='bg-white rounded-lg py-3 px-4 border-2 border-gray-200'>
                                            <MatchScoreBar score={matchScore} size="normal" />
                                        </div>
                                    ) : matchScore === 0 ? (
                                        <div className='bg-gray-100 rounded-lg py-3 px-4 text-center'>
                                            <span className='text-sm text-gray-600'>
                                                Chưa có điểm phù hợp. <Link to={`/cv-upload/${id}`} className='text-blue-600 hover:underline'>Tải CV để kiểm tra</Link>
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* JOB DESCRIPTION */}
                            <div className='px-1'>
                                <h2 className='my-2 font-bold'>Mô tả công việc</h2>
                                <p className='text-sm md:text-base text-justify '>
                                    {job.description}
                                </p>
                            </div>
                        </div>
                    }
                </div>

                {/* Submit button */}
                <div className='mt-8'>
                    <h2 className=' font-bold my-4'>Tải lên CV để ứng tuyển<span className=' text-red-600'>*</span></h2>
                    <div className='mb-4 px-2 flex flex-wrap gap-3'>
                        <Link 
                            to={`/cv-upload/${id}`}
                            className='inline-block bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors'
                        >
                            🔍 Phân tích CV
                        </Link>
                        {loginData && loginData.role === 'candidate' && (
                            <Link 
                                to={`/interview-practice/${id}`}
                                className='inline-block bg-purple-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-purple-700 transition-colors'
                            >
                                💬 Luyện tập phỏng vấn
                            </Link>
                        )}
                    </div>
                    <div className='px-2 grid grid-cols-1 md:grid-cols-2 items-center justify-items-center gap-4'>

                        <div className='w-full md:w-5/6'>
                            <label class="sr-only">Choose file</label>
                            <input type="file" onChange={handleFileUpload} {...register("resume")} id="file-input" class="block w-full cursor-pointer border border-primary shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none file:bg-primary file:text-white file:border-0 file:me-4 file:py-2 file:px-3" />
                        </div>

                        {
                            job && applicants &&
                                job.applicants.some(jobApplicant => {
                                    return applicants.some(app => {
                                        return jobApplicant.applicant === app._id
                                    })
                                }) ?
                                <Link to={`/application-form/${job._id}`}>
                                    <div className='flex justify-center'>
                                        <button type="button" className='block bg-secondary text-white text-md font-medium py-2 px-12 md:px-16 rounded-md hover:opacity-90 transition-opacity shadow-md hover:shadow-lg'>Ứng tuyển ngay</button>
                                    </div>
                                </Link>
                                :
                                <div className='flex justify-center'>
                                    <button 
                                        type="button"
                                        onClick={handleApplyClick}
                                        className='block bg-secondary text-white text-md font-medium py-2 px-12 md:px-16 rounded-md hover:opacity-90 transition-opacity shadow-md hover:shadow-lg'
                                    >
                                        Ứng tuyển ngay
                                    </button>
                                </div>
                        }
                    </div>
                </div>
                {file && (
                    <div className="mt-4 px-2">
                        <h2 className="font-bold">CV đã tải lên:</h2>
                        <p className="text-sm text-gray-600">{file.name || file}</p>
                    </div>
                )}
                <div className='text-center'>
                    <p className='hover:underline text-xs md:text-sm mt-8'>Bằng cách ứng tuyển công việc trên, bạn đồng ý với các điều khoản và điều kiện của chúng tôi.</p>
                </div>
            </div>
            
            <SimilarJobs />
        </div>
    )
}
