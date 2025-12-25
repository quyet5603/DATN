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

  useEffect(() => {
    if (jobId && loginData?.token && !sessionId) {
      startInterview();
    }
  }, [jobId, loginData]);

  const startInterview = async () => {
    if (!loginData?.token) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/start-interview/${jobId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSessionId(data.sessionId);
        setMessages([
          {
            role: 'assistant',
            content: data.firstQuestion || 'Xin chào! Chúng ta sẽ bắt đầu phỏng vấn.'
          }
        ]);
        toast.success('Đã bắt đầu phỏng vấn');
      } else {
        toast.error(data.error || 'Không thể bắt đầu phỏng vấn');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
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
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: userMessage })
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.is_complete) {
          setInterviewComplete(true);
          // Auto get evaluation
          await endInterview();
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.response }
          ]);
        }
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
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
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEvaluation(data.summary);
        toast.success('Đã hoàn thành phỏng vấn');
      } else {
        toast.error(data.error || 'Không thể kết thúc phỏng vấn');
      }
    } catch (error) {
      console.error('Error ending interview:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!loginData?.token) {
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
        <h2 className="text-2xl font-bold mb-6">Luyện Tập Phỏng Vấn với AI</h2>

        {/* Chat Messages */}
        <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
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
          {loading && (
            <div className="text-left">
              <div className="inline-block bg-white border px-4 py-2 rounded-lg">
                Đang suy nghĩ...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {!interviewComplete && sessionId && (
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

