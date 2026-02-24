const { executeToolCall } = require('./chatToolExecutor');
const { retrieveChatContext, DEFAULT_TOP_K } = require('./chatContextService');
const { buildAugmentedChatPrompt } = require('./chatPromptService');
const { buildChatProviderAttempts } = require('./chatModelRouter');
const { runOpenAiChat } = require('./chatProviders/openaiChatProvider');
const { runGeminiChat } = require('./chatProviders/geminiChatProvider');

const providerRunners = {
  openai: runOpenAiChat,
  gemini: runGeminiChat
};

const COLLECTION_MUTATION_TOOL_NAMES = new Set([
  'createCollection',
  'createCollectionWithNote',
  'addNote'
]);

const buildMutationSummary = (executions = []) => {
  const successfulExecutions = executions.filter((execution) => execution?.ok === true);
  const toolNames = [...new Set(successfulExecutions.map((execution) => execution.name))];

  return {
    toolCalls: successfulExecutions.length,
    tools: toolNames,
    collectionChanged: toolNames.some((name) => COLLECTION_MUTATION_TOOL_NAMES.has(name))
  };
};

const runChat = async ({
  userId,
  message,
  provider = 'auto',
  model = 'auto',
  topK = DEFAULT_TOP_K,
  collectionIds = []
}) => {
  const attempts = buildChatProviderAttempts({
    provider,
    model
  });

  const embeddingProviders = [
    ...new Set(
      attempts
        .map((attempt) => String(attempt?.provider || '').trim().toLowerCase())
        .filter(Boolean)
    )
  ];

  const retrieval = await retrieveChatContext({
    userId,
    query: message,
    topK,
    collectionIds,
    embeddingProviders
  });

  const { systemPrompt, userPrompt } = buildAugmentedChatPrompt({
    message,
    retrieval
  });

  const attemptErrors = [];

  for (const attempt of attempts) {
    const runner = providerRunners[attempt.provider];
    if (!runner) {
      attemptErrors.push(`${attempt.provider}: runner not configured`);
      continue;
    }

    try {
      const toolExecutions = [];
      const result = await runner({
        model: attempt.model,
        systemPrompt,
        userPrompt,
        executeToolCall: async ({ name, args }) => {
          try {
            const value = await executeToolCall({
              name,
              args,
              userId
            });

            toolExecutions.push({
              name,
              ok: true
            });

            return value;
          } catch (error) {
            toolExecutions.push({
              name,
              ok: false,
              error: error.message
            });
            throw error;
          }
        }
      });

      return {
        response: result.text,
        provider: attempt.provider,
        model: attempt.model,
        mutations: buildMutationSummary(toolExecutions),
        retrieval: {
          topK: retrieval.topK,
          hitCount: retrieval.items.length,
          embeddingProvider: retrieval.embeddingProvider,
          scope: retrieval.scope,
          sources: retrieval.items.map((item) => ({
            contextId: item.contextId,
            sourceType: item.sourceType,
            sourceLabel: item.sourceLabel,
            score: item.score
          }))
        }
      };
    } catch (error) {
      attemptErrors.push(`${attempt.provider}/${attempt.model}: ${error.message}`);
    }
  }

  throw new Error(`All chat provider attempts failed: ${attemptErrors.join(' | ')}`);
};

module.exports = {
  runChat
};
