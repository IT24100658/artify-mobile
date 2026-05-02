import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const login = async (username, password) => {
  const response = await api.post('/auth/signin', { username, password });
  if (response.data.accessToken) {
    const userData = { ...response.data, token: response.data.accessToken };
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }
  return response.data;
};

const register = (username, email, password, address, phone, roles) => {
  return api.post('/auth/signup', { username, email, password, address, phone, role: roles });
};

const logout = async () => { await AsyncStorage.removeItem('user'); };

const getCurrentUser = async () => {
  const data = await AsyncStorage.getItem('user');
  return data ? JSON.parse(data) : null;
};

export default { login, register, logout, getCurrentUser };
