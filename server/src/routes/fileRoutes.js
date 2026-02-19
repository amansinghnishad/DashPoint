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

router.use(auth);

router.get('/stats', getStorageStats);

router.get('/', getFiles);

router.post('/upload', upload.array('files', 10), handleMulterError, uploadFiles);

router.get('/:id/download', downloadFile);

router.get('/:id', getFileById);

router.patch('/:id', updateFile);

router.patch('/:id/star', toggleStar);

router.delete('/:id', deleteFile);

module.exports = router;
