const axios = require('axios');
const cheerio = require('cheerio');

const VideoIntelligenceChunk = require('../models/VideoIntelligenceChunk');
const {
  createEmbedding,
  resolveEmbeddingConfig,
  getEmbeddingModelLabel
} = require('./embeddingsService');

const TIMEDTEXT_BASE_URL = 'https://video.google.com/timedtext';
const VECTOR_INDEX_NAME =
  process.env.VIDEO_INTELLIGENCE_VECTOR_INDEX ||
  process.env.YOUTUBE_TRANSCRIPT_VECTOR_INDEX ||
  'video_intelligence_embedding_idx';
const CHUNK_MAX_CHARS = Math.max(
  400,
  Number.parseInt(process.env.VIDEO_INTELLIGENCE_CHUNK_MAX_CHARS || '1200', 10) || 1200
);
const CHUNK_OVERLAP_CHARS = Math.max(
  0,
  Math.min(
    CHUNK_MAX_CHARS - 1,
    Number.parseInt(process.env.VIDEO_INTELLIGENCE_CHUNK_OVERLAP_CHARS || '220', 10) || 220
  )
);
const EMBED_BATCH_SIZE = Math.max(
  1,
  Number.parseInt(process.env.VIDEO_INTELLIGENCE_EMBED_BATCH_SIZE || '8', 10) || 8
);

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

const normalizeTranscriptSegments = (segments) =>
  (Array.isArray(segments) ? segments : [])
    .map((segment) => {
      const text = decodeText(segment?.text);
      if (!text) return null;

      const startSec = Number(segment?.startSec);
      const durationSec = Number(segment?.durationSec);
      const normalizedStart = Number.isFinite(startSec) ? startSec : 0;
      const normalizedDuration = Number.isFinite(durationSec) ? durationSec : 0;

      return {
        text,
        startSec: normalizedStart,
        durationSec: normalizedDuration,
        charLength: text.length
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.startSec - b.startSec);

const resolveNextChunkStart = ({
  normalizedSegments,
  currentStartIndex,
  currentEndIndex,
  overlapChars
}) => {
  if (currentEndIndex >= normalizedSegments.length) {
    return currentEndIndex;
  }

  if (overlapChars <= 0) {
    return currentEndIndex;
  }

  let overlapTotal = 0;
  let nextStartIndex = currentEndIndex;

  while (nextStartIndex > currentStartIndex) {
    const segment = normalizedSegments[nextStartIndex - 1];
    const addedLength = segment.charLength + (overlapTotal > 0 ? 1 : 0);
    overlapTotal += addedLength;
    nextStartIndex -= 1;

    if (overlapTotal >= overlapChars) {
      break;
    }
  }

  if (nextStartIndex <= currentStartIndex) {
    return Math.max(currentStartIndex + 1, currentEndIndex - 1);
  }

  return nextStartIndex;
};

const chunkSegments = (
  segments,
  {
    maxChars = CHUNK_MAX_CHARS,
    overlapChars = CHUNK_OVERLAP_CHARS
  } = {}
) => {
  const normalizedSegments = normalizeTranscriptSegments(segments);
  if (!normalizedSegments.length) {
    return [];
  }

  const chunks = [];
  let startIndex = 0;

  while (startIndex < normalizedSegments.length) {
    let endIndex = startIndex;
    let currentChars = 0;

    while (endIndex < normalizedSegments.length) {
      const segment = normalizedSegments[endIndex];
      const candidateChars = currentChars + segment.charLength + (currentChars > 0 ? 1 : 0);

      if (candidateChars > maxChars && endIndex > startIndex) {
        break;
      }

      currentChars = candidateChars;
      endIndex += 1;

      if (currentChars >= maxChars) {
        break;
      }
    }

    if (endIndex <= startIndex) {
      endIndex = startIndex + 1;
    }

    const chunkSegmentsSlice = normalizedSegments.slice(startIndex, endIndex);
    const chunkText = chunkSegmentsSlice.map((segment) => segment.text).join(' ').trim();

    if (chunkText) {
      const firstSegment = chunkSegmentsSlice[0];
      const lastSegment = chunkSegmentsSlice[chunkSegmentsSlice.length - 1];
      const chunkStartSec = firstSegment.startSec;
      const chunkEndSec = lastSegment.startSec + lastSegment.durationSec;

      chunks.push({
        text: chunkText,
        startSec: chunkStartSec,
        durationSec: Math.max(chunkEndSec - chunkStartSec, 0),
        chunkCharCount: chunkText.length
      });
    }

    const nextStartIndex = resolveNextChunkStart({
      normalizedSegments,
      currentStartIndex: startIndex,
      currentEndIndex: endIndex,
      overlapChars
    });

    if (nextStartIndex <= startIndex) {
      startIndex = endIndex;
    } else {
      startIndex = nextStartIndex;
    }
  }

  return chunks.map((chunk, index, array) => {
    if (index === 0) {
      return { ...chunk, overlapCharsUsed: 0 };
    }

    const previousText = array[index - 1].text;
    const currentText = chunk.text;
    let overlapCount = 0;
    const maxProbe = Math.min(previousText.length, currentText.length, overlapChars);

    for (let probe = maxProbe; probe > 0; probe -= 1) {
      if (previousText.slice(-probe) === currentText.slice(0, probe)) {
        overlapCount = probe;
        break;
      }
    }

    return {
      ...chunk,
      overlapCharsUsed: overlapCount
    };
  });
};

const buildChunkDocsWithBatchEmbeddings = async ({
  chunks,
  videoDoc,
  sourceLanguage,
  embeddingConfig
}) => {
  const chunkDocs = [];
  const embeddingModelLabel = getEmbeddingModelLabel(embeddingConfig);

  for (let start = 0; start < chunks.length; start += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(start, start + EMBED_BATCH_SIZE);
    const vectors = await Promise.all(
      batch.map((chunk) =>
        createEmbedding(chunk.text, {
          provider: embeddingConfig?.provider,
          model: embeddingConfig?.model,
          taskType: 'RETRIEVAL_DOCUMENT'
        }).catch((error) => {
          console.warn('[Video Intelligence] Embedding generation failed:', error.message);
          return null;
        })
      )
    );

    batch.forEach((chunk, idx) => {
      const embeddingVector = vectors[idx];
      const chunkIndex = start + idx;

      chunkDocs.push({
        userId: videoDoc.userId,
        youtubeId: videoDoc._id,
        videoId: videoDoc.videoId,
        chunkIndex,
        startSec: chunk.startSec,
        durationSec: chunk.durationSec,
        text: chunk.text,
        chunkCharCount: chunk.chunkCharCount,
        overlapCharsUsed: chunk.overlapCharsUsed || 0,
        transcriptProvider: 'youtube_timedtext_api',
        sourceLanguage,
        embedding: embeddingVector || undefined,
        embeddingModel: embeddingVector ? embeddingModelLabel || undefined : undefined,
        embeddingUpdatedAt: embeddingVector ? new Date() : null
      });
    });
  }

  return chunkDocs;
};

const indexTranscriptForVideo = async (videoDoc) => {
  if (!videoDoc || !videoDoc.videoId || !videoDoc.userId || !videoDoc._id) {
    throw new Error('Invalid YouTube document for transcript indexing');
  }

  try {
    const tracks = await fetchTranscriptTrackList(videoDoc.videoId);
    const selectedTrack = pickBestTrack(tracks);

    if (!selectedTrack) {
      await VideoIntelligenceChunk.deleteMany({
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
      await VideoIntelligenceChunk.deleteMany({
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

    const chunks = chunkSegments(segments, {
      maxChars: CHUNK_MAX_CHARS,
      overlapChars: CHUNK_OVERLAP_CHARS
    });
    const fullText = segments
      .map((segment) => segment.text)
      .join(' ')
      .trim()
      .slice(0, 200000);

    await VideoIntelligenceChunk.deleteMany({
      userId: videoDoc.userId,
      youtubeId: videoDoc._id
    });

    const embeddingConfig = resolveEmbeddingConfig();
    const chunkDocs = await buildChunkDocsWithBatchEmbeddings({
      chunks,
      videoDoc,
      sourceLanguage: selectedTrack.langCode || '',
      embeddingConfig
    });

    if (chunkDocs.length) {
      await VideoIntelligenceChunk.insertMany(chunkDocs, { ordered: false });
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
      language: selectedTrack.langCode || '',
      chunking: {
        maxChars: CHUNK_MAX_CHARS,
        overlapChars: CHUNK_OVERLAP_CHARS
      },
      embeddingBatchSize: EMBED_BATCH_SIZE,
      vectorCollection: 'video_intelligence',
      vectorIndex: VECTOR_INDEX_NAME
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

const findRelevantTranscriptChunks = async ({
  userId,
  youtubeId,
  query,
  limit = 6,
  numCandidates = 120
}) => {
  const queryVector = await createEmbedding(query, {
    taskType: 'RETRIEVAL_QUERY'
  });
  if (!queryVector) {
    throw new Error(
      'Unable to create query embedding. Configure OPENAI_API_KEY or GEMINI_API_KEY.'
    );
  }

  const parsedLimit = Math.max(1, Math.min(Number(limit) || 6, 15));
  const parsedCandidates = Math.max(
    parsedLimit,
    Math.min(Number(numCandidates) || 120, 400)
  );

  return VideoIntelligenceChunk.aggregate([
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
  findRelevantTranscriptChunks,
  chunkSegments
};
