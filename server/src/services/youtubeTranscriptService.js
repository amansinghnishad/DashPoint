const axios = require('axios');
const cheerio = require('cheerio');

const YouTubeTranscriptChunk = require('../models/YouTubeTranscriptChunk');
const { EMBEDDING_MODEL, createEmbedding } = require('./embeddingsService');

const TIMEDTEXT_BASE_URL = 'https://video.google.com/timedtext';
const VECTOR_INDEX_NAME = process.env.YOUTUBE_TRANSCRIPT_VECTOR_INDEX || 'youtube_transcript_chunks_embedding_idx';

const decodeText = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

const fetchTranscriptTrackList = async (videoId) => {
  const response = await axios.get(TIMEDTEXT_BASE_URL, {
    params: {
      type: 'list',
      v: videoId
    },
    timeout: 15000
  });

  const $ = cheerio.load(response.data, { xmlMode: true });
  const tracks = [];

  $('track').each((_, element) => {
    tracks.push({
      langCode: $(element).attr('lang_code') || '',
      langOriginal: $(element).attr('lang_original') || '',
      langTranslated: $(element).attr('lang_translated') || '',
      name: $(element).attr('name') || ''
    });
  });

  return tracks;
};

const pickBestTrack = (tracks) => {
  if (!Array.isArray(tracks) || !tracks.length) return null;

  const normalized = tracks.map((track) => ({
    ...track,
    langCodeLower: String(track.langCode || '').toLowerCase()
  }));

  const exactEnglish = normalized.find((track) => track.langCodeLower === 'en');
  if (exactEnglish) return exactEnglish;

  const englishVariant = normalized.find((track) => track.langCodeLower.startsWith('en-'));
  if (englishVariant) return englishVariant;

  return normalized[0];
};

const fetchTranscriptSegments = async (videoId, track) => {
  const response = await axios.get(TIMEDTEXT_BASE_URL, {
    params: {
      v: videoId,
      lang: track.langCode,
      name: track.name || undefined
    },
    timeout: 15000
  });

  const $ = cheerio.load(response.data, { xmlMode: true });
  const segments = [];

  $('text').each((_, element) => {
    const startRaw = $(element).attr('start');
    const durationRaw = $(element).attr('dur');
    const text = decodeText($(element).text());

    if (!text) return;

    const startSec = Number.parseFloat(startRaw || '0');
    const durationSec = Number.parseFloat(durationRaw || '0');

    segments.push({
      text,
      startSec: Number.isFinite(startSec) ? startSec : 0,
      durationSec: Number.isFinite(durationSec) ? durationSec : 0
    });
  });

  return segments;
};

const chunkSegments = (segments, maxChars = 1200) => {
  const chunks = [];
  let currentTexts = [];
  let currentLength = 0;
  let currentStart = 0;
  let currentEnd = 0;

  const flush = () => {
    if (!currentTexts.length) return;
    const text = currentTexts.join(' ').trim();
    if (!text) return;

    chunks.push({
      text,
      startSec: currentStart,
      durationSec: Math.max(currentEnd - currentStart, 0)
    });

    currentTexts = [];
    currentLength = 0;
    currentStart = 0;
    currentEnd = 0;
  };

  segments.forEach((segment) => {
    const segmentText = decodeText(segment.text);
    if (!segmentText) return;

    const nextLength = currentLength + segmentText.length + 1;
    if (currentTexts.length && nextLength > maxChars) {
      flush();
    }

    if (!currentTexts.length) {
      currentStart = segment.startSec || 0;
      currentEnd = (segment.startSec || 0) + (segment.durationSec || 0);
    } else {
      currentEnd = (segment.startSec || 0) + (segment.durationSec || 0);
    }

    currentTexts.push(segmentText);
    currentLength += segmentText.length + 1;
  });

  flush();

  return chunks;
};

const indexTranscriptForVideo = async (videoDoc) => {
  if (!videoDoc || !videoDoc.videoId || !videoDoc.userId || !videoDoc._id) {
    throw new Error('Invalid YouTube document for transcript indexing');
  }

  try {
    const tracks = await fetchTranscriptTrackList(videoDoc.videoId);
    const selectedTrack = pickBestTrack(tracks);

    if (!selectedTrack) {
      await YouTubeTranscriptChunk.deleteMany({
        userId: videoDoc.userId,
        youtubeId: videoDoc._id
      });

      videoDoc.transcriptStatus = 'unavailable';
      videoDoc.transcriptLanguage = '';
      videoDoc.transcriptText = '';
      videoDoc.transcriptChunkCount = 0;
      videoDoc.transcriptIndexedAt = new Date();
      videoDoc.transcriptError = 'No transcript track available';
      await videoDoc.save();

      return { indexed: false, reason: 'unavailable' };
    }

    const segments = await fetchTranscriptSegments(videoDoc.videoId, selectedTrack);
    if (!segments.length) {
      await YouTubeTranscriptChunk.deleteMany({
        userId: videoDoc.userId,
        youtubeId: videoDoc._id
      });

      videoDoc.transcriptStatus = 'unavailable';
      videoDoc.transcriptLanguage = selectedTrack.langCode || '';
      videoDoc.transcriptText = '';
      videoDoc.transcriptChunkCount = 0;
      videoDoc.transcriptIndexedAt = new Date();
      videoDoc.transcriptError = 'No transcript content found';
      await videoDoc.save();

      return { indexed: false, reason: 'empty' };
    }

    const chunks = chunkSegments(segments);
    const fullText = segments.map((segment) => segment.text).join(' ').trim().slice(0, 200000);

    await YouTubeTranscriptChunk.deleteMany({
      userId: videoDoc.userId,
      youtubeId: videoDoc._id
    });

    const chunkDocs = [];

    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index];
      const vector = await createEmbedding(chunk.text);

      chunkDocs.push({
        userId: videoDoc.userId,
        youtubeId: videoDoc._id,
        videoId: videoDoc.videoId,
        chunkIndex: index,
        startSec: chunk.startSec,
        durationSec: chunk.durationSec,
        text: chunk.text,
        embedding: vector || undefined,
        embeddingModel: EMBEDDING_MODEL,
        embeddingUpdatedAt: vector ? new Date() : null,
        sourceLanguage: selectedTrack.langCode || ''
      });
    }

    if (chunkDocs.length) {
      await YouTubeTranscriptChunk.insertMany(chunkDocs, { ordered: false });
    }

    videoDoc.transcriptStatus = 'indexed';
    videoDoc.transcriptLanguage = selectedTrack.langCode || '';
    videoDoc.transcriptText = fullText;
    videoDoc.transcriptChunkCount = chunkDocs.length;
    videoDoc.transcriptIndexedAt = new Date();
    videoDoc.transcriptError = null;
    await videoDoc.save();

    return {
      indexed: true,
      chunkCount: chunkDocs.length,
      language: selectedTrack.langCode || ''
    };
  } catch (error) {
    videoDoc.transcriptStatus = 'failed';
    videoDoc.transcriptError = error.message;
    videoDoc.transcriptIndexedAt = new Date();
    await videoDoc.save();

    return {
      indexed: false,
      reason: 'failed',
      error: error.message
    };
  }
};

const findRelevantTranscriptChunks = async ({ userId, youtubeId, query, limit = 6, numCandidates = 120 }) => {
  const queryVector = await createEmbedding(query);
  if (!queryVector) {
    throw new Error('Unable to create query embedding. Check OPENAI_API_KEY.');
  }

  const parsedLimit = Math.max(1, Math.min(Number(limit) || 6, 15));
  const parsedCandidates = Math.max(parsedLimit, Math.min(Number(numCandidates) || 120, 400));

  return YouTubeTranscriptChunk.aggregate([
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: 'embedding',
        queryVector,
        numCandidates: parsedCandidates,
        limit: parsedLimit,
        filter: {
          userId,
          youtubeId
        }
      }
    },
    {
      $project: {
        _id: 1,
        text: 1,
        chunkIndex: 1,
        startSec: 1,
        durationSec: 1,
        sourceLanguage: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    }
  ]);
};

module.exports = {
  indexTranscriptForVideo,
  findRelevantTranscriptChunks
};
