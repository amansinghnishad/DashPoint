// server/src/services/openaiTools.js
const tools = [
  {
    type: "function",
    name: "createCollection",
    description: "Create a new collection for the authenticated user",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        description: { type: "string", maxLength: 500 },
        color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
        icon: { type: "string", maxLength: 50 },
        tags: {
          type: "array",
          items: { type: "string", maxLength: 30 },
          maxItems: 20
        },
        isPrivate: { type: "boolean" }
      },
      required: ["name"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "addNote",
    description: "Add a note to an existing collection",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        collectionId: { type: "string", minLength: 1 },
        note: { type: "string", minLength: 1, maxLength: 2000 },
        title: { type: "string", maxLength: 120 }
      },
      required: ["collectionId", "note"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "createCollectionWithNote",
    description: "Create or reuse a collection and add a note to it in one action",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        note: { type: "string", minLength: 1, maxLength: 2000 },
        title: { type: "string", maxLength: 120 },
        description: { type: "string", maxLength: 500 },
        color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
        icon: { type: "string", maxLength: 50 },
        tags: {
          type: "array",
          items: { type: "string", maxLength: 30 },
          maxItems: 20
        },
        isPrivate: { type: "boolean" }
      },
      required: ["name", "note"],
      additionalProperties: false
    }
  }
];

module.exports = { tools };