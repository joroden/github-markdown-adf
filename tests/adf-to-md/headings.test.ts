import { describe, it, expect } from 'vitest';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

describe('headings', () => {
  it.each([1, 2, 3, 4, 5, 6] as const)('serializes h%i', (level) => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level },
          content: [{ type: 'text', text: 'Hello' }],
        },
      ],
    };
    expect(adfToMd(doc)).toBe(`${'#'.repeat(level)} Hello`);
  });

  it('heading with bold inline text', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            { type: 'text', text: 'Bold', marks: [{ type: 'strong' }] },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('## **Bold**');
  });

  it('heading with link inside', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [
            {
              type: 'text',
              text: 'Click here',
              marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('### [Click here](https://example.com)');
  });

  it('heading with mixed inline content', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [
            { type: 'text', text: 'Intro ' },
            { type: 'text', text: 'bold', marks: [{ type: 'strong' }] },
            { type: 'text', text: ' text' },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('# Intro **bold** text');
  });
});
