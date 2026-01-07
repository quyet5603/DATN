import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component hiển thị banner tính năng AI trên trang chủ
 */
export const AIFeaturesBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg overflow-hidden my-8">
      <div className="px-6 py-8 md:px-12 md:py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            🤖 Tính năng AI thông minh
          </h2>
          <p className="text-blue-100 text-lg">
            Phân tích CV và tìm công việc phù hợp với AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Phân tích CV */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Phân tích CV chi tiết
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              AI đánh giá CV theo 4 tiêu chí: Địa điểm, Kinh nghiệm, Kỹ năng, Học vấn
            </p>
            <ul className="text-blue-100 text-xs space-y-1">
              <li>✓ Điểm địa điểm (0-20)</li>
              <li>✓ Điểm kinh nghiệm (0-30)</li>
              <li>✓ Điểm kỹ năng (0-30)</li>
              <li>✓ Điểm học vấn (0-20)</li>
            </ul>
          </div>

          {/* Feature 2: Gợi ý công việc */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Gợi ý công việc phù hợp
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              AI tự động tìm top 10 công việc phù hợp nhất với CV của bạn
            </p>
            <ul className="text-blue-100 text-xs space-y-1">
              <li>✓ So sánh tự động với tất cả công việc</li>
              <li>✓ Sắp xếp theo độ phù hợp</li>
              <li>✓ Hiển thị lý do phù hợp</li>
            </ul>
          </div>

          {/* Feature 3: Độ phù hợp thông minh */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Điểm phù hợp thông minh
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              Xem chi tiết độ phù hợp ngay khi xem công việc
            </p>
            <ul className="text-blue-100 text-xs space-y-1">
              <li>✓ Điểm tổng 0-100</li>
              <li>✓ Chi tiết từng tiêu chí</li>
              <li>✓ Gợi ý cải thiện CV</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            to="/cv/manager"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            📄 Upload CV ngay
          </Link>
          <Link
            to="/recommended-jobs"
            className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors shadow-lg"
          >
            🎯 Xem công việc gợi ý
          </Link>
        </div>
      </div>
    </div>
  );
};
