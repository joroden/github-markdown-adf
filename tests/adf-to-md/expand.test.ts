import { describe, it, expect } from 'vitest';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

describe('expand', () => {
  it('expand with title and content produces details element', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'expand',
          attrs: { title: 'My Details' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Content here' }],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe(
      '<details>\n<summary>My Details</summary>\n\nContent here\n</details>',
    );
  });

  it('expand with empty title produces empty summary', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'expand',
          attrs: { title: '' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Some content' }],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe(
      '<details>\n<summary></summary>\n\nSome content\n</details>',
    );
  });

  it('expand without title attribute produces empty summary', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'expand',
          attrs: {},
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Content' }] },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe(
      '<details>\n<summary></summary>\n\nContent\n</details>',
    );
  });

  it('nestedExpand behaves the same as expand', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'expand',
          attrs: { title: 'Outer' },
          content: [
            {
              type: 'nestedExpand',
              attrs: { title: 'Inner' },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Nested content' }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe(
      '<details>\n<summary>Outer</summary>\n\n<details>\n<summary>Inner</summary>\n\nNested content\n</details>\n</details>',
    );
  });

  it('expand with multiple paragraphs in content', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'expand',
          attrs: { title: 'Details' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Para one' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Para two' }],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe(
      '<details>\n<summary>Details</summary>\n\nPara one\n\nPara two\n</details>',
    );
  });
});
