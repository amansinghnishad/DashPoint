const { v2: cloudinary } = require('cloudinary');

const requiredEnv = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const hasAllEnv = requiredEnv.every((key) => Boolean(process.env[key]));

if (hasAllEnv) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const assertCloudinaryConfigured = () => {
  if (!hasAllEnv) {
    const missing = requiredEnv.filter((key) => !process.env[key]);
    const message = `Cloudinary is not configured. Missing env var(s): ${missing.join(', ')}`;
    const error = new Error(message);
    error.code = 'CLOUDINARY_NOT_CONFIGURED';
    throw error;
  }
};

/**
 * Upload an in-memory file buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {{ folder?: string, publicId?: string, resourceType?: string, filename?: string, tags?: string[] }} options
 */
const uploadBuffer = (buffer, options = {}) => {
  assertCloudinaryConfigured();

  const {
    folder,
    publicId,
    resourceType = 'auto',
    filename,
    tags
  } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: resourceType,
      folder,
      public_id: publicId,
      filename_override: filename,
      use_filename: true,
      unique_filename: true,
      tags
    };

    // Remove undefined keys to avoid Cloudinary validation errors
    Object.keys(uploadOptions).forEach((key) => {
      if (uploadOptions[key] === undefined) delete uploadOptions[key];
    });

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    stream.end(buffer);
  });
};

/**
 * Best-effort delete for Cloudinary assets.
 * Cloudinary requires a correct resource_type for non-image assets.
 */
const destroyAsset = async (publicId, resourceType) => {
  assertCloudinaryConfigured();

  const candidates = [resourceType, 'raw', 'image', 'video']
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);

  let lastError;
  for (const candidate of candidates) {
    try {
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: candidate,
        invalidate: true
      });
      return res;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

module.exports = {
  cloudinary,
  assertCloudinaryConfigured,
  uploadBuffer,
  destroyAsset
};
