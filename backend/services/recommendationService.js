const Artwork = require('../models/Artwork');
const Order = require('../models/Order');

const getRuleBasedRecommendations = async (userId) => {
  const allArtworks = await Artwork.find({ deleted: false }).populate('artist', 'username');
  if (!userId) return getFallback(allArtworks);

  const userOrders = await Order.find({ user: userId }).populate('items.artwork');
  if (!userOrders.length) return getFallback(allArtworks);

  const categoryFreq = {}, artistFreq = {}, prices = [], purchasedIds = new Set();
  for (const order of userOrders) {
    for (const item of order.items) {
      const art = item.artwork;
      if (!art) continue;
      purchasedIds.add(art._id.toString());
      if (art.category) categoryFreq[art.category] = (categoryFreq[art.category] || 0) + 1;
      if (art.artist) artistFreq[art.artist.toString()] = (artistFreq[art.artist.toString()] || 0) + 1;
      if (art.price) prices.push(art.price);
    }
  }

  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const lower = avgPrice * 0.7, upper = avgPrice * 1.3;

  const scored = [];
  for (const art of allArtworks) {
    if (purchasedIds.has(art._id.toString()) || art.stockQuantity <= 0) continue;
    let score = 0;
    if (art.category && categoryFreq[art.category]) score += categoryFreq[art.category] * 5;
    if (art.artist && artistFreq[art.artist._id?.toString() || art.artist.toString()]) score += artistFreq[art.artist._id?.toString() || art.artist.toString()] * 8;
    if (avgPrice > 0 && art.price >= lower && art.price <= upper) score += 10;
    if (score > 0) scored.push({ art, score });
  }

  if (!scored.length) return getFallback(allArtworks);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map(s => s.art);
};

const getFallback = (artworks) => {
  return artworks.filter(a => a.stockQuantity > 0).slice(0, 8);
};

module.exports = { getRuleBasedRecommendations };
