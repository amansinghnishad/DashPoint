const { buildSummaryNoteTitle } = require('../../src/services/documentSummarizationService');

describe('documentSummarizationService Unit Tests', () => {
  it('should build clean note titles from filenames', () => {
    const title = buildSummaryNoteTitle({ filename: 'Quarterly_Financial_Report_2026.pdf' });
    expect(title).toBe('Summary: Quarterly_Financial_Report_2026');
  });

  it('should fallback to default title when filename is empty', () => {
    const title = buildSummaryNoteTitle({});
    expect(title).toBe('Summary: Document');
  });

  it('should prioritize customTitle when provided', () => {
    const title = buildSummaryNoteTitle({ filename: 'test.pdf', customTitle: 'My Custom Title' });
    expect(title).toBe('My Custom Title');
  });
});
