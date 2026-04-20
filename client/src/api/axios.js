import axios from 'axios';

const configuredApiUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');

const api = axios.create({
  baseURL: configuredApiUrl || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
