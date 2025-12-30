import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LoginContext } from '../../components/ContextProvider/Context';
import { toast } from 'react-toastify';

export const ImproveCV = () => {
  const { id: jobId } = useParams();
  const { loginData } = useContext(LoginContext);
  const [loading, setLoading] = useState(false);
  const [improvements, setImprovements] = useState(null);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    // Fetch job title
    const fetchJobTitle = async () => {
      try {
        const response = await fetch(`http://localhost:8080/jobs/current-job/${jobId}`);
        const job = await response.json();
        if (job) {
          setJobTitle(job.jobTitle);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
      }
    };

    if (jobId) {
      fetchJobTitle();
    }
  }, [jobId]);

  const fetchImprovements = async () => {
    if (!loginData?.token) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('usertoken') || loginData.token;
      const response = await fetch(`http://localhost:8080/api/ai/improve-cv/${jobId}`, {
        headers: {
          'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setImprovements(data);
        toast.success('Đã tạo gợi ý cải thiện CV!');
      } else {
        toast.error(data.error || 'Không thể tạo gợi ý cải thiện');
      }
    } catch (error) {
      console.error('Error fetching improvements:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId && loginData) {
      fetchImprovements();
    }
  }, [jobId, loginData]);

  if (loading) {
    return (
      <div className='max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10'>
        <div className='text-center py-10'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
          <p className='mt-4 text-gray-600'>Đang phân tích CV và tạo gợi ý cải thiện...</p>
        </div>
      </div>
    );
  }

  if (!improvements) {
    return (
      <div className='max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10'>
        <div className='bg-white rounded-lg shadow-md p-8 text-center'>
          <h2 className='text-2xl font-bold mb-4'>Cải thiện CV của bạn</h2>
          <p className='text-gray-600 mb-6'>
            Chúng tôi cần phân tích CV của bạn để đưa ra gợi ý cải thiện phù hợp với công việc: <strong>{jobTitle}</strong>
          </p>
          <button
            onClick={fetchImprovements}
            className='bg-secondary text-white py-2 px-6 rounded-md hover:opacity-90 transition-opacity'
          >
            Bắt đầu phân tích
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10'>
      <div className='bg-white rounded-lg shadow-md p-8'>
        <div className='mb-6'>
          <h2 className='text-3xl font-bold mb-2'>Gợi ý cải thiện CV</h2>
          <p className='text-gray-600'>
            Cho vị trí: <span className='font-semibold'>{jobTitle || improvements.jobTitle}</span>
          </p>
          <div className='mt-4 flex items-center gap-4'>
            <div className='bg-gray-100 rounded-lg px-4 py-2'>
              <span className='text-sm text-gray-600'>Điểm hiện tại:</span>
              <span className='ml-2 text-xl font-bold text-gray-800'>{improvements.currentScore}%</span>
            </div>
            <Link
              to={`/cv-upload/${jobId}`}
              className='text-blue-600 hover:underline text-sm'
            >
              📝 Xem phân tích chi tiết CV
            </Link>
          </div>
        </div>

        {/* Strengths */}
        {improvements.strengths && improvements.strengths.length > 0 && (
          <div className='mb-6'>
            <h3 className='text-xl font-semibold mb-3 text-green-700'>
              ✅ Điểm mạnh của bạn
            </h3>
            <ul className='list-disc list-inside space-y-2 bg-green-50 p-4 rounded-lg'>
              {improvements.strengths.map((strength, index) => (
                <li key={index} className='text-gray-700'>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {improvements.weaknesses && improvements.weaknesses.length > 0 && (
          <div className='mb-6'>
            <h3 className='text-xl font-semibold mb-3 text-orange-700'>
              ⚠️ Điểm cần cải thiện
            </h3>
            <ul className='list-disc list-inside space-y-2 bg-orange-50 p-4 rounded-lg'>
              {improvements.weaknesses.map((weakness, index) => (
                <li key={index} className='text-gray-700'>{weakness}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvement Tips */}
        {improvements.improvements && improvements.improvements.length > 0 && (
          <div className='mb-6'>
            <h3 className='text-xl font-semibold mb-3 text-blue-700'>
              💡 Gợi ý cải thiện
            </h3>
            <div className='space-y-3'>
              {improvements.improvements.map((tip, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    tip.type === 'suggestion'
                      ? 'bg-blue-50 border-blue-400'
                      : tip.type === 'weakness'
                      ? 'bg-orange-50 border-orange-400'
                      : 'bg-green-50 border-green-400'
                  }`}
                >
                  <p className='text-gray-800'>{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {improvements.recommendations && improvements.recommendations.length > 0 && (
          <div className='mb-6'>
            <h3 className='text-xl font-semibold mb-3 text-purple-700'>
              🎯 Khuyến nghị
            </h3>
            <ul className='list-disc list-inside space-y-2 bg-purple-50 p-4 rounded-lg'>
              {improvements.recommendations.map((rec, index) => (
                <li key={index} className='text-gray-700'>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className='mt-8 pt-6 border-t border-gray-200 flex gap-4'>
          <Link
            to={`/cv-upload/${jobId}`}
            className='bg-secondary text-white py-2 px-6 rounded-md hover:opacity-90 transition-opacity'
          >
            Tải CV mới sau khi cải thiện
          </Link>
          <Link
            to={`/current-job/${jobId}`}
            className='bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors'
          >
            Quay lại chi tiết công việc
          </Link>
        </div>
      </div>
    </div>
  );
};

