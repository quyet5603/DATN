/**
 * Format time ago in Vietnamese
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string (e.g., "khoảng 1 tháng trước")
 */
export const formatTimeAgo = (date) => {
    if (!date) return 'N/A';
    
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) {
        return 'vừa xong';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `khoảng ${diffInMinutes} phút trước`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `khoảng ${diffInHours} giờ trước`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `khoảng ${diffInDays} ngày trước`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `khoảng ${diffInMonths} tháng trước`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `khoảng ${diffInYears} năm trước`;
};

