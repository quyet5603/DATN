import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginContext } from '../../components/ContextProvider/Context';

export const MatchedCandidates = () => {
  const { id: jobId } = useParams();
  const { loginData } = useContext(LoginContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchMatchedCandidates();
    }
  }, [jobId]);

  const fetchMatchedCandidates = async () => {
    try {
      const token = localStorage.getItem('usertoken');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/ai/matched-candidates/${jobId}`,
        {
          headers: {
            'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCandidates(data.candidates || []);
        setJobTitle(data.jobTitle || '');
      } else {
        toast.error(data.error || 'Không thể lấy danh sách ứng viên');
      }
    } catch (error) {
      console.error('Error fetching matched candidates:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Ứng Viên Phù Hợp với {jobTitle || 'Công Việc'}
        </h2>
      </div>

      {candidates.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            Chưa có ứng viên nào ứng tuyển cho công việc này
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ứng viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hạng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((candidate, index) => (
                <tr key={candidate.candidateId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {candidate.candidateName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {candidate.candidateEmail || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">#{candidate.rank || index + 1}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/shortlist/details/${candidate.candidateId}/${jobId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

