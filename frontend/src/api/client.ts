import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/',
  withCredentials: true,
  timeout: 60000, // Increased timeout to 60s for large high-quality images
});

export default api;
