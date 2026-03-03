const functionDefinitions = [
  {
    name: 'createCollection',
    description: 'Create a new collection for the authenticated user',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        description: { type: 'string', maxLength: 500 },
        color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        icon: { type: 'string', maxLength: 50 },
        tags: {
          type: 'array',
          items: { type: 'string', maxLength: 30 },
          maxItems: 20
        },
        isPrivate: { type: 'boolean' }
      },
      required: ['name'],
      additionalProperties: false
    }
  },
  {
    name: 'addNote',
    description: 'Add a note to an existing collection',
    parameters: {
      type: 'object',
      properties: {
        collectionId: { type: 'string', minLength: 1 },
        note: { type: 'string', minLength: 1, maxLength: 2000 },
        title: { type: 'string', maxLength: 120 }
      },
      required: ['collectionId', 'note'],
      additionalProperties: false
    }
  },
  {
    name: 'createCollectionWithNote',
    description: 'Create or reuse a collection and add a note to it in one action',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        note: { type: 'string', minLength: 1, maxLength: 2000 },
        title: { type: 'string', maxLength: 120 },
        description: { type: 'string', maxLength: 500 },
        color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        icon: { type: 'string', maxLength: 50 },
        tags: {
          type: 'array',
          items: { type: 'string', maxLength: 30 },
          maxItems: 20
        },
        isPrivate: { type: 'boolean' }
      },
      required: ['name', 'note'],
      additionalProperties: false
    }
  },
  {
    name: 'addYouTubeVideoToCollection',
    description:
      'Save a YouTube video for the authenticated user and add it to a collection. Provide a direct URL/videoId or a search query.',
    parameters: {
      type: 'object',
      properties: {
        collectionId: { type: 'string', minLength: 1 },
        collectionName: { type: 'string', minLength: 1, maxLength: 100 },
        youtubeUrl: { type: 'string', minLength: 5, maxLength: 400 },
        videoId: { type: 'string', minLength: 6, maxLength: 30 },
        searchQuery: { type: 'string', minLength: 2, maxLength: 200 },
        category: { type: 'string', maxLength: 50 },
        isFavorite: { type: 'boolean' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'getGoogleCalendarStatus',
    description:
      'Check whether Google Calendar is connected for the authenticated user. Optionally include an auth URL if disconnected.',
    parameters: {
      type: 'object',
      properties: {
        includeAuthUrl: { type: 'boolean' },
        redirectPath: { type: 'string', maxLength: 200 }
      },
      additionalProperties: false
    }
  },
  {
    name: 'getGoogleCalendarAuthUrl',
    description:
      'Generate a Google OAuth URL for connecting the authenticated user calendar.',
    parameters: {
      type: 'object',
      properties: {
        redirectPath: { type: 'string', maxLength: 200 }
      },
      additionalProperties: false
    }
  },
  {
    name: 'listGoogleCalendarEvents',
    description:
      'List upcoming Google Calendar events in a time window. If dates are omitted, defaults to now through the next 14 days.',
    parameters: {
      type: 'object',
      properties: {
        timeMin: { type: 'string', maxLength: 64 },
        timeMax: { type: 'string', maxLength: 64 },
        maxResults: { type: 'integer', minimum: 1, maximum: 100 }
      },
      additionalProperties: false
    }
  },
  {
    name: 'createGoogleCalendarEvent',
    description:
      'Create a Google Calendar event. Use either date for all-day events, or startDateTime/endDateTime for timed events.',
    parameters: {
      type: 'object',
      properties: {
        summary: { type: 'string', minLength: 1, maxLength: 200 },
        description: { type: 'string', maxLength: 5000 },
        date: { type: 'string', maxLength: 20 },
        endDate: { type: 'string', maxLength: 20 },
        startDateTime: { type: 'string', maxLength: 64 },
        endDateTime: { type: 'string', maxLength: 64 },
        colorId: { type: 'integer', minimum: 1, maximum: 11 },
        dashpointType: { type: 'string', maxLength: 50 },
        dashpointColor: {
          type: 'string',
          enum: ['info', 'success', 'warning', 'danger']
        }
      },
      required: ['summary'],
      additionalProperties: false
    }
  },
  {
    name: 'scheduleGoogleCalendarBlock',
    description:
      'Find and optionally create focused work/practice event blocks based on free-busy availability in Google Calendar.',
    parameters: {
      type: 'object',
      properties: {
        summary: { type: 'string', maxLength: 200 },
        description: { type: 'string', maxLength: 5000 },
        durationMinutes: { type: 'integer', minimum: 5, maximum: 480 },
        timeMin: { type: 'string', maxLength: 64 },
        timeMax: { type: 'string', maxLength: 64 },
        timezone: { type: 'string', maxLength: 100 },
        conflictStrategy: {
          type: 'string',
          enum: ['auto', 'split', 'shorten', 'next-window']
        },
        minSessionMinutes: { type: 'integer', minimum: 5, maximum: 240 },
        maxSplitParts: { type: 'integer', minimum: 1, maximum: 24 },
        allowLightPractice: { type: 'boolean' },
        searchDays: { type: 'integer', minimum: 0, maximum: 60 },
        createEvents: { type: 'boolean' },
        calendarId: { type: 'string', maxLength: 256 },
        colorId: { type: 'integer', minimum: 1, maximum: 11 },
        dashpointType: { type: 'string', maxLength: 50 },
        dashpointColor: {
          type: 'string',
          enum: ['info', 'success', 'warning', 'danger']
        }
      },
      required: ['durationMinutes', 'timeMin', 'timeMax'],
      additionalProperties: false
    }
  }
];

const tools = functionDefinitions.map((tool) => ({
  type: 'function',
  name: tool.name,
  description: tool.description,
  strict: true,
  parameters: tool.parameters
}));

const GEMINI_TYPE_MAP = {
  object: 'OBJECT',
  array: 'ARRAY',
  string: 'STRING',
  number: 'NUMBER',
  integer: 'INTEGER',
  boolean: 'BOOLEAN',
  null: 'NULL'
};

const toGeminiType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return GEMINI_TYPE_MAP[normalized] || undefined;
};

const toGeminiSchema = (schema) => {
  if (!schema || typeof schema !== 'object') {
    return undefined;
  }

  const out = {};
  const mappedType = toGeminiType(schema.type);
  if (mappedType) {
    out.type = mappedType;
  }

  if (typeof schema.description === 'string' && schema.description.trim()) {
    out.description = schema.description.trim();
  }

  if (Array.isArray(schema.enum) && schema.enum.length) {
    out.enum = [...schema.enum];
  }

  // Keep Gemini function schemas lenient. Strict required-field enforcement here
  // can trigger MALFORMED_FUNCTION_CALL before the tool executor gets a chance
  // to validate and return a recoverable error.

  if (schema.items && typeof schema.items === 'object') {
    const itemSchema = toGeminiSchema(schema.items);
    if (itemSchema) {
      out.items = itemSchema;
    }
  }

  if (schema.properties && typeof schema.properties === 'object') {
    const convertedProperties = Object.entries(schema.properties).reduce(
      (acc, [key, value]) => {
        const converted = toGeminiSchema(value);
        if (converted) {
          acc[key] = converted;
        }
        return acc;
      },
      {}
    );

    if (Object.keys(convertedProperties).length) {
      out.properties = convertedProperties;
      if (!out.type) {
        out.type = 'OBJECT';
      }
    }
  }

  return Object.keys(out).length ? out : undefined;
};

const geminiFunctionDeclarations = functionDefinitions.map((tool) => ({
  name: tool.name,
  description: tool.description,
  parameters: toGeminiSchema(tool.parameters)
}));

module.exports = {
  tools,
  functionDefinitions,
  geminiFunctionDeclarations
};
