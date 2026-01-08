import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../../config/api';
import { formatTimeAgo } from '../../utils/timeUtils';

export const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) {
                toast.error('Vui lòng đăng nhập');
                navigate('/login');
                return;
            }

            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: {
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            } else if (response.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn');
                localStorage.removeItem('usertoken');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                toast.error('Không thể tải thông báo');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Có lỗi xảy ra khi tải thông báo');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            try {
                const token = localStorage.getItem('usertoken');
                if (token) {
                    await fetch(`${API_BASE_URL}/api/notifications/${notification._id}/read`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                        }
                    });
                    // Update local state
                    setNotifications(prev => 
                        prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
                    );
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Navigate to link if available
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Có lỗi xảy ra');
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.isRead;
        if (filter === 'read') return notif.isRead;
        return true; // 'all'
    });

    // Counts
    const allCount = notifications.length;
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const readCount = notifications.filter(n => n.isRead).length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Thông báo của tôi</h1>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                                filter === 'all'
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span>Tất cả</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                    filter === 'all'
                                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                                        : 'bg-gray-100 text-gray-700 border-gray-300'
                                }`}>
                                    {allCount}
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                                filter === 'unread'
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span>Chưa đọc</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                    filter === 'unread'
                                        ? 'bg-red-100 text-red-700 border-red-300'
                                        : 'bg-gray-100 text-gray-700 border-gray-300'
                                }`}>
                                    {unreadCount}
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                                filter === 'read'
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span>Đã đọc</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                    filter === 'read'
                                        ? 'bg-green-100 text-green-700 border-green-300'
                                        : 'bg-gray-100 text-gray-700 border-gray-300'
                                }`}>
                                    {readCount}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Notifications Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-1 text-sm font-semibold text-gray-700">Loại</div>
                            <div className="col-span-6 text-sm font-semibold text-gray-700">Thông báo</div>
                            <div className="col-span-2 text-sm font-semibold text-gray-700 text-right">Trạng thái</div>
                            <div className="col-span-3 text-sm font-semibold text-gray-700 text-right">Thời gian</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100">
                        {isLoading ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                <p className="mt-2">Đang tải...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                <box-icon name='bell-off' size='48px' color='#9CA3AF'></box-icon>
                                <p className="mt-2">Không có thông báo</p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        !notification.isRead ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        {/* Loại - Icon */}
                                        <div className="col-span-1">
                                            <box-icon 
                                                name='clipboard' 
                                                size='24px' 
                                                color='#D97706'
                                            ></box-icon>
                                        </div>

                                        {/* Thông báo - Content */}
                                        <div className="col-span-6">
                                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {notification.message}
                                            </p>
                                            {notification.jobTitle && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                    💼 {notification.jobTitle}
                                                </span>
                                            )}
                                        </div>

                                        {/* Trạng thái */}
                                        <div className="col-span-2 text-right">
                                            {notification.isRead ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                    <box-icon name='check' size='14px' color='#16A34A'></box-icon>
                                                    Đã đọc
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                    Chưa đọc
                                                </span>
                                            )}
                                        </div>

                                        {/* Thời gian */}
                                        <div className="col-span-3 text-right">
                                            <p className="text-sm text-gray-500">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Actions */}
                    {filteredNotifications.length > 0 && filter === 'unread' && unreadCount > 0 && (
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Đánh dấu tất cả là đã đọc
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

