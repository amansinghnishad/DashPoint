const { tools, geminiFunctionDeclarations } = require('../../src/services/openaiTools');

describe('AI Chat Tools Declaration Tests', () => {
  it('should declare valid OpenAI tool schemas with functions and parameters', () => {
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);

    for (const tool of tools) {
      expect(tool.type).toBe('function');
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(tool.parameters).toBeDefined();
      expect(tool.parameters.type).toBe('object');
    }
  });

  it('should declare valid Gemini function declarations matching OpenAI tools', () => {
    expect(Array.isArray(geminiFunctionDeclarations)).toBe(true);
    expect(geminiFunctionDeclarations.length).toBe(tools.length);

    for (const func of geminiFunctionDeclarations) {
      expect(typeof func.name).toBe('string');
      expect(typeof func.description).toBe('string');
      expect(func.parameters).toBeDefined();
    }
  });
});
