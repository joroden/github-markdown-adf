import { describe, it, expect } from 'vitest';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

describe('lists', () => {
  it('bulletList with single item', () => {
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
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Item 1' }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('- Item 1');
  });

  it('bulletList with multiple items', () => {
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
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Alpha' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Beta' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Gamma' }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('- Alpha\n- Beta\n- Gamma');
  });

  it('nested bulletList indents child items by 2 spaces', () => {
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
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Parent' }],
                },
                {
                  type: 'bulletList',
                  content: [
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'Child' }],
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
    expect(adfToMd(doc)).toBe('- Parent\n  - Child');
  });

  it('orderedList starts at 1 by default', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'First' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Second' }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('1. First\n2. Second');
  });

  it('orderedList with attrs.order starts at specified number', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          attrs: { order: 5 },
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Fifth' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Sixth' }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('5. Fifth\n6. Sixth');
  });

  it('taskList TODO renders unchecked checkbox', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'taskList',
          attrs: { localId: 'tl1' },
          content: [
            {
              type: 'taskItem',
              attrs: { localId: 'ti1', state: 'TODO' },
              content: [{ type: 'text', text: 'Buy milk' }],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('- [ ] Buy milk');
  });

  it('taskList DONE renders checked checkbox', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'taskList',
          attrs: { localId: 'tl1' },
          content: [
            {
              type: 'taskItem',
              attrs: { localId: 'ti1', state: 'DONE' },
              content: [{ type: 'text', text: 'Done task' }],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('- [x] Done task');
  });

  it('decisionList renders all items as checked', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'decisionList',
          attrs: { localId: 'dl1' },
          content: [
            {
              type: 'decisionItem',
              attrs: { localId: 'di1', state: 'DECIDED' },
              content: [{ type: 'text', text: 'We ship it' }],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('- [x] We ship it');
  });

  it('mixed nested bullet with ordered list', () => {
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
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Item' }],
                },
                {
                  type: 'orderedList',
                  content: [
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'Sub 1' }],
                        },
                      ],
                    },
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'Sub 2' }],
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
    expect(adfToMd(doc)).toBe('- Item\n  1. Sub 1\n  2. Sub 2');
  });

  it('horizontal rule serializes to ---', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [{ type: 'rule' }],
    };
    expect(adfToMd(doc)).toBe('---');
  });
});
