const YouTube = require('../../../../models/YouTube');
const VideoIntelligenceChunk = require('../../../../models/VideoIntelligenceChunk');
const { findCollectionsForItems } = require('./collectionMembership');
const { buildResult, toIso } = require('../searchResultUtils');

const searchYouTubeVideos = async ({ userId, regex, limit }) => {
  const rows = await YouTube.find({
    userId,
    $or: [
      { title: regex },
      { channelTitle: regex },
      { description: regex },
      { tags: regex },
      { category: regex }
    ]
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('_id videoId title channelTitle description url thumbnail duration updatedAt')
    .lean();

  const collectionMap = await findCollectionsForItems({
    userId,
    itemType: 'youtube',
    itemIds: rows.map((row) => row._id)
  });

  return rows.map((row) => {
    const collection = collectionMap.get(String(row._id)) || {};

    return buildResult({
      type: 'youtube',
      id: row._id,
      title: row.title,
      subtitle: row.channelTitle || 'YouTube video',
      snippet: row.description,
      url: row.url,
      metadata: {
        youtubeId: String(row._id),
        videoId: row.videoId,
        thumbnail: row.thumbnail,
        duration: row.duration,
        collectionId: collection.collectionId || '',
        collectionName: collection.collectionName || '',
        updatedAt: toIso(row.updatedAt)
      }
    });
  });
};

const searchYouTubeTranscripts = async ({ userId, regex, limit }) => {
  const chunks = await VideoIntelligenceChunk.find({
    userId,
    text: regex
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('_id youtubeId videoId text startSec durationSec updatedAt')
    .lean();

  const youtubeIds = [...new Set(chunks.map((chunk) => String(chunk.youtubeId)))];
  const videos = youtubeIds.length
    ? await YouTube.find({ _id: { $in: youtubeIds }, userId })
        .select('_id title url thumbnail')
        .lean()
    : [];
  const videoMap = new Map(videos.map((video) => [String(video._id), video]));
  const collectionMap = await findCollectionsForItems({
    userId,
    itemType: 'youtube',
    itemIds: youtubeIds
  });

  return chunks.map((chunk) => {
    const video = videoMap.get(String(chunk.youtubeId));
    const collection = collectionMap.get(String(chunk.youtubeId)) || {};

    return buildResult({
      type: 'youtube_transcript',
      id: chunk._id,
      title: video?.title || `Transcript ${chunk.videoId}`,
      subtitle: `Transcript at ${Math.round(Number(chunk.startSec || 0))}s`,
      snippet: chunk.text,
      url: video?.url || '',
      metadata: {
        youtubeId: String(chunk.youtubeId),
        videoId: chunk.videoId,
        transcriptChunkId: String(chunk._id),
        startSec: Number(chunk.startSec) || 0,
        durationSec: Number(chunk.durationSec) || 0,
        thumbnail: video?.thumbnail || '',
        collectionId: collection.collectionId || '',
        collectionName: collection.collectionName || '',
        updatedAt: toIso(chunk.updatedAt)
      }
    });
  });
};

module.exports = {
  searchYouTubeVideos,
  searchYouTubeTranscripts
};
