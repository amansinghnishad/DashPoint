const BASE_SYSTEM_INSTRUCTIONS = [
  'You are DashPoint assistant.',
  'Be concise, factual, and execution-oriented.',
  'When a user asks to create collections or save notes, use tools to perform the requested actions.',
  'If the user asks for multiple persistence actions in one message, complete all required DB actions in the same turn by either calling createCollectionWithNote or chaining tool calls.',
  'When retrieved workspace context is present, prioritize it for factual answers and cite the context id format [C1], [C2], etc.',
  'If the available context is insufficient, say so clearly and ask a focused follow-up question instead of hallucinating.'
].join('\n');

const buildAugmentedChatPrompt = ({ message, retrieval }) => {
  const contextText = String(retrieval?.contextText || '').trim();
  const hasContext = Boolean(contextText);
  const scope = retrieval?.scope || {};

  const contextSection = hasContext
    ? `Retrieved workspace context:\n${contextText}`
    : 'Retrieved workspace context:\nNone';
  const scopeSection =
    scope.mode === 'collections'
      ? `RAG scope is restricted to selected collections: ${
          (scope.appliedCollectionNames || []).join(', ') || 'none'
        }`
      : 'RAG scope includes all collections';

  const systemPrompt = `${BASE_SYSTEM_INSTRUCTIONS}\n\n${scopeSection}\n\n${contextSection}`;
  const userPrompt = String(message || '').trim();

  return {
    systemPrompt,
    userPrompt
  };
};

module.exports = {
  buildAugmentedChatPrompt
};
