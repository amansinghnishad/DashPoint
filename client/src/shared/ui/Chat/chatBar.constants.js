export const DEFAULT_TOP_K = 3;
export const MAX_MESSAGE_LENGTH = 4000;
export const STREAM_MIN_UPDATES = 8;
export const STREAM_MAX_UPDATES = 24;

export const PROVIDER_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Gemini" },
];

export const MODEL_OPTIONS_BY_PROVIDER = {
  auto: [
    { value: "auto", label: "Auto" },
    { value: "gpt-4.1-mini", label: "gpt-4.1-mini" },
    { value: "gemini-2.5-flash", label: "gemini-2.5-flash" },
  ],
  openai: [
    { value: "auto", label: "Auto" },
    { value: "gpt-4.1-mini", label: "gpt-4.1-mini" },
    { value: "gpt-4.1", label: "gpt-4.1" },
    { value: "gpt-4o-mini", label: "gpt-4o-mini" },
  ],
  gemini: [
    { value: "auto", label: "Auto" },
    { value: "gemini-2.5-flash", label: "gemini-2.5-flash" },
    { value: "gemini-1.5-pro", label: "gemini-1.5-pro" },
  ],
};

const OPENAI_MODEL_PREFIXES = ["gpt", "o1", "o3", "o4"];

export const isOpenAiModel = (modelName) => {
  const normalized = String(modelName || "")
    .trim()
    .toLowerCase();
  if (!normalized || normalized === "auto") return false;

  return OPENAI_MODEL_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};
