const router = require('express').Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { username, email, address, phone, profilePicture } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (username) user.username = username;
    if (email) user.email = email;
    if (address !== undefined) user.address = address;
    if (phone !== undefined) user.phone = phone;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    await user.save();
    res.json(user);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
