import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (global.authToken) {
    config.headers.Authorization = `Bearer ${global.authToken}`;
  }
  return config;
});

export const setAuthToken = (token) => { global.authToken = token; };
export const clearAuthToken = () => { delete global.authToken; };

export default api;