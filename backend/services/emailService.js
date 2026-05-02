const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendOrderStatusEmail = async (user, order, customMessage) => {
  try {
    if (!user.email) {
      console.log('No email address for user');
      return;
    }
    const estDelivery = order.shippingDetails?.estimatedDeliveryDate
      ? new Date(order.shippingDetails.estimatedDeliveryDate).toLocaleDateString()
      : 'Not scheduled yet';
    const text = `Dear ${user.username},\n\nYour order #${order._id} has been updated.\n\nNew Status: ${order.status}\nEstimated Delivery Date: ${estDelivery}\nDelivery Fee: Rs.${order.deliveryFee || 0}\n\n${customMessage}\n\nThank you for curating with ArtSelling!\n`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `ArtSelling: Order #${order._id} Status Update`,
      text,
    });
    console.log(`Email sent to ${user.email} for Order #${order._id}`);
  } catch (e) {
    console.error('Failed to send email:', e.message);
  }
};

const sendOfferStatusEmail = async (user, offer, customMessage) => {
  try {
    if (!user.email) return;
    const text = `Dear ${user.username},\n\nYour offer for artwork "${offer.artwork?.title}" has been updated.\n\nNew Status: ${offer.status}\nOffered Price: Rs.${offer.offeringPrice}\n\n${customMessage}\n\nThank you for curating with ArtSelling!\n`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `ArtSelling: Offer Status Update`,
      text,
    });
    console.log(`Offer Email sent to ${user.email}`);
  } catch (e) {
    console.error('Failed to send email:', e.message);
  }
};

module.exports = { sendOrderStatusEmail, sendOfferStatusEmail };
