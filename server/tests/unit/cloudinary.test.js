const { assertCloudinaryConfigured } = require('../../src/utils/cloudinary');

describe('cloudinary Utilities Unit Tests', () => {
  it('should throw when Cloudinary environment variables are missing', () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    expect(() => {
      assertCloudinaryConfigured();
    }).toThrow('Cloudinary is not configured');
  });
});
