const multer = require('multer');
const path = require('path');

// Use memory storage so we can stream buffers directly to Cloudinary.
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Cloudinary-backed file storage: allow images + PDFs.
  const isImage = typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');
  const isPdf = file.mimetype === 'application/pdf';

  // Some clients/browsers may send octet-stream; fall back to extension checks.
  const ext = path.extname(file.originalname || '').toLowerCase();
  const isAllowedByExt = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
  const isOctetStream = file.mimetype === 'application/octet-stream';

  if (isImage || isPdf || (isOctetStream && isAllowedByExt)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10 // Maximum 10 files at once
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 10 files at once.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name in form.' });
    }
    return res.status(400).json({ error: error.message });
  }

  if (error.message.includes('File type') && error.message.includes('not allowed')) {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

module.exports = {
  upload,
  handleMulterError
};
