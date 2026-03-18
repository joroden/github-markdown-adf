import { describe, it, expect } from 'vitest';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

describe('special inline nodes', () => {
  it('mention with text attribute uses text value', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'mention', attrs: { id: 'user123', text: '@John' } },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('@John');
  });

  it('mention without text attribute falls back to @id', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'mention', attrs: { id: 'user456' } }],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('@user456');
  });

  it('emoji with text attribute uses text char', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'emoji', attrs: { shortName: 'smile', text: '😀' } },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('😀');
  });

  it('emoji without text attribute uses :shortName:', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'emoji', attrs: { shortName: 'smile' } }],
        },
      ],
    };
    expect(adfToMd(doc)).toBe(':smile:');
  });

  it('status renders as backtick-wrapped [text]', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'status', attrs: { text: 'Ready', color: 'green' } },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('`[Ready]`');
  });

  it('date renders timestamp string as-is', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'date', attrs: { timestamp: '1716940800000' } }],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('1716940800000');
  });

  it('inlineCard renders as angle-bracket autolink', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'inlineCard', attrs: { url: 'https://example.com' } },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('<https://example.com>');
  });

  it('blockCard renders as markdown link with url as both text and href', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [{ type: 'blockCard', attrs: { url: 'https://example.com' } }],
    };
    expect(adfToMd(doc)).toBe('[https://example.com](https://example.com)');
  });

  it('embedCard renders as markdown link with url as both text and href', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'embedCard',
          attrs: { url: 'https://example.com', layout: 'center' },
        },
      ],
    };
    expect(adfToMd(doc)).toBe('[https://example.com](https://example.com)');
  });

  it('mediaSingle with file type renders as media placeholder', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'mediaSingle',
          attrs: { layout: 'center' },
          content: [
            {
              type: 'media',
              attrs: { id: 'abc123', type: 'file', collection: 'my-col' },
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('[media: abc123]');
  });

  it('mediaSingle with image type renders as media placeholder', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'mediaSingle',
          attrs: { layout: 'center' },
          content: [
            {
              type: 'media',
              attrs: { id: 'img1', type: 'image', collection: 'col' },
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('[media: img1]');
  });

  it('hardBreak inside paragraph creates hard line break', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Line 1' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Line 2' },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('Line 1\\\nLine 2');
  });
});
