const {
  extractActionItemsFromText,
  mapSuggestionsToTodoItems
} = require('../../src/services/actionItemExtractionService');

describe('Action Item Extraction Unit Tests', () => {
  it('should extract bulleted action items and tasks from text', async () => {
    const rawText = `
      - deploy database migrations
      - fix navbar responsive dropdown
      - review pull request with team
    `;

    const result = await extractActionItemsFromText({ rawText, maxItems: 5 });
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions.length).toBeGreaterThanOrEqual(2);
  });

  it('should map extracted suggestions to standard planner todo items', () => {
    const suggestions = [
      { text: 'Deploy backend server to production' },
      { text: 'Update dependencies in package.json' }
    ];

    const todoItems = mapSuggestionsToTodoItems(suggestions);
    expect(todoItems).toHaveLength(2);
    expect(todoItems[0].text).toBe('Deploy backend server to production');
    expect(todoItems[0].done).toBe(false);
  });
});
