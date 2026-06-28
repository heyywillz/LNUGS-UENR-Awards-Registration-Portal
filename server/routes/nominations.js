const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { v2: cloudinary } = require('cloudinary');
const pool = require('../db');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for in-memory storage (no local disk writes)
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB
});

// Helper: upload buffer to Cloudinary
function uploadToCloudinary(fileBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'lnugs_nominations',
        public_id: fileName,
        resource_type: 'image',
        transformation: [
          { width: 600, height: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}

// POST /api/nominations
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { fullName, category, categoryGroup, bio, mobile, email } = req.body;

    // Server-side validation
    if (!fullName || !category || !categoryGroup || !mobile || !email) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    if (fullName.length < 3) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 3 characters.' });
    }

    if (!/^0\d{9}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Mobile number must start with 0 and be exactly 10 digits.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // Upload photo to Cloudinary
    let photoUrl = null;
    if (req.file) {
      const uniqueName = uuidv4();
      const cloudResult = await uploadToCloudinary(req.file.buffer, uniqueName);
      photoUrl = cloudResult.secure_url;
    }

    const result = await pool.query(
      `INSERT INTO nominations (full_name, category, category_group, bio, mobile, email, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [fullName, category, categoryGroup, bio, mobile, email, photoUrl]
    );

    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Error creating nomination:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Handle multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Photo must be under 4MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

module.exports = router;
