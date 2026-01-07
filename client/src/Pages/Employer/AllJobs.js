import React, { useEffect, useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
import { LoginContext } from '../../components/ContextProvider/Context';
import 'boxicons';

export const AllJobs = () => {

    const tableHeaderCss = "px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
    
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [candidatesPage, setCandidatesPage] = useState(1);
    const [candidatesPerPage, setCandidatesPerPage] = useState(5);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [candidateProfile, setCandidateProfile] = useState(null);
    const [candidateCVSections, setCandidateCVSections] = useState(null);
    const [showCVModal, setShowCVModal] = useState(false);
    const { loginData } = useContext(LoginContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("http://localhost:8080/jobs/all-jobs");
                const data = await response.json();
                
                console.log('All jobs from API:', data);
                console.log('LoginData:', loginData);
                
                // Lấy userId từ loginData hoặc localStorage
                let userId = loginData?._id;
                if (!userId) {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        try {
                            const user = JSON.parse(userStr);
                            userId = user._id;
                        } catch (e) {
                            console.error('Error parsing user:', e);
                        }
                    }
                }
                
                // Nếu có userId, filter jobs của employer đó
                // Nếu không có userId hoặc không filter được, hiển thị tất cả jobs
                let jobsToShow = [];
                
                if (userId) {
                    const userEmployerId = userId.toString();
                    // Filter jobs của employer đang đăng nhập
                    const employerJobs = data.filter(job => {
                        const jobEmployerId = job.employerId?.toString();
                        return jobEmployerId === userEmployerId;
                    });
                    
                    // Nếu không có jobs sau filter, có thể là jobs cũ không có employerId
                    // Trong trường hợp này, hiển thị tất cả jobs
                    jobsToShow = employerJobs.length > 0 ? employerJobs : data;
                } else {
                    // Không có userId, hiển thị tất cả jobs
                    jobsToShow = data;
                }
                
                // Fetch số lượng ứng viên cho mỗi job
                try {
                    const appResponse = await fetch("http://localhost:8080/application/all-application");
                    const allApplications = await appResponse.json();
                    
                    console.log('All applications:', allApplications);
                    
                    const jobsWithCounts = jobsToShow.map(job => {
                        const jobId = String(job._id || '').trim();
                        // So sánh linh hoạt: cả string và ObjectId
                        const applications = allApplications.filter(app => {
                            const appJobID = String(app.jobID || '').trim();
                            return appJobID === jobId || 
                                   String(app.jobID) === String(job._id) ||
                                   app.jobID === job._id;
                        });
                        
                        console.log(`Job ${job.jobTitle} (${jobId}): ${applications.length} applications`);
                        
                        return {
                            ...job,
                            applicationsCount: applications.length
                        };
                    });
                    
                    setJobs(jobsWithCounts);
                    setFilteredJobs(jobsWithCounts);
                } catch (appError) {
                    console.error('Error fetching applications:', appError);
                    setJobs(jobsToShow);
                    setFilteredJobs(jobsToShow);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
                setJobs([]);
                setFilteredJobs([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [loginData]);

    // Filter jobs
    useEffect(() => {
        let filtered = jobs;

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(job =>
                job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(job =>
                job.employmentType?.toLowerCase() === filterType.toLowerCase()
            );
        }

        setFilteredJobs(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    }, [searchTerm, filterType, jobs]);

    // Pagination
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentJobs = filteredJobs.slice(startIndex, endIndex);

    const getEmploymentTypeColor = (type) => {
        const typeLower = type?.toLowerCase() || '';
        if (typeLower.includes('full-time') || typeLower.includes('fulltime')) {
            return 'bg-blue-500 text-white';
        } else if (typeLower.includes('part-time') || typeLower.includes('parttime')) {
            return 'bg-green-500 text-white';
        }
        return 'bg-gray-500 text-white';
    };

    const fetchCandidates = async (jobId, jobTitle) => {
        try {
            setCandidatesLoading(true);
            setSelectedJob({ id: jobId, title: jobTitle });
            
            // Convert jobId to string for comparison
            const jobIdStr = jobId?.toString();
            console.log('Fetching candidates for jobId:', jobIdStr);
            
            // Fetch applications for this job
            const appResponse = await fetch("http://localhost:8080/application/all-application");
            if (!appResponse.ok) {
                throw new Error(`HTTP error! status: ${appResponse.status}`);
            }
            const allApplications = await appResponse.json();
            console.log('All applications:', allApplications);
            
            // Filter applications - convert both to string for reliable comparison
            console.log('🔍 Debug: Comparing jobIDs');
            console.log('Target jobId:', jobIdStr, 'Type:', typeof jobId);
            console.log('Sample application jobIDs:', allApplications.slice(0, 3).map(app => ({
                jobID: app.jobID,
                jobIDType: typeof app.jobID,
                jobIDString: app.jobID?.toString(),
                _id: app._id
            })));
            
            const jobApplications = allApplications.filter(app => {
                // Normalize both sides to string
                const appJobID = String(app.jobID || '').trim();
                const targetJobID = String(jobIdStr || '').trim();
                
                // Try multiple comparison methods
                const matches = appJobID === targetJobID || 
                               app.jobID === jobIdStr || 
                               app.jobID === jobId ||
                               String(app.jobID) === String(jobId);
                
                // Debug first few comparisons
                if (allApplications.indexOf(app) < 3) {
                    console.log('🔍 Comparing:', {
                        appJobID: appJobID,
                        targetJobID: targetJobID,
                        appJobIDRaw: app.jobID,
                        jobIdRaw: jobId,
                        matches: matches
                    });
                }
                
                if (matches) {
                    console.log('✅ Matched application:', app);
                }
                return matches;
            });
            
            console.log(`📊 Found ${jobApplications.length} applications for job ${jobIdStr}`);
            if (jobApplications.length === 0 && allApplications.length > 0) {
                console.warn('⚠️ No matches found! All application jobIDs:', 
                    allApplications.map(app => app.jobID));
                console.warn('⚠️ Looking for:', jobIdStr);
            }
            
            if (jobApplications.length === 0) {
                toast.info('Chưa có ứng viên nào ứng tuyển cho công việc này');
                setCandidates([]);
                setIsModalOpen(true);
                setCandidatesLoading(false);
                return;
            }
            
            // Fetch candidate details
            const candidatesData = await Promise.all(
                jobApplications.map(async (app) => {
                    try {
                        const candidateIdStr = app.candidateID?.toString();
                        console.log('Fetching candidate:', candidateIdStr);
                        
                        const candidateResponse = await fetch(`http://localhost:8080/users/user/${candidateIdStr}`);
                        if (!candidateResponse.ok) {
                            console.error(`Failed to fetch candidate ${candidateIdStr}:`, candidateResponse.status);
                            return null;
                        }
                        const candidate = await candidateResponse.json();
                        
                        // Format date với xử lý tốt hơn
                        let formattedDate = 'N/A';
                        if (app.createdAt) {
                            try {
                                const date = new Date(app.createdAt);
                                if (!isNaN(date.getTime())) {
                                    const hours = date.getHours().toString().padStart(2, '0');
                                    const minutes = date.getMinutes().toString().padStart(2, '0');
                                    const day = date.getDate().toString().padStart(2, '0');
                                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                    const year = date.getFullYear();
                                    formattedDate = `${hours}:${minutes} ${day}/${month}/${year}`;
                                }
                            } catch (e) {
                                console.error('Error parsing date:', e);
                            }
                        } else if (app.updatedAt) {
                            try {
                                const date = new Date(app.updatedAt);
                                if (!isNaN(date.getTime())) {
                                    const hours = date.getHours().toString().padStart(2, '0');
                                    const minutes = date.getMinutes().toString().padStart(2, '0');
                                    const day = date.getDate().toString().padStart(2, '0');
                                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                    const year = date.getFullYear();
                                    formattedDate = `${hours}:${minutes} ${day}/${month}/${year}`;
                                }
                            } catch (e) {
                                console.error('Error parsing date:', e);
                            }
                        } else if (app._id && typeof app._id === 'string' && app._id.length === 24) {
                            // Extract timestamp from MongoDB ObjectId
                            try {
                                const timestamp = parseInt(app._id.substring(0, 8), 16) * 1000;
                                const date = new Date(timestamp);
                                if (!isNaN(date.getTime())) {
                                    const hours = date.getHours().toString().padStart(2, '0');
                                    const minutes = date.getMinutes().toString().padStart(2, '0');
                                    const day = date.getDate().toString().padStart(2, '0');
                                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                    const year = date.getFullYear();
                                    formattedDate = `${hours}:${minutes} ${day}/${month}/${year}`;
                                }
                            } catch (e) {
                                console.error('Error extracting date from ObjectId:', e);
                            }
                        }
                        
                        return {
                            applicationId: app._id,
                            candidateId: app.candidateID,
                            candidateName: candidate.userName || 'N/A',
                            candidateEmail: candidate.userEmail || 'N/A',
                            cvFilePath: candidate.cvFilePath || null,
                            cvFileName: candidate.cvFilePath ? candidate.cvFilePath.split('/').pop() : 'N/A',
                            applicationDate: formattedDate,
                            status: app.applicationStatus || 'active',
                            cvTitle: candidate.cvTitle || 'CV',
                            createdAt: app.createdAt || app.updatedAt || null,
                            applicationIdStr: app._id
                        };
                    } catch (error) {
                        console.error('Error fetching candidate:', error);
                        return null;
                    }
                })
            );
            
            const validCandidates = candidatesData.filter(c => c !== null);
            console.log('Valid candidates:', validCandidates);
            setCandidates(validCandidates);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            toast.error('Không thể tải danh sách ứng viên');
        } finally {
            setCandidatesLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedJob(null);
        setCandidates([]);
        setCandidatesPage(1);
    };

    const handleViewProfile = async (candidate) => {
        try {
            setSelectedCandidate(candidate);
            setShowProfileModal(true);
            
            // Fetch candidate profile data
            const response = await fetch(`http://localhost:8080/users/user/${candidate.candidateId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch candidate profile');
            }
            const profileData = await response.json();
            setCandidateProfile(profileData);
            
            // CV sections are stored in localStorage on client side, so we can't access them directly
            // For now, show empty sections - in production, you'd want to store cvSections in database
            setCandidateCVSections({
                education: [],
                skills: [],
                experience: []
            });
        } catch (error) {
            console.error('Error fetching candidate profile:', error);
            toast.error('Không thể tải thông tin ứng viên');
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) {
                toast.error('Vui lòng đăng nhập');
                return;
            }

            const apiUrl = `http://localhost:8080/application/update-status/${applicationId}`;
            console.log('Updating application status:', { applicationId, newStatus, apiUrl });

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const result = await response.json();
                // Update local state
                setCandidates(prevCandidates => 
                    prevCandidates.map(candidate => 
                        candidate.applicationId === applicationId 
                            ? { ...candidate, status: newStatus }
                            : candidate
                    )
                );
                toast.success('Đã cập nhật trạng thái thành công');
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Không thể cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const handleViewCV = async (candidate) => {
        try {
            setSelectedCandidate(candidate);
            setShowCVModal(true);
            
            // Fetch candidate profile to get CV sections from database
            const response = await fetch(`http://localhost:8080/users/user/${candidate.candidateId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch candidate data');
            }
            const candidateData = await response.json();
            console.log('Candidate data from API:', candidateData);
            console.log('CV Sections from API:', candidateData.cvSections);
            console.log('CV Sections type:', typeof candidateData.cvSections);
            console.log('CV Sections keys:', candidateData.cvSections ? Object.keys(candidateData.cvSections) : 'null');
            
            setCandidateProfile(candidateData);
            
            // Get CV sections from database (if available)
            // Handle both cases: cvSections might be an object or might not exist
            let cvSections = {
                introduction: '',
                education: [],
                experience: [],
                skills: [],
                languages: [],
                projects: [],
                certificates: [],
                awards: []
            };
            
            if (candidateData.cvSections) {
                // If cvSections exists, merge with defaults
                cvSections = {
                    introduction: candidateData.cvSections.introduction || '',
                    education: Array.isArray(candidateData.cvSections.education) ? candidateData.cvSections.education : [],
                    experience: Array.isArray(candidateData.cvSections.experience) ? candidateData.cvSections.experience : [],
                    skills: Array.isArray(candidateData.cvSections.skills) ? candidateData.cvSections.skills : [],
                    languages: Array.isArray(candidateData.cvSections.languages) ? candidateData.cvSections.languages : [],
                    projects: Array.isArray(candidateData.cvSections.projects) ? candidateData.cvSections.projects : [],
                    certificates: Array.isArray(candidateData.cvSections.certificates) ? candidateData.cvSections.certificates : [],
                    awards: Array.isArray(candidateData.cvSections.awards) ? candidateData.cvSections.awards : []
                };
                
                console.log('Parsed CV Sections:', {
                    hasIntroduction: !!cvSections.introduction,
                    introductionLength: cvSections.introduction?.length || 0,
                    educationCount: cvSections.education.length,
                    experienceCount: cvSections.experience.length,
                    skillsCount: cvSections.skills.length,
                    languagesCount: cvSections.languages.length,
                    projectsCount: cvSections.projects.length,
                    certificatesCount: cvSections.certificates.length,
                    awardsCount: cvSections.awards.length
                });
            } else {
                console.log('No CV Sections found in candidate data');
            }
            
            console.log('Final CV Sections to display:', cvSections);
            setCandidateCVSections(cvSections);
        } catch (error) {
            console.error('Error fetching candidate CV:', error);
            toast.error('Không thể tải CV của ứng viên');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'shortlist':
            case 'accepted':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'active':
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'shortlist':
            case 'accepted':
                return 'Chấp nhận';
            case 'rejected':
                return 'Từ chối';
            case 'active':
            default:
                return 'Chờ xử lý';
        }
    };

    // Pagination for candidates
    const candidatesTotalPages = Math.ceil(candidates.length / candidatesPerPage);
    const candidatesStartIndex = (candidatesPage - 1) * candidatesPerPage;
    const candidatesEndIndex = candidatesStartIndex + candidatesPerPage;
    const currentCandidates = candidates.slice(candidatesStartIndex, candidatesEndIndex);
    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Tin tuyển dụng</h1>
                        <p className='text-gray-600 text-sm md:text-base'>
                            Quản lý các tin tuyển dụng và ứng viên của bạn
                        </p>
                    </div>
                    <Link 
                        to="/post-job"
                        className='inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg'
                    >
                        <box-icon name='plus' color='#ffffff' size='20px'></box-icon>
                        <span>Đăng tin tuyển dụng mới</span>
                    </Link>
                                        </div>

                {/* Search and Filter Card */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
                    <div className='flex flex-col md:flex-row gap-4 items-stretch'>
                        <div className='flex-1'>
                            <input
                                type='text'
                                placeholder='Tìm kiếm công việc...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-full'
                            />
                        </div>
                        <div className='flex gap-3 items-stretch'>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className='px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white h-full'
                            >
                                <option value='all'>Tất cả</option>
                                <option value='Full-time'>Full-time</option>
                                <option value='Part-time'>Part-time</option>
                                <option value='Contract'>Contract</option>
                                <option value='Internship'>Internship</option>
                            </select>
                            <button
                                type='button'
                                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium h-full'
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead className='bg-gray-50 border-b border-gray-200'>
                                <tr>
                                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>STT</th>
                                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Tiêu đề</th>
                                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Địa điểm</th>
                                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Loại hình</th>
                                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Lương</th>
                                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Ứng viên</th>
                                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Hành động</th>
                                            </tr>
                                        </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                            {isLoading ? (
                                                <tr>
                                        <td colSpan='7' className='px-6 py-12 text-center text-gray-500'>
                                            <div className='flex flex-col items-center gap-3'>
                                                <div className='inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent'></div>
                                                <span>Đang tải...</span>
                                            </div>
                                                    </td>
                                                </tr>
                                ) : currentJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan='7' className='px-6 py-12 text-center text-gray-500'>
                                            {filteredJobs.length === 0 && jobs.length > 0 
                                                ? 'Không tìm thấy công việc nào phù hợp với bộ lọc.'
                                                : 'Chưa có việc làm nào được đăng. '}
                                            {jobs.length === 0 && (
                                                <Link to="/post-job" className="text-blue-600 hover:underline font-medium">
                                                    Đăng tin tuyển dụng
                                                </Link>
                                            )}
                                                    </td>
                                                </tr>
                                            ) : (
                                    currentJobs.map((job, index) => (
                                        <RenderTableRows 
                                            key={job._id} 
                                            job={job} 
                                            index={startIndex + index + 1}
                                            getEmploymentTypeColor={getEmploymentTypeColor}
                                            fetchCandidates={fetchCandidates}
                                        />
                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                    {/* Pagination */}
                    {filteredJobs.length > 0 && (
                        <div className='px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4'>
                            <div className='text-sm text-gray-600'>
                                Tổng <span className='font-semibold'>{filteredJobs.length}</span> công việc
                            </div>
                            <div className='flex items-center gap-3'>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className='px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                >
                                    <box-icon name='chevron-left' size='20px' color='#6B7280'></box-icon>
                                </button>
                                <div className='flex gap-1'>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                currentPage === i + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className='px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                >
                                    <box-icon name='chevron-right' size='20px' color='#6B7280'></box-icon>
                                </button>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm'
                                >
                                    <option value={10}>10 / page</option>
                                    <option value={20}>20 / page</option>
                                    <option value={50}>50 / page</option>
                                </select>
                            </div>
                        </div>
                    )}
                            </div>
                        </div>

            {/* Candidates Modal */}
            {isModalOpen && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={handleCloseModal}>
                    <div className='bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col' onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                            <h2 className='text-xl font-bold text-gray-800'>
                                Danh sách ứng viên - {selectedJob?.title || 'Công việc'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <box-icon name='x' size='24px'></box-icon>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className='flex-1 overflow-y-auto p-6'>
                            {candidatesLoading ? (
                                <div className='text-center py-12'>
                                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent'></div>
                                    <p className='mt-4 text-gray-600'>Đang tải...</p>
                                </div>
                            ) : currentCandidates.length === 0 ? (
                                <div className='text-center py-12 text-gray-500'>
                                    Chưa có ứng viên nào ứng tuyển cho công việc này
                                </div>
                            ) : (
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead className='bg-gray-50 border-b border-gray-200'>
                                            <tr>
                                                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>STT</th>
                                                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Họ và tên</th>
                                                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Email</th>
                                                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Trạng thái</th>
                                                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Ngày ứng tuyển</th>
                                                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className='bg-white divide-y divide-gray-200'>
                                            {currentCandidates.map((candidate, index) => (
                                                <tr key={candidate.applicationId} className='hover:bg-gray-50 transition-colors'>
                                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                                        {candidatesStartIndex + index + 1}
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-900 font-medium'>
                                                        {candidate.candidateName}
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                                        {candidate.candidateEmail}
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap'>
                                                        <select
                                                            className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(candidate.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                            value={candidate.status}
                                                            onChange={(e) => handleStatusChange(candidate.applicationId, e.target.value)}
                                                        >
                                                            <option value='active'>Chờ xử lý</option>
                                                            <option value='shortlist'>Chấp nhận</option>
                                                            <option value='rejected'>Từ chối</option>
                                                        </select>
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                                        {candidate.applicationDate || 'N/A'}
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap'>
                                                        <button
                                                            onClick={() => handleViewProfile(candidate)}
                                                            className='text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium flex items-center gap-1'
                                                        >
                                                            <box-icon name='file-blank' size='16px' color='#2563EB'></box-icon>
                                                            <span>Hồ sơ</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {candidates.length > 0 && (
                            <div className='px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4'>
                                <div className='text-sm text-gray-600'>
                                    Tổng <span className='font-semibold'>{candidates.length}</span> ứng viên
                                </div>
                                <div className='flex items-center gap-3'>
                                    <button
                                        onClick={() => setCandidatesPage(prev => Math.max(1, prev - 1))}
                                        disabled={candidatesPage === 1}
                                        className='px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                    >
                                        <box-icon name='chevron-left' size='20px' color='#6B7280'></box-icon>
                                    </button>
                                    <div className='flex gap-1'>
                                        {[...Array(candidatesTotalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCandidatesPage(i + 1)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                    candidatesPage === i + 1
                                                        ? 'bg-blue-600 text-white'
                                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCandidatesPage(prev => Math.min(candidatesTotalPages, prev + 1))}
                                        disabled={candidatesPage === candidatesTotalPages}
                                        className='px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                    >
                                        <box-icon name='chevron-right' size='20px' color='#6B7280'></box-icon>
                                    </button>
                                    <select
                                        value={candidatesPerPage}
                                        onChange={(e) => {
                                            setCandidatesPerPage(Number(e.target.value));
                                            setCandidatesPage(1);
                                        }}
                                        className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm'
                                    >
                                        <option value={5}>5 / page</option>
                                        <option value={10}>10 / page</option>
                                        <option value={20}>20 / page</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium'
                                >
                                    Đóng
                                </button>
                            </div>
                        )}
                </div>
            </div>
            )}

            {/* Profile Modal */}
            {showProfileModal && candidateProfile && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={() => setShowProfileModal(false)}>
                    <div className='bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className='flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10'>
                            <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                                <box-icon name='user' size='24px' color='#1F2937'></box-icon>
                                Hồ sơ ứng viên
                            </h2>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <box-icon name='x' size='24px'></box-icon>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className='p-6 space-y-4'>
                            {/* Candidate Header Card */}
                            <div className='bg-teal-50 rounded-lg p-6'>
                                <div className='flex items-start gap-4'>
                                    <div className='w-20 h-20 rounded-full bg-white border-2 border-teal-200 flex items-center justify-center flex-shrink-0'>
                                        {candidateProfile.avatar ? (
                                            <img 
                                                src={`http://localhost:8080/uploads/${candidateProfile.avatar}`} 
                                                alt={candidateProfile.userName}
                                                className='w-full h-full rounded-full object-cover'
                                            />
                                        ) : (
                                            <box-icon name='user' size='48px' color='#14B8A6'></box-icon>
                                        )}
                                    </div>
                                    <div className='flex-1'>
                                        <h3 className='text-2xl font-bold text-gray-800 mb-1'>
                                            {candidateProfile.userName || 'N/A'}
                                        </h3>
                                        <p className='text-gray-600 mb-2'>{candidateProfile.position || 'Chưa cập nhật'}</p>
                                        <div className='flex items-center gap-2 text-gray-600'>
                                            <box-icon name='envelope' size='16px' color='#4B5563'></box-icon>
                                            <span>{candidateProfile.userEmail || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Education Card */}
                            {candidateCVSections?.education && candidateCVSections.education.length > 0 && (
                                <div className='bg-white rounded-lg p-6 shadow-sm'>
                                    <h4 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                                        <box-icon name='book' size='20px' color='#1F2937'></box-icon>
                                        Học vấn
                                    </h4>
                                    {candidateCVSections.education.map((edu, idx) => (
                                        <div key={idx} className='pl-4 border-l-4 border-orange-400'>
                                            <p className='font-semibold text-gray-800 mb-1'>{edu.major || 'N/A'}</p>
                                            <p className='text-gray-600 text-sm'>
                                                {edu.school || 'N/A'} • {edu.from || ''} {edu.isCurrent ? '- Hiện tại' : edu.to ? `- ${edu.to}` : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skills Card */}
                            {candidateCVSections?.skills && candidateCVSections.skills.length > 0 && (
                                <div className='bg-white rounded-lg p-6 shadow-sm'>
                                    <h4 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                                        <box-icon name='bulb' size='20px' color='#1F2937'></box-icon>
                                        Kỹ năng
                                    </h4>
                                    <div className='flex flex-wrap gap-2'>
                                        {candidateCVSections.skills.map((skill, idx) => (
                                            <span 
                                                key={idx}
                                                className='px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium border border-teal-200'
                                            >
                                                {skill.skill || skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CV Attachment Card */}
                            <div className='bg-blue-50 rounded-lg p-6'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex-1'>
                                        <h4 className='text-lg font-bold text-gray-800 mb-2'>CV đính kèm</h4>
                                        <p className='text-gray-600 text-sm'>Click để xem CV đầy đủ của ứng viên</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowProfileModal(false);
                                            handleViewCV(selectedCandidate);
                                        }}
                                        className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap'
                                    >
                                        Xem CV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CV Template Modal */}
            {showCVModal && candidateProfile && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={() => setShowCVModal(false)}>
                    <div className='bg-gray-100 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className='sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10'>
                            <h2 className='text-xl font-bold text-gray-800'>CV - {candidateProfile.userName}</h2>
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
                                        {candidateProfile.avatar ? (
                                            <img 
                                                src={`http://localhost:8080/uploads/${candidateProfile.avatar}`} 
                                                alt="Avatar" 
                                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-300">
                                                <span className="text-4xl text-gray-600 font-bold">
                                                    {candidateProfile.userName?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                            {candidateProfile.userName || 'Họ và tên'}
                                        </h1>
                                        <p className="text-xl text-gray-600 mb-4">
                                            {candidateProfile.position || 'Chức vụ'}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                            {candidateProfile.userEmail && (
                                                <div className="flex items-center gap-2">
                                                    <box-icon name='envelope' size='16px'></box-icon>
                                                    <span>{candidateProfile.userEmail}</span>
                                                </div>
                                            )}
                                            {candidateProfile.phoneNumber && (
                                                <div className="flex items-center gap-2">
                                                    <box-icon name='phone' size='16px'></box-icon>
                                                    <span>{candidateProfile.phoneNumber}</span>
                                                </div>
                                            )}
                                            {candidateProfile.address && (
                                                <div className="flex items-center gap-2">
                                                    <box-icon name='map' size='16px'></box-icon>
                                                    <span>{candidateProfile.address}</span>
                                                </div>
                                            )}
                                            {candidateProfile.personalLink && (
                                                <div className="flex items-center gap-2">
                                                    <box-icon name='link' size='16px'></box-icon>
                                                    <a href={candidateProfile.personalLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        {candidateProfile.personalLink}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Introduction Section */}
                                {candidateCVSections?.introduction && candidateCVSections.introduction.trim() && (
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                            Giới thiệu bản thân
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {candidateCVSections.introduction}
                                        </p>
                                    </div>
                                )}

                                {/* Education Section */}
                                {candidateCVSections?.education && Array.isArray(candidateCVSections.education) && candidateCVSections.education.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                            Học vấn
                                        </h2>
                                        <div className="space-y-4">
                                            {candidateCVSections.education.map((edu, idx) => (
                                                <div key={idx} className="mb-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-800">
                                                                {edu.school || 'Trường học'}
                                                            </h3>
                                                            <p className="text-gray-600">{edu.major || 'Ngành học'}</p>
                                                        </div>
                                                        <span className="text-gray-600 text-sm">
                                                            {edu.from && edu.to ? `${edu.from} - ${edu.to}` : 
                                                             edu.from ? `Từ ${edu.from}` : ''}
                                                            {edu.isCurrent && ' (Hiện tại)'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Experience Section */}
                                {candidateCVSections?.experience && Array.isArray(candidateCVSections.experience) && candidateCVSections.experience.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                            Kinh nghiệm làm việc
                                        </h2>
                                        <div className="space-y-4">
                                            {candidateCVSections.experience.map((exp, idx) => (
                                                <div key={idx} className="mb-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-800">
                                                                {exp.position || 'Vị trí'} - {exp.company || 'Công ty'}
                                                            </h3>
                                                        </div>
                                                        <span className="text-gray-600 text-sm">
                                                            {exp.from && exp.to ? `${exp.from} - ${exp.to}` : 
                                                             exp.from ? `Từ ${exp.from}` : ''}
                                                            {exp.isCurrent && ' (Hiện tại)'}
                                                        </span>
                                                    </div>
                                                    {exp.description && (
                                                        <p className="text-gray-700 text-sm mb-2 whitespace-pre-line">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                    {exp.projects && (
                                                        <div className="text-gray-600 text-sm">
                                                            <strong>Dự án tham gia:</strong>
                                                            <p className="whitespace-pre-line">{exp.projects}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Skills Section */}
                                {candidateCVSections?.skills && Array.isArray(candidateCVSections.skills) && candidateCVSections.skills.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                            Kỹ năng
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {candidateCVSections.skills.map((skill, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                                >
                                                    {skill.skill} {skill.experience && `(${skill.experience})`}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Languages Section */}
                                {candidateCVSections?.languages && Array.isArray(candidateCVSections.languages) && candidateCVSections.languages.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                            Ngoại ngữ
                                        </h2>
                                        <div className="space-y-2">
                                            {candidateCVSections.languages.map((lang, idx) => (
                                                <div key={idx} className="flex justify-between">
                                                    <span className="font-medium text-gray-800">{lang.language}</span>
                                                    <span className="text-gray-600">{lang.level}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Projects Section */}
                                {candidateCVSections?.projects && Array.isArray(candidateCVSections.projects) && candidateCVSections.projects.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                            Dự án nổi bật
                                        </h2>
                                        <div className="space-y-4">
                                            {candidateCVSections.projects.map((project, idx) => (
                                                <div key={idx} className="mb-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-800">
                                                            {project.name || 'Tên dự án'}
                                                        </h3>
                                                        <span className="text-gray-600 text-sm">
                                                            {project.startMonth && project.startYear && 
                                                             `${project.startMonth}/${project.startYear} - `}
                                                            {project.endMonth && project.endYear ? 
                                                             `${project.endMonth}/${project.endYear}` : 
                                                             project.isCurrent ? 'Hiện tại' : ''}
                                                        </span>
                                                    </div>
                                                    {project.description && (
                                                        <p className="text-gray-700 text-sm whitespace-pre-line">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                    {project.link && (
                                                        <a 
                                                            href={project.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-sm"
                                                        >
                                                            {project.link}
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Certificates Section */}
                                {candidateCVSections?.certificates && Array.isArray(candidateCVSections.certificates) && candidateCVSections.certificates.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                            Chứng chỉ
                                        </h2>
                                        <div className="space-y-2">
                                            {candidateCVSections.certificates.map((cert, idx) => (
                                                <div key={idx} className="flex justify-between">
                                                    <div>
                                                        <span className="font-medium text-gray-800">{cert.name}</span>
                                                        {cert.organization && (
                                                            <span className="text-gray-600"> - {cert.organization}</span>
                                                        )}
                                                    </div>
                                                    {cert.year && (
                                                        <span className="text-gray-600">{cert.year}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Awards Section */}
                                {candidateCVSections?.awards && Array.isArray(candidateCVSections.awards) && candidateCVSections.awards.length > 0 && (
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                            Giải thưởng
                                        </h2>
                                        <div className="space-y-3">
                                            {candidateCVSections.awards.map((award, idx) => (
                                                <div key={idx}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-medium text-gray-800">{award.name}</span>
                                                        {award.year && (
                                                            <span className="text-gray-600">{award.year}</span>
                                                        )}
                                                    </div>
                                                    {award.organization && (
                                                        <p className="text-gray-600 text-sm">{award.organization}</p>
                                                    )}
                                                    {award.description && (
                                                        <p className="text-gray-700 text-sm mt-1">{award.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
function HandlerDeleteJob(id) {
    try {
        const token = localStorage.getItem('usertoken');
        fetch(`http://localhost:8080/jobs/delete-job/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token ? (token.startsWith('Bearer') ? token : `Bearer ${token}`) : ''
            }
        })
        .then(res => res.json())
        .then(data => {
            toast.success("Xóa thành công");
            // Reload page to refresh the list
            window.location.reload();
        })
        .catch(error => {
            console.error("Error deleting job:", error);
            toast.error("Không thể xóa");
        });
    } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Không thể xóa");
    }
}


function RenderTableRows({ job, index, getEmploymentTypeColor, fetchCandidates }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleDelete = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
            HandlerDeleteJob(job._id);
            setIsMenuOpen(false);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('.menu-container')) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    return (
        <tr className='hover:bg-gray-50 transition-colors'>
            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                {index}
            </td>
            <td className='px-6 py-4 text-sm text-gray-900'>
                <Link 
                    to={`/current-job/${job._id}`} 
                    className='hover:text-blue-600 hover:underline font-medium'
                >
                    {job.jobTitle?.length > 30 ? `${job.jobTitle.substring(0, 30)}...` : job.jobTitle}
                </Link>
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                {job.location}
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(job.employmentType)}`}>
                    {job.employmentType}
                </span>
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                {job.salary || 'Thỏa thuận'}
            </td>
            <td className='px-6 py-4 whitespace-nowrap'>
                {fetchCandidates ? (
                    <button
                        onClick={() => fetchCandidates(job._id?.toString() || job._id, job.jobTitle)}
                        className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium'
                    >
                        <box-icon name='user' size='16px' color='#2563EB'></box-icon>
                        <span>Xem</span>
                    </button>
                ) : (
                <Link 
                    to={`/matched-candidates/${job._id}`}
                        className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium'
                >
                        <box-icon name='user' size='16px' color='#2563EB'></box-icon>
                        <span>Xem</span>
                </Link>
                )}
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm'>
                <div className='relative menu-container'>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                    >
                        <box-icon name='dots-vertical-rounded' size='20px' color='#6B7280'></box-icon>
                    </button>
                    {isMenuOpen && (
                        <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10'>
                            <Link
                                to={`/update-job/${job._id}`}
                                onClick={() => setIsMenuOpen(false)}
                                className='flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors'
                            >
                                <box-icon name='edit' size='16px' color='#4B5563'></box-icon>
                                <span className='text-sm'>Chỉnh sửa</span>
                </Link>
                <button 
                                onClick={handleDelete}
                                className='w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left'
                >
                                <box-icon name='trash' size='16px' color='#DC2626'></box-icon>
                                <span className='text-sm'>Xóa</span>
                </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}