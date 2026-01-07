import React from 'react';

/**
 * Component hiển thị chi tiết độ phù hợp (địa điểm, kinh nghiệm, kỹ năng, học vấn)
 */
export const MatchDetailsCard = ({ analysis }) => {
  if (!analysis) return null;

  const getMatchStatusBadge = (status) => {
    const statusConfig = {
      perfect: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn hảo' },
      exceeded: { bg: 'bg-green-100', text: 'text-green-800', label: 'Vượt yêu cầu' },
      met: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đạt yêu cầu' },
      good: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Tốt' },
      close: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Gần đạt' },
      poor: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Chưa phù hợp' },
      insufficient: { bg: 'bg-red-100', text: 'text-red-800', label: 'Chưa đủ' },
      unknown: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Chưa rõ' }
    };
    
    const config = statusConfig[status] || statusConfig.unknown;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3">
        📊 Chi tiết độ phù hợp
      </h3>

      {/* Địa điểm */}
      {analysis.location_match && (
        <div className="border-l-4 border-blue-500 pl-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <h4 className="font-semibold text-gray-700">Địa điểm</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-600">{analysis.location_match.score || 0}/20 điểm</span>
              {getMatchStatusBadge(analysis.location_match.match_status)}
            </div>
          </div>
          {analysis.location_match.cv_location && (
            <p className="text-sm text-gray-600">
              Địa điểm CV: <span className="font-medium">{analysis.location_match.cv_location}</span>
            </p>
          )}
        </div>
      )}

      {/* Kinh nghiệm */}
      {analysis.experience_match && (
        <div className="border-l-4 border-purple-500 pl-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              <h4 className="font-semibold text-gray-700">Kinh nghiệm</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-600">{analysis.experience_match.score || 0}/30 điểm</span>
              {getMatchStatusBadge(analysis.experience_match.match_status)}
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            {analysis.experience_match.cv_years !== undefined && (
              <p>
                Kinh nghiệm CV: <span className="font-medium">{analysis.experience_match.cv_years} năm</span>
              </p>
            )}
            {analysis.experience_match.required_years !== undefined && (
              <p>
                Yêu cầu tối thiểu: <span className="font-medium">{analysis.experience_match.required_years} năm</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Kỹ năng */}
      {analysis.skills_match && (
        <div className="border-l-4 border-green-500 pl-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h4 className="font-semibold text-gray-700">Kỹ năng</h4>
            </div>
            <span className="font-bold text-green-600">{analysis.skills_match.score || 0}/30 điểm</span>
          </div>
          <div className="text-sm space-y-2">
            {analysis.skills_match.matched_skills && analysis.skills_match.matched_skills.length > 0 && (
              <div>
                <p className="text-gray-600 mb-1">✅ Kỹ năng phù hợp:</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.skills_match.matched_skills.map((skill, idx) => (
                    <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analysis.skills_match.missing_skills && analysis.skills_match.missing_skills.length > 0 && (
              <div>
                <p className="text-gray-600 mb-1">❌ Kỹ năng thiếu:</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.skills_match.missing_skills.map((skill, idx) => (
                    <span key={idx} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Học vấn */}
      {analysis.education_match && (
        <div className="border-l-4 border-yellow-500 pl-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <h4 className="font-semibold text-gray-700">Học vấn</h4>
            </div>
            <span className="font-bold text-yellow-600">{analysis.education_match.score || 0}/20 điểm</span>
          </div>
          {analysis.education_match.cv_education && (
            <p className="text-sm text-gray-600">
              Trình độ: <span className="font-medium">{analysis.education_match.cv_education}</span>
            </p>
          )}
        </div>
      )}

      {/* Tổng điểm */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700">Tổng điểm:</span>
          <span className="text-3xl font-bold text-blue-600">{analysis.score || 0}/100</span>
        </div>
      </div>
    </div>
  );
};
