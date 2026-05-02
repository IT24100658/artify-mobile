const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const shippingDetailsSchema = new mongoose.Schema({
  address: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  cardNumber: { type: String, default: '' },
  estimatedDeliveryDate: { type: Date },
  deliveryFee: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  },
  shippingDetails: shippingDetailsSchema,
  items: [orderItemSchema],
}, { timestamps: true });

orderSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  if (obj.items) obj.items.forEach(i => { i.id = i._id; });
  return obj;
};

module.exports = mongoose.model('Order', orderSchema);
