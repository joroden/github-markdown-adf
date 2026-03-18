import { describe, it, expect } from 'vitest';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

describe('paragraphs', () => {
  it('serializes a simple paragraph', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] },
      ],
    };
    expect(adfToMd(doc)).toBe('Hello world');
  });

  it('empty paragraph with no content field returns empty string', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }],
    };
    expect(adfToMd(doc)).toBe('');
  });

  it('paragraph with empty content array returns empty string', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }],
    };
    expect(adfToMd(doc)).toBe('');
  });

  it('multiple paragraphs joined by double newline', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Third' }] },
      ],
    };
    expect(adfToMd(doc)).toBe('First\n\nSecond\n\nThird');
  });

  it('empty paragraphs between content paragraphs are dropped', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
        { type: 'paragraph', content: [] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Third' }] },
      ],
    };
    expect(adfToMd(doc)).toBe('First\n\nThird');
  });

  it('escapes asterisks in paragraph text', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'hello *world*' }],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('hello \\*world\\*');
  });

  it('escapes markdown special characters in text', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '1. item - test' }],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('1\\. item - test');
  });

  it('escapes hash in paragraph text', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '# not a heading' }],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('\\# not a heading');
  });
});
