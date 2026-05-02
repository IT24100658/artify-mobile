const mongoose = require('mongoose');
const dns = require('dns');
const { Resolver } = require('dns').promises;

// Use Google DNS to resolve SRV records (bypasses ISP DNS issues)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      family: 4, // Force IPv4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize roles
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    // Create admin user if not exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@artgallery.com',
        password: hashedPassword,
        address: 'Artist Studio, Galle',
        phone: '+94 11 222 3333',
        roles: ['ROLE_ADMIN'],
        active: true,
      });
      console.log('Admin user created successfully!');
    } else {
      // Reset admin password on every start
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminExists.password = hashedPassword;
      await adminExists.save();
      console.log('Admin user credentials re-initialized!');
    }
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
