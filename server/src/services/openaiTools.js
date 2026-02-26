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

  if (Array.isArray(schema.required) && schema.required.length) {
    out.required = [...schema.required];
  }

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
