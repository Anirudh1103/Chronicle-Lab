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

export default api;
