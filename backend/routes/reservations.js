const router = require('express').Router();
const Reservation = require('../models/Reservation');
const Artwork = require('../models/Artwork');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/reserve', verifyToken, requireRole('ROLE_CUSTOMER'), async (req, res) => {
  try {
    const { items } = req.body;
    // Clear existing active reservations
    const active = await Reservation.find({ user: req.user._id, status: 'ACTIVE' });
    for (const r of active) {
      const art = await Artwork.findById(r.artwork);
      if (art) { art.stockQuantity += r.quantity; await art.save(); }
      r.status = 'EXPIRED';
      await r.save();
    }
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    for (const item of items) {
      const artworkId = item.artwork?.id || item.artwork?._id || item.artwork;
      const artwork = await Artwork.findById(artworkId);
      if (!artwork) throw new Error('Artwork not found');
      if (artwork.stockQuantity < item.quantity) throw new Error('Insufficient stock for: ' + artwork.title);
      artwork.stockQuantity -= item.quantity;
      await artwork.save();
      await Reservation.create({ user: req.user._id, artwork: artworkId, quantity: item.quantity, expiresAt, status: 'ACTIVE' });
    }
    res.json({ expiresAt });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.post('/cancel', verifyToken, requireRole('ROLE_CUSTOMER'), async (req, res) => {
  try {
    const active = await Reservation.find({ user: req.user._id, status: 'ACTIVE' });
    for (const r of active) {
      const art = await Artwork.findById(r.artwork);
      if (art) { art.stockQuantity += r.quantity; await art.save(); }
      r.status = 'EXPIRED';
      await r.save();
    }
    res.json({ message: 'Reservations cancelled' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
