const File = require('../models/File');
const path = require('path');
const fs = require('fs').promises;

// Get all files for a user
const getFiles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      starred = false
    } = req.query;

    const query = { userId: req.user.id };

    // Add search filter
    if (search) {
      query.originalName = { $regex: search, $options: 'i' };
    }

    // Add category filter
    if (category) {
      switch (category.toLowerCase()) {
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
    if (starred === 'true') {
      query.isStarred = true;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const files = await File.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await File.countDocuments(query);

    // Add formatted size and category to each file
    const filesWithMeta = files.map(file => ({
      ...file,
      formattedSize: formatFileSize(file.size),
      category: getFileCategory(file.mimetype)
    }));

    res.json({
      files: filesWithMeta,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ error: 'Failed to get files' });
  }
};

// Upload files
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { tags, description } = req.body;

    const uploadedFiles = [];

    for (const file of req.files) {
      const newFile = new File({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${file.filename}`,
        userId: req.user.id,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        description: description || ''
      });

      await newFile.save();
      uploadedFiles.push({
        ...newFile.toObject(),
        formattedSize: newFile.getFormattedSize(),
        category: getFileCategory(newFile.mimetype)
      });
    }

    res.status(201).json({
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
};

// Get file by ID
const getFileById = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      ...file.toObject(),
      formattedSize: file.getFormattedSize(),
      category: getFileCategory(file.mimetype)
    });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if file exists on disk
    try {
      await fs.access(file.path);
    } catch (error) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Increment download count
    await file.incrementDownload();

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);

    // Send file
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from disk
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.warn('File not found on disk:', file.path);
    }

    // Delete from database
    await File.findByIdAndDelete(file._id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

// Toggle star status
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
    await file.save();

    res.json({
      message: `File ${file.isStarred ? 'starred' : 'unstarred'} successfully`,
      isStarred: file.isStarred
    });
  } catch (error) {
    console.error('Error toggling star:', error);
    res.status(500).json({ error: 'Failed to toggle star' });
  }
};

// Update file metadata
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

    await file.save();

    res.json({
      message: 'File updated successfully',
      file: {
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

// Get storage statistics
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

    res.json(result);
  } catch (error) {
    console.error('Error getting storage stats:', error);
    res.status(500).json({ error: 'Failed to get storage statistics' });
  }
};

// Helper functions
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

module.exports = {
  getFiles,
  uploadFiles,
  getFileById,
  downloadFile,
  deleteFile,
  toggleStar,
  updateFile,
  getStorageStats
};
