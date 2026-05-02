import api from './api';
export default {
  placeOrder: (order) => api.post('/orders', order),
  getCustomerOrders: () => api.get('/orders/history'),
  getAllOrders: () => api.get('/orders/all'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  confirmOrderAndGenerateShipment: (id, deliveryDate) => api.put(`/orders/${id}/confirm-shipment${deliveryDate ? `?deliveryDate=${deliveryDate}` : ''}`, {}),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  updateShippingInfo: (id, address, phoneNumber) => api.put(`/orders/${id}/shipping-info`, { address, phoneNumber }),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`, {}),
};
