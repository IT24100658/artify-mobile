const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  category: { type: String, default: '' },
  tags: [{ type: String }],
  stockQuantity: { type: Number, default: 1 },
  minStockThreshold: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

artworkSchema.virtual('stockStatus').get(function () {
  if (this.stockQuantity <= 0) return 'Out of Stock';
  if (this.stockQuantity <= this.minStockThreshold) return 'Low Stock';
  return 'Available';
});

artworkSchema.set('toJSON', { virtuals: true });
artworkSchema.set('toObject', { virtuals: true });

artworkSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  return obj;
};

module.exports = mongoose.model('Artwork', artworkSchema);
