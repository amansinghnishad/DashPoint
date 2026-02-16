export const SLASH_COMMANDS = [
  {
    id: "schedule",
    label: "Schedule",
    hint: "Create a calendar block/event",
    example: "/schedule Team sync tomorrow 3pm for 30m",
  },
  {
    id: "meeting",
    label: "Meeting",
    hint: "Schedule a meeting",
    example: "/meeting 1:1 with Alex next Tue 10am for 45m",
  },
  {
    id: "todo",
    label: "To-do",
    hint: "Create a task/todo item",
    example: "/todo Finish dashboard UI by Friday",
  },
  {
    id: "notes",
    label: "Notes",
    hint: "Save a note",
    example: "/notes Remember to send the proposal email",
  },
];

export function parseSlashCommand(rawPrompt, commands = SLASH_COMMANDS) {
  const raw = (rawPrompt || "").trimStart();
  if (!raw.startsWith("/")) return null;

  const firstSpace = raw.indexOf(" ");
  const token = (firstSpace === -1 ? raw : raw.slice(0, firstSpace)).slice(1);
  const cmd = token.toLowerCase();

  if (!cmd) return { cmd: "", args: raw.slice(1) };

  const match = commands.find((c) => c.id === cmd);
  if (!match) {
    return { cmd, args: firstSpace === -1 ? "" : raw.slice(firstSpace + 1) };
  }

  return {
    cmd,
    args: firstSpace === -1 ? "" : raw.slice(firstSpace + 1),
    meta: match,
  };
}

export function getCommandSuggestions(rawPrompt, commands = SLASH_COMMANDS) {
  const raw = (rawPrompt || "").trimStart();
  if (!raw.startsWith("/")) return [];

  // Only show suggestions while typing the command token
  const firstSpace = raw.indexOf(" ");
  if (firstSpace !== -1) return [];

  const query = raw.slice(1).toLowerCase();
  return commands.filter((c) => c.id.startsWith(query));
}

export function buildEffectivePrompt(rawPrompt) {
  const raw = (rawPrompt || "").trim();
  if (!raw) return null;

  if (raw.startsWith("/")) {
    const firstSpace = raw.indexOf(" ");
    const token = (firstSpace === -1 ? raw : raw.slice(0, firstSpace)).slice(1);
    const cmd = token.toLowerCase();
    const args = firstSpace === -1 ? "" : raw.slice(firstSpace + 1).trim();

    if (cmd === "schedule") {
      if (!args) return null;
      return `Schedule this on my calendar: ${args}`;
    }
    if (cmd === "meeting") {
      if (!args) return null;
      return `Schedule a meeting on my calendar: ${args}`;
    }
    if (cmd === "todo") {
      if (!args) return null;
      return `Create a todo/task for me: ${args}`;
    }
    if (cmd === "notes") {
      if (!args) return null;
      return `Save this note for me: ${args}`;
    }

    // Unknown slash command: pass through.
    return raw;
  }

  return raw;
}

export function validatePrompt(value) {
  const trimmed = (value || "").trim();
  if (trimmed.length < 5) return "Type at least 5 characters.";
  if (trimmed.length > 2000) return "Keep it under 2000 characters.";
  return null;
}
