import api from './api';
export default {
  getUserProfile: (id) => api.get(`/users/${id}`),
  updateUserProfile: (id, data) => api.put(`/users/${id}`, data),
};
