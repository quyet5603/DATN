import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        totalApplications: 0,
        activeEmployers: 0,
        activeCandidates: 0
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
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
            setUser(userData);

            // Kiểm tra role admin
            if (userData.role !== 'admin') {
                alert('Bạn không có quyền truy cập trang này!');
                navigate('/');
                return;
            }

            // Lấy thống kê
            fetchStats();
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('usertoken');
            if (!token) {
                navigate('/login');
                return;
            }

            // Lấy thống kê từ API
            const [usersRes, jobsRes, applicationsRes] = await Promise.all([
                fetch('http://localhost:8080/users/all-users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }),
                fetch('http://localhost:8080/jobs/all-jobs', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }),
                fetch('http://localhost:8080/application/all-application/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            ]);

            // Xử lý response và log lỗi nếu có
            let users = [];
            let jobs = [];
            let applications = [];

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                users = Array.isArray(usersData) ? usersData : [];
                console.log('✅ Users loaded:', users.length);
            } else {
                const errorData = await usersRes.json().catch(() => ({}));
                console.error('❌ Error fetching users:', usersRes.status, errorData);
            }

            if (jobsRes.ok) {
                const jobsData = await jobsRes.json();
                jobs = Array.isArray(jobsData) ? jobsData : [];
                console.log('✅ Jobs loaded:', jobs.length);
            } else {
                const errorData = await jobsRes.json().catch(() => ({}));
                console.error('❌ Error fetching jobs:', jobsRes.status, errorData);
            }

            if (applicationsRes.ok) {
                const applicationsData = await applicationsRes.json();
                applications = Array.isArray(applicationsData) ? applicationsData : [];
                console.log('✅ Applications loaded:', applications.length);
            } else {
                const errorData = await applicationsRes.json().catch(() => ({}));
                console.error('❌ Error fetching applications:', applicationsRes.status, errorData);
            }

            // Tính toán thống kê
            const totalUsers = users.length;
            const totalJobs = jobs.length;
            const totalApplications = applications.length;
            const activeEmployers = users.filter(u => u.role === 'employer').length;
            const activeCandidates = users.filter(u => u.role === 'candidate').length;

            console.log('📊 Stats calculated:', {
                totalUsers,
                activeEmployers,
                activeCandidates,
                totalJobs,
                totalApplications
            });

            setStats({
                totalUsers,
                totalJobs,
                totalApplications,
                activeEmployers,
                activeCandidates
            });
            setLoading(false);
        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý và theo dõi hệ thống</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-12 border border-gray-200 flex flex-col justify-center items-center text-center min-h-[220px]">
                        <div className="text-lg font-semibold text-gray-600 mb-5 whitespace-nowrap">Tổng Người Dùng</div>
                        <div className="text-6xl font-bold text-gray-900">{stats.totalUsers}</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-12 border border-gray-200 flex flex-col justify-center items-center text-center min-h-[220px]">
                        <div className="text-lg font-semibold text-gray-600 mb-5 whitespace-nowrap">Nhà Tuyển Dụng</div>
                        <div className="text-6xl font-bold text-blue-600">{stats.activeEmployers}</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-12 border border-gray-200 flex flex-col justify-center items-center text-center min-h-[220px]">
                        <div className="text-lg font-semibold text-gray-600 mb-5 whitespace-nowrap">Ứng Viên</div>
                        <div className="text-6xl font-bold text-green-600">{stats.activeCandidates}</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-12 border border-gray-200 flex flex-col justify-center items-center text-center min-h-[220px]">
                        <div className="text-lg font-semibold text-gray-600 mb-5 whitespace-nowrap">Tổng Công Việc</div>
                        <div className="text-6xl font-bold text-purple-600">{stats.totalJobs}</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-12 border border-gray-200 flex flex-col justify-center items-center text-center min-h-[220px]">
                        <div className="text-lg font-semibold text-gray-600 mb-5 whitespace-nowrap">Đơn Ứng Tuyển</div>
                        <div className="text-6xl font-bold text-orange-600">{stats.totalApplications}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

