import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginContext } from '../../components/ContextProvider/Context';

export const RecommendedJobs = () => {
  const { loginData } = useContext(LoginContext);
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

      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
      } else {
        console.error('API error:', data);
        toast.error(data.error || 'Không thể lấy danh sách công việc gợi ý');
      }
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      toast.error('Có lỗi xảy ra');
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
      <h2 className="text-2xl font-bold mb-6">Công Việc Được AI Gợi ý</h2>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <div
            key={job.jobId}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {job.jobTitle}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.employmentType}</span>
                  <span>•</span>
                  <span>{job.salary}</span>
                </div>
                {job.matchScore !== undefined && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">Độ phù hợp:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(
                        job.matchScore
                      )}`}
                    >
                      {job.matchScore}%
                    </span>
                  </div>
                )}
              </div>
              <Link
                to={`/current-job/${job.jobId}`}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

