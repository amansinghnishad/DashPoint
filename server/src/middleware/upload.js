const multer = require('multer');
const path = require('path');
const { Writable } = require('stream');

const parsePositiveLimit = (rawValue, fallback) => {
  const parsed = Number.parseInt(rawValue, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const MAX_FILE_SIZE = Math.min(
  parsePositiveLimit(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024),
  10 * 1024 * 1024
);
const MAX_FILES_PER_UPLOAD = Math.min(
  parsePositiveLimit(process.env.MAX_FILES_PER_UPLOAD, 5),
  5
);
const MAX_TOTAL_UPLOAD_SIZE = Math.min(
  parsePositiveLimit(process.env.MAX_TOTAL_UPLOAD_SIZE, 25 * 1024 * 1024),
  25 * 1024 * 1024
);

// Keep the buffer-based processing flow, while enforcing a request-wide ceiling
// as multipart bytes arrive so many files cannot exceed the configured budget.
const storage = {
  _handleFile(req, file, callback) {
    const chunks = [];
    let fileSize = 0;
    let storageCallbackCalled = false;
    const finishStorage = (error, result) => {
      if (storageCallbackCalled) return;
      storageCallbackCalled = true;
      callback(error, result);
    };

    const sink = new Writable({
      write(chunk, encoding, streamCallback) {
        const nextRequestSize = (req.uploadBytesReceived || 0) + chunk.length;
        if (nextRequestSize > MAX_TOTAL_UPLOAD_SIZE) {
          const error = new Error(
            `Combined upload size exceeds the ${Math.floor(MAX_TOTAL_UPLOAD_SIZE / (1024 * 1024))}MB limit.`
          );
          error.code = 'LIMIT_TOTAL_SIZE';
          streamCallback(error);
          return;
        }

        req.uploadBytesReceived = nextRequestSize;
        fileSize += chunk.length;
        chunks.push(chunk);
        streamCallback();
      },
      final(streamCallback) {
        finishStorage(null, { buffer: Buffer.concat(chunks), size: fileSize });
        streamCallback();
      }
    });

    sink.on('error', (error) => finishStorage(error));
    file.stream.on('error', (error) => sink.destroy(error));
    file.stream.pipe(sink);
  },
  _removeFile(req, file, callback) {
    delete file.buffer;
    callback(null);
  }
};

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
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error?.code === 'LIMIT_TOTAL_SIZE') {
    return res.status(413).json({ error: error.message });
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `File too large. Maximum size is ${Math.floor(MAX_FILE_SIZE / (1024 * 1024))}MB.`
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: `Too many files. Maximum is ${MAX_FILES_PER_UPLOAD} files at once.`
      });
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

const getUploadLimits = () => ({
  maxFileSize: MAX_FILE_SIZE,
  maxFiles: MAX_FILES_PER_UPLOAD,
  maxTotalSize: MAX_TOTAL_UPLOAD_SIZE
});

module.exports = {
  upload,
  handleMulterError,
  getUploadLimits
};
