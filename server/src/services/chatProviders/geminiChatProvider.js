const axios = require('axios');

const { geminiFunctionDeclarations } = require('../openaiTools');

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MAX_TOOL_ROUNDS = 6;

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

const createRequestPayload = ({ systemPrompt, contents, enableTools = true }) => {
  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents
  };

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

const requestGemini = async ({ model, payload, apiKey }) => {
  try {
    const response = await axios.post(buildEndpoint(model), payload, {
      params: { key: apiKey },
      timeout: 45000
    });

    return response.data;
  } catch (error) {
    const message = formatGeminiError(error);
    const wrapped = new Error(message);
    wrapped.status = error?.response?.status;
    wrapped.responseData = error?.response?.data;
    wrapped.cause = error;
    throw wrapped;
  }
};

const runGeminiChat = async ({ model, systemPrompt, userPrompt, executeToolCall }) => {
  const apiKey = getApiKey();
  const conversation = [
    {
      role: 'user',
      parts: [{ text: userPrompt }]
    }
  ];
  let toolsEnabled = true;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    let data = null;

    try {
      const payload = createRequestPayload({
        systemPrompt,
        contents: conversation,
        enableTools: toolsEnabled
      });

      data = await requestGemini({
        model,
        payload,
        apiKey
      });
    } catch (error) {
      if (toolsEnabled && round === 0 && isToolSchemaError(error)) {
        toolsEnabled = false;
        continue;
      }

      throw error;
    }

    const candidate = data?.candidates?.[0];
    if (!candidate?.content?.parts) {
      const finishReason = candidate?.finishReason || 'unknown';
      throw new Error(`Gemini returned no content (finishReason: ${finishReason})`);
    }

    const parts = candidate.content.parts;
    const functionCalls = extractFunctionCalls(parts);

    if (!functionCalls.length) {
      const text = extractText(parts) || 'Done.';
      return { text };
    }

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

      conversation.push({
        role: 'model',
        parts: [
          {
            functionCall: {
              name: functionCall.name,
              args: parsedArgs
            }
          }
        ]
      });

      conversation.push({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: functionCall.name,
              response: responsePayload
            }
          }
        ]
      });
    }
  }

  throw new Error('Gemini exceeded maximum tool rounds');
};

module.exports = {
  runGeminiChat
};
