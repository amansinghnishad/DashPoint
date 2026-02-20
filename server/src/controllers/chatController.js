const OpenAI = require('openai');
const { validationResult } = require('express-validator');

const { tools } = require('../services/openaiTools');
const { executeToolCall } = require('../services/chatToolExecutor');

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const parseToolArgs = (argsString) => {
  if (!argsString) return {};
  try {
    return JSON.parse(argsString);
  } catch {
    throw new Error('Invalid tool arguments from model');
  }
};

const extractFinalText = (response) => {
  if (response.output_text) return response.output_text;

  const chunks = (response.output || []).flatMap((item) => {
    if (item.type !== 'message' || !Array.isArray(item.content)) return [];
    return item.content
      .filter((part) => part.type === 'output_text' || part.type === 'text')
      .map((part) => part.text || '');
  });

  return chunks.join('\n').trim();
};

exports.chat = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { message } = req.body;
    const client = getClient();

    let response = await client.responses.create({
      model: MODEL,
      input: [
        {
          role: 'system',
          content: 'You are DashPoint assistant. Use tools when the user asks to create collections or save notes. If the user asks for multiple actions in one command, complete all required DB actions in the same turn by either calling createCollectionWithNote or chaining multiple tool calls. Keep responses concise and factual.'
        },
        {
          role: 'user',
          content: String(message)
        }
      ],
      tools,
      tool_choice: 'auto'
    });

    while (true) {
      const functionCalls = (response.output || []).filter(
        (item) => item.type === 'function_call'
      );

      if (!functionCalls.length) break;

      const toolOutputs = [];

      for (const call of functionCalls) {
        try {
          const args = parseToolArgs(call.arguments);
          const result = await executeToolCall({
            name: call.name,
            args,
            userId
          });

          toolOutputs.push({
            type: 'function_call_output',
            call_id: call.call_id,
            output: JSON.stringify({ ok: true, result })
          });
        } catch (toolError) {
          toolOutputs.push({
            type: 'function_call_output',
            call_id: call.call_id,
            output: JSON.stringify({ ok: false, error: toolError.message })
          });
        }
      }

      response = await client.responses.create({
        model: MODEL,
        previous_response_id: response.id,
        input: toolOutputs
      });
    }

    const text = extractFinalText(response) || 'Done.';

    return res.status(200).json({
      success: true,
      data: {
        response: text
      }
    });
  } catch (error) {
    return next(error);
  }
};
