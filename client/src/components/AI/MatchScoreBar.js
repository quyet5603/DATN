import React from 'react';

/**
 * Component hiển thị match score với progress bar
 */
export const MatchScoreBar = ({ score, showLabel = true, size = 'normal' }) => {
  if (score === null || score === undefined) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-600', bgLight: 'bg-green-100' };
    if (score >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-600', bgLight: 'bg-yellow-100' };
    return { bg: 'bg-red-500', text: 'text-red-600', bgLight: 'bg-red-100' };
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Rất phù hợp';
    if (score >= 60) return 'Phù hợp';
    if (score >= 40) return 'Khá phù hợp';
    return 'Chưa phù hợp';
  };

  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const heightClass = size === 'small' ? 'h-1' : size === 'large' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Độ phù hợp</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${color.text}`}>
              {score}%
            </span>
            {size !== 'small' && (
              <span className={`text-xs px-2 py-0.5 rounded ${color.bgLight} ${color.text}`}>
                {label}
              </span>
            )}
          </div>
        </div>
      )}
      <div className={`w-full ${color.bgLight} rounded-full ${heightClass}`}>
        <div
          className={`${color.bg} ${heightClass} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        ></div>
      </div>
    </div>
  );
};

