const clamp = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.floor(parsed)));
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

  return model.aggregate(pipeline);
};

module.exports = {
  runAtlasVectorSearch
};
