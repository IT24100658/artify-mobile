const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true },
  quantity: { type: Number, required: true, min: 0 },
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'CONSUMED'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
