const File = require('../../../../models/File');
const { findCollectionsForItems } = require('./collectionMembership');
const { buildResult, toIso } = require('../searchResultUtils');

const searchFiles = async ({ userId, regex, limit }) => {
  const rows = await File.find({
    userId,
    $or: [
      { originalName: regex },
      { filename: regex },
      { description: regex },
      { tags: regex },
      { mimetype: regex }
    ]
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('_id originalName filename mimetype size url description tags updatedAt')
    .lean();

  const collectionMap = await findCollectionsForItems({
    userId,
    itemType: 'file',
    itemIds: rows.map((row) => row._id)
  });

  return rows.map((row) => {
    const collection = collectionMap.get(String(row._id)) || {};
    return buildResult({
      type: 'file',
      id: row._id,
      title: row.originalName || row.filename,
      subtitle: row.mimetype || 'File',
      snippet: row.description || (row.tags || []).join(', '),
      url: row.url,
      metadata: {
        fileId: String(row._id),
        collectionId: collection.collectionId || '',
        collectionName: collection.collectionName || '',
        size: row.size,
        updatedAt: toIso(row.updatedAt)
      }
    });
  });
};

module.exports = {
  searchFiles
};
