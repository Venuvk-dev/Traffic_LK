// API configuration for different environments
const getApiUrl = () => {
  // In production, use the backend URL from environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://traffic-lk.onrender.com';
  }
  
  // In development, use the proxy
  return '';
};

export const API_BASE_URL = getApiUrl();

// Helper function to create full API URLs
export const createApiUrl = (endpoint: string) => {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1);
  }
  
  if (API_BASE_URL) {
    return `${API_BASE_URL}/api/${endpoint}`;
  }
  
  return `/api/${endpoint}`;
};