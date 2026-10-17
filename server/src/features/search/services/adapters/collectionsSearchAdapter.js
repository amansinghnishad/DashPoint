const Collection = require('../../../../models/Collection');
const { buildResult, toIso } = require('../searchResultUtils');

const searchCollections = async ({ userId, regex, limit }) => {
  const rows = await Collection.find({
    userId,
    $or: [{ name: regex }, { description: regex }, { tags: regex }]
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('_id name description tags itemCount items updatedAt')
    .lean();

  return rows.map((row) =>
    buildResult({
      type: 'collection',
      id: row._id,
      title: row.name,
      subtitle: 'Collection',
      snippet: row.description || `${Array.isArray(row.items) ? row.items.length : 0} items`,
      metadata: {
        collectionId: String(row._id),
        tags: row.tags || [],
        updatedAt: toIso(row.updatedAt)
      }
    })
  );
};

module.exports = {
  searchCollections
};
