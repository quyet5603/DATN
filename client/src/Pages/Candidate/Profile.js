import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginContext } from '../../components/ContextProvider/Context';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const Profile = () => {
    const navigate = useNavigate();
    const { loginData } = useContext(LoginContext);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [cvs, setCvs] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        companyTitle: '',
        companyDescription: '',
        website: '',
        companyLocations: '',
        companySize: '',
        companyType: '',
        industry: '',
        country: '',
        establishedYear: '',
        workingHours: '',
        companyIntroduction: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem('usertoken');
            const userStr = localStorage.getItem('user');
            
            if (!userStr || !token) {
                toast.error('Vui lòng đăng nhập để xem hồ sơ');
                navigate('/login');
                return;
            }

            const userData = JSON.parse(userStr);
            setUser(userData);

            // Load avatar
            if (userData.avatar) {
                const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
                setAvatarUrl(`${baseURL}/uploads/${userData.avatar}`);
                setLogoPreview(`${baseURL}/uploads/${userData.avatar}`);
            }

            // Load form data for employer
            if (userData.role === 'employer') {
                setFormData({
                    companyTitle: userData.companyTitle || '',
                    companyDescription: userData.companyDescription || '',
                    website: userData.website || '',
                    companyLocations: userData.companyLocations || '',
                    companySize: userData.companySize || '',
                    companyType: userData.companyType || '',
                    industry: userData.industry || '',
                    country: userData.country || '',
                    establishedYear: userData.establishedYear || '',
                    workingHours: userData.workingHours || '',
                    companyIntroduction: userData.companyIntroduction || ''
                });
                
                // Auto enter edit mode if no company info exists
                const hasCompanyInfo = userData.companyTitle || userData.website || userData.companyLocations || 
                                     userData.companySize || userData.companyType || userData.industry || 
                                     userData.country || userData.establishedYear || userData.workingHours || 
                                     userData.companyIntroduction;
                if (!hasCompanyInfo) {
                    setIsEditing(true);
                }
            }

            // Load CVs (only for candidate)
            if (userData.role === 'candidate') {
                await fetchCVs();
            }
            setLoading(false);
        };

        loadData();
    }, [navigate]);

    const fetchCVs = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) return;
            
            const apiUrl = API_BASE_URL.includes('localhost') 
                ? `${API_BASE_URL}/api/cv/list`
                : `${API_BASE_URL}/api/cv/list`;
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCvs(data.cvs || []);
            } else {
                console.error('Failed to fetch CVs:', response.status);
            }
        } catch (error) {
            console.error('Error fetching CVs:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">Đang tải...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-gray-700">Không tìm thấy thông tin người dùng.</p>
                </div>
            </div>
        );
    }

    const defaultCV = cvs.find(cv => cv.isDefault) || cvs[0];
    const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
    const userRole = user.role || loginData?.role;

    // Render for Candidate
    if (userRole === 'candidate') {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Thông tin cá nhân */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                                        <box-icon name='user' size='48px' color='#9CA3AF'></box-icon>
                                    </div>
                                )}
                            </div>

                            {/* Thông tin */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.userName || 'Chưa cập nhật'}</h2>
                                
                                {/* Role/Position */}
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <box-icon name='briefcase' size='16px' color='#6B7280'></box-icon>
                                    <span>{user.position || 'Chưa cập nhật'}</span>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-2 text-gray-600 mb-4">
                                    <box-icon name='envelope' size='16px' color='#6B7280'></box-icon>
                                    <span>{user.userEmail || 'Chưa cập nhật'}</span>
                                </div>

                                {/* Nút Cập nhật hồ sơ */}
                                <Link
                                    to="/cv/manager"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    <span>Cập nhật hồ sơ</span>
                                    <box-icon name='right-arrow-alt' size='16px' color='currentColor'></box-icon>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Hồ sơ đính kèm */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Hồ sơ đính kèm</h3>
                        
                        {cvs.length > 0 ? (
                            <div className="space-y-4">
                                {cvs.map((cv) => (
                                    <div key={cv._id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                                <box-icon name='file-blank' size='24px' color='#10B981'></box-icon>
                                            </div>
                                        </div>

                                        {/* Thông tin CV */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 mb-2">{cv.cvName || 'CV của bạn'}</h4>
                                            
                                            {/* Link */}
                                            <div>
                                                <Link
                                                    to="/cv/template"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                                >
                                                    <span>Xem CV template</span>
                                                    <box-icon name='link-external' size='14px' color='currentColor'></box-icon>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <box-icon name='file-blank' size='48px' color='#9CA3AF' className="mb-4"></box-icon>
                                <p>Chưa có hồ sơ đính kèm</p>
                                <Link
                                    to="/cv/manager"
                                    className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Thêm hồ sơ đính kèm
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Handle logo change
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('usertoken');
            const userStr = localStorage.getItem('user');
            const userData = JSON.parse(userStr);

            // First upload logo if changed
            if (selectedFile) {
                const logoFormData = new FormData();
                logoFormData.append('avatar', selectedFile);
                
                const logoResponse = await fetch(`${API_BASE_URL}/users/upload-avatar/${userData._id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                    },
                    body: logoFormData
                });

                if (logoResponse.ok) {
                    const logoResult = await logoResponse.json();
                    if (logoResult.user && logoResult.user.avatar) {
                        const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
                        setAvatarUrl(`${baseURL}/uploads/${logoResult.user.avatar}`);
                        localStorage.setItem('user', JSON.stringify(logoResult.user));
                    }
                }
            }

            // Then update profile data
            const response = await fetch(`${API_BASE_URL}/users/update-profile/${userData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                },
                body: JSON.stringify({
                    userName: userData.userName,
                    userEmail: userData.userEmail,
                    ...formData
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.user) {
                    localStorage.setItem('user', JSON.stringify(result.user));
                    setUser(result.user);
                    setIsEditing(false);
                    toast.success('Cập nhật thông tin công ty thành công');
                }
            } else {
                toast.error('Có lỗi xảy ra khi cập nhật');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    // Render for Employer (Company Profile)
    if (isEditing) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left: Logo Section */}
                                <div className="flex-shrink-0">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin công ty</h2>
                                    <div className="w-48 h-48 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Company Logo"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <span className="text-white text-4xl font-bold">
                                                {user.companyTitle?.charAt(0)?.toUpperCase() || user.userName?.charAt(0)?.toUpperCase() || 'C'}
                                            </span>
                                        )}
                                    </div>
                                    <label className="block">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                        <span className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                                            Đổi logo
                                        </span>
                                    </label>
                                </div>

                                {/* Right: Form fields */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tiêu đề <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.companyTitle}
                                            onChange={(e) => setFormData({ ...formData, companyTitle: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Global IT Services & Solutions Provider"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                        <textarea
                                            value={formData.companyDescription}
                                            onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                            placeholder="FPT Software là công ty thành viên thuộc Tập đoàn FPT..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                            <input
                                                type="url"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="https://fpt-software.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
                                            <input
                                                type="text"
                                                value={formData.companyLocations}
                                                onChange={(e) => setFormData({ ...formData, companyLocations: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Hanoi, Da Nang, Ho Chi Minh City"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Quy mô</label>
                                            <input
                                                type="text"
                                                value={formData.companySize}
                                                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="10,00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình công ty</label>
                                            <input
                                                type="text"
                                                value={formData.companyType}
                                                onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Công ty Cổ phần"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Lĩnh vực</label>
                                            <input
                                                type="text"
                                                value={formData.industry}
                                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Công nghệ thông tin"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia</label>
                                            <input
                                                type="text"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Việt Nam"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Năm thành lập</label>
                                            <input
                                                type="text"
                                                value={formData.establishedYear}
                                                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="1999"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian làm việc</label>
                                            <input
                                                type="text"
                                                value={formData.workingHours}
                                                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Thứ 2 - Thứ 6"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu công ty</label>
                                        <textarea
                                            value={formData.companyIntroduction}
                                            onChange={(e) => setFormData({ ...formData, companyIntroduction: e.target.value })}
                                            rows={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                            placeholder="FPT Software là một trong những doanh nghiệp công nghệ hàng đầu Việt Nam..."
                                        />
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex justify-end gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Cập nhật
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Render view mode for Employer
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Card 1: Thông tin công ty */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-start gap-6">
                        {/* Logo công ty - hình vuông màu đỏ */}
                        <div className="flex-shrink-0">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Company Logo"
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-red-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold">
                                        {user.companyTitle?.charAt(0)?.toUpperCase() || user.userName?.charAt(0)?.toUpperCase() || 'C'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thông tin công ty */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.companyTitle || user.userName || 'Chưa cập nhật'}</h2>
                            
                            {/* Email */}
                            <div className="flex items-center gap-2 text-gray-800 mb-4">
                                <box-icon name='envelope' size='16px' color='#374151'></box-icon>
                                <span>{user.userEmail || 'Chưa cập nhật'}</span>
                            </div>

                            {/* Nút Cập nhật hồ sơ */}
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                <span>Cập nhật hồ sơ công ty</span>
                                <box-icon name='right-arrow-alt' size='16px' color='currentColor'></box-icon>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Card 2: Chi tiết thông tin công ty */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Thông tin công ty</h3>
                    
                    {user.website || user.companyLocations || user.companySize || user.companyType || user.industry || user.country || user.establishedYear || user.workingHours || user.companyIntroduction ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.website && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Website</label>
                                    <p className="text-gray-800">{user.website}</p>
                                </div>
                            )}
                            {user.companyLocations && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Địa điểm</label>
                                    <p className="text-gray-800">{user.companyLocations}</p>
                                </div>
                            )}
                            {user.companySize && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Quy mô</label>
                                    <p className="text-gray-800">{user.companySize}</p>
                                </div>
                            )}
                            {user.companyType && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Loại hình công ty</label>
                                    <p className="text-gray-800">{user.companyType}</p>
                                </div>
                            )}
                            {user.industry && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Lĩnh vực</label>
                                    <p className="text-gray-800">{user.industry}</p>
                                </div>
                            )}
                            {user.country && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Quốc gia</label>
                                    <p className="text-gray-800">{user.country}</p>
                                </div>
                            )}
                            {user.establishedYear && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Năm thành lập</label>
                                    <p className="text-gray-800">{user.establishedYear}</p>
                                </div>
                            )}
                            {user.workingHours && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Thời gian làm việc</label>
                                    <p className="text-gray-800">{user.workingHours}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <box-icon name='building' size='32px' color='#9CA3AF'></box-icon>
                            </div>
                            <p className="mb-4">Chưa có thông tin công ty</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Cập nhật thông tin công ty
                            </button>
                        </div>
                    )}

                    {user.companyIntroduction && (
                        <div className="mt-6">
                            <label className="text-sm font-medium text-gray-500 block mb-2">Giới thiệu công ty</label>
                            <p className="text-gray-800 whitespace-pre-wrap">{user.companyIntroduction}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
