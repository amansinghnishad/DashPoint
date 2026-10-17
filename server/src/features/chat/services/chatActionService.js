const mongoose = require('mongoose');

const Collection = require('../../../models/Collection');
const ChatMessage = require('../../../models/ChatMessage');
const PlannerWidget = require('../../../models/PlannerWidget');
const { attachEmbeddingToPlannerWidget } = require('../../../services/embeddingsService');
const { createGoogleCalendarEventTool } = require('./chatCalendarToolService');

const normalizeText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

const resolveCollection = async (userId, collectionId) => {
  if (!collectionId) return null;
  if (!mongoose.isValidObjectId(collectionId)) throw new Error('Collection is invalid');
  const collection = await Collection.findOne({ _id: collectionId, userId });
  if (!collection) throw new Error('Collection not found');
  return collection;
};

const savePlannerAction = async ({ userId, action, collection }) => {
  const payload = action.payload || {};
  const isTask = action.type === 'task';
  const title = normalizeText(payload.title || (isTask ? 'Task' : 'Note'), 100);
  const text = normalizeText(isTask ? payload.task : payload.note, isTask ? 280 : 2000);
  if (!text) throw new Error(`${isTask ? 'Task' : 'Note'} content is required`);

  const widget = new PlannerWidget({
    userId,
    widgetType: isTask ? 'todo-list' : 'notes',
    title,
    data: isTask ? { items: [{ done: false, text }] } : { text }
  });
  await attachEmbeddingToPlannerWidget(widget);
  await widget.save();
  if (collection) await collection.addItem('planner', String(widget._id));

  return {
    type: action.type,
    item: {
      id: String(widget._id),
      title: widget.title,
      widgetType: widget.widgetType
    },
    collection: collection ? { id: String(collection._id), name: collection.name } : null
  };
};

const findStoredChatAction = async ({ userId, actionId }) => {
  const document = await ChatMessage.findOne({
    userId,
    role: 'assistant',
    'metadata.pendingActions.id': actionId
  }).lean();
  return document?.metadata?.pendingActions?.find((item) => item.id === actionId) || null;
};

const setStoredActionStatus = async ({ userId, actionId, updates }) => {
  const setFields = Object.fromEntries(
    Object.entries(updates).map(([key, value]) => [`metadata.pendingActions.$.${key}`, value])
  );
  const result = await ChatMessage.updateOne(
    { userId, role: 'assistant', 'metadata.pendingActions.id': actionId },
    { $set: setFields }
  );
  return result.modifiedCount > 0;
};

const claimStoredAction = async ({ userId, actionId }) => {
  const document = await ChatMessage.findOneAndUpdate(
    {
      userId,
      role: 'assistant',
      'metadata.pendingActions': { $elemMatch: { id: actionId, status: { $in: [null, 'pending'] } } }
    },
    { $set: { 'metadata.pendingActions.$.status': 'saving' } },
    { new: true }
  ).lean();
  return document?.metadata?.pendingActions?.find((item) => item.id === actionId) || null;
};

const dismissChatAction = async ({ userId, actionId }) => {
  const existingAction = await findStoredChatAction({ userId, actionId });
  if (!existingAction) throw new Error('Draft not found');
  if (existingAction.status === 'saved') throw new Error('This draft has already been saved');
  if (existingAction.status === 'saving') throw new Error('This draft is currently being saved');
  const dismissed = await ChatMessage.updateOne(
    {
      userId,
      role: 'assistant',
      'metadata.pendingActions': { $elemMatch: { id: actionId, status: { $in: [null, 'pending'] } } }
    },
    { $set: { 'metadata.pendingActions.$.status': 'dismissed', 'metadata.pendingActions.$.error': '' } }
  );
  if (!dismissed.modifiedCount && existingAction.status !== 'dismissed') throw new Error('This draft could not be dismissed');
  return { id: actionId, status: 'dismissed' };
};

const commitChatAction = async ({ userId, actionId, collectionId = '' }) => {
  const action = await findStoredChatAction({ userId, actionId });
  if (!action || !['task', 'note', 'calendar_event'].includes(action.type)) {
    throw new Error('This chat action is not supported');
  }
  if (action.status === 'saved') return action.result;
  if (action.status === 'dismissed') throw new Error('This draft was dismissed');
  if (action.status === 'saving') throw new Error('This draft is already being saved');

  const claimedAction = await claimStoredAction({ userId, actionId });
  if (!claimedAction) throw new Error('This draft is already being handled');
  const approvedAction = {
    ...claimedAction,
    payload: {
      ...(claimedAction.payload || {}),
      ...(collectionId && ['task', 'note'].includes(claimedAction.type) ? { collectionId } : {})
    }
  };

  try {
    let result;
    if (approvedAction.type === 'calendar_event') {
      const created = await createGoogleCalendarEventTool(userId, approvedAction.payload || {});
      result = { type: approvedAction.type, event: created.event };
    } else {
      const collection = await resolveCollection(userId, approvedAction.payload?.collectionId);
      result = await savePlannerAction({ userId, action: approvedAction, collection });
    }

    await setStoredActionStatus({
      userId,
      actionId,
      updates: { status: 'saved', result, error: '' }
    });
    return result;
  } catch (error) {
    await setStoredActionStatus({
      userId,
      actionId,
      updates: { status: 'pending', error: error.message }
    });
    throw error;
  }
};

module.exports = { commitChatAction, dismissChatAction };
