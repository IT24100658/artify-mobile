const router = require('express').Router();
const Offer = require('../models/Offer');
const Artwork = require('../models/Artwork');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, requireRole('ROLE_CUSTOMER'), async (req, res) => {
  try {
    const { artwork, customer, artist, offeringPrice } = req.body;
    const artworkId = artwork?.id || artwork?._id || artwork;
    const customerId = customer?.id || customer?._id || customer;
    const artistId = artist?.id || artist?._id || artist;
    const artworkDoc = await Artwork.findById(artworkId);
    if (!artworkDoc) return res.status(404).json({ message: 'Artwork not found' });
    const offer = await Offer.create({ artwork: artworkId, customer: customerId, artist: artistId, offeringPrice });
    const populated = await Offer.findById(offer._id).populate('artwork').populate('customer', 'username').populate('artist', 'username');
    await ActivityLog.create({ action: 'OFFER_CREATED', username: req.user.username, details: `Offer for: ${artworkDoc.title}` });
    res.json(populated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.get('/all', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const offers = await Offer.find().populate('artwork').populate('customer', 'username email').populate('artist', 'username');
    res.json(offers);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/my', verifyToken, requireRole('ROLE_CUSTOMER'), async (req, res) => {
  try {
    const offers = await Offer.find({ customer: req.user._id }).populate('artwork').populate('artist', 'username');
    res.json(offers);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/artist/:artistId', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const offers = await Offer.find({ artist: req.params.artistId }).populate('artwork').populate('customer', 'username');
    res.json(offers);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

const { sendOfferStatusEmail } = require('../services/emailService');

router.put('/:id/status', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const status = req.query.status || req.body.status;
    if (!status) return res.status(400).json({ message: 'Status is required' });
    
    const offer = await Offer.findById(req.params.id).populate('artwork').populate('customer');
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    
    offer.status = status;
    await offer.save();
    
    console.log(`Offer ${req.params.id} updated to ${status}`);
    
    const action = status === 'ACCEPTED' ? 'SALE' : 'OFFER_UPDATE';
    await ActivityLog.create({ 
      action, 
      username: 'ADMIN', 
      details: `Offer ${status} for: ${offer.artwork?.title || 'Unknown artwork'}` 
    });
    
    // Send email notification (async, non-blocking)
    const msg = status === 'ACCEPTED' 
      ? 'Great news! Your offer has been accepted by the admin. You can now proceed to Buy Now with your requested price.' 
      : `Your offer has been updated to ${status}.`;
    
    sendOfferStatusEmail(offer.customer, offer, msg).catch(err => console.error('Email error:', err));
    
    const populated = await Offer.findById(offer._id).populate('artwork').populate('customer', 'username email').populate('artist', 'username');
    res.json(populated);
  } catch (e) { 
    console.error('Offer update error:', e.message);
    res.status(400).json({ message: e.message }); 
  }
});

module.exports = router;
