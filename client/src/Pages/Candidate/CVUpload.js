import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginContext } from '../../components/ContextProvider/Context';

export const CVUpload = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { loginData } = useContext(LoginContext);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('usertoken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        toast.error('Vui lòng chọn file PDF');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file CV');
      return;
    }

    // Check authentication - token và user từ localStorage
    const token = localStorage.getItem('usertoken');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      toast.error('Vui lòng đăng nhập');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`http://localhost:8080/api/ai/analyze-cv/${jobId}`, {
        method: 'POST',
        headers: {
          'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
        },
        body: formData
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Lỗi phân tích CV';
        let errorDetails = null;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData.details;
        } catch (e) {
          errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
        }
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          details: errorDetails
        });
        toast.error(errorMessage);
        return;
      }

      let data;
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText.substring(0, 200)); // Log first 200 chars
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        toast.error('Lỗi khi xử lý kết quả từ server');
        return;
      }
      
      // Check if response has success flag
      if (data.success === false) {
        toast.error(data.error || 'Lỗi phân tích CV');
        return;
      }

      // Validate analysis data
      if (!data.score && data.score !== 0) {
        console.error('Invalid analysis data:', data);
        toast.error('Dữ liệu phân tích không hợp lệ');
        return;
      }

      // Set analysis result
      setAnalysis(data);
      toast.success('Phân tích CV thành công!');
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error(`Có lỗi xảy ra khi phân tích CV: ${error.message || 'Vui lòng thử lại sau'}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Phân Tích CV với AI</h2>

        {!analysis ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file CV (PDF)
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Đã chọn: {file.name}
                </p>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang phân tích...' : 'Phân Tích CV'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score Display */}
            <div className={`${getScoreBg(analysis.score)} p-6 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    Điểm số phù hợp
                  </p>
                  <p className={`text-4xl font-bold ${getScoreColor(analysis.score)} mt-2`}>
                    {analysis.emoji} {analysis.score}%
                  </p>
                  <p className="text-lg text-gray-600 mt-1">
                    {analysis.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Match Reasons */}
            {analysis.match_reasons && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Lý do phù hợp:
                </h3>
                <p className="text-gray-600">{analysis.match_reasons}</p>
              </div>
            )}

            {/* Red Flags */}
            {analysis.red_flags && Object.keys(analysis.red_flags).length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-700 mb-2">
                  Điểm cần cải thiện:
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(analysis.red_flags).map(([key, flags]) => (
                    flags && flags.length > 0 && (
                      <li key={key} className="text-red-600">
                        {flags.join(', ')}
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}

            {/* Website */}
            {analysis.website && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Website cá nhân:</h3>
                <a
                  href={analysis.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {analysis.website}
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setFile(null);
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Phân tích CV khác
              </button>
              {jobId && (
                <>
                  <Link
                    to={`/improve-cv/${jobId}`}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 text-center"
                  >
                    💡 Xem gợi ý cải thiện CV
                  </Link>
                  <button
                    onClick={() => navigate(`/application-form/${jobId}`)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    Nộp đơn ứng tuyển
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

