const path = require('path');
const axios = require('axios');
const pdfParse = require('pdf-parse');

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DOCUMENT_SUMMARY_MODEL =
  process.env.GEMINI_DOCUMENT_SUMMARY_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const DEFAULT_MAX_SOURCE_CHARS = 45000;
const MIN_SOURCE_CHARS = 40;
const MAX_NOTE_TITLE_LENGTH = 100;

const normalizeGeminiModelName = (model) =>
  String(model || '')
    .trim()
    .replace(/^models\//i, '');

const normalizeMaxSourceChars = () => {
  const value = Number.parseInt(process.env.DOCUMENT_SUMMARY_MAX_SOURCE_CHARS, 10);
  if (!Number.isFinite(value)) {
    return DEFAULT_MAX_SOURCE_CHARS;
  }

  return Math.max(10000, Math.min(value, 120000));
};

const toError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureGeminiApiKey = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw toError('GEMINI_API_KEY is not configured', 500);
  }

  return process.env.GEMINI_API_KEY;
};

const normalizeText = (value) =>
  String(value || '')
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

const extractPdfText = async (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw toError('A valid PDF file buffer is required', 400);
  }

  const parsed = await pdfParse(buffer);
  const normalizedText = normalizeText(parsed?.text);

  if (normalizedText.length < MIN_SOURCE_CHARS) {
    throw toError(
      'Unable to extract enough readable text from this PDF. Try another file.',
      400
    );
  }

  return {
    text: normalizedText,
    pageCount: Number(parsed?.numpages || 0)
  };
};

const buildSummaryPrompt = ({ sourceText, filename, pageCount, wasTruncated }) =>
  [
    'You summarize PDF documents for workspace notes.',
    'Return plain text only. Do not use markdown symbols.',
    'Do not use headings like ## or bold markers like **.',
    'Use simple section labels exactly as:',
    'TL;DR:',
    'Key Points:',
    'Action Items:',
    'Risks / Open Questions:',
    'Write concise, accurate content grounded in the source text.',
    'Rules:',
    '- Key Points should contain 5-10 lines, each starting with "- ".',
    '- Action Items should contain actionable lines starting with "- ". If none exist, write: No explicit action items found.',
    '- Risks / Open Questions should contain 1-5 lines starting with "- ". If none exist, write: No major risks identified.',
    '- Do not invent facts.',
    '',
    `Document: ${filename || 'Untitled PDF'}`,
    pageCount ? `Pages: ${pageCount}` : 'Pages: Unknown',
    wasTruncated ? 'Note: Source text was truncated before summarization.' : '',
    '',
    'Source text:',
    sourceText
  ]
    .filter(Boolean)
    .join('\n');

const extractGeminiText = (responseData) =>
  (responseData?.candidates?.[0]?.content?.parts || [])
    .filter((part) => typeof part?.text === 'string')
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join('\n')
    .trim();

const normalizeSummaryToPlainText = (value) =>
  String(value || '')
    .replace(/\r/g, '')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/`{1,3}/g, '')
    .replace(/^\s*[\*\u2022]\s+/gm, '- ')
    .replace(/^\s*>\s?/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const summarizeWithGemini = async ({ prompt }) => {
  const apiKey = ensureGeminiApiKey();
  const model = normalizeGeminiModelName(DOCUMENT_SUMMARY_MODEL);

  const response = await axios.post(
    `${GEMINI_API_BASE_URL}/models/${model}:generateContent`,
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1300
      }
    },
    {
      params: { key: apiKey },
      timeout: 60000
    }
  );

  const summary = extractGeminiText(response?.data);
  if (!summary) {
    throw toError('Gemini returned an empty summary', 502);
  }

  const plainSummary = normalizeSummaryToPlainText(summary);
  if (!plainSummary) {
    throw toError('Gemini returned an invalid summary payload', 502);
  }

  return {
    summary: plainSummary,
    model
  };
};

const buildSummaryNoteTitle = ({ filename, customTitle }) => {
  const normalizedCustomTitle = normalizeText(customTitle).slice(0, MAX_NOTE_TITLE_LENGTH);
  if (normalizedCustomTitle) {
    return normalizedCustomTitle;
  }

  const baseName = normalizeText(path.parse(String(filename || 'Document')).name)
    .replace(/\.[^.]+$/g, '')
    .slice(0, 70);

  const title = `Summary: ${baseName || 'Document'}`;
  return title.slice(0, MAX_NOTE_TITLE_LENGTH);
};

const summarizePdfBuffer = async ({ buffer, filename }) => {
  const extracted = await extractPdfText(buffer);
  const maxSourceChars = normalizeMaxSourceChars();
  const sourceText = extracted.text.slice(0, maxSourceChars);
  const wasTruncated = extracted.text.length > maxSourceChars;

  const prompt = buildSummaryPrompt({
    sourceText,
    filename,
    pageCount: extracted.pageCount,
    wasTruncated
  });

  const result = await summarizeWithGemini({ prompt });

  return {
    summaryText: result.summary,
    summaryMarkdown: result.summary,
    model: result.model,
    pageCount: extracted.pageCount,
    sourceCharacters: sourceText.length,
    wasTruncated
  };
};

module.exports = {
  summarizePdfBuffer,
  buildSummaryNoteTitle
};
