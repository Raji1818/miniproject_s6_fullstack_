import axios from 'axios';

const defaultApiUrl = 'https://studentdev-backend.onrender.com/api';
const configuredApiUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');

const api = axios.create({
  baseURL: configuredApiUrl || defaultApiUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
