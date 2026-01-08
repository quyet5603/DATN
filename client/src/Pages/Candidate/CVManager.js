import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginContext } from '../../components/ContextProvider/Context';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const CVManager = () => {
    const { loginData } = useContext(LoginContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [cvs, setCvs] = useState([]);
    
    // Personal Info State
    const [personalInfo, setPersonalInfo] = useState({
        userName: '',
        position: '',
        userEmail: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        personalLink: ''
    });
    
    const [avatarPreview, setAvatarPreview] = useState(null);
    
    // CV Sections State
    const [sections, setSections] = useState({
        introduction: '',
        education: [],
        experience: [],
        skills: [],
        languages: [],
        projects: [],
        certificates: [],
        awards: [],
        attachments: []
    });
    
    // Modal states
    const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
    const [showIntroductionModal, setShowIntroductionModal] = useState(false);
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [showSkillsModal, setShowSkillsModal] = useState(false);
    const [showLanguagesModal, setShowLanguagesModal] = useState(false);
    const [showProjectsModal, setShowProjectsModal] = useState(false);
    const [showCertificatesModal, setShowCertificatesModal] = useState(false);
    const [showAwardsModal, setShowAwardsModal] = useState(false);
    const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
    
    // Form states for modals
    const [educationForm, setEducationForm] = useState({
        school: '',
        major: '',
        isCurrent: false,
        from: '',
        to: ''
    });
    
    const [experienceForm, setExperienceForm] = useState({
        company: '',
        position: '',
        isCurrent: false,
        from: '',
        to: '',
        description: '',
        projects: ''
    });
    
    const [skillForm, setSkillForm] = useState({
        skill: '',
        experience: ''
    });
    
    const [languageForm, setLanguageForm] = useState({
        language: '',
        level: 'Sơ cấp'
    });
    
    const [projectForm, setProjectForm] = useState({
        name: '',
        isCurrent: false,
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        description: '',
        link: ''
    });
    
    const [certificateForm, setCertificateForm] = useState({
        name: '',
        organization: '',
        year: ''
    });
    
    const [awardForm, setAwardForm] = useState({
        name: '',
        organization: '',
        year: '',
        description: ''
    });
    
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
        const token = localStorage.getItem('usertoken');
            const userStr = localStorage.getItem('user');
        
            if (!token || !userStr) {
            toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
            navigate('/login');
            return;
        }

            let userData = JSON.parse(userStr);
            setUser(userData);

            // Fetch fresh user data from API to get latest cvSections from database
        try {
                const response = await fetch(`http://localhost:8080/users/user/${userData._id}`, {
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });

                if (response.ok) {
                    const freshUserData = await response.json();
                    // Update localStorage with fresh data
                    localStorage.setItem('user', JSON.stringify(freshUserData));
                    userData = freshUserData;
                    setUser(freshUserData);
                }
            } catch (error) {
                console.error('Error fetching user data from API:', error);
                // Continue with localStorage data if API fails
            }
            
            // Load personal info
            setPersonalInfo({
                userName: userData.userName || '',
                position: userData.position || '',
                userEmail: userData.userEmail || '',
                phoneNumber: userData.phoneNumber || '',
                dateOfBirth: userData.dateOfBirth || '',
                gender: userData.gender || '',
                address: userData.address || '',
                personalLink: userData.personalLink || ''
            });
            
            // Load avatar
            if (userData.avatar) {
                const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
                setAvatarPreview(`${baseURL}/uploads/${userData.avatar}`);
            }
            
            // Load CV sections - PRIORITY: from database (userData.cvSections)
            if (userData.cvSections && Object.keys(userData.cvSections).length > 0) {
                // Load from database
                setSections({
                    introduction: userData.cvSections.introduction || '',
                    education: userData.cvSections.education || [],
                    experience: userData.cvSections.experience || [],
                    skills: userData.cvSections.skills || [],
                    languages: userData.cvSections.languages || [],
                    projects: userData.cvSections.projects || [],
                    certificates: userData.cvSections.certificates || [],
                    awards: userData.cvSections.awards || [],
                    attachments: [] // attachments not stored in cvSections
                });
                // Also sync to localStorage with user-specific key
                localStorage.setItem(`cvSections_${userData._id}`, JSON.stringify(userData.cvSections));
                } else {
                // Fallback: Load from localStorage with user-specific key
                const savedSections = localStorage.getItem(`cvSections_${userData._id}`);
                if (savedSections) {
                    try {
                        setSections(JSON.parse(savedSections));
                    } catch (e) {
                        console.error('Error parsing saved sections:', e);
                    }
                } else {
                    // If no data found, initialize with empty sections
                    setSections({
                        introduction: '',
                        education: [],
                        experience: [],
                        skills: [],
                        languages: [],
                        projects: [],
                        certificates: [],
                        awards: [],
                        attachments: []
                    });
                }
            }
            
            // Load CVs
            fetchCVs();
                setLoading(false);
        };

        loadUserData();
    }, [navigate]);

    const fetchCVs = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) {
                console.warn('No token found, skipping CV fetch');
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/api/cv/list`, {
                headers: {
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCvs(data.cvs || []);
            } else if (response.status === 401) {
                // Token expired or invalid
                console.error('Unauthorized - token may be expired');
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('usertoken');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                console.error('Error fetching CVs:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching CVs:', error);
        }
    };

    const saveCVSectionsToDB = async (cvSections) => {
        try {
            const token = localStorage.getItem('usertoken');
            const userStr = localStorage.getItem('user');
            if (!token || !userStr) {
                console.warn('No token or user data found, skipping save to DB');
            return;
        }

            const userData = JSON.parse(userStr);
            
            // Validate required fields (check for both undefined/null and empty string)
            if (!userData.userName || userData.userName.trim() === '' || !userData.userEmail || userData.userEmail.trim() === '') {
                console.warn('Missing or empty userName or userEmail, attempting to fetch from API:', {
                    userName: userData.userName,
                    userEmail: userData.userEmail
                });
                
                // Try to fetch user data from API if localStorage is incomplete
                try {
                    const fetchResponse = await fetch(`http://localhost:8080/users/user/${userData._id}`, {
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
                    });
                    if (fetchResponse.ok) {
                        const fetchedUser = await fetchResponse.json();
                        console.log('Fetched user data from API successfully');
                        // Update localStorage
                        localStorage.setItem('user', JSON.stringify(fetchedUser));
                        // Retry with fetched data
                        if (fetchedUser.userName && fetchedUser.userEmail) {
                            userData.userName = fetchedUser.userName;
                            userData.userEmail = fetchedUser.userEmail;
                        } else {
                            console.error('Fetched user data also missing userName or userEmail, cannot save CV sections');
                            return;
                        }
                    } else {
                        console.error('Failed to fetch user data from API, cannot save CV sections');
                        return;
                    }
                } catch (fetchError) {
                    console.error('Error fetching user data:', fetchError);
                    return;
                }
            }
            
            // Backend requires userName and userEmail, so we need to send them along with cvSections
            const requestBody = { 
                userName: userData.userName,
                userEmail: userData.userEmail,
                cvSections 
            };
            
            console.log('Saving CV sections to DB:', {
                userId: userData._id,
                userName: userData.userName,
                userEmail: userData.userEmail,
                cvSectionsKeys: Object.keys(cvSections)
            });
            
            const response = await fetch(`http://localhost:8080/users/update-profile/${userData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.user) {
                    localStorage.setItem('user', JSON.stringify(result.user));
                    console.log('CV sections saved to DB successfully');
                }
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Failed to save CV sections to DB:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                // Don't throw error, just log it - user can still use localStorage
            }
        } catch (error) {
            console.error('Error saving CV sections to DB:', error);
            // Don't throw error, just log it - user can still use localStorage
        }
    };

    const handleSavePersonalInfo = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            const userStr = localStorage.getItem('user');
            const userData = JSON.parse(userStr);
            
            // First, upload avatar if selected
            if (selectedFile) {
                const avatarFormData = new FormData();
                avatarFormData.append('avatar', selectedFile);
                
                const avatarResponse = await fetch(`http://localhost:8080/users/upload-avatar/${userData._id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                    },
                    body: avatarFormData
                });

                if (!avatarResponse.ok) {
                    const errorData = await avatarResponse.json().catch(() => ({}));
                    toast.error(errorData.message || 'Có lỗi khi upload avatar');
                    return;
                }
                
                // Update user data with new avatar
                const avatarData = await avatarResponse.json();
                if (avatarData.user) {
                    const updatedUserData = { ...userData, ...avatarData.user };
                    localStorage.setItem('user', JSON.stringify(updatedUserData));
                    if (avatarData.avatar) {
                        const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
                        setAvatarPreview(`${baseURL}/uploads/${avatarData.avatar}`);
                    }
                }
            }
            
            // Then update profile info
            const response = await fetch(`http://localhost:8080/users/update-profile/${userData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                },
                body: JSON.stringify({
                    userName: personalInfo.userName,
                    userEmail: personalInfo.userEmail,
                    phoneNumber: personalInfo.phoneNumber,
                    dateOfBirth: personalInfo.dateOfBirth,
                    gender: personalInfo.gender,
                    address: personalInfo.address,
                    position: personalInfo.position,
                    personalLink: personalInfo.personalLink
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update localStorage with new user data
                const updatedUserData = { ...userData, ...data.user };
                localStorage.setItem('user', JSON.stringify(updatedUserData));
                
                // Update avatar preview if avatar was uploaded
                if (selectedFile && data.user?.avatar) {
                    const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
                    setAvatarPreview(`${baseURL}/uploads/${data.user.avatar}`);
                }
                
                toast.success('Cập nhật thông tin thành công');
                setShowPersonalInfoModal(false);
                setSelectedFile(null);
                // Reload to show updated data
                window.location.reload();
            } else {
                toast.error(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin');
        }
    };

    const handleSaveIntroduction = (intro) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        const userId = userData._id;
        
        const updatedSections = { ...sections, introduction: intro };
        setSections(updatedSections);
        localStorage.setItem(`cvSections_${userId}`, JSON.stringify(updatedSections));
        saveCVSectionsToDB(updatedSections);
        setShowIntroductionModal(false);
        toast.success('Đã lưu giới thiệu bản thân');
    };

    const handleAddEducation = () => {
        if (!educationForm.school || !educationForm.major) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        const userId = userData._id;
        
        // Ghi đè: chỉ giữ lại mục mới nhất, thay thế toàn bộ mảng
        const updatedSections = {
            ...sections,
            education: [{ ...educationForm, id: Date.now() }]
        };
        setSections(updatedSections);
        localStorage.setItem(`cvSections_${userId}`, JSON.stringify(updatedSections));
        saveCVSectionsToDB(updatedSections);
        setEducationForm({ school: '', major: '', isCurrent: false, from: '', to: '' });
        setShowEducationModal(false);
        // Force re-render by reloading from localStorage
        setTimeout(() => {
            const saved = localStorage.getItem(`cvSections_${userId}`);
            if (saved) {
                try {
                    setSections(JSON.parse(saved));
                } catch (e) {
                    console.error('Error:', e);
                }
            }
        }, 100);
        toast.success('Đã lưu học vấn');
    };

    const handleAddExperience = () => {
        if (!experienceForm.company || !experienceForm.position) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        const userId = userData._id;
        
        // Ghi đè: chỉ giữ lại mục mới nhất, thay thế toàn bộ mảng
        const updatedSections = {
            ...sections,
            experience: [{ ...experienceForm, id: Date.now() }]
        };
        setSections(updatedSections);
        localStorage.setItem(`cvSections_${userId}`, JSON.stringify(updatedSections));
        saveCVSectionsToDB(updatedSections);
        setExperienceForm({ company: '', position: '', isCurrent: false, from: '', to: '', description: '', projects: '' });
        setShowExperienceModal(false);
        // Force re-render by reloading from localStorage
        setTimeout(() => {
            const saved = localStorage.getItem(`cvSections_${userId}`);
            if (saved) {
                try {
                    setSections(JSON.parse(saved));
                } catch (e) {
                    console.error('Error:', e);
                }
            }
        }, 100);
        toast.success('Đã lưu kinh nghiệm');
    };

    const handleAddSkill = () => {
        if (!skillForm.skill) {
            toast.error('Vui lòng chọn kỹ năng');
            return;
        }
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        const userId = userData._id;
        
        const updatedSections = {
            ...sections,
            skills: [...sections.skills, { ...skillForm, id: Date.now() }]
        };
        setSections(updatedSections);
        localStorage.setItem(`cvSections_${userId}`, JSON.stringify(updatedSections));
        saveCVSectionsToDB(updatedSections);
        setSkillForm({ skill: '', experience: '' });
        toast.success('Đã thêm kỹ năng');
    };

    const handleAddLanguage = () => {
        if (!languageForm.language) {
            toast.error('Vui lòng chọn ngôn ngữ');
            return;
        }
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        const userId = userData._id;
        
        const updatedSections = {
            ...sections,
            languages: [...sections.languages, { ...languageForm, id: Date.now() }]
        };
        setSections(updatedSections);
        localStorage.setItem(`cvSections_${userId}`, JSON.stringify(updatedSections));
        saveCVSectionsToDB(updatedSections);
        setLanguageForm({ language: '', level: 'Sơ cấp' });
        toast.success('Đã thêm ngôn ngữ');
    };

    const handleAddProject = () => {
        if (!projectForm.name) {
            toast.error('Vui lòng điền tên dự án');
            return;
        }
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        const userId = userData._id;
        
        const updatedSections = {
            ...sections,
            projects: [...sections.projects, { ...projectForm, id: Date.now() }]
        };
        setSections(updatedSections);
        localStorage.setItem(`cvSections_${userId}`, JSON.stringify(updatedSections));
        saveCVSectionsToDB(updatedSections);
        setProjectForm({ name: '', isCurrent: false, startMonth: '', startYear: '', endMonth: '', endYear: '', description: '', link: '' });
        setShowProjectsModal(false);
        toast.success('Đã thêm dự án');
    };

    const handleAddCertificate = () => {
        if (!certificateForm.name || !certificateForm.organization) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        const userId = userData._id;
        
        const updatedSections = {
            ...sections,
            certificates: [...sections.certificates, { ...certificateForm, id: Date.now() }]
        };
        setSections(updatedSections);
        localStorage.setItem(`cvSections_${userId}`, JSON.stringify(updatedSections));
        saveCVSectionsToDB(updatedSections);
        setCertificateForm({ name: '', organization: '', year: '' });
        setShowCertificatesModal(false);
        toast.success('Đã thêm chứng chỉ');
    };

    const handleAddAward = () => {
        if (!awardForm.name || !awardForm.organization) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        const userId = userData._id;
        
        const updatedSections = {
            ...sections,
            awards: [...sections.awards, { ...awardForm, id: Date.now() }]
        };
        setSections(updatedSections);
        localStorage.setItem(`cvSections_${userId}`, JSON.stringify(updatedSections));
        saveCVSectionsToDB(updatedSections);
        setAwardForm({ name: '', organization: '', year: '', description: '' });
        setShowAwardsModal(false);
        toast.success('Đã thêm giải thưởng');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File quá lớn. Tối đa 5MB');
                return;
            }
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                toast.error('Chỉ chấp nhận file PDF, DOC, DOCX');
                return;
            }
            setSelectedFile(file);
            toast.success('File đã được chọn');
        }
    };

    const handleUploadAttachment = async () => {
        if (!selectedFile) {
            toast.error('Vui lòng chọn file');
            return;
        }
        
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) {
                toast.error('Vui lòng đăng nhập để upload CV');
                navigate('/login');
                return;
            }
            
            const formData = new FormData();
            formData.append('cv', selectedFile); // Backend expects 'cv' field name
            formData.append('cvName', selectedFile.name);
            formData.append('isDefault', 'false'); // Default to false
            
            const response = await fetch(`${API_BASE_URL}/api/cv/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                    // Don't set Content-Type for FormData - browser will set it with boundary
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                toast.success('Upload CV thành công');
                setSelectedFile(null);
                fetchCVs(); // Refresh CV list
            } else if (response.status === 401) {
                // Token expired or invalid
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('usertoken');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Upload thất bại' }));
                toast.error(errorData.error || 'Upload thất bại');
                console.error('Upload CV error:', response.status, errorData);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Có lỗi xảy ra khi upload CV');
        }
    };

    const handleSetDefaultCV = async (cvId) => {
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) {
                toast.error('Vui lòng đăng nhập');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/cv/set-default/${cvId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Đã đặt CV làm mặc định');
                fetchCVs(); // Refresh CV list
            } else if (response.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('usertoken');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Không thể đặt CV mặc định' }));
                toast.error(errorData.error || 'Không thể đặt CV mặc định');
            }
        } catch (error) {
            console.error('Error setting default CV:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDeleteCV = async (cvId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa CV này không?')) {
            return;
        }

        try {
            const token = localStorage.getItem('usertoken');
            if (!token) {
                toast.error('Vui lòng đăng nhập');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/cv/delete/${cvId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Đã xóa CV thành công');
                fetchCVs(); // Refresh CV list
            } else if (response.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('usertoken');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Không thể xóa CV' }));
                toast.error(errorData.error || 'Không thể xóa CV');
            }
        } catch (error) {
            console.error('Error deleting CV:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleViewCV = (cv) => {
        if (!cv.cvFilePath) {
            toast.error('CV không có file để xem');
            return;
        }
        const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
        const cvUrl = `${baseURL}/uploads/${cv.cvFilePath}`;
        window.open(cvUrl, '_blank');
    };

    const handleDownloadCV = (cv) => {
        if (!cv.cvFilePath) {
            toast.error('CV không có file để tải xuống');
            return;
        }
        const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
        const cvUrl = `${baseURL}/uploads/${cv.cvFilePath}`;
        const link = document.createElement('a');
        link.href = cvUrl;
        link.download = cv.cvName || 'CV.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const defaultCV = cvs.find(cv => cv.isDefault) || cvs[0];

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="text-center">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header - Personal Information Card */}
                <div className="bg-gray-100 rounded-lg p-6 mb-6 relative">
                    <button
                        onClick={() => setShowPersonalInfoModal(true)}
                        className="absolute top-4 right-4 text-red-600 hover:text-red-700"
                    >
                        <box-icon name='edit' size='24px'></box-icon>
                    </button>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-gray-600 font-bold">
                                        {personalInfo.userName?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Personal Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">{personalInfo.userName || 'Chưa cập nhật'}</h2>
                            <p className="text-gray-600 mb-4">{personalInfo.position || 'Chưa cập nhật'}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <box-icon name='envelope' size='16px' color='#4B5563'></box-icon>
                                    <span>{personalInfo.userEmail || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <box-icon name='phone' size='16px' color='#4B5563'></box-icon>
                                    <span>{personalInfo.phoneNumber || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <box-icon name='calendar' size='16px' color='#4B5563'></box-icon>
                                    <span>{personalInfo.dateOfBirth || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <box-icon name='user' size='16px' color='#4B5563'></box-icon>
                                    <span>{personalInfo.gender || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <box-icon name='map' size='16px' color='#4B5563'></box-icon>
                                    <span>{personalInfo.address || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <box-icon name='link' size='16px' color='#4B5563'></box-icon>
                                    <span>{personalInfo.personalLink || 'Chưa cập nhật'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CV Sections */}
                <div className="space-y-4">
                    <SectionCard
                        title="Giới thiệu bản thân"
                        subtitle="Thể hiện những thông tin chi tiết về quá trình làm việc"
                        content={sections.introduction}
                        onEdit={() => setShowIntroductionModal(true)}
                    />

                    <SectionCard
                        title="Học vấn"
                        subtitle="Thông tin học vấn sẽ hiển thị tại đây"
                        content={sections.education.length > 0 
                            ? sections.education.map((edu, idx) => 
                                `${edu.school} - ${edu.major} (${edu.from}${edu.isCurrent ? ' - Hiện tại' : edu.to ? ` - ${edu.to}` : ''})`
                            ).join('\n')
                            : ''}
                        onEdit={() => setShowEducationModal(true)}
                    />

                    <SectionCard
                        title="Kinh nghiệm làm việc"
                        subtitle="Thể hiện những thông tin chi tiết về quá trình làm việc"
                        content={sections.experience.length > 0 
                            ? sections.experience.map((exp, idx) => 
                                `${exp.position} tại ${exp.company} (${exp.from}${exp.isCurrent ? ' - Hiện tại' : exp.to ? ` - ${exp.to}` : ''})`
                            ).join('\n')
                            : ''}
                        onEdit={() => setShowExperienceModal(true)}
                    />

                    <SectionCard
                        title="Kỹ năng"
                        subtitle="Liệt kê các kỹ năng chuyên môn của bạn"
                        content={sections.skills.length > 0 
                            ? sections.skills.map((skill, idx) => `${skill.skill} (${skill.experience || 'Chưa xác định'})`).join(', ')
                            : ''}
                        onEdit={() => setShowSkillsModal(true)}
                    />

                    <SectionCard
                        title="Ngoại ngữ"
                        subtitle="Liệt kê các ngôn ngữ bạn biết"
                        content={sections.languages.length > 0 
                            ? sections.languages.map((lang, idx) => `${lang.language} (${lang.level || 'Chưa xác định'})`).join(', ')
                            : ''}
                        onEdit={() => setShowLanguagesModal(true)}
                    />

                    <SectionCard
                        title="Dự án nổi bật"
                        subtitle="Giới thiệu dự án nổi bật của bạn"
                        content={sections.projects.length > 0 
                            ? sections.projects.map((proj, idx) => 
                                `${proj.name} (${proj.startMonth}/${proj.startYear}${proj.isCurrent ? ' - Hiện tại' : proj.endMonth && proj.endYear ? ` - ${proj.endMonth}/${proj.endYear}` : ''})`
                            ).join('\n')
                            : ''}
                        onEdit={() => setShowProjectsModal(true)}
                    />

                    <SectionCard
                        title="Chứng chỉ"
                        subtitle="Thêm các chứng chỉ chuyên môn của bạn"
                        content={sections.certificates.length > 0 
                            ? sections.certificates.map((cert, idx) => `${cert.name} - ${cert.organization} (${cert.year || 'N/A'})`).join('\n')
                            : ''}
                        onEdit={() => setShowCertificatesModal(true)}
                    />

                    <SectionCard
                        title="Giải thưởng"
                        subtitle="Thêm các giải thưởng và thành tích của bạn"
                        content={sections.awards.length > 0 
                            ? sections.awards.map((award, idx) => `${award.name} - ${award.organization} (${award.year || 'N/A'})`).join('\n')
                            : ''}
                        onEdit={() => setShowAwardsModal(true)}
                    />

                    <SectionCard
                        title="Hồ sơ đính kèm"
                        subtitle={cvs.length > 0 ? `${cvs.length} CV đã upload` : "Chưa có CV được upload"}
                        content=""
                        onEdit={() => setShowAttachmentsModal(true)}
                    />
                </div>

                {/* View and Download CV Button */}
                <div className="mt-8 text-center">
                        <Link
                        to="/cv/template"
                        className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg"
                        >
                        View and Download CV
                        </Link>
                    </div>

                {/* Modals */}
                {showPersonalInfoModal && (
                    <PersonalInfoModal
                        personalInfo={personalInfo}
                        setPersonalInfo={setPersonalInfo}
                        avatarPreview={avatarPreview}
                        setAvatarPreview={setAvatarPreview}
                        setSelectedFile={setSelectedFile}
                        onClose={() => setShowPersonalInfoModal(false)}
                        onSave={handleSavePersonalInfo}
                    />
                )}

                {showIntroductionModal && (
                    <IntroductionModal
                        introduction={sections.introduction}
                        setIntroduction={(intro) => {
                            const updatedSections = { ...sections, introduction: intro };
                            setSections(updatedSections);
                            const userStr = localStorage.getItem('user');
                            if (userStr) {
                                const userData = JSON.parse(userStr);
                                const userId = userData._id;
                                localStorage.setItem(`cvSections_${userId}`, JSON.stringify(updatedSections));
                            }
                        }}
                        onClose={() => {
                            setShowIntroductionModal(false);
                            // Reload from localStorage to ensure sync
                            const userStr = localStorage.getItem('user');
                            const savedSections = userStr ? localStorage.getItem(`cvSections_${JSON.parse(userStr)._id}`) : null;
                            if (savedSections) {
                                try {
                                    setSections(JSON.parse(savedSections));
                                } catch (e) {
                                    console.error('Error parsing saved sections:', e);
                                }
                            }
                        }}
                        onSave={handleSaveIntroduction}
                    />
                )}

                {showEducationModal && (
                    <EducationModal
                        form={educationForm}
                        setForm={setEducationForm}
                        onClose={() => setShowEducationModal(false)}
                        onSave={handleAddEducation}
                    />
                )}

                {showExperienceModal && (
                    <ExperienceModal
                        form={experienceForm}
                        setForm={setExperienceForm}
                        onClose={() => setShowExperienceModal(false)}
                        onSave={handleAddExperience}
                    />
                )}

                {showSkillsModal && (
                    <SkillsModal
                        form={skillForm}
                        setForm={setSkillForm}
                        skills={sections.skills}
                        onClose={() => setShowSkillsModal(false)}
                        onAdd={handleAddSkill}
                    />
                )}

                {showLanguagesModal && (
                    <LanguagesModal
                        form={languageForm}
                        setForm={setLanguageForm}
                        languages={sections.languages}
                        onClose={() => setShowLanguagesModal(false)}
                        onAdd={handleAddLanguage}
                    />
                )}

                {showProjectsModal && (
                    <ProjectsModal
                        form={projectForm}
                        setForm={setProjectForm}
                        onClose={() => setShowProjectsModal(false)}
                        onSave={handleAddProject}
                    />
                )}

                {showCertificatesModal && (
                    <CertificatesModal
                        form={certificateForm}
                        setForm={setCertificateForm}
                        onClose={() => setShowCertificatesModal(false)}
                        onSave={handleAddCertificate}
                    />
                )}

                {showAwardsModal && (
                    <AwardsModal
                        form={awardForm}
                        setForm={setAwardForm}
                        onClose={() => setShowAwardsModal(false)}
                        onSave={handleAddAward}
                    />
                )}

                {showAttachmentsModal && (
                    <AttachmentsModal
                        selectedFile={selectedFile}
                        cvs={cvs}
                        onFileChange={handleFileUpload}
                        onClose={() => {
                            setShowAttachmentsModal(false);
                            setSelectedFile(null);
                        }}
                        onUpload={handleUploadAttachment}
                        onSetDefault={handleSetDefaultCV}
                        onDelete={handleDeleteCV}
                        onView={handleViewCV}
                        onDownload={handleDownloadCV}
                    />
                )}
                </div>
        </div>
    );
};

// Section Card Component
const SectionCard = ({ title, subtitle, content, onEdit }) => {
    // Truncate content if too long (for introduction)
    const displayContent = content && content.length > 100 
        ? content.substring(0, 100) + '...' 
        : content;
    
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{subtitle}</p>
                {displayContent && (
                    <p className="text-sm text-gray-500 mt-2 whitespace-pre-wrap break-words">
                        {displayContent}
                    </p>
                )}
            </div>
            <button
                onClick={onEdit}
                className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors flex-shrink-0"
            >
                <box-icon name='plus' size='24px' color='#ffffff'></box-icon>
            </button>
                    </div>
    );
};

// Personal Info Modal
const PersonalInfoModal = ({ personalInfo, setPersonalInfo, avatarPreview, setAvatarPreview, setSelectedFile, onClose, onSave }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>
                    
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mb-4">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-gray-600 font-bold">
                                        {personalInfo.userName?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <label className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-center cursor-pointer hover:bg-blue-700">
                                    <box-icon name='camera' size='16px' color='#ffffff' className="inline mr-2"></box-icon>
                                    Sửa
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                                <button
                                    onClick={() => {
                                        setAvatarPreview(null);
                                        setSelectedFile(null);
                                    }}
                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                >
                                    <box-icon name='trash' size='16px' color='#ffffff' className="inline mr-2"></box-icon>
                                    Xóa
                                </button>
                            </div>
                                </div>
                                
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                                <input
                                    type="text"
                                    value={personalInfo.userName}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, userName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                                <input
                                    type="text"
                                    value={personalInfo.position}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, position: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={personalInfo.userEmail}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, userEmail: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={personalInfo.phoneNumber}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                                    placeholder="Số điện thoại"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                                <input
                                    type="date"
                                    value={personalInfo.dateOfBirth}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                                    placeholder="Ngày sinh"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                                <select
                                    value={personalInfo.gender}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                                <input
                                    type="text"
                                    value={personalInfo.address}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                                    placeholder="Địa chỉ"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Liên kết cá nhân</label>
                                <input
                                    type="url"
                                    value={personalInfo.personalLink}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, personalLink: e.target.value })}
                                    placeholder="Liên kết cá nhân"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Introduction Modal
const IntroductionModal = ({ introduction, setIntroduction, onClose, onSave }) => {
    const [text, setText] = useState(introduction);
    const lineCount = text.split('\n').length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-center">Giới thiệu bản thân</h2>
                    <hr className="mb-4" />
                    <h3 className="text-xl font-bold mb-2">Giới thiệu bản thân</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        <span className="text-orange-600">Tip:</span> Tóm tắt kinh nghiệm chuyên môn, chú ý làm nổi bật các kỹ năng và điểm mạnh.
                    </p>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Nhập mô tả, nhấn Enter để xuống dòng..."
                        className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">{lineCount} dòng</p>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={() => {
                                if (text.trim()) {
                                    setIntroduction(text);
                                    onSave(text);
                                } else {
                                    toast.error('Vui lòng nhập nội dung');
                                }
                            }}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Education Modal
const EducationModal = ({ form, setForm, onClose, onSave }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Học vấn</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Trường</label>
                            <input
                                type="text"
                                value={form.school}
                                onChange={(e) => setForm({ ...form, school: e.target.value })}
                                placeholder="Trường"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ngành học</label>
                            <input
                                type="text"
                                value={form.major}
                                onChange={(e) => setForm({ ...form, major: e.target.value })}
                                placeholder="Ngành"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.isCurrent}
                                onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label className="text-sm text-gray-600">Tôi đang theo học ở đây</label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Từ</label>
                                <input
                                    type="text"
                                    value={form.from}
                                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                                    placeholder="Tháng/Năm (VD: 11/2024)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Đến</label>
                                <input
                                    type="text"
                                    value={form.to}
                                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                                    placeholder="Tháng/Năm (VD: 11/2025)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        >
                            Lưu
                        </button>
                                        </div>
                </div>
            </div>
        </div>
    );
};

// Experience Modal
const ExperienceModal = ({ form, setForm, onClose, onSave }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Kinh nghiệm làm việc</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Công ty</label>
                            <input
                                type="text"
                                value={form.company}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                                placeholder="Nhập tên công ty"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Vị trí</label>
                            <input
                                type="text"
                                value={form.position}
                                onChange={(e) => setForm({ ...form, position: e.target.value })}
                                placeholder="Nhập vị trí"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.isCurrent}
                                onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label className="text-sm text-gray-600">Tôi đang làm việc tại đây</label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Từ</label>
                                <input
                                    type="text"
                                    value={form.from}
                                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                                    placeholder="Nhập thời gian bắt đầu"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Đến</label>
                                <input
                                    type="text"
                                    value={form.to}
                                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                                    placeholder="Nhập thời gian kết thúc"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả công việc</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Nhập mô tả công việc"
                                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Dự án tham gia</label>
                            <textarea
                                value={form.projects}
                                onChange={(e) => setForm({ ...form, projects: e.target.value })}
                                placeholder="Nhập dự án đã tham gia"
                                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        >
                            Lưu
                        </button>
                                </div>
                </div>
            </div>
        </div>
    );
};

// Skills Modal
const SkillsModal = ({ form, setForm, skills, onClose, onAdd }) => {
    const skillOptions = ['React', 'JavaScript', 'Node.js', 'Python', 'Java', 'C++', 'HTML', 'CSS', 'Vue.js', 'Angular', 'TypeScript', 'MongoDB', 'MySQL', 'PostgreSQL', 'Git', 'Docker', 'AWS', 'Azure', 'Linux', 'Agile', 'Scrum', 'UI/UX', 'Figma', 'Photoshop', 'Illustrator', 'WordPress', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'TensorFlow', 'Machine Learning', 'Data Science'];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Kỹ năng</h2>
                    <hr className="mb-4" />
                    <p className="font-bold mb-4">Danh sách kỹ năng:</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kỹ năng</label>
                            <select
                                value={form.skill}
                                onChange={(e) => setForm({ ...form, skill: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Chọn kỹ năng ({skillOptions.length})</option>
                                {skillOptions.map((skill, idx) => (
                                    <option key={idx} value={skill}>{skill}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kinh nghiệm</label>
                            <select
                                value={form.experience}
                                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Chọn kinh nghiệm</option>
                                <option value="Dưới 1 năm">Dưới 1 năm</option>
                                <option value="1-2 năm">1-2 năm</option>
                                <option value="2-5 năm">2-5 năm</option>
                                <option value="5-10 năm">5-10 năm</option>
                                <option value="Trên 10 năm">Trên 10 năm</option>
                            </select>
                        </div>
                    </div>
                                        <button
                        onClick={onAdd}
                        className="w-full border-2 border-red-600 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 font-semibold mb-6"
                                        >
                        + Thêm kỹ năng
                                        </button>
                    {skills.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-bold mb-2">Kỹ năng đã thêm:</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, idx) => (
                                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {skill.skill} ({skill.experience})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                                    <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        >
                            Lưu
                                    </button>
                                </div>
                            </div>
            </div>
        </div>
    );
};

// Languages Modal
const LanguagesModal = ({ form, setForm, languages, onClose, onAdd }) => {
    const languageOptions = ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn', 'Tiếng Pháp', 'Tiếng Đức', 'Tiếng Tây Ban Nha', 'Tiếng Ý', 'Tiếng Nga'];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Ngoại ngữ</h2>
                    <hr className="mb-4" />
                    <p className="font-bold mb-4">Danh sách ngôn ngữ:</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ngôn ngữ</label>
                            <input
                                type="text"
                                value={form.language}
                                onChange={(e) => setForm({ ...form, language: e.target.value })}
                                placeholder="Tìm ngôn ngữ"
                                list="languages"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <datalist id="languages">
                                {languageOptions.map((lang, idx) => (
                                    <option key={idx} value={lang} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Trình độ</label>
                            <select
                                value={form.level}
                                onChange={(e) => setForm({ ...form, level: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Sơ cấp">Sơ cấp</option>
                                <option value="Trung cấp">Trung cấp</option>
                                <option value="Cao cấp">Cao cấp</option>
                                <option value="Bản ngữ">Bản ngữ</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={onAdd}
                        className="w-full border-2 border-red-600 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 font-semibold mb-6"
                    >
                        + Thêm ngôn ngữ
                    </button>
                    {languages.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-bold mb-2">Ngôn ngữ đã thêm:</h3>
                            <div className="flex flex-wrap gap-2">
                                {languages.map((lang, idx) => (
                                    <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                        {lang.language} ({lang.level})
                                    </span>
                                ))}
                            </div>
                    </div>
                )}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Projects Modal
const ProjectsModal = ({ form, setForm, onClose, onSave }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Dự án nổi bật</h2>
                    <hr className="mb-4" />
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên dự án</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Tên dự án"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.isCurrent}
                                onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label className="text-sm text-gray-600">Tôi vẫn đang làm dự án này</label>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ngày bắt đầu</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={form.startMonth}
                                    onChange={(e) => setForm({ ...form, startMonth: e.target.value })}
                                    placeholder="Tháng"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    value={form.startYear}
                                    onChange={(e) => setForm({ ...form, startYear: e.target.value })}
                                    placeholder="Năm"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ngày kết thúc</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={form.endMonth}
                                    onChange={(e) => setForm({ ...form, endMonth: e.target.value })}
                                    placeholder="Tháng"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    value={form.endYear}
                                    onChange={(e) => setForm({ ...form, endYear: e.target.value })}
                                    placeholder="Năm"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Mô tả công việc, trách nhiệm, thành tựu..."
                                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Link dự án</label>
                            <input
                                type="url"
                                value={form.link}
                                onChange={(e) => setForm({ ...form, link: e.target.value })}
                                placeholder="Đường dẫn website"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Certificates Modal
const CertificatesModal = ({ form, setForm, onClose, onSave }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Thêm chứng chỉ</h2>
                    <hr className="mb-4" />
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên chứng chỉ</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="VD: AWS Certified Solutions Architect"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tổ chức cấp</label>
                            <input
                                type="text"
                                value={form.organization}
                                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                                placeholder="VD: Amazon Web Services"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Năm cấp</label>
                            <input
                                type="text"
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: e.target.value })}
                                placeholder="VD: 2024"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Awards Modal
const AwardsModal = ({ form, setForm, onClose, onSave }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Thêm giải thưởng</h2>
                    <hr className="mb-4" />
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên giải thưởng</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="VD: Nhân viên xuất sắc năm 2024"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tổ chức trao</label>
                            <input
                                type="text"
                                value={form.organization}
                                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                                placeholder="VD: Công ty ABC"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Năm nhận</label>
                            <input
                                type="text"
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: e.target.value })}
                                placeholder="VD: 2024"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả (tùy chọn)</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Mô tả ngắn gọn về giải thưởng..."
                                className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Attachments Modal
const AttachmentsModal = ({ selectedFile, cvs = [], onFileChange, onClose, onUpload, onSetDefault, onDelete, onView, onDownload }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Quản lý CV đã upload</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <box-icon name='x' size='28px'></box-icon>
                        </button>
                    </div>

                    {/* Danh sách CV đã upload */}
                    {cvs.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">CV đã upload ({cvs.length})</h3>
                            <div className="space-y-3">
                                {cvs.map((cv) => (
                                    <div
                                        key={cv._id}
                                        className={`border rounded-lg p-4 transition-all ${
                                            cv.isDefault
                                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="mt-1">
                                                    <box-icon name='file-pdf' type='solid' color={cv.isDefault ? '#3B82F6' : '#DC2626'} size='32px'></box-icon>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-gray-800 truncate">{cv.cvName || 'CV'}</h4>
                                                        {cv.isDefault && (
                                                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full whitespace-nowrap">
                                                                Mặc định
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        Upload: {cv.uploadedAt ? new Date(cv.uploadedAt).toLocaleDateString('vi-VN', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {!cv.isDefault && (
                                                    <button
                                                        onClick={() => onSetDefault(cv._id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="Đặt làm CV mặc định"
                                                    >
                                                        <box-icon name='star' size='16px' color='#3B82F6'></box-icon>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onView(cv)}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                    title="Xem CV"
                                                >
                                                    <box-icon name='show' size='16px' color='#374151'></box-icon>
                                                </button>
                                                <button
                                                    onClick={() => onDownload(cv)}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                    title="Tải xuống"
                                                >
                                                    <box-icon name='download' size='16px' color='#374151'></box-icon>
                                                </button>
                                                <button
                                                    onClick={() => onDelete(cv._id)}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Xóa CV"
                                                >
                                                    <box-icon name='trash' size='16px' color='#DC2626'></box-icon>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Upload CV mới</h3>
                        <p className="text-sm text-gray-600 mb-4">Chấp nhận file: PDF, DOC, DOCX (Tối đa 5MB)</p>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <box-icon name='cloud-upload' size='48px' color='#9CA3AF' className="mb-3"></box-icon>
                            <p className="font-semibold text-gray-800 mb-1">Click hoặc kéo file vào đây để upload</p>
                            <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX (tối đa 5MB)</p>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={onFileChange}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium"
                            >
                                Chọn file
                            </label>
                            {selectedFile && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center gap-2">
                                        <box-icon name='file' size='20px' color='#6B7280'></box-icon>
                                        <p className="text-sm text-gray-700 font-medium">{selectedFile.name}</p>
                                        <span className="text-xs text-gray-500">
                                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={onUpload}
                                disabled={!selectedFile}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                Upload CV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

