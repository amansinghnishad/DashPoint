const axios = require('axios');

const { geminiFunctionDeclarations } = require('../openaiTools');

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MAX_TOOL_ROUNDS = 6;
const MAX_TRANSIENT_RETRIES = 2;
const DEFAULT_FALLBACK_MODELS = ['gemini-3.7-flash', 'gemini-3.6-flash'];

const wait = (durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs));

const getFallbackModels = (primaryModel) => {
  const configuredModels = String(process.env.GEMINI_FALLBACK_MODELS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const fallbackModels = configuredModels.length ? configuredModels : DEFAULT_FALLBACK_MODELS;
  const normalizedPrimary = normalizeGeminiModelName(primaryModel).toLowerCase();

  return [...new Set(fallbackModels)].filter(
    (fallbackModel) => normalizeGeminiModelName(fallbackModel).toLowerCase() !== normalizedPrimary
  );
};

const isTransientAvailabilityError = (error) =>
  [429, 500, 502, 503, 504].includes(Number(error?.status || error?.response?.status || 0));

const getApiKey = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  return process.env.GEMINI_API_KEY;
};

const normalizeGeminiModelName = (model) =>
  String(model || '')
    .trim()
    .replace(/^models\//i, '');

const buildEndpoint = (model) =>
  `${GEMINI_API_BASE_URL}/models/${normalizeGeminiModelName(model)}:generateContent`;

const parseToolArgs = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  return {};
};

const extractText = (parts = []) =>
  parts
    .filter((part) => typeof part?.text === 'string')
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join('\n')
    .trim();

const extractFunctionCalls = (parts = []) =>
  parts
    .map((part) => part?.functionCall)
    .filter((call) => call && typeof call.name === 'string' && call.name.trim());

const createRequestPayload = ({ model, systemPrompt, contents, enableTools = true }) => {
  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents
  };

  // Gemini 3.x exposes thinking as an explicit level. Keep chat responsive
  // while still allowing tool calls to complete.
  if (/^gemini-3\./i.test(String(model || '').trim())) {
    payload.generationConfig = {
      thinkingConfig: {
        thinkingLevel: process.env.GEMINI_THINKING_LEVEL || 'low'
      }
    };
  }

  if (enableTools && Array.isArray(geminiFunctionDeclarations) && geminiFunctionDeclarations.length) {
    payload.tools = [
      {
        functionDeclarations: geminiFunctionDeclarations
      }
    ];
    payload.toolConfig = {
      functionCallingConfig: {
        mode: 'AUTO'
      }
    };
  }

  return payload;
};

const formatGeminiError = (error) => {
  const status = error?.response?.status;
  const apiMessage =
    error?.response?.data?.error?.message ||
    error?.response?.data?.error?.status ||
    error?.response?.data?.error ||
    error?.message ||
    'Gemini request failed';

  if (!status) {
    return String(apiMessage);
  }

  return `${status} ${apiMessage}`;
};

const isToolSchemaError = (error) => {
  const status = Number(error?.status || error?.response?.status || 0);
  if (status !== 400) {
    return false;
  }

  const raw = JSON.stringify(error?.responseData || error?.response?.data || {}).toLowerCase();
  return (
    raw.includes('functiondeclarations') ||
    raw.includes('function declarations') ||
    raw.includes('toolconfig') ||
    raw.includes('schema') ||
    raw.includes('parameters')
  );
};

const isRequestTimeout = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT' || message.includes('timeout');
};

const requestGemini = async ({ model, payload, apiKey }) => {
  for (let retry = 0; ; retry += 1) {
    try {
      const response = await axios.post(buildEndpoint(model), payload, {
        params: { key: apiKey },
        timeout: 20000
      });

      return response.data;
    } catch (error) {
      if (retry < MAX_TRANSIENT_RETRIES && isTransientAvailabilityError(error)) {
        await wait(500 * 2 ** retry);
        continue;
      }

      const message = formatGeminiError(error);
      const wrapped = new Error(message);
      wrapped.status = error?.response?.status;
      wrapped.responseData = error?.response?.data;
      wrapped.cause = error;
      throw wrapped;
    }
  }
};

const runGeminiChat = async ({ model, systemPrompt, userPrompt, executeToolCall, onDelta }) => {
  const apiKey = getApiKey();
  const conversation = [
    {
      role: 'user',
      parts: [{ text: userPrompt }]
    }
  ];
  const modelCandidates = [model, ...getFallbackModels(model)];
  let activeModel = modelCandidates[0];
  let hasReceivedToolCall = false;
  let toolsEnabled = true;
  let malformedFunctionFallbackUsed = false;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    let data = null;

    try {
      const payload = createRequestPayload({
        model: activeModel,
        systemPrompt,
        contents: conversation,
        enableTools: toolsEnabled
      });

      data = await requestGemini({
        model: activeModel,
        payload,
        apiKey
      });
    } catch (error) {
      if (isTransientAvailabilityError(error) && !hasReceivedToolCall) {
        const nextModelIndex = modelCandidates.indexOf(activeModel) + 1;
        if (nextModelIndex < modelCandidates.length) {
          activeModel = modelCandidates[nextModelIndex];
          continue;
        }
      }

      if (toolsEnabled && round === 0 && (isToolSchemaError(error) || isRequestTimeout(error))) {
        toolsEnabled = false;
        if (isRequestTimeout(error)) {
          conversation.push({
            role: 'user',
            parts: [
              {
                text: 'Respond directly without calling tools. Keep the answer concise.'
              }
            ]
          });
        }
        continue;
      }

      throw error;
    }

    const candidate = data?.candidates?.[0];
    const finishReason = String(candidate?.finishReason || '').trim().toUpperCase();

    if (finishReason === 'MALFORMED_FUNCTION_CALL' && toolsEnabled) {
      toolsEnabled = false;

      if (!malformedFunctionFallbackUsed) {
        malformedFunctionFallbackUsed = true;
        conversation.push({
          role: 'user',
          parts: [
            {
              text:
                'Previous function call was malformed. Continue without tools and respond directly.'
            }
          ]
        });
      }

      continue;
    }

    if (!candidate?.content?.parts) {
      throw new Error(`Gemini returned no content (finishReason: ${finishReason || 'unknown'})`);
    }

    const parts = candidate.content.parts;
    const functionCalls = extractFunctionCalls(parts);

    if (!functionCalls.length) {
      const text = extractText(parts) || 'Done.';
      if (typeof onDelta === 'function') {
        // Stream token chunks for smooth real-time SSE display
        const words = text.split(/(\s+)/);
        for (const word of words) {
          onDelta(word);
        }
      }
      return { text, model: activeModel };
    }

    hasReceivedToolCall = true;

    // Gemini 3 function-call parts may contain an opaque thought_signature.
    // Keep the model turn exactly as returned by Gemini; rebuilding the
    // functionCall object drops that signature and the next request fails.
    conversation.push(candidate.content);

    const functionResponseParts = [];

    for (const functionCall of functionCalls) {
      const parsedArgs = parseToolArgs(functionCall.args);
      let responsePayload;

      try {
        const result = await executeToolCall({
          name: functionCall.name,
          args: parsedArgs
        });

        responsePayload = {
          ok: true,
          result
        };
      } catch (error) {
        responsePayload = {
          ok: false,
          error: error.message
        };
      }

      functionResponseParts.push({
        functionResponse: {
          name: functionCall.name,
          response: responsePayload
        }
      });
    }

    conversation.push({
      role: 'user',
      parts: functionResponseParts
    });
  }

  throw new Error('Gemini exceeded maximum tool rounds');
};

module.exports = {
  runGeminiChat
};
