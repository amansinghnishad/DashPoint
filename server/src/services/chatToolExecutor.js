const Collection = require('../models/Collection');
const PlannerWidget = require('../models/PlannerWidget');

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];

  const cleaned = tags
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .slice(0, 20);

  return [...new Set(cleaned)];
};

const createCollectionForUser = async (userId, args) => {
  const name = String(args?.name || '').trim();
  if (!name) {
    throw new Error('Collection name is required');
  }

  const existing = await Collection.findOne({ userId, name });
  if (existing) {
    return {
      created: false,
      message: 'Collection with this name already exists',
      collection: {
        _id: String(existing._id),
        name: existing.name
      }
    };
  }

  const collection = new Collection({
    userId,
    name,
    description: args?.description,
    color: args?.color,
    icon: args?.icon,
    tags: normalizeTags(args?.tags),
    isPrivate: args?.isPrivate !== undefined ? Boolean(args.isPrivate) : true
  });

  await collection.save();

  return {
    created: true,
    message: 'Collection created successfully',
    collection: {
      _id: String(collection._id),
      name: collection.name,
      description: collection.description || '',
      color: collection.color,
      icon: collection.icon,
      tags: collection.tags,
      isPrivate: collection.isPrivate
    }
  };
};

const addNoteToCollection = async (userId, args) => {
  const collectionId = String(args?.collectionId || '').trim();
  const noteText = String(args?.note || '').trim();
  const rawTitle = String(args?.title || '').trim();

  if (!collectionId) {
    throw new Error('collectionId is required');
  }

  if (!noteText) {
    throw new Error('Note text is required');
  }

  const collection = await Collection.findOne({ _id: collectionId, userId });
  if (!collection) {
    throw new Error('Collection not found');
  }

  const widget = new PlannerWidget({
    userId,
    widgetType: 'notes',
    title: rawTitle.slice(0, 100),
    data: {
      text: noteText
    }
  });

  await widget.save();
  await collection.addItem('planner', String(widget._id));

  return {
    added: true,
    message: 'Note added to collection',
    collection: {
      _id: String(collection._id),
      name: collection.name
    },
    widget: {
      _id: String(widget._id),
      widgetType: widget.widgetType,
      title: widget.title,
      data: widget.data
    }
  };
};

const executeToolCall = async ({ name, args, userId }) => {
  switch (name) {
    case 'createCollection':
      return createCollectionForUser(userId, args);
    case 'addNote':
      return addNoteToCollection(userId, args);
    default:
      throw new Error(`Unsupported tool: ${name}`);
  }
};

module.exports = {
  executeToolCall
};