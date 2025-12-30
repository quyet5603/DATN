import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { LoginContext } from '../../components/ContextProvider/Context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatsCard } from '../../components/Dashboard/StatsCard';

export const AnalyticsDashboard = () => {
  const { loginData } = useContext(LoginContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!loginData?._id) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('usertoken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/dashboard/employer/${loginData._id}`, {
          headers: {
            'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
          } else {
            console.error('API returned error:', data);
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('API error:', response.status, errorData);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (loginData) {
      fetchStats();
    }
  }, [loginData]);

  if (loading) {
    return (
      <div className='max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10'>
        <div className='text-center py-10'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
          <p className='mt-4 text-gray-600'>Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10'>
        <div className='text-center py-10'>
          <h2 className='text-2xl font-bold mb-4 text-gray-800'>Dashboard Thống Kê</h2>
          <div className='bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto'>
            <p className='text-gray-600 mb-4'>Chưa có dữ liệu thống kê để hiển thị.</p>
            <p className='text-sm text-gray-500 mb-4'>
              Để xem thống kê, bạn cần:
            </p>
            <ul className='text-left text-sm text-gray-600 space-y-2 max-w-md mx-auto'>
              <li>• Đăng ít nhất một công việc</li>
              <li>• Có ứng viên ứng tuyển vào các công việc của bạn</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const statusData = [
    { name: 'Đang xét duyệt', value: stats.applicationsByStatus.active, color: '#3b82f6' },
    { name: 'Đã duyệt', value: stats.applicationsByStatus.shortlist, color: '#10b981' },
    { name: 'Đã từ chối', value: stats.applicationsByStatus.rejected, color: '#ef4444' },
    { name: 'Đã hủy', value: stats.applicationsByStatus.inactive, color: '#6b7280' }
  ];

  const scoreDistributionData = Object.entries(stats.scoreDistribution || {}).map(([range, value]) => ({
    name: range,
    value: value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className='max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10'>
      <h2 className='text-3xl font-bold mb-8'>Dashboard Thống Kê</h2>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatsCard
          title="Tổng số việc làm"
          value={stats.totalJobs}
          color="blue"
        />
        <StatsCard
          title="Tổng số đơn ứng tuyển"
          value={stats.totalApplications}
          color="green"
        />
        <StatsCard
          title="Điểm phù hợp trung bình"
          value={`${stats.averageMatchScore}%`}
          color="yellow"
        />
        <StatsCard
          title="Đã duyệt"
          value={stats.applicationsByStatus.shortlist}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        {/* Applications by Status - Pie Chart */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h3 className='text-xl font-semibold mb-4'>Đơn ứng tuyển theo trạng thái</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution - Bar Chart */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h3 className='text-xl font-semibold mb-4'>Phân bố điểm phù hợp</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Skills */}
      {stats.topSkills && stats.topSkills.length > 0 && (
        <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
          <h3 className='text-xl font-semibold mb-4'>Top kỹ năng được tìm kiếm</h3>
          <div className='flex flex-wrap gap-3'>
            {stats.topSkills.map((skill, index) => (
              <div key={index} className='bg-blue-100 px-4 py-2 rounded-full'>
                <span className='text-blue-800 font-medium'>{skill.skill}</span>
                <span className='ml-2 text-blue-600 text-sm'>({skill.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Jobs */}
      {stats.topJobs && stats.topJobs.length > 0 && (
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h3 className='text-xl font-semibold mb-4'>Top việc làm được ứng tuyển nhiều nhất</h3>
          <div className='space-y-3'>
            {stats.topJobs.map((job, index) => (
              <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex-1'>
                  <h4 className='font-semibold text-gray-800'>{job.jobTitle}</h4>
                  <p className='text-sm text-gray-600'>{job.applicationsCount} đơn ứng tuyển</p>
                </div>
                <div className='flex items-center gap-4'>
                  <Link 
                    to={`/matched-candidates/${job.jobId || job._id}`}
                    className='bg-secondary text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-sm font-medium'
                  >
                    Xem ứng viên
                  </Link>
                  <div className='text-2xl font-bold text-blue-600'>#{index + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

