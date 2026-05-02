import api from './api';
export default {
  createOffer: (offer) => api.post('/offers', offer),
  getAllOffers: () => api.get('/offers/all'),
  getMyOffers: () => api.get('/offers/my'),
  getArtistOffers: (artistId) => api.get(`/offers/artist/${artistId}`),
  updateOfferStatus: (id, status) => api.put(`/offers/${id}/status?status=${status}`),
};
