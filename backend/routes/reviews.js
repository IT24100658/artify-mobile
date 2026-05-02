const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Review = require('../models/Review');
const ActivityLog = require('../models/ActivityLog');
const { verifyToken, optionalAuth } = require('../middleware/auth');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reviews',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/artwork/:artworkId', optionalAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ artwork: req.params.artworkId }).populate('user', 'username profilePicture').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/artwork/:artworkId/average', async (req, res) => {
  try {
    const reviews = await Review.find({ artwork: req.params.artworkId });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json(avg);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/post', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { artworkId, rating, comment } = req.body;
    const existing = await Review.findOne({ user: req.user._id, artwork: artworkId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this artwork' });
    const review = await Review.create({
      user: req.user._id, artwork: artworkId, rating: parseInt(rating), comment,
      imageUrl: req.file ? req.file.path : '',
    });
    const populated = await Review.findById(review._id).populate('user', 'username profilePicture');
    res.json(populated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && !req.user.roles.includes('ROLE_ADMIN')) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully!' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && !req.user.roles.includes('ROLE_ADMIN')) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    await review.save();
    const populated = await Review.findById(review._id).populate('user', 'username profilePicture');
    res.json(populated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
