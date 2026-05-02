const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('--- Email Test Script ---');
console.log('Host:', process.env.EMAIL_HOST);
console.log('Port:', process.env.EMAIL_PORT);
console.log('User:', process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Verification failed:', error);
  } else {
    console.log('✅ Server is ready to take our messages');
    
    // Attempt to send a test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'thaks@example.com', // Change this to your email to test
      subject: 'Artify: Test Email',
      text: 'This is a test email from Artify to verify the Brevo configuration.'
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('❌ Send failed:', err);
      } else {
        console.log('✅ Email sent successfully:', info.response);
      }
    });
  }
});
