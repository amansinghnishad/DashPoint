const File = require('../../../models/File');
const ContentInsight = require('../../../models/ContentInsight');
const { uploadBuffer, destroyAsset } = require('../../../utils/cloudinary');
const { getUploadLimits } = require('../../../middleware/upload');
const { createInsightForUploadedFile, serializeInsight } = require('../../../services/contentInsightService');

const getFiles = async (req, res) => {
  try {
    const requestedPage = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const search = String(req.query.search || '').trim().slice(0, 100);
    const category = String(req.query.category || '').toLowerCase();
    const allowedSortFields = new Set(['createdAt', 'originalName', 'size', 'mimetype']);
    const requestedSort = String(req.query.sortBy || 'createdAt');
    const sortBy = allowedSortFields.has(requestedSort) ? requestedSort : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
    const starred = req.query.starred === 'true';

    const query = { userId: req.user.id };

    // Add search filter
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.originalName = { $regex: escapedSearch, $options: 'i' };
    }

    // Add category filter
    if (category) {
      switch (category) {
        case 'image':
          query.mimetype = { $regex: '^image/', $options: 'i' };
          break;
        case 'video':
          query.mimetype = { $regex: '^video/', $options: 'i' };
          break;
        case 'audio':
          query.mimetype = { $regex: '^audio/', $options: 'i' };
          break;
        case 'document':
          query.mimetype = { $regex: 'word|document|pdf', $options: 'i' };
          break;
        case 'spreadsheet':
          query.mimetype = { $regex: 'sheet|excel', $options: 'i' };
          break;
        case 'presentation':
          query.mimetype = { $regex: 'presentation|powerpoint', $options: 'i' };
          break;
      }
    }

    // Add starred filter
    if (starred) {
      query.isStarred = true;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const total = await File.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const page = Math.min(requestedPage, Math.max(totalPages, 1));

    const files = await File.find(query)
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Add formatted size and category to each file
    const filesWithMeta = files.map(file => ({
      ...file,
      formattedSize: formatFileSize(file.size),
      category: getFileCategory(file.mimetype)
    })); res.json({
      success: true,
      data: filesWithMeta,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        count: total
      }
    });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ error: 'Failed to get files' });
  }
};

const uploadFiles = async (req, res) => {
  const uploadedFiles = [];
  const failures = [];
  const insights = [];

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { maxTotalSize } = getUploadLimits();
    const totalUploadSize = req.files.reduce((total, file) => total + (file.size || 0), 0);
    if (totalUploadSize > maxTotalSize) {
      return res.status(413).json({
        error: `Combined upload size exceeds the ${Math.floor(maxTotalSize / (1024 * 1024))}MB limit.`
      });
    }

    const { tags, description } = req.body;

    for (const file of req.files) {
      let uploadedAsset = null;
      let savedFile = null;
      const insightCountBeforeFile = insights.length;

      try {
        if (!file.buffer) {
          throw new Error('Upload is misconfigured (missing file buffer).');
        }

        const baseFolder = process.env.CLOUDINARY_FOLDER || 'dashpoint';
        const folder = `${baseFolder}/users/${req.user.id}`;
        const isPdf =
          file.mimetype === 'application/pdf' ||
          (file.originalname || '').toLowerCase().endsWith('.pdf');
        const resourceType = isPdf ? 'raw' : 'image';

        const uploadResult = await uploadBuffer(file.buffer, {
          folder,
          resourceType,
          tags: ['dashpoint', `user:${req.user.id}`]
        });
        uploadedAsset = {
          publicId: uploadResult.public_id,
          resourceType: uploadResult.resource_type || resourceType
        };

        const newFile = new File({
          filename: uploadResult.public_id,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: null,
          url: uploadResult.secure_url,
          storageProvider: 'cloudinary',
          cloudinaryPublicId: uploadResult.public_id,
          cloudinaryResourceType: uploadResult.resource_type,
          cloudinaryAssetId: uploadResult.asset_id || null,
          userId: req.user.id,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          description: description || ''
        });

        savedFile = newFile;
        await newFile.save();
        try {
          const insight = await createInsightForUploadedFile({
            userId: req.user.id,
            file: newFile,
            buffer: file.buffer
          });
          if (insight) {
            insights.push(serializeInsight(insight));
          }
        } catch (insightError) {
          console.warn('Automatic file insight extraction failed:', insightError.message);
        }
        uploadedFiles.push({
          ...newFile.toObject(),
          formattedSize: newFile.getFormattedSize(),
          category: getFileCategory(newFile.mimetype)
        });
      } catch (error) {
        insights.splice(insightCountBeforeFile);
        if (savedFile?._id) {
          const cleanupResults = await Promise.allSettled([
            File.deleteOne({ _id: savedFile._id, userId: req.user.id }),
            ContentInsight.deleteMany({
              userId: req.user.id,
              sourceType: 'file',
              sourceId: String(savedFile._id)
            })
          ]);
          cleanupResults
            .filter((result) => result.status === 'rejected')
            .forEach((result) => console.warn('Upload database cleanup failed:', result.reason?.message));
        }
        if (uploadedAsset) {
          try {
            await destroyAsset(uploadedAsset.publicId, uploadedAsset.resourceType);
          } catch (cleanupError) {
            console.warn('Cloudinary upload cleanup failed:', cleanupError.message);
          }
        }
        failures.push({
          fileName: file.originalname,
          message: `Failed to upload ${file.originalname || 'file'}.`
        });
        console.error(`Upload failed for ${file.originalname || 'file'}:`, error);
      }
    }

    if (!uploadedFiles.length) {
      return res.status(500).json({
        success: false,
        message: 'No files could be uploaded.',
        data: [],
        failures
      });
    }

    const partialFailure = failures.length > 0;
    return res.status(partialFailure ? 207 : 201).json({
      success: true,
      partialFailure,
      message: partialFailure
        ? `${uploadedFiles.length} file(s) uploaded; ${failures.length} failed.`
        : `${uploadedFiles.length} file(s) uploaded successfully`,
      data: uploadedFiles,
      insights,
      failures
    });
  } catch (error) {
    console.error('Error uploading files:', error);

    if (error?.code === 'CLOUDINARY_NOT_CONFIGURED') {
      return res.status(500).json({ error: error.message });
    }

    // Cloudinary errors often include http_code.
    if (typeof error?.http_code === 'number') {
      const status = error.http_code >= 400 && error.http_code < 600 ? error.http_code : 500;
      return res.status(status).json({ error: error.message || 'Cloudinary upload failed' });
    }

    return res.status(500).json({ error: error?.message || 'Failed to upload files' });
  }
};

const getFileById = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    } res.json({
      success: true,
      data: {
        ...file.toObject(),
        formattedSize: file.getFormattedSize(),
        category: getFileCategory(file.mimetype)
      }
    });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
};

const toggleStar = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    file.isStarred = !file.isStarred;
    await file.save(); res.json({
      success: true,
      message: `File ${file.isStarred ? 'starred' : 'unstarred'} successfully`,
      data: {
        isStarred: file.isStarred
      }
    });
  } catch (error) {
    console.error('Error toggling star:', error);
    res.status(500).json({ error: 'Failed to toggle star' });
  }
};

const updateFile = async (req, res) => {
  try {
    const { originalName, tags, description } = req.body;

    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Update fields
    if (originalName) file.originalName = originalName;
    if (tags) file.tags = tags.split(',').map(tag => tag.trim());
    if (description !== undefined) file.description = description;

    await file.save(); res.json({
      success: true,
      message: 'File updated successfully',
      data: {
        ...file.toObject(),
        formattedSize: file.getFormattedSize(),
        category: getFileCategory(file.mimetype)
      }
    });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
};

const getStorageStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total files and size
    const stats = await File.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ]);

    // Get files by category
    const categoryStats = await File.aggregate([
      { $match: { userId: userId } },
      {
        $addFields: {
          category: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: '$mimetype', regex: '^image/' } }, then: 'image' },
                { case: { $regexMatch: { input: '$mimetype', regex: '^video/' } }, then: 'video' },
                { case: { $regexMatch: { input: '$mimetype', regex: '^audio/' } }, then: 'audio' },
                { case: { $regexMatch: { input: '$mimetype', regex: 'pdf' } }, then: 'pdf' },
                { case: { $regexMatch: { input: '$mimetype', regex: 'word|document' } }, then: 'document' },
                { case: { $regexMatch: { input: '$mimetype', regex: 'sheet|excel' } }, then: 'spreadsheet' },
                { case: { $regexMatch: { input: '$mimetype', regex: 'presentation|powerpoint' } }, then: 'presentation' }
              ],
              default: 'other'
            }
          }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          size: { $sum: '$size' }
        }
      }
    ]);

    // Get recent activity (files uploaded in last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentFiles = await File.countDocuments({
      userId: userId,
      createdAt: { $gte: weekAgo }
    });

    const result = {
      totalFiles: stats[0]?.totalFiles || 0,
      totalSize: stats[0]?.totalSize || 0,
      formattedTotalSize: formatFileSize(stats[0]?.totalSize || 0),
      totalDownloads: stats[0]?.totalDownloads || 0,
      recentFiles,
      categoryBreakdown: categoryStats.map(cat => ({
        category: cat._id,
        count: cat.count,
        size: cat.size,
        formattedSize: formatFileSize(cat.size)
      }))
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting storage stats:', error);
    res.status(500).json({ error: 'Failed to get storage statistics' });
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileCategory = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.includes('pdf')) return 'pdf';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
  if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'spreadsheet';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'presentation';
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar')) return 'archive';
  return 'other';
};

const createLink = async (req, res) => {
  try {
    const { url, title, description, tags } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let resolvedTitle = (title || '').trim();
    if (!resolvedTitle) {
      try {
        const parsed = new URL(formattedUrl);
        resolvedTitle = parsed.hostname;
      } catch {
        resolvedTitle = 'Web Link';
      }
    }

    const newFile = new File({
      filename: `weblink-${Date.now()}`,
      originalName: resolvedTitle,
      mimetype: 'text/html',
      size: 1,
      path: null,
      url: formattedUrl,
      storageProvider: 'local',
      userId: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      description: description || ''
    });

    await newFile.save();

    res.status(201).json({
      success: true,
      message: 'Web link added successfully',
      data: {
        ...newFile.toObject(),
        formattedSize: 'Web Link',
        category: 'link'
      }
    });
  } catch (error) {
    console.error('Error creating web link:', error);
    res.status(500).json({ error: error.message || 'Failed to add web link' });
  }
};

module.exports = {
  getFiles,
  uploadFiles,
  getFileById,
  toggleStar,
  updateFile,
  getStorageStats,
  createLink
};
