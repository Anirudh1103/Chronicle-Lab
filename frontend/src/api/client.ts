import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

const api = axios.create({
  baseURL: cleanBaseUrl,
  withCredentials: true,
  timeout: 60000, // Increased timeout to 60s for large high-quality images
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const deviceId = localStorage.getItem('chronicle_device_id');
  if (deviceId) {
    config.headers['X-Device-Id'] = deviceId;
  }
  return config;
});

const normalizeResponseUrls = (data: any): any => {
  if (!data) return data;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : (apiUrl.endsWith('/api/') ? apiUrl.slice(0, -5) : apiUrl);
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  if (cleanBase === 'http://localhost:5000') {
    return data;
  }
  try {
    const jsonStr = JSON.stringify(data);
    if (jsonStr.includes('http://localhost:5000')) {
      return JSON.parse(jsonStr.replace(/http:\/\/localhost:5000/g, cleanBase));
    }
  } catch (e) {
    // Ignore
  }
  return data;
};

api.interceptors.response.use((response) => {
  response.data = normalizeResponseUrls(response.data);
  return response;
});

export default api;
