const router = require('express').Router();
const Wishlist = require('../models/Wishlist');
const { verifyToken } = require('../middleware/auth');

router.get('/my-list', verifyToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id }).populate({ path: 'artwork', match: { deleted: false }, populate: { path: 'artist', select: 'username' } });
    res.json(wishlist.filter(w => w.artwork));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/add/:artworkId', verifyToken, async (req, res) => {
  try {
    const exists = await Wishlist.findOne({ user: req.user._id, artwork: req.params.artworkId });
    if (exists) return res.status(400).json({ message: 'Already in wishlist' });
    const item = await Wishlist.create({ user: req.user._id, artwork: req.params.artworkId });
    const populated = await Wishlist.findById(item._id).populate({ path: 'artwork', populate: { path: 'artist', select: 'username' } });
    res.json(populated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/remove/:wishlistId', verifyToken, async (req, res) => {
  try {
    const item = await Wishlist.findById(req.params.wishlistId);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await Wishlist.findByIdAndDelete(req.params.wishlistId);
    res.json({ message: 'Removed from wishlist' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
