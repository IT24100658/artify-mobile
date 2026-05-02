import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production API URL
const API_BASE = 'https://artify-mobile-production.up.railway.app/api'; 
// Local testing: const API_BASE = 'http://192.168.1.177:5000/api';

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const token = user?.token || user?.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) { /* ignore */ }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - session may have expired');
    }
    return Promise.reject(error);
  }
);

// Helper to update base URL at runtime
export const setApiBaseUrl = (url) => {
  api.defaults.baseURL = url;
};

export default api;
