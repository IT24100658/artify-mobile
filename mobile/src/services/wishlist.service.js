import api from './api';
export default {
  getMyWishlist: () => api.get('/wishlist/my-list'),
  addToWishlist: (artworkId) => api.post(`/wishlist/add/${artworkId}`, {}),
  removeFromWishlist: (wishlistId) => api.delete(`/wishlist/remove/${wishlistId}`),
};
