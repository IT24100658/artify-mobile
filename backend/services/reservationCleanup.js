const cron = require('node-cron');
const Reservation = require('../models/Reservation');
const Artwork = require('../models/Artwork');

const startReservationCleanup = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const expired = await Reservation.find({
        status: 'ACTIVE',
        expiresAt: { $lt: new Date() },
      });
      for (const res of expired) {
        const artwork = await Artwork.findById(res.artwork);
        if (artwork) {
          artwork.stockQuantity += res.quantity;
          await artwork.save();
        }
        res.status = 'EXPIRED';
        await res.save();
      }
      if (expired.length) console.log(`Cleaned up ${expired.length} expired reservations`);
    } catch (e) {
      console.error('Reservation cleanup error:', e.message);
    }
  });
};

module.exports = { startReservationCleanup };
