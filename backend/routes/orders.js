const router = require('express').Router();
const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const Reservation = require('../models/Reservation');
const ActivityLog = require('../models/ActivityLog');
const { verifyToken, requireRole } = require('../middleware/auth');
const { sendOrderStatusEmail } = require('../services/emailService');

// Place order
router.post('/', verifyToken, requireRole('ROLE_CUSTOMER'), async (req, res) => {
  try {
    const { items, shippingDetails, deliveryFee } = req.body;
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const artwork = await Artwork.findById(item.artwork || item.artwork?.id || item.artworkId);
      if (!artwork || artwork.deleted) throw new Error('Artwork not found: ' + (item.artwork || item.artworkId));

      // Check reservation
      const reservation = await Reservation.findOne({ user: req.user._id, artwork: artwork._id, status: 'ACTIVE' });
      if (reservation && reservation.quantity >= item.quantity) {
        reservation.quantity -= item.quantity;
        if (reservation.quantity === 0) reservation.status = 'CONSUMED';
        await reservation.save();
      } else {
        if (artwork.stockQuantity < item.quantity) throw new Error('Insufficient stock for: ' + artwork.title);
        artwork.stockQuantity -= item.quantity;
        await artwork.save();
      }

      const price = item.price && item.price > 0 ? item.price : artwork.price;
      orderItems.push({ artwork: artwork._id, quantity: item.quantity, price });
      total += price * item.quantity;
    }

    const fee = deliveryFee || shippingDetails?.deliveryFee || 0;
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingDetails: shippingDetails || {},
      deliveryFee: fee,
      totalAmount: total + fee,
      status: 'PAID',
    });

    const populated = await Order.findById(order._id).populate('user', 'username email').populate('items.artwork');
    await ActivityLog.create({ action: 'ORDER_PLACED', username: req.user.username, details: `Placed order #${order._id}` });
    res.json(populated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Customer order history
router.get('/history', verifyToken, requireRole('ROLE_CUSTOMER'), async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ orderDate: -1 }).populate('items.artwork').populate('user', 'username email');
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// All orders (admin)
router.get('/all', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }).populate('items.artwork').populate('user', 'username email');
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get order by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.artwork').populate('user', 'username email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Confirm shipment
router.put('/:id/confirm-shipment', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'PAID') return res.status(400).json({ message: 'Order must be PAID first' });
    order.status = 'CONFIRMED';
    const deliveryDate = req.query.deliveryDate;
    if (order.shippingDetails) {
      order.shippingDetails.estimatedDeliveryDate = deliveryDate ? new Date(deliveryDate) : new Date(Date.now() + 5 * 86400000);
    }
    await order.save();
    await ActivityLog.create({ action: 'ORDER_CONFIRMED', username: order.user?.username || 'system', details: `Confirmed order #${order._id}` });
    if (order.user && order.user.email) {
      await sendOrderStatusEmail(order.user, order, 'Your shipment has been confirmed and scheduled for dispatch.');
    }
    const populated = await Order.findById(order._id).populate('items.artwork').populate('user', 'username email');
    res.json(populated);
  } catch (e) { 
    console.error('Confirm shipment error:', e.message);
    res.status(400).json({ message: e.message }); 
  }
});

// Update order status
router.put('/:id/status', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'PAID', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findById(req.params.id).populate('user', 'username email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    await ActivityLog.create({ action: 'ORDER_STATUS_CHANGED', username: 'admin', details: `Order #${order._id} → ${status}` });
    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status) && order.user && order.user.email) {
      const msg = status === 'DELIVERED' ? 'Great news! Your masterpiece has been delivered. Enjoy!' : `Your order status has been updated to ${status}.`;
      await sendOrderStatusEmail(order.user, order, msg);
    }
    const populated = await Order.findById(order._id).populate('items.artwork').populate('user', 'username email');
    res.json(populated);
  } catch (e) { 
    console.error('Order status update error:', e.message);
    res.status(400).json({ message: e.message }); 
  }
});

// Update shipping info
router.put('/:id/shipping-info', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot modify after dispatch' });
    }
    const { address, phoneNumber } = req.body;
    if (address) order.shippingDetails.address = address;
    if (phoneNumber) order.shippingDetails.phoneNumber = phoneNumber;
    await order.save();
    await ActivityLog.create({ action: 'SHIPPING_INFO_UPDATED', username: 'admin', details: `Updated shipping for order #${order._id}` });
    const populated = await Order.findById(order._id).populate('items.artwork').populate('user', 'username email');
    res.json(populated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Cancel order
router.put('/:id/cancel', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.artwork');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }
    for (const item of order.items) {
      if (item.artwork) {
        const artwork = await Artwork.findById(item.artwork._id || item.artwork);
        if (artwork) { artwork.stockQuantity += item.quantity; await artwork.save(); }
      }
    }
    if (order.shippingDetails) order.shippingDetails.estimatedDeliveryDate = null;
    order.status = 'CANCELLED';
    await order.save();
    await ActivityLog.create({ action: 'ORDER_CANCELLED', username: 'admin', details: `Cancelled order #${order._id}` });
    const populated = await Order.findById(order._id).populate('items.artwork').populate('user', 'username email');
    res.json(populated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
