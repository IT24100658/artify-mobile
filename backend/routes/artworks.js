const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Artwork = require('../models/Artwork');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { verifyToken, requireRole, optionalAuth } = require('../middleware/auth');
const { getRuleBasedRecommendations } = require('../services/recommendationService');

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
    folder: 'artworks',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Get all artworks
router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find({ deleted: false }).populate('artist', 'username email');
    res.json(artworks);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get artwork by ID
router.get('/search', async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const artworks = await Artwork.find({
      deleted: false,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } },
      ],
    }).populate('artist', 'username email');
    res.json(artworks);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.query.userId || null;
    const recommendations = await getRuleBasedRecommendations(userId);
    res.json(recommendations);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Low stock
router.get('/low-stock', verifyToken, requireRole('ROLE_ADMIN', 'ROLE_ARTIST'), async (req, res) => {
  try {
    const artworks = await Artwork.find({
      deleted: false,
      $expr: { $lte: ['$stockQuantity', '$minStockThreshold'] },
    }).populate('artist', 'username');
    res.json(artworks);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findOne({ _id: req.params.id, deleted: false }).populate('artist', 'username email');
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json(artwork);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Create artwork
router.post('/', verifyToken, requireRole('ROLE_ADMIN'), upload.single('image'), async (req, res) => {
  try {
    console.log('--- Artwork Upload ---');
    console.log('File received:', req.file ? { path: req.file.path, filename: req.file.filename } : 'NO FILE');
    console.log('Body:', req.body);
    
    const { title, description, price, category, tags, stockQuantity, minStockThreshold, artistId } = req.body;
    if (parseFloat(price) <= 0) return res.status(400).json({ message: 'Price must be greater than zero.' });
    if (parseInt(stockQuantity) <= 0) return res.status(400).json({ message: 'Stock quantity must be greater than zero.' });

    const artwork = new Artwork({
      title, description, price: parseFloat(price), category,
      imageUrl: req.file ? req.file.path : '',
      stockQuantity: parseInt(stockQuantity) || 1,
      minStockThreshold: parseInt(minStockThreshold) || 0,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      artist: artistId,
    });
    const saved = await artwork.save();
    console.log('Saved artwork imageUrl:', saved.imageUrl);
    const artist = await User.findById(artistId);
    await ActivityLog.create({ action: 'ARTWORK_UPLOAD', username: artist?.username || 'ADMIN', details: `Uploaded: ${saved.title}` });
    res.json({ message: 'Artwork uploaded successfully', id: saved._id, title: saved.title, imageUrl: saved.imageUrl });
  } catch (e) { 
    console.error('Artwork upload error:', e);
    res.status(400).json({ message: e.message }); 
  }
});

// Update artwork
router.put('/:id', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork || artwork.deleted) return res.status(404).json({ message: 'Artwork not found' });
    const { title, description, price, category, tags, stockQuantity, minStockThreshold } = req.body;
    if (title) artwork.title = title;
    if (description !== undefined) artwork.description = description;
    if (price) artwork.price = price;
    if (category) artwork.category = category;
    if (tags) artwork.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (stockQuantity !== undefined) artwork.stockQuantity = stockQuantity;
    if (minStockThreshold !== undefined) artwork.minStockThreshold = minStockThreshold;
    const updated = await artwork.save();
    await ActivityLog.create({ action: 'ARTWORK_UPDATE', username: 'ADMIN', details: `Updated: ${updated.title}` });
    res.json(updated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Delete artwork (soft)
router.delete('/:id', verifyToken, requireRole('ROLE_ADMIN'), async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    artwork.deleted = true;
    await artwork.save();
    await ActivityLog.create({ action: 'ARTWORK_DELETE', username: 'ADMIN', details: `Deleted: ${artwork.title}` });
    res.json({ message: 'Artwork deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
