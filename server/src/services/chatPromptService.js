const BASE_SYSTEM_INSTRUCTIONS = [
  'You are DashPoint assistant.',
  'Be concise, factual, and execution-oriented.',
  'You can answer normal knowledge questions directly without using tools.',
  'When a user asks to create collections or save notes, use tools to perform the requested actions.',
  'When a user asks to add a YouTube video to a collection, use the addYouTubeVideoToCollection tool.',
  'When a user asks about Google Calendar status, upcoming events, or scheduling, use the calendar tools.',
  'If Google Calendar is not connected, call getGoogleCalendarAuthUrl and provide the URL to the user.',
  'If the user asks for multiple persistence actions in one message, complete all required DB actions in the same turn by either calling createCollectionWithNote or chaining tool calls.',
  'When retrieved workspace context is present, prioritize it for factual answers and cite the context id format [C1], [C2], etc.',
  'For workspace-specific requests about collection videos/transcripts (for example: summarize a video in a collection), use retrieved context when available.',
  'If retrieved workspace context is empty for a workspace-specific request, clearly state that no indexed transcript context was found in the selected collections and ask the user to add/reindex the video transcript.',
  'Do not respond with capability-limit messages like "I cannot" or "tools lack functionality" when the request can be answered directly or by asking for missing workspace context.',
  'Do not claim capability limitations if the request can be answered directly.',
  'If the available context is insufficient, say so clearly and ask a focused follow-up question instead of hallucinating.'
].join('\n');

const buildAugmentedChatPrompt = ({ message, retrieval }) => {
  const contextText = String(retrieval?.contextText || '').trim();
  const hasContext = Boolean(contextText);
  const scope = retrieval?.scope || {};
  const hitCount = Array.isArray(retrieval?.items) ? retrieval.items.length : 0;

  const contextSection = hasContext
    ? `Retrieved workspace context:\n${contextText}`
    : 'Retrieved workspace context:\nNone';
  const scopeSection =
    scope.mode === 'collections'
      ? `RAG scope is restricted to selected collections: ${
          (scope.appliedCollectionNames || []).join(', ') || 'none'
        }`
      : 'RAG scope includes all collections';
  const retrievalSection = `RAG retrieval hit count: ${hitCount}`;

  const systemPrompt = `${BASE_SYSTEM_INSTRUCTIONS}\n\n${scopeSection}\n${retrievalSection}\n\n${contextSection}`;
  const userPrompt = String(message || '').trim();

  return {
    systemPrompt,
    userPrompt
  };
};

module.exports = {
  buildAugmentedChatPrompt
};
