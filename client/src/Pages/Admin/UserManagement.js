import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';

export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra đăng nhập và role
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

            fetchUsers();
        } catch (error) {
            console.error('Error:', error);
            navigate('/login');
        }
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`${API_BASE_URL}/users/all-users`, {
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(Array.isArray(data) ? data : []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Không thể tải danh sách người dùng');
            setLoading(false);
        }
    };

    // Filter users based on search and status
    useEffect(() => {
        let filtered = [...users];

        // Filter by search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(user => 
                user.userName?.toLowerCase().includes(searchLower) ||
                user.userEmail?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(user => user.status === filterStatus);
        }

        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    }, [users, searchTerm, filterStatus]);

    const handleStatusChange = async (userId, newStatus) => {
        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`${API_BASE_URL}/users/update-user/${userId}`, {
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
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user._id === userId 
                            ? { ...user, status: newStatus }
                            : user
                    )
                );
                toast.success('Đã cập nhật trạng thái thành công');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(errorData.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('usertoken');
            const response = await fetch(`${API_BASE_URL}/users/delete-user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Xóa người dùng thành công!');
                fetchUsers();
            } else {
                toast.error('Lỗi khi xóa người dùng!');
            }
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            toast.error('Lỗi khi xóa người dùng!');
        }
    };

    const getRoleLabel = (role) => {
        const roleMap = {
            'admin': 'Administrator',
            'employer': 'Company',
            'candidate': 'Candidate'
        };
        return roleMap[role] || role;
    };

    const getStatusLabel = (status) => {
        return status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động';
    };

    const getStatusColor = (status) => {
        return status === 'active' 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
                        <p className="text-gray-600">Danh sách tài khoản người dùng trong hệ thống</p>
                    </div>
                    <Link
                        to="/admin/users/create"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        <span>Tạo tài khoản mới</span>
                    </Link>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex gap-4 items-center">
                        <box-icon
                            name='search'
                            size='20px'
                            color='#000000'
                        ></box-icon>
                        <input
                            type='text'
                            placeholder='Tìm kiếm theo tên, email...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className='px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
                        >
                            <option value='all'>Tất cả trạng thái</option>
                            <option value='active'>Hoạt động</option>
                            <option value='inactive'>Ngừng hoạt động</option>
                        </select>
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
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Họ và tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vai trò</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy kết quả' : 'Chưa có người dùng nào'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user, index) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {startIndex + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.userName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {user.userEmail || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {getRoleLabel(user.role)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={user.status || 'active'}
                                                    onChange={(e) => handleStatusChange(user._id, e.target.value)}
                                                    className={`px-3 py-1 rounded text-sm font-medium border ${getStatusColor(user.status || 'active')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                >
                                                    <option value='active'>Hoạt động</option>
                                                    <option value='inactive'>Ngừng hoạt động</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        to={`/admin/users/edit/${user._id}`}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                    >
                                                        Chỉnh sửa
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="text-red-600 hover:text-red-800 hover:underline font-medium"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
                        <div className="text-sm text-gray-700">
                            Tổng {filteredUsers.length} người dùng
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
                                <option value={5}>5 / trang</option>
                                <option value={10}>10 / trang</option>
                                <option value={20}>20 / trang</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
