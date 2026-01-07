import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const CVTemplate = () => {
    const navigate = useNavigate();
    const cvRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [cvSections, setCvSections] = useState({
        introduction: '',
        education: [],
        experience: [],
        skills: [],
        languages: [],
        projects: [],
        certificates: [],
        awards: []
    });

    useEffect(() => {
        const token = localStorage.getItem('usertoken');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
            toast.error('Vui lòng đăng nhập');
            navigate('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        
        // Load profile data
        setProfileData({
            userName: userData.userName || '',
            position: userData.position || '',
            userEmail: userData.userEmail || '',
            phoneNumber: userData.phoneNumber || '',
            dateOfBirth: userData.dateOfBirth || '',
            gender: userData.gender || '',
            address: userData.address || '',
            personalLink: userData.personalLink || '',
            avatar: userData.avatar || null
        });

        // Load CV sections (if stored in localStorage or from API)
        // For now, we'll get from localStorage or set empty
        const savedSections = localStorage.getItem('cvSections');
        if (savedSections) {
            try {
                setCvSections(JSON.parse(savedSections));
            } catch (e) {
                console.error('Error parsing saved sections:', e);
            }
        }

        setLoading(false);
    }, [navigate]);

    const handleDownload = async () => {
        try {
            // Dynamic import html2pdf
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default || html2pdfModule;
            
            const element = cvRef.current;
            if (!element) {
                toast.error('Không tìm thấy nội dung CV');
                return;
            }

            const options = {
                margin: [0, 0, 0, 0],
                filename: `${profileData?.userName || 'CV'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    imageTimeout: 0,
                    removeContainer: true,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true,
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            };

            html2pdf().set(options).from(element).save();
            toast.success('Đang tải CV...');
        } catch (error) {
            console.error('Error downloading CV:', error);
            toast.error('Có lỗi xảy ra khi tải CV. Vui lòng thử lại.');
        }
    };

    const getAvatarUrl = () => {
        if (profileData?.avatar) {
            const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
            return `${baseURL}/uploads/${profileData.avatar}`;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header with Download Button */}
                <div className="mb-6 flex justify-between items-center">
                    <Link
                        to="/cv/manager"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                        <box-icon name='arrow-back' size='20px'></box-icon>
                        <span>Quay lại</span>
                    </Link>
                    <button
                        onClick={handleDownload}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
                    >
                        <box-icon name='download' size='20px' color='#ffffff'></box-icon>
                        <span>Download CV</span>
                    </button>
                </div>

                {/* CV Template */}
                <div 
                    ref={cvRef}
                    className="bg-white shadow-lg"
                    style={{ 
                        width: '210mm', 
                        minHeight: '297mm',
                        padding: '20mm',
                        margin: '0 auto'
                    }}
                >
                    {/* Header Section */}
                    <div className="flex items-center gap-6 mb-8 pb-6 border-b-2 border-gray-300">
                        <div className="flex-shrink-0">
                            {getAvatarUrl() ? (
                                <img 
                                    src={getAvatarUrl()} 
                                    alt="Avatar" 
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-300">
                                    <span className="text-4xl text-gray-600 font-bold">
                                        {profileData?.userName?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                {profileData?.userName || 'Họ và tên'}
                            </h1>
                            <p className="text-xl text-gray-600 mb-4">
                                {profileData?.position || 'Chức vụ'}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                {profileData?.userEmail && (
                                    <div className="flex items-center gap-2">
                                        <box-icon name='envelope' size='16px'></box-icon>
                                        <span>{profileData.userEmail}</span>
                                    </div>
                                )}
                                {profileData?.phoneNumber && (
                                    <div className="flex items-center gap-2">
                                        <box-icon name='phone' size='16px'></box-icon>
                                        <span>{profileData.phoneNumber}</span>
                                    </div>
                                )}
                                {profileData?.address && (
                                    <div className="flex items-center gap-2">
                                        <box-icon name='map' size='16px'></box-icon>
                                        <span>{profileData.address}</span>
                                    </div>
                                )}
                                {profileData?.personalLink && (
                                    <div className="flex items-center gap-2">
                                        <box-icon name='link' size='16px'></box-icon>
                                        <a href={profileData.personalLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {profileData.personalLink}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Introduction Section */}
                    {cvSections.introduction && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                Giới thiệu bản thân
                            </h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {cvSections.introduction}
                            </p>
                        </div>
                    )}

                    {/* Education Section */}
                    {cvSections.education && cvSections.education.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                Học vấn
                            </h2>
                            <div className="space-y-4">
                                {cvSections.education.map((edu, idx) => (
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
                    {cvSections.experience && cvSections.experience.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                Kinh nghiệm làm việc
                            </h2>
                            <div className="space-y-4">
                                {cvSections.experience.map((exp, idx) => (
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
                    {cvSections.skills && cvSections.skills.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                Kỹ năng
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {cvSections.skills.map((skill, idx) => (
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
                    {cvSections.languages && cvSections.languages.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                Ngoại ngữ
                            </h2>
                            <div className="space-y-2">
                                {cvSections.languages.map((lang, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span className="font-medium text-gray-800">{lang.language}</span>
                                        <span className="text-gray-600">{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects Section */}
                    {cvSections.projects && cvSections.projects.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                Dự án nổi bật
                            </h2>
                            <div className="space-y-4">
                                {cvSections.projects.map((project, idx) => (
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
                    {cvSections.certificates && cvSections.certificates.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                Chứng chỉ
                            </h2>
                            <div className="space-y-2">
                                {cvSections.certificates.map((cert, idx) => (
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
                    {cvSections.awards && cvSections.awards.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                                Giải thưởng
                            </h2>
                            <div className="space-y-3">
                                {cvSections.awards.map((award, idx) => (
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
    );
};

