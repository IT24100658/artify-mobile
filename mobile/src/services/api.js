import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

const api = axios.create({ baseURL: config.API_URL, timeout: 15000 });

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
