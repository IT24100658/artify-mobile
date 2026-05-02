import api from './api';
export default {
  getAllUsers: () => api.get('/admin/users'),
  setUserStatus: (id, active) => api.put(`/admin/users/${id}/status?active=${active}`),
  getSystemStats: () => api.get('/admin/stats'),
  getActivityLogs: () => api.get('/admin/logs'),
};
