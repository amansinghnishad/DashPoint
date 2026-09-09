const clamp = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.floor(parsed)));
};

/**
 * Calculates cosine similarity between two numeric vectors.
 * Returns a value between -1.0 and 1.0 (or 0 if degenerate).
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || !vecA.length || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i += 1) {
    const a = vecA[i];
    const b = vecB[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Lightweight in-memory cosine similarity fallback when MongoDB Atlas $vectorSearch is unavailable
 * (e.g., local development, self-hosted MongoDB, or unindexed collections).
 */
const runLocalVectorSearchFallback = async ({
  model,
  queryVector,
  filter = {},
  path = 'embedding',
  limit = 3,
  project = {}
}) => {
  if (!model || typeof model.find !== 'function') {
    throw new Error('A valid mongoose model is required for vector search fallback');
  }

  if (!Array.isArray(queryVector) || !queryVector.length) {
    return [];
  }

  const resolvedLimit = clamp(limit, 1, 20, 3);
  const queryFilter = {
    ...(filter && typeof filter === 'object' ? filter : {}),
    [path]: { $exists: true, $type: 'array', $ne: [] }
  };

  const candidates = await model
    .find(queryFilter)
    .limit(500)
    .lean();

  if (!candidates.length) {
    return [];
  }

  const scored = candidates
    .map((doc) => {
      const docEmbedding = doc[path];
      const score = cosineSimilarity(queryVector, docEmbedding);
      return {
        ...doc,
        score
      };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, resolvedLimit);

  if (project && Object.keys(project).length > 0) {
    return scored.map((doc) => {
      const projected = {};
      Object.entries(project).forEach(([key, rule]) => {
        if (rule === 1 || rule === true) {
          projected[key] = doc[key];
        } else if (rule === 0 || rule === false) {
          // Excluded
        } else if (key === 'score' && rule?.$meta === 'vectorSearchScore') {
          projected.score = doc.score;
        }
      });
      return projected;
    });
  }

  return scored;
};

const runAtlasVectorSearch = async ({
  model,
  indexName,
  queryVector,
  filter = {},
  path = 'embedding',
  limit = 3,
  numCandidates = 120,
  project = {}
}) => {
  if (!model || typeof model.aggregate !== 'function') {
    throw new Error('A valid mongoose model is required for vector search');
  }

  if (!indexName) {
    throw new Error('indexName is required for Atlas vector search');
  }

  if (!Array.isArray(queryVector) || !queryVector.length) {
    return [];
  }

  const resolvedLimit = clamp(limit, 1, 20, 3);

  // If local override is enabled or explicitly requested
  if (process.env.DISABLE_ATLAS_VECTOR_SEARCH === 'true') {
    return runLocalVectorSearchFallback({
      model,
      queryVector,
      filter,
      path,
      limit: resolvedLimit,
      project
    });
  }

  const resolvedNumCandidates = clamp(
    numCandidates,
    resolvedLimit,
    500,
    Math.max(60, resolvedLimit * 20)
  );

  const vectorSearchStage = {
    index: indexName,
    path,
    queryVector,
    numCandidates: resolvedNumCandidates,
    limit: resolvedLimit
  };

  const hasFilter = filter && Object.keys(filter).length > 0;
  if (hasFilter) {
    vectorSearchStage.filter = filter;
  }

  const pipeline = [
    {
      $vectorSearch: vectorSearchStage
    }
  ];

  const hasProjection = project && Object.keys(project).length > 0;
  if (hasProjection) {
    pipeline.push({ $project: project });
  }

  try {
    return await model.aggregate(pipeline);
  } catch (atlasError) {
    // Graceful fallback to in-memory cosine similarity if Atlas search is not configured or unsupported
    console.info(
      `[VectorSearch] Atlas $vectorSearch unavailable (${atlasError.message}). Using local in-memory cosine similarity fallback.`
    );
    return runLocalVectorSearchFallback({
      model,
      queryVector,
      filter,
      path,
      limit: resolvedLimit,
      project
    });
  }
};

module.exports = {
  cosineSimilarity,
  runLocalVectorSearchFallback,
  runAtlasVectorSearch
};
