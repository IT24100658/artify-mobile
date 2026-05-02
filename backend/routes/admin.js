const router = require('express').Router();
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const Offer = require('../models/Offer');
const ActivityLog = require('../models/ActivityLog');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/users', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try { res.json(await User.find()); } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/users/:id/status', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const active = req.query.active === 'true';
    await User.findByIdAndUpdate(req.params.id, { active });
    res.json({ message: 'User status updated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/stats', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const allArtworks = await Artwork.find({ deleted: false });
    const lowStock = allArtworks.filter(a => a.stockQuantity <= a.minStockThreshold);
    const allOrders = await Order.find();
    const orderRevenue = allOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const acceptedOffers = await Offer.find({ status: 'ACCEPTED' });
    const offerRevenue = acceptedOffers.reduce((s, o) => s + (o.offeringPrice || 0), 0);
    const recentLogs = await ActivityLog.find().sort({ timestamp: -1 }).limit(50);
    res.json({
      totalUsers, totalArtworks: allArtworks.length, lowStockCount: lowStock.length,
      totalSales: allOrders.length + acceptedOffers.length,
      totalRevenue: orderRevenue + offerRevenue, recentLogs,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/logs', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try { res.json(await ActivityLog.find().sort({ timestamp: -1 }).limit(100)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
