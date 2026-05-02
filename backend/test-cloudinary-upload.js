require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing upload...');

// Create a small 1x1 pixel base64 image
const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

cloudinary.uploader.upload(dummyImage, { folder: 'test' })
  .then(result => {
    console.log('Upload successful!', result.secure_url);
  })
  .catch(error => {
    console.error('Upload failed!', error);
  });
