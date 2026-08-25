require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload() {
  try {
    const result = await cloudinary.uploader.upload('./test_valid.jpg', {
      folder: 'fishery_college/test'
    });
    console.log('Upload success:', result.secure_url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

testUpload();
