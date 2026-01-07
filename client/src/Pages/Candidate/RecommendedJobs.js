import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginContext } from '../../components/ContextProvider/Context';
import { MatchScoreBar } from '../../components/AI/MatchScoreBar';
import { MatchDetailsCard } from '../../components/AI/MatchDetailsCard';

export const RecommendedJobs = () => {
  const { loginData, setLoginData } = useContext(LoginContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  const fetchRecommendedJobs = async () => {
    try {
      const token = localStorage.getItem('usertoken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/ai/recommended-jobs', {
        headers: {
          'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
        }
      });

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error (401):', errorData);
        
        // Clear expired token and user data
        localStorage.removeItem('usertoken');
        localStorage.removeItem('user');
        setLoginData(null);
        
        // Show appropriate message
        if (errorData.error === 'jwt expired' || errorData.message?.includes('expired')) {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        }
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        // Backend trả về recommendedJobs hoặc jobs
        const jobsList = data.recommendedJobs || data.jobs || [];
        console.log('✅ Recommended jobs received:', jobsList.length, 'jobs');
        if (jobsList.length > 0) {
          console.log('📊 Sample job data:', {
            jobTitle: jobsList[0].jobTitle,
            matchScore: jobsList[0].matchScore,
            locationMatch: jobsList[0].locationMatch,
            experienceMatch: jobsList[0].experienceMatch,
            skillsMatch: jobsList[0].skillsMatch
          });
        }
        setJobs(jobsList);
        
        // Hiển thị thông báo nếu có công việc
        if (jobsList.length > 0) {
          toast.success(`Tìm thấy ${jobsList.length} công việc gợi ý! Click "Xem chi tiết" để AI phân tích độ phù hợp.`);
        }
      } else {
        console.error('API error:', data);
        toast.error(data.error || 'Không thể lấy danh sách công việc gợi ý');
      }
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      toast.error('Có lỗi xảy ra khi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  const token = localStorage.getItem('usertoken');
  if (!token) {
    return (
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Vui lòng đăng nhập và upload CV để nhận gợi ý công việc phù hợp
          </p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Công Việc Được Gợi ý</h2>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            Chưa có công việc nào được gợi ý. Vui lòng upload CV để nhận gợi ý phù hợp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Công Việc Được Gợi ý</h2>
        <p className="text-gray-600">
          🤖 Click "Xem chi tiết" để AI phân tích độ phù hợp của CV với từng công việc
        </p>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.jobId}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {job.jobTitle}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <span>📍</span>
                      {job.location}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                      <span>💼</span>
                      {job.employmentType}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                      <span>💰</span>
                      {job.salary}
                    </span>
                  </div>
                  
                  {/* Mô tả ngắn */}
                  {job.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {job.description}
                    </p>
                  )}
                </div>
                
                <Link
                  to={`/current-job/${job.jobId}`}
                  className="flex-shrink-0 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow flex items-center gap-2"
                >
                  <span>Xem chi tiết</span>
                  <span>→</span>
                </Link>
              </div>
              
              {/* Badge AI sẽ phân tích khi xem chi tiết */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600">🤖</span>
                  <span className="text-gray-600">
                    AI sẽ phân tích độ phù hợp khi bạn xem chi tiết công việc
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

