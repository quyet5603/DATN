import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginContext } from '../../components/ContextProvider/Context';

export const InterviewPractice = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { loginData } = useContext(LoginContext);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Lấy token từ localStorage
  useEffect(() => {
    const userToken = localStorage.getItem('usertoken');
    const userStr = localStorage.getItem('user');
    
    if (userToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        setToken(userToken);
        // Cập nhật loginData nếu chưa có
        if (!loginData) {
          // loginData sẽ được set từ context
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (jobId && token && !sessionId) {
      setIsInitializing(true);
      startInterview();
    } else if (!token) {
      setIsInitializing(false);
    }
  }, [jobId, token]);

  const startInterview = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập');
      setError('Vui lòng đăng nhập');
      setIsInitializing(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/start-interview/${jobId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Kiểm tra response status trước khi parse JSON
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `Lỗi ${response.status}: ${response.statusText}` };
        }

        // Xử lý error có thể là object hoặc string
        let errorMsg = 'Không thể bắt đầu phỏng vấn';
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMsg = errorData.error;
          } else if (errorData.error.message) {
            errorMsg = errorData.error.message;
          }
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        }
        
        // Kiểm tra nếu token hết hạn
        if (response.status === 401 || errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('jwt')) {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          localStorage.removeItem('usertoken');
          localStorage.removeItem('user');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
          setIsInitializing(false);
          setLoading(false);
          return;
        }

        // Xử lý lỗi 500 - Python service không chạy hoặc lỗi AI
        if (response.status === 500) {
          if (errorMsg.includes('Cannot connect') || errorMsg.includes('connect') || errorMsg.includes('ECONNREFUSED')) {
            errorMsg = 'Không thể kết nối đến dịch vụ phỏng vấn AI. Vui lòng kiểm tra xem dịch vụ đã được khởi động chưa (port 5002).';
          } else if (errorMsg.includes('chưa được cài đặt') || errorMsg.includes('not found') || errorMsg.includes('ollama pull')) {
            errorMsg = 'Model Ollama chưa được cài đặt. Vui lòng chạy lệnh: ollama pull qwen2.5 (hoặc model khác) trong terminal, sau đó restart lại Python service.';
          } else if (errorMsg.includes('kết nối') || errorMsg.includes('Ollama đang chạy')) {
            errorMsg = 'Không thể kết nối đến Ollama. Vui lòng đảm bảo Ollama đã được cài và đang chạy (ollama serve).';
          } else if (errorMsg.includes('AI') || errorMsg.includes('generate') || errorMsg.includes('câu hỏi')) {
            errorMsg = 'Lỗi khi tạo câu hỏi phỏng vấn từ AI. Vui lòng thử lại sau.';
          } else {
            errorMsg = `Lỗi server khi bắt đầu phỏng vấn: ${errorMsg}. Vui lòng kiểm tra Python service và Ollama.`;
          }
        }

        setError(errorMsg);
        toast.error(errorMsg);
        setIsInitializing(false);
        setLoading(false);
        return;
      }

      // Parse JSON nếu response OK
      const data = await response.json();

      if (data.success !== false) {
        setSessionId(data.sessionId);
        setMessages([
          {
            role: 'assistant',
            content: data.firstQuestion || data.greeting || 'Xin chào! Chúng ta sẽ bắt đầu phỏng vấn.'
          }
        ]);
        toast.success('Đã bắt đầu phỏng vấn');
        setIsInitializing(false);
      } else {
        const errorMsg = data.error || data.message || 'Không thể bắt đầu phỏng vấn';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsInitializing(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      
      // Kiểm tra nếu là lỗi network
      let errorMsg = 'Không thể kết nối đến server. ';
      if (error.message && error.message.includes('ECONNREFUSED')) {
        errorMsg += 'Dịch vụ phỏng vấn AI có thể chưa được khởi động. Vui lòng kiểm tra lại.';
      } else if (error.message && (error.message.includes('401') || error.message.includes('expired'))) {
        errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        toast.error(errorMsg);
        localStorage.removeItem('usertoken');
        localStorage.removeItem('user');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        setIsInitializing(false);
        setLoading(false);
        return;
      } else {
        errorMsg += 'Vui lòng thử lại sau hoặc kiểm tra xem interview bot service có đang chạy không.';
      }
      
      toast.error(errorMsg);
      setError(errorMsg);
      setIsInitializing(false);
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!currentAnswer.trim() || !sessionId) return;

    setLoading(true);
    const userMessage = currentAnswer;
    setCurrentAnswer('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/message/${sessionId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: userMessage })
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.is_complete) {
          // Interview hoàn thành - không thêm message "Interview completed" vào chat
          // Chỉ set flag và tự động gọi evaluation
          setInterviewComplete(true);
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Cảm ơn bạn đã trả lời tất cả câu hỏi. Đang đánh giá câu trả lời của bạn...' }
          ]);
          // Auto get evaluation
          await endInterview();
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.response }
          ]);
        }
      } else {
        // Xử lý error có thể là object hoặc string
        let errorMsg = 'Có lỗi xảy ra';
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (data.error.message) {
            errorMsg = data.error.message;
          }
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/end-interview/${sessionId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEvaluation(data.summary);
        toast.success('Đã hoàn thành phỏng vấn');
      } else {
        // Xử lý error có thể là object hoặc string
        let errorMsg = 'Không thể kết thúc phỏng vấn';
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (data.error.message) {
            errorMsg = data.error.message;
          }
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error ending interview:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra đăng nhập
  const userToken = localStorage.getItem('usertoken');
  const userStr = localStorage.getItem('user');
  const isLoggedIn = userToken && userStr;

  if (!isLoggedIn) {
    return (
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Vui lòng đăng nhập để sử dụng tính năng này</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Luyện Tập Phỏng Vấn</h2>

        {/* Chat Messages */}
        <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
          {isInitializing && !error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang khởi tạo buổi phỏng vấn...</p>
                <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <p className="text-red-800 font-semibold mb-2">⚠️ Không thể bắt đầu phỏng vấn</p>
                <p className="text-red-600 text-sm mb-4">
                  {typeof error === 'string' ? error : (error?.message || error?.name || 'Có lỗi xảy ra')}
                </p>
                <button
                  onClick={startInterview}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {!isInitializing && !error && messages.length === 0 && !loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Chưa có tin nhắn nào</p>
                <button
                  onClick={startInterview}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Bắt đầu phỏng vấn
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && messages.length > 0 && (
            <div className="text-left">
              <div className="inline-block bg-white border px-4 py-2 rounded-lg">
                Đang suy nghĩ...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {!interviewComplete && sessionId && !evaluation && (
          <div className="flex gap-2">
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendAnswer()}
              placeholder="Nhập câu trả lời của bạn..."
              className="flex-1 border rounded-md px-4 py-2"
              disabled={loading}
            />
            <button
              onClick={sendAnswer}
              disabled={loading || !currentAnswer.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Gửi
            </button>
          </div>
        )}

        {/* Thông báo khi đang đánh giá */}
        {interviewComplete && !evaluation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800">Đang đánh giá câu trả lời của bạn. Vui lòng đợi...</p>
          </div>
        )}

        {/* Evaluation */}
        {evaluation && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Đánh giá từ AI
            </h3>
            <div className="text-gray-700 whitespace-pre-wrap">
              {evaluation.evaluation || 'Đánh giá đang được xử lý...'}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Tổng số câu hỏi: {evaluation.total_questions}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {interviewComplete && !evaluation && (
          <div className="mt-4">
            <button
              onClick={endInterview}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Xem đánh giá
            </button>
          </div>
        )}

        {interviewComplete && evaluation && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSessionId(null);
                setMessages([]);
                setInterviewComplete(false);
                setEvaluation(null);
                startInterview();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Phỏng vấn lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

