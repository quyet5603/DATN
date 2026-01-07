import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const CompanyDetailAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompany();
    }, [id]);

    const fetchCompany = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`${API_BASE_URL}/users/user/${id}`, {
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCompany(data);
            } else {
                toast.error('Không thể tải thông tin công ty');
                navigate('/admin/companies');
            }
        } catch (error) {
            console.error('Error fetching company:', error);
            toast.error('Lỗi khi tải thông tin công ty');
            navigate('/admin/companies');
        } finally {
            setLoading(false);
        }
    };

    const getCompanyLogo = () => {
        if (company?.avatar) {
            const baseURL = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
            return `${baseURL}/uploads/${company.avatar}`;
        }
        return null;
    };

    const getCompanyInitials = () => {
        const name = company?.companyTitle || company?.userName || 'C';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

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

    if (!company) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center py-20">
                        <p className="text-gray-600">Không tìm thấy công ty</p>
                        <Link to="/admin/companies" className="mt-4 text-blue-600 hover:underline">
                            Quay lại danh sách
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const logoUrl = getCompanyLogo();
    const initials = getCompanyInitials();
    const colors = [
        'bg-pink-500', 'bg-teal-500', 'bg-red-500', 
        'bg-blue-500', 'bg-yellow-500', 'bg-green-500',
        'bg-purple-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    const colorIndex = initials.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        to="/admin/companies"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <box-icon name='arrow-back' size='20px' color='#4B5563'></box-icon>
                        <span className="font-medium">Quay lại</span>
                    </Link>
                </div>

                {/* Title Section */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết công ty</h1>
                    <p className="text-gray-600">Xem thông tin chi tiết của công ty</p>
                </div>

                {/* Company Overview */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-start gap-6">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            {logoUrl ? (
                                <img 
                                    src={logoUrl} 
                                    alt={company.companyTitle || company.userName}
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                            ) : (
                                <div className={`w-24 h-24 rounded-lg flex items-center justify-center text-white font-bold text-2xl ${bgColor}`}>
                                    {initials}
                                </div>
                            )}
                        </div>
                        {/* Company Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {company.companyTitle || company.userName || 'N/A'}
                            </h2>
                            {company.companyDescription && (
                                <p className="text-gray-600 mb-4">{company.companyDescription}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-6">
                                {company.website && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <box-icon name='link' size='18px' color='#6B7280'></box-icon>
                                        <a
                                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {company.website}
                                        </a>
                                    </div>
                                )}
                                {company.companyLocations && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <box-icon name='map' size='18px' color='#6B7280'></box-icon>
                                        <span>{company.companyLocations}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Details Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Tiêu đề</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.companyTitle || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Mô tả</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.companyDescription || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Website</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">
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
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Địa điểm</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.companyLocations || company.address || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Quy mô</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.companySize || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Loại hình công ty</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.companyType || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Lĩnh vực</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.industry || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Quốc gia</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.country || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Năm thành lập</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.establishedYear || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Thời gian làm việc</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.workingHours || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Giới thiệu công ty</td>
                                    <td className="py-4 px-4 text-sm text-gray-900 whitespace-pre-wrap">
                                        {company.companyIntroduction || 'N/A'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Email</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.userEmail || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">Số điện thoại</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{company.phoneNumber || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

