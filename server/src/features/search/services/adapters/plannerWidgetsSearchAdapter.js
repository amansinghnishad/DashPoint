const PlannerWidget = require('../../../../models/PlannerWidget');
const { findCollectionsForItems } = require('./collectionMembership');
const { buildResult, toIso } = require('../searchResultUtils');

const searchPlannerWidgets = async ({ userId, regex, limit }) => {
  const rows = await PlannerWidget.find({
    userId,
    $or: [{ title: regex }, { 'data.text': regex }, { 'data.items.text': regex }]
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('_id widgetType title data updatedAt')
    .lean();

  const collectionMap = await findCollectionsForItems({
    userId,
    itemType: 'planner',
    itemIds: rows.map((row) => row._id)
  });

  return rows.map((row) => {
    const collection = collectionMap.get(String(row._id)) || {};
    const todoSnippet = Array.isArray(row?.data?.items)
      ? row.data.items.map((item) => item?.text).filter(Boolean).join(', ')
      : '';

    return buildResult({
      type: 'planner_widget',
      id: row._id,
      title: row.title || row.widgetType,
      subtitle: collection.collectionName
        ? `Planner widget in ${collection.collectionName}`
        : 'Planner widget',
      snippet: row?.data?.text || todoSnippet,
      metadata: {
        widgetId: String(row._id),
        widgetType: row.widgetType,
        collectionId: collection.collectionId || '',
        collectionName: collection.collectionName || '',
        updatedAt: toIso(row.updatedAt)
      }
    });
  });
};

module.exports = {
  searchPlannerWidgets
};
