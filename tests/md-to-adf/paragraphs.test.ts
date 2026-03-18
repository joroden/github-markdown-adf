import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type { ParagraphNode } from '../../src/types/index.js';

describe('paragraphs', () => {
  it('converts a plain paragraph', () => {
    const doc = mdToAdf('hello world');
    expect(doc.content[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'hello world' }],
    });
  });

  it('empty string produces empty doc', () => {
    const doc = mdToAdf('');
    expect(doc).toEqual({ version: 1, type: 'doc', content: [] });
  });

  it('whitespace-only string produces empty doc', () => {
    const doc = mdToAdf('   \n   ');
    expect(doc.content).toHaveLength(0);
  });

  it('multiple paragraphs produce multiple nodes', () => {
    const doc = mdToAdf('first\n\nsecond\n\nthird');
    expect(doc.content).toHaveLength(3);
    expect(doc.content[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'first' }],
    });
    expect(doc.content[1]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'second' }],
    });
    expect(doc.content[2]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'third' }],
    });
  });

  it('paragraph content is an array of inline nodes', () => {
    const doc = mdToAdf('some text');
    const para = doc.content[0] as ParagraphNode;
    expect(para.type).toBe('paragraph');
    expect(Array.isArray(para.content)).toBe(true);
  });
});
