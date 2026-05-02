const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email service verification failed:', error.message);
      transporter = null; // Disable if verification fails
    } else {
      console.log('✅ Email service ready -', process.env.EMAIL_USER);
    }
  });
} else {
  console.log('⚠️ Email credentials missing - Email service disabled');
}

const sendOrderStatusEmail = async (user, order, customMessage) => {
  try {
    if (!transporter) {
      console.log('ℹ️ Email service not active - skipping order email');
      return;
    }
    if (!user || !user.email) {
      console.log('❌ Skipping email: User or email address is missing');
      return;
    }
    const estDelivery = order.shippingDetails?.estimatedDeliveryDate
      ? new Date(order.shippingDetails.estimatedDeliveryDate).toLocaleDateString()
      : 'Not scheduled yet';
    const text = `Dear ${user.username || 'Customer'},\n\nYour order #${order._id} has been updated.\n\nNew Status: ${order.status}\nEstimated Delivery Date: ${estDelivery}\nDelivery Fee: Rs.${order.deliveryFee || 0}\n\n${customMessage}\n\nThank you for curating with ArtSelling!\n`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `ArtSelling: Order #${order._id} Status Update`,
      text,
    });
    console.log(`✅ Email sent to ${user.email} for Order #${order._id}`);
  } catch (e) {
    console.error('❌ Failed to send email:', e.message);
  }
};

const sendOfferStatusEmail = async (user, offer, customMessage) => {
  try {
    if (!transporter) {
      console.log('ℹ️ Email service not active - skipping offer email');
      return;
    }
    if (!user || !user.email) {
      console.log('❌ Skipping email: User or email address is missing');
      return;
    }
    const text = `Dear ${user.username || 'Customer'},\n\nYour offer for artwork "${offer.artwork?.title || 'Art piece'}" has been updated.\n\nNew Status: ${offer.status}\nOffered Price: Rs.${offer.offeringPrice}\n\n${customMessage}\n\nThank you for curating with ArtSelling!\n`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `ArtSelling: Offer Status Update`,
      text,
    });
    console.log(`✅ Offer Email sent to ${user.email}`);
  } catch (e) {
    console.error('❌ Failed to send email:', e.message);
  }
};

module.exports = { sendOrderStatusEmail, sendOfferStatusEmail };

