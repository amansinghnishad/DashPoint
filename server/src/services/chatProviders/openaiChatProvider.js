const OpenAI = require('openai');

const { tools } = require('../openaiTools');

const MAX_TOOL_ROUNDS = 6;

let client = null;

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
};

const parseToolArgs = (argsString) => {
  if (!argsString) return {};

  try {
    return JSON.parse(argsString);
  } catch {
    throw new Error('Invalid tool arguments from OpenAI');
  }
};

const extractFinalText = (response) => {
  if (response?.output_text) {
    return String(response.output_text).trim();
  }

  const chunks = (response?.output || []).flatMap((item) => {
    if (item.type !== 'message' || !Array.isArray(item.content)) return [];

    return item.content
      .filter((part) => part.type === 'output_text' || part.type === 'text')
      .map((part) => String(part.text || ''));
  });

  return chunks.join('\n').trim();
};

const runOpenAiChat = async ({ model, systemPrompt, userPrompt, executeToolCall }) => {
  const openai = getClient();

  let response = await openai.responses.create({
    model,
    input: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    tools,
    tool_choice: 'auto'
  });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const functionCalls = (response.output || []).filter(
      (item) => item.type === 'function_call'
    );

    if (!functionCalls.length) {
      break;
    }

    const toolOutputs = [];

    for (const call of functionCalls) {
      try {
        const args = parseToolArgs(call.arguments);
        const result = await executeToolCall({
          name: call.name,
          args
        });

        toolOutputs.push({
          type: 'function_call_output',
          call_id: call.call_id,
          output: JSON.stringify({ ok: true, result })
        });
      } catch (error) {
        toolOutputs.push({
          type: 'function_call_output',
          call_id: call.call_id,
          output: JSON.stringify({ ok: false, error: error.message })
        });
      }
    }

    response = await openai.responses.create({
      model,
      previous_response_id: response.id,
      input: toolOutputs
    });
  }

  const text = extractFinalText(response) || 'Done.';

  return {
    text
  };
};

module.exports = {
  runOpenAiChat
};
