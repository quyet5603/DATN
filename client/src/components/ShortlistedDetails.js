import React from 'react'
import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export const ShortlistedDetails = () => {

    const {candidate_id, job_id} = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState();
    const [application, setApplicaton] = useState();
    const [job, setJob] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log(candidate_id);
        console.log(job_id);
        try {
            fetch(`http://localhost:8080/users/user/${candidate_id}`)
            .then((res) => res.json())
            .then((data) => {
                console.log('Candidate data:', data);
                console.log('CV File Path:', data.cvFilePath);
                setCandidate(data)
            })

            fetch(`http://localhost:8080/jobs/current-job/${job_id}`)
            .then((res) => res.json())
            .then((data) => {
                setJob(data)
            })
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        try {
            fetch(`http://localhost:8080/application/all-application/`)
            .then((res) => res.json())
            .then((data) => {
                // Filter application cho job và candidate này
                const filterData = data.filter(item => 
                    item.candidateID === candidate_id && item.jobID === job_id
                ); 
                setApplicaton(filterData[0]);
                console.log('Application:', filterData[0]);
            })
        } catch (error) {
            console.log(error);
        }
    }, [candidate_id, job_id]);

    const handleUpdateStatus = async (status) => {
        if (!application || !application._id) {
            toast.error('Không tìm thấy đơn ứng tuyển');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/application/post-application`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    _id: application._id,
                    jobID: job_id,
                    candidateID: candidate_id,
                    applicationStatus: status
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                toast.success(status === 'shortlist' ? 'Đã chấp nhận ứng viên' : 'Đã từ chối ứng viên');
                // Reload application data
                const appResponse = await fetch(`http://localhost:8080/application/all-application/`);
                const appData = await appResponse.json();
                const filterData = appData.filter(item => 
                    item.candidateID === candidate_id && item.jobID === job_id
                );
                setApplicaton(filterData[0]);
            } else {
                toast.error(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className='max-w-screen-2xl w-full container mt-2 mx-auto xl:px-24 px-4 py-8'>
            <div className='bg-[#e7e7e7] mx-auto py-8 px-6 md:px-12 lg:px-16 rounded-lg shadow-lg'>

                {/* FORM */}

                    <div className='w-full'>
                        {candidate && job && application && (
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-4'>
                                {/* Chi tiết ứng viên */}
                                <div className='bg-white p-6 rounded-lg shadow-md'>
                                    <h1 className='text-xl md:text-2xl font-bold text-gray-700 mb-4 pb-2 border-b-2 border-gray-300'>Chi tiết ứng viên</h1>
                                    <div className='space-y-3'>
                                        <div>
                                            <h2 className='text-lg md:text-xl font-bold text-gray-800'>{candidate.userName}</h2>
                                        </div>
                                        <div>
                                            <span className='font-semibold text-gray-700'>Email: </span>
                                            <span className='text-gray-600'>{candidate.userEmail}</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold text-gray-700'>Giới tính: </span>
                                            <span className='text-gray-600'>{candidate.gender}</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold text-gray-700'>Địa chỉ: </span>
                                            <span className='text-gray-600'>{candidate.address}</span>
                                        </div>
                                        <div className='pt-2'>
                                            <span className='font-semibold text-gray-700'>CV: </span>
                                            {candidate.cvFilePath ? (
                                                <a 
                                                    href={`http://localhost:8080/uploads/${candidate.cvFilePath}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                >
                                                    Tải xuống CV (PDF)
                                                </a>
                                            ) : candidate.cvText ? (
                                                <div className='mt-2'>
                                                    <p className='text-sm text-gray-600 mb-2'>Nội dung CV:</p>
                                                    <div className='bg-gray-100 p-3 rounded text-sm max-h-40 overflow-y-auto'>
                                                        {candidate.cvText}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className='text-gray-500'>Chưa có CV</span>
                                            )}
                                        </div>
                                        {application.applicationStatus && (
                                            <div className='pt-2'>
                                                <span className='font-semibold text-gray-700'>Trạng thái: </span>
                                                <span className={`font-semibold ${
                                                    application.applicationStatus === 'shortlist' ? 'text-green-600' :
                                                    application.applicationStatus === 'rejected' ? 'text-red-600' :
                                                    'text-blue-600'
                                                }`}>
                                                    {application.applicationStatus === 'shortlist' ? 'Đã chấp nhận' :
                                                     application.applicationStatus === 'rejected' ? 'Đã từ chối' :
                                                     'Đang xét duyệt'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Chi tiết vị trí công việc */}
                                <div className='bg-white p-6 rounded-lg shadow-md'>
                                    <h1 className='text-xl md:text-2xl font-bold text-gray-700 mb-4 pb-2 border-b-2 border-gray-300'>Chi tiết vị trí công việc</h1>
                                    <div className='space-y-3'>
                                        <div>
                                            <h2 className='text-lg md:text-xl font-bold text-gray-800'>Vị trí: {job.jobTitle}</h2>
                                        </div>
                                        <div>
                                            <span className='font-semibold text-gray-700'>Địa điểm: </span>
                                            <span className='text-gray-600'>{job.location}</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold text-gray-700'>Loại: </span>
                                            <span className='text-gray-600'>{job.employmentType}</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold text-gray-700'>Mức lương: </span>
                                            <span className='text-gray-600'>{job.salary}</span>
                                        </div>
                                        <div className='pt-2'>
                                            <span className='font-semibold text-gray-700'>Mô tả: </span>
                                            <p className='text-gray-600 mt-1 text-justify'>{job.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Phản hồi ứng viên - Full width */}
                                {application.candidateFeedback && application.candidateFeedback.length > 0 && (
                                    <div className='lg:col-span-2 bg-white p-6 rounded-lg shadow-md'>
                                        <h1 className='text-xl md:text-2xl font-bold text-gray-700 mb-4 pb-2 border-b-2 border-gray-300'>Phản hồi ứng viên</h1>
                                        <div className='space-y-2'>
                                            {application.candidateFeedback.map((feedback, index) => (
                                                <div key={index} className='bg-gray-50 p-3 rounded'>
                                                    <p className='text-sm md:text-base'>
                                                        <span className='font-semibold text-gray-700'>{feedback.question}: </span>
                                                        <span className='text-gray-600'>{feedback.answer}</span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                <div className='flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-4'>
                    {application && application.applicationStatus !== 'shortlist' && (
                        <button 
                            onClick={() => handleUpdateStatus('shortlist')}
                            disabled={loading}
                            className='bg-green-600 hover:bg-green-700 text-white text-md py-2 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Đang xử lý...' : 'Chấp nhận'}
                        </button>
                    )}
                    {application && application.applicationStatus !== 'rejected' && (
                        <button 
                            onClick={() => handleUpdateStatus('rejected')}
                            disabled={loading}
                            className='bg-red-600 hover:bg-red-700 text-white text-md py-2 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Đang xử lý...' : 'Từ chối'}
                        </button>
                    )}
                    <Link to={`/matched-candidates/${job_id}`}>
                        <button className='bg-secondary text-white text-md py-2 px-6 rounded-md hover:opacity-90'>
                            {`< Quay lại`}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
