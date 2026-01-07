// API utility functions
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response;
};

// Helper to get upload URL
export const getUploadUrl = (path) => {
  if (!path) return '';
  return `${API_BASE_URL}/uploads/${path}`;
};

export default API_BASE_URL;
