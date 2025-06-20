const express = require('express');
const router = express.Router();
const {
  getFiles,
  uploadFiles,
  getFileById,
  downloadFile,
  deleteFile,
  toggleStar,
  updateFile,
  getStorageStats
} = require('../controllers/fileController');
const { upload, handleMulterError } = require('../middleware/upload');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get storage statistics
router.get('/stats', getStorageStats);

// Get all files
router.get('/', getFiles);

// Upload files
router.post('/upload', upload.array('files', 10), handleMulterError, uploadFiles);

// Get file by ID
router.get('/:id', getFileById);

// Download file
router.get('/:id/download', downloadFile);

// Update file metadata
router.patch('/:id', updateFile);

// Toggle star status
router.patch('/:id/star', toggleStar);

// Delete file
router.delete('/:id', deleteFile);

module.exports = router;
