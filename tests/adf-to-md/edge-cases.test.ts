import { describe, it, expect } from 'vitest';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

describe('edge cases', () => {
  it('empty doc returns empty string', () => {
    const doc: AdfDoc = { version: 1, type: 'doc', content: [] };
    expect(adfToMd(doc)).toBe('');
  });

  it('doc with only unknown node types returns empty string', () => {
    const doc = {
      version: 1 as const,
      type: 'doc' as const,
      content: [{ type: 'unknownFutureNode' } as never],
    };
    expect(adfToMd(doc)).toBe('');
  });

  it('multiple block types together are joined by double newlines', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Title' }],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'Body text' }] },
        { type: 'rule' },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Item' }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('# Title\n\nBody text\n\n---\n\n- Item');
  });

  it('layoutSection columns are separated by ---', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'layoutSection',
          content: [
            {
              type: 'layoutColumn',
              attrs: { width: 50 },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Left' }],
                },
              ],
            },
            {
              type: 'layoutColumn',
              attrs: { width: 50 },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Right' }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('Left\n\n---\n\nRight');
  });

  it('textColor mark is silently dropped leaving text unchanged', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'colored',
              marks: [{ type: 'textColor', attrs: { color: '#ff0000' } }],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('colored');
  });

  it('deeply nested list (3 levels) indents correctly', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'L1' }] },
                {
                  type: 'bulletList',
                  content: [
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'L2' }],
                        },
                        {
                          type: 'bulletList',
                          content: [
                            {
                              type: 'listItem',
                              content: [
                                {
                                  type: 'paragraph',
                                  content: [{ type: 'text', text: 'L3' }],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('- L1\n  - L2\n    - L3');
  });

  it('sanitizeMarkdown collapses 3+ blank lines to 2', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'A' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'B' }] },
      ],
    };
    const result = adfToMd(doc);
    expect(result).not.toMatch(/\n{3,}/);
  });

  it('blockquote with multiple paragraphs prefixes all lines', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
          ],
        },
      ],
    };
    const result = adfToMd(doc);
    for (const line of result.split('\n')) {
      expect(line).toMatch(/^>/);
    }
  });
});
