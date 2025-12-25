import React from 'react';

/**
 * Component hiển thị thống kê dạng card
 */
export const StatsCard = ({ title, value, icon, color = 'blue', trend, subtitle }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', bgLight: 'bg-blue-50', border: 'border-blue-500' },
    green: { bg: 'bg-green-500', text: 'text-green-600', bgLight: 'bg-green-50', border: 'border-green-500' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', bgLight: 'bg-yellow-50', border: 'border-yellow-500' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', bgLight: 'bg-purple-50', border: 'border-purple-500' },
    red: { bg: 'bg-red-500', text: 'text-red-600', bgLight: 'bg-red-50', border: 'border-red-500' },
  };

  const colorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${colorClass.border} hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        {icon && (
          <div className={`${colorClass.bgLight} p-2 rounded-lg`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${colorClass.text}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
      {trend && (
        <div className={`mt-2 text-sm ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label || 'so với kỳ trước'}
        </div>
      )}
    </div>
  );
};

