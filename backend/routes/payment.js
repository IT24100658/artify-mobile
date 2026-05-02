const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', async (req, res) => {
  try {
    const amount = Math.round(Number(req.body.amount) * 100);
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency: 'lkr' });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
