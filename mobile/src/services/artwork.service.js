import api from './api';
export default {
  getAllArtworks: () => api.get('/artworks'),
  getArtworkById: (id) => api.get(`/artworks/${id}`),
  createArtwork: (formData) => api.post('/artworks', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateArtwork: (id, data) => api.put(`/artworks/${id}`, data),
  deleteArtwork: (id) => api.delete(`/artworks/${id}`),
  searchArtworks: (keyword) => api.get(`/artworks/search?keyword=${keyword}`),
  getRecommendations: (userId) => api.get(`/artworks/recommendations${userId ? `?userId=${userId}` : ''}`),
  getLowStockAlerts: () => api.get('/artworks/low-stock'),
};
