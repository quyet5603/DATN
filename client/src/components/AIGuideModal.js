import React, { useState, useEffect } from 'react';

/**
 * Modal hướng dẫn sử dụng tính năng AI
 */
export const AIGuideModal = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Chỉ hiển thị nếu chưa xem guide
    const hasSeenGuide = localStorage.getItem('hasSeenAIGuide');
    if (!hasSeenGuide) {
      // Delay 2s để người dùng thấy trang chủ trước
      setTimeout(() => {
        setShow(true);
      }, 2000);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenAIGuide', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🤖</span>
              <div>
                <h2 className="text-2xl font-bold">Chào mừng đến với AI Matching!</h2>
                <p className="text-blue-100 text-sm">Tìm công việc phù hợp nhanh hơn với AI</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">📄 Upload CV của bạn</h3>
              <p className="text-gray-600 mb-3">
                Vào phần <strong>"Quản lý CV"</strong> và upload CV (file PDF). 
                Đặt CV làm <strong>Default</strong> để AI có thể phân tích.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                💡 Tip: CV nên có đầy đủ thông tin về địa điểm, kinh nghiệm, kỹ năng
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">🎯 Xem công việc gợi ý</h3>
              <p className="text-gray-600 mb-3">
                AI sẽ tự động phân tích CV và gợi ý top 10 công việc phù hợp nhất. 
                Mỗi công việc được chấm điểm theo 4 tiêu chí:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-50 p-2 rounded">📍 Địa điểm (0-20)</div>
                <div className="bg-purple-50 p-2 rounded">💼 Kinh nghiệm (0-30)</div>
                <div className="bg-green-50 p-2 rounded">🎯 Kỹ năng (0-30)</div>
                <div className="bg-yellow-50 p-2 rounded">🎓 Học vấn (0-20)</div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">⭐ Xem chi tiết độ phù hợp</h3>
              <p className="text-gray-600 mb-3">
                Khi xem chi tiết công việc, bạn sẽ thấy:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Điểm tổng</strong> (0-100) và thanh tiến trình</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Chi tiết 4 tiêu chí</strong> với điểm số từng phần</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Lý do phù hợp</strong> và <strong>Điểm cần cải thiện</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Gợi ý cải thiện CV</strong> để tăng điểm</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Example */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>📊</span>
              Ví dụ điểm phù hợp:
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-sm mb-3">
              <div className="bg-white p-2 rounded">
                <div className="text-blue-600 font-bold">20/20</div>
                <div className="text-xs text-gray-600">Địa điểm</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-purple-600 font-bold">25/30</div>
                <div className="text-xs text-gray-600">Kinh nghiệm</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-green-600 font-bold">20/30</div>
                <div className="text-xs text-gray-600">Kỹ năng</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-yellow-600 font-bold">15/20</div>
                <div className="text-xs text-gray-600">Học vấn</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded text-center">
              <div className="text-2xl font-bold text-blue-600">80/100</div>
              <div className="text-sm text-gray-600">= Phù hợp cao ✨</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 flex justify-between items-center">
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Không hiện lại
          </button>
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Bắt đầu ngay! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
