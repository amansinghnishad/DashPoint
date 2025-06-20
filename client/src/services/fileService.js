import { apiClient } from './api';

const fileService = {
  // Get all files with optional filtering
  getFiles: async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const response = await apiClient.get(`/files?${queryParams.toString()}`);
    return response.data;
  },

  // Upload files
  uploadFiles: async (files, options = {}) => {
    const formData = new FormData();

    // Add files to form data
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });    // Add optional metadata
    if (options.tags) formData.append('tags', options.tags);
    if (options.description) formData.append('description', options.description);

    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get file by ID
  getFileById: async (fileId) => {
    const response = await apiClient.get(`/files/${fileId}`);
    return response.data;
  },

  // Download file
  downloadFile: async (fileId, filename) => {
    const response = await apiClient.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  // Delete file
  deleteFile: async (fileId) => {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  },

  // Toggle star status
  toggleStar: async (fileId) => {
    const response = await apiClient.patch(`/files/${fileId}/star`);
    return response.data;
  },

  // Update file metadata
  updateFile: async (fileId, updates) => {
    const response = await apiClient.patch(`/files/${fileId}`, updates);
    return response.data;
  },
  // Get storage statistics
  getStorageStats: async () => {
    const response = await apiClient.get('/files/stats');
    return response.data;
  },

  // Utility functions
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileIcon: (mimetype) => {
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return '📊';
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar')) return '📦';
    return '📁';
  },

  getFileCategory: (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('pdf')) return 'pdf';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
    if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'spreadsheet';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'presentation';
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar')) return 'archive';
    return 'other';
  }
};

export default fileService;
