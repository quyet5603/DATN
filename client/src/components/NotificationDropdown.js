import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'boxicons';
import API_BASE_URL from '../config/api';
import { formatTimeAgo } from '../utils/timeUtils';

export const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) return;

            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: {
                    'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            } else if (response.status === 401) {
                // Token expired
                localStorage.removeItem('usertoken');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch notifications on mount
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (notification) => {
        // Mark as read
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
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Navigate to link if available
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/notifications');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white hover:text-green-100 transition-colors focus:outline-none"
            >
                <box-icon name='bell' size='24px' color='currentColor'></box-icon>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-teal-500 px-4 py-3 border-b border-teal-600">
                        <h3 className="text-white font-semibold text-lg">Thông báo</h3>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500">
                                Đang tải...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <box-icon name='bell-off' size='48px' color='#9CA3AF'></box-icon>
                                <p className="mt-2">Không có thông báo</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                            !notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 mt-1">
                                                <box-icon name='clipboard' size='20px' color='#4B5563'></box-icon>
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-800 text-sm mb-1">
                                                    {notification.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {notification.message}
                                                </p>
                                                {notification.jobTitle && (
                                                    <p className="text-sm text-blue-600 font-medium mb-1">
                                                        💼 {notification.jobTitle}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>

                                            {/* Unread indicator */}
                                            {!notification.isRead && (
                                                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <button
                                onClick={handleViewAll}
                                className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                            >
                                Xem tất cả thông báo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

