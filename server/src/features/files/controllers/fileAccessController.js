const File = require('../../../models/File');
const path = require('path');
const fsSync = require('fs');
const fs = require('fs').promises;
const axios = require('axios');
const { cloudinary, destroyAsset } = require('../../../utils/cloudinary');

const downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Increment download count
    await file.incrementDownload();

    // Cloudinary-backed files: redirect to a download URL.
    if (file.storageProvider === 'cloudinary' && file.cloudinaryPublicId) {
      const resourceType = file.cloudinaryResourceType || 'auto';
      let downloadUrl;
      try {
        downloadUrl = cloudinary.url(file.cloudinaryPublicId, {
          resource_type: resourceType,
          secure: true,
          flags: 'attachment'
        });
      } catch (error) {
        downloadUrl = file.url;
      }
      return res.redirect(downloadUrl);
    }

    // Backward compatibility: legacy local uploads
    if (!file.path) {
      return res.status(404).json({ error: 'File has no storage path' });
    }

    try {
      await fs.access(file.path);
    } catch (error) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from Cloudinary (or disk for legacy records)
    if (file.storageProvider === 'cloudinary' && file.cloudinaryPublicId) {
      try {
        await destroyAsset(file.cloudinaryPublicId, file.cloudinaryResourceType);
      } catch (error) {
        console.warn('Failed to delete Cloudinary asset:', error.message || error);
      }
    } else if (file.path) {
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.warn('File not found on disk:', file.path);
      }
    }

    // Delete from database
    await File.findByIdAndDelete(file._id);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

const previewFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const safeFilename = String(file.originalName || file.filename || 'file')
      .replace(/[\r\n"]/g, '_')
      .trim();

    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
    // Stream from local disk for legacy local records.
    if (file.path) {
      try {
        await fs.access(file.path);
      } catch (error) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      if (typeof file.size === 'number' && file.size > 0) {
        res.setHeader('Content-Length', String(file.size));
      }

      const stream = fsSync.createReadStream(path.resolve(file.path));
      stream.on('error', (streamError) => {
        console.error('Error streaming preview file from disk:', streamError);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to preview file' });
        } else {
          res.end();
        }
      });
      stream.pipe(res);
      return;
    }

    // Proxy only Cloudinary assets. Web links are rendered directly by the
    // client; proxying arbitrary user-provided URLs would create an SSRF path.
    if (file.storageProvider === 'cloudinary' && file.url) {
      try {
        const remoteUrl = new URL(file.url);
        if (remoteUrl.protocol !== 'https:' || remoteUrl.hostname !== 'res.cloudinary.com') {
          return res.status(400).json({ error: 'Unsupported remote preview URL' });
        }

        const upstream = await axios.get(remoteUrl.toString(), {
          responseType: 'stream',
          timeout: 60000,
          maxRedirects: 0
        });

        upstream.data.on('error', (streamError) => {
          console.error('Error streaming preview file from remote URL:', streamError);
          if (!res.headersSent) {
            res.status(502).json({ error: 'Failed to preview file' });
          } else {
            res.end();
          }
        });

        upstream.data.pipe(res);
        return;
      } catch (error) {
        console.error('Error fetching preview file from remote URL:', error);
        return res.status(502).json({ error: 'Failed to fetch file content for preview' });
      }
    }

    if (file.url && file.mimetype === 'text/html') {
      return res.status(400).json({
        error: 'Web links must be opened directly and cannot be proxied through the API'
      });
    }

    return res.status(404).json({ error: 'File has no storage path or URL' });
  } catch (error) {
    console.error('Error previewing file:', error);
    return res.status(500).json({ error: 'Failed to preview file' });
  }
};

module.exports = {
  downloadFile,
  deleteFile,
  previewFile
};
