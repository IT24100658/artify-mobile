const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.active) return res.status(403).json({ message: 'Account is deactivated' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.JWT_EXPIRATION) / 1000,
    });

    await ActivityLog.create({ action: 'LOGIN', username: user.username, details: 'User logged in' });

    res.json({
      accessToken: token,
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/signup', async (req, res) => {
  console.log('Signup attempt:', req.body.username, req.body.role);
  try {
    const { username, email, password, address, phone, role } = req.body;

    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'Error: Username is already taken!' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Error: Email is already in use!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const roles = [];
    if (role && Array.isArray(role)) {
      role.forEach(r => {
        if (r === 'admin') roles.push('ROLE_ADMIN');
        else if (r === 'artist') roles.push('ROLE_ARTIST');
        else roles.push('ROLE_CUSTOMER');
      });
    }
    if (!roles.length) roles.push('ROLE_CUSTOMER');

    await User.create({ username, email, password: hashedPassword, address, phone, roles });
    await ActivityLog.create({ action: 'REGISTRATION', username, details: `New user registered with roles: ${roles}` });

    res.json({ message: 'User registered successfully!' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
