const Collection = require('../../../../models/Collection');

const findCollectionsForItems = async ({ userId, itemType, itemIds }) => {
  const normalizedIds = [...new Set(itemIds.map((id) => String(id || '')).filter(Boolean))];
  if (!normalizedIds.length) {
    return new Map();
  }

  const rows = await Collection.find({
    userId,
    items: {
      $elemMatch: {
        itemType,
        itemId: { $in: normalizedIds }
      }
    }
  })
    .select('_id name items')
    .lean();

  const map = new Map();
  rows.forEach((collection) => {
    (collection.items || []).forEach((item) => {
      if (item.itemType !== itemType) return;
      const itemId = String(item.itemId || '');
      if (!normalizedIds.includes(itemId) || map.has(itemId)) return;
      map.set(itemId, {
        collectionId: String(collection._id),
        collectionName: collection.name
      });
    });
  });

  return map;
};

module.exports = {
  findCollectionsForItems
};
