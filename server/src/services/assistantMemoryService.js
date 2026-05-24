const User = require("../models/User");

const ARRAY_LIMIT = 20;
const FIELD_LIMITS = Object.freeze({
  topic: 80,
  goal: 160,
  priority: 120,
  preference: 160,
  note: 500,
  short: 120,
  time: 20,
  timezone: 100,
});

const CLEARABLE_FIELDS = new Set([
  "workingHours",
  "preferredMeetingLengthMinutes",
  "favoriteTopics",
  "recurringGoals",
  "writingStyle",
  "taskPriorities",
  "additionalPreferences",
]);

const normalizeText = (value, maxLength = FIELD_LIMITS.short) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const normalizeStringArray = (values, maxLength) => {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();
  const output = [];

  for (const value of values) {
    const normalized = normalizeText(value, maxLength);
    if (!normalized) continue;

    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    output.push(normalized);

    if (output.length >= ARRAY_LIMIT) {
      break;
    }
  }

  return output;
};

const mergeStringArray = (current = [], incoming = [], maxLength) =>
  normalizeStringArray(
    [...(Array.isArray(current) ? current : []), ...incoming],
    maxLength,
  );

const normalizeMeetingLength = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(5, Math.min(480, parsed));
};

const normalizeDetailLevel = (value) => {
  const normalized = normalizeText(value, 20).toLowerCase();
  return ["brief", "balanced", "detailed"].includes(normalized)
    ? normalized
    : "";
};

const normalizeWorkingHours = (value = {}) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    timezone: normalizeText(value.timezone, FIELD_LIMITS.timezone),
    days: normalizeStringArray(value.days, 20),
    startTime: normalizeText(value.startTime, FIELD_LIMITS.time),
    endTime: normalizeText(value.endTime, FIELD_LIMITS.time),
    notes: normalizeText(value.notes, FIELD_LIMITS.note),
  };
};

const normalizeWritingStyle = (value = {}) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    tone: normalizeText(value.tone, 80),
    detailLevel: normalizeDetailLevel(value.detailLevel),
    format: normalizeText(value.format, FIELD_LIMITS.short),
    notes: normalizeText(value.notes, FIELD_LIMITS.note),
  };
};

const getDefaultMemory = () => ({
  workingHours: {
    timezone: "",
    days: [],
    startTime: "",
    endTime: "",
    notes: "",
  },
  preferredMeetingLengthMinutes: null,
  favoriteTopics: [],
  recurringGoals: [],
  writingStyle: {
    tone: "",
    detailLevel: "",
    format: "",
    notes: "",
  },
  taskPriorities: [],
  additionalPreferences: [],
  updatedAt: null,
});

const toPlainMemory = (memory = {}) => {
  const base = getDefaultMemory();
  const workingHours = memory?.workingHours || {};
  const writingStyle = memory?.writingStyle || {};

  return {
    workingHours: {
      timezone: normalizeText(workingHours.timezone, FIELD_LIMITS.timezone),
      days: normalizeStringArray(workingHours.days, 20),
      startTime: normalizeText(workingHours.startTime, FIELD_LIMITS.time),
      endTime: normalizeText(workingHours.endTime, FIELD_LIMITS.time),
      notes: normalizeText(workingHours.notes, FIELD_LIMITS.note),
    },
    preferredMeetingLengthMinutes:
      memory?.preferredMeetingLengthMinutes === null ||
      memory?.preferredMeetingLengthMinutes === undefined
        ? null
        : normalizeMeetingLength(memory.preferredMeetingLengthMinutes),
    favoriteTopics: normalizeStringArray(
      memory.favoriteTopics,
      FIELD_LIMITS.topic,
    ),
    recurringGoals: normalizeStringArray(
      memory.recurringGoals,
      FIELD_LIMITS.goal,
    ),
    writingStyle: {
      tone: normalizeText(writingStyle.tone, 80),
      detailLevel: normalizeDetailLevel(writingStyle.detailLevel),
      format: normalizeText(writingStyle.format, FIELD_LIMITS.short),
      notes: normalizeText(writingStyle.notes, FIELD_LIMITS.note),
    },
    taskPriorities: normalizeStringArray(
      memory.taskPriorities,
      FIELD_LIMITS.priority,
    ),
    additionalPreferences: normalizeStringArray(
      memory.additionalPreferences,
      FIELD_LIMITS.preference,
    ),
    updatedAt: memory?.updatedAt || base.updatedAt,
  };
};

const hasMemoryContent = (memory = {}) =>
  Boolean(
    memory.workingHours?.timezone ||
    memory.workingHours?.days?.length ||
    memory.workingHours?.startTime ||
    memory.workingHours?.endTime ||
    memory.workingHours?.notes ||
    memory.preferredMeetingLengthMinutes ||
    memory.favoriteTopics?.length ||
    memory.recurringGoals?.length ||
    memory.writingStyle?.tone ||
    memory.writingStyle?.detailLevel ||
    memory.writingStyle?.format ||
    memory.writingStyle?.notes ||
    memory.taskPriorities?.length ||
    memory.additionalPreferences?.length,
  );

const getAssistantMemoryForUser = async (userId) => {
  const user = await User.findById(userId).select(
    "preferences timezone firstName lastName",
  );
  if (!user) {
    throw new Error("User not found");
  }

  return {
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: user.preferences?.timezone || "UTC",
    },
    memory: toPlainMemory(user.preferences?.assistantMemory),
  };
};

const updateAssistantMemoryForUser = async (userId, args = {}) => {
  const user = await User.findById(userId).select("preferences");
  if (!user) {
    throw new Error("User not found");
  }

  const mergeMode =
    normalizeText(args?.mergeMode, 20).toLowerCase() === "replace"
      ? "replace"
      : "merge";
  const current = toPlainMemory(user.preferences?.assistantMemory);
  const next = toPlainMemory(current);

  const clearFields = normalizeStringArray(args?.clearFields, 60).filter(
    (field) => CLEARABLE_FIELDS.has(field),
  );

  for (const field of clearFields) {
    if (field === "workingHours") {
      next.workingHours = getDefaultMemory().workingHours;
    } else if (field === "writingStyle") {
      next.writingStyle = getDefaultMemory().writingStyle;
    } else if (field === "preferredMeetingLengthMinutes") {
      next.preferredMeetingLengthMinutes = null;
    } else {
      next[field] = [];
    }
  }

  const workingHours = normalizeWorkingHours(args?.workingHours);
  if (workingHours) {
    next.workingHours =
      mergeMode === "replace"
        ? workingHours
        : {
            ...next.workingHours,
            ...Object.fromEntries(
              Object.entries(workingHours).filter(([, value]) =>
                Array.isArray(value) ? value.length : Boolean(value),
              ),
            ),
          };
  }

  if (args?.preferredMeetingLengthMinutes !== undefined) {
    next.preferredMeetingLengthMinutes = normalizeMeetingLength(
      args.preferredMeetingLengthMinutes,
    );
  }

  const writingStyle = normalizeWritingStyle(args?.writingStyle);
  if (writingStyle) {
    next.writingStyle =
      mergeMode === "replace"
        ? writingStyle
        : {
            ...next.writingStyle,
            ...Object.fromEntries(
              Object.entries(writingStyle).filter(([, value]) =>
                Boolean(value),
              ),
            ),
          };
  }

  const arrayFields = [
    ["favoriteTopics", FIELD_LIMITS.topic],
    ["recurringGoals", FIELD_LIMITS.goal],
    ["taskPriorities", FIELD_LIMITS.priority],
    ["additionalPreferences", FIELD_LIMITS.preference],
  ];

  for (const [field, maxLength] of arrayFields) {
    if (args?.[field] === undefined) continue;

    const incoming = normalizeStringArray(args[field], maxLength);
    next[field] =
      mergeMode === "replace"
        ? incoming
        : mergeStringArray(next[field], incoming, maxLength);
  }

  next.updatedAt = new Date();
  user.preferences = {
    ...(user.preferences?.toObject
      ? user.preferences.toObject()
      : user.preferences),
    assistantMemory: next,
  };

  await user.save();

  return {
    message: "Assistant memory updated",
    memory: toPlainMemory(user.preferences.assistantMemory),
  };
};

const formatAssistantMemoryForPrompt = async (userId) => {
  const { user, memory } = await getAssistantMemoryForUser(userId);

  if (!hasMemoryContent(memory)) {
    return [
      `User profile: ${[user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown"}`,
      `User timezone preference: ${user.timezone || "UTC"}`,
      "Assistant memory: None stored yet.",
    ].join("\n");
  }

  const lines = [
    `User profile: ${[user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown"}`,
    `User timezone preference: ${user.timezone || "UTC"}`,
    "Assistant memory:",
  ];

  const working = memory.workingHours;
  if (
    working.timezone ||
    working.days.length ||
    working.startTime ||
    working.endTime ||
    working.notes
  ) {
    lines.push(
      `- Working hours: ${[
        working.days.length ? working.days.join(", ") : "",
        working.startTime && working.endTime
          ? `${working.startTime}-${working.endTime}`
          : "",
        working.timezone ? `timezone ${working.timezone}` : "",
        working.notes,
      ]
        .filter(Boolean)
        .join("; ")}`,
    );
  }

  if (memory.preferredMeetingLengthMinutes) {
    lines.push(
      `- Preferred meeting length: ${memory.preferredMeetingLengthMinutes} minutes`,
    );
  }

  if (memory.favoriteTopics.length) {
    lines.push(`- Favorite topics: ${memory.favoriteTopics.join(", ")}`);
  }

  if (memory.recurringGoals.length) {
    lines.push(`- Recurring goals: ${memory.recurringGoals.join("; ")}`);
  }

  const style = memory.writingStyle;
  if (style.tone || style.detailLevel || style.format || style.notes) {
    lines.push(
      `- Writing style: ${[
        style.tone,
        style.detailLevel,
        style.format,
        style.notes,
      ]
        .filter(Boolean)
        .join("; ")}`,
    );
  }

  if (memory.taskPriorities.length) {
    lines.push(`- Task priorities: ${memory.taskPriorities.join("; ")}`);
  }

  if (memory.additionalPreferences.length) {
    lines.push(
      `- Additional preferences: ${memory.additionalPreferences.join("; ")}`,
    );
  }

  return lines.join("\n");
};

module.exports = {
  getAssistantMemoryForUser,
  updateAssistantMemoryForUser,
  formatAssistantMemoryForPrompt,
};
