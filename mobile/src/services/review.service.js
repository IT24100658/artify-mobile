import api from './api';
export default {
  getArtworkReviews: (artworkId) => api.get(`/reviews/artwork/${artworkId}`),
  getAverageRating: (artworkId) => api.get(`/reviews/artwork/${artworkId}/average`),
  postReview: (artworkId, rating, comment, imageFile) => {
    const formData = new FormData();
    formData.append('artworkId', artworkId);
    formData.append('rating', rating);
    formData.append('comment', comment);
    if (imageFile) formData.append('image', imageFile);
    return api.post('/reviews/post', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  updateReview: (id, rating, comment) => api.put(`/reviews/${id}`, { rating, comment }),
};
