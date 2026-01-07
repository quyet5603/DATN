import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(userStr);
            if (userData.role !== 'admin') {
                toast.error('Bạn không có quyền truy cập trang này!');
                navigate('/');
                return;
            }

            fetchCompanies();
        } catch (error) {
            console.error('Error:', error);
            navigate('/login');
        }
    }, [navigate]);

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`${API_BASE_URL}/users/all-users`, {
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter chỉ lấy users có role = 'employer'
                const employerUsers = Array.isArray(data) 
                    ? data.filter(user => user.role === 'employer')
                    : [];
                setCompanies(employerUsers);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error('Không thể tải danh sách công ty');
            setLoading(false);
        }
    };

    // Filter companies based on search
    useEffect(() => {
        let filtered = [...companies];

        // Filter by search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(company => 
                company.companyTitle?.toLowerCase().includes(searchLower) ||
                company.userName?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredCompanies(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    }, [companies, searchTerm]);

    const handleDeleteCompany = async (companyId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa công ty này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`${API_BASE_URL}/users/delete-user/${companyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Xóa công ty thành công!');
                fetchCompanies();
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(errorData.message || 'Không thể xóa công ty');
            }
        } catch (error) {
            console.error('Lỗi khi xóa công ty:', error);
            toast.error('Lỗi khi xóa công ty!');
        }
    };

    const getCompanyLogo = (company) => {
        if (company.avatar) {
            const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
            return `${baseURL}/uploads/${company.avatar}`;
        }
        // Return initials if no avatar
        const initials = (company.companyTitle || company.userName || 'C')
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        return null; // Will use initials in JSX
    };

    const getCompanyInitials = (company) => {
        const name = company.companyTitle || company.userName || 'C';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Pagination
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý công ty</h1>
                    <p className="text-gray-600">Danh sách công ty đăng ký trong hệ thống</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex gap-4 items-center">
                        <box-icon
                            name='search'
                            size='20px'
                            color='#000000'
                        ></box-icon>
                        <input
                            type='text'
                            placeholder='Tìm kiếm theo tên công ty...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                        <button
                            type='button'
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2'
                        >
                            <box-icon name='search' color='#ffffff' size='18px'></box-icon>
                            <span>Tìm kiếm</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STT</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Logo</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tiêu đề</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Website</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Địa điểm</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quy mô</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedCompanies.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có công ty nào'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedCompanies.map((company, index) => {
                                        const logoUrl = getCompanyLogo(company);
                                        const initials = getCompanyInitials(company);
                                        // Generate color based on initials
                                        const colors = [
                                            'bg-pink-500', 'bg-teal-500', 'bg-red-500', 
                                            'bg-blue-500', 'bg-yellow-500', 'bg-green-500',
                                            'bg-purple-500', 'bg-indigo-500', 'bg-orange-500'
                                        ];
                                        const colorIndex = initials.charCodeAt(0) % colors.length;
                                        const bgColor = colors[colorIndex];

                                        return (
                                            <tr key={company._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {startIndex + index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {logoUrl ? (
                                                        <img 
                                                            src={logoUrl} 
                                                            alt={company.companyTitle || company.userName}
                                                            className="w-12 h-12 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className={`w-12 h-12 rounded flex items-center justify-center text-white font-bold ${bgColor}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {company.companyTitle || company.userName || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {company.website ? (
                                                        <a 
                                                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            {company.website}
                                                        </a>
                                                    ) : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {company.companyLocations || company.address || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {company.companySize || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <Link
                                                            to={`/admin/companies/detail/${company._id}`}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                        >
                                                            Xem chi tiết
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteCompany(company._id)}
                                                            className="text-red-600 hover:text-red-800 hover:underline font-medium"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {filteredCompanies.length > 0 && (
                    <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                        <div className="text-sm text-gray-700">
                            Tổng {filteredCompanies.length} công ty
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <box-icon name='chevron-left' size='16px' color='#374151'></box-icon>
                            </button>
                            <div className="flex gap-1">
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
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <box-icon name='chevron-right' size='16px' color='#374151'></box-icon>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Hiển thị:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={10}>10 / trang</option>
                                <option value={20}>20 / trang</option>
                                <option value={50}>50 / trang</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

